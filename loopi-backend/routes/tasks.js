const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const Project = require("../models/Project");
const ProjectMember = require("../models/ProjectMember");
const ActivityLog = require("../models/ActivityLog");
const auth = require("../middleware/auth");

// GET all tasks across all user's projects (dashboard + calendar)
router.get("/all", auth, async (req, res) => {
  try {
    const memberProjectIds = await ProjectMember.find({ userId: req.userId }).distinct("projectId");
    const ownedProjectIds = await Project.find({ userId: req.userId }).distinct("_id");
    const allIds = [...new Set([...memberProjectIds.map(String), ...ownedProjectIds.map(String)])];
    const tasks = await Task.find({ projectId: { $in: allIds } })
      .populate("assigneeId", "name")
      .populate("blockedBy", "title status");
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// GET tasks by project
router.get("/:projectId", auth, async (req, res) => {
  try {
    const tasks = await Task.find({ projectId: req.params.projectId })
      .populate("assigneeId", "name")
      .populate("blockedBy", "title status");
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// ADD task
router.post("/", auth, async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();
    const populated = await task.populate("assigneeId", "name");

    await ActivityLog.create({
      taskId: task._id,
      projectId: task.projectId,
      userId: req.userId,
      action: "task_created",
      meta: {},
    });

    const io = req.app.get("io");
    io.to(`project:${task.projectId}`).emit("task:created", populated);
    res.json(populated);
  } catch (err) {
    res.status(500).json({ error: "Failed to create task" });
  }
});

// UPDATE task
router.put("/:id", auth, async (req, res) => {
  try {
    const before = await Task.findById(req.params.id).populate("assigneeId", "name");
    const updated = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate("assigneeId", "name")
      .populate("blockedBy", "title status");

    // Detect field changes and log them
    if (before.status !== updated.status) {
      await ActivityLog.create({
        taskId: updated._id, projectId: updated.projectId, userId: req.userId,
        action: "status_changed", meta: { from: before.status, to: updated.status },
      });
    }
    if (before.priority !== updated.priority) {
      await ActivityLog.create({
        taskId: updated._id, projectId: updated.projectId, userId: req.userId,
        action: "priority_changed", meta: { from: before.priority, to: updated.priority },
      });
    }

    const beforeAssignee = before.assigneeId?._id?.toString() || null;
    const afterAssignee = updated.assigneeId?._id?.toString() || null;
    if (beforeAssignee !== afterAssignee) {
      if (afterAssignee && !beforeAssignee) {
        await ActivityLog.create({
          taskId: updated._id, projectId: updated.projectId, userId: req.userId,
          action: "assigned", meta: { assigneeName: updated.assigneeId?.name || "" },
        });
      } else if (!afterAssignee && beforeAssignee) {
        await ActivityLog.create({
          taskId: updated._id, projectId: updated.projectId, userId: req.userId,
          action: "unassigned", meta: { previousAssigneeName: before.assigneeId?.name || "" },
        });
      } else {
        await ActivityLog.create({
          taskId: updated._id, projectId: updated.projectId, userId: req.userId,
          action: "assigned", meta: { assigneeName: updated.assigneeId?.name || "" },
        });
      }

      // Email notification on new assignment (fire-and-forget)
      if (afterAssignee && afterAssignee !== req.userId) {
        try {
          const { sendAssignmentEmail } = require("../mailer");
          const User = require("../models/User");
          const assignee = await User.findById(afterAssignee);
          const project = await Project.findById(updated.projectId);
          const actor = await User.findById(req.userId);
          if (assignee?.email) {
            sendAssignmentEmail(
              assignee.email,
              updated.title,
              actor?.name || "Someone",
              project?.name || "a project"
            ).catch(() => { });
          }
        } catch (_) { }
      }
    }

    const io = req.app.get("io");
    io.to(`project:${updated.projectId}`).emit("task:updated", updated);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update task" });
  }
});

// DELETE task
router.delete("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (task) {
      await ActivityLog.create({
        taskId: task._id, projectId: task.projectId, userId: req.userId,
        action: "task_deleted", meta: { title: task.title },
      });
      await ActivityLog.deleteMany({ taskId: task._id });
      await Task.findByIdAndDelete(req.params.id);
      const io = req.app.get("io");
      io.to(`project:${task.projectId}`).emit("task:deleted", { _id: req.params.id });
    }
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete task" });
  }
});

// PATCH subtasks
router.patch("/:id/subtasks", auth, async (req, res) => {
  try {
    const { subtasks } = req.body;
    const updated = await Task.findByIdAndUpdate(
      req.params.id,
      { subtasks },
      { new: true }
    ).populate("assigneeId", "name").populate("blockedBy", "title status");
    const io = req.app.get("io");
    io.to(`project:${updated.projectId}`).emit("task:updated", updated);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update subtasks" });
  }
});

// POST time entry
router.post("/:id/time", auth, async (req, res) => {
  try {
    const { hours, note } = req.body;
    const entry = { userId: req.userId, hours: parseFloat(hours), note: note || "", date: new Date() };
    const updated = await Task.findByIdAndUpdate(
      req.params.id,
      { $push: { timeEntries: entry } },
      { new: true }
    ).populate("timeEntries.userId", "name");
    res.json(updated.timeEntries);
  } catch (err) {
    res.status(500).json({ error: "Failed to log time" });
  }
});

// GET time entries
router.get("/:id/time", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate("timeEntries.userId", "name");
    if (!task) return res.status(404).json({ error: "Task not found" });
    const total = task.timeEntries.reduce((sum, e) => sum + e.hours, 0);
    res.json({ entries: task.timeEntries, total });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch time entries" });
  }
});

module.exports = router;
