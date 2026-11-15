import { Router } from "express";
import bcrypt from "bcryptjs";
import { UserModel } from "../models/User.js";
import { COOKIE, requireAuth, setAuthCookie } from "../lib/auth.js";

const router = Router();

router.post("/register", async (req, res) => {
  const { role, name, email, password, businessName, city } = req.body;
  if (role !== "business" && role !== "customer") return res.status(400).json({ error: "Pick an account type" });
  if (!name || name.trim().length < 2) return res.status(400).json({ error: "Enter your name" });
  if (!email || !email.includes("@")) return res.status(400).json({ error: "Enter a valid email" });
  if (!password || password.length < 8) return res.status(400).json({ error: "Password must be at least 8 characters" });
  if (role === "business" && (!businessName || businessName.trim().length < 2)) {
    return res.status(400).json({ error: "Enter your business name" });
  }

  const existing = await UserModel.findOne({ email: email.trim().toLowerCase() });
  if (existing) return res.status(409).json({ error: "An account with this email already exists" });

  const user = await UserModel.create({
    role,
    name: name.trim(),
    email: email.trim(),
    passwordHash: await bcrypt.hash(password, 10),
    business: role === "business" ? { name: businessName.trim(), city: city ?? "" } : undefined,
  });
  setAuthCookie(res, { id: user.id, role: user.role });
  res.status(201).json({ user });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await UserModel.findOne({ email: String(email ?? "").trim().toLowerCase() });
  if (!user || !(await bcrypt.compare(String(password ?? ""), user.passwordHash))) {
    return res.status(401).json({ error: "Wrong email or password" });
  }
  setAuthCookie(res, { id: user.id, role: user.role });
  res.json({ user });
});

router.post("/logout", (_req, res) => {
  res.clearCookie(COOKIE);
  res.json({ ok: true });
});

// Returns null instead of an error when logged out, so the app can call it on load
router.get("/me", async (req, res) => {
  const user = req.user ? await UserModel.findById(req.user.id) : null;
  res.json({ user });
});

// Update profile info
router.patch("/me", requireAuth(), async (req, res) => {
  const { name, phone, address, business } = req.body;
  if (!name || name.trim().length < 2) return res.status(400).json({ error: "Enter your name" });

  const user = await UserModel.findById(req.user!.id);
  if (!user) return res.status(404).json({ error: "Account not found" });
  user.name = name.trim();
  if (phone !== undefined) user.phone = phone;
  if (address !== undefined) user.address = address;
  if (user.role === "business" && business) {
    if (!business.name || business.name.trim().length < 2) {
      return res.status(400).json({ error: "Enter your business name" });
    }
    user.set("business", business);
  }
  await user.save();
  res.json({ user });
});

export default router;
