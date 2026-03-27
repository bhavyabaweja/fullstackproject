import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Input, Button, FormGroup, Label } from "reactstrap";
import { getProjects, updateProject, deleteProject } from "../services/api";
import { Skeleton } from "../components/SkeletonLoader";

function ProjectSettings() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Pending");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [projectFound, setProjectFound] = useState(true);

  const fetchProject = async () => {
    try {
      setLoading(true);
      setLoadError("");
      const res = await getProjects();
      const proj = res.data.find((p) => p._id === id);
      if (proj) {
        setName(proj.name || "");
        setDescription(proj.description || "");
        setStatus(proj.status || "Pending");
        setProjectFound(true);
      } else {
        setProjectFound(false);
      }
    } catch (err) {
      console.error("Failed to load project settings", err);
      setLoadError("Could not load project settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await updateProject(id, { name: name.trim(), description, status });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("This will permanently delete the project and ALL its tasks. This cannot be undone. Continue?")) return;
    await deleteProject(id);
    navigate("/projects");
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 600 }}>
        <div className="page-header">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Skeleton width={76} height={30} borderRadius={6} />
            <Skeleton width={170} height={26} />
          </div>
        </div>
        <div className="settings-section">
          <Skeleton width={110} height={16} style={{ marginBottom: 18 }} />
          <Skeleton width="100%" height={38} borderRadius={6} style={{ marginBottom: 14 }} />
          <Skeleton width="100%" height={78} borderRadius={6} style={{ marginBottom: 14 }} />
          <Skeleton width={200} height={38} borderRadius={6} style={{ marginBottom: 18 }} />
          <Skeleton width={124} height={36} borderRadius={6} />
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="empty-state" style={{ padding: "56px 24px" }}>
        <div className="empty-state-icon">Warning</div>
        <div className="empty-state-title">Settings unavailable</div>
        <div className="empty-state-subtitle">{loadError}</div>
        <button className="btn btn-outline-secondary mt-3" onClick={fetchProject}>
          Retry
        </button>
      </div>
    );
  }

  if (!projectFound) {
    return (
      <div className="empty-state" style={{ padding: "56px 24px" }}>
        <div className="empty-state-icon">Project</div>
        <div className="empty-state-title">Project not found</div>
        <div className="empty-state-subtitle">This project may have been removed.</div>
        <button className="btn btn-outline-secondary mt-3" onClick={() => navigate("/projects")}>
          Back to projects
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600 }}>
      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button className="btn btn-sm btn-outline-secondary" onClick={() => navigate(`/projects/${id}`)}>
            Back
          </button>
          <h2 style={{ margin: 0 }}>Project Settings</h2>
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-section-title">General</div>

        <FormGroup>
          <Label className="settings-label">Project name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Project name" />
        </FormGroup>

        <FormGroup>
          <Label className="settings-label">Description</Label>
          <Input
            type="textarea"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the project goals, scope, or anything useful..."
          />
        </FormGroup>

        <FormGroup>
          <Label className="settings-label">Status</Label>
          <Input type="select" value={status} onChange={(e) => setStatus(e.target.value)} style={{ maxWidth: 200 }}>
            <option>Pending</option>
            <option>In Progress</option>
            <option>Completed</option>
          </Input>
        </FormGroup>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
          <Button color="primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </Button>
          {saved && <span style={{ color: "#36b37e", fontSize: 13, fontWeight: 600 }}>Saved</span>}
        </div>
      </div>

      <div className="danger-zone">
        <div className="danger-zone-title">Danger Zone</div>
        <div className="danger-zone-row">
          <div>
            <div className="danger-zone-action-title">Delete this project</div>
            <div className="danger-zone-action-desc">
              Permanently removes the project and all its tasks. This cannot be undone.
            </div>
          </div>
          <Button color="danger" outline size="sm" onClick={handleDelete}>
            Delete project
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ProjectSettings;
