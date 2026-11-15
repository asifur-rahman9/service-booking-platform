import { Router } from "express";
import { isValidObjectId } from "mongoose";
import { AppointmentModel } from "../models/Appointment.js";
import { ServiceModel } from "../models/Service.js";
import { InvoiceModel } from "../models/Invoice.js";
import { requireAuth } from "../lib/auth.js";

const router = Router();
router.use(requireAuth());

router.get("/", async (req, res) => {
  const { id, role } = req.user!;
  const appointments = await AppointmentModel.find(role === "business" ? { business: id } : { customer: id })
    .sort({ start: 1 })
    .populate("business", "name business.name business.city")
    .populate("customer", "name email phone");
  res.json({ appointments });
});

// Customer books a service
router.post("/", requireAuth("customer"), async (req, res) => {
  const { serviceId, start, notes } = req.body;
  if (!isValidObjectId(serviceId)) return res.status(404).json({ error: "Service not found" });
  const startDate = new Date(start);
  if (isNaN(startDate.getTime())) return res.status(400).json({ error: "Pick a time" });
  if (startDate.getTime() <= Date.now()) return res.status(400).json({ error: "Pick a time in the future" });

  const service = await ServiceModel.findById(serviceId);
  if (!service || !service.active) return res.status(404).json({ error: "Service not found" });

  // Make sure the business isn't already booked at that time
  const end = new Date(startDate.getTime() + service.durationMinutes * 60_000);
  const clash = await AppointmentModel.exists({
    business: service.business,
    status: { $in: ["pending", "confirmed"] },
    start: { $lt: end },
    end: { $gt: startDate },
  });
  if (clash) return res.status(409).json({ error: "That time is already booked. Please pick another slot." });

  const appointment = await AppointmentModel.create({
    service: service._id,
    business: service.business,
    customer: req.user!.id,
    start: startDate,
    end,
    serviceName: service.name,
    price: service.price,
    notes: notes ?? "",
  });
  res.status(201).json({ appointment });
});

// Change status: business can confirm / complete / cancel, customer can only cancel
router.patch("/:id/status", async (req, res) => {
  const { status } = req.body;
  const { id, role } = req.user!;
  if (!isValidObjectId(req.params.id)) return res.status(404).json({ error: "Appointment not found" });
  const appointment = await AppointmentModel.findById(req.params.id);
  if (!appointment) return res.status(404).json({ error: "Appointment not found" });

  const owner = role === "business" ? appointment.business : appointment.customer;
  if (String(owner) !== id) return res.status(403).json({ error: "This isn't your appointment" });

  const current = appointment.status;
  let allowed = false;
  if (status === "cancelled") {
    allowed = current === "pending" || current === "confirmed";
  } else if (role === "business" && status === "confirmed") {
    allowed = current === "pending";
  } else if (role === "business" && status === "completed") {
    allowed = current === "confirmed";
  }
  if (!allowed) return res.status(400).json({ error: `Can't change a ${current} appointment to ${status}` });

  appointment.status = status;
  await appointment.save();

  // When a job is done, create an invoice for the customer
  if (status === "completed") {
    await InvoiceModel.create({
      appointment: appointment._id,
      business: appointment.business,
      customer: appointment.customer,
      description: appointment.serviceName,
      amount: appointment.price,
    });
  }
  res.json({ appointment });
});

export default router;
