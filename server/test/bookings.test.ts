import request from "supertest";
import { describe, expect, it } from "vitest";
import { app, createService, signUp, tomorrowAt } from "./helpers.js";
import { openSlots } from "../src/lib/slots.js";

async function setup() {
  const business = await signUp("business", "maya@sparkle.ca");
  const customer = await signUp("customer", "alex@example.com");
  const service = await createService(business.agent, { durationMinutes: 60, price: 39 });
  return { business, customer, service };
}

describe("booking flow", () => {
  it("books, confirms, completes, invoices and pays", async () => {
    const { business, customer, service } = await setup();
    const booked = await customer.agent.post("/api/appointments").send({ serviceId: service._id, start: tomorrowAt(10), notes: "Blue car" });
    expect(booked.status).toBe(201);
    const id = booked.body.appointment._id;
    expect(booked.body.appointment.status).toBe("pending");

    // Both sides see it
    expect((await business.agent.get("/api/appointments")).body.appointments[0].customer.name).toBe("Alex Tremblay");
    expect((await customer.agent.get("/api/appointments")).body.appointments).toHaveLength(1);

    // Customer can't confirm their own booking
    expect((await customer.agent.patch(`/api/appointments/${id}/status`).send({ status: "confirmed" })).status).toBe(400);

    expect((await business.agent.patch(`/api/appointments/${id}/status`).send({ status: "confirmed" })).status).toBe(200);
    expect((await business.agent.patch(`/api/appointments/${id}/status`).send({ status: "completed" })).status).toBe(200);

    const invoices = (await customer.agent.get("/api/invoices")).body.invoices;
    expect(invoices).toHaveLength(1);
    expect(invoices[0]).toMatchObject({ amount: 39, status: "unpaid", description: "Express Wash" });

    const dashBefore = (await business.agent.get("/api/dashboard")).body;
    expect(dashBefore.unpaidTotal).toBe(39);

    expect((await business.agent.post(`/api/invoices/${invoices[0]._id}/pay`)).status).toBe(403); // only the customer pays
    const paid = await customer.agent.post(`/api/invoices/${invoices[0]._id}/pay`);
    expect(paid.body.invoice.status).toBe("paid");
    expect((await customer.agent.post(`/api/invoices/${invoices[0]._id}/pay`)).status).toBe(400);

    const dashAfter = (await business.agent.get("/api/dashboard")).body;
    expect(dashAfter.paidTotal).toBe(39);
    expect(dashAfter.unpaidTotal).toBe(0);
  });

  it("prevents double booking and booking in the past", async () => {
    const { customer, service } = await setup();
    expect((await customer.agent.post("/api/appointments").send({ serviceId: service._id, start: tomorrowAt(10) })).status).toBe(201);

    const overlap = new Date(tomorrowAt(10).getTime() + 30 * 60_000);
    expect((await customer.agent.post("/api/appointments").send({ serviceId: service._id, start: overlap })).status).toBe(409);
    expect((await customer.agent.post("/api/appointments").send({ serviceId: service._id, start: tomorrowAt(11) })).status).toBe(201);

    const past = new Date(Date.now() - 3600_000);
    expect((await customer.agent.post("/api/appointments").send({ serviceId: service._id, start: past })).status).toBe(400);
  });

  it("keeps appointments private to the people involved", async () => {
    const { customer, service } = await setup();
    const stranger = await signUp("customer", "sam@example.com");
    const a = await customer.agent.post("/api/appointments").send({ serviceId: service._id, start: tomorrowAt(10) });
    expect((await stranger.agent.get("/api/appointments")).body.appointments).toHaveLength(0);
    expect((await stranger.agent.patch(`/api/appointments/${a.body.appointment._id}/status`).send({ status: "cancelled" })).status).toBe(403);
  });

  it("lists open slots that skip existing bookings", async () => {
    const { customer, service } = await setup();
    const date = tomorrowAt(0);
    const ymd = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    const tz = date.getTimezoneOffset();
    const before = (await request(app).get(`/api/services/${service._id}/availability?date=${ymd}&tz=${tz}`)).body.slots;
    expect(before).toHaveLength(15); // 9:00 .. 16:00 every 30 min for a 1h service

    await customer.agent.post("/api/appointments").send({ serviceId: service._id, start: tomorrowAt(10) });
    const after = (await request(app).get(`/api/services/${service._id}/availability?date=${ymd}&tz=${tz}`)).body.slots;
    expect(after).not.toContain(tomorrowAt(10).toISOString());
    expect(after).toHaveLength(12); // 9:30, 10:00 and 10:30 now overlap
  });
});

describe("openSlots", () => {
  const day = Date.UTC(2030, 0, 15);
  it("fits the service inside opening hours", () => {
    const slots = openSlots(day, 240, [], new Date(0));
    expect(slots[0]).toBe("2030-01-15T09:00:00.000Z");
    expect(slots.at(-1)).toBe("2030-01-15T13:00:00.000Z");
  });});
