import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { CalendarCheck, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "../lib/auth";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-4 py-2 text-sm font-medium transition ${isActive ? "bg-accent-400 font-semibold text-brand-900" : "text-brand-100 hover:bg-white/10 hover:text-white"}`;

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className={`flex items-center gap-2 font-display text-lg font-bold ${light ? "text-white" : "text-stone-900"}`}>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-400 text-brand-900">
        <CalendarCheck className="h-4.5 w-4.5" />
      </span>
      Service Manager
    </Link>
  );
}

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const links = !user
    ? [{ to: "/services", label: "Browse services" }]
    : user.role === "business"
      ? [
          { to: "/dashboard", label: "Dashboard" },
          { to: "/my-services", label: "My services" },
          { to: "/appointments", label: "Appointments" },
          { to: "/invoices", label: "Invoices" },
        ]
      : [
          { to: "/services", label: "Browse" },
          { to: "/dashboard", label: "Overview" },
          { to: "/appointments", label: "My bookings" },
          { to: "/invoices", label: "Billing" },
        ];

  const onLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 bg-brand-900">
        <div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-8">
            <Logo light />
            <nav className="hidden items-center gap-1 rounded-full bg-white/10 p-1 md:flex">
              {links.map((l) => (
                <NavLink key={l.to} to={l.to} className={linkClass}>
                  {l.label}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            {user ? (
              <>
                <NavLink to="/settings" className="flex items-center gap-2 rounded-full px-2 py-1.5 hover:bg-white/10">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="text-sm font-medium text-white">{user.role === "business" ? user.business?.name : user.name}</span>
                </NavLink>
                <button onClick={onLogout} className="btn p-2.5 text-brand-100 hover:bg-white/10" title="Log out" aria-label="Log out">
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn text-white hover:bg-white/10">
                  Log in
                </Link>
                <Link to="/signup" className="btn btn-accent">
                  Sign up
                </Link>
              </>
            )}
          </div>
          <button className="btn p-2.5 text-white hover:bg-white/10 md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {open && (
          <nav className="flex flex-col gap-1 border-t border-white/10 px-4 py-3 md:hidden" onClick={() => setOpen(false)}>
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} className={linkClass}>
                {l.label}
              </NavLink>
            ))}
            {user ? (
              <>
                <NavLink to="/settings" className={linkClass}>
                  Settings
                </NavLink>
                <button onClick={onLogout} className="rounded-full px-4 py-2 text-left text-sm font-medium text-brand-100 hover:bg-white/10">
                  Log out
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={linkClass}>
                  Log in
                </NavLink>
                <NavLink to="/signup" className={linkClass}>
                  Sign up
                </NavLink>
              </>
            )}
          </nav>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-6 text-sm text-stone-500 sm:px-6">
          <span>© 2026 Service Manager</span>
          <span>React · Node.js · Express · MongoDB</span>
        </div>
      </footer>
    </div>
  );
}

/** Page wrapper with consistent width and padding. */
export function Page({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">{children}</div>;
}
