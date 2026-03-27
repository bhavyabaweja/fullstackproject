const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

const router = express.Router();
const FRONTEND_URL = process.env.FRONTEND_URL || process.env.APP_URL || "http://localhost:3000";
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";
const JWT_SECRET = process.env.JWT_SECRET || "SECRETKEY";

// ── Google OAuth Strategy (only if credentials are set) ───────────────────────
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${BACKEND_URL}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        // 1. Find by googleId
        let user = await User.findOne({ googleId: profile.id });
        // 2. Link to existing email account
        if (!user && email) {
          user = await User.findOne({ email });
          if (user) { user.googleId = profile.id; await user.save(); }
        }
        // 3. Create new user
        if (!user) {
          user = await User.create({ name: profile.displayName, email, googleId: profile.id });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  ));
  passport.serializeUser((user, done) => done(null, user._id.toString()));
  passport.deserializeUser(async (id, done) => {
    try { done(null, await User.findById(id)); } catch (e) { done(e); }
  });
}

// Redirect to Google consent screen
router.get("/google", (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    return res.status(503).json({ error: "Google OAuth is not configured." });
  }
  next();
}, passport.authenticate("google", { scope: ["profile", "email"] }));

// Google callback — issues JWT, redirects to frontend
router.get("/google/callback",
  passport.authenticate("google", { failureRedirect: `${FRONTEND_URL}/login?error=google_failed` }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id }, JWT_SECRET, { expiresIn: "1d" });
    const user = { _id: req.user._id, name: req.user.name, email: req.user.email };
    const encoded = encodeURIComponent(JSON.stringify(user));
    res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}&user=${encoded}`);
  }
);

// ── Email / Password Routes ───────────────────────────────────────────────────

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    res.json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: "User already exists" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    if (!user.password) {
      return res.status(400).json({ error: "This account uses Google sign-in. Please continue with Google." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Wrong password" });

    const token = jwt.sign(
      { id: user._id },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

module.exports = router;
