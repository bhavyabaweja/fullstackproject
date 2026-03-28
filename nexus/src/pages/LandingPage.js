import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

/* ─── tiny hook: detect scroll for nav shadow ─── */
function useScrolled(threshold = 10) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > threshold);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, [threshold]);
  return scrolled;
}

/* ─── animated counter ─── */
function Counter({ target, suffix = "" }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        let start = 0;
        const end = parseInt(target.replace(/\D/g, ""), 10);
        const duration = 1400;
        const step = Math.ceil(end / (duration / 16));
        const timer = setInterval(() => {
          start += step;
          if (start >= end) { setVal(end); clearInterval(timer); }
          else setVal(start);
        }, 16);
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

export default function LandingPage() {
  const navigate = useNavigate();
  const scrolled = useScrolled();

  return (
    <div className="lp-root">
      {/* ── NAVBAR ── */}
      <nav className={`lp-nav${scrolled ? " lp-nav--scrolled" : ""}`}>
        <div className="lp-nav-inner">
          <span className="lp-logo">
            <span className="lp-logo-icon">N</span>
            Nexus
          </span>

          <div className="lp-nav-links">
            <a href="#features" className="lp-nav-link">Features</a>
            <a href="#pricing" className="lp-nav-link">Pricing</a>
            <a href="#about" className="lp-nav-link">About</a>
          </div>

          <div className="lp-nav-actions">
            <button className="lp-btn-ghost" onClick={() => navigate("/login")}>Log in</button>
            <button className="lp-btn-primary" onClick={() => navigate("/register")}>Get Started</button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="lp-hero">
        {/* radial glow blobs */}
        <div className="lp-glow lp-glow--left" aria-hidden />
        <div className="lp-glow lp-glow--right" aria-hidden />

        <div className="lp-hero-inner">
          {/* left copy */}
          <div className="lp-hero-copy">
            <div className="lp-hero-badge">✦ Project management, reimagined</div>
            <h1 className="lp-hero-headline">
              Ship faster.<br />
              Stay aligned.<br />
              <span className="lp-accent">Build together.</span>
            </h1>
            <p className="lp-hero-sub">
              Nexus gives your team a single place to plan, track, and ship
              great work — from first idea to final launch.
            </p>
            <div className="lp-hero-ctas">
              <button className="lp-btn-primary lp-btn-lg" onClick={() => navigate("/register")}>
                Get Started Free
              </button>
              <a href="#features" className="lp-btn-ghost lp-btn-lg">
                See how it works ↓
              </a>
            </div>
            <p className="lp-hero-footnote">Free forever · No credit card required</p>
          </div>

          {/* right: floating kanban mock */}
          <div className="lp-hero-visual">
            <div className="lp-mock-card">
              <div className="lp-mock-header">
                <span className="lp-mock-dot lp-mock-dot--red" />
                <span className="lp-mock-dot lp-mock-dot--yellow" />
                <span className="lp-mock-dot lp-mock-dot--green" />
                <span className="lp-mock-title">Q2 Launch Sprint</span>
              </div>

              <div className="lp-mock-board">
                {/* To Do */}
                <div className="lp-mock-col">
                  <div className="lp-mock-col-head">
                    <span className="lp-mock-col-dot" style={{ background: "#6b7280" }} />
                    To Do
                    <span className="lp-mock-col-count">3</span>
                  </div>
                  <div className="lp-mock-task lp-mock-task--gray">Design system tokens</div>
                  <div className="lp-mock-task lp-mock-task--gray">Write API docs</div>
                  <div className="lp-mock-task lp-mock-task--gray">Mobile breakpoints</div>
                </div>

                {/* In Progress */}
                <div className="lp-mock-col">
                  <div className="lp-mock-col-head">
                    <span className="lp-mock-col-dot" style={{ background: "#3b82f6" }} />
                    In Progress
                    <span className="lp-mock-col-count">2</span>
                  </div>
                  <div className="lp-mock-task lp-mock-task--blue">Auth flow</div>
                  <div className="lp-mock-task lp-mock-task--blue">Dashboard v2</div>
                </div>

                {/* Done */}
                <div className="lp-mock-col">
                  <div className="lp-mock-col-head">
                    <span className="lp-mock-col-dot" style={{ background: "#22c55e" }} />
                    Done
                    <span className="lp-mock-col-count">4</span>
                  </div>
                  <div className="lp-mock-task lp-mock-task--green">User research</div>
                  <div className="lp-mock-task lp-mock-task--green">Wireframes</div>
                  <div className="lp-mock-task lp-mock-task--green">DB schema</div>
                  <div className="lp-mock-task lp-mock-task--green">CI pipeline</div>
                </div>
              </div>

              {/* bottom bar */}
              <div className="lp-mock-footer">
                <div className="lp-mock-avatars">
                  {["A","B","C"].map((l, i) => (
                    <span key={i} className="lp-mock-avatar">{l}</span>
                  ))}
                </div>
                <span className="lp-mock-meta">9 tasks · 3 members</span>
              </div>
            </div>

            {/* floating stat chips */}
            <div className="lp-chip lp-chip--tl">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Sprint on track
            </div>
            <div className="lp-chip lp-chip--br">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#e0176a" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              2 tasks due today
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="lp-features" id="features">
        <div className="lp-section-inner">
          <p className="lp-section-eyebrow">Everything your team needs</p>
          <h2 className="lp-section-title">Built for how teams actually work</h2>

          <div className="lp-features-grid">
            {[
              {
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" />
                    <rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" />
                  </svg>
                ),
                title: "Kanban Boards",
                desc: "Visualise work across customisable stages. Drag, drop, and ship without the friction of spreadsheets.",
                color: "#e0176a",
              },
              {
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                ),
                title: "Team Collaboration",
                desc: "Assign tasks, mention teammates, leave comments, and keep everyone in the loop — in real time.",
                color: "#3b82f6",
              },
              {
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                    <line x1="8" y1="14" x2="8" y2="14" strokeWidth="3" strokeLinecap="round"/>
                    <line x1="12" y1="14" x2="16" y2="14" strokeWidth="1.5"/>
                    <line x1="8" y1="18" x2="8" y2="18" strokeWidth="3" strokeLinecap="round"/>
                    <line x1="12" y1="18" x2="14" y2="18" strokeWidth="1.5"/>
                  </svg>
                ),
                title: "Smart Deadlines",
                desc: "Set due dates, get calendar reminders, and spot bottlenecks before they become blockers.",
                color: "#f59e0b",
              },
              {
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                  </svg>
                ),
                title: "Progress Insights",
                desc: "Charts, velocity graphs, and completion trends that tell the full story of your team's output.",
                color: "#22c55e",
              },
              {
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                ),
                title: "Global Search",
                desc: "Find any task, project, or teammate in milliseconds with full-text search across your workspace.",
                color: "#a78bfa",
              },
              {
                icon: (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                ),
                title: "Secure by Default",
                desc: "Role-based access, JWT auth, and encrypted storage — so your work stays yours.",
                color: "#38bdf8",
              },
            ].map(({ icon, title, desc, color }, i) => (
              <div className="lp-feature-card" key={i} style={{ "--card-accent": color }}>
                <div className="lp-feature-icon" style={{ color }}>{icon}</div>
                <h3 className="lp-feature-title">{title}</h3>
                <p className="lp-feature-desc">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="lp-stats">
        <div className="lp-stats-inner">
          {[
            { value: "10000", suffix: "+", label: "Teams worldwide" },
            { value: "999", suffix: "%", label: "Uptime SLA", raw: "99.9%" },
            { value: "49", suffix: "★", label: "Average rating", raw: "4.9★" },
          ].map(({ value, suffix, label, raw }, i) => (
            <React.Fragment key={i}>
              <div className="lp-stat">
                <div className="lp-stat-number">
                  {raw ? raw : <><Counter target={value} />{suffix}</>}
                </div>
                <div className="lp-stat-label">{label}</div>
              </div>
              {i < 2 && <div className="lp-stat-divider" aria-hidden />}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="lp-how" id="about">
        <div className="lp-section-inner">
          <p className="lp-section-eyebrow">Simple by design</p>
          <h2 className="lp-section-title">Up and running in minutes</h2>

          <div className="lp-steps">
            {[
              { num: "01", title: "Create your workspace", desc: "Sign up free and invite your team. No setup headaches, no IT ticket required." },
              { num: "02", title: "Add your projects", desc: "Spin up a project board in seconds. Bring in existing tasks or start from scratch." },
              { num: "03", title: "Ship together", desc: "Assign tasks, track progress, hit deadlines — all in one fluid workspace." },
            ].map(({ num, title, desc }, i) => (
              <div className="lp-step" key={i}>
                <div className="lp-step-num">{num}</div>
                <h3 className="lp-step-title">{title}</h3>
                <p className="lp-step-desc">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="lp-cta" id="pricing">
        <div className="lp-cta-card">
          <div className="lp-cta-glow" aria-hidden />
          <p className="lp-cta-eyebrow">Start today. Stay forever.</p>
          <h2 className="lp-cta-headline">Ready to get organised?</h2>
          <p className="lp-cta-sub">
            Join thousands of teams who ship better work with Nexus.
            Free forever, no credit card needed.
          </p>
          <div className="lp-cta-actions">
            <button className="lp-btn-primary lp-btn-xl" onClick={() => navigate("/register")}>
              Start for free →
            </button>
            <button className="lp-btn-ghost lp-btn-lg" onClick={() => navigate("/login")}>
              Already have an account?
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <span className="lp-logo lp-logo--sm">
            <span className="lp-logo-icon">N</span>
            Nexus
          </span>
          <p className="lp-footer-copy">© {new Date().getFullYear()} Nexus. Built with care.</p>
          <div className="lp-footer-links">
            <a href="#features" className="lp-footer-link">Features</a>
            <a href="#pricing" className="lp-footer-link">Pricing</a>
            <button className="lp-footer-link" onClick={() => navigate("/login")}>Login</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
