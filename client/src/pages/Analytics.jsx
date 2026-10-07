import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3, CalendarDays, PieChart as PieIcon, Plus, Tag, Wallet } from "lucide-react";

import AppLayout from "../components/AppLayout";
import { Alert, Card, EmptyState, Skeleton } from "../components/ui";
import analyticsService from "../services/analyticsService";
import { formatCurrency, getCategoryStyle } from "../lib/format";

const AddLink = () => (
  <Link
    to="/expenses/add"
    className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
  >
    <Plus size={16} />
    Add expense
  </Link>
);

const Stat = ({ icon: Icon, label, value, sub, tone, loading }) => (
  <Card className="p-5">
    <div className="flex items-start justify-between">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${tone}`}>
        <Icon size={18} />
      </span>
    </div>
    {loading ? (
      <Skeleton className="mt-4 h-8 w-28" />
    ) : (
      <p className="mt-3 truncate text-2xl font-semibold tracking-tight text-slate-950">
        {value}
      </p>
    )}
    <p className="mt-1 truncate text-xs text-slate-400">{sub}</p>
  </Card>
);

const Analytics = () => {
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [monthly, category] = await Promise.all([
        analyticsService.getMonthlySpending(),
        analyticsService.getCategorySpending(),
      ]);
      setMonthlyData(monthly.monthlySpending || []);
      setCategoryData(
        [...(category.categorySpending || [])].sort((a, b) => b.amount - a.amount),
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load analytics.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const stats = useMemo(() => {
    const total = categoryData.reduce((s, c) => s + c.amount, 0);
    const monthTotal = monthlyData.reduce((s, m) => s + m.amount, 0);
    const average = monthlyData.length ? monthTotal / monthlyData.length : 0;
    const peak = monthlyData.reduce(
      (best, m) => (!best || m.amount > best.amount ? m : best),
      null,
    );
    return { total, average, peak, top: categoryData[0] };
  }, [monthlyData, categoryData]);

  const empty = !loading && !error && monthlyData.length === 0 && categoryData.length === 0;

  return (
    <AppLayout
      title="Analytics"
      subtitle="See how your spending changes over time and where it goes."
      maxWidth="max-w-7xl"
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

      {empty ? (
        <Card>
          <EmptyState
            icon={BarChart3}
            title="Nothing to analyze yet"
            description="Once you add some expenses, your monthly and category breakdowns will appear here."
            action={<AddLink />}
          />
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Summary */}
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Stat
              icon={Wallet}
              label="Total spent"
              value={formatCurrency(stats.total)}
              sub="Across all categories"
              tone="bg-brand-50 text-brand-600"
              loading={loading}
            />
            <Stat
              icon={CalendarDays}
              label="Monthly average"
              value={formatCurrency(stats.average)}
              sub={`Over ${monthlyData.length} ${monthlyData.length === 1 ? "month" : "months"}`}
              tone="bg-violet-50 text-violet-600"
              loading={loading}
            />
            <Stat
              icon={BarChart3}
              label="Highest month"
              value={stats.peak ? formatCurrency(stats.peak.amount) : "—"}
              sub={stats.peak?.month || "No data"}
              tone="bg-amber-50 text-amber-600"
              loading={loading}
            />
            <Stat
              icon={Tag}
              label="Top category"
              value={stats.top?.category || "—"}
              sub={stats.top ? formatCurrency(stats.top.amount) : "No data"}
              tone="bg-emerald-50 text-emerald-600"
              loading={loading}
            />
          </section>

          {/* Monthly */}
          <Card>
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-slate-900">Monthly spending</h2>
              <p className="mt-0.5 text-xs text-slate-500">Total spent in each month</p>
            </div>
            {loading ? (
              <div className="p-5">
                <Skeleton className="h-[300px] w-full" />
              </div>
            ) : monthlyData.length === 0 ? (
              <EmptyState
                icon={BarChart3}
                title="No monthly data"
                description="Add expenses to see your monthly trend."
              />
            ) : (
              <div className="h-[320px] p-3 sm:p-5">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
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
                      cursor={{ fill: "#f1f5f9" }}
                      contentStyle={{
                        border: "1px solid #e2e8f0",
                        borderRadius: 8,
                        boxShadow: "0 4px 12px rgba(15,23,42,0.08)",
                      }}
                      formatter={(value) => [formatCurrency(value), "Spending"]}
                    />
                    <Bar dataKey="amount" fill="#0f8a7a" radius={[6, 6, 0, 0]} maxBarSize={56} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          {/* Category */}
          <Card>
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-slate-900">Spending by category</h2>
              <p className="mt-0.5 text-xs text-slate-500">Where your money goes</p>
            </div>
            {loading ? (
              <div className="p-5">
                <Skeleton className="h-[260px] w-full" />
              </div>
            ) : categoryData.length === 0 ? (
              <EmptyState
                icon={PieIcon}
                title="No category data"
                description="Add expenses with categories to see the breakdown."
              />
            ) : (
              <div className="grid items-center gap-6 p-5 md:grid-cols-2">
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        dataKey="amount"
                        nameKey="category"
                        innerRadius={65}
                        outerRadius={105}
                        paddingAngle={2}
                        stroke="none"
                      >
                        {categoryData.map((entry) => (
                          <Cell key={entry.category} fill={getCategoryStyle(entry.category).color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ border: "1px solid #e2e8f0", borderRadius: 8 }}
                        formatter={(value, name) => [formatCurrency(value), name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <ul className="space-y-3">
                  {categoryData.map((entry) => {
                    const pct = stats.total ? (entry.amount / stats.total) * 100 : 0;
                    const color = getCategoryStyle(entry.category).color;
                    return (
                      <li key={entry.category}>
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2 font-medium text-slate-700">
                            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                            {entry.category}
                          </span>
                          <span className="text-slate-500">
                            <span className="font-semibold text-slate-900">
                              {formatCurrency(entry.amount)}
                            </span>{" "}
                            · {pct.toFixed(0)}%
                          </span>
                        </div>
                        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${pct}%`, backgroundColor: color }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </Card>
        </div>
      )}
    </AppLayout>
  );
};

export default Analytics;
