require("dns").setDefaultResultOrder("ipv4first");
require("dotenv").config(); // load .env variables

const express = require("express");
const app = express();
const { MongoClient, ServerApiVersion } = require("mongodb");
const cors = require("cors");
const path = require("path");

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

// ===== Middleware =====
const allowedOrigins = process.env.FRONTEND_URLS
  ? process.env.FRONTEND_URLS.split(",")
  : [];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow Postman/server
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

app.use(cors(corsOptions));
app.use(express.json());
app.use("/images", express.static(path.join(__dirname, "public/images")));

// ===== MongoDB Atlas Connection =====
const uri = process.env.MONGODB_URI; // get from .env

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db, playersCollection;

async function connectDB() {
  try {
    await client.connect();
    db = client.db("uvotake"); // database name
    playersCollection = db.collection("players"); // collection name
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
}
connectDB();

// ===== API Routes =====
// Player Routes
app.post("/api/player", async (req, res) => {
  try {
    const player = req.body;
    const result = await playersCollection.insertOne(player);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/api/players", async (req, res) => {
  try {
    const players = await playersCollection.find().toArray();
    res.json(players);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Use games and technology routes
const gameRoutes = require("./routes/games");
const techRoutes = require("./routes/technology");

app.use("/api/games", gameRoutes);
app.use("/api/technology", techRoutes);

// ===== Serve Frontend (Production) =====
const frontendPath = path.join(__dirname, "public");
app.use(express.static(frontendPath));

// Fallback for SPA routing: serve index.html for all non-API routes
app.get("*", (req, res) => {
  if (req.path.startsWith("/api")) {
    res.status(404).json({ error: "API route not found" });
  } else {
    res.sendFile(path.join(frontendPath, "index.html"));
  }
});

// ===== Start Server =====
app.listen(PORT, () => {
  console.log(
    `🚀 XGI fullstack running in ${NODE_ENV} mode at http://localhost:${PORT}`
  );
});
