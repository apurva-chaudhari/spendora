import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDownRight,
  ArrowUpRight,
  Brain,
  Lightbulb,
  Plus,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";

import AppLayout from "../components/AppLayout";
import { Alert, Button, Card, EmptyState, Skeleton } from "../components/ui";
import aiService from "../services/aiService";
import { formatCurrency, getCategoryStyle } from "../lib/format";

// Build practical recommendations from the real numbers, plus any the AI returns.
const buildRecommendations = (spendingData, aiInsights) => {
  const fromAI = Array.isArray(aiInsights?.recommendations)
    ? aiInsights.recommendations
    : [];
  if (fromAI.length) return fromAI;

  const current = spendingData?.currentMonth || { total: 0, categories: {} };
  const previous = spendingData?.previousMonth || { total: 0, categories: {} };
  const recs = [];

  const sorted = Object.entries(current.categories || {}).sort((a, b) => b[1] - a[1]);
  if (sorted.length && current.total > 0) {
    const [name, amount] = sorted[0];
    const share = Math.round((amount / current.total) * 100);
    if (share >= 40) {
      recs.push(
        `${name} makes up ${share}% of this month's spending. Setting a monthly limit for it is the easiest place to save.`,
      );
    }
  }

  if (previous.total > 0 && current.total > previous.total * 1.1) {
    recs.push(
      "Spending is up compared to last month. Review recent transactions for purchases you could skip or postpone.",
    );
  } else if (previous.total > 0 && current.total < previous.total * 0.9) {
    recs.push(
      "You're spending less than last month. Consider moving the difference into savings.",
    );
  }

  const growing = Object.entries(current.categories || {})
    .filter(([cat, amt]) => (previous.categories?.[cat] || 0) > 0 && amt > previous.categories[cat] * 1.3)
    .map(([cat]) => cat);
  if (growing.length) {
    recs.push(`Watch ${growing.slice(0, 2).join(" and ")}: spending there grew sharply since last month.`);
  }

  if (recs.length === 0) {
    recs.push("Keep logging expenses regularly so Spendora can give you sharper recommendations.");
  }
  return recs;
};

