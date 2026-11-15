import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";

// One collection for both kinds of accounts. Business accounts also have a
// `business` profile that customers see when browsing services.
const userSchema = new Schema(
  {
    role: { type: String, enum: ["business", "customer"], required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    phone: { type: String, trim: true, default: "" },
    address: { type: String, trim: true, default: "" },
    business: {
      name: { type: String, trim: true },
      description: { type: String, trim: true, default: "" },
      city: { type: String, trim: true, default: "" },
    },
  },
  {
    timestamps: true,
    toJSON: {
      // Never send the password hash to the client.
      transform: (_doc, ret: Record<string, unknown>) => {
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
      },
    },
  },
);

export type User = InferSchemaType<typeof userSchema>;
export type UserDoc = HydratedDocument<User>;
export const UserModel = model("User", userSchema);
