import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarClock, Plus, Search } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import type { DashboardData } from "../lib/types";
import { formatMoney } from "../lib/format";
import { Page } from "../components/Layout";
import { AppointmentRow } from "../components/AppointmentRow";
import { EmptyState, PageHeader, Spinner } from "../components/ui";

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);

  function load() {
    api<DashboardData>("/dashboard").then(setData);
  }
  useEffect(load, []);

  if (!user) return null;
  const isBusiness = user.role === "business";

  return (
    <Page>
      <PageHeader
        title={`Hi ${user.name.split(" ")[0]}`}
        subtitle={isBusiness ? `Here's what's happening at ${user.business?.name}.` : "Here's an overview of your bookings."}
        action={
          isBusiness ? (
            <Link to="/my-services" className="btn btn-accent">
              <Plus className="h-4 w-4" /> Add a service
            </Link>
          ) : (
            <Link to="/services" className="btn btn-accent">
              <Search className="h-4 w-4" /> Book a service
            </Link>
          )
        }
      />
      {!data ? (
        <Spinner />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl bg-brand-900 p-6 text-white">
              <p className="text-sm text-brand-100">{isBusiness ? "Earned" : "Spent"}</p>
              <p className="mt-2 font-display text-4xl font-bold">{formatMoney(data.paidTotal)}</p>
              <p className="mt-1 text-sm text-accent-400">
                {data.unpaidTotal > 0 ? `${formatMoney(data.unpaidTotal)} not paid yet` : "Everything is paid"}
              </p>
            </div>
            <div className="card p-6">
              <p className="text-sm text-stone-600">Upcoming</p>
              <p className="mt-2 font-display text-4xl font-bold text-stone-900">{data.upcomingCount}</p>
              <p className="mt-1 text-sm text-stone-600">Pending or confirmed</p>
            </div>
            <div className="card p-6">
              <p className="text-sm text-stone-600">{isBusiness ? "Requests to review" : "Waiting for confirmation"}</p>
              <p className="mt-2 font-display text-4xl font-bold text-accent-700">{data.pendingCount}</p>
              <p className="mt-1 text-sm text-stone-600">{isBusiness ? "Waiting on you" : "The business will reply soon"}</p>
            </div>
          </div>

          <div className="mt-10 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-stone-900">Coming up</h2>
            <Link to="/appointments" className="flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700">
              All appointments <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-4">
            {data.upcoming.length ? (
              <div className="card divide-y divide-stone-100 overflow-hidden">
                {data.upcoming.map((a) => (
                  <AppointmentRow key={a._id} appointment={a} role={user.role} onChanged={load} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<CalendarClock className="h-6 w-6" />}
                title="Nothing booked yet"
                text={isBusiness ? "New booking requests will show up here." : "Find a service and book your first appointment."}
              />
            )}
          </div>
        </>
      )}
    </Page>
  );
}
