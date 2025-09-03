require("dns").setDefaultResultOrder("ipv4first");
require("dotenv").config();

const express = require("express");
const app = express();
const mongoose = require("mongoose"); // Use mongoose instead of mongodb
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
    crossOriginEmbedderPolicy: false,
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

// --- MongoDB Connection with Mongoose ---
const uri = process.env.MONGODB_URI;

// Player schema
const playerSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Player = mongoose.model('Player', playerSchema);

// Newsletter schema
const newsletterSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  }
});

const Newsletter = mongoose.model('Newsletter', newsletterSchema);

// Connect to MongoDB
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("✅ MongoDB connected successfully");
})
.catch((err) => {
  console.error("❌ MongoDB connection error:", err);
  // Don't exit in production, allow server to run without DB
  if (NODE_ENV === "development") {
    process.exit(1);
  }
});

// --- Routes: Players ---
app.post("/api/player", async (req, res) => {
  try {
    const { username, email } = req.body || {};
    if (!username || !email) {
      return res.status(400).json({ error: "username and email are required" });
    }
    
    const player = new Player({ username, email });
    const result = await player.save();
    
    res.status(201).json({ ok: true, id: result._id });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "Email already exists" });
    }
    res.status(400).json({ error: err.message });
  }
});

app.get("/api/players", async (_req, res) => {
  try {
    const players = await Player.find().sort({ createdAt: -1 }).limit(100);
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
    
    const subscriber = new Newsletter({ email });
    await subscriber.save();
    
    res.status(201).json({ message: "Subscribed!" });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "Email already subscribed" });
    }
    res.status(500).json({ error: err.message });
  }
});

// --- Data routes (JSON files) ---
const gameRoutes = require("./routes/games");
const techRoutes = require("./routes/technology");
app.use("/api/games", gameRoutes);
app.use("/api/technology", techRoutes);

// Health check endpoint
app.get("/api/health", async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  res.json({ 
    status: "ok", 
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// --- Serve SPA ---
const frontendPath = path.join(__dirname, "public");
app.use(express.static(frontendPath));

// For any non-API route, serve index.html (SPA fallback)
app.get("*", (req, res) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ error: "API route not found" });
  }
  res.sendFile(path.join(frontendPath, "index.html"));
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`🚀 XGI running in ${NODE_ENV} mode at http://localhost:${PORT}`);
});