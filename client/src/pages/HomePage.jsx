import React from "react";

const HomePage = () => {
  return (
    <div>
      <button className="btn" onClick={() => (window.location.href = "/login")}>
        login
      </button>
    </div>
  );
};

export default HomePage;
