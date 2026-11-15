import { useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import type { User } from "../lib/types";
import { Page } from "../components/Layout";
import { ErrorText, PageHeader, SuccessText } from "../components/ui";

export default function Settings() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name ?? "",
    phone: user?.phone ?? "",
    address: user?.address ?? "",
    businessName: user?.business?.name ?? "",
    description: user?.business?.description ?? "",
    city: user?.business?.city ?? "",
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  if (!user) return null;
  const isBusiness = user.role === "business";
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value });

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const data = await api<{ user: User }>("/auth/me", {
        method: "PATCH",
        body: {
          name: form.name,
          phone: form.phone,
          address: form.address,
          business: isBusiness ? { name: form.businessName, description: form.description, city: form.city } : undefined,
        },
      });
      setUser(data.user);
      setMessage("Saved!");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Page>
      <PageHeader title="Your profile" subtitle={user.email} />
      <form className="card max-w-2xl space-y-4 p-7" onSubmit={save}>
        {isBusiness && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="businessName">Business name</label>
                <input id="businessName" className="input" required value={form.businessName} onChange={set("businessName")} />
              </div>
              <div>
                <label className="label" htmlFor="city">City</label>
                <input id="city" className="input" value={form.city} onChange={set("city")} />
              </div>
            </div>
            <div>
              <label className="label" htmlFor="description">About your business</label>
              <textarea id="description" className="input" rows={3} value={form.description} onChange={set("description")} />
            </div>
          </>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="name">Your name</label>
            <input id="name" className="input" required value={form.name} onChange={set("name")} />
          </div>
          <div>
            <label className="label" htmlFor="phone">Phone</label>
            <input id="phone" className="input" value={form.phone} onChange={set("phone")} />
          </div>
        </div>
        {!isBusiness && (
          <div>
            <label className="label" htmlFor="address">Address</label>
            <input id="address" className="input" value={form.address} onChange={set("address")} />
          </div>
        )}
        <ErrorText error={error} />
        <SuccessText message={message} />
        <div className="flex justify-end">
          <button className="btn btn-primary" disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </Page>
  );
}
