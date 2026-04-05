require('dotenv').config();
const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/loopi';
const IS_PRODUCTION = process.env.NODE_ENV === "production";

if (IS_PRODUCTION && !process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET is required in production");
}
if (IS_PRODUCTION) {
  // Render/Heroku-style proxy so secure cookies work correctly behind TLS terminators.
  app.set("trust proxy", 1);
}

// Allowed frontend origins — comma-separated in CORS_ORIGIN env var
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:3000")
  .split(",")
  .map(s => s.trim().replace(/\/+$/, ""))
  .filter(Boolean);

const corsOptions = {
  origin: (origin, cb) => {
    // Allow non-browser clients (no Origin), but require exact allowlist match for browsers.
    if (!origin) return cb(null, true);
    const normalizedOrigin = origin.replace(/\/+$/, "");
    if (allowedOrigins.includes(normalizedOrigin)) return cb(null, true);
    console.error(`[cors] blocked origin: "${origin}" | allowed: ${JSON.stringify(allowedOrigins)}`);
    cb(new Error("Not allowed by CORS"));
  },
  credentials: true,
};

// Socket.io
const io = new Server(httpServer, {
  cors: { origin: allowedOrigins, methods: ["GET", "POST"], credentials: true }
});

io.on("connection", (socket) => {
  socket.on("join:project", (projectId) => {
    socket.join(`project:${projectId}`);
  });
});

// Expose io to route handlers
app.set("io", io);

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());

// Session — only used during the OAuth handshake (not for app auth, which uses JWT)
app.use(session({
  secret: process.env.SESSION_SECRET || "nexus-oauth-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 5 * 60 * 1000, // 5 minutes — just enough for the OAuth flow
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: IS_PRODUCTION ? "none" : "lax",
  },
}));
app.use(passport.initialize());
app.use(passport.session());

// MongoDB connection
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/activity', require('./routes/activity'));
app.use('/api/search', require('./routes/search'));
app.use('/api/ai', require('./routes/ai'));

// Serve React build only when it exists (single-host/ngrok mode)
const buildPath = path.join(__dirname, '../nexus/build');
if (fs.existsSync(path.join(buildPath, 'index.html'))) {
  app.use(express.static(buildPath));
  app.use((_req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

// Start server
httpServer.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
