import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { AuthAPI } from "../../services/api";

const RegisterForm = () => {
  const navigate = useNavigate();

  // STATE MANAGEMENT
  const [isSubmitted, setIsSubmitted] = useState(false); // tracks success state
  const [loading, setLoading] = useState(false); // loading spinner

  // Form data state
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // VALIDATION LOGIC

  // Email validation
  const isEmailValid =
    formData.email.length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);

  // Password strength validation
  const isStrongPassword =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/.test(
      formData.password,
    );

  // HANDLE INPUT CHANGES
  const handleChange = (e) => {
    const { name, value } = e.target;

    // update form state dynamically
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // FORM SUBMISSION
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Email validation
    if (!isEmailValid) {
      toast.error("Please enter a valid email");
      return;
    }

    // 2. Password strength validation
    if (!isStrongPassword) {
      toast.error("Password does not meet requirements");
      return;
    }

    // 3. Password match validation
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    // 4. Set loading state
    setLoading(true);

    try {
      // 5. Call backend API
      const res = await AuthAPI.register(formData);

      // 6. Success feedback
      toast.success(
        res?.data?.message || "Verification sent, check your gmail to verify!",
      );

      setIsSubmitted(true);
    } catch (error) {
      // 7. Error handling
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Something went wrong";

      toast.error(errorMessage);
    } finally {
      // 8. Reset loading
      setLoading(false);
    }
  };

  // REDIRECT AFTER SUCCESS
  useEffect(() => {
    if (isSubmitted) {
      const timer = setTimeout(() => {
        navigate("/login"); // redirect to login page
      }, 3000);

      return () => clearTimeout(timer); // cleanup
    }
  }, [isSubmitted, navigate]);

  // INPUT STYLE
  const InputField =
    "w-full min-w-[350px] p-2 border-blue-500/30 input bg-transparent hover:border-blue-500/100 hover:input-info focus:input-info";

  // COMPONENT UI
  return (
    <div className="h-screen bg-white flex justify-center items-center">
      <form
        onSubmit={handleSubmit}
        className="p-10 rounded-2xl shadow-2xl font-outfit text-black"
      >
        {/* Header */}
        <h1 className="text-center font-bold text-xl">Create account</h1>

        <div className="space-y-4 my-5">
          {/* Username */}
          <div>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className={InputField}
            />
          </div>

          {/* Email */}
          <div>
            <input
              type="email"
              name="email"
              required
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              className={InputField}
            />

            {/* Email feedback */}
            <p
              className={`text-xs mt-1 ${
                isEmailValid ? "text-green-500" : "text-gray-400"
              }`}
            >
              {isEmailValid ? "Valid email" : "Enter a valid email"}
            </p>
          </div>

          {/* Password */}
          <div>
            <input
              type="password"
              name="password"
              required
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className={InputField}
            />

            {/* Password feedback */}
            <p
              className={`text-xs mt-1 ${
                isStrongPassword ? "text-green-500" : "text-gray-400"
              }`}
            >
              Must be 8+ chars, include upper, lower, number & symbol
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <input
              type="password"
              name="confirmPassword"
              required
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={InputField}
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full"
        >
          {loading ? "Loading..." : "Sign Up"}
        </button>

        {/* Footer */}
        <div className="text-center mt-5">
          <p className="font-body text-sm opacity-70">
            Already have an account?{" "}
            <a href="/login" className="link link-primary font-bold">
              click here.
            </a>
          </p>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;
