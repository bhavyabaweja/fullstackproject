const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true
  },
  title: { type: String, required: true },
  status: {
    type: String,
    enum: ["Pending", "In Progress", "Completed"],
    default: "Pending"
  },
  priority: {
    type: String,
    enum: ["Low", "Medium", "High"],
    default: "Medium"
  },
  dueDate: { type: Date },
  description: { type: String, default: "" },
  assigneeId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  labels: [
    {
      name:  { type: String, trim: true },
      color: { type: String },
    }
  ],
  subtasks: [
    {
      text: { type: String, required: true },
      done: { type: Boolean, default: false },
    }
  ],
  timeEntries: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      hours:  { type: Number, required: true },
      note:   { type: String, default: "" },
      date:   { type: Date, default: Date.now },
    }
  ],
  blockedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],
}, { timestamps: true });

module.exports = mongoose.model("Task", TaskSchema);
