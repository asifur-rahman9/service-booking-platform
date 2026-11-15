import { useEffect, useState } from "react";
import { Receipt } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import type { Invoice } from "../lib/types";
import { businessName, formatDate, formatMoney } from "../lib/format";
import { Page } from "../components/Layout";
import { EmptyState, ErrorText, PageHeader, Spinner, StatusBadge } from "../components/ui";

export default function Invoices() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[] | null>(null);
  const [error, setError] = useState("");

  function load() {
    api<{ invoices: Invoice[] }>("/invoices").then((data) => setInvoices(data.invoices));
  }
  useEffect(load, []);

  // There's no real payment provider: this just marks the invoice as paid
  async function pay(invoice: Invoice) {
    if (!confirm(`Pay ${formatMoney(invoice.amount)} for ${invoice.description}?`)) return;
    setError("");
    try {
      await api(`/invoices/${invoice._id}/pay`, { method: "POST" });
      load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  if (!user) return null;
  const isBusiness = user.role === "business";
  const list = invoices ?? [];
  let unpaid = 0;
  let paid = 0;
  for (const inv of list) {
    if (inv.status === "paid") paid += inv.amount;
    else unpaid += inv.amount;
  }

  return (
    <Page>
      <PageHeader
        title={isBusiness ? "Invoices" : "Billing"}
        subtitle={isBusiness ? "Invoices are created when you mark a job as done." : "Pay for completed services."}
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="card p-6">
          <p className="text-sm text-stone-600">{isBusiness ? "Waiting on payment" : "To pay"}</p>
          <p className="mt-1 font-display text-3xl font-bold text-accent-700">{formatMoney(unpaid)}</p>
        </div>
        <div className="card p-6">
          <p className="text-sm text-stone-600">{isBusiness ? "Collected" : "Paid so far"}</p>
          <p className="mt-1 font-display text-3xl font-bold text-brand-600">{formatMoney(paid)}</p>
        </div>
      </div>
      <div className="mb-4">
        <ErrorText error={error} />
      </div>

      {!invoices ? (
        <Spinner />
      ) : list.length ? (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-paper text-xs uppercase tracking-wide text-stone-600">
              <tr>
                <th className="px-5 py-3 font-semibold">Service</th>
                <th className="px-5 py-3 font-semibold">{isBusiness ? "Customer" : "Business"}</th>
                <th className="px-5 py-3 font-semibold">Date</th>
                <th className="px-5 py-3 font-semibold">Amount</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                {!isBusiness && <th className="px-5 py-3" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {list.map((inv) => (
                <tr key={inv._id}>
                  <td className="px-5 py-4 font-medium text-stone-900">{inv.description}</td>
                  <td className="px-5 py-4 text-stone-600">{isBusiness ? inv.customer.name : businessName(inv.business)}</td>
                  <td className="px-5 py-4 text-stone-600">{formatDate(inv.createdAt)}</td>
                  <td className="px-5 py-4 font-semibold text-stone-900">{formatMoney(inv.amount)}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={inv.status} />
                  </td>
                  {!isBusiness && (
                    <td className="px-5 py-4 text-right">
                      {inv.status === "unpaid" && (
                        <button className="btn btn-primary py-2" onClick={() => pay(inv)}>
                          Pay
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState icon={<Receipt className="h-6 w-6" />} title="No invoices yet" text="Invoices show up here once a booked service is done." />
      )}
    </Page>
  );
}
