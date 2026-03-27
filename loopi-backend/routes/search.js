const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const Project = require("../models/Project");
const ProjectMember = require("../models/ProjectMember");
const auth = require("../middleware/auth");

router.get("/", auth, async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q || q.length < 2) return res.json({ tasks: [], projects: [] });

    const regex = new RegExp(q, "i");

    const memberProjectIds = await ProjectMember.find({ userId: req.userId }).distinct("projectId");
    const ownedProjectIds  = await Project.find({ userId: req.userId }).distinct("_id");
    const allProjectIds    = [...new Set([
      ...memberProjectIds.map(String),
      ...ownedProjectIds.map(String),
    ])];

    const [tasks, projects] = await Promise.all([
      Task.find({ projectId: { $in: allProjectIds }, title: regex })
        .populate("assigneeId", "name")
        .limit(20),
      Project.find({ _id: { $in: allProjectIds }, name: regex })
        .limit(10),
    ]);

    res.json({ tasks, projects });
  } catch (err) {
    res.status(500).json({ error: "Search failed" });
  }
});

module.exports = router;
