const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

router.get("/", (req, res) => {
  try {
    const games = JSON.parse(fs.readFileSync(path.join(__dirname, "../data/games.json"), "utf-8"));
    const search = (req.query.search || "").toLowerCase().trim();
    const filtered = search
      ? games.filter(g =>
          (g.title || "").toLowerCase().includes(search) ||
          (g.description || "").toLowerCase().includes(search)
        )
      : games;
    res.json(filtered);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load games data" });
  }
});

module.exports = router;
