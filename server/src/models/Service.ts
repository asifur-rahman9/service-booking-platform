import { Schema, model, type InferSchemaType } from "mongoose";

export const CATEGORIES = ["Cleaning", "Tutoring", "Home Repair", "Beauty", "Fitness", "Other"] as const;

const serviceSchema = new Schema(
  {
    business: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    category: { type: String, enum: CATEGORIES, required: true },
    price: { type: Number, required: true, min: 0 },
    durationMinutes: { type: Number, required: true, min: 15, max: 480 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export type Service = InferSchemaType<typeof serviceSchema>;
export const ServiceModel = model("Service", serviceSchema);
