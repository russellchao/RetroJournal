import express from "express";
import Entry from "../models/Entry.js";
import Sentiment from "sentiment";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();
const sentiment = new Sentiment();

// Protect all routes with authentication
router.use(requireAuth);

// Create new journal entry (POST)
router.post("/", async (req, res) => {
  try {
    const { title, content, userId } = req.body;
    const result = sentiment.analyze(content);
    const mood =
      result.score > 1 ? "positive" :
      result.score < -1 ? "negative" : 
      "neutral";

    const newEntry = new Entry({
      userId: req.auth.userId,
      title: req.body.title,
      content: req.body.content,
      mood,
      sentimentScore: result.score,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await newEntry.save();
    res.status(201).json(newEntry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Read all journal entries (GET) 
router.get("/", async (req, res) => {
  try {
    const entries = await Entry.find({ userId: req.auth.userId }).sort({ createdAt: -1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Update existing journal entry (PUT)
router.put("/:id", async (req, res) => {
  try {
    const { title, content } = req.body;
    const result = sentiment.analyze(content);
    const mood =
      result.score > 1 ? "positive" :
      result.score < -1 ? "negative" : 
      "neutral";

    const updatedEntry = await Entry.findByIdAndUpdate(
      req.params.id,
      { 
        title, 
        content, 
        mood, 
        sentimentScore: result.score, 
        updatedAt: new Date() 
      },
      { new: true }
    );
    res.json(updatedEntry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete existing journal entry (DELETE)
router.delete("/:id", async (req, res) => {
  try {
    await Entry.findByIdAndDelete(req.params.id);
    res.json({ message: "Entry deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router; 