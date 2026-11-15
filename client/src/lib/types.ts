export type Role = "business" | "customer";

export interface User {
  _id: string;
  role: Role;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  business?: { name?: string; description?: string; city?: string };
}

export interface BusinessRef {
  _id: string;
  name?: string;
  email?: string;
  business?: { name?: string; city?: string; description?: string };
}

export interface Service {
  _id: string;
  business: string | BusinessRef;
  name: string;
  description: string;
  category: string;
  price: number;
  durationMinutes: number;
  active: boolean;
}

export type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface Appointment {
  _id: string;
  service: string;
  business: BusinessRef;
  customer: { _id: string; name: string; email?: string; phone?: string };
  start: string;
  end: string;
  serviceName: string;
  price: number;
  notes: string;
  status: AppointmentStatus;
}

export interface Invoice {
  _id: string;
  appointment: string;
  business: BusinessRef;
  customer: { _id: string; name: string; email?: string };
  description: string;
  amount: number;
  status: "unpaid" | "paid";
  paidAt?: string;
  createdAt: string;
}

export interface DashboardData {
  upcomingCount: number;
  pendingCount: number;
  paidTotal: number;
  unpaidTotal: number;
  upcoming: Appointment[];
}

export const CATEGORIES = ["Cleaning", "Tutoring", "Home Repair", "Beauty", "Fitness", "Other"] as const;
