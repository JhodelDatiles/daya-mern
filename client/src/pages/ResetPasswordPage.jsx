import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Lock, Loader2, Eye, EyeOff } from "lucide-react";
import { AuthAPI } from "../services/api";
import toast from "react-hot-toast";

const ResetPassword = () => {
  // get token from URL
  const { token } = useParams();
  const navigate = useNavigate();

  // loading state for submit
  const [loading, setLoading] = useState(false);

  // password input state
  const [password, setPassword] = useState("");

  // toggle password visibility
  const [showPassword, setShowPassword] = useState(false);

  // password strength validation (must match backend rules)
  const isStrongPassword =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=\S+$).{8,}$/.test(
      password,
    );

  // handles password reset submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // client-side validation before request
    if (!isStrongPassword) {
      toast.error("Password does not meet requirements");
      return;
    }

    setLoading(true);

    try {
      // send new password + token to backend
      await AuthAPI.resetPassword(token, { password });

      // success → redirect to login
      toast.success("Password updated successfully");
      navigate("/login");
    } catch (err) {
      // interceptor returns error.message only
      toast.error(err.message || "Invalid or expired link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-base-200 flex items-center justify-center p-4"
      style={{
        // same gradient background as AuthPage
        background:
          "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1e1b4b 100%)",
      }}
    >
      <div className="max-w-md w-full bg-base-100 rounded-[40px] p-10 shadow-2xl border border-primary/5">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black uppercase italic tracking-tighter">
            Reset Password
          </h2>
          <p className="text-[10px] font-black uppercase opacity-40 tracking-widest mt-1">
            Enter new credentials
          </p>
        </div>

        {/* reset form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label-text flex items-center gap-2 font-bold uppercase text-[10px] tracking-widest opacity-60 mb-2">
              <Lock className="w-4 h-4 text-primary" /> New Password
            </label>

            {/* password input with toggle */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                className="input input-bordered bg-base-200 rounded-2xl font-bold w-full pr-11"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

            {/* password strength indicator */}
            <p
              className={`text-xs mt-1 ${
                isStrongPassword ? "text-success" : "text-base-content/50"
              }`}
            >
              Must be 8+ chars, include upper, lower, number, symbol & no spaces
            </p>
          </div>

          {/* submit button */}
          <button
            className="btn btn-primary w-full rounded-2xl font-black uppercase italic"
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin" /> : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
