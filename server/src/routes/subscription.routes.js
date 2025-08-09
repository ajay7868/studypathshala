import { Router } from "express";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/me", requireAuth, async (req, res) => {
  const user = await User.findById(req.user.id).select("subscription");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user.subscription);
});

router.post("/activate", requireAuth, async (req, res) => {
  const months = Number(req.body.months || 1);
  const now = new Date();
  const end = new Date(now);
  end.setMonth(end.getMonth() + months);
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { subscription: { plan: "premium", active: true, startDate: now, endDate: end } },
    { new: true }
  ).select("subscription");
  res.json(user.subscription);
});

router.post("/cancel", requireAuth, async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { subscription: { plan: "free", active: false, startDate: null, endDate: null } },
    { new: true }
  ).select("subscription");
  res.json(user.subscription);
});

export default router;

