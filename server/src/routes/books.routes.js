import { Router } from "express";
import Book from "../models/Book.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import jwt from "jsonwebtoken";
import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import { z } from "zod";
import { bus } from "../events/bus.js";

const router = Router();

// Configure multer to store files in /public/static
const __filename_root = fileURLToPath(import.meta.url);
const __dirname_root = path.dirname(__filename_root);
const publicDirRoot = path.join(__dirname_root, "..", "..", "public");
const staticDir = path.join(publicDirRoot, "static");
if (!fs.existsSync(staticDir)) fs.mkdirSync(staticDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, staticDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || "";
    const base = path.basename(file.originalname, ext).toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const ts = Date.now();
    cb(null, `${base}-${ts}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB total per file
  fileFilter: (_req, file, cb) => {
    if (file.fieldname === "cover") {
      if (!file.mimetype.startsWith("image/")) return cb(new Error("Cover must be an image"));
      return cb(null, true);
    }
    if (file.fieldname === "pdf") {
      if (file.mimetype !== "application/pdf") return cb(new Error("PDF must be application/pdf"));
      return cb(null, true);
    }
    cb(null, true);
  },
});

const CreateBookSchema = z.object({
  title: z.string().trim().min(2).max(200),
  author: z.string().trim().min(2).max(120),
  description: z.string().trim().max(2000).optional().default(""),
  categories: z.array(z.string().trim().min(1)).max(10).optional().default([]),
  isPremium: z.union([z.boolean(), z.string()]).transform((v) => (typeof v === "string" ? v === "true" : v)),
  content: z.string().optional().default(""),
});

function isStaticFileUrl(url) {
  return typeof url === "string" && url.startsWith("/static/");
}

function safeUnlinkStatic(url) {
  try {
    if (!isStaticFileUrl(url)) return;
    const rel = url.replace(/^\/?static\//, "");
    const p = path.join(staticDir, rel);
    if (p.startsWith(staticDir) && fs.existsSync(p)) fs.unlinkSync(p);
  } catch {}
}

router.get("/", async (_req, res) => {
  const books = await Book.find().sort({ createdAt: -1 });
  res.json(books);
});

router.get("/:id", async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) return res.status(404).json({ message: "Not found" });
  res.json(book);
});

// Create a book with optional file uploads: cover (image) and pdf (file)
router.post(
  "/",
  requireAuth,
  requireAdmin,
  upload.fields([{ name: "cover", maxCount: 1 }, { name: "pdf", maxCount: 1 }]),
  async (req, res) => {
    const body = req.body || {};
    const files = (req.files || {});
    let categories = [];
    if (Array.isArray(body.categories)) {
      categories = body.categories.map((s) => String(s).trim()).filter(Boolean);
    } else {
      categories = String(body.categories || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    const raw = {
      title: body.title,
      author: body.author,
      description: body.description || "",
      categories,
      isPremium: body.isPremium,
      content: body.content || "",
    };

    try {
      const parsed = CreateBookSchema.parse(raw);

      // enforce either content or pdf for non-empty book
      const hasPdf = !!(files.pdf && files.pdf[0]);
      if (!hasPdf && parsed.content.trim().length === 0) {
        throw new Error("Provide a PDF file or content text");
      }

      const payload = { ...parsed };
      if (files.cover && files.cover[0]) {
        payload.coverUrl = `/static/${files.cover[0].filename}`;
      } else if (body.coverUrl) {
        payload.coverUrl = body.coverUrl;
      }
      if (hasPdf) {
        payload.pdfUrl = `/static/${files.pdf[0].filename}`;
      } else if (body.pdfUrl) {
        payload.pdfUrl = body.pdfUrl;
      }

      const book = await Book.create(payload);
      bus.emit("book:created", { id: book._id, title: book.title });
      return res.status(201).json(book);
    } catch (err) {
      // cleanup uploaded files if validation failed
      try {
        if (files.cover && files.cover[0]) fs.unlinkSync(files.cover[0].path);
        if (files.pdf && files.pdf[0]) fs.unlinkSync(files.pdf[0].path);
      } catch {}
      const msg = err instanceof Error ? err.message : "Invalid payload";
      return res.status(400).json({ message: msg });
    }
  }
);

// Update a book with optional new files; replace and clean old static files
router.put(
  "/:id",
  requireAuth,
  requireAdmin,
  upload.fields([{ name: "cover", maxCount: 1 }, { name: "pdf", maxCount: 1 }]),
  async (req, res) => {
    const body = req.body || {};
    const files = (req.files || {});
    let categories = [];
    if (Array.isArray(body.categories)) {
      categories = body.categories.map((s) => String(s).trim()).filter(Boolean);
    } else {
      categories = String(body.categories || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    const raw = {
      title: body.title,
      author: body.author,
      description: body.description || "",
      categories,
      isPremium: body.isPremium,
      content: body.content || "",
    };
    try {
      const parsed = CreateBookSchema.parse(raw);
      const book = await Book.findById(req.params.id);
      if (!book) return res.status(404).json({ message: "Not found" });

      const hasNewPdf = !!(files.pdf && files.pdf[0]);
      if (!book.pdfUrl && !hasNewPdf && parsed.content.trim().length === 0) {
        throw new Error("Provide a PDF file or content text");
      }

      // Prepare updates
      const update = { ...parsed };
      if (files.cover && files.cover[0]) {
        // remove old cover if static
        if (isStaticFileUrl(book.coverUrl)) safeUnlinkStatic(book.coverUrl);
        update.coverUrl = `/static/${files.cover[0].filename}`;
      } else if (body.coverUrl) {
        update.coverUrl = body.coverUrl;
      }
      if (hasNewPdf) {
        if (isStaticFileUrl(book.pdfUrl)) safeUnlinkStatic(book.pdfUrl);
        update.pdfUrl = `/static/${files.pdf[0].filename}`;
      } else if (body.pdfUrl) {
        update.pdfUrl = body.pdfUrl;
      }

      const updated = await Book.findByIdAndUpdate(req.params.id, update, { new: true });
      return res.json(updated);
    } catch (err) {
      try {
        if (files.cover && files.cover[0]) fs.unlinkSync(files.cover[0].path);
        if (files.pdf && files.pdf[0]) fs.unlinkSync(files.pdf[0].path);
      } catch {}
      const msg = err instanceof Error ? err.message : "Invalid payload";
      return res.status(400).json({ message: msg });
    }
  }
);

router.put("/:id", requireAuth, requireAdmin, async (req, res) => {
  const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!book) return res.status(404).json({ message: "Not found" });
  res.json(book);
});

router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  const deleted = await Book.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: "Not found" });
  bus.emit('book:deleted', { id: deleted._id });
  // clean static files
  safeUnlinkStatic(deleted.coverUrl);
  safeUnlinkStatic(deleted.pdfUrl);
  res.json({ ok: true });
});

export default router;

// Dynamic page render: return PNG for a given page number with watermark
router.get("/:id/page/:n.png", async (req, res) => {
  try {
    const { id, n } = req.params;
    const pageNum = Math.max(1, Math.min(50, Number(n) || 1));
    const book = await Book.findById(id).lean();
    if (!book) return res.status(404).json({ message: "Not found" });
    if (!book.pdfUrl) return res.status(400).json({ message: "No PDF available" });

    // Optional auth: required for premium books, optional for free
    const header = req.headers.authorization || "";
    let token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token && req.query && typeof req.query.t === 'string' && req.query.t.length > 0) {
      token = req.query.t;
    }
    let user = null;
    if (token) {
      try { user = jwt.verify(token, process.env.JWT_SECRET || "dev_secret"); } catch {}
    }
    if (book.isPremium && !user) return res.status(401).json({ message: "Unauthorized" });

    // Resolve local file path for the PDF in /public
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const staticDirAbs = path.join(__dirname, "..", "..", "public", "static");
    const rel = book.pdfUrl.replace(/^\/?static\//, "");
    const pdfPath = path.join(staticDirAbs, rel);
    if (!fs.existsSync(pdfPath)) return res.status(404).json({ message: "PDF missing" });
    const pdfBuffer = fs.readFileSync(pdfPath);
    const pdfBase64 = pdfBuffer.toString("base64");

    const browser = await puppeteer.launch({ args: ["--no-sandbox", "--disable-setuid-sandbox"], headless: "new" });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 1800, deviceScaleFactor: 2 });

    const html = `<!doctype html>
<html>
  <head>
    <meta charset=\"utf-8\" />
    <style>
      html,body { margin:0; padding:0; background:#fff; }
      #wrap { position:relative; display:inline-block; }
      #wm { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; pointer-events:none; opacity:0.15; font: 700 48px/1 sans-serif; color:#c00; transform: rotate(-20deg); }
    </style>
  </head>
  <body>
    <div id=\"wrap\">
      <canvas id=\"c\"></canvas>
      <div id=\"wm\">${(req.user && req.user.email) || "Preview"} • ${new Date().toISOString().slice(0,10)}</div>
    </div>
    <script type=\"module\">
      import * as pdfjsLib from 'https://unpkg.com/pdfjs-dist@4.4.168/build/pdf.min.mjs';
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs';
      const b64 = '${pdfBase64}';
      const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
      const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
      const p = await pdf.getPage(${pageNum});
      const scale = 1.8;
      const vp = p.getViewport({ scale });
      const canvas = document.getElementById('c');
      const ctx = canvas.getContext('2d');
      canvas.width = vp.width; canvas.height = vp.height;
      await p.render({ canvasContext: ctx, viewport: vp }).promise;
      window.renderDone = true;
    </script>
  </body>
</html>`;

    await page.setContent(html, { waitUntil: "networkidle0" });
    await page.waitForFunction(() => window.renderDone === true, { timeout: 15000 });
    const canvas = await page.$('#wrap');
    const screenshot = await canvas.screenshot({ type: 'png' });
    await browser.close();

    // Add a light watermark hint via header (client can overlay too)
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "no-store");
    return res.send(screenshot);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Render error" });
  }
});

