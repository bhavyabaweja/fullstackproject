import axios from "axios";

// Empty string = relative URLs (same-origin: works with dev proxy and when served from Express)
// Set REACT_APP_BACKEND_URL only if you need to point to a separate server
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL ?? "";

export const GOOGLE_AUTH_URL = `${BACKEND_URL}/api/auth/google`;

const API = axios.create({
  baseURL: `${BACKEND_URL}/api`,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("nexus_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Bypass ngrok browser warning interstitial
  config.headers["ngrok-skip-browser-warning"] = "true";
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem("nexus_token");
      localStorage.removeItem("nexus_user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Projects
export const getProjects = () => API.get("/projects");
export const addProject = (data) => API.post("/projects", data);
export const updateProject = (id, data) => API.put(`/projects/${id}`, data);
export const deleteProject = (id) => API.delete(`/projects/${id}`);

// Tasks
export const getTasks = (projectId) => API.get(`/tasks/${projectId}`);
export const addTask = (data) => API.post("/tasks", data);
export const updateTask = (id, data) => API.put(`/tasks/${id}`, data);
export const deleteTask = (id) => API.delete(`/tasks/${id}`);

// Subtasks
export const updateSubtasks = (taskId, subtasks) => API.patch(`/tasks/${taskId}/subtasks`, { subtasks });

// Time Tracking
export const logTime = (taskId, data) => API.post(`/tasks/${taskId}/time`, data);
export const getTimeEntries = (taskId) => API.get(`/tasks/${taskId}/time`);

// Dependencies (blockedBy saved via updateTask)
export const updateBlockedBy = (taskId, blockedByIds) => API.put(`/tasks/${taskId}`, { blockedBy: blockedByIds });

// Auth
export const loginUser = (data) => API.post("/auth/login", data);
export const registerUser = (data) => API.post("/auth/register", data);

export const getAllTasks = () => API.get("/tasks/all");

// Members
export const getMembers = (projectId) => API.get(`/projects/${projectId}/members`);
export const inviteMember = (projectId, email) => API.post(`/projects/${projectId}/invite`, { email });
export const removeMember = (projectId, userId) => API.delete(`/projects/${projectId}/members/${userId}`);

// Comments
export const getComments = (taskId) => API.get(`/comments/${taskId}`);
export const addComment = (data) => API.post("/comments", data);

// Activity
export const getActivityLog = (taskId) => API.get(`/activity/task/${taskId}`);

// Search
export const searchAll = (q) => API.get(`/search?q=${encodeURIComponent(q)}`);

// AI
export const generateTasks = (description) => API.post("/ai/generate-tasks", { description });
