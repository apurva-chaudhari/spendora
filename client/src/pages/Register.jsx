import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import authService from "../services/authService";
import AuthLayout from "../components/AuthLayout";
import { Alert, Button, Field, inputClass, inputErrorClass } from "../components/ui";
import { isEmail } from "../lib/format";

const strengthOf = (password) => {
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score++;
  return score;
};

const STRENGTH = [
  { label: "Too short", bar: "bg-red-500" },
  { label: "Weak", bar: "bg-red-500" },
  { label: "Fair", bar: "bg-amber-500" },
  { label: "Good", bar: "bg-emerald-500" },
  { label: "Strong", bar: "bg-emerald-600" },
];

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (localStorage.getItem("token")) {
    return <Navigate to="/dashboard" replace />;
  }

  const validate = (data) => {
    const errors = {};
    if (!data.name.trim()) errors.name = "Name is required.";
    if (!data.email.trim()) errors.email = "Email is required.";
    else if (!isEmail(data.email.trim())) errors.email = "Enter a valid email address.";
    if (!data.password) errors.password = "Password is required.";
    else if (data.password.length < 6)
      errors.password = "Password must be at least 6 characters.";
    if (!data.confirmPassword) errors.confirmPassword = "Please confirm your password.";
    else if (data.confirmPassword !== data.password)
      errors.confirmPassword = "Passwords do not match.";
    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((current) => ({ ...current, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((current) => ({ ...current, [name]: "" }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validate(formData);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setError("");
    setLoading(true);

    try {
      await authService.register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });
      navigate("/login", { state: { registered: true } });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (err.request
            ? "Can't reach the server. Check your connection and try again."
            : "Registration failed. Please try again."),
      );
    } finally {
      setLoading(false);
    }
  };

  const strength = formData.password ? strengthOf(formData.password) : -1;

  const textField = (name, label, props = {}) => (
    <Field label={label} htmlFor={name} error={fieldErrors[name]}>
      <input
        id={name}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        aria-invalid={!!fieldErrors[name]}
        aria-describedby={fieldErrors[name] ? `${name}-error` : undefined}
        className={`${inputClass} ${fieldErrors[name] ? inputErrorClass : ""}`}
        {...props}
      />
    </Field>
  );

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start tracking your spending in under a minute."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {error && <Alert type="error">{error}</Alert>}

        {textField("name", "Full name", {
          type: "text",
          autoComplete: "name",
          placeholder: "Your name",
        })}
        {textField("email", "Email", {
          type: "email",
          autoComplete: "email",
          placeholder: "you@example.com",
        })}

        <div>
          <Field label="Password" htmlFor="password" error={fieldErrors.password}>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                aria-invalid={!!fieldErrors.password}
                aria-describedby={fieldErrors.password ? "password-error" : undefined}
                className={`${inputClass} pr-11 ${fieldErrors.password ? inputErrorClass : ""}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </Field>

          {strength >= 0 && (
            <div className="mt-2.5" aria-live="polite">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`h-1 flex-1 rounded-full ${
                      step <= strength ? STRENGTH[strength].bar : "bg-slate-200"
                    }`}
                  />
                ))}
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Strength: {STRENGTH[strength].label}
              </p>
            </div>
          )}
        </div>

        {textField("confirmPassword", "Confirm password", {
          type: showPassword ? "text" : "password",
          autoComplete: "new-password",
          placeholder: "Re-enter your password",
        })}

        <Button type="submit" loading={loading} className="w-full py-3">
          {loading ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </AuthLayout>
  );
};

export default Register;
