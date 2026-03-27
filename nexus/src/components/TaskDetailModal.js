import React, { useState, useEffect, useCallback } from "react";
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
  Button, Input, FormGroup, Label,
} from "reactstrap";
import {
  updateTask, deleteTask, getComments, addComment, getActivityLog,
  updateSubtasks, logTime, getTimeEntries, getTasks,
} from "../services/api";
import { useAuth } from "../context/AuthContext";
import socket from "../socket";

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

const LABEL_COLORS = [
  { hex: "#0052cc", name: "Blue" },
  { hex: "#36b37e", name: "Green" },
  { hex: "#de350b", name: "Red" },
  { hex: "#ff8b00", name: "Orange" },
  { hex: "#6554c0", name: "Purple" },
  { hex: "#00b8d9", name: "Teal" },
  { hex: "#97a0af", name: "Gray" },
  { hex: "#172b4d", name: "Dark" },
];

function formatActivityAction(entry) {
  switch (entry.action) {
    case "task_created": return "created this task";
    case "task_deleted": return "deleted this task";
    case "status_changed": return `changed status from "${entry.meta?.from}" to "${entry.meta?.to}"`;
    case "priority_changed": return `changed priority from "${entry.meta?.from}" to "${entry.meta?.to}"`;
    case "assigned": return `assigned this task to ${entry.meta?.assigneeName || "someone"}`;
    case "unassigned": return `unassigned ${entry.meta?.previousAssigneeName || "someone"} from this task`;
    case "commented": return "added a comment";
    default: return entry.action;
  }
}

