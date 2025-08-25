const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// GET /api/games
router.get("/", (req, res) => {
  try {
    const games = fs.readFileSync(
      path.join(__dirname, "../data/games.json"),
      "utf-8"
    );
    res.json(JSON.parse(games));
  } catch (err) {
    res.status(500).json({ error: "Failed to load games data" });
  }
});

module.exports = router;
