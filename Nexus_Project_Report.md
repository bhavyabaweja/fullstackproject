# Nexus — Project Report

---

## 1. Title of the Project

**Nexus: A Collaborative Project & Task Management Web Application**

---

## 2. Project Abstract

Nexus is a full-stack collaborative project management application built on the MERN stack (MongoDB, Express.js, React, Node.js). It is designed to help individuals and teams organize work efficiently through projects, tasks, and real-time collaboration features.

**Purpose:** To provide a clean, intuitive workspace where users can create projects, break them into tasks, track progress visually via a Kanban board, and collaborate with team members — all from a single web interface.

**Key Functionalities:**
- User registration and login with email/password, and Google OAuth 2.0 sign-in
- Create, update, and delete projects with status tracking
- Add tasks with priority levels (High / Medium / Low), due dates, and assignees
- Drag-and-drop Kanban board with three columns: Pending, In Progress, Completed
- AI-powered task generation using Groq (Llama 3.3 70B) from a plain-language project description
- Invite team members to projects via email
- Real-time task and comment updates using Socket.io
- Rich task management: labels, subtasks/checklists, time tracking, task dependencies
- Global search across tasks and projects
- Calendar view of tasks by due date
- Project statistics chart showing task completion and priority breakdown
- Activity log tracking all changes to a task
- Email notifications for invitations and task assignments (Gmail SMTP)
- Professional UI built with the Inter font, a modern design system, and a dark sidebar
- Deployment-ready via ngrok with a single Express server serving the React build

**Technologies Used:**

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router 7, Bootstrap 5, Reactstrap, Axios |
| Backend | Node.js, Express 5 |
| Database | MongoDB (Mongoose 9 ODM) |
| Authentication | JWT (JSON Web Tokens), Passport.js (Google OAuth 2.0) |
| Real-time | Socket.io |
| AI | Groq API (Llama 3.3 70B) |
| Email | Nodemailer (Gmail SMTP) |
| Drag & Drop | @hello-pangea/dnd |
| Charts | Recharts |
| Calendar | react-big-calendar |
| UI / Font | Inter (Google Fonts), CSS custom properties design system |

---

## 3. High-Level Design

### System Architecture

```
┌────────────────────────────────────────────────────────┐
│                        CLIENT                          │
│                    React 19 (SPA)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │
│  │  Pages   │  │Components│  │ Context  │  │  API   │  │
│  │Dashboard │  │Sidebar   │  │AuthCtx   │  │Services│  │
│  │Projects  │  │Kanban    │  └──────────┘  │(Axios) │  │
│  │Calendar  │  │TaskCard  │                └────────┘  │
│  │Search    │  │AIModal   │                            │
│  └──────────┘  └──────────┘                            │
└────────────────────────┬───────────────────────────────┘
                         │ HTTP / WebSocket
┌────────────────────────▼───────────────────────────────┐
│                     EXPRESS SERVER                     │
│                  Node.js + Express 5                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │
│  │  /api/   │  │  Auth    │  │ Socket   │  │ Static │  │
│  │ projects │  │Middleware│  │  .io     │  │ Files  │  │
│  │  tasks   │  │  (JWT)   │  │(real-time│  │(React  │  │
│  │ comments │  │          │  │ events)  │  │ Build) │  │
│  │   ai     │  │ Passport │  └──────────┘  └────────┘  │
│  └──────────┘  └──────────┘                            │
└────────────────────────┬───────────────────────────────┘
                         │
        ┌────────────────┼──────────────────┐
        ▼                ▼                  ▼
┌──────────────┐  ┌─────────────┐  ┌──────────────┐
│   MongoDB    │  │  Groq API   │  │  Gmail SMTP  │
│  (Database)  │  │ (AI Tasks)  │  │   (Emails)   │
└──────────────┘  └─────────────┘  └──────────────┘
```

### Database Schema

```
User              Project           Task
─────             ───────           ────
_id               _id               _id
name              name              title
email             description       description
password(hash)    status            projectId ──► Project
googleId          userId ──► User   assigneeId ──► User
                                    status
ProjectMember     Comment           priority
─────────────     ───────           dueDate
projectId         taskId ──► Task   labels[]
userId ──► User   userId ──► User   subtasks[]
role              text              blockedBy[] ──► Task
                                    timeEntries[]

ActivityLog
───────────
taskId ──► Task
projectId ──► Project
userId ──► User
action (task_created | status_changed | assigned | commented | ...)
meta (stores before/after values)
```

### Authentication Flow

```
Email/Password:   Register/Login ──► bcrypt hash ──► JWT issued ──► stored in localStorage
Google OAuth:     /auth/google ──► Google Consent ──► /auth/google/callback ──► JWT issued ──► /auth/callback page
All API calls:    Axios interceptor attaches Bearer token ──► auth middleware validates ──► req.userId set
```

