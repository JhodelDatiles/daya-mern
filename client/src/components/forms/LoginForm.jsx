import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Attempting login:", formData);
      // Add your API call logic here
    } catch (error) {
      console.error("Login failed");
    } finally {
      setLoading(false);
    }
  };

  const InputField =
    "w-full min-w-[350px] p-2 border-blue-500/30 input bg-transparent hover:border-blue-500/100 hover:input-info focus:input-info";

  return (
    <div className="h-screen bg-white text-black flex flex-col justify-center items-center">
      <form
        onSubmit={handleSubmit}
        className="w-auto rounded-2xl p-10 shadow-2xl inset-shadow-sm text-black font-outfit text-tiny"
      >
        {/* Header Section */}
        <div className="text-center">
          <h1 className="font-outfit text-section font-bold">Welcome Back</h1>
        </div>

        {/* Inputs */}
        <div className="space-y-4 my-5">
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
          </div>

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
