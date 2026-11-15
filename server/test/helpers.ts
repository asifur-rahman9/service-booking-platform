import request from "supertest";
import { createApp } from "../src/app.js";

export const app = createApp();

export async function signUp(role: "business" | "customer", email: string) {
  const agent = request.agent(app);
  const res = await agent.post("/api/auth/register").send({
    role,
    name: role === "business" ? "Maya Chen" : "Alex Tremblay",
    email,
    password: "password123",
    businessName: role === "business" ? "Sparkle Car Care" : undefined,
  });
  if (res.status !== 201) throw new Error(`signup failed: ${JSON.stringify(res.body)}`);
  return { agent, user: res.body.user };
}

export async function createService(agent: ReturnType<typeof request.agent>, overrides = {}) {
  const res = await agent.post("/api/services").send({
    name: "Express Wash",
    description: "Exterior hand wash",
    category: "Cleaning",
    price: 39,
    durationMinutes: 60,
    ...overrides,
  });
  if (res.status !== 201) throw new Error(`create service failed: ${JSON.stringify(res.body)}`);
  return res.body.service;
}

/** A time tomorrow at the given hour (local time). */
export function tomorrowAt(hour: number) {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(hour, 0, 0, 0);
  return d;
}
