require("dns").setDefaultResultOrder("ipv4first");
require("dotenv").config();

const express = require("express");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const DiscordStrategy = require("passport-discord").Strategy;
const { MongoClient, ServerApiVersion } = require("mongodb");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");

const app = express();

// ---------------------
// Security (helmet)
// ---------------------
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
        baseUri: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

// ---------------------
// CORS
// ---------------------
const allowedOrigins = process.env.FRONTEND_URLS
  ? process.env.FRONTEND_URLS.split(",")
  : [];
const corsOptions = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error("Not allowed by CORS"));
  },
};
app.use(cors(corsOptions));

// --------------------- 
// Sessions & Passport
// ---------------------
app.use(
  session({
    secret: process.env.SESSION_SECRET || "changeme",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);

// Discord Strategy
passport.use(
  new DiscordStrategy(
    {
      clientID: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      callbackURL: process.env.DISCORD_CALLBACK_URL,
      scope: ["identify", "email"],
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);

// ---------------------
// JSON parsing & static assets
// ---------------------
app.use(express.json());
app.use("/images", express.static(path.join(__dirname, "public/images")));

// ---------------------
// MongoDB Connection
// ---------------------
const uri = process.env.MONGODB_URI;
let db, playersCollection, client;

async function connectDB() {
  try {
    if (!uri) throw new Error("MONGODB_URI environment variable is not defined");

    client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });

    await client.connect();
    await client.db("admin").command({ ping: 1 });

    db = client.db("uvotake");
    playersCollection = db.collection("players");
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    if (NODE_ENV === "development") process.exit(1);
  }
}
connectDB().catch(console.error);

process.on("SIGINT", async () => {
  if (client) {
    await client.close();
    console.log("MongoDB connection closed");
  }
  process.exit(0);
});

// ---------------------
// Auth Routes
// ---------------------
app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => res.redirect("/profile")
);

app.get("/auth/discord", passport.authenticate("discord"));

app.get(
  "/auth/discord/callback",
  passport.authenticate("discord", { failureRedirect: "/login" }),
  (req, res) => res.redirect("/profile")
);

app.get("/profile", (req, res) => {
  if (!req.user) return res.redirect("/login");
  res.send(`
    <h1>Welcome ${req.user.displayName || req.user.username}</h1>
    <pre>${JSON.stringify(req.user, null, 2)}</pre>
    <a href="/logout">Logout</a>
  `);
});

app.get("/logout", (req, res) => {
  req.logout(() => res.redirect("/"));
});

// ---------------------
// API Routes
// ---------------------
app.post("/api/player", async (req, res) => {
  try {
    if (!playersCollection) return res.status(503).json({ error: "Database not available" });

    const { username, email } = req.body || {};
    if (!username || !email) return res.status(400).json({ error: "username and email are required" });

    const result = await playersCollection.insertOne({ username, email, createdAt: new Date() });
    res.status(201).json({ ok: true, id: result.insertedId });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: "Email already exists" });
    res.status(400).json({ error: err.message });
  }
});

app.get("/api/players", async (_req, res) => {
  try {
    if (!playersCollection) return res.status(503).json({ error: "Database not available" });

    const players = await playersCollection.find().sort({ createdAt: -1 }).limit(100).toArray();
    res.json(players);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/newsletter", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not available" });

    const { email } = req.body || {};
    if (!email) return res.status(400).json({ error: "Email is required" });

    await db.collection("newsletter").insertOne({ email, subscribedAt: new Date() });
    res.status(201).json({ message: "Subscribed!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// JSON file routes
const gameRoutes = require("./routes/games");
const techRoutes = require("./routes/technology");
app.use("/api/games", gameRoutes);
app.use("/api/technology", techRoutes);

// Health check
app.get("/api/health", async (req, res) => {
  const dbStatus = client ? "connected" : "disconnected";
  res.json({ status: "ok", database: dbStatus, timestamp: new Date().toISOString() });
});

// ---------------------
// SPA Fallback
// ---------------------
const frontendPath = path.join(__dirname, "public");
app.use(express.static(frontendPath));

app.get("*", (req, res) => {
  if (req.path.startsWith("/api")) return res.status(404).json({ error: "API route not found" });
  res.sendFile(path.join(frontendPath, "index.html"));
});

// ---------------------
// Start Server
// ---------------------
app.listen(PORT, () => {
  console.log(`🚀 XGI running in ${NODE_ENV} mode at http://localhost:${PORT}`);
});
