import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { AuthAPI } from "../../services/api";

const LoginForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Validation helpers
  const isEmailValid =
    formData.email.length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);

  // ✅ Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
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
      // Call backend
      const res = await AuthAPI.login(formData);

      toast.success(res.data?.message || "Welcome back!");

      // Delay navigation so user sees toast
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Something went wrong";

      toast.error(errorMessage);
      console.error("Login failed:", errorMessage);
    } finally {
      setLoading(false);
    }
  };
  const InputField =
    "w-full min-w-[350px] p-2 border-blue-500/30 input bg-transparent hover:border-blue-500/100 hover:input-info focus:input-info";

  return (
    <div className="h-screen bg-white text-black flex flex-col justify-center items-center transition-all duration-300 ease-in-out select-none">
      <form
        onSubmit={handleSubmit}
        className="w-auto rounded-2xl p-10 shadow-2xl inset-shadow-sm text-black font-outfit text-tiny"
      >
        {/* Header */}
        <div className="text-center">
          <h1 className="font-outfit text-section font-bold">Welcome Back</h1>
        </div>

        {/* Inputs */}
        <div className="space-y-4 my-5">
          {/* Email */}
          <div className="form-control">
            <input
              type="email"
              name="email"
              required
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              className={InputField}
            />
            {/* Optional feedback */}
            <p
              className={`text-xs mt-1 ${
                isEmailValid ? "text-green-500" : "text-gray-400"
              }`}
            >
              {isEmailValid ? "Valid email" : "Enter a valid email"}
            </p>
          </div>

          {/* Password */}
          <div className="form-control">
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
        </div>

        {/* Button */}
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary btn-block font-montserrat uppercase tracking-widest"
        >
          {loading ? (
            <span className="loading loading-spinner"></span>
          ) : (
            "Login"
          )}
        </button>

        {/* Footer */}
        <div className="text-center mt-5">
          <p className="font-body text-sm opacity-70">
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
