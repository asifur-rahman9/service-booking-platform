import { useEffect, type ReactNode } from "react";
import { Brush, Dumbbell, GraduationCap, Hammer, Loader2, Sparkles, Wrench, X } from "lucide-react";
import type { AppointmentStatus } from "../lib/types";

export function Spinner({ className = "" }: { className?: string }) {
  return (
    <div className={`flex justify-center py-16 ${className}`}>
      <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
    </div>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-stone-900 sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 text-stone-600">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ icon, title, text, action }: { icon: ReactNode; title: string; text: string; action?: ReactNode }) {
  return (
    <div className="card flex flex-col items-center px-6 py-14 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-600">{icon}</div>
      <h3 className="font-semibold text-stone-900">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-stone-600">{text}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

const STATUS_STYLES: Record<AppointmentStatus | "paid" | "unpaid" | "hidden", string> = {
  pending: "bg-accent-100 text-accent-700",
  confirmed: "bg-brand-100 text-brand-700",
  completed: "bg-stone-200 text-stone-700",
  cancelled: "bg-stone-100 text-stone-500",
  paid: "bg-brand-100 text-brand-700",
  unpaid: "bg-accent-100 text-accent-700",
  hidden: "bg-stone-100 text-stone-500",
};

export function StatusBadge({ status }: { status: keyof typeof STATUS_STYLES }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLES[status]}`}>
      {status}
    </span>
  );
}

// Each category gets its own icon and color
const CATEGORY_STYLE: Record<string, { icon: typeof Sparkles; color: string }> = {
  Cleaning: { icon: Sparkles, color: "bg-brand-100 text-brand-700" },
  Tutoring: { icon: GraduationCap, color: "bg-violet-100 text-violet-800" },
  "Home Repair": { icon: Hammer, color: "bg-accent-100 text-accent-700" },
  Beauty: { icon: Brush, color: "bg-pink-100 text-pink-800" },
  Fitness: { icon: Dumbbell, color: "bg-sky-100 text-sky-800" },
  Other: { icon: Wrench, color: "bg-stone-100 text-stone-700" },
};

export function CategoryIcon({ category, size = "md" }: { category: string; size?: "md" | "lg" }) {
  const { icon: Icon, color } = CATEGORY_STYLE[category] ?? CATEGORY_STYLE.Other;
  const box = size === "lg" ? "h-14 w-14 rounded-2xl" : "h-11 w-11 rounded-xl";
  return (
    <div className={`flex shrink-0 items-center justify-center ${box} ${color}`}>
      <Icon className={size === "lg" ? "h-7 w-7" : "h-5 w-5"} />
    </div>
  );
}

export function CategoryTag({ category }: { category: string }) {
  const { color } = CATEGORY_STYLE[category] ?? CATEGORY_STYLE.Other;
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${color}`}>{category}</span>;
}

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  // close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-stone-900/40 p-4" onClick={onClose}>
      <div className="card max-h-[90vh] w-full max-w-lg overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-stone-900">{title}</h2>
          <button className="btn btn-ghost p-2" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function ErrorText({ error }: { error: string }) {
  if (!error) return null;
  return <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>;
}

export function SuccessText({ message }: { message: string }) {
  if (!message) return null;
  return <p className="rounded-xl bg-brand-100 px-3 py-2 text-sm text-brand-700">{message}</p>;
}
