import { Link } from "react-router-dom";
import { ScanLine, Brain, BarChart3 } from "lucide-react";

const FEATURES = [
  { icon: ScanLine, text: "Scan bills and turn them into expenses" },
  { icon: BarChart3, text: "See where your money goes, month by month" },
  { icon: Brain, text: "Get AI insights and ask questions in plain English" },
];

const AuthLayout = ({ title, subtitle, children, footer }) => (
  <div className="grid min-h-screen bg-white lg:grid-cols-2">
    <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-ink-900 via-ink-800 to-brand-900 p-12 text-white lg:flex">
      <div
        aria-hidden="true"
        className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand-500/30 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-gold-400/15 blur-3xl"
      />
      <div className="relative flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-700 text-xl font-extrabold shadow-lg shadow-black/20">
          S
        </div>
        <span className="text-xl font-semibold tracking-tight">Spendora</span>
      </div>

      <div className="relative">
        <h2 className="text-4xl font-semibold leading-tight tracking-tight">
          Know where every <span className="text-gold-400">rupee</span> goes.
        </h2>
        <p className="mt-4 max-w-md text-slate-300">
          Track expenses, scan receipts and understand your spending with
          AI-powered insights.
        </p>
        <ul className="mt-10 space-y-4">
          {FEATURES.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3 text-sm text-slate-200">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-gold-300 ring-1 ring-white/10">
                <Icon size={18} />
              </span>
              {text}
            </li>
          ))}
        </ul>
      </div>

      <p className="relative text-xs text-slate-500">© {new Date().getFullYear()} Spendora</p>
    </div>

    <div className="flex items-center justify-center px-5 py-10 sm:px-10">
      <div className="w-full max-w-md">
        <Link to="/login" className="mb-8 flex items-center gap-2.5 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-700 text-lg font-extrabold text-white">
            S
          </div>
          <span className="text-lg font-semibold tracking-tight">Spendora</span>
        </Link>

        <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
          {title}
        </h1>
        <p className="mt-2 text-sm text-slate-500">{subtitle}</p>

        <div className="mt-8">{children}</div>
        <div className="mt-8 text-center text-sm text-slate-500">{footer}</div>
      </div>
    </div>
  </div>
);

export default AuthLayout;
