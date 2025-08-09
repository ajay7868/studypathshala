import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    coverUrl: { type: String, default: "" },
    categories: [{ type: String }],
    isPremium: { type: Boolean, default: false },
    content: { type: String, default: "" },
    pdfUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Book", bookSchema);

