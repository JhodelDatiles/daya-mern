import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AuthAPI } from "../services/api";
import toast from "react-hot-toast";

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  // STATE MANAGEMENT
  const [status, setStatus] = useState("verifying"); // verifying | success | error

  // STRICT MODE GUARD (prevents double API call)
  const hasRun = useRef(false);

  useEffect(() => {
    // Prevent duplicate execution in development
    if (hasRun.current) return;
    hasRun.current = true;

    // Validate token existence
    if (!token) {
      setStatus("error");
      return;
    }

    // EMAIL VERIFICATION REQUEST
    const performVerification = async () => {
      try {
        const res = await AuthAPI.verifyEmail(token);

        toast.success(res?.message || "Email verified!");
        setStatus("success");

        // Redirect after success
        setTimeout(() => navigate("/login"), 3000);
      } catch (error) {
        const errorMessage = error.response?.data?.message;

        // Handle already verified case
        if (errorMessage === "Already verified.") {
          toast.success("Already verified! Redirecting...");
          setStatus("success");
          setTimeout(() => navigate("/login"), 3000);
        } else {
          toast.error(errorMessage || "Verification failed");
          setStatus("error");
        }
      }
    };

    performVerification();
  }, [token, navigate]);

  // UI RENDER
  return (
    <div className="h-screen flex flex-col justify-center items-center font-outfit bg-white text-black">
      <div className="p-10 shadow-2xl rounded-2xl text-center max-w-md">
        {status === "verifying" && (
          <>
            <span className="loading loading-spinner loading-lg text-primary"></span>
            <h1 className="text-2xl font-bold mt-4 italic uppercase">
              Verifying Identity...
            </h1>
          </>
        )}

        {status === "success" && (
          <>
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-bold italic uppercase">
              Account Activated
            </h1>
            <p className="text-gray-500 mt-2">Redirecting you to login...</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold italic uppercase">
              Link Expired
            </h1>
            <p className="text-gray-500 mt-2">
              The link is invalid or has expired (24h limit).
            </p>
            <Link to="/register" className="btn btn-primary mt-6">
              Try Registering Again
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
