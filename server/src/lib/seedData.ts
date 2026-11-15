import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { UserModel } from "../models/User.js";
import { ServiceModel } from "../models/Service.js";
import { AppointmentModel } from "../models/Appointment.js";
import { InvoiceModel } from "../models/Invoice.js";

export const DEMO_PASSWORD = "demo1234";

/** Wipes the database and fills it with demo businesses, services, bookings and invoices. */
export async function seedDatabase() {
  await mongoose.connection.dropDatabase();
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const [sparkle, brightpath, fixit, alex, sam] = await UserModel.create([
    {
      role: "business", name: "Maya Chen", email: "maya@sparkle.ca", passwordHash, phone: "514-555-0142",
      business: { name: "Sparkle Car Care", city: "Montreal", description: "Hand car washes and full detailing, done at your place." },
    },
    {
      role: "business", name: "Omar Haddad", email: "omar@brightpath.ca", passwordHash, phone: "514-555-0188",
      business: { name: "BrightPath Tutoring", city: "Montreal", description: "Math, science and essay help from experienced tutors." },
    },
    {
      role: "business", name: "Julie Roy", email: "julie@fixitpro.ca", passwordHash,
      business: { name: "FixIt Pro", city: "Laval", description: "Small home repairs, furniture assembly and painting." },
    },
    { role: "customer", name: "Alex Tremblay", email: "alex@example.com", passwordHash, phone: "438-555-0101", address: "Plateau-Mont-Royal, Montreal" },
    { role: "customer", name: "Sam Patel", email: "sam@example.com", passwordHash, address: "Verdun, Montreal" },
  ]);

  const s = await ServiceModel.create([
    { business: sparkle._id, name: "Full Detail", category: "Cleaning", price: 149, durationMinutes: 180, description: "Interior shampoo, wax and polish, engine bay." },
    { business: sparkle._id, name: "Express Wash", category: "Cleaning", price: 39, durationMinutes: 45, description: "Exterior hand wash and dry." },
    { business: sparkle._id, name: "Interior Refresh", category: "Cleaning", price: 79, durationMinutes: 90, description: "Vacuum, wipe-down and windows." },
    { business: brightpath._id, name: "Calculus Tutoring", category: "Tutoring", price: 55, durationMinutes: 60, description: "One-on-one help with calculus, from limits to integrals." },
    { business: brightpath._id, name: "Essay Review", category: "Tutoring", price: 35, durationMinutes: 30, description: "Feedback on structure, arguments and grammar." },
    { business: brightpath._id, name: "Exam Prep Session", category: "Tutoring", price: 70, durationMinutes: 90, description: "Practice problems and a study plan before finals." },
    { business: fixit._id, name: "Furniture Assembly", category: "Home Repair", price: 60, durationMinutes: 120, description: "IKEA and similar flat-pack furniture." },
    { business: fixit._id, name: "Room Painting", category: "Home Repair", price: 220, durationMinutes: 240, description: "One room, two coats, paint not included." },
    { business: fixit._id, name: "Leaky Faucet Fix", category: "Home Repair", price: 45, durationMinutes: 45, description: "Washer or cartridge replacement." },
  ]);

  // Times relative to today so the demo always has upcoming and past bookings.
  const day = (offset: number, hour: number, minute = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    d.setHours(hour, minute, 0, 0);
    return d;
  };
  const book = (service: (typeof s)[number], customer: typeof alex, start: Date, status: string, notes = "") => ({
    service: service._id,
    business: service.business,
    customer: customer._id,
    start,
    end: new Date(start.getTime() + service.durationMinutes * 60_000),
    serviceName: service.name,
    price: service.price,
    status,
    notes,
  });

  const appts = await AppointmentModel.create([
    book(s[0], alex, day(2, 10), "confirmed", "Black Honda Civic, parked in the driveway"),
    book(s[3], alex, day(3, 14), "pending", "Midterm next week, chapters 3 to 5"),
    book(s[6], alex, day(6, 9, 30), "pending"),
    book(s[1], sam, day(1, 13), "pending"),
    book(s[2], sam, day(4, 11), "confirmed"),
    book(s[4], sam, day(5, 15), "confirmed"),
    book(s[1], alex, day(-12, 11), "completed"),
    book(s[4], alex, day(-6, 16), "completed"),
    book(s[0], sam, day(-9, 9), "completed"),
    book(s[3], sam, day(-3, 10), "completed"),
    book(s[8], alex, day(-2, 15), "cancelled"),
  ]);

  const done = appts.filter((a) => a.status === "completed");
  await InvoiceModel.create(
    done.map((a, i) => ({
      appointment: a._id,
      business: a.business,
      customer: a.customer,
      description: a.serviceName,
      amount: a.price,
      status: i % 2 === 0 ? "paid" : "unpaid",
      paidAt: i % 2 === 0 ? a.end : undefined,
    })),
  );

  return { users: 5, services: s.length, appointments: appts.length, invoices: done.length };
}
