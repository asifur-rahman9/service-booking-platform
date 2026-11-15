import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, CalendarDays, CreditCard, Search } from "lucide-react";
import { api } from "../lib/api";
import { CATEGORIES, type Service } from "../lib/types";
import { ServiceCard } from "../components/ServiceCard";
import { useAuth } from "../lib/auth";

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [q, setQ] = useState("");
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    api<{ services: Service[] }>("/services").then((data) => setServices(data.services));
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="bg-brand-900 text-white">
        <div className="mx-auto max-w-6xl px-4 pb-20 pt-14 sm:px-6">
          <h1 className="max-w-3xl text-5xl font-bold leading-[1.05] sm:text-6xl">Book a local pro in minutes.</h1>
          <p className="mt-5 max-w-xl text-lg text-brand-100">
            Car care, tutoring, home repairs and more. Pick a time that works, get it confirmed, and pay when it's done.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              navigate(`/services?q=${encodeURIComponent(q)}`);
            }}
            className="mt-8 flex max-w-xl gap-2 rounded-2xl bg-white p-2"
          >
            <label className="flex flex-1 items-center gap-2 px-2">
              <Search className="h-5 w-5 text-stone-500" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="What do you need done?"
                className="w-full bg-transparent py-2 text-stone-900 outline-none placeholder:text-stone-400"
              />
            </label>
            <button className="btn btn-accent px-5">Search</button>
          </form>
          <div className="mt-6 flex flex-wrap gap-2">
            {CATEGORIES.slice(0, 5).map((c) => (
              <Link
                key={c}
                to={`/services?category=${encodeURIComponent(c)}`}
                className="rounded-full border border-white/25 px-4 py-2 text-sm font-medium hover:bg-white/10"
              >
                {c}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular services */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="text-3xl font-bold text-stone-900">Popular right now</h2>
          <Link to="/services" className="flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700">
            See all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.slice(0, 6).map((s) => (
            <ServiceCard key={s._id} service={s} />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="card grid gap-8 p-8 md:grid-cols-3">
          {[
            { icon: <Search className="h-5 w-5" />, title: "Find a service", text: "Search or browse by category. Prices and durations are shown up front." },
            { icon: <CalendarDays className="h-5 w-5" />, title: "Pick a time", text: "See open times for the day you want. The business confirms your request." },
            { icon: <CreditCard className="h-5 w-5" />, title: "Pay when it's done", text: "You get an invoice once the job is finished." },
          ].map((step, i) => (
            <div key={step.title}>
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-600">{step.icon}</span>
                <span className="text-sm font-semibold text-accent-700">Step {i + 1}</span>
              </div>
              <h3 className="font-display text-lg font-bold text-stone-900">{step.title}</h3>
              <p className="mt-1 text-sm text-stone-600">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* For businesses */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-brand-900 p-8 text-white sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-bold">Run a small business?</h2>
            <p className="mt-2 max-w-lg text-sm text-brand-100">List your services, accept bookings and keep track of who has paid.</p>
          </div>
          <Link to={user ? "/dashboard" : "/signup?role=business"} className="btn btn-accent">
            {user?.role === "business" ? "Go to your dashboard" : "List your business"} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
