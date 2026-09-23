const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Idea = require('../models/Idea');

const JWT_SECRET = "startup_validator_secret_2024";

// Middleware to verify token
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: "No token" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};

// Save idea
router.post('/save', auth, async (req, res) => {
  try {
    const idea = await Idea.create({ userId: req.userId, ...req.body });
    res.json(idea);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get history
router.get('/history', auth, async (req, res) => {
  try {
    const ideas = await Idea.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(ideas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single idea by ID (shareable report)
router.get('/:id', async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id).select('-userId');
    if (!idea) return res.status(404).json({ error: "Report not found" });
    res.json(idea);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;