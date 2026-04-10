import React from "react";
import toast from "react-hot-toast";
import { AuthAPI } from "../services/api";
import { useNavigate } from "react-router-dom";

const DashBoard = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // 1. Call the backend to clear cookies and DB token
      const res = await AuthAPI.logout();
      console.log("Full Logout Response:", res);
      // 2. Clear any local user data if you stored it
      // localStorage.removeItem("user");

      // 3. Success feedback
      const message =
        res?.data?.message || res?.message || "Logged out successfully!";
      toast.success(message);

      // 4. Send them back to login
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  return (
    <div className="bg-red-500">
      <button className="btn" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default DashBoard;
