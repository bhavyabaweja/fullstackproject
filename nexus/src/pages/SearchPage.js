import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { searchAll } from "../services/api";
import { Skeleton } from "../components/SkeletonLoader";

const PRIORITY_BADGE = {
  High: "badge bg-danger",
  Medium: "badge bg-warning text-dark",
  Low: "badge bg-success",
};

function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState({ tasks: [], projects: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = searchParams.get("q") || "";
    setQuery(q);
    if (q.length >= 2) {
      doSearch(q);
    } else {
      setResults({ tasks: [], projects: [] });
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  const doSearch = async (q) => {
    setLoading(true);
    try {
      const res = await searchAll(q);
      setResults(res.data);
    } catch {
      setResults({ tasks: [], projects: [] });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) setSearchParams({ q: query.trim() });
  };

  const tasksByProject = results.tasks.reduce((acc, t) => {
    const key = String(t.projectId);
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {});

  const projectName = (projectId) => {
    const p = results.projects.find((pr) => String(pr._id) === String(projectId));
    return p ? p.name : "Project";
  };

  const currentQ = searchParams.get("q");
  const hasResults = results.tasks.length > 0 || results.projects.length > 0;

  return (
    <div>
      <div className="page-header">
        <h2>Search</h2>
      </div>

      <form onSubmit={handleSubmit} className="search-page-form mb-4">
        <div className="input-group" style={{ maxWidth: 520 }}>
          <input
            className="form-control"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks and projects..."
            autoFocus
          />
          <button className="btn btn-primary" type="submit">Search</button>
        </div>
      </form>

      {!loading && !currentQ && (
        <div className="empty-state" style={{ padding: "48px 24px" }}>
          <div className="empty-state-icon">Search</div>
          <div className="empty-state-title">Start typing to search</div>
          <div className="empty-state-subtitle">Search across project names and task titles.</div>
        </div>
      )}

      {loading && (
        <div className="search-skeleton-list">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="search-result-item" style={{ pointerEvents: "none" }}>
              <Skeleton width={i % 2 === 0 ? "42%" : "56%"} height={14} />
              <Skeleton width={86} height={22} borderRadius={11} />
            </div>
          ))}
        </div>
      )}

      {!loading && currentQ && (
        <>
          {results.projects.length > 0 && (
            <div className="search-section mb-4">
              <div className="search-section-label">Projects ({results.projects.length})</div>
              {results.projects.map((p) => (
                <div key={p._id} className="search-result-item" onClick={() => navigate(`/projects/${p._id}`)}>
                  <span className="search-result-title">{p.name}</span>
                  <span className="badge bg-secondary">{p.status}</span>
                </div>
              ))}
            </div>
          )}

          {Object.entries(tasksByProject).map(([projectId, projectTasks]) => (
            <div key={projectId} className="search-section mb-4">
              <div className="search-section-label">
                Tasks in {projectName(projectId)} ({projectTasks.length})
              </div>
              {projectTasks.map((t) => (
                <div key={t._id} className="search-result-item" onClick={() => navigate(`/projects/${t.projectId}`)}>
                  <span className="search-result-title">{t.title}</span>
                  <div className="d-flex gap-2 align-items-center flex-wrap">
                    {(t.labels || []).map((lbl, i) => (
                      <span key={i} className="task-label-chip" style={{ background: lbl.color }}>
                        {lbl.name}
                      </span>
                    ))}
                    <span className={PRIORITY_BADGE[t.priority] || "badge bg-secondary"}>
                      {t.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ))}

          {!hasResults && (
            <div className="empty-state" style={{ padding: "48px 24px" }}>
              <div className="empty-state-icon">Empty</div>
              <div className="empty-state-title">No results found</div>
              <div className="empty-state-subtitle">No matches for "{currentQ}". Try a different keyword.</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default SearchPage;
