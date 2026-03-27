const express = require("express");
const router = express.Router();
const Comment = require("../models/Comment");
const Task = require("../models/Task");
const ActivityLog = require("../models/ActivityLog");
const auth = require("../middleware/auth");

// GET comments for a task
router.get("/:taskId", auth, async (req, res) => {
  try {
    const comments = await Comment.find({ taskId: req.params.taskId })
      .populate("userId", "name")
      .sort({ createdAt: 1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

// ADD comment
router.post("/", auth, async (req, res) => {
  try {
    const { taskId, projectId, text } = req.body;
    const comment = await Comment.create({ taskId, userId: req.userId, text });
    const populated = await comment.populate("userId", "name");

    const io = req.app.get("io");
    io.to(`project:${projectId}`).emit("comment:added", { taskId, comment: populated });

    // Fetch task once for activity log + notification
    const task = await Task.findById(taskId).select("projectId assigneeId title");
    if (task) {
      await ActivityLog.create({
        taskId,
        projectId: task.projectId,
        userId: req.userId,
        action: "commented",
        meta: { preview: text.slice(0, 80) },
      });

    }

    res.json(populated);
  } catch (err) {
    res.status(500).json({ error: "Failed to add comment" });
  }
});

module.exports = router;
