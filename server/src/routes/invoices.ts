import { Router } from "express";
import { isValidObjectId } from "mongoose";
import { InvoiceModel } from "../models/Invoice.js";
import { requireAuth } from "../lib/auth.js";

const router = Router();
router.use(requireAuth());

router.get("/", async (req, res) => {
  const { id, role } = req.user!;
  const invoices = await InvoiceModel.find(role === "business" ? { business: id } : { customer: id })
    .sort({ createdAt: -1 })
    .populate("business", "name email business.name")
    .populate("customer", "name email");
  res.json({ invoices });
});

// No real payments: paying just marks the invoice as paid
router.post("/:id/pay", requireAuth("customer"), async (req, res) => {
  if (!isValidObjectId(req.params.id)) return res.status(404).json({ error: "Invoice not found" });
  const invoice = await InvoiceModel.findById(req.params.id);
  if (!invoice) return res.status(404).json({ error: "Invoice not found" });
  if (String(invoice.customer) !== req.user!.id) return res.status(403).json({ error: "This isn't your invoice" });
  if (invoice.status === "paid") return res.status(400).json({ error: "This invoice is already paid" });

  invoice.status = "paid";
  invoice.paidAt = new Date();
  await invoice.save();
  res.json({ invoice });
});

export default router;
