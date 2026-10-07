import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  ChevronDown,
  Plus,
  ScanLine,
  Trash2,
} from "lucide-react";

import AppLayout from "../components/AppLayout";
import {
  Alert,
  Button,
  Card,
  EmptyState,
  Field,
  inputClass,
  inputErrorClass,
} from "../components/ui";
import billService from "../services/billService";
import { formatCurrency } from "../lib/format";

const MoneyInput = ({ id, value, onChange, hasError, ...props }) => (
  <div className="relative">
    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
      ₹
    </span>
    <input
      id={id}
      type="number"
      min="0"
      step="0.01"
      inputMode="decimal"
      value={value}
      onChange={onChange}
      className={`${inputClass} pl-7 ${hasError ? inputErrorClass : ""}`}
      {...props}
    />
  </div>
);

const ReviewBill = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const bill = location.state?.bill;

  const [merchant, setMerchant] = useState(bill?.merchant || "");
  const [date, setDate] = useState(bill?.date ? bill.date.substring(0, 10) : "");
  const [subtotal, setSubtotal] = useState(bill?.subtotal ?? 0);
  const [tax, setTax] = useState(bill?.tax ?? 0);
  const [total, setTotal] = useState(bill?.total ?? 0);
  const [items, setItems] = useState(bill?.extractedItems || []);

  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!bill) {
    return (
      <AppLayout title="Review bill" maxWidth="max-w-3xl">
        <Card>
          <EmptyState
            icon={ScanLine}
            title="No bill to review"
            description="Scan a bill first and its details will show up here for review."
            action={
              <Link
                to="/scan-bill"
                className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
              >
                <ScanLine size={16} />
                Scan a bill
              </Link>
            }
          />
        </Card>
      </AppLayout>
    );
  }

  const updateItem = (index, field, value) => {
    setItems((current) =>
      current.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]: field === "name" ? value : value === "" ? "" : Number(value),
            }
          : item,
      ),
    );
  };

  const addItem = () =>
    setItems((current) => [...current, { name: "", quantity: 1, price: 0 }]);

  const removeItem = (index) =>
    setItems((current) => current.filter((_, i) => i !== index));

  const mismatch =
    Number(total) > 0 &&
    (Number(subtotal) > 0 || Number(tax) > 0) &&
    Math.abs(Number(subtotal) + Number(tax) - Number(total)) > 1;

  const validate = () => {
    const errors = {};
    if (!merchant.trim()) errors.merchant = "Merchant name is required.";
    if (!date) errors.date = "Date is required.";
    if (!(Number(total) > 0)) errors.total = "Total must be greater than 0.";
    if (Number(subtotal) < 0) errors.subtotal = "Subtotal can't be negative.";
    if (Number(tax) < 0) errors.tax = "Tax can't be negative.";
    return errors;
  };

  const handleSaveExpense = async () => {
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setError("Please fix the highlighted fields before saving.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await billService.saveBillAsExpense(bill._id, {
        merchant: merchant.trim(),
        date,
        subtotal: Number(subtotal),
        tax: Number(tax),
        total: Number(total),
        extractedItems: items
          .filter((item) => item.name?.trim())
          .map((item) => ({
            name: item.name.trim(),
            quantity: Number(item.quantity) || 1,
            price: Number(item.price) || 0,
          })),
      });

      navigate("/expenses", {
        state: { message: `Saved "${merchant.trim()}" as an expense.` },
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save bill as expense.");
      setSaving(false);
    }
  };

  const errCls = (name) => (fieldErrors[name] ? inputErrorClass : "");

  return (
    <AppLayout
      title="Review scanned bill"
      subtitle="Check the extracted details and fix anything that looks off before saving."
      maxWidth="max-w-5xl"
    >
      <div className="mb-6">
        <Alert type="success">
          <span className="flex items-center gap-1.5 font-medium">
            <CheckCircle2 size={15} /> Bill scanned successfully
          </span>
        </Alert>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="p-5 sm:p-6">
            <h2 className="mb-5 text-base font-semibold text-slate-900">Bill details</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Merchant" htmlFor="merchant" error={fieldErrors.merchant}>
                <input
                  id="merchant"
                  type="text"
                  value={merchant}
                  onChange={(e) => {
                    setMerchant(e.target.value);
                    setFieldErrors((f) => ({ ...f, merchant: "" }));
                  }}
                  placeholder="Merchant name"
                  className={`${inputClass} ${errCls("merchant")}`}
                />
              </Field>
              <Field label="Date" htmlFor="date" error={fieldErrors.date}>
                <input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    setFieldErrors((f) => ({ ...f, date: "" }));
                  }}
                  className={`${inputClass} ${errCls("date")}`}
                />
              </Field>
            </div>
          </Card>

          <Card className="p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Items</h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  {items.length} {items.length === 1 ? "item" : "items"} detected
                </p>
              </div>
              <Button variant="secondary" onClick={addItem} className="px-3 py-2">
                <Plus size={15} />
                Add item
              </Button>
            </div>

            {items.length === 0 ? (
              <p className="rounded-lg border border-dashed border-slate-300 py-8 text-center text-sm text-slate-500">
                No items detected. You can add them manually or just save the total.
              </p>
            ) : (
              <div className="space-y-4">
                <div className="hidden grid-cols-12 gap-3 px-1 text-xs font-semibold uppercase tracking-wide text-slate-400 md:grid">
                  <span className="col-span-6">Item</span>
                  <span className="col-span-2">Qty</span>
                  <span className="col-span-3">Amount</span>
                  <span className="col-span-1" />
                </div>
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/50 p-3 md:border-0 md:bg-transparent md:p-0"
                  >
                    <input
                      type="text"
                      aria-label={`Item ${index + 1} name`}
                      value={item.name}
                      onChange={(e) => updateItem(index, "name", e.target.value)}
                      placeholder="Item name"
                      className={`${inputClass} col-span-12 md:col-span-6`}
                    />
                    <input
                      type="number"
                      min="1"
                      aria-label={`Item ${index + 1} quantity`}
                      value={item.quantity}
                      onChange={(e) => updateItem(index, "quantity", e.target.value)}
                      className={`${inputClass} col-span-4 md:col-span-2`}
                    />
                    <div className="col-span-7 md:col-span-3">
                      <MoneyInput
                        aria-label={`Item ${index + 1} amount`}
                        value={item.price}
                        onChange={(e) => updateItem(index, "price", e.target.value)}
                      />
                    </div>
                    <button
                      onClick={() => removeItem(index)}
                      aria-label={`Remove item ${index + 1}`}
                      className="col-span-1 flex justify-center rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {bill.rawText && (
            <details className="group rounded-xl border border-slate-200 bg-white shadow-sm">
              <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-sm font-medium text-slate-700">
                Raw scanned text
                <ChevronDown size={16} className="transition group-open:rotate-180" />
              </summary>
              <pre className="max-h-64 overflow-auto whitespace-pre-wrap border-t border-slate-100 px-5 py-4 text-xs text-slate-600">
                {bill.rawText}
              </pre>
            </details>
          )}
        </div>

        <div>
          <Card className="p-5 sm:p-6 lg:sticky lg:top-24">
            <h2 className="mb-5 text-base font-semibold text-slate-900">Summary</h2>

            <div className="space-y-4">
              <Field label="Subtotal" htmlFor="subtotal" error={fieldErrors.subtotal}>
                <MoneyInput
                  id="subtotal"
                  value={subtotal}
                  hasError={!!fieldErrors.subtotal}
                  onChange={(e) => setSubtotal(e.target.value)}
                />
              </Field>
              <Field label="Tax / GST" htmlFor="tax" error={fieldErrors.tax}>
                <MoneyInput
                  id="tax"
                  value={tax}
                  hasError={!!fieldErrors.tax}
                  onChange={(e) => setTax(e.target.value)}
                />
              </Field>
              <div className="border-t border-slate-100 pt-4">
                <Field label="Total" htmlFor="total" error={fieldErrors.total}>
                  <MoneyInput
                    id="total"
                    value={total}
                    hasError={!!fieldErrors.total}
                    onChange={(e) => {
                      setTotal(e.target.value);
                      setFieldErrors((f) => ({ ...f, total: "" }));
                    }}
                    className={`${inputClass} pl-7 font-semibold`}
                  />
                </Field>
                <p className="mt-2 text-xs text-slate-500">
                  This amount ({formatCurrency(total)}) is saved as the expense.
                </p>
              </div>
            </div>

            {mismatch && (
              <div className="mt-4">
                <Alert type="warning">
                  Subtotal + tax ({formatCurrency(Number(subtotal) + Number(tax))}) doesn't
                  match the total. Double-check the numbers.
                </Alert>
              </div>
            )}
            {error && (
              <div className="mt-4">
                <Alert type="error">{error}</Alert>
              </div>
            )}

            <div className="mt-6 space-y-3">
              <Button onClick={handleSaveExpense} loading={saving} className="w-full py-3">
                {saving ? "Saving..." : "Save as expense"}
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate("/scan-bill")}
                disabled={saving}
                className="w-full py-3"
              >
                Scan another bill
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default ReviewBill;
