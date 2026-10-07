import { useEffect } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Info,
  Loader2,
  X,
  AlertTriangle,
} from "lucide-react";
import { getCategoryStyle } from "../lib/format";

export const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500";

export const inputErrorClass =
  "border-red-400 focus:border-red-500 focus:ring-red-100";

export const Spinner = ({ className = "h-4 w-4" }) => (
  <Loader2 className={`animate-spin ${className}`} aria-hidden="true" />
);

export const Card = ({ className = "", children }) => (
  <div
    className={`rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(11,28,56,0.04),0_4px_16px_rgba(11,28,56,0.04)] ${className}`}
  >
    {children}
  </div>
);

export const Button = ({
  variant = "primary",
  loading = false,
  className = "",
  children,
  disabled,
  ...props
}) => {
  const variants = {
    primary:
      "bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-sm shadow-brand-600/25 hover:from-brand-700 hover:to-brand-600 focus-visible:ring-brand-200",
    dark: "bg-ink-900 text-white hover:bg-ink-800 focus-visible:ring-slate-300",
    secondary:
      "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus-visible:ring-slate-200",
    danger:
      "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-200",
    ghost: "text-slate-600 hover:bg-slate-100 focus-visible:ring-slate-200",
  };

  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium outline-none transition focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
};

const ALERT_STYLES = {
  error: {
    wrap: "border-red-200 bg-red-50 text-red-800",
    icon: AlertCircle,
  },
  success: {
    wrap: "border-emerald-200 bg-emerald-50 text-emerald-800",
    icon: CheckCircle2,
  },
  warning: {
    wrap: "border-amber-200 bg-amber-50 text-amber-800",
    icon: AlertTriangle,
  },
  info: { wrap: "border-brand-200 bg-brand-50 text-brand-800", icon: Info },
};

export const Alert = ({ type = "error", children, onClose, action }) => {
  const style = ALERT_STYLES[type];
  const Icon = style.icon;

  return (
    <div
      role={type === "error" ? "alert" : "status"}
      className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${style.wrap}`}
    >
      <Icon size={18} className="mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">{children}</div>
      {action}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss"
          className="shrink-0 rounded p-0.5 opacity-70 hover:opacity-100"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export const CategoryBadge = ({ category }) => {
  const style = getCategoryStyle(category);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${style.badge}`}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: style.color }}
      />
      {category || "Other"}
    </span>
  );
};

export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
    {Icon && (
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
        <Icon size={22} />
      </div>
    )}
    <p className="text-sm font-semibold text-slate-900">{title}</p>
    {description && (
      <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
    )}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse rounded-md bg-slate-200/70 ${className}`} />
);

export const FieldError = ({ id, children }) =>
  children ? (
    <p id={id} className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
      <AlertCircle size={12} />
      {children}
    </p>
  ) : null;

export const Field = ({ label, htmlFor, hint, error, children, optional }) => (
  <div>
    <label
      htmlFor={htmlFor}
      className="mb-1.5 flex items-center justify-between text-sm font-medium text-slate-700"
    >
      <span>{label}</span>
      {optional && (
        <span className="text-xs font-normal text-slate-400">Optional</span>
      )}
    </label>
    {children}
    {error ? (
      <FieldError id={`${htmlFor}-error`}>{error}</FieldError>
    ) : (
      hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
    )}
  </div>
);

export const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  loading = false,
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape" && !loading) onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, loading, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-900/40 p-4 sm:items-center"
      onClick={() => !loading && onCancel()}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h2 id="confirm-title" className="text-base font-semibold text-slate-900">
              {title}
            </h2>
            <p className="mt-1.5 text-sm text-slate-500">{message}</p>
          </div>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};
