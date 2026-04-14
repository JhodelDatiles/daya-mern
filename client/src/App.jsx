// Imports
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster, ToastBar } from "react-hot-toast";
// Import Pagesa
import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import VerifyEmail from "./pages/VerifyEmailPage";
import DashBoard from "./pages/DashBoard";

function AppInner() {
  return (
    <>
      <Toaster
        position="top-center" // Changed from "top-right"
        reverseOrder={false}
        containerStyle={{ top: 20 }} // Adjusted top spacing for center alignment
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: "16px",
            padding: "16px",
            fontWeight: "900",
            textTransform: "uppercase",
            fontSize: "11px",
            letterSpacing: "0.1em",
            fontStyle: "italic",
            border: "1px solid oklch(var(--p) / 0.2)",
            background: "#121212",
            color: "#fff",
          },
        }}
      >
        {(t) => (
          <ToastBar
            toast={t}
            style={{
              ...t.style,
              // Note: If you have custom CSS animations like slideInRight,
              // you might want to change them to a 'fadeIn' or 'slideInDown'
              // for a better look at the top-center position.
              animation: t.visible
                ? "fadeIn 0.35s ease-out"
                : "fadeOut 0.35s ease-in forwards",
            }}
          />
        )}
      </Toaster>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        <Route path="/dashboard" element={<DashBoard />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppInner />
    </Router>
  );
}

export default App;
