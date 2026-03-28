import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQ, setSearchQ] = useState("");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((name) => name[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const handleNavClick = () => {
    if (onClose) onClose();
  };

  const handleSearch = (event) => {
    event.preventDefault();
    if (!searchQ.trim()) return;
    navigate(`/search?q=${encodeURIComponent(searchQ.trim())}`);
    setSearchQ("");
    handleNavClick();
  };

  return (
    <aside className={`sidebar${isOpen ? " sidebar--open" : ""}`}>
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4.5 16.5L9 3l6 6 6-4.5-4.5 15L9 21z" />
          </svg>
        </div>
        <div>
          <div className="sidebar-logo-text">Nexus</div>
          <p className="sidebar-logo-subtitle">Project Workspace</p>
        </div>
        <button className="sidebar-close-btn" onClick={onClose} aria-label="Close menu">
          x
        </button>
      </div>

      <form className="sidebar-search" onSubmit={handleSearch}>
        <input
          className="sidebar-search-input"
          placeholder="Search..."
          value={searchQ}
          onChange={(event) => setSearchQ(event.target.value)}
          aria-label="Search"
        />
      </form>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`} onClick={handleNavClick}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
          </svg>
          Dashboard
        </NavLink>

        <NavLink to="/projects" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`} onClick={handleNavClick}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
          Projects
        </NavLink>

        <NavLink to="/calendar" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`} onClick={handleNavClick}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          Calendar
        </NavLink>

        <NavLink to="/search" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`} onClick={handleNavClick}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          Search
        </NavLink>
      </nav>

      <div className="sidebar-footer-actions">
        <button type="button" className="sidebar-create-btn" onClick={() => navigate("/projects")}>+ Create Project</button>
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{initials}</div>
          <div>
            <div className="sidebar-username">{user?.name || "User"}</div>
            <div className="sidebar-user-role">Team Member</div>
          </div>
        </div>
        <button className="sidebar-logout" onClick={handleLogout} title="Logout" aria-label="Logout">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
