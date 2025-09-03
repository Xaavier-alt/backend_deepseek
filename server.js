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

// --- MongoDB Connection (Version 4.17.2 - Stable) ---
const uri = process.env.MONGODB_URI;
let db, playersCollection, client;

async function connectDB() {
  try {
    if (!uri) {
      throw new Error("MONGODB_URI environment variable is not defined");
    }

    client = new MongoClient(uri, {
      serverApi: { 
        version: ServerApiVersion.v1, 
        strict: true, 
        deprecationErrors: true 
      }
    });

    await client.connect();
    
    // Verify connection
    await client.db("admin").command({ ping: 1 });
    
    db = client.db("uvotake");
    playersCollection = db.collection("players");
    
    console.log("✅ MongoDB connected successfully");
    
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    
    // Don't exit process in production, allow the server to run without DB
    if (NODE_ENV === "development") {
      process.exit(1);
    }
  }
}

// Connect to MongoDB
connectDB().catch(console.error);

// Graceful shutdown
process.on('SIGINT', async () => {
  if (client) {
    await client.close();
    console.log('MongoDB connection closed');
  }
  process.exit(0);
});

// --- Routes: Players ---
app.post("/api/player", async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (!playersCollection) {
      return res.status(503).json({ error: "Database not available" });
    }
    
    const { username, email } = req.body || {};
    if (!username || !email) {
      return res.status(400).json({ error: "username and email are required" });
    }
    
    const result = await playersCollection.insertOne({
      username,
      email,
      createdAt: new Date(),
    });
    
    res.status(201).json({ ok: true, id: result.insertedId });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "Email already exists" });
    }
    res.status(400).json({ error: err.message });
  }
});

app.get("/api/players", async (_req, res) => {
  try {
    // Check if MongoDB is connected
    if (!playersCollection) {
      return res.status(503).json({ error: "Database not available" });
    }
    
    const players = await playersCollection.find().sort({ createdAt: -1 }).limit(100).toArray();
    res.json(players);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Routes: Newsletter ---
app.post("/api/newsletter", async (req, res) => {
  try {
    // Check if MongoDB is connected
    if (!db) {
      return res.status(503).json({ error: "Database not available" });
    }
    
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ error: "Email is required" });
    
    await db.collection("newsletter").insertOne({ 
      email, 
      subscribedAt: new Date() 
    });
    
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

// Health check endpoint
app.get("/api/health", async (req, res) => {
  const dbStatus = client ? "connected" : "disconnected";
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