const express = require("express");
const router = express.Router();
const ActivityLog = require("../models/ActivityLog");
const auth = require("../middleware/auth");

// GET activity log for a task
router.get("/task/:taskId", auth, async (req, res) => {
  try {
    const logs = await ActivityLog.find({ taskId: req.params.taskId })
      .populate("userId", "name")
      .sort({ createdAt: 1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch activity log" });
  }
});

module.exports = router;
