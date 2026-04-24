// AuthPage.jsx
// Single page that handles both Login and Register with a sliding panel animation.
// Replace your LoginPage and RegisterPage routes with this single component.
// Usage in router: <Route path="/login" element={<AuthPage />} />
//                  <Route path="/register" element={<AuthPage initialMode="register" />} />

import React, { useState, useEffect } from "react"; // UPDATED
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { AuthAPI } from "../services/api";

// ─── Login Form ───────────────────────────────────────────────────────────────
const LoginForm = ({ onSwitch }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  useEffect(() => {
    const stored = localStorage.getItem("rememberLogin");
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored);

      if (parsed.expiresAt && Date.now() < parsed.expiresAt) {
        setFormData((prev) => ({
          ...prev,
          email: parsed.email || "",
        }));
        setRememberMe(true);
      } else {
        localStorage.removeItem("rememberLogin");
      }
    } catch {
      localStorage.removeItem("rememberLogin");
    }
  }, []);

  const isEmailValid =
    formData.email.length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEmailValid) {
      toast.error("Please enter a valid email");
      return;
    }
    if (!formData.password) {
      toast.error("Password is required");
      return;
    }
    setLoading(true);
    try {
      const res = await AuthAPI.login({ ...formData, rememberMe });

      // SAVE EMAIL IF REMEMBER ME
      if (rememberMe) {
        localStorage.setItem(
          "rememberLogin",
          JSON.stringify({
            email: formData.email,
            expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
          }),
        );
      } else {
        localStorage.removeItem("rememberLogin");
      }

      toast.success(res.data?.message || "Welcome back!");
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (error) {
      const errorMessage = error.message;
      toast.error(errorMessage);
      if (errorMessage.toLowerCase().includes("unverified"))
        setShowResend(true);
      console.error("Login failed:", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!isEmailValid) {
      toast.error("Enter a valid email first");
      return;
    }
    setResendLoading(true);
    try {
      const res = await AuthAPI.resendVerification(formData.email);
      toast.success(res.message || "Verification email sent!");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to resend email",
      );
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-4 w-full">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-semibold">Welcome Back</h2>
        <p className="text-sm text-base-content/60">Login to your account</p>
      </div>

      <div className="space-y-3">
        <div>
          <input
            type="email"
            name="email"
            required
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            className="input input-bordered w-full h-11"
          />
          <p
            className={`text-xs mt-1 ${isEmailValid ? "text-success" : "text-base-content/50"}`}
          >
            {isEmailValid ? "Valid email" : "Enter a valid email"}
          </p>
        </div>

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            required
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="input input-bordered w-full h-11 pr-11"
          />
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            tabIndex={-1}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-base-content transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="checkbox checkbox-primary checkbox-sm"
          />
          <span className="text-sm text-base-content/70">Remember me</span>
        </label>
        <Link
          to="/forgot-password"
          className="text-sm link link-primary font-medium"
        >
          Forgot password?
        </Link>
      </div>

      {showResend && (
        <button
          type="button"
          onClick={handleResend}
          disabled={resendLoading}
          className={`btn btn-outline btn-sm w-full ${resendLoading ? "btn-disabled" : ""}`}
        >
          {resendLoading ? (
            <span className="loading loading-spinner loading-xs" />
          ) : (
            "Resend Verification Email"
          )}
        </button>
      )}

      <button
        type="submit"
        disabled={loading}
        className={`btn btn-primary w-full ${loading ? "btn-disabled" : ""}`}
      >
        {loading ? (
          <span className="loading loading-spinner loading-sm" />
        ) : (
          "Login"
        )}
      </button>
    </form>
  );
};

// (NO CHANGES BELOW — everything remains exactly the same)

