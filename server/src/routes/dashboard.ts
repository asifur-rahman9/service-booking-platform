import { Router } from "express";
import { AppointmentModel } from "../models/Appointment.js";
import { InvoiceModel } from "../models/Invoice.js";
import { requireAuth } from "../lib/auth.js";

const router = Router();

// Numbers for the dashboard page (works for both account types)
router.get("/", requireAuth(), async (req, res) => {
  const { id, role } = req.user!;
  const owner = role === "business" ? { business: id } : { customer: id };
  const now = new Date();

  const upcoming = await AppointmentModel.find({ ...owner, status: { $in: ["pending", "confirmed"] }, start: { $gte: now } })
    .sort({ start: 1 })
    .populate("business", "business.name")
    .populate("customer", "name");
  const pendingCount = upcoming.filter((a) => a.status === "pending").length;

  const invoices = await InvoiceModel.find(owner);
  let paidTotal = 0;
  let unpaidTotal = 0;
  for (const invoice of invoices) {
    if (invoice.status === "paid") paidTotal += invoice.amount;
    else unpaidTotal += invoice.amount;
  }

  res.json({
    upcomingCount: upcoming.length,
    pendingCount,
    paidTotal,
    unpaidTotal,
    upcoming: upcoming.slice(0, 5),
  });
});

export default router;
