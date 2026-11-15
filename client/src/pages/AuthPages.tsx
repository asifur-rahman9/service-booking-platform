import { useState, type FormEvent, type ReactNode } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Store, UserRound } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import type { Role, User } from "../lib/types";
import { Logo } from "../components/Layout";
import { ErrorText } from "../components/ui";

function AuthCard({ title, subtitle, children }: { title: string; subtitle: ReactNode; children: ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo />
          <h1 className="mt-6 text-3xl font-bold text-stone-900">{title}</h1>
          <p className="mt-1 text-sm text-stone-500">{subtitle}</p>
        </div>
        <div className="card p-7 sm:p-8">{children}</div>
      </div>
    </div>
  );
}

export function Login() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function login(email: string, password: string) {
    setLoading(true);
    setError("");
    try {
      const data = await api<{ user: User }>("/auth/login", { method: "POST", body: { email, password } });
      setUser(data.user);
      navigate(from, { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }
  const submit = (e: FormEvent) => {
    e.preventDefault();
    login(email, password);
  };

  return (
    <AuthCard
      title="Welcome back"
      subtitle={
        <>
          New here?{" "}
          <Link to="/signup" className="font-semibold text-brand-600 hover:text-brand-700">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </div>
        <div>
          <label className="label">Password</label>
          <input className="input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        </div>
        <ErrorText error={error} />
        <button className="btn btn-primary w-full py-3" disabled={loading}>
          {loading ? "Logging in…" : "Log in"}
        </button>
      </form>
      <div className="mt-6 rounded-2xl bg-paper p-4 text-xs text-stone-600">
        <p className="mb-2 font-semibold text-stone-700">Demo accounts (password demo1234)</p>
        <div className="flex flex-wrap gap-2">
          {[
            ["alex@example.com", "Customer"],
            ["maya@sparkle.ca", "Business"],
          ].map(([e, label]) => (
            <button
              key={e}
              type="button"
              onClick={() => login(e, "demo1234")}
              className="rounded-lg border border-line bg-white px-2.5 py-1.5 font-medium text-stone-700 hover:border-brand-600/40"
            >
              {label}: {e}
            </button>
          ))}
        </div>
      </div>
    </AuthCard>
  );
}

export function Signup() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [role, setRole] = useState<Role>(params.get("role") === "business" ? "business" : "customer");
  const [form, setForm] = useState({ name: "", email: "", password: "", businessName: "", city: "" });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function signup(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await api<{ user: User }>("/auth/register", { method: "POST", body: { role, ...form } });
      setUser(data.user);
      navigate(data.user.role === "business" ? "/my-services" : "/services", { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle={
        <>
          Already have one?{" "}
          <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
            Log in
          </Link>
        </>
      }
    >
      <div className="mb-6 grid grid-cols-2 gap-2">
        {(
          [
            ["customer", "I want to book", UserRound],
            ["business", "I run a business", Store],
          ] as const
        ).map(([value, label, Icon]) => (
          <button
            key={value}
            type="button"
            onClick={() => setRole(value)}
            className={`flex flex-col items-center gap-1 rounded-xl border p-3 text-sm font-medium transition ${
              role === value ? "border-brand-600 bg-brand-100 text-brand-700" : "border-line text-stone-600 hover:border-stone-300"
            }`}
          >
            <Icon className="h-5 w-5" />
            {label}
          </button>
        ))}
      </div>
      <form onSubmit={signup} className="space-y-4">
        {role === "business" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Business name</label>
              <input className="input" required value={form.businessName} onChange={set("businessName")} />
            </div>
            <div>
              <label className="label">City</label>
              <input className="input" value={form.city} onChange={set("city")} placeholder="Montreal" />
            </div>
          </div>
        )}
        <div>
          <label className="label">Your name</label>
          <input className="input" required value={form.name} onChange={set("name")} autoComplete="name" />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" required value={form.email} onChange={set("email")} autoComplete="email" />
        </div>
        <div>
          <label className="label">Password</label>
          <input className="input" type="password" required minLength={8} value={form.password} onChange={set("password")} autoComplete="new-password" />
          <p className="mt-1 text-xs text-stone-500">At least 8 characters.</p>
        </div>
        <ErrorText error={error} />
        <button className="btn btn-primary w-full py-3" disabled={loading}>
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>
    </AuthCard>
  );
}