### Real-time Event Flow (Socket.io)

```
Client opens project ──► socket.emit("join:project", projectId) ──► server.join room

Task created/updated/deleted ──► server emits "task:created / task:updated / task:deleted" ──► all clients in room update state
Comment added ──► server emits "comment:added" ──► all clients in room append comment live
Task assigned ──► server sends assignment email via Gmail SMTP (fire-and-forget)
```

---

## 4. Components / Concepts Used

| Component / Concept | File | Purpose |
|---|---|---|
| AuthContext | `src/context/AuthContext.js` | Global auth state (token, user, login, logout) |
| PrivateRoute | `src/App.js` | Redirects unauthenticated users to /login |
| Sidebar | `src/components/Sidebar.js` | Fixed dark left navigation with search and user section |
| KanbanBoard | `src/components/KanbanBoard.js` | Drag-and-drop task board (3 columns) with Socket.io sync |
| TaskCard | `src/components/TaskCard.js` | Draggable task card with priority, labels, assignee, subtask bar |
| TaskDetailModal | `src/components/TaskDetailModal.js` | Edit/delete task; tabs for labels, subtasks, time tracking, dependencies, comments, activity log |
| AITaskModal | `src/components/AITaskModal.js` | AI task generation UI using Groq API |
| MembersModal | `src/components/MembersModal.js` | View, invite, and remove project members |
| ProjectStatsChart | `src/components/ProjectStatsChart.js` | Donut + bar chart of task status and priority breakdown (Recharts) |
| FilterBar | `src/components/FilterBar.js` | Filter tasks by title, priority, assignee, and label |
| SkeletonLoader | `src/components/SkeletonLoader.js` | Shimmer loading placeholders for improved perceived performance |
| Dashboard | `src/pages/Dashboard.js` | Stat cards with icons, overdue/upcoming widgets, recent projects table |
| Projects | `src/pages/Projects.js` | Project card grid with create project modal |
| ProjectDetails | `src/pages/ProjectDetails.js` | Kanban board, task form, stats chart, members, AI modal, filter bar |
| ProjectSettings | `src/pages/ProjectSettings.js` | Edit project metadata; danger zone with delete |
| Calendar | `src/pages/Calendar.js` | Monthly/weekly calendar of tasks by due date (react-big-calendar) |
| SearchPage | `src/pages/SearchPage.js` | Live global search across projects and tasks |
| AuthCallback | `src/pages/AuthCallback.js` | Handles Google OAuth redirect, stores JWT in localStorage |
| api.js | `src/services/api.js` | Axios instance with JWT interceptor and ngrok header; all API functions |
| socket.js | `src/socket.js` | Socket.io client; auto-detects URL (localhost in dev, same origin in prod) |
| JWT Authentication | `middleware/auth.js` | Verifies Bearer token on every protected route; sets req.userId |
| Google OAuth | `routes/authRoutes.js` | Passport.js GoogleStrategy; issues JWT on success; links Google accounts to existing emails |
| AI Route | `routes/ai.js` | Calls Groq API (Llama 3.3 70B); returns structured task list as JSON |
| Activity Log | `routes/activity.js` | Records every task change with actor, action type, and before/after meta |
| Mailer | `mailer.js` | Nodemailer Gmail SMTP for project invite and task assignment emails (fire-and-forget) |
| Socket.io Server | `server.js` | Manages project rooms; broadcasts task/comment events to all connected clients |
| @hello-pangea/dnd | KanbanBoard | Accessible drag-and-drop across Kanban columns |
| react-big-calendar | Calendar.js | Full calendar view with month/week/agenda navigation |
| Recharts | ProjectStatsChart | Donut and bar chart visualization |
| bcryptjs | authRoutes.js | Password hashing with salt before storing in database |
| date-fns | Dashboard, TaskCard | Date arithmetic for overdue/upcoming calculations |
| Mongoose populate | Multiple routes | Joins referenced documents (User, Task, Project) in a single query |
| CSS Custom Properties | App.css | Design token system (colors, shadows, radii, transitions) used across all components |
| CORS + dotenv | server.js | Environment-based origin control for local dev and ngrok deployment |

---

## 5. Screenshots and Descriptions

> **Note:** Replace the descriptions below with actual screenshots from the running application.

**Screen 1 — Login Page**
The authentication page features a deep indigo-to-dark gradient background with subtle radial color glows. A centered white card contains the Nexus logo (gradient text), email/password fields, and a "Continue with Google" button. Google OAuth 2.0 uses Passport.js and redirects through a callback page that stores the JWT.

