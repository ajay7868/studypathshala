import { Router } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "Missing fields" });
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: "Email already used" });
    const user = await User.create({ name, email, password });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || "dev_secret", { expiresIn: "7d" });
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, subscription: user.subscription } });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || "dev_secret", { expiresIn: "7d" });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, subscription: user.subscription } });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  const user = await User.findById(req.user.id).select("name email role subscription createdAt updatedAt");
  if (!user) return res.status(404).json({ message: "Not found" });
  res.json(user);
});

router.put("/profile", requireAuth, async (req, res) => {
  const { name, password } = req.body;
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: "Not found" });
  if (name) user.name = name;
  if (password) user.password = password; // will be hashed by pre-save hook
  await user.save();
  res.json({ id: user._id, name: user.name, email: user.email, role: user.role });
});

export default router;

