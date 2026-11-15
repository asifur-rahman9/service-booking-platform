import { useState } from "react";
import { CalendarDays, MessageSquare } from "lucide-react";
import { api } from "../lib/api";
import type { Appointment, AppointmentStatus, Role } from "../lib/types";
import { businessName, formatMoney, formatTime } from "../lib/format";
import { StatusBadge } from "./ui";

interface Props {
  appointment: Appointment;
  role: Role;
  onChanged: () => void; // parent reloads its list after a change
}

export function AppointmentRow({ appointment: a, role, onChanged }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function changeStatus(status: AppointmentStatus) {
    if (status === "cancelled" && !confirm("Cancel this booking?")) return;
    setBusy(true);
    setError("");
    try {
      await api(`/appointments/${a._id}/status`, { method: "PATCH", body: { status } });
      onChanged();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  // Which buttons to show
  let buttons: { status: AppointmentStatus; label: string; style: string }[] = [];
  if (role === "business" && a.status === "pending") {
    buttons = [
      { status: "confirmed", label: "Accept", style: "btn-primary" },
      { status: "cancelled", label: "Decline", style: "btn-secondary" },
    ];
  } else if (role === "business" && a.status === "confirmed") {
    buttons = [
      { status: "completed", label: "Mark done", style: "btn-primary" },
      { status: "cancelled", label: "Cancel", style: "btn-secondary" },
    ];
  } else if (role === "customer" && (a.status === "pending" || a.status === "confirmed")) {
    buttons = [{ status: "cancelled", label: "Cancel", style: "btn-secondary" }];
  }

  const start = new Date(a.start);
  const who = role === "business" ? a.customer.name : businessName(a.business);

  return (
    <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
      <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-paper">
        <span className="text-xs font-bold uppercase tracking-wide text-brand-600">{start.toLocaleDateString("en-CA", { month: "short" })}</span>
        <span className="font-display text-2xl font-bold leading-none text-stone-900">{start.getDate()}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-semibold text-stone-900">{a.serviceName}</h3>
          <StatusBadge status={a.status} />
        </div>
        <p className="mt-1 flex flex-wrap items-center gap-x-3 text-sm text-stone-600">
          <span className="flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" />
            {start.toLocaleDateString("en-CA", { weekday: "short" })}, {formatTime(a.start)} to {formatTime(a.end)}
          </span>
          <span>{who}</span>
          <span className="font-semibold text-stone-800">{formatMoney(a.price)}</span>
        </p>
        {a.notes && (
          <p className="mt-2 flex items-start gap-1.5 text-sm text-stone-600">
            <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-stone-400" /> {a.notes}
          </p>
        )}
        {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
      </div>
      {buttons.length > 0 && (
        <div className="flex gap-2">
          {buttons.map((b) => (
            <button key={b.status} className={`btn ${b.style}`} disabled={busy} onClick={() => changeStatus(b.status)}>
              {b.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
