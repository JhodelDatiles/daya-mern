import React, { useState } from "react";

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    setLoading(true);
    console.log("Registering user:", formData);
    // Add your API call logic here
    setLoading(false);
  };

  const InputField =
    "w-full h-full min-w-[350px] p-2 border-blue-500/30 input bg-transparent hover:border-blue-500/100 hover:input-info focus:input-info";

  return (
    <div className="h-screen bg-white text-black flex flex-col justify-center items-center">
      <form
        onSubmit={handleSubmit}
        className="w-auto rounded-2xl p-10 shadow-2xl inset-shadow-sm text-black font-outfit text-tiny"
      >
        {/* Header Section */}
        <div className="text-center">
          <h1 className="font-outfit text-section font-bold">Create account</h1>
        </div>

        {/* Inputs */}
        <div className="space-y-4 my-5">
          <div className="form-control">
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className={InputField}
            />
          </div>

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

          <div className="form-control">
            <input
              type="confirmPassword"
              name="confirmPassword"
              required
              placeholder="Confirm Password"
              value={formData.confirmPassword}
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
            "Sign Up"
          )}
        </button>

        <div className="text-center mt-5">
          <p className="font-body text-sm opacity-70">
            Already have an account?{" "}
            <a href="/login" className="link link-primary font-bold">
              Login
            </a>
          </p>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;
