import { Schema, model, type InferSchemaType } from "mongoose";

export const APPOINTMENT_STATUSES = ["pending", "confirmed", "completed", "cancelled"] as const;
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

const appointmentSchema = new Schema(
  {
    service: { type: Schema.Types.ObjectId, ref: "Service", required: true },
    business: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    customer: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    // Copied from the service at booking time so later edits don't change past bookings.
    serviceName: { type: String, required: true },
    price: { type: Number, required: true },
    notes: { type: String, trim: true, default: "" },
    status: { type: String, enum: APPOINTMENT_STATUSES, default: "pending" },
  },
  { timestamps: true },
);

export type Appointment = InferSchemaType<typeof appointmentSchema>;
export const AppointmentModel = model("Appointment", appointmentSchema);
