export const CATEGORIES = [
  "Food",
  "Shopping",
  "Travel",
  "Bills",
  "Entertainment",
  "Health",
  "Education",
  "Other",
];

export const PAYMENT_METHODS = ["Cash", "UPI", "Card", "Net Banking", "Other"];

const CATEGORY_STYLES = {
  Food: { badge: "bg-orange-50 text-orange-700 ring-orange-200", color: "#f97316" },
  Shopping: { badge: "bg-pink-50 text-pink-700 ring-pink-200", color: "#ec4899" },
  Travel: { badge: "bg-sky-50 text-sky-700 ring-sky-200", color: "#0ea5e9" },
  Bills: { badge: "bg-amber-50 text-amber-700 ring-amber-200", color: "#f59e0b" },
  Entertainment: { badge: "bg-violet-50 text-violet-700 ring-violet-200", color: "#8b5cf6" },
  Health: { badge: "bg-emerald-50 text-emerald-700 ring-emerald-200", color: "#10b981" },
  Education: { badge: "bg-indigo-50 text-indigo-700 ring-indigo-200", color: "#6366f1" },
  Other: { badge: "bg-slate-100 text-slate-700 ring-slate-200", color: "#64748b" },
};

export const getCategoryStyle = (category) =>
  CATEGORY_STYLES[category] || CATEGORY_STYLES.Other;

export const formatCurrency = (amount, digits = 2) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: digits,
  }).format(Number(amount) || 0);

export const formatDate = (value, options) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(
    "en-IN",
    options || { day: "2-digit", month: "short", year: "numeric" },
  );
};

export const todayISO = () => {
  const d = new Date();
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 10);
};

export const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user")) || null;
  } catch {
    return null;
  }
};

export const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
