import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  Brain,
  Receipt,
  Plus,
  ScanLine,
  Wallet,
  TrendingUp,
  Sun,
  MessageSquareText,
  BarChart3,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import AppLayout from "../components/AppLayout";
import {
  Alert,
  Button,
  Card,
  CategoryBadge,
  EmptyState,
  Skeleton,
} from "../components/ui";
import analyticsService from "../services/analyticsService";
import { formatCurrency, formatDate, getStoredUser } from "../lib/format";

const StatCard = ({ label, value, description, icon: Icon, tone, loading }) => (
  <Card className="p-5">
    <div className="flex items-start justify-between">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${tone}`}>
        <Icon size={18} />
      </span>
    </div>
    {loading ? (
      <Skeleton className="mt-4 h-8 w-32" />
    ) : (
      <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
        {value}
      </p>
    )}
    <p className="mt-1 text-xs text-slate-400">{description}</p>
  </Card>
);

const QUICK_ACTIONS = [
  { label: "Add expense", hint: "Log a purchase", icon: Plus, to: "/expenses/add" },
  { label: "Scan a bill", hint: "Upload a receipt", icon: ScanLine, to: "/scan-bill" },
  { label: "AI insights", hint: "Understand habits", icon: Brain, to: "/insights" },
  { label: "Ask Spendora", hint: "Chat about spending", icon: MessageSquareText, to: "/ask-spendora" },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const user = getStoredUser();

  const [summary, setSummary] = useState({
    totalSpending: 0,
    monthlySpending: 0,
    todaySpending: 0,
    recentExpenses: [],
  });
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [summaryResult, monthlyResult] = await Promise.all([
        analyticsService.getSummary(),
        analyticsService.getMonthlySpending(),
      ]);

      setSummary({
        ...summaryResult,
        recentExpenses: summaryResult.recentExpenses || [],
      });
      setMonthlyData(monthlyResult.monthlySpending || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <AppLayout
      title={`Welcome back, ${firstName}`}
      subtitle="Here's a quick look at your spending."
      maxWidth="max-w-7xl"
      actions={
        <Button variant="primary" onClick={() => navigate("/expenses/add")}>
          <Plus size={16} />
          Add expense
        </Button>
      }
    >
      {error && (
        <div className="mb-6">
          <Alert
            type="error"
            action={
              <button onClick={load} className="shrink-0 font-medium underline">
                Retry
              </button>
            }
          >
            {error}
          </Alert>
        </div>
      )}

      {/* Hero */}
      <section className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-ink-900 via-ink-800 to-brand-800 p-6 text-white shadow-lg shadow-ink-900/20 sm:p-8">
        <div aria-hidden="true" className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-brand-400/20 blur-2xl" />
        <div aria-hidden="true" className="absolute -bottom-20 right-24 h-56 w-56 rounded-full bg-gold-400/15 blur-2xl" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-brand-200">Spent this month</p>
            {loading ? (
              <div className="mt-3 h-10 w-48 animate-pulse rounded-md bg-white/15" />
            ) : (
              <p className="mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl">
                {formatCurrency(summary.monthlySpending)}
              </p>
            )}
            <p className="mt-3 text-sm text-slate-300">
              {loading ? " " : "Current month to date"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate("/scan-bill")}
              className="inline-flex items-center gap-2 rounded-lg bg-gold-400 px-4 py-2.5 text-sm font-semibold text-ink-900 transition hover:bg-gold-300"
            >
              <ScanLine size={16} />
              Scan a bill
            </button>
            <button
              onClick={() => navigate("/insights")}
              className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2.5 text-sm font-medium text-white ring-1 ring-white/20 transition hover:bg-white/20"
            >
              <Brain size={16} />
              AI insights
            </button>
          </div>
        </div>
      </section>

      {/* Summary cards */}
      <section className="grid gap-4 sm:grid-cols-2">
        <StatCard
          label="Total spending"
          value={formatCurrency(summary.totalSpending)}
          description="All recorded expenses"
          icon={Wallet}
          tone="bg-brand-100 text-brand-700"
          loading={loading}
        />
        <StatCard
          label="Today"
          value={formatCurrency(summary.todaySpending)}
          description="Spent so far today"
          icon={Sun}
          tone="bg-amber-100 text-amber-600"
          loading={loading}
        />
      </section>

      {/* Chart + quick actions */}
      <section className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Monthly spending</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Based on your recorded expenses
              </p>
            </div>
            <Link
              to="/analytics"
              className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              Analytics
              <ArrowUpRight size={15} />
            </Link>
          </div>

          {loading ? (
            <div className="p-5">
              <Skeleton className="h-[280px] w-full" />
            </div>
          ) : monthlyData.length === 0 ? (
            <EmptyState
              icon={TrendingUp}
              title="No spending data yet"
              description="Add a few expenses and your monthly trend will appear here."
              action={
                <Button onClick={() => navigate("/expenses/add")}>
                  <Plus size={16} />
                  Add expense
                </Button>
              }
            />
          ) : (
            <div className="h-[300px] w-full p-3 sm:p-5">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0f8a7a" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#0f8a7a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#64748b" }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    width={56}
                    tick={{ fontSize: 12, fill: "#64748b" }}
                    tickFormatter={(v) => `₹${Number(v).toLocaleString("en-IN")}`}
                  />
                  <Tooltip
                    cursor={{ stroke: "#cbd5e1", strokeDasharray: "4 4" }}
                    contentStyle={{
                      border: "1px solid #e2e8f0",
                      borderRadius: 8,
                      boxShadow: "0 4px 12px rgba(15,23,42,0.08)",
                    }}
                    formatter={(value) => [formatCurrency(value), "Spending"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#0f8a7a"
                    strokeWidth={2.5}
                    fill="url(#spendFill)"
                    dot={{ r: 3, fill: "#0f8a7a", strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-semibold text-slate-900">Quick actions</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-1">
            {QUICK_ACTIONS.map(({ label, hint, icon: Icon, to }) => (
              <Link
                key={to}
                to={to}
                className="group flex items-center gap-3 rounded-lg border border-slate-200 p-3 transition hover:border-brand-200 hover:bg-brand-50/50"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition group-hover:bg-brand-100 group-hover:text-brand-600">
                  <Icon size={18} />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-slate-900">
                    {label}
                  </span>
                  <span className="hidden truncate text-xs text-slate-500 sm:block">
                    {hint}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </Card>
      </section>

      {/* Recent transactions */}
      <section className="mt-6">
        <Card className="overflow-hidden">
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Recent transactions</h2>
              <p className="mt-0.5 text-xs text-slate-500">Your latest recorded expenses</p>
            </div>
            <Link
              to="/expenses"
              className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              View all
              <ArrowUpRight size={15} />
            </Link>
          </div>

          {loading ? (
            <div className="divide-y divide-slate-100">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-4">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3.5 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          ) : summary.recentExpenses.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No transactions yet"
              description="Add your first expense to start tracking your spending."
              action={
                <Button onClick={() => navigate("/expenses/add")}>
                  <Plus size={16} />
                  Add your first expense
                </Button>
              }
            />
          ) : (
            <ul className="divide-y divide-slate-100">
              {summary.recentExpenses.map((expense) => (
                <li
                  key={expense._id}
                  className="flex items-center gap-3 px-5 py-4 transition hover:bg-slate-50"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-semibold text-slate-600">
                    {expense.title?.charAt(0)?.toUpperCase() || "E"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {expense.title}
                    </p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-slate-500">
                      <span>{formatDate(expense.date)}</span>
                      {expense.paymentMethod && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span>{expense.paymentMethod}</span>
                        </>
                      )}
                      {expense.source === "bill_scan" && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className="text-brand-600">Scanned</span>
                        </>
                      )}
                    </p>
                  </div>
                  <div className="hidden sm:block">
                    <CategoryBadge category={expense.category} />
                  </div>
                  <p className="w-24 shrink-0 text-right text-sm font-semibold text-slate-900 sm:w-28">
                    {formatCurrency(expense.amount)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>

      <p className="mt-8 flex items-center justify-center gap-1.5 text-xs text-slate-400">
        <BarChart3 size={13} />
        Want the full picture? Open Analytics for category breakdowns.
      </p>
    </AppLayout>
  );
};

export default Dashboard;
