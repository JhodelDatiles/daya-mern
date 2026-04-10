import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { AuthAPI } from "../../services/api";

const RegisterForm = () => {
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // form state
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // email validation
  const isEmailValid =
    formData.email.length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);

  // password validation
  const isStrongPassword =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/.test(
      formData.password,
    );

  // handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // handle submit
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

      toast.success(res?.data?.message || "Registration successful!");

      setIsSubmitted(true);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Something went wrong";

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // redirect after success
  useEffect(() => {
    if (isSubmitted) {
      const timer = setTimeout(() => {
        navigate("/dashboard");
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isSubmitted, navigate]);

  const InputField =
    "w-full min-w-[350px] p-2 border-blue-500/30 input bg-transparent hover:border-blue-500/100 hover:input-info focus:input-info";

  return (
    <div className="h-screen bg-white flex justify-center items-center">
      <form
        onSubmit={handleSubmit}
        className="p-10 rounded-2xl shadow-2xl font-outfit text-black"
      >
        <h1 className="text-center font-bold text-xl">Create account</h1>

        <div className="space-y-4 my-5">
          {/* username */}
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

          {/* email */}
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

            <p
              className={`text-xs mt-1 ${
                isEmailValid ? "text-green-500" : "text-gray-400"
              }`}
            >
              {isEmailValid ? "Valid email" : "Enter a valid email"}
            </p>
          </div>

          {/* password */}
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
          </div>

          {/* password feedback */}
          <p
            className={`text-xs ${
              isStrongPassword ? "text-green-500" : "text-gray-400"
            }`}
          >
            Must be 8+ chars, include upper, lower, number & symbol
          </p>

          {/* confirm password */}
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

        {/* submit button */}
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
