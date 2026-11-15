import { useEffect, useState } from "react";
import { Eye, EyeOff, Layers, Pencil, Plus, Trash2 } from "lucide-react";
import { api } from "../../lib/api";
import { CATEGORIES, type Service } from "../../lib/types";
import { formatDuration, formatMoney } from "../../lib/format";
import { Page } from "../../components/Layout";
import { CategoryIcon, EmptyState, ErrorText, Modal, PageHeader, Spinner, StatusBadge } from "../../components/ui";

type Form = { name: string; description: string; category: string; price: string; durationMinutes: string };
const EMPTY: Form = { name: "", description: "", category: "Cleaning", price: "", durationMinutes: "60" };

export default function MyServices() {
  const [services, setServices] = useState<Service[] | null>(null);
  const [editing, setEditing] = useState<Service | "new" | null>(null);
  const [form, setForm] = useState<Form>(EMPTY);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function load() {
    api<{ services: Service[] }>("/services/mine").then((data) => setServices(data.services));
  }
  useEffect(load, []);

  function openForm(s: Service | "new") {
    setEditing(s);
    setError("");
    if (s === "new") setForm(EMPTY);
    else setForm({ name: s.name, description: s.description, category: s.category, price: String(s.price), durationMinutes: String(s.durationMinutes) });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const body = { ...form, price: Number(form.price), durationMinutes: Number(form.durationMinutes) };
    try {
      if (editing === "new") await api("/services", { method: "POST", body });
      else await api(`/services/${(editing as Service)._id}`, { method: "PATCH", body });
      setEditing(null);
      load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleVisible(s: Service) {
    await api(`/services/${s._id}`, { method: "PATCH", body: { active: !s.active } });
    load();
  }

  async function remove(s: Service) {
    if (!confirm(`Delete "${s.name}"?`)) return;
    try {
      await api(`/services/${s._id}`, { method: "DELETE" });
      load();
    } catch (err) {
      alert((err as Error).message);
    }
  }

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target.value });

  return (
    <Page>
      <PageHeader
        title="My services"
        subtitle="What customers can book from you. Hidden services can't be booked."
        action={
          <button className="btn btn-accent" onClick={() => openForm("new")}>
            <Plus className="h-4 w-4" /> Add service
          </button>
        }
      />
      {!services ? (
        <Spinner />
      ) : services.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {services.map((s) => (
            <div key={s._id} className={`card flex flex-col p-6 ${s.active ? "" : "opacity-70"}`}>
              <div className="flex items-start gap-3">
                <CategoryIcon category={s.category} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate font-display text-lg font-bold text-stone-900">{s.name}</h3>
                    {!s.active && <StatusBadge status="hidden" />}
                  </div>
                  <p className="text-sm text-stone-600">
                    {s.category} · {formatDuration(s.durationMinutes)}
                  </p>
                </div>
                <span className="text-lg font-bold text-brand-600">{formatMoney(s.price)}</span>
              </div>
              <p className="mt-3 line-clamp-2 flex-1 text-sm text-stone-700">{s.description}</p>
              <div className="mt-4 flex gap-2 border-t border-stone-100 pt-4">
                <button className="btn btn-secondary" onClick={() => openForm(s)}>
                  <Pencil className="h-4 w-4" /> Edit
                </button>
                <button className="btn btn-secondary" onClick={() => toggleVisible(s)}>
                  {s.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />} {s.active ? "Hide" : "Show"}
                </button>
                <button className="btn btn-ghost ml-auto p-2.5 text-red-700 hover:bg-red-50" onClick={() => remove(s)} aria-label="Delete">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon={<Layers className="h-6 w-6" />} title="No services yet" text="Add your first service so customers can book you." />
      )}

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === "new" ? "Add a service" : "Edit service"}>
        <form className="space-y-4" onSubmit={save}>
          <div>
            <label className="label" htmlFor="svc-name">Name</label>
            <input id="svc-name" className="input" required value={form.name} onChange={set("name")} placeholder="e.g. Full detail" />
          </div>
          <div>
            <label className="label" htmlFor="svc-desc">Description</label>
            <textarea id="svc-desc" className="input" rows={3} value={form.description} onChange={set("description")} placeholder="What's included?" />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="label" htmlFor="svc-cat">Category</label>
              <select id="svc-cat" className="input" value={form.category} onChange={set("category")}>
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="svc-price">Price ($)</label>
              <input id="svc-price" className="input" type="number" min="0" step="0.01" required value={form.price} onChange={set("price")} />
            </div>
            <div>
              <label className="label" htmlFor="svc-dur">Duration</label>
              <select id="svc-dur" className="input" value={form.durationMinutes} onChange={set("durationMinutes")}>
                {[15, 30, 45, 60, 90, 120, 180, 240].map((m) => (
                  <option key={m} value={m}>
                    {formatDuration(m)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <ErrorText error={error} />
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn btn-secondary" onClick={() => setEditing(null)}>
              Cancel
            </button>
            <button className="btn btn-primary" disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </Modal>
    </Page>
  );
}
