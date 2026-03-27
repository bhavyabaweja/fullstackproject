const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Groq = require("groq-sdk");

// POST /api/ai/generate-tasks
// Body: { description: string }
// Returns: { tasks: [{ title, description, priority }] }
router.post("/generate-tasks", auth, async (req, res) => {
  const { description } = req.body;

  if (!process.env.GROQ_API_KEY) {
    return res.status(503).json({ error: "AI features are not configured on this server." });
  }

  if (!description || description.trim().length < 5) {
    return res.status(400).json({ error: "Please provide a description (at least 5 characters)." });
  }

  const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const prompt = `You are a project management assistant. Break down the following feature, epic, or goal into actionable development tasks.

Return ONLY a valid JSON array — no explanation, no markdown, no code blocks. Each object must have exactly these fields:
- "title": string (concise task name, max 80 characters)
- "description": string (1-2 sentences explaining what needs to be done)
- "priority": one of "High", "Medium", or "Low"

Generate between 3 and 8 tasks. Prioritize based on dependency order (foundational tasks first).

Feature/Goal: ${description.trim()}`;

  try {
    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    });

    const text = completion.choices[0]?.message?.content || "";

    // Extract JSON array from response (handles any stray text)
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return res.status(500).json({ error: "AI returned an unexpected format. Try again." });
    }

    const tasks = JSON.parse(jsonMatch[0]);

    // Validate structure
    const valid = tasks.every(
      (t) => typeof t.title === "string" && typeof t.description === "string" &&
             ["High", "Medium", "Low"].includes(t.priority)
    );
    if (!valid) {
      return res.status(500).json({ error: "AI returned malformed tasks. Try again." });
    }

    res.json({ tasks });
  } catch (err) {
    console.error("[ai] generate-tasks error:", err.message);
    if (err.status === 401) {
      return res.status(503).json({ error: "Invalid AI API key." });
    }
    res.status(500).json({ error: "Failed to generate tasks. Please try again." });
  }
});

module.exports = router;
