import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Receipt, CheckCircle2 } from "lucide-react";
import billService from "../services/billService";

const ReviewBill = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const bill = location.state?.bill;

  const [merchant, setMerchant] = useState(bill?.merchant || "");
  const [date, setDate] = useState(
    bill?.date ? bill.date.substring(0, 10) : "",
  );
  const [subtotal, setSubtotal] = useState(bill?.subtotal || 0);
  const [tax, setTax] = useState(bill?.tax || 0);
  const [total, setTotal] = useState(bill?.total || 0);

  const [items, setItems] = useState(bill?.extractedItems || []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!bill) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center max-w-md w-full">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            No Bill Data Found
          </h1>

          <p className="text-slate-500 mb-6">Please scan a bill first.</p>

          <button
            onClick={() => navigate("/scan-bill")}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Scan Bill
          </button>
        </div>
      </div>
    );
  }

  const updateItem = (index, field, value) => {
    setItems((currentItems) =>
      currentItems.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]:
                field === "quantity" || field === "price"
                  ? Number(value)
                  : value,
            }
          : item,
      ),
    );
  };
  const handleSaveExpense = async () => {
    try {
      setSaving(true);
      setError("");

      const billData = {
        merchant,
        date,
        subtotal: Number(subtotal),
        tax: Number(tax),
        total: Number(total),
        extractedItems: items,
      };

      await billService.saveBillAsExpense(bill._id, billData);

      navigate("/expenses");
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to save bill as expense.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/scan-bill")}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft size={18} />
            Back to Scan
          </button>

          <div className="flex items-center gap-2">
            <Receipt className="text-blue-600" size={22} />

            <span className="font-semibold text-slate-900">Spendora</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Page Heading */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-blue-600 text-sm font-medium mb-2">
            <CheckCircle2 size={17} />
            Bill scanned successfully
          </div>

          <h1 className="text-3xl font-bold text-slate-900">
            Review Scanned Bill
          </h1>

          <p className="text-slate-500 mt-2">
            Review and correct the information extracted from your bill before
            saving it as an expense.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT SIDE */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bill Information */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-5">
                Bill Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Merchant */}
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    Merchant
                  </label>

                  <input
                    type="text"
                    value={merchant}
                    onChange={(e) => setMerchant(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Merchant name"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    Date
                  </label>

                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-5">
                Extracted Items
              </h2>

              {items.length > 0 ? (
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end border-b border-slate-100 pb-4 last:border-0"
                    >
                      {/* Item Name */}
                      <div className="md:col-span-6">
                        <label className="block text-xs font-medium text-slate-500 mb-1">
                          Item
                        </label>

                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) =>
                            updateItem(index, "name", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* Quantity */}
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-slate-500 mb-1">
                          Qty
                        </label>

                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(index, "quantity", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* Amount */}
                      <div className="md:col-span-4">
                        <label className="block text-xs font-medium text-slate-500 mb-1">
                          Amount
                        </label>

                        <div className="relative">
                          <span className="absolute left-3 top-2 text-slate-500">
                            ₹
                          </span>

                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.price}
                            onChange={(e) =>
                              updateItem(index, "price", e.target.value)
                            }
                            className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500">No items detected.</p>
              )}
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div>
            <div className="bg-white border border-slate-200 rounded-xl p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">
                Bill Summary
              </h2>

              <div className="space-y-5">
                {/* Subtotal */}
                <div>
                  <label className="block text-sm text-slate-500 mb-2">
                    Subtotal
                  </label>

                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-500">
                      ₹
                    </span>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={subtotal}
                      onChange={(e) => setSubtotal(e.target.value)}
                      className="w-full pl-7 pr-3 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Tax */}
                <div>
                  <label className="block text-sm text-slate-500 mb-2">
                    Tax / GST
                  </label>

                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-500">
                      ₹
                    </span>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={tax}
                      onChange={(e) => setTax(e.target.value)}
                      className="w-full pl-7 pr-3 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Total */}
                <div>
                  <label className="block text-sm text-slate-500 mb-2">
                    Total
                  </label>

                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-500">
                      ₹
                    </span>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={total}
                      onChange={(e) => setTotal(e.target.value)}
                      className="w-full pl-7 pr-3 py-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
              {error && (
                <div className="mt-5 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}
              {/* Save Button */}
              <button
                onClick={handleSaveExpense}
                disabled={saving}
                className="w-full mt-7 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Save as Expense"}
              </button>

              <button
                onClick={() => navigate("/scan-bill")}
                className="w-full mt-3 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
              >
                Scan Another Bill
              </button>

              <p className="text-xs text-slate-400 text-center mt-4">
                Make any corrections before saving.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReviewBill;
