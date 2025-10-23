import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";
import LoginPage from "./Auth/LoginPage";
import RegisterPage from "./Auth/RegisterPage";
import AuthLayout from "./Layouts/AuthLayout";
import { getCurrentUser } from "./Services/AuthService";
import DashboardPage from "./Pages/DashboardPage";

// Auth Service

// Protected Route Component
const ProtectedRoute = ({ children }: any) => {
  const user = getCurrentUser();
  if (!user) {
    // If no user token, redirect to the login page
    return <Navigate to="/login" />;
  }
  return children;
};

// Public Route Component (prevents logged-in users from seeing guest/login pages)
const PublicRoute = ({ children }: any) => {
  const user = getCurrentUser();
  if (user) {
    // If user is logged in, redirect to the dashboard
    return <Navigate to="/dashboard" />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        {/* <Route path="/" element={<PublicRoute><GuestPage /></PublicRoute>} /> */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />

        {/* Protected Routes inside AuthLayout */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AuthLayout />
            </ProtectedRoute>
          }
        >
          {/* Define nested routes for the authenticated area */}
          {/* The default protected route will be /dashboard */}
          <Route path="dashboard" element={<DashboardPage />} />
          {/* Example: <Route path="profile" element={<ProfilePage />} /> */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
