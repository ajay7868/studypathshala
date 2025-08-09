import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";
import fs from "fs";

import authRoutes from "./routes/auth.routes.js";
import bookRoutes from "./routes/books.routes.js";
import subscriptionRoutes from "./routes/subscription.routes.js";
import { bus } from "./events/bus.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/studypathshala";

app.set("trust proxy", 1);
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "base-uri": ["'self'"],
        "object-src": ["'none'"],
        "frame-ancestors": ["'none'"],
        "img-src": ["'self'", "data:", "blob:", "https:"],
        "font-src": ["'self'", "data:"],
        "style-src": ["'self'", "'unsafe-inline'"],
        "script-src": ["'self'"],
        "worker-src": ["'self'", "blob:"],
        "connect-src": [
          "'self'",
          ...(process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.split(",") : [])
        ],
      },
    },
  })
);

if (process.env.NODE_ENV === "production") {
  app.use(
    helmet.hsts({
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    })
  );
}
const allowedOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(",")
  : ["http://localhost:5173", "https://studypathshala.com", "https://www.studypathshala.com"];
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

const limiter = rateLimit({ windowMs: 60 * 1000, max: 120 });
app.use(limiter);

// static files for generated PDFs
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, "..", "public");
// Serve files from /public/static at the /static/* URL path
app.use(
  "/static",
  express.static(path.join(publicDir, "static"), {
    maxAge: process.env.NODE_ENV === "production" ? "1d" : 0,
  })
);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "studypathshala-api" });
});

// Tighter per-route rate limits on sensitive endpoints
const authLimiter = rateLimit({ windowMs: 60 * 1000, max: 20 });
app.use("/api/auth", authLimiter, authRoutes);

const renderLimiter = rateLimit({ windowMs: 60 * 1000, max: 30 });
app.use("/api/books", renderLimiter, bookRoutes);
app.use("/api/subscriptions", subscriptionRoutes);

// Server-Sent Events for live updates
app.get('/api/events', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const onBookCreated = (payload) => {
    res.write(`event: bookCreated\n`);
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  };
  const onBookDeleted = (payload) => {
    res.write(`event: bookDeleted\n`);
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  };

  bus.on('book:created', onBookCreated);
  bus.on('book:deleted', onBookDeleted);

  req.on('close', () => {
    bus.off('book:created', onBookCreated);
    bus.off('book:deleted', onBookDeleted);
    res.end();
  });
});

// Global error handler
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

// Serve built client if available (for production single-deploy)
try {
  const clientDistDir = path.join(__dirname, "..", "..", "client", "dist");
  if (fs.existsSync(clientDistDir)) {
    app.use(express.static(clientDistDir, { maxAge: process.env.NODE_ENV === "production" ? "1h" : 0 }));
    app.get(/^(?!\/api).*/, (_req, res) => {
      res.sendFile(path.join(clientDistDir, "index.html"));
    });
  }
} catch {}

async function start() {
  try {
    await mongoose.connect(mongoUri);
    console.log("MongoDB connected");
    app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
  } catch (err) {
    console.error("Failed to start server", err);
    process.exit(1);
  }
}

start();
