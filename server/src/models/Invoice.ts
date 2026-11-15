import { Schema, model, type InferSchemaType } from "mongoose";

// Created automatically when a business marks an appointment as completed.
const invoiceSchema = new Schema(
  {
    appointment: { type: Schema.Types.ObjectId, ref: "Appointment", required: true, unique: true },
    business: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    customer: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ["unpaid", "paid"], default: "unpaid" },
    paidAt: { type: Date },
  },
  { timestamps: true },
);

export type Invoice = InferSchemaType<typeof invoiceSchema>;
export const InvoiceModel = model("Invoice", invoiceSchema);
