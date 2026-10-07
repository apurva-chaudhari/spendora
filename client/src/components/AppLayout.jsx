import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Receipt,
  Plus,
  ScanLine,
  BarChart3,
  Brain,
  MessageSquareText,
  LogOut,
  Menu,
  X,
  CalendarDays,
} from "lucide-react";
import { getStoredUser } from "../lib/format";

const NAVIGATION = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Expenses", path: "/expenses", icon: Receipt },
  { label: "Add Expense", path: "/expenses/add", icon: Plus },
  { label: "Scan Bill", path: "/scan-bill", icon: ScanLine, also: ["/review-bill"] },
  { label: "Analytics", path: "/analytics", icon: BarChart3 },
  { label: "AI Insights", path: "/insights", icon: Brain },
  { label: "Ask Spendora", path: "/ask-spendora", icon: MessageSquareText },
];

const Avatar = ({ user, size = "h-9 w-9 text-sm" }) => (
  <div
    className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-700 font-semibold text-white ring-2 ring-white/20 ${size}`}
  >
    {user?.name?.charAt(0)?.toUpperCase() || "U"}
  </div>
);

const SidebarContent = ({ pathname, user, onNavigate, onLogout }) => (
  <div className="flex h-full flex-col bg-gradient-to-b from-ink-900 to-ink-950 text-white">
    <Link
      to="/dashboard"
      onClick={onNavigate}
      className="flex h-16 shrink-0 items-center gap-3 border-b border-white/10 px-5"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-700 text-lg font-extrabold text-white shadow-lg shadow-brand-900/40">
        S
      </div>
      <div>
        <p className="text-base font-bold leading-tight tracking-tight text-white">
          Spendora
        </p>
        <p className="text-[11px] leading-tight text-brand-300">
          Personal finance
        </p>
      </div>
    </Link>

    <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5" aria-label="Main">
      {NAVIGATION.map((item) => {
        const Icon = item.icon;
        const active =
          pathname === item.path || (item.also || []).includes(pathname);

        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              active
                ? "bg-white/10 text-white"
                : "text-slate-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            {active && (
              <span className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-gold-400" />
            )}
            <Icon size={18} strokeWidth={active ? 2.2 : 1.8} className={active ? "text-gold-400" : ""} />
            {item.label}
          </Link>
        );
      })}
    </nav>

    <div className="shrink-0 border-t border-white/10 p-3">
      <div className="mb-1 flex items-center gap-3 px-2 py-2">
        <Avatar user={user} size="h-8 w-8 text-xs" />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">
            {user?.name || "User"}
          </p>
          <p className="truncate text-xs text-slate-400">{user?.email || ""}</p>
        </div>
      </div>
      <button
        onClick={onLogout}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-red-500/10 hover:text-red-300"
      >
        <LogOut size={18} strokeWidth={1.8} />
        Logout
      </button>
    </div>
  </div>
);

const AppLayout = ({ title, subtitle, actions, children, maxWidth = "max-w-6xl" }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const user = getStoredUser();
  const [menuOpen, setMenuOpen] = useState(false);

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (event) => event.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#f2f6fa] text-slate-900">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">
        <SidebarContent pathname={pathname} user={user} onLogout={handleLogout} />
      </aside>

      {/* Mobile header */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between bg-ink-900 px-4 text-white lg:hidden">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMenuOpen(true)}
            className="rounded-lg p-2 text-slate-200 hover:bg-white/10"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          <span className="text-base font-semibold tracking-tight">Spendora</span>
        </div>
        <Avatar user={user} />
      </header>

      {/* Mobile drawer */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 lg:hidden"
          onClick={() => setMenuOpen(false)}
        >
          <aside
            className="relative h-full w-72 max-w-[85%] shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              className="absolute right-3 top-4 z-10 rounded-lg p-1.5 text-slate-300 hover:bg-white/10"
            >
              <X size={20} />
            </button>
            <SidebarContent
              pathname={pathname}
              user={user}
              onNavigate={() => setMenuOpen(false)}
              onLogout={handleLogout}
            />
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        {/* Desktop top bar */}
        <div className="sticky top-0 z-20 hidden h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-8 backdrop-blur lg:flex">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <CalendarDays size={16} />
            <span>{today}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-900">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-slate-500">Personal account</p>
            </div>
            <Avatar user={user} />
          </div>
        </div>

        <main className={`mx-auto w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8 ${maxWidth}`}>
          {(title || actions) && (
            <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
                  {title}
                </h1>
                {subtitle && (
                  <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p>
                )}
              </div>
              {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
