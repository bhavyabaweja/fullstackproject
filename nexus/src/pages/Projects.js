import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Input, FormGroup, Label } from "reactstrap";
import { getProjects, addProject, deleteProject, updateProject, getTasks } from "../services/api";
import { ProjectCardSkeleton } from "../components/SkeletonLoader";

const STATUS_BADGE = {
  "Pending": "status-badge status-badge--pending",
  "In Progress": "status-badge status-badge--inprogress",
  "Completed": "status-badge status-badge--completed",
};

function Projects() {
  const [projects, setProjects] = useState([]);
  const [taskCounts, setTaskCounts] = useState({});
  const [newName, setNewName] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    setLoading(true);
    const res = await getProjects();
    setProjects(res.data);
    const counts = {};
    await Promise.all(
      res.data.map(async (p) => {
        const t = await getTasks(p._id);
        counts[p._id] = t.data.length;
      })
    );
    setTaskCounts(counts);
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!newName.trim()) return;
    await addProject({ name: newName });
    setNewName("");
    setModalOpen(false);
    fetchProjects();
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Delete this project and all its tasks?")) return;
    await deleteProject(id);
    fetchProjects();
  };

  const handleStatusChange = async (e, id) => {
    e.stopPropagation();
    await updateProject(id, { status: e.target.value });
    fetchProjects();
  };

  return (
    <div>
      <div className="page-header">
        <h2>Projects</h2>
        <Button color="primary" onClick={() => setModalOpen(true)} className="btn-add-project">
          + New project
        </Button>
      </div>

      <div className="project-grid">
        {loading ? (
          [1, 2, 3, 4].map(i => <ProjectCardSkeleton key={i} />)
        ) : projects.length === 0 ? (
          <div className="empty-state" style={{ gridColumn: "1 / -1", padding: "64px 32px" }}>
            <div className="empty-state-icon">🗂️</div>
            <div className="empty-state-title">No projects yet</div>
            <div className="empty-state-subtitle">Create your first project to start organizing tasks</div>
            <button className="btn btn-primary mt-3" onClick={() => setModalOpen(true)}>
              + Create first project
            </button>
          </div>
        ) : (
          projects.map((p) => (
            <div
              key={p._id}
              className="project-card"
              onClick={() => navigate(`/projects/${p._id}`)}
            >
              <div className="project-card-name">{p.name}</div>
              {p.description && (
                <div style={{ fontSize: 12, color: "#6b778c", marginBottom: 4, lineHeight: 1.4 }}>
                  {p.description.length > 80 ? p.description.slice(0, 80) + "…" : p.description}
                </div>
              )}
              <div className="project-card-meta">
                <span className={STATUS_BADGE[p.status] || "status-badge status-badge--pending"}>
                  {p.status}
                </span>
                <span className="project-card-tasks">
                  {taskCounts[p._id] ?? "–"} tasks
                </span>
              </div>
              <div className="d-flex align-items-center gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                <select
                  className="form-select form-select-sm"
                  value={p.status}
                  onChange={(e) => handleStatusChange(e, p._id)}
                  style={{ width: "auto" }}
                >
                  <option>Pending</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                </select>
                <button
                  className="btn btn-sm btn-outline-danger ms-auto"
                  onClick={(e) => handleDelete(e, p._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Project Modal */}
      <Modal isOpen={modalOpen} toggle={() => setModalOpen(false)}>
        <ModalHeader toggle={() => setModalOpen(false)}>New project</ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label>Project name</Label>
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Website Redesign"
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              autoFocus
            />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" outline onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button color="primary" onClick={handleAdd}>Create</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

export default Projects;
