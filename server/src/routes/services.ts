import { Router } from "express";
import { isValidObjectId } from "mongoose";
import { CATEGORIES, ServiceModel } from "../models/Service.js";
import { AppointmentModel } from "../models/Appointment.js";
import { requireAuth } from "../lib/auth.js";
import { openSlots } from "../lib/slots.js";

const router = Router();
const BUSINESS_FIELDS = "name business.name business.city business.description";

// Browse and search (anyone can see these)
router.get("/", async (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const category = typeof req.query.category === "string" ? req.query.category : "";
  const filter: Record<string, unknown> = { active: true };
  if (category) filter.category = category;
  if (q) {
    // escape special regex characters so a search like "c++" doesn't break
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ name: rx }, { description: rx }];
  }
  const services = await ServiceModel.find(filter).sort({ createdAt: -1 }).populate("business", BUSINESS_FIELDS);
  res.json({ services });
});

router.get("/categories", (_req, res) => {
  res.json({ categories: CATEGORIES });
});

// A business's own services, including hidden ones
router.get("/mine", requireAuth("business"), async (req, res) => {
  const services = await ServiceModel.find({ business: req.user!.id }).sort({ createdAt: -1 });
  res.json({ services });
});

router.get("/:id", async (req, res) => {
  if (!isValidObjectId(req.params.id)) return res.status(404).json({ error: "Service not found" });
  const service = await ServiceModel.findById(req.params.id).populate("business", BUSINESS_FIELDS);
  if (!service) return res.status(404).json({ error: "Service not found" });
  res.json({ service });
});

// Open time slots for one day. tz = the browser's getTimezoneOffset(),
// so opening hours are in the customer's local time.
router.get("/:id/availability", async (req, res) => {
  const date = String(req.query.date ?? "");
  const tz = Number(req.query.tz ?? 0);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return res.status(400).json({ error: "Date must be YYYY-MM-DD" });
  if (!isValidObjectId(req.params.id)) return res.status(404).json({ error: "Service not found" });

  const service = await ServiceModel.findById(req.params.id);
  if (!service || !service.active) return res.status(404).json({ error: "Service not found" });

  const dayStart = new Date(`${date}T00:00:00Z`).getTime() + tz * 60_000;
  const booked = await AppointmentModel.find({
    business: service.business,
    status: { $in: ["pending", "confirmed"] },
    start: { $lt: new Date(dayStart + 24 * 3600_000) },
    end: { $gt: new Date(dayStart) },
  });
  res.json({ slots: openSlots(dayStart, service.durationMinutes, booked, new Date()) });
});

// Returns an error message, or null if the service data is ok
function checkService(body: any, partial = false): string | null {
  if (!partial || body.name !== undefined) {
    if (!body.name || body.name.trim().length < 2) return "Enter a service name";
  }
  if (!partial || body.category !== undefined) {
    if (!CATEGORIES.includes(body.category)) return "Pick a category";
  }
  if (!partial || body.price !== undefined) {
    if (isNaN(Number(body.price)) || Number(body.price) < 0) return "Price can't be negative";
  }
  if (!partial || body.durationMinutes !== undefined) {
    const d = Number(body.durationMinutes);
    if (isNaN(d) || d < 15 || d > 480) return "Duration must be between 15 and 480 minutes";
  }
  return null;
}

router.post("/", requireAuth("business"), async (req, res) => {
  const error = checkService(req.body);
  if (error) return res.status(400).json({ error });
  const { name, description, category, price, durationMinutes, active } = req.body;
  const service = await ServiceModel.create({
    name: name.trim(),
    description: description ?? "",
    category,
    price: Number(price),
    durationMinutes: Number(durationMinutes),
    active: active ?? true,
    business: req.user!.id,
  });
  res.status(201).json({ service });
});

router.patch("/:id", requireAuth("business"), async (req, res) => {
  if (!isValidObjectId(req.params.id)) return res.status(404).json({ error: "Service not found" });
  const service = await ServiceModel.findById(req.params.id);
  if (!service) return res.status(404).json({ error: "Service not found" });
  if (String(service.business) !== req.user!.id) return res.status(403).json({ error: "This isn't your service" });

  const error = checkService(req.body, true);
  if (error) return res.status(400).json({ error });
  const { name, description, category, price, durationMinutes, active } = req.body;
  if (name !== undefined) service.name = name.trim();
  if (description !== undefined) service.description = description;
  if (category !== undefined) service.category = category;
  if (price !== undefined) service.price = Number(price);
  if (durationMinutes !== undefined) service.durationMinutes = Number(durationMinutes);
  if (active !== undefined) service.active = active;
  await service.save();
  res.json({ service });
});

router.delete("/:id", requireAuth("business"), async (req, res) => {
  if (!isValidObjectId(req.params.id)) return res.status(404).json({ error: "Service not found" });
  const service = await ServiceModel.findById(req.params.id);
  if (!service) return res.status(404).json({ error: "Service not found" });
  if (String(service.business) !== req.user!.id) return res.status(403).json({ error: "This isn't your service" });

  const hasBookings = await AppointmentModel.exists({ service: service._id });
  if (hasBookings) return res.status(409).json({ error: "This service has bookings. Hide it instead of deleting it." });
  await service.deleteOne();
  res.json({ ok: true });
});

export default router;
