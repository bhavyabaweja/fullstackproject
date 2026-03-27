import React, { useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";
import { generateTasks, addTask } from "../services/api";

const PRIORITY_COLORS = {
  High: { bg: "#fff0f0", color: "#de350b", border: "#ffd5d5" },
  Medium: { bg: "#fff7e6", color: "#ff8b00", border: "#ffe0a3" },
  Low: { bg: "#e3fcef", color: "#00875a", border: "#abf5d1" },
};

function AITaskModal({ isOpen, toggle, projectId, onTasksAdded }) {
  const [description, setDescription] = useState("");
  const [generatedTasks, setGeneratedTasks] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!description.trim()) return;
    setLoading(true);
    setError("");
    setGeneratedTasks([]);
    setSelected(new Set());
    try {
      const res = await generateTasks(description);
      const tasks = res.data.tasks;
      setGeneratedTasks(tasks);
      setSelected(new Set(tasks.map((_, i) => i)));
    } catch (err) {
      setError(err.response?.data?.error || "Failed to generate tasks. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (idx) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(generatedTasks.map((_, i) => i)));
  const deselectAll = () => setSelected(new Set());

  const handleAddTasks = async () => {
    const toAdd = generatedTasks.filter((_, i) => selected.has(i));
    if (!toAdd.length) return;
    setAdding(true);
    try {
      await Promise.all(
        toAdd.map((t) =>
          addTask({
            projectId,
            title: t.title,
            description: t.description,
            priority: t.priority,
            status: "Pending",
          })
        )
      );
      onTasksAdded();
      handleClose();
    } catch (err) {
      setError("Failed to add some tasks. Please try again.");
    } finally {
      setAdding(false);
    }
  };

  const handleClose = () => {
    setDescription("");
    setGeneratedTasks([]);
    setSelected(new Set());
    setError("");
    toggle();
  };

  const selectedCount = selected.size;

  return (
    <Modal isOpen={isOpen} toggle={handleClose} size="lg" className="ai-task-modal">
      <ModalHeader toggle={handleClose} className="ai-modal-header">
        <div className="ai-modal-title">
          <span className="ai-sparkle-icon">✦</span>
          Generate Tasks with AI
        </div>
        <div className="ai-modal-subtitle">Describe a feature or goal — AI will break it into tasks</div>
      </ModalHeader>

      <ModalBody className="ai-modal-body">
        {/* Input section */}
        <div className="ai-input-section">
          <textarea
            className="ai-description-input"
            placeholder={`e.g. "User authentication with email/password login, OAuth via Google, forgot password flow, and session management"`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.metaKey) handleGenerate();
            }}
            rows={3}
            disabled={loading}
          />
          <div className="ai-input-footer">
            <span className="ai-hint">⌘ Enter to generate</span>
            <button
              className="btn ai-generate-btn"
              onClick={handleGenerate}
              disabled={loading || !description.trim()}
            >
              {loading ? (
                <span className="ai-thinking">
                  <span className="ai-dot" />
                  <span className="ai-dot" />
                  <span className="ai-dot" />
                  Thinking…
                </span>
              ) : (
                <>✦ Generate</>
              )}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && <div className="ai-error">{error}</div>}

        {/* Generated tasks */}
        {generatedTasks.length > 0 && (
          <div className="ai-results-section">
            <div className="ai-results-header">
              <span className="ai-results-count">{generatedTasks.length} tasks generated</span>
              <div className="ai-select-actions">
                <button className="ai-select-btn" onClick={selectAll}>Select all</button>
                <span className="ai-select-divider">·</span>
                <button className="ai-select-btn" onClick={deselectAll}>None</button>
              </div>
            </div>

            <div className="ai-task-list">
              {generatedTasks.map((task, i) => {
                const isSelected = selected.has(i);
                const colors = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.Medium;
                return (
                  <div
                    key={i}
                    className={`ai-task-card ${isSelected ? "ai-task-card--selected" : ""}`}
                    onClick={() => toggleSelect(i)}
                  >
                    <div className="ai-task-checkbox">
                      <div className={`ai-checkbox ${isSelected ? "ai-checkbox--checked" : ""}`}>
                        {isSelected && (
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <div className="ai-task-body">
                      <div className="ai-task-title">{task.title}</div>
                      <div className="ai-task-desc">{task.description}</div>
                    </div>
                    <div className="ai-task-meta">
                      <span
                        className="ai-priority-badge"
                        style={{ background: colors.bg, color: colors.color, border: `1px solid ${colors.border}` }}
                      >
                        {task.priority}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </ModalBody>

      {generatedTasks.length > 0 && (
        <ModalFooter className="ai-modal-footer">
          <span className="ai-footer-hint">Powered by AI</span>
          <div className="ai-footer-actions">
            <Button color="secondary" outline onClick={handleClose} disabled={adding}>
              Cancel
            </Button>
            <Button
              className="ai-add-btn"
              onClick={handleAddTasks}
              disabled={selectedCount === 0 || adding}
            >
              {adding ? "Adding…" : `Add ${selectedCount} task${selectedCount !== 1 ? "s" : ""} to project`}
            </Button>
          </div>
        </ModalFooter>
      )}
    </Modal>
  );
}

export default AITaskModal;
