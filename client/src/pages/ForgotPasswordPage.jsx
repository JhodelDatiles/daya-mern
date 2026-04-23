import { useState } from "react";
import { Mail, Loader2 } from "lucide-react";
import { AuthAPI } from "../services/api";
import toast from "react-hot-toast";

const ForgotPassword = () => {
  // loading state for request button
  const [loading, setLoading] = useState(false);

  // form state (email input)
  const [formData, setFormData] = useState({
    email: "",
  });

  // handles forgot password request
  const handleRequest = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // call backend endpoint (sends reset link if email exists)
      await AuthAPI.forgotPassword(formData.email);

      // success message (generic for security)
      toast.success("Check your email for reset link");
    } catch (error) {
      // interceptor returns error.message only
      toast.error(error.message || "Invalid or expired link");
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
            Security
          </h2>
          <p className="text-[10px] font-black uppercase opacity-40 tracking-widest mt-1">
            Reset your credentials
          </p>
        </div>

        {/* email form */}
        <form onSubmit={handleRequest} className="space-y-4">
          <div className="form-control">
            <label className="label-text flex items-center gap-2 font-bold uppercase text-[10px] tracking-widest opacity-60 mb-2">
              <Mail className="w-4 h-4 text-primary" /> Registered Email
            </label>
            <input
              type="email"
              required
              className="input input-bordered bg-base-200 rounded-2xl font-bold w-full"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          {/* submit button */}
          <button
            className="btn btn-primary w-full rounded-2xl font-black uppercase italic"
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin" /> : "Send Reset Link"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
