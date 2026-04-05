const express = require("express");
const router = express.Router();
const Project = require("../models/Project");
const Task = require("../models/Task");
const ProjectMember = require("../models/ProjectMember");
const User = require("../models/User");
const ActivityLog = require("../models/ActivityLog");
const auth = require("../middleware/auth");

// GET all projects (owned or member)
router.get("/", auth, async (req, res) => {
  try {
    const memberProjectIds = await ProjectMember.find({ userId: req.userId }).distinct("projectId");
    const projects = await Project.find({
      $or: [{ userId: req.userId }, { _id: { $in: memberProjectIds } }]
    });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

// ADD project
router.post("/", auth, async (req, res) => {
  try {
    const newProject = new Project({ ...req.body, userId: req.userId });
    await newProject.save();
    // Auto-add creator as Owner
    await ProjectMember.create({ projectId: newProject._id, userId: req.userId, role: "Owner" });
    res.json(newProject);
  } catch (err) {
    res.status(500).json({ error: "Failed to create project" });
  }
});

// UPDATE project
router.put("/:id", auth, async (req, res) => {
  const updated = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

// DELETE project (also delete tasks, members, activity logs)
router.delete("/:id", auth, async (req, res) => {
  await Task.deleteMany({ projectId: req.params.id });
  await ProjectMember.deleteMany({ projectId: req.params.id });
  await ActivityLog.deleteMany({ projectId: req.params.id });
  await Project.findByIdAndDelete(req.params.id);
  res.json({ message: "Project deleted" });
});

// GET members of a project
router.get("/:id/members", auth, async (req, res) => {
  try {
    const members = await ProjectMember.find({ projectId: req.params.id })
      .populate("userId", "name email");
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch members" });
  }
});

// INVITE member by email
router.post("/:id/invite", auth, async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "No user found with that email" });

    const existing = await ProjectMember.findOne({ projectId: req.params.id, userId: user._id });
    if (existing) return res.status(409).json({ error: "User is already a member" });

    const member = await ProjectMember.create({
      projectId: req.params.id,
      userId: user._id,
      role: "Member",
    });
    const populated = await member.populate("userId", "name email");

res.json(populated);
  } catch (err) {
    res.status(500).json({ error: "Failed to invite member" });
  }
});

// REMOVE member
router.delete("/:id/members/:userId", auth, async (req, res) => {
  try {
    await ProjectMember.deleteOne({ projectId: req.params.id, userId: req.params.userId });
    res.json({ message: "Member removed" });
  } catch (err) {
    res.status(500).json({ error: "Failed to remove member" });
  }
});

module.exports = router;
