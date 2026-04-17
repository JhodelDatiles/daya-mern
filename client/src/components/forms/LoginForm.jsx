// LoginForm.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { AuthAPI } from "../../services/api";

const LoginForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const isEmailValid =
    formData.email.length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
      const res = await AuthAPI.login(formData);

      toast.success(res.message || "Welcome back!");

      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Something went wrong. Please try again.";

      toast.error(errorMessage);

      if (errorMessage.toLowerCase().includes("verify")) {
        setShowResend(true);
      }

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

    try {
      const res = await AuthAPI.resendVerification(formData.email);
      toast.success(res.message || "Verification email sent!");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to resend email";

      toast.error(errorMessage);
    }
  };

  const InputField =
    "w-full min-w-[350px] p-2 border-blue-500/30 input bg-transparent hover:border-blue-500/100 hover:input-info focus:input-info";

  return (
    <div className="h-screen bg-white text-black flex flex-col justify-center items-center select-none">
      <form
        onSubmit={handleSubmit}
        className="w-auto rounded-2xl p-10 shadow-2xl text-black font-outfit"
      >
        <div className="text-center">
          <h1 className="font-outfit text-section font-bold">Welcome Back</h1>
        </div>

        <div className="space-y-4 my-5">
          <input
            type="email"
            name="email"
            required
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            className={InputField}
          />

          <p
            className={`text-xs ${isEmailValid ? "text-green-500" : "text-gray-400"}`}
          >
            {isEmailValid ? "Valid email" : "Enter a valid email"}
          </p>

          <input
            type="password"
            name="password"
            required
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className={InputField}
          />
        </div>

        {showResend && (
          <button
            type="button"
            onClick={handleResend}
            className="btn btn-outline btn-sm mt-3 w-full"
          >
            Resend Verification Email
          </button>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary btn-block"
        >
          {loading ? "Loading..." : "Login"}
        </button>

        <div className="text-center mt-5">
          <p className="text-sm opacity-70">
            New here?{" "}
            <a href="/register" className="link link-primary font-bold">
              Create an account
            </a>
          </p>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
