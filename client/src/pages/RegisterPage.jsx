import React from "react";
import RegisterForm from "../components/forms/RegisterForm";

function RegisterPage() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="flex justify-center items-center w-full min-h-screen bg-amber-50">
        <RegisterForm />
      </div>
      <div className="w-full"></div>
    </div>
  );
}

export default RegisterPage;