**Screen 2 — Dashboard**
Four stat cards at the top each show a colored icon (folder, list, checkmark, clock) alongside a metric: Projects, Total Tasks, Completed, and In Progress. Below is a two-column layout: Overdue Tasks (with days-overdue badges) and Due This Week (with today/tomorrow chips). A Recent Projects table occupies the bottom section.

**Screen 3 — Projects Page**
A responsive card grid displays all user projects. Each card shows the project name, a gradient top bar on hover, status badge with colored dot, and task count. A "New Project" button opens a modal form.

**Screen 4 — Project Details / Kanban Board**
The main workspace. A three-column Kanban board (Pending | In Progress | Completed) with draggable task cards. Each column has a colored top border and a card count badge. Cards show priority-based left border colors (red/amber/green). An add-task form sits above the board. Header buttons open the Members modal, Stats chart, and AI Task Generator.

**Screen 5 — Task Detail Modal**
Clicking any task card opens a modal with editable fields: title, description, priority, status, due date, and assignee. Below are sections for Labels (color swatches), Subtasks/Checklist (with progress bar), Time Tracking (log hours with notes), Task Dependencies (blocked-by checkboxes), Comments (real-time thread), and Activity Log (full history of all changes).

**Screen 6 — AI Task Generator Modal**
A modal with a textarea where the user describes a project goal. Clicking "Generate" calls the Groq API (Llama 3.3 70B) and returns 3–8 suggested tasks with title, description, and priority. Each task has a checkbox. Clicking "Add Selected Tasks" saves them to the project in parallel API calls.

**Screen 7 — Calendar View**
A full monthly calendar built with react-big-calendar. Tasks with due dates appear as color-coded events (High=red, Medium=orange, Low=green, Completed=gray). Supports month, week, and agenda views. Clicking an event opens the TaskDetailModal.

**Screen 8 — Search Page**
A search bar that queries the backend. Results are grouped into Projects and Tasks sections. Each result shows name, status/priority badge, and navigates to the relevant project on click.

---

## 6. Details of Individual Contributions

This project was designed, developed, and tested entirely by a single developer.

| Area | Contribution |
|---|---|
| Project Architecture | Designed the full MERN stack structure, REST API layout, and React component hierarchy |
| Backend Development | Built all Express routes (auth, projects, tasks, comments, activity, search, AI), Mongoose models, and JWT middleware |
| Frontend Development | Built all React pages and components including Kanban, modals, sidebar, dashboard, calendar, and search |
| Authentication | Implemented JWT-based auth and Google OAuth 2.0 using Passport.js with account linking for existing email users |
| AI Integration | Integrated Groq API (Llama 3.3 70B) for intelligent task generation from natural language project descriptions |
| Real-time Features | Set up Socket.io with project-scoped rooms for live task updates and comment threads |
| Email System | Configured Nodemailer with Gmail SMTP App Passwords for project invite and task assignment emails |
| Advanced Task Features | Implemented labels, subtask checklists with progress tracking, time logging, and task dependency (blocked-by) system |
| UI/UX Design | Designed a professional design system in App.css using CSS custom properties (Inter font, dark sidebar, layered shadows, gradient accents, pill badges, priority-colored task cards) |
| Deployment | Configured ngrok-based deployment with Express serving the React production build on a single port, with dynamic socket URL detection based on NODE_ENV |
| Testing & Debugging | End-to-end testing of all features including OAuth flow, drag-and-drop, AI generation, Socket.io real-time sync, and email delivery |

---

## 7. Conclusion

Nexus successfully delivers a fully functional, production-ready collaborative project management application built on the MERN stack. The application demonstrates a wide range of modern web development concepts including component-based frontend architecture, RESTful API design, token-based authentication, OAuth integration, real-time communication via WebSockets, AI integration, and transactional email.

The Kanban-based task management system with drag-and-drop interaction provides an intuitive workflow for tracking progress. Tasks support rich metadata — labels, subtasks, time entries, and dependency chains — making Nexus suitable for real project workflows rather than just a demo application. The AI task generation feature, powered by Groq's Llama 3.3 70B model, adds genuine utility by helping users decompose project goals into actionable tasks instantly.

The UI was built with a professional design system: the Inter typeface, a slate-based dark sidebar, CSS custom property tokens for consistent spacing and color, gradient accents, layered shadows, and pill-shaped status badges — resulting in an interface comparable to commercial tools like Linear or Jira.

The application is deployed via ngrok with Express serving the React build on a single URL, eliminating CORS complexity and making it easy to share with real users. Socket.io uses environment-aware URL detection so the same codebase works in local development and production without configuration changes.

Overall, Nexus demonstrates how a solo developer can build a feature-rich, market-viable web application by combining established technologies (MERN stack) with modern capabilities (AI, OAuth, real-time collaboration) in a clean, well-architected system.

---

*Report prepared by: [Your Name]*
*Course: [Course Name]*
*Date: March 2026*
