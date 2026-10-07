import { useState } from "react";
import { Link } from "react-router-dom";
import { IndianRupee } from "lucide-react";

import AppLayout from "../components/AppLayout";
import {
  Alert,
  Button,
  Card,
  Field,
  inputClass,
  inputErrorClass,
} from "../components/ui";
import expenseService from "../services/expenseService";
import { CATEGORIES, PAYMENT_METHODS, formatCurrency, todayISO } from "../lib/format";

const emptyForm = () => ({
  title: "",
  amount: "",
  category: "",
  date: todayISO(),
  paymentMethod: "UPI",
  description: "",
});

const AddExpense = () => {
  const [formData, setFormData] = useState(emptyForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = (data) => {
    const errors = {};
    if (!data.title.trim()) errors.title = "Give this expense a title.";
    else if (data.title.trim().length > 100)
      errors.title = "Title must be 100 characters or fewer.";

    if (data.amount === "") errors.amount = "Enter an amount.";
    else if (Number.isNaN(Number(data.amount))) errors.amount = "Amount must be a number.";
    else if (Number(data.amount) <= 0) errors.amount = "Amount must be greater than 0.";
    else if (Number(data.amount) > 100000000) errors.amount = "That amount looks too large.";

    if (!data.category) errors.category = "Choose a category.";
    if (!data.date) errors.date = "Pick a date.";
    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((current) => ({ ...current, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((current) => ({ ...current, [name]: "" }));
    if (error) setError("");
    if (success) setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validate(formData);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await expenseService.createExpense({
        ...formData,
        title: formData.title.trim(),
        description: formData.description.trim(),
        amount: Number(formData.amount),
      });

      setSuccess(
        `Saved "${formData.title.trim()}" for ${formatCurrency(formData.amount)}.`,
      );
      setFormData(emptyForm());
      setFieldErrors({});
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add expense. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const cls = (name) => `${inputClass} ${fieldErrors[name] ? inputErrorClass : ""}`;
  const aria = (name) => ({
    "aria-invalid": !!fieldErrors[name],
    "aria-describedby": fieldErrors[name] ? `${name}-error` : undefined,
  });

  return (
    <AppLayout
      title="Add expense"
      subtitle="Record a new expense in a few seconds."
      maxWidth="max-w-3xl"
    >
      <Card className="p-5 sm:p-8">
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {success && (
            <Alert
              type="success"
              onClose={() => setSuccess("")}
              action={
                <Link to="/expenses" className="shrink-0 font-medium underline">
                  View expenses
                </Link>
              }
            >
              {success}
            </Alert>
          )}
          {error && (
            <Alert type="error" onClose={() => setError("")}>
              {error}
            </Alert>
          )}

          <Field label="Title" htmlFor="title" error={fieldErrors.title}>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Grocery shopping"
              className={cls("title")}
              {...aria("title")}
            />
          </Field>

          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Amount" htmlFor="amount" error={fieldErrors.amount}>
              <div className="relative">
                <IndianRupee
                  size={15}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="amount"
                  name="amount"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  className={`${cls("amount")} pl-9`}
                  {...aria("amount")}
                />
              </div>
            </Field>

            <Field label="Date" htmlFor="date" error={fieldErrors.date}>
              <input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                className={cls("date")}
                {...aria("date")}
              />
            </Field>
          </div>

          <Field label="Category" htmlFor="category" error={fieldErrors.category}>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={cls("category")}
              {...aria("category")}
            >
              <option value="">Select a category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>

          <fieldset>
            <legend className="mb-1.5 text-sm font-medium text-slate-700">
              Payment method
            </legend>
            <div className="flex flex-wrap gap-2">
              {PAYMENT_METHODS.map((method) => {
                const selected = formData.paymentMethod === method;
                return (
                  <label
                    key={method}
                    className={`cursor-pointer rounded-lg border px-4 py-2 text-sm font-medium transition has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-brand-100 ${
                      selected
                        ? "border-brand-600 bg-brand-50 text-brand-700"
                        : "border-slate-300 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method}
                      checked={selected}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    {method}
                  </label>
                );
              })}
            </div>
          </fieldset>

          <Field label="Notes" htmlFor="description" optional>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Anything worth remembering?"
              className={inputClass}
            />
          </Field>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
            <Link
              to="/expenses"
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </Link>
            <Button type="submit" loading={loading}>
              {loading ? "Saving..." : "Save expense"}
            </Button>
          </div>
        </form>
      </Card>
    </AppLayout>
  );
};

export default AddExpense;
