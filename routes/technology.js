const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// GET /api/technology
router.get("/", (req, res) => {
  try {
    const tech = fs.readFileSync(
      path.join(__dirname, "../data/technology.json"),
      "utf-8"
    );
    res.json(JSON.parse(tech));
  } catch (err) {
    res.status(500).json({ error: "Failed to load technology data" });
  }
});

module.exports = router;
