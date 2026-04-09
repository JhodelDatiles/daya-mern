import React from "react";
import LoginForm from "../components/forms/LoginForm";

const LoginPage = () => {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-full"></div>
      <div className="flex justify-center items-center w-full min-h-screen bg-amber-50">
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