// ─── Register Form ────────────────────────────────────────────────────────────
const RegisterForm = ({ onSwitch }) => {
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const isEmailValid =
    formData.email.length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);

  const isStrongPassword =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=\S+$).{8,}$/.test(
      formData.password,
    );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEmailValid) {
      toast.error("Please enter a valid email");
      return;
    }
    if (!isStrongPassword) {
      toast.error("Password does not meet requirements");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    setLoading(true);
    try {
      const res = await AuthAPI.register(formData);
      toast.success(
        res?.data?.message || "Verification sent, check your gmail to verify!",
      );
      setIsSubmitted(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-4 w-full">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-semibold">Create account</h2>
        <p className="text-sm text-base-content/60">
          Get started with your account
        </p>
      </div>

      <div className="space-y-3">
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          className="input input-bordered w-full h-11"
        />

        <div>
          <input
            type="email"
            name="email"
            required
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            className="input input-bordered w-full h-11"
          />
          <p
            className={`text-xs mt-1 ${isEmailValid ? "text-success" : "text-base-content/50"}`}
          >
            {isEmailValid ? "Valid email" : "Enter a valid email"}
          </p>
        </div>

        <div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              required
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="input input-bordered w-full h-11 pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-base-content transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <p
            className={`text-xs mt-1 ${isStrongPassword ? "text-success" : "text-base-content/50"}`}
          >
            Must be 8+ chars, include upper, lower, number, symbol & no spaces
          </p>
        </div>

        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            required
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="input input-bordered w-full h-11 pr-11"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((p) => !p)}
            tabIndex={-1}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/50 hover:text-base-content transition-colors"
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`btn btn-primary w-full ${loading ? "btn-disabled" : ""}`}
      >
        {loading ? (
          <span className="loading loading-spinner loading-sm" />
        ) : (
          "Sign Up"
        )}
      </button>

      {/* <p className="text-center text-sm text-base-content/70">
        Already have an account?{" "}
        <button type="button" onClick={onSwitch} className="link link-primary font-medium">
          Login
        </button>
      </p> */}
    </form>
  );
};

// ─── Branding Panel ───────────────────────────────────────────────────────────
const BrandPanel = ({ mode, onSwitch }) => {
  const isLogin = mode === "login";
  return (
    <div className="flex flex-col items-center justify-center h-full px-10 text-center space-y-6">
      <div className="flex items-center gap-3">
        <ShieldCheck size={36} className="text-white/90" />
        <span className="text-4xl font-extrabold tracking-tight text-white">
          Dayaan
        </span>
      </div>
      <p className="text-white/70 text-base max-w-xs leading-relaxed">
        {isLogin
          ? "Don't have an account yet? Join thousands of educators building cheat-proof assessments."
          : "Already have an account? Sign in and get back to building honest exams."}
      </p>
      <button
        onClick={onSwitch}
        className="btn btn-outline border-white/40 text-white hover:bg-white hover:text-slate-900 transition-all rounded-full px-8"
      >
        {isLogin ? "Create an Account" : "Sign In"}
      </button>
    </div>
  );
};

// ─── Auth Page (main) ─────────────────────────────────────────────────────────
const AuthPage = ({ initialMode = "login" }) => {
  const [mode, setMode] = useState(initialMode); // "login" | "register"
  const [animating, setAnimating] = useState(false);

  const switchMode = () => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setMode((m) => (m === "login" ? "register" : "login"));
      setAnimating(false);
    }, 500);
  };

  const isLogin = mode === "login";

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background:
          "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1e1b4b 100%)",
      }}
    >
      {/* Card wrapper */}
      <div className="relative w-full max-w-4xl min-h-[580px] rounded-2xl overflow-hidden shadow-2xl flex">
        {/* ── Gradient (branding) panel ── */}
        <div
          className="absolute top-0 bottom-0 w-1/2 transition-all duration-500 ease-in-out z-10"
          style={{
            background: "linear-gradient(135deg, #1d4ed8 0%, #4f46e5 100%)",
            left: isLogin ? "50%" : "0%",
          }}
        >
          <BrandPanel mode={mode} onSwitch={switchMode} />
        </div>

        {/* ── Form panels ── */}
        {/* Login panel — always on left slot */}
        <div
          className="w-1/2 bg-base-100 flex items-center justify-center p-10 transition-all duration-500 ease-in-out"
          style={{
            opacity: isLogin ? 1 : 0,
            pointerEvents: isLogin ? "auto" : "none",
            transform: isLogin ? "translateX(0)" : "translateX(-20px)",
          }}
        >
          <LoginForm onSwitch={switchMode} />
        </div>

        {/* Register panel — always on right slot */}
        <div
          className="w-1/2 bg-base-100 flex items-center justify-center p-10 transition-all duration-500 ease-in-out"
          style={{
            opacity: !isLogin ? 1 : 0,
            pointerEvents: !isLogin ? "auto" : "none",
            transform: !isLogin ? "translateX(0)" : "translateX(20px)",
          }}
        >
          <RegisterForm onSwitch={switchMode} />
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
