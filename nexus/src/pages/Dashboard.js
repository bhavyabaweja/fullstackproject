import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { differenceInCalendarDays, isAfter, isBefore, addDays, startOfDay } from "date-fns";
import { getAllTasks, getProjects } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { StatCardSkeleton, WidgetRowSkeleton } from "../components/SkeletonLoader";

const STATUS_BADGE = {
  "Pending": "status-badge status-badge--pending",
  "In Progress": "status-badge status-badge--inprogress",
  "Completed": "status-badge status-badge--completed",
};

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projRes, taskRes] = await Promise.all([getProjects(), getAllTasks()]);
      setProjects(projRes.data);
      setTasks(taskRes.data);
    } catch (err) {
      // 401 is handled globally in the API client.
      console.error("Failed to load dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  const today = startOfDay(new Date());
  const in7Days = addDays(today, 7);

  const completed = tasks.filter(t => t.status === "Completed").length;
  const inProgress = tasks.filter(t => t.status === "In Progress").length;

  const overdueTasks = tasks.filter(t =>
    t.dueDate && t.status !== "Completed" && isBefore(new Date(t.dueDate), today)
  );

  const upcomingTasks = tasks.filter(t =>
    t.dueDate &&
    t.status !== "Completed" &&
    !isBefore(new Date(t.dueDate), today) &&
    !isAfter(new Date(t.dueDate), in7Days)
  );

  const dueTodayCount = upcomingTasks.filter(t =>
    differenceInCalendarDays(new Date(t.dueDate), today) === 0
  ).length;

  const projectName = (projectId) => {
    const p = projects.find(pr => pr._id === projectId);
    return p ? p.name : "—";
  };

  const daysOverdue = (dueDate) => {
    const diff = differenceInCalendarDays(today, new Date(dueDate));
    return diff === 1 ? "1 day overdue" : `${diff} days overdue`;
  };

  const daysUntil = (dueDate) => {
    const diff = differenceInCalendarDays(new Date(dueDate), today);
    if (diff === 0) return { label: "Due today", cls: "upcoming-chip upcoming-chip--today", isToday: true };
    if (diff === 1) return { label: "Tomorrow", cls: "upcoming-chip upcoming-chip--soon", isToday: false };
    return { label: `${diff} days`, cls: "upcoming-chip", isToday: false };
  };

  return (
    <div>
      <div className="page-header">
        <h2>Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""} 👋</h2>
      </div>

      {/* Stat cards */}
      <div className="row g-3 mb-4">
        {loading ? (
          [1, 2, 3, 4].map(i => (
            <div key={i} className="col-6 col-lg-3"><StatCardSkeleton /></div>
          ))
        ) : (
          <>
            <div className="col-6 col-lg-3">
              <div className="stat-card stat-card--blue">
                <div className="stat-card-header">
                  <span className="stat-label">Projects</span>
                  <div className="stat-icon-wrap stat-icon-wrap--blue">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                    </svg>
                  </div>
                </div>
                <div className="stat-value">{projects.length}</div>
              </div>
            </div>
            <div className="col-6 col-lg-3">
              <div className="stat-card stat-card--purple">
                <div className="stat-card-header">
                  <span className="stat-label">Total Tasks</span>
                  <div className="stat-icon-wrap stat-icon-wrap--purple">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
                      <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
                    </svg>
                  </div>
                </div>
                <div className="stat-value">{tasks.length}</div>
              </div>
            </div>
            <div className="col-6 col-lg-3">
              <div className="stat-card stat-card--green">
                <div className="stat-card-header">
                  <span className="stat-label">Completed</span>
                  <div className="stat-icon-wrap stat-icon-wrap--green">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                  </div>
                </div>
                <div className="stat-value">{completed}</div>
              </div>
            </div>
            <div className="col-6 col-lg-3">
              <div className="stat-card stat-card--orange">
                <div className="stat-card-header">
                  <span className="stat-label">In Progress</span>
                  <div className="stat-icon-wrap stat-icon-wrap--orange">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                  </div>
                </div>
                <div className="stat-value">{inProgress}</div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Overdue + Upcoming widgets */}
      <div className="row g-3 mb-4">
        {/* Overdue */}
        <div className="col-md-8">
          <div className="widget-card">
            <div className="widget-header">
              <span className="widget-title">Overdue Tasks</span>
              {overdueTasks.length > 0 && (
                <span className="badge bg-danger">{overdueTasks.length}</span>
              )}
            </div>
            <div className="widget-body">
              {loading ? (
                [1, 2, 3].map(i => <WidgetRowSkeleton key={i} />)
              ) : overdueTasks.length === 0 ? (
                <div className="widget-empty">No overdue tasks — nice work! 🎉</div>
              ) : (
                overdueTasks.map(t => (
                  <div key={t._id} className="overdue-item">
                    <div className="overdue-item-left">
                      <span className="overdue-item-title">{t.title}</span>
                      <span className="overdue-item-project">{projectName(t.projectId)}</span>
                    </div>
                    <span className="overdue-badge">{daysOverdue(t.dueDate)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Upcoming */}
        <div className="col-md-4">
          <div className="widget-card">
            <div className="widget-header">
              <span className="widget-title">Due This Week</span>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                {dueTodayCount > 0 && (
                  <span className="badge" style={{ background: "#de350b", color: "#fff", fontSize: 10 }}>
                    {dueTodayCount} today
                  </span>
                )}
                {upcomingTasks.length > 0 && (
                  <span className="badge bg-primary">{upcomingTasks.length}</span>
                )}
              </div>
            </div>
            <div className="widget-body">
              {loading ? (
                [1, 2, 3].map(i => <WidgetRowSkeleton key={i} />)
              ) : upcomingTasks.length === 0 ? (
                <div className="widget-empty">Nothing due this week 🙌</div>
              ) : (
                upcomingTasks.map(t => {
                  const { label, cls, isToday } = daysUntil(t.dueDate);
                  return (
                    <div key={t._id} className={`upcoming-item${isToday ? " upcoming-item--today" : ""}`}>
                      <span className="upcoming-item-title">{t.title}</span>
                      <span className={cls}>{label}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent projects */}
      <div className="recent-projects">
        <div className="recent-projects-header">Recent Projects</div>
        {loading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="recent-project-row">
              <div className="skeleton-shimmer" style={{ width: "40%", height: 14, borderRadius: 4 }} />
              <div className="skeleton-shimmer" style={{ width: "12%", height: 20, borderRadius: 10 }} />
            </div>
          ))
        ) : projects.length === 0 ? (
          <div className="empty-state" style={{ padding: "40px 20px" }}>
            <div className="empty-state-icon">📂</div>
            <div className="empty-state-title">No projects yet</div>
            <div className="empty-state-subtitle">Create your first project to get started</div>
            <button
              className="btn btn-primary btn-sm mt-3"
              onClick={() => navigate("/projects")}
            >
              Create a Project
            </button>
          </div>
        ) : (
          projects.slice(0, 8).map(p => (
            <div
              key={p._id}
              className="recent-project-row"
              onClick={() => navigate(`/projects/${p._id}`)}
            >
              <span className="recent-project-name">{p.name}</span>
              <span className={STATUS_BADGE[p.status] || "status-badge status-badge--pending"}>
                {p.status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Dashboard;
