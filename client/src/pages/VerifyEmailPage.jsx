// src/pages/VerifyEmail.jsx

import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AuthAPI } from "../services/api";
import toast from "react-hot-toast";

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("verifying");

  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    if (!token) {
      setStatus("error");
      return;
    }

    const performVerification = async () => {
      try {
        const res = await AuthAPI.verifyEmail(token);

        toast.success(res?.message || "Email verified!");
        setStatus("success");

        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } catch (error) {
        const errorMessage =
          error?.response?.data?.message || "Verification failed";

        toast.error(errorMessage);
        setStatus("error");
      }
    };

    performVerification();
  }, [token, navigate]);

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
            <div className="text-6xl mb-4">✓</div>
            <h1 className="text-2xl font-bold italic uppercase">
              Account Activated
            </h1>
            <p className="text-gray-500 mt-2">
              Redirecting you to login...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="text-6xl mb-4">✕</div>
            <h1 className="text-2xl font-bold italic uppercase">
              Verification Failed
            </h1>
            <p className="text-gray-500 mt-2">
              The link is invalid or expired.
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