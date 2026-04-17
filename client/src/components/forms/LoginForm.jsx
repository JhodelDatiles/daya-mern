// LoginForm.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { AuthAPI } from "../../services/api";

const LoginForm = () => {
  // useNavigate hook used to redirect user after login
  const navigate = useNavigate();

  // loading: tracks API request state
  // showResend: controls visibility of resend verification button
  const [loading, setLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);

  // form state
  // stores user input (email and password)
  // this data is sent to backend when login is submitted
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // email format validation
  // checks if email is not empty and matches regex pattern
  // used to prevent invalid email before sending request
  const isEmailValid =
    formData.email.length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);

  // handle input changes
  const handleChange = (e) => {
    // extract name and value from input field (user input)
    const { name, value } = e.target;

    // update formData state dynamically
    // keeps input values synced with state
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle submitted data
  const handleSubmit = async (e) => {
    // prevent default form submission behavior
    e.preventDefault();

    // checks email format before sending to backend
    if (!isEmailValid) {
      toast.error("Please enter a valid email");
      return;
    }

    // checks password field if empty
    if (!formData.password) {
      toast.error("Password is required");
      return;
    }

    // set loading state (request started)
    setLoading(true);

    try {
      // call backend API
      // sends formData (email, password) to /auth/login endpoint
      const res = await AuthAPI.login(formData);

      // display success message from backend response
      toast.success(res.data?.message || "Welcome back!");

      // redirect to dashboard after short delay
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (error) {
      // error comes from backend or network
      // currently only using generic error.message
      const errorMessage = error.message;

      // show error to user
      toast.error(errorMessage);

      // if backend message contains "unverified"
      // show resend verification button
      if (errorMessage.toLowerCase().includes("unverified")) {
        setShowResend(true);
      }

      // log error for debugging
      console.error("Login failed:", errorMessage);
    } finally {
      // reset loading state after request completes
      setLoading(false);
    }
  };

  const handleResend = async () => {
    // ensures email is valid before making request
    if (!isEmailValid) {
      toast.error("Enter a valid email first");
      return;
    }

    try {
      // call backend API to resend verification email
      // sends email to /auth/resend-verification endpoint
      const res = await AuthAPI.resendVerification(formData.email);

      // show success message from backend
      toast.success(res.message || "Verification email sent!");
    } catch (error) {
      // extract error message from backend response if available
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to resend email";

      // show error message to user
      toast.error(errorMessage);
    }
  };

  // reusable CSS class for input fields
  const InputField =
    "w-full min-w-[350px] p-2 border-blue-500/30 input bg-transparent hover:border-blue-500/100 hover:input-info focus:input-info";

  return (
    <div className="h-screen bg-white text-black flex flex-col justify-center items-center select-none">
      <form
        // handleSubmit is triggered when user submits form
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
            value={formData.email} // value from state
            onChange={handleChange} // updates state on input change
            className={InputField}
          />

          <p
            className={`text-xs ${isEmailValid ? "text-green-500" : "text-gray-400"}`}
          >
            {/* shows validation result */}
            {isEmailValid ? "Valid email" : "Enter a valid email"}
          </p>

          <input
            type="password"
            name="password"
            required
            placeholder="Password"
            value={formData.password} // value from state
            onChange={handleChange} // updates state
            className={InputField}
          />
        </div>

        {/* conditionally render resend button if account is unverified */}
        {showResend && (
          <button
            type="button"
            onClick={handleResend} // triggers resend request
            className="btn btn-outline btn-sm mt-3 w-full"
          >
            Resend Verification Email
          </button>
        )}

        <button
          type="submit"
          disabled={loading} // disabled while request is in progress
          className="btn btn-primary btn-block"
        >
          {/* shows loading text or default text */}
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
