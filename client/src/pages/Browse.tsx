import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SearchX } from "lucide-react";
import { api } from "../lib/api";
import { CATEGORIES, type Service } from "../lib/types";
import { ServiceCard } from "../components/ServiceCard";
import { EmptyState, Spinner } from "../components/ui";

export default function Browse() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const category = params.get("category") ?? "";
  const [text, setText] = useState(q);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // Reload whenever the search or category in the URL changes
  useEffect(() => {
    setLoading(true);
    api<{ services: Service[] }>(`/services?q=${encodeURIComponent(q)}&category=${encodeURIComponent(category)}`)
      .then((data) => setServices(data.services))
      .finally(() => setLoading(false));
  }, [q, category]);

  function update(next: { q?: string; category?: string }) {
    const p = new URLSearchParams(params);
    for (const [k, v] of Object.entries(next)) {
      if (v) p.set(k, v);
      else p.delete(k);
    }
    setParams(p);
  }

  return (
    <>
      <section className="bg-brand-900">
        <div className="mx-auto max-w-6xl px-4 pb-12 pt-10 sm:px-6">
          <h1 className="text-4xl font-bold text-white sm:text-5xl">Find a service</h1>
          <p className="mt-3 text-brand-100">Book local businesses in Montreal and Laval.</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              update({ q: text });
            }}
            className="mt-7 flex max-w-2xl gap-2 rounded-2xl bg-white p-2"
          >
            <label className="flex flex-1 items-center gap-2 px-2">
              <Search className="h-5 w-5 text-stone-500" />
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Search services, e.g. car wash"
                className="w-full bg-transparent py-2 text-stone-900 outline-none placeholder:text-stone-400"
              />
            </label>
            <button className="btn btn-accent px-5">Search</button>
          </form>
          <div className="mt-5 flex flex-wrap gap-2">
            {["", ...CATEGORIES].map((c) => (
              <button
                key={c || "all"}
                onClick={() => update({ category: c })}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  category === c ? "bg-accent-400 font-semibold text-brand-900" : "border border-white/25 text-white hover:bg-white/10"
                }`}
              >
                {c || "All"}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {loading ? (
          <Spinner />
        ) : services.length ? (
          <>
            <p className="mb-4 text-sm text-stone-600">
              {services.length} service{services.length === 1 ? "" : "s"}
            </p>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((s) => (
                <ServiceCard key={s._id} service={s} />
              ))}
            </div>
          </>
        ) : (
          <EmptyState icon={<SearchX className="h-6 w-6" />} title="No services found" text="Try a different search or category." />
        )}
      </div>
    </>
  );
}
