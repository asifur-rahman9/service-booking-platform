import request from "supertest";
import { describe, expect, it } from "vitest";
import { app, signUp } from "./helpers.js";

describe("auth", () => {
  it("registers, keeps the session in a cookie and never returns the password", async () => {
    const { agent, user } = await signUp("customer", "alex@example.com");
    expect(user.email).toBe("alex@example.com");
    expect(user.passwordHash).toBeUndefined();

    const me = await agent.get("/api/auth/me");
    expect(me.body.user.role).toBe("customer");
    expect(JSON.stringify(me.body)).not.toContain("password");
  });

  it("rejects duplicate emails (case-insensitive) and bad input", async () => {
    await signUp("customer", "alex@example.com");
    const dup = await request(app).post("/api/auth/register").send({ role: "customer", name: "Alex", email: "ALEX@example.com", password: "password123" });
    expect(dup.status).toBe(409);

    const short = await request(app).post("/api/auth/register").send({ role: "customer", name: "Al", email: "a@b.co", password: "123" });
    expect(short.status).toBe(400);
    expect(short.body.error).toMatch(/password/i);

    const noBusiness = await request(app).post("/api/auth/register").send({ role: "business", name: "Maya", email: "m@b.co", password: "password123" });
    expect(noBusiness.status).toBe(400);
    expect(noBusiness.body.error).toMatch(/business name/i);
  });

  it("logs in with the right password only, and logs out", async () => {
    await signUp("business", "maya@sparkle.ca");
    const wrong = await request(app).post("/api/auth/login").send({ email: "maya@sparkle.ca", password: "nope" });
    expect(wrong.status).toBe(401);

    const agent = request.agent(app);
    const ok = await agent.post("/api/auth/login").send({ email: "Maya@Sparkle.ca", password: "password123" });
    expect(ok.status).toBe(200);
    expect((await agent.get("/api/auth/me")).body.user.role).toBe("business");

    await agent.post("/api/auth/logout");
    expect((await agent.get("/api/auth/me")).body.user).toBeNull();
  });

  it("blocks protected routes when logged out", async () => {
    expect((await request(app).get("/api/appointments")).status).toBe(401);
    expect((await request(app).post("/api/services").send({})).status).toBe(401);
  });
});
