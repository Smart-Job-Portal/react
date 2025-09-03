import React, { useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ToastProvider } from "./components/ui";
import { LoginForm } from "./pages/auth/LoginForm";
import { RegisterForm } from "./pages/auth/RegisterForm";
import { ForgotPasswordForm } from "./pages/auth/ForgotPasswordForm";
import { Dashboard } from "./pages/Dashboard";
import "./App.css";

type AuthMode = "login" | "register" | "forgot-password";

const AuthWrapper: React.FC = () => {
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const { user, isLoading } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, show dashboard
  if (user) {
    return <Dashboard />;
  }

  // If user is not authenticated, show appropriate auth form
  const renderAuthForm = () => {
    switch (authMode) {
      case "register":
        return <RegisterForm onToggleMode={setAuthMode} />;
      case "forgot-password":
        return <ForgotPasswordForm onToggleMode={setAuthMode} />;
      default:
        return <LoginForm onToggleMode={setAuthMode} />;
    }
  };

  return renderAuthForm();
};

const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <div className="App">
          <AuthWrapper />
        </div>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
