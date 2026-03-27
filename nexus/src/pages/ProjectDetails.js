import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Input, Button, Row, Col } from "reactstrap";
import { getTasks, addTask, getProjects, getMembers } from "../services/api";
import KanbanBoard from "../components/KanbanBoard";
import ProjectStatsChart from "../components/ProjectStatsChart";
import MembersModal from "../components/MembersModal";
import FilterBar from "../components/FilterBar";
import AITaskModal from "../components/AITaskModal";
import { Skeleton, TaskCardSkeleton } from "../components/SkeletonLoader";

function initials(name) {
  return name ? name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "?";
}

const AVATAR_COLORS = ["#0052cc", "#6554c0", "#00875a", "#de350b", "#ff8b00"];
function avatarColor(name) {
  const code = (name || "").split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
}

function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [dueDate, setDueDate] = useState("");
  const [showStats, setShowStats] = useState(true);
  const [membersOpen, setMembersOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    fetchAll();
  }, [id]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      setLoadError("");
      await Promise.all([fetchTasks(), fetchProject(), fetchMembers()]);
    } catch (err) {
      console.error("Failed to load project details", err);
      setLoadError("Could not load this project right now.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    const res = await getTasks(id);
    setTasks(res.data);
    setFilteredTasks(res.data);
  };

  const fetchProject = async () => {
    try {
      const res = await getProjects();
      const proj = res.data.find(p => p._id === id);
      if (proj) setProject(proj);
    } catch { }
  };

  const fetchMembers = async () => {
    try {
      const res = await getMembers(id);
      setMembers(res.data);
    } catch { }
  };

  const handleAdd = async () => {
    if (!title.trim()) return;
    try {
      await addTask({ projectId: id, title, priority, dueDate: dueDate || null });
      setTitle("");
      setDueDate("");
      setPriority("Medium");
      fetchTasks();
    } catch (err) {
      console.error("Failed to add task", err);
    }
  };

  const completed = tasks.filter(t => t.status === "Completed").length;
  const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
  const visibleMembers = members.slice(0, 4);
  const overflow = members.length - 4;

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Skeleton width={86} height={30} borderRadius={6} />
            <Skeleton width={220} height={24} />
          </div>
          <Skeleton width={160} height={30} borderRadius={6} />
        </div>

        <div className="add-task-form">
          <Row className="g-2 align-items-end">
            <Col md={5}><Skeleton height={38} borderRadius={6} /></Col>
            <Col md={2}><Skeleton height={38} borderRadius={6} /></Col>
            <Col md={3}><Skeleton height={38} borderRadius={6} /></Col>
            <Col md={2}><Skeleton height={38} borderRadius={6} /></Col>
          </Row>
        </div>

        <div className="kanban-board">
          {[1, 2, 3].map((col) => (
            <div key={col} className="kanban-col">
              <div className="kanban-col-header">
                <Skeleton width={120} height={16} />
                <Skeleton width={28} height={18} borderRadius={10} />
              </div>
              <div className="kanban-col-body">
                <TaskCardSkeleton />
                <TaskCardSkeleton />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="empty-state" style={{ padding: "56px 24px" }}>
        <div className="empty-state-icon">⚠️</div>
        <div className="empty-state-title">Project unavailable</div>
        <div className="empty-state-subtitle">{loadError}</div>
        <button className="btn btn-outline-secondary mt-3" onClick={fetchAll}>
          Retry
        </button>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="empty-state" style={{ padding: "56px 24px" }}>
        <div className="empty-state-icon">📁</div>
        <div className="empty-state-title">Project not found</div>
        <div className="empty-state-subtitle">This project may have been deleted or you may no longer have access.</div>
        <button className="btn btn-outline-secondary mt-3" onClick={() => navigate("/projects")}>
          Back to projects
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="d-flex align-items-center gap-3">
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => navigate("/projects")}
          >
            ← Projects
          </button>
          <span style={{ fontSize: "22px", fontWeight: 700, color: "#172b4d" }}>
            {project?.name || "Loading…"}
          </span>
        </div>

        <div className="d-flex align-items-center gap-3">
          {/* Member avatars */}
          <div className="member-avatar-stack">
            {visibleMembers.map(m => {
              const name = m.userId?.name || "?";
              return (
                <div
                  key={m._id}
                  className="member-avatar-sm"
                  style={{ background: avatarColor(name) }}
                  title={name}
                >
                  {initials(name)}
                </div>
              );
            })}
            {overflow > 0 && (
              <div className="member-avatar-sm member-avatar-overflow">+{overflow}</div>
            )}
          </div>

          <button className="btn btn-sm ai-generate-project-btn" onClick={() => setAiModalOpen(true)}>
            ✦ Generate tasks
          </button>

          <Button size="sm" color="outline-secondary" onClick={() => setMembersOpen(true)}>
            Members
          </Button>

          <Button
            size="sm"
            color="outline-secondary"
            onClick={() => navigate(`/projects/${id}/settings`)}
            title="Project settings"
          >
            ⚙ Settings
          </Button>

          <span style={{ fontSize: "13px", color: "#5e6c84" }}>
            {completed}/{tasks.length} done &nbsp;
            <span style={{ color: "#36b37e", fontWeight: 600 }}>{progress}%</span>
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="progress mb-3" style={{ height: "6px", borderRadius: "3px" }}>
        <div
          className="progress-bar bg-success"
          style={{ width: `${progress}%`, transition: "width 0.4s" }}
        />
      </div>

      {/* Stats chart */}
      {tasks.length > 0 && (
        <div className="mb-3">
          <button
            className="btn btn-sm btn-link p-0 mb-2"
            style={{ color: "#5e6c84", textDecoration: "none", fontSize: "12px" }}
            onClick={() => setShowStats(s => !s)}
          >
            {showStats ? "▾ Hide stats" : "▸ Show stats"}
          </button>
          {showStats && <ProjectStatsChart tasks={tasks} />}
        </div>
      )}

      {/* Add task form */}
      <div className="add-task-form">
        <Row className="g-2 align-items-end">
          <Col md={5}>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="New task title…"
              onKeyDown={e => e.key === "Enter" && handleAdd()}
            />
          </Col>
          <Col md={2}>
            <select className="form-select" value={priority} onChange={e => setPriority(e.target.value)}>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </Col>
          <Col md={3}>
            <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
          </Col>
          <Col md={2}>
            <Button color="primary" className="w-100" onClick={handleAdd}>Add task</Button>
          </Col>
        </Row>
      </div>

      {/* Filter Bar */}
      <FilterBar tasks={tasks} members={members} onFilterChange={setFilteredTasks} />

      {tasks.length === 0 && (
        <div className="empty-state" style={{ padding: "36px 24px", marginBottom: 16 }}>
          <div className="empty-state-icon">📝</div>
          <div className="empty-state-title">No tasks yet</div>
          <div className="empty-state-subtitle">Create your first task above to start this board.</div>
        </div>
      )}

      {/* Kanban Board */}
      <KanbanBoard tasks={filteredTasks} onRefresh={fetchTasks} projectId={id} members={members} />

      {/* Members Modal */}
      <MembersModal
        isOpen={membersOpen}
        toggle={() => setMembersOpen(false)}
        projectId={id}
        projectOwnerId={project?.userId}
      />

      {/* AI Task Generation Modal */}
      <AITaskModal
        isOpen={aiModalOpen}
        toggle={() => setAiModalOpen(false)}
        projectId={id}
        onTasksAdded={fetchTasks}
      />
    </div>
  );
}

export default ProjectDetails;
