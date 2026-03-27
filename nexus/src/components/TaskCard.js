import React from "react";
import { Draggable } from "@hello-pangea/dnd";

const PRIORITY_BADGE = {
  High: "badge bg-danger",
  Medium: "badge bg-warning text-dark",
  Low: "badge bg-success",
};

const AVATAR_COLORS = ["#0052cc", "#6554c0", "#00875a", "#de350b", "#ff8b00"];
function avatarColor(name) {
  const code = (name || "").split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
}
function initials(name) {
  return name ? name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "?";
}

function TaskCard({ task, index, onClick }) {
  const formatDate = (d) => {
    if (!d) return null;
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const isOverdue =
    task.dueDate && task.status !== "Completed" && new Date(task.dueDate) < new Date();

  const assigneeName = task.assigneeId?.name || null;
  const subtaskCount = task.subtasks?.length || 0;
  const subtaskDone = task.subtasks?.filter(s => s.done).length || 0;
  const isBlocked = task.blockedBy && task.blockedBy.length > 0;
  const totalHours = task.timeEntries
    ? task.timeEntries.reduce((sum, e) => sum + e.hours, 0)
    : 0;

  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`task-card ${snapshot.isDragging ? "task-card--dragging" : ""}`}
          onClick={() => onClick(task)}
        >
          <div className="task-card-title">{task.title}</div>

          {task.labels && task.labels.length > 0 && (
            <div className="task-card-labels">
              {task.labels.map((lbl, i) => (
                <span key={i} className="task-label-chip" style={{ background: lbl.color }}>
                  {lbl.name}
                </span>
              ))}
            </div>
          )}

          {/* Subtask progress indicator */}
          {subtaskCount > 0 && (
            <div className="task-card-subtask-bar">
              <div
                className="task-card-subtask-fill"
                style={{ width: `${(subtaskDone / subtaskCount) * 100}%` }}
              />
              <span className="task-card-subtask-label">{subtaskDone}/{subtaskCount}</span>
            </div>
          )}

          <div className="task-card-meta">
            <span className={PRIORITY_BADGE[task.priority] || "badge bg-secondary"}>
              {task.priority}
            </span>

            {isBlocked && (
              <span className="blocked-badge" title="Blocked by other tasks">
                🔗 Blocked
              </span>
            )}

            {totalHours > 0 && (
              <span className="time-badge" title={`${totalHours}h logged`}>
                ⏱ {totalHours}h
              </span>
            )}

            {task.dueDate && (
              <span className={`task-card-due ${isOverdue ? "overdue" : ""}`}>
                {isOverdue ? "⚠ " : ""}
                {formatDate(task.dueDate)}
              </span>
            )}

            {assigneeName && (
              <div
                className="task-card-assignee"
                style={{ background: avatarColor(assigneeName) }}
                title={assigneeName}
              >
                {initials(assigneeName)}
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}

export default TaskCard;
