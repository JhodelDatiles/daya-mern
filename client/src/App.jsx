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

function AppInner() {
  return (
    <>
      <Toaster
        position="top-right"
        reverseOrder={false}
        containerStyle={{ top: 70, right: 20 }}
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
              animation: t.visible
                ? "slideInRight 0.35s ease-out"
                : "slideOutRight 0.35s ease-in forwards",
            }}
          />
        )}
      </Toaster>

      <Routes>
        <Route path="/" element={<HomePage />}/>
        <Route path="/register" element={<RegisterPage />}/>
        <Route path="/login" element={<LoginPage />}/>
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
