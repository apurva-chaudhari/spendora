import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Plus, Receipt, Search, Trash2, SearchX, CreditCard } from "lucide-react";

import AppLayout from "../components/AppLayout";
import {
  Alert,
  Button,
  Card,
  CategoryBadge,
  ConfirmDialog,
  EmptyState,
  Skeleton,
  inputClass,
} from "../components/ui";
import expenseService from "../services/expenseService";
import { CATEGORIES, formatCurrency, formatDate } from "../lib/format";

const Expenses = () => {
  const location = useLocation();

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(location.state?.message || "");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadExpenses = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await expenseService.getExpenses();
      setExpenses(data.expenses || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load expenses.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadExpenses();
  }, [loadExpenses]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return expenses.filter((expense) => {
      const matchesCategory =
        categoryFilter === "All" || expense.category === categoryFilter;
      const matchesSearch =
        !query ||
        expense.title?.toLowerCase().includes(query) ||
        expense.description?.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [expenses, search, categoryFilter]);

  const filteredTotal = filtered.reduce((sum, e) => sum + (e.amount || 0), 0);

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      setDeleting(true);
      await expenseService.deleteExpense(toDelete._id);
      setExpenses((current) => current.filter((e) => e._id !== toDelete._id));
      setNotice(`"${toDelete.title}" was deleted.`);
      setToDelete(null);
    } catch (err) {
      setToDelete(null);
      setError(err.response?.data?.message || "Failed to delete expense.");
    } finally {
      setDeleting(false);
    }
  };

  const hasFilters = search.trim() || categoryFilter !== "All";

  return (
    <AppLayout
      title="Expenses"
      subtitle="Every expense you've recorded, in one place."
      actions={
        <Link
          to="/expenses/add"
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-700"
        >
          <Plus size={16} />
          Add expense
        </Link>
      }
    >
      <div className="space-y-4">
        {notice && (
          <Alert type="success" onClose={() => setNotice("")}>
            {notice}
          </Alert>
        )}
        {error && (
          <Alert
            type="error"
            onClose={() => setError("")}
            action={
              expenses.length === 0 ? (
                <button onClick={loadExpenses} className="shrink-0 font-medium underline">
                  Retry
                </button>
              ) : null
            }
          >
            {error}
          </Alert>
        )}

        <Card className="overflow-hidden">
          {/* Toolbar */}
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative sm:w-72">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search expenses"
                aria-label="Search expenses"
                className={`${inputClass} pl-9`}
              />
            </div>
            <div className="flex items-center gap-3">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                aria-label="Filter by category"
                className={`${inputClass} sm:w-44`}
              >
                <option value="All">All categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="divide-y divide-slate-100">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="hidden h-6 w-20 rounded-full sm:block" />
                  <Skeleton className="ml-auto h-4 w-20" />
                </div>
              ))}
              <p className="sr-only">Loading expenses...</p>
            </div>
          ) : expenses.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No expenses yet"
              description="Start tracking by adding an expense manually or scanning a bill."
              action={
                <div className="flex flex-wrap justify-center gap-2">
                  <Link
                    to="/expenses/add"
                    className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
                  >
                    <Plus size={16} />
                    Add expense
                  </Link>
                  <Link
                    to="/scan-bill"
                    className="inline-flex items-center rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Scan a bill
                  </Link>
                </div>
              }
            />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="No matching expenses"
              description="Try a different search term or category."
              action={
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSearch("");
                    setCategoryFilter("All");
                  }}
                >
                  Clear filters
                </Button>
              }
            />
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Expense</th>
                      <th className="px-5 py-3">Category</th>
                      <th className="px-5 py-3">Payment</th>
                      <th className="px-5 py-3">Date</th>
                      <th className="px-5 py-3 text-right">Amount</th>
                      <th className="w-14 px-5 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map((expense) => (
                      <tr key={expense._id} className="transition hover:bg-slate-50">
                        <td className="max-w-[260px] px-5 py-4">
                          <p className="truncate font-medium text-slate-900">
                            {expense.title}
                          </p>
                          {expense.source === "bill_scan" && (
                            <p className="mt-0.5 text-xs text-brand-600">Scanned bill</p>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <CategoryBadge category={expense.category} />
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          <span className="inline-flex items-center gap-1.5">
                            <CreditCard size={14} className="text-slate-400" />
                            {expense.paymentMethod || "Other"}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                          {formatDate(expense.date)}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-right font-semibold text-slate-900">
                          {formatCurrency(expense.amount)}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => setToDelete(expense)}
                            aria-label={`Delete ${expense.title}`}
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <ul className="divide-y divide-slate-100 md:hidden">
                {filtered.map((expense) => (
                  <li key={expense._id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900">
                          {expense.title}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {formatDate(expense.date)} · {expense.paymentMethod || "Other"}
                        </p>
                      </div>
                      <p className="shrink-0 text-sm font-semibold text-slate-900">
                        {formatCurrency(expense.amount)}
                      </p>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <CategoryBadge category={expense.category} />
                      <button
                        onClick={() => setToDelete(expense)}
                        aria-label={`Delete ${expense.title}`}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-500 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-5 py-3 text-sm">
                <span className="text-slate-500">
                  {filtered.length} {filtered.length === 1 ? "expense" : "expenses"}
                  {hasFilters ? " (filtered)" : ""}
                </span>
                <span className="font-semibold text-slate-900">
                  {formatCurrency(filteredTotal)}
                </span>
              </div>
            </>
          )}
        </Card>
      </div>

      <ConfirmDialog
        open={!!toDelete}
        title="Delete this expense?"
        message={
          toDelete
            ? `"${toDelete.title}" (${formatCurrency(toDelete.amount)}) will be permanently removed. This can't be undone.`
            : ""
        }
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </AppLayout>
  );
};

export default Expenses;
