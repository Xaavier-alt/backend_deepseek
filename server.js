require("dns").setDefaultResultOrder("ipv4first");
require("dotenv").config();

const express = require("express");
const app = express();
const { MongoClient, ServerApiVersion } = require("mongodb");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");

// --- Security (helmet + CSP friendly to our inline CSS/JS & fonts/images) ---
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https:", "data:"],
        fontSrc: ["'self'", "https:", "data:"],
        imgSrc: ["'self'", "data:", "https://images.unsplash.com"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'self'"],
        baseUri: ["'self'"]
      },
    },
    crossOriginEmbedderPolicy: false, // keep things simple for dev
  })
);

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

// --- CORS (allow your dev frontend(s)) ---
const allowedOrigins = process.env.FRONTEND_URLS ? process.env.FRONTEND_URLS.split(",") : [];
const corsOptions = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error("Not allowed by CORS"));
  },
};
app.use(cors(corsOptions));

// --- JSON parsing & static assets ---
app.use(express.json());
app.use("/images", express.static(path.join(__dirname, "public/images")));

// --- MongoDB ---
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
});
let db, playersCollection;

async function connectDB() {
  try {
    await client.connect();
    db = client.db("uvotake");
    playersCollection = db.collection("players");
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
}
connectDB();

// --- Routes: Players ---
app.post("/api/player", async (req, res) => {
  try {
    const { username, email } = req.body || {};
    if (!username || !email) return res.status(400).json({ error: "username and email are required" });
    const result = await playersCollection.insertOne({
      username,
      email,
      createdAt: new Date(),
      // score is optional; you can extend later
    });
    res.status(201).json({ ok: true, id: result.insertedId });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/api/players", async (_req, res) => {
  try {
    // You can sort by score descending later; for now newest first
    const players = await playersCollection.find().sort({ createdAt: -1 }).limit(100).toArray();
    res.json(players);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Routes: Newsletter ---
app.post("/api/newsletter", async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ error: "Email is required" });
    await db.collection("newsletter").insertOne({ email, subscribedAt: new Date() });
    res.status(201).json({ message: "Subscribed!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Data routes (JSON files) ---
const gameRoutes = require("./routes/games");
const techRoutes = require("./routes/technology");
app.use("/api/games", gameRoutes);
app.use("/api/technology", techRoutes);

// --- Serve SPA ---
const frontendPath = path.join(__dirname, "public");
app.use(express.static(frontendPath));
// For any non-API route, serve index.html (SPA fallback)
app.get("*", (req, res) => {
  if (req.path.startsWith("/api")) return res.status(404).json({ error: "API route not found" });
  res.sendFile(path.join(frontendPath, "index.html"));
});

// --- Start ---
app.listen(PORT, () => {
  console.log(`🚀 XGI running in ${NODE_ENV} at http://localhost:${PORT}`);
});