const Insights = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadInsights = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setData(await aiService.getSpendingInsights());
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate spending insights.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadInsights();
  }, [loadInsights]);

  const spendingData = data?.spendingData;
  const aiInsights = data?.aiInsights;
  const current = spendingData?.currentMonth?.total || 0;
  const previous = spendingData?.previousMonth?.total || 0;
  const diff = current - previous;
  const pct = previous > 0 ? Math.round((diff / previous) * 100) : null;

  const categories = useMemo(() => {
    const cur = spendingData?.currentMonth?.categories || {};
    const prev = spendingData?.previousMonth?.categories || {};
    return Object.entries(cur)
      .map(([name, amount]) => ({ name, amount, previous: prev[name] || 0 }))
      .sort((a, b) => b.amount - a.amount);
  }, [spendingData]);

  const recommendations = useMemo(
    () => (data ? buildRecommendations(spendingData, aiInsights) : []),
    [data, spendingData, aiInsights],
  );

  const hasNoData = !loading && !error && current === 0 && previous === 0;

  return (
    <AppLayout
      title="AI insights"
      subtitle="Personalized analysis of your spending, powered by AI."
      maxWidth="max-w-5xl"
      actions={
        <Button variant="secondary" onClick={loadInsights} disabled={loading}>
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </Button>
      }
    >
      {error && (
        <Alert
          type="error"
          action={
            <button onClick={loadInsights} className="shrink-0 font-medium underline">
              Try again
            </button>
          }
        >
          {error}
        </Alert>
      )}

      {loading && (
        <div className="space-y-6" aria-busy="true">
          <Card className="p-6">
            <div className="flex items-center gap-3 text-sm font-medium text-brand-700">
              <Sparkles size={18} className="animate-pulse" />
              Analyzing your spending...
            </div>
            <Skeleton className="mt-4 h-5 w-full" />
            <Skeleton className="mt-2 h-5 w-2/3" />
          </Card>
          <div className="grid gap-4 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Card key={i} className="p-5">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <Skeleton className="mt-4 h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-4/5" />
              </Card>
            ))}
          </div>
        </div>
      )}

      {hasNoData && (
        <Card>
          <EmptyState
            icon={Brain}
            title="Not enough data for insights"
            description="Add expenses for this month and Spendora will analyze your habits."
            action={
              <Link
                to="/expenses/add"
                className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
              >
                <Plus size={16} />
                Add expense
              </Link>
            }
          />
        </Card>
      )}

      {data && !loading && !error && !hasNoData && (
        <div className="space-y-6">
          {/* AI summary */}
          <Card className="overflow-hidden">
            <div className="flex items-start gap-4 bg-gradient-to-br from-brand-50 to-white p-5 sm:p-6">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white">
                <Lightbulb size={22} />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
                  AI summary
                </p>
                <p className="mt-1.5 text-base font-medium leading-relaxed text-slate-900 sm:text-lg">
                  {aiInsights?.summary || "No summary available."}
                </p>
              </div>
            </div>
          </Card>

          {/* Month comparison */}
          <section className="grid gap-4 sm:grid-cols-3">
            <Card className="p-5">
              <p className="text-sm text-slate-500">This month</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{formatCurrency(current)}</p>
            </Card>
            <Card className="p-5">
              <p className="text-sm text-slate-500">Last month</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{formatCurrency(previous)}</p>
            </Card>
            <Card className="p-5">
              <p className="text-sm text-slate-500">Change</p>
              {pct === null ? (
                <p className="mt-2 text-sm text-slate-500">No previous month to compare.</p>
              ) : (
                <p
                  className={`mt-2 flex items-center gap-1 text-2xl font-semibold ${
                    diff > 0 ? "text-red-600" : "text-emerald-600"
                  }`}
                >
                  {diff > 0 ? <ArrowUpRight size={22} /> : <ArrowDownRight size={22} />}
                  {Math.abs(pct)}%
                </p>
              )}
            </Card>
          </section>

          {/* Insight cards */}
          <section>
            <h2 className="mb-3 text-sm font-semibold text-slate-900">Key insights</h2>
            {aiInsights?.insights?.length ? (
              <div className="grid gap-4 md:grid-cols-3">
                {aiInsights.insights.map((insight, index) => (
                  <Card key={index} className="p-5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                      <TrendingUp size={18} />
                    </span>
                    <p className="mt-4 text-sm leading-relaxed text-slate-700">{insight}</p>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <EmptyState
                  icon={Sparkles}
                  title="No insights generated"
                  description="Try refreshing to generate a new analysis."
                />
              </Card>
            )}
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Categories */}
            <Card className="p-5 sm:p-6">
              <h2 className="text-sm font-semibold text-slate-900">Spending categories</h2>
              <p className="mt-0.5 text-xs text-slate-500">This month vs last month</p>
              {categories.length === 0 ? (
                <p className="mt-6 text-sm text-slate-500">No category spending this month yet.</p>
              ) : (
                <ul className="mt-5 space-y-4">
                  {categories.map((cat) => {
                    const share = current ? (cat.amount / current) * 100 : 0;
                    const color = getCategoryStyle(cat.name).color;
                    const change = cat.previous
                      ? Math.round(((cat.amount - cat.previous) / cat.previous) * 100)
                      : null;
                    return (
                      <li key={cat.name}>
                        <div className="flex items-center justify-between gap-2 text-sm">
                          <span className="flex items-center gap-2 font-medium text-slate-700">
                            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                            {cat.name}
                          </span>
                          <span className="flex items-center gap-2">
                            {change !== null && (
                              <span
                                className={`text-xs font-medium ${
                                  change > 0 ? "text-red-600" : "text-emerald-600"
                                }`}
                              >
                                {change > 0 ? "+" : ""}
                                {change}%
                              </span>
                            )}
                            <span className="font-semibold text-slate-900">
                              {formatCurrency(cat.amount)}
                            </span>
                          </span>
                        </div>
                        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${share}%`, backgroundColor: color }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>

            {/* Recommendations */}
            <Card className="p-5 sm:p-6">
              <h2 className="text-sm font-semibold text-slate-900">Recommendations</h2>
              <p className="mt-0.5 text-xs text-slate-500">Suggested next steps</p>
              <ul className="mt-5 space-y-3">
                {recommendations.map((rec, i) => (
                  <li key={i} className="flex gap-3 rounded-lg bg-slate-50 p-3.5">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <Target size={13} />
                    </span>
                    <p className="text-sm leading-relaxed text-slate-700">{rec}</p>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default Insights;
