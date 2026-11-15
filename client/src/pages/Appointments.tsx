import { useEffect, useState } from "react";
import { CalendarX } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import type { Appointment } from "../lib/types";
import { Page } from "../components/Layout";
import { AppointmentRow } from "../components/AppointmentRow";
import { EmptyState, PageHeader, Spinner } from "../components/ui";

export default function Appointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[] | null>(null);
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");

  function load() {
    api<{ appointments: Appointment[] }>("/appointments").then((data) => setAppointments(data.appointments));
  }
  useEffect(load, []);

  if (!user) return null;
  const isBusiness = user.role === "business";

  const now = Date.now();
  const all = appointments ?? [];
  const upcoming = all.filter((a) => (a.status === "pending" || a.status === "confirmed") && new Date(a.end).getTime() >= now);
  const past = all.filter((a) => !upcoming.includes(a)).reverse();
  const list = tab === "upcoming" ? upcoming : past;

  return (
    <Page>
      <PageHeader
        title={isBusiness ? "Appointments" : "My bookings"}
        subtitle={isBusiness ? "Accept new requests and mark jobs as done to send an invoice." : "Everything you've booked, in one place."}
      />
      <div className="mb-6 inline-flex rounded-full border border-line bg-white p-1">
        {(["upcoming", "past"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-5 py-2 text-sm font-medium capitalize transition ${tab === t ? "bg-brand-600 text-white" : "text-stone-600 hover:text-stone-900"}`}
          >
            {t} ({t === "upcoming" ? upcoming.length : past.length})
          </button>
        ))}
      </div>
      {!appointments ? (
        <Spinner />
      ) : list.length ? (
        <div className="card divide-y divide-stone-100 overflow-hidden">
          {list.map((a) => (
            <AppointmentRow key={a._id} appointment={a} role={user.role} onChanged={load} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<CalendarX className="h-6 w-6" />}
          title="Nothing here"
          text={tab === "past" ? "Past appointments will show up here." : "You have no upcoming appointments."}
        />
      )}
    </Page>
  );
}
