import request from "supertest";
import { describe, expect, it } from "vitest";
import { app, createService, signUp } from "./helpers.js";

describe("services", () => {
  it("lets a business create, edit, hide and delete its services", async () => {
    const { agent } = await signUp("business", "maya@sparkle.ca");
    const svc = await createService(agent);

    const edited = await agent.patch(`/api/services/${svc._id}`).send({ price: 45 });
    expect(edited.body.service.price).toBe(45);

    await agent.patch(`/api/services/${svc._id}`).send({ active: false });
    expect((await request(app).get("/api/services")).body.services).toHaveLength(0); // hidden from customers
    expect((await agent.get("/api/services/mine")).body.services).toHaveLength(1);

    expect((await agent.delete(`/api/services/${svc._id}`)).status).toBe(200);
    expect((await agent.get("/api/services/mine")).body.services).toHaveLength(0);
  });

  it("only lets the owner change a service, and customers can't create one", async () => {
    const { agent: maya } = await signUp("business", "maya@sparkle.ca");
    const { agent: other } = await signUp("business", "omar@brightpath.ca");
    const { agent: customer } = await signUp("customer", "alex@example.com");
    const svc = await createService(maya);

    expect((await other.patch(`/api/services/${svc._id}`).send({ price: 1 })).status).toBe(403);
    expect((await other.delete(`/api/services/${svc._id}`)).status).toBe(403);
    expect((await customer.post("/api/services").send({ name: "Hack" })).status).toBe(403);
  });

  it("searches by text and filters by category, with the business attached", async () => {
    const { agent } = await signUp("business", "maya@sparkle.ca");
    await createService(agent, { name: "Express Wash" });
    await createService(agent, { name: "Calculus Help", category: "Tutoring", description: "math" });

    const wash = await request(app).get("/api/services?q=wash");
    expect(wash.body.services).toHaveLength(1);
    expect(wash.body.services[0].business.business.name).toBe("Sparkle Car Care");

    expect((await request(app).get("/api/services?category=Tutoring")).body.services).toHaveLength(1);
    expect((await request(app).get("/api/services?q=(")).status).toBe(200); // regex characters are escaped
  });
});
