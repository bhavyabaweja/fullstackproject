import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser, GOOGLE_AUTH_URL } from "../services/api";
import { useAuth } from "../context/AuthContext";

const FEATURES = [
  "Drag-and-drop Kanban boards",
  "Real-time team collaboration",
  "Smart deadline tracking",
  "Global search across all projects",
];

const STARS = [1, 2, 3, 4, 5];

function EyeIcon({ open }) {
  return open ? (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

export default function Login() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const { login }  = useAuth();
  const navigate   = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await loginUser({ email, password });
      login(res.data.token, res.data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nxauth-root">
      {/* ── LEFT SHOWCASE PANEL ── */}
      <div className="nxauth-showcase">
        <div className="nxauth-showcase-glow" aria-hidden />

        {/* logo */}
        <div className="nxauth-logo">
          <span className="nxauth-logo-icon">N</span>
          <span className="nxauth-logo-word">Nexus</span>
        </div>

        {/* headline */}
        <div className="nxauth-showcase-body">
          <h1 className="nxauth-showcase-headline">
            Your team's<br />command centre.
          </h1>
          <p className="nxauth-showcase-sub">
            Kanban boards, smart deadlines, and real-time
            collaboration — all in one fluid workspace.
          </p>

          {/* feature list */}
          <ul className="nxauth-features">
            {FEATURES.map((f) => (
              <li key={f} className="nxauth-feature-row">
                <span className="nxauth-feature-check" aria-hidden>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#e0176a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* testimonial card */}
        <div className="nxauth-testimonial">
          <div className="nxauth-testimonial-avatar">S</div>
          <div className="nxauth-testimonial-content">
            <div className="nxauth-testimonial-stars">
              {STARS.map((s) => (
                <svg key={s} width="13" height="13" viewBox="0 0 24 24" fill="#e0176a" stroke="none">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              ))}
            </div>
            <p className="nxauth-testimonial-quote">
              "Nexus cut our planning overhead by half."
            </p>
            <span className="nxauth-testimonial-name">Sarah K., Product Lead</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT FORM PANEL ── */}
      <div className="nxauth-form-panel">
        <div className="nxauth-form-wrap">

          {/* eyebrow + headline */}
          <span className="nxauth-eyebrow">Welcome back</span>
          <h2 className="nxauth-form-title">Sign in to Nexus</h2>
          <p className="nxauth-form-sub">
            Don't have an account?{" "}
            <Link to="/register" className="nxauth-inline-link">Create one →</Link>
          </p>

          {/* error */}
          {error && (
            <div className="nxauth-error" role="alert">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          {/* google */}
          <a href={GOOGLE_AUTH_URL} className="nxauth-google-btn">
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google
          </a>

          {/* divider */}
          <div className="nxauth-divider"><span>or continue with email</span></div>

          {/* form */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="nxauth-field">
              <label className="nxauth-label" htmlFor="login-email">Email address</label>
              <input
                id="login-email"
                type="email"
                className="nxauth-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="nxauth-field">
              <label className="nxauth-label" htmlFor="login-password">Password</label>
              <div className="nxauth-input-wrap">
                <input
                  id="login-password"
                  type={showPw ? "text" : "password"}
                  className="nxauth-input nxauth-input--pw"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="nxauth-eye-btn"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  <EyeIcon open={showPw} />
                </button>
              </div>
            </div>

            <button type="submit" className="nxauth-submit-btn" disabled={loading}>
              {loading ? (
                <span className="nxauth-spinner" aria-hidden />
              ) : null}
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="nxauth-secure-note">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            Secure login · Encrypted sessions
          </p>
        </div>
      </div>
    </div>
  );
}
