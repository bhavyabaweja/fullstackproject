import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser, GOOGLE_AUTH_URL } from "../services/api";

const PERKS = [
  "Free forever — no credit card required",
  "Unlimited projects and tasks",
  "Invite your whole team instantly",
  "Cancel or export your data any time",
];

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

export default function Register() {
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await registerUser({ name, email, password });
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const strength = !password ? 0
    : password.length < 6 ? 1
    : password.length < 10 ? 2
    : 3;
  const strengthLabel = ["", "Weak", "Good", "Strong"][strength];
  const strengthColor = ["", "#ef4444", "#f59e0b", "#22c55e"][strength];

  return (
    <div className="nxauth-root">
      {/* ── LEFT SHOWCASE PANEL ── */}
      <div className="nxauth-showcase nxauth-showcase--register">
        <div className="nxauth-showcase-glow nxauth-showcase-glow--teal" aria-hidden />

        {/* logo */}
        <div className="nxauth-logo">
          <span className="nxauth-logo-icon">N</span>
          <span className="nxauth-logo-word">Nexus</span>
        </div>

        <div className="nxauth-showcase-body">
          <h1 className="nxauth-showcase-headline">
            Where great<br />work begins.
          </h1>
          <p className="nxauth-showcase-sub">
            Set up your workspace in seconds. Your team will be
            shipping better work before the end of the day.
          </p>

          <ul className="nxauth-features">
            {PERKS.map((p) => (
              <li key={p} className="nxauth-feature-row">
                <span className="nxauth-feature-check" aria-hidden>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#e0176a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>

        {/* social proof chip */}
        <div className="nxauth-testimonial">
          <div className="nxauth-testimonial-avatars">
            {["A","B","C","D"].map((l, i) => (
              <span key={i} className="nxauth-testimonial-avatar nxauth-testimonial-avatar--stack">{l}</span>
            ))}
          </div>
          <div className="nxauth-testimonial-content">
            <p className="nxauth-testimonial-quote" style={{ marginBottom: "2px" }}>
              Join <strong style={{ color: "#e2e2e9" }}>10,000+ teams</strong> already using Nexus
            </p>
            <span className="nxauth-testimonial-name">Free to start · No card needed</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT FORM PANEL ── */}
      <div className="nxauth-form-panel">
        <div className="nxauth-form-wrap">

          <span className="nxauth-eyebrow">Get started free</span>
          <h2 className="nxauth-form-title">Create your account</h2>
          <p className="nxauth-form-sub">
            Already have an account?{" "}
            <Link to="/login" className="nxauth-inline-link">Sign in →</Link>
          </p>

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

          <div className="nxauth-divider"><span>or sign up with email</span></div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="nxauth-field">
              <label className="nxauth-label" htmlFor="reg-name">Full name</label>
              <input
                id="reg-name"
                type="text"
                className="nxauth-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                autoComplete="name"
                required
              />
            </div>

            <div className="nxauth-field">
              <label className="nxauth-label" htmlFor="reg-email">Work email</label>
              <input
                id="reg-email"
                type="email"
                className="nxauth-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="nxauth-field">
              <label className="nxauth-label" htmlFor="reg-password">Password</label>
              <div className="nxauth-input-wrap">
                <input
                  id="reg-password"
                  type={showPw ? "text" : "password"}
                  className="nxauth-input nxauth-input--pw"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  autoComplete="new-password"
                  required
                  minLength={6}
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

              {/* password strength */}
              {password.length > 0 && (
                <div className="nxauth-pw-strength">
                  <div className="nxauth-pw-bars">
                    {[1, 2, 3].map((n) => (
                      <span
                        key={n}
                        className="nxauth-pw-bar"
                        style={{ background: strength >= n ? strengthColor : "var(--lp-s-highest)" }}
                      />
                    ))}
                  </div>
                  <span style={{ color: strengthColor, fontSize: "0.75rem", fontWeight: 600 }}>
                    {strengthLabel}
                  </span>
                </div>
              )}
            </div>

            <button type="submit" className="nxauth-submit-btn" disabled={loading}>
              {loading ? <span className="nxauth-spinner" aria-hidden /> : null}
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="nxauth-secure-note">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            By signing up you agree to our{" "}
            <span style={{ color: "#a0a0b0", textDecoration: "underline", cursor: "pointer" }}>Terms</span>
            {" & "}
            <span style={{ color: "#a0a0b0", textDecoration: "underline", cursor: "pointer" }}>Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  );
}
