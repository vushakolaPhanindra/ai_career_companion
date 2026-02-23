import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { useLocation } from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Setup from "./pages/InterviewSetup";
import Room from "./pages/InterviewRoom";
import Report from "./pages/Report";
import History from "./pages/History";

/* =========================================================
   🔐 PRIVATE ROUTE (Supports Guest Mode)
========================================================= */
function PrivateRoute({ children }) {
  const { currentUser } = useAuth();
  const location = useLocation();

  const isGuest = location.state?.guest;

  if (currentUser || isGuest) {
    return children;
  }

  return <Navigate to="/login" replace />;
}

/* =========================================================
   🔁 PUBLIC ROUTE (Prevent logged-in user from seeing login)
========================================================= */
function PublicRoute({ children }) {
  const { currentUser } = useAuth();

  return currentUser ? <Navigate to="/dashboard" replace /> : children;
}

/* =========================================================
   🌍 APP ROUTER
========================================================= */
export default function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>

          {/* Public Pages */}
          <Route path="/" element={<Landing />} />

          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          <Route
            path="/signup"
            element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            }
          />

          {/* Protected / Guest Allowed */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/setup"
            element={
              <PrivateRoute>
                <Setup />
              </PrivateRoute>
            }
          />

          <Route
            path="/history"
            element={
              <PrivateRoute>
                <History />
              </PrivateRoute>
            }
          />

          <Route
            path="/interview/:id"
            element={
              <PrivateRoute>
                <Room />
              </PrivateRoute>
            }
          />

          {/* Fully Protected (No Guest Access) */}
          <Route
            path="/report/:id"
            element={
              <PrivateRoute>
                <Report />
              </PrivateRoute>
            }
          />

          {/* 404 Page */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
                <div className="text-center">
                  <h1 className="text-5xl font-bold mb-4">404</h1>
                  <p className="text-white/50 mb-6">Page not found</p>
                  <Navigate to="/" replace />
                </div>
              </div>
            }
          />

        </Routes>
      </Router>
    </AuthProvider>
  );
}