import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MapPin } from "lucide-react";
import { api } from "../lib/api";
import type { Service } from "../lib/types";
import { businessName, formatDate, formatDuration, formatMoney, formatTime, ymd } from "../lib/format";
import { useAuth } from "../lib/auth";
import { Page } from "../components/Layout";
import { CategoryIcon, CategoryTag, ErrorText, Spinner } from "../components/ui";

// The next 14 days, starting today
const days: Date[] = [];
for (let i = 0; i < 14; i++) {
  const d = new Date();
  d.setDate(d.getDate() + i);
  days.push(d);
}

export default function ServiceDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [day, setDay] = useState(ymd(days[1]));
  const [slots, setSlots] = useState<string[]>([]);
  const [slot, setSlot] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    api<{ service: Service }>(`/services/${id}`)
      .then((data) => setService(data.service))
      .catch(() => setService(null))
      .finally(() => setLoading(false));
  }, [id]);

  function loadSlots() {
    api<{ slots: string[] }>(`/services/${id}/availability?date=${day}&tz=${new Date().getTimezoneOffset()}`).then((data) =>
      setSlots(data.slots),
    );
  }

  // Load open times when the selected day changes
  useEffect(() => {
    setSlot(null);
    loadSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, day]);

  async function book() {
    setBooking(true);
    setError("");
    try {
      await api("/appointments", { method: "POST", body: { serviceId: id, start: slot, notes } });
      navigate("/appointments");
    } catch (err) {
      setError((err as Error).message);
      loadSlots(); // someone may have just taken that time
    } finally {
      setBooking(false);
    }
  }

  if (loading) return <Spinner />;
  if (!service) return <Page><ErrorText error="Service not found" /></Page>;
  const biz = typeof service.business === "object" ? service.business : undefined;

  return (
    <Page>
      <Link to="/services" className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-stone-600 hover:text-stone-900">
        <ArrowLeft className="h-4 w-4" /> All services
      </Link>
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <div className="card p-8">
            <div className="flex items-center gap-3">
              <CategoryIcon category={service.category} size="lg" />
              <CategoryTag category={service.category} />
            </div>
            <h1 className="mt-5 text-4xl font-bold text-stone-900">{service.name}</h1>
            <p className="mt-3 text-stone-700">{service.description || "No description yet."}</p>
            <div className="mt-7 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-paper px-5 py-4">
                <p className="text-sm text-stone-600">Price</p>
                <p className="font-display text-2xl font-bold text-brand-600">{formatMoney(service.price)}</p>
              </div>
              <div className="rounded-2xl bg-paper px-5 py-4">
                <p className="text-sm text-stone-600">Duration</p>
                <p className="font-display text-2xl font-bold text-stone-900">{formatDuration(service.durationMinutes)}</p>
              </div>
            </div>
          </div>
          {biz && (
            <div className="card flex items-center gap-4 p-6">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-900 font-bold text-accent-400">
                {businessName(biz).charAt(0)}
              </span>
              <div>
                <p className="font-semibold text-stone-900">{businessName(biz)}</p>
                {biz.business?.city && (
                  <p className="flex items-center gap-1 text-sm text-stone-600">
                    <MapPin className="h-3.5 w-3.5" /> {biz.business.city}
                  </p>
                )}
                {biz.business?.description && <p className="mt-1 text-sm text-stone-600">{biz.business.description}</p>}
              </div>
            </div>
          )}
        </div>

        {/* Booking panel */}
        <div className="lg:col-span-2">
          <div className="card sticky top-24 p-7">
            <h2 className="text-2xl font-bold text-stone-900">Book a time</h2>
            <p className="mt-1 text-sm text-stone-600">Open 9:00 to 17:00.</p>

            <div className="-mx-1 mt-5 flex gap-2 overflow-x-auto px-1 pb-2">
              {days.map((d) => {
                const value = ymd(d);
                return (
                  <button
                    key={value}
                    onClick={() => setDay(value)}
                    className={`flex w-14 shrink-0 flex-col items-center rounded-2xl border py-2 text-xs transition ${
                      value === day ? "border-brand-600 bg-brand-600 text-white" : "border-line bg-white text-stone-700 hover:border-brand-600/40"
                    }`}
                  >
                    <span className="font-medium">{d.toLocaleDateString("en-CA", { weekday: "short" })}</span>
                    <span className="text-lg font-bold">{d.getDate()}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 min-h-24">
              {slots.length ? (
                <div className="grid grid-cols-3 gap-2">
                  {slots.map((t) => (
                    <button
                      key={t}
                      onClick={() => setSlot(t)}
                      className={`rounded-xl border py-2.5 text-sm font-medium transition ${
                        slot === t ? "border-accent-400 bg-accent-100 font-semibold text-accent-700" : "border-line bg-white text-stone-700 hover:border-brand-600/40"
                      }`}
                    >
                      {formatTime(t)}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="rounded-xl bg-paper px-3 py-6 text-center text-sm text-stone-600">No open times on this day. Try another one.</p>
              )}
            </div>

            <label className="label mt-5" htmlFor="notes">Notes for the business (optional)</label>
            <textarea id="notes" className="input" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything they should know?" />

            <div className="mt-5 space-y-3">
              <ErrorText error={error} />
              {slot && (
                <div className="flex justify-between rounded-xl bg-paper px-4 py-3 text-sm text-stone-700">
                  <span>{formatDate(slot)} · {formatTime(slot)}</span>
                  <span className="font-bold text-stone-900">{formatMoney(service.price)}</span>
                </div>
              )}
              {!user ? (
                <Link to="/login" state={{ from: `/services/${service._id}` }} className="btn btn-primary w-full py-3">
                  Log in to book
                </Link>
              ) : user.role === "business" ? (
                <p className="text-center text-sm text-stone-600">Business accounts can't book services.</p>
              ) : (
                <button className="btn btn-primary w-full py-3" disabled={!slot || booking} onClick={book}>
                  {booking ? "Booking…" : "Request booking"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
}
