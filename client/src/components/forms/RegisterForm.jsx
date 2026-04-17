import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { AuthAPI } from "../../services/api";

const RegisterForm = () => {
  // useNavigate hook from react-router, used to redirect user after success
  const navigate = useNavigate();

  // STATE MANAGEMENT
  // isSubmitted: tracks if registration was successful (used for redirect)
  // loading: tracks if request is in progress (used to disable button and show loading text)
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form data state
  // holds all user input values coming from the form fields
  // this data is later sent to the backend API
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // VALIDATION LOGIC

  // Email validation
  // checks if email is not empty and matches a basic email regex pattern
  // used before sending data to backend to prevent invalid input
  const isEmailValid =
    formData.email.length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);

  // Password strength validation
  // checks if password contains uppercase, lowercase, number, symbol, and is at least 8 characters
  // prevents weak passwords before sending to backend
  const isStrongPassword =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{8,}$/.test(
      formData.password,
    );

  // HANDLE INPUT CHANGES
  const handleChange = (e) => {
    // extract input name and value from the event (data comes from user typing)
    const { name, value } = e.target;

    // update form state dynamically based on input name
    // this keeps formData in sync with UI input fields
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // FORM SUBMISSION
  const handleSubmit = async (e) => {
    // prevent default browser form submission behavior
    e.preventDefault();

    // 1. Email validation (client-side)
    // stops request if email format is invalid
    if (!isEmailValid) {
      toast.error("Please enter a valid email");
      return;
    }

    // 2. Password strength validation (client-side)
    if (!isStrongPassword) {
      toast.error("Password does not meet requirements");
      return;
    }

    // 3. Password match validation (client-side)
    // ensures password and confirmPassword match before sending to backend
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    // 4. Set loading state
    // indicates that request is being sent to backend
    setLoading(true);

    try {
      // 5. Call backend API
      // sends formData (username, email, password, confirmPassword) to server
      // AuthAPI.register uses axios to POST data to /auth/register endpoint
      const res = await AuthAPI.register(formData);

      // 6. Success feedback
      // shows message returned from backend (res.data.message)
      // if not available, fallback message is used
      toast.success(
        res?.data?.message || "Verification sent, check your gmail to verify!",
      );

      // update state to trigger redirect effect
      setIsSubmitted(true);
    } catch (error) {
      // 7. Error handling
      // error comes from backend response or network error
      // tries to extract meaningful message from backend response
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Something went wrong";

      // display error message to user
      toast.error(errorMessage);
    } finally {
      // 8. Reset loading
      // stops loading state regardless of success or failure
      setLoading(false);
    }
  };

  // REDIRECT AFTER SUCCESS
  useEffect(() => {
    // runs when isSubmitted changes
    if (isSubmitted) {
      // delay redirect by 3 seconds so user can read success message
      const timer = setTimeout(() => {
        // navigate to login page after successful registration
        navigate("/login");
      }, 3000);

      // cleanup function to clear timer if component unmounts
      return () => clearTimeout(timer);
    }
  }, [isSubmitted, navigate]);

  // INPUT STYLE
  // reusable CSS classes for input fields
  const InputField =
    "w-full min-w-[350px] p-2 border-blue-500/30 input bg-transparent hover:border-blue-500/100 hover:input-info focus:input-info";

  // COMPONENT UI
  // renders the form and binds state + handlers to inputs
  return (
    <div className="h-screen bg-white flex justify-center items-center">
      <form
        onSubmit={handleSubmit} // triggers handleSubmit when form is submitted
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
              value={formData.username} // value comes from state
              onChange={handleChange} // updates state when user types
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
              value={formData.email} // value comes from state
              onChange={handleChange} // updates state
              className={InputField}
            />

            {/* Email feedback */}
            <p
              className={`text-xs mt-1 ${
                isEmailValid ? "text-green-500" : "text-gray-400"
              }`}
            >
              {/* shows validation result based on isEmailValid */}
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
              value={formData.password} // value comes from state
              onChange={handleChange} // updates state
              className={InputField}
            />

            {/* Password feedback */}
            <p
              className={`text-xs mt-1 ${
                isStrongPassword ? "text-green-500" : "text-gray-400"
              }`}
            >
              {/* shows password strength feedback */}
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
              value={formData.confirmPassword} // value comes from state
              onChange={handleChange} // updates state
              className={InputField}
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading} // disabled while request is in progress
          className="btn btn-primary w-full"
        >
          {/* shows loading text or normal text */}
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