function TaskDetailModal({ task, isOpen, toggle, onSaved, onDeleted, projectId, members = [] }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [status, setStatus] = useState("Pending");
  const [dueDate, setDueDate] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [labels, setLabels] = useState([]);
  const [saving, setSaving] = useState(false);

  const [labelText, setLabelText] = useState("");
  const [selectedColor, setSelectedColor] = useState(LABEL_COLORS[0].hex);

  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [posting, setPosting] = useState(false);

  const [activityLog, setActivityLog] = useState([]);

  // Subtasks
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtaskText, setNewSubtaskText] = useState("");
  const [savingSubtasks, setSavingSubtasks] = useState(false);

  // Time tracking  
  const [timeEntries, setTimeEntries] = useState([]);
  const [timeTotal, setTimeTotal] = useState(0);
  const [logHours, setLogHours] = useState("");
  const [logNote, setLogNote] = useState("");
  const [loggingTime, setLoggingTime] = useState(false);

  // Dependencies (blocked by)
  const [projectTasks, setProjectTasks] = useState([]);
  const [blockedBy, setBlockedBy] = useState([]);
  const [savingDeps, setSavingDeps] = useState(false);

  const { user } = useAuth();

  const fetchProjectTasks = useCallback(async () => {
    if (!projectId) return;
    try {
      const res = await getTasks(projectId);
      setProjectTasks(res.data);
    } catch { }
  }, [projectId]);

  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setDescription(task.description || "");
      setPriority(task.priority || "Medium");
      setStatus(task.status || "Pending");
      setDueDate(task.dueDate ? task.dueDate.slice(0, 10) : "");
      setAssigneeId(task.assigneeId?._id || task.assigneeId || "");
      setLabels(task.labels || []);
      setSubtasks(task.subtasks || []);
      setBlockedBy((task.blockedBy || []).map(b => (typeof b === "object" ? b._id : b)));
      fetchComments(task._id);
      fetchActivityLog(task._id);
      fetchTimeEntries(task._id);
      fetchProjectTasks();
    }
  }, [task, fetchProjectTasks]);

  // Live comment updates via socket
  useEffect(() => {
    if (!isOpen || !task) return;
    const handler = ({ taskId }) => {
      if (taskId === task._id) {
        fetchComments(task._id);
        fetchActivityLog(task._id);
      }
    };
    socket.on("comment:added", handler);
    return () => socket.off("comment:added", handler);
  }, [isOpen, task]);

  // Live task updates → refresh activity log
  useEffect(() => {
    if (!isOpen || !task) return;
    const handler = (updated) => {
      if (String(updated._id) === String(task._id)) fetchActivityLog(task._id);
    };
    socket.on("task:updated", handler);
    return () => socket.off("task:updated", handler);
  }, [isOpen, task]);

  const fetchComments = async (taskId) => {
    try {
      const res = await getComments(taskId);
      setComments(res.data);
    } catch { }
  };

  const fetchActivityLog = async (taskId) => {
    try {
      const res = await getActivityLog(taskId);
      setActivityLog(res.data);
    } catch { }
  };

  const fetchTimeEntries = async (taskId) => {
    try {
      const res = await getTimeEntries(taskId);
      setTimeEntries(res.data.entries || []);
      setTimeTotal(res.data.total || 0);
    } catch { }
  };

  const handleSave = async () => {
    setSaving(true);
    await updateTask(task._id, {
      title, description, priority, status,
      dueDate: dueDate || null,
      assigneeId: assigneeId || null,
      labels,
      blockedBy,
    });
    setSaving(false);
    onSaved();
    toggle();
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this task?")) return;
    await deleteTask(task._id);
    onDeleted();
    toggle();
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    setPosting(true);
    try {
      await addComment({ taskId: task._id, projectId, text: commentText.trim() });
      setCommentText("");
      fetchComments(task._id);
    } finally {
      setPosting(false);
    }
  };

  const handleAddLabel = () => {
    const name = labelText.trim();
    if (!name) return;
    if (labels.some(l => l.name.toLowerCase() === name.toLowerCase())) return;
    setLabels([...labels, { name, color: selectedColor }]);
    setLabelText("");
  };

  const handleRemoveLabel = (idx) => {
    setLabels(labels.filter((_, i) => i !== idx));
  };

  // --- Subtask handlers ---
  const handleAddSubtask = () => {
    if (!newSubtaskText.trim()) return;
    setSubtasks([...subtasks, { text: newSubtaskText.trim(), done: false }]);
    setNewSubtaskText("");
  };

  const handleToggleSubtask = (idx) => {
    const updated = subtasks.map((s, i) =>
      i === idx ? { ...s, done: !s.done } : s
    );
    setSubtasks(updated);
  };

  const handleDeleteSubtask = (idx) => {
    setSubtasks(subtasks.filter((_, i) => i !== idx));
  };

  const handleSaveSubtasks = async () => {
    setSavingSubtasks(true);
    try {
      await updateSubtasks(task._id, subtasks);
    } finally {
      setSavingSubtasks(false);
    }
  };

  const subtasksDone = subtasks.filter(s => s.done).length;
  const subtaskProgress = subtasks.length ? Math.round((subtasksDone / subtasks.length) * 100) : 0;

  // --- Time tracking handlers ---
  const handleLogTime = async () => {
    const h = parseFloat(logHours);
    if (!h || h <= 0) return;
    setLoggingTime(true);
    try {
      await logTime(task._id, { hours: h, note: logNote.trim() });
      setLogHours("");
      setLogNote("");
      fetchTimeEntries(task._id);
    } finally {
      setLoggingTime(false);
    }
  };

  // --- Dependency handlers ---
  const toggleBlockedBy = (taskId) => {
    if (blockedBy.includes(taskId)) {
      setBlockedBy(blockedBy.filter(id => id !== taskId));
    } else {
      setBlockedBy([...blockedBy, taskId]);
    }
  };

  const handleSaveDeps = async () => {
    setSavingDeps(true);
    try {
      await updateTask(task._id, { blockedBy });
    } finally {
      setSavingDeps(false);
    }
  };

  const formatTime = (ts) => {
    const d = new Date(ts);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
      " at " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  const otherTasks = projectTasks.filter(t => t._id !== task?._id);

  if (!task) return null;

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg">
      <ModalHeader toggle={toggle}>
        <span className={PRIORITY_BADGE[priority]}>{priority}</span>{" "}Task Details
      </ModalHeader>

      <ModalBody>
        <FormGroup>
          <Label>Title</Label>
          <Input value={title} onChange={e => setTitle(e.target.value)} />
        </FormGroup>

        <FormGroup>
          <Label>Description</Label>
          <Input type="textarea" rows={3} value={description}
            onChange={e => setDescription(e.target.value)} placeholder="Add a description..." />
        </FormGroup>

        <div className="row">
          <div className="col-md-3">
            <FormGroup>
              <Label>Priority</Label>
              <Input type="select" value={priority} onChange={e => setPriority(e.target.value)}>
                <option>Low</option><option>Medium</option><option>High</option>
              </Input>
            </FormGroup>
          </div>
          <div className="col-md-3">
            <FormGroup>
              <Label>Status</Label>
              <Input type="select" value={status} onChange={e => setStatus(e.target.value)}>
                <option>Pending</option><option>In Progress</option><option>Completed</option>
              </Input>
            </FormGroup>
          </div>
          <div className="col-md-3">
            <FormGroup>
              <Label>Assignee</Label>
              <Input type="select" value={assigneeId} onChange={e => setAssigneeId(e.target.value)}>
                <option value="">Unassigned</option>
                {members.map(m => (
                  <option key={m.userId?._id} value={m.userId?._id}>
                    {m.userId?.name}
                  </option>
                ))}
              </Input>
            </FormGroup>
          </div>
          <div className="col-md-3">
            <FormGroup>
              <Label>Due date</Label>
              <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
            </FormGroup>
          </div>
        </div>

        {/* Labels */}
        <div className="modal-labels-section">
          <Label>Labels</Label>
          <div className="modal-labels-chips">
            {labels.map((lbl, idx) => (
              <span key={idx} className="modal-label-chip" style={{ background: lbl.color }}>
                {lbl.name}
                <button className="modal-label-chip-remove" onClick={() => handleRemoveLabel(idx)}>×</button>
              </span>
            ))}
            {labels.length === 0 && (
              <span style={{ fontSize: 12, color: "#a5adba" }}>No labels yet</span>
            )}
          </div>
          <div className="label-add-row">
            <Input
              bsSize="sm"
              value={labelText}
              onChange={e => setLabelText(e.target.value)}
              placeholder="Label name…"
              style={{ width: 150 }}
              onKeyDown={e => e.key === "Enter" && handleAddLabel()}
            />
            <div className="label-swatches-row">
              {LABEL_COLORS.map(c => (
                <div
                  key={c.hex}
                  className={`label-color-swatch ${selectedColor === c.hex ? "selected" : ""}`}
                  style={{ background: c.hex }}
                  title={c.name}
                  onClick={() => setSelectedColor(c.hex)}
                />
              ))}
            </div>
            <Button size="sm" color="secondary" outline onClick={handleAddLabel}>Add</Button>
          </div>
        </div>

        {/* ── Subtasks / Checklist ── */}
        <hr />
        <div className="subtasks-section">
          <div className="subtasks-header">
            <div className="comment-section-label" style={{ marginBottom: 0 }}>
              Checklist ({subtasksDone}/{subtasks.length})
            </div>
            {subtasks.length > 0 && (
              <div className="subtasks-progress-bar">
                <div className="subtasks-progress-fill" style={{ width: `${subtaskProgress}%` }} />
              </div>
            )}
          </div>

          <div className="subtask-list">
            {subtasks.length === 0 && (
              <div className="comment-empty">No checklist items yet</div>
            )}
            {subtasks.map((s, idx) => (
              <div key={idx} className="subtask-item">
                <input
                  type="checkbox"
                  className="subtask-checkbox"
                  checked={s.done}
                  onChange={() => handleToggleSubtask(idx)}
                  id={`subtask-${idx}`}
                />
                <label
                  htmlFor={`subtask-${idx}`}
                  className={`subtask-text ${s.done ? "subtask-text--done" : ""}`}
                >
                  {s.text}
                </label>
                <button
                  className="subtask-delete"
                  onClick={() => handleDeleteSubtask(idx)}
                  title="Remove"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className="subtask-add-row">
            <Input
              bsSize="sm"
              value={newSubtaskText}
              onChange={e => setNewSubtaskText(e.target.value)}
              placeholder="Add an item…"
              onKeyDown={e => e.key === "Enter" && handleAddSubtask()}
              style={{ flex: 1 }}
            />
            <Button size="sm" color="secondary" outline onClick={handleAddSubtask}>Add</Button>
            <Button size="sm" color="primary" outline onClick={handleSaveSubtasks} disabled={savingSubtasks}>
              {savingSubtasks ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>

        {/* ── Time Tracking ── */}
        <hr />
        <div className="time-tracker-section">
          <div className="comment-section-label">
            Time Tracking
            {timeTotal > 0 && (
              <span className="time-total-badge">{timeTotal.toFixed(1)}h total</span>
            )}
          </div>

          <div className="time-entry-list">
            {timeEntries.length === 0 && (
              <div className="comment-empty">No time logged yet</div>
            )}
            {timeEntries.map((e, idx) => (
              <div key={idx} className="time-entry-row">
                <div className="comment-avatar" style={{ background: avatarColor(e.userId?.name || "?"), width: 26, height: 26, fontSize: 10 }}>
                  {initials(e.userId?.name || "?")}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span className="time-entry-hours">{e.hours}h</span>
                  {e.note && <span className="time-entry-note"> — {e.note}</span>}
                  <div style={{ fontSize: 11, color: "#a5adba" }}>{formatTime(e.date)}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="time-log-form">
            <Input
              bsSize="sm"
              type="number"
              min="0.25"
              step="0.25"
              value={logHours}
              onChange={e => setLogHours(e.target.value)}
              placeholder="Hours (e.g. 1.5)"
              style={{ width: 130 }}
            />
            <Input
              bsSize="sm"
              value={logNote}
              onChange={e => setLogNote(e.target.value)}
              placeholder="Note (optional)"
              style={{ flex: 1 }}
            />
            <Button size="sm" color="primary" outline onClick={handleLogTime} disabled={loggingTime || !logHours}>
              {loggingTime ? "…" : "Log"}
            </Button>
          </div>
        </div>

        {/* ── Task Dependencies ── */}
        {otherTasks.length > 0 && (
          <>
            <hr />
            <div className="deps-section">
              <div className="comment-section-label">Blocked By</div>
              <div className="deps-list">
                {otherTasks.map(t => (
                  <label key={t._id} className={`dep-item ${blockedBy.includes(t._id) ? "dep-item--selected" : ""}`}>
                    <input
                      type="checkbox"
                      checked={blockedBy.includes(t._id)}
                      onChange={() => toggleBlockedBy(t._id)}
                      style={{ marginRight: 8 }}
                    />
                    <span className="dep-item-title">{t.title}</span>
                    <span className={`dep-item-status dep-item-status--${t.status.toLowerCase().replace(" ", "")}`}>
                      {t.status}
                    </span>
                  </label>
                ))}
              </div>
              <Button size="sm" color="secondary" outline onClick={handleSaveDeps} disabled={savingDeps} style={{ marginTop: 6 }}>
                {savingDeps ? "Saving…" : "Save dependencies"}
              </Button>
            </div>
          </>
        )}

        {/* Comments */}
        <hr />
        <div className="comment-section-label">Comments ({comments.length})</div>

        <div className="comment-list">
          {comments.length === 0 && (
            <div className="comment-empty">No comments yet. Be the first to comment.</div>
          )}
          {comments.map(c => {
            const name = c.userId?.name || "User";
            return (
              <div key={c._id} className="comment-item">
                <div className="comment-avatar" style={{ background: avatarColor(name) }}>
                  {initials(name)}
                </div>
                <div className="comment-body">
                  <div className="comment-meta">
                    <span className="comment-author">{name}</span>
                    <span className="comment-time">{formatTime(c.createdAt)}</span>
                  </div>
                  <div className="comment-text">{c.text}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="comment-input-row">
          <div
            className="comment-avatar"
            style={{ background: avatarColor(user?.name), flexShrink: 0 }}
          >
            {initials(user?.name)}
          </div>
          <Input
            type="textarea"
            rows={2}
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            placeholder="Write a comment…"
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleComment(); }
            }}
          />
          <Button color="primary" onClick={handleComment} disabled={posting || !commentText.trim()}>
            {posting ? "…" : "Post"}
          </Button>
        </div>

        {/* Activity Log */}
        <hr />
        <div className="comment-section-label">Activity</div>
        <div className="activity-timeline">
          {activityLog.length === 0 && (
            <div className="comment-empty">No activity yet.</div>
          )}
          {activityLog.map(entry => (
            <div key={entry._id} className="activity-item">
              <div className="activity-dot" />
              <div className="activity-body">
                <span className="activity-actor">{entry.userId?.name || "Someone"}</span>
                {" "}{formatActivityAction(entry)}
                <span className="activity-time">{formatTime(entry.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      </ModalBody>

      <ModalFooter className="d-flex justify-content-between">
        <Button color="danger" outline size="sm" onClick={handleDelete}>Delete task</Button>
        <div>
          <Button color="secondary" outline onClick={toggle} className="me-2">Cancel</Button>
          <Button color="primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
}

export default TaskDetailModal;
