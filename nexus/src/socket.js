import { io } from "socket.io-client";

// If REACT_APP_BACKEND_URL is set, use it for both API and Socket.IO.
// Otherwise fallback to localhost in dev and same-origin in production/ngrok.
const configuredBackend = process.env.REACT_APP_BACKEND_URL?.trim();
const SOCKET_URL =
  configuredBackend
    ? configuredBackend
    : process.env.NODE_ENV === "development"
    ? "http://localhost:5000"
    : window.location.origin;

const socket = io(SOCKET_URL, { autoConnect: true });

export default socket;
