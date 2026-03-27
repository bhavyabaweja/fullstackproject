const mongoose = require("mongoose");

const ActivityLogSchema = new mongoose.Schema({
  taskId:    { type: mongoose.Schema.Types.ObjectId, ref: "Task",    required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: "User",    required: true },
  action:    { type: String, required: true },
  // action values: "task_created" | "task_deleted" | "status_changed" |
  //                "priority_changed" | "assigned" | "unassigned" | "commented"
  meta:      { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

ActivityLogSchema.index({ taskId: 1, createdAt: -1 });

module.exports = mongoose.model("ActivityLog", ActivityLogSchema);
