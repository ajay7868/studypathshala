import mongoose from "mongoose";
import dotenv from "dotenv";
import Book from "./models/Book.js";
import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import { fileURLToPath } from "url";

dotenv.config();

async function run() {
  const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/studypathshala";
  await mongoose.connect(mongoUri);
  await Book.deleteMany({});
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const publicDir = path.join(__dirname, "..", "public");
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);

  function createSamplePdf(filePath, title) {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 })
      const stream = fs.createWriteStream(filePath)
      doc.pipe(stream)
      for (let i = 1; i <= 10; i++) {
        doc.fontSize(20).text(`${title} — Sample Page ${i}`, { align: 'center' })
        doc.moveDown()
        doc.fontSize(12).text('This is sample content for interview preparation. Practice makes perfect. ', { align: 'left' })
        doc.text('Topics: Arrays, Trees, Graphs, System Design, SQL, Behavioral.')
        if (i < 10) doc.addPage()
      }
      doc.end()
      stream.on('finish', resolve)
      stream.on('error', reject)
    })
  }

  const books = [
    {
      title: "Coding Interview Handbook",
      author: "Tech Mentor",
      description: "Patterns, strategies, and 100+ practice problems in DS&A.",
      coverUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800",
      categories: ["Data Structures", "Algorithms"],
      isPremium: true,
      content: "Big-O, recursion, graphs, DP...",
    },
    {
      title: "System Design Primer",
      author: "Architect Guide",
      description: "Design scalable systems with real-world case studies.",
      coverUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800",
      categories: ["System Design"],
      isPremium: true,
      content: "Load balancing, caching, sharding, queues...",
    },
    {
      title: "Behavioral Interviews Guide",
      author: "Career Coach",
      description: "Frameworks and examples to ace behavioral questions.",
      coverUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800",
      categories: ["Behavioral"],
      isPremium: false,
      content: "STAR, leadership, conflict, failure stories...",
    },
    {
      title: "SQL & Data Fundamentals",
      author: "Data Mentor",
      description: "Hands-on SQL and data modeling for interviews.",
      coverUrl: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800",
      categories: ["Databases", "SQL"],
      isPremium: false,
      content: "Joins, window functions, indexing...",
    },
    {
      title: "System Design Case Studies (PDF)",
      author: "Demo Author",
      description: "PDF case studies: URL shortener, chat app, news feed.",
      coverUrl: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800",
      categories: ["System Design"],
      isPremium: false,
      content: "",
    },
  ]

  // generate PDFs and attach urls
  for (const b of books) {
    const slug = b.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const pdfPath = path.join(publicDir, `${slug}.pdf`)
    await createSamplePdf(pdfPath, b.title)
    b.pdfUrl = `/static/${slug}.pdf`
  }

  await Book.insertMany(books);
  console.log("Seeded sample books");
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});

