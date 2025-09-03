import React, { useState } from "react";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { Button, Input, Select, Card, CardHeader, CardTitle, CardContent } from "../../components/ui";
import { validateEmail, validatePassword, validateName } from "../../utils";
import { USER_ROLES } from "../../constants";
import type { RegisterData, UserRole } from "../../types";

interface RegisterFormProps {
  onToggleMode: (mode: "login" | "register" | "forgot-password") => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onToggleMode }) => {
  const { register, isLoading } = useAuth();
  const [formData, setFormData] = useState<RegisterData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "SEEKER" as UserRole,
  });
  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    role?: string;
  }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const validateForm = (): boolean => {
    const newErrors: {
      firstName?: string;
      lastName?: string;
      email?: string;
      password?: string;
      role?: string;
    } = {};

    // First name validation
    const firstNameValidation = validateName(formData.firstName);
    if (!formData.firstName) {
      newErrors.firstName = "First name is required";
    } else if (!firstNameValidation.isValid) {
      newErrors.firstName = firstNameValidation.message;
    }

    // Last name validation
    const lastNameValidation = validateName(formData.lastName);
    if (!formData.lastName) {
      newErrors.lastName = "Last name is required";
    } else if (!lastNameValidation.isValid) {
      newErrors.lastName = lastNameValidation.message;
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    const passwordValidation = validatePassword(formData.password);
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.message;
    }

    // Role validation
    if (!formData.role) {
      newErrors.role = "Please select a role";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");
    setSuccessMessage("");

    if (!validateForm()) {
      return;
    }

    const result = await register(formData);

    if (result.success) {
      setSuccessMessage(result.message || "Registration successful! Please check your email to verify your account.");
      // Clear form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: "SEEKER" as UserRole,
      });
    } else {
      setApiError(result.message || "Registration failed");
    }
  };

  const handleInputChange =
    (field: keyof RegisterData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFormData({ ...formData, [field]: e.target.value });
      // Clear field error when user starts typing
      if (errors[field]) {
        setErrors({ ...errors, [field]: undefined });
      }
      // Clear messages when user makes changes
      if (apiError) {
        setApiError("");
      }
      if (successMessage) {
        setSuccessMessage("");
      }
    };

  // If registration was successful, show success message
  if (successMessage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card>
            <CardContent className="text-center py-8">
              <div className="text-green-600 text-6xl mb-4">✓</div>
              <CardTitle className="text-2xl mb-4 text-gray-800">Registration Successful!</CardTitle>
              <p className="text-gray-600 mb-6">{successMessage}</p>
              <Button onClick={() => onToggleMode("login")} size="lg" className="mt-4">
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center text-gray-800">Create Your Account</CardTitle>
          </CardHeader>
          <CardContent>
            {apiError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">{apiError}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  type="text"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleInputChange("firstName")}
                  error={errors.firstName}
                  leftIcon={<User className="h-4 w-4" />}
                  required
                  fullWidth
                  autoComplete="given-name"
                  disabled={isLoading}
                />

                <Input
                  label="Last Name"
                  type="text"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleInputChange("lastName")}
                  error={errors.lastName}
                  leftIcon={<User className="h-4 w-4" />}
                  required
                  fullWidth
                  autoComplete="family-name"
                  disabled={isLoading}
                />
              </div>

              <Input
                label="Email Address"
                type="email"
                placeholder="john.doe@example.com"
                value={formData.email}
                onChange={handleInputChange("email")}
                error={errors.email}
                leftIcon={<Mail className="h-4 w-4" />}
                required
                fullWidth
                autoComplete="email"
                disabled={isLoading}
              />

              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleInputChange("password")}
                error={errors.password}
                helperText="Must be at least 8 characters with uppercase, lowercase, and number"
                leftIcon={<Lock className="h-4 w-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
                required
                fullWidth
                autoComplete="new-password"
                disabled={isLoading}
              />

              <Select
                label="I am a"
                placeholder="Select your role"
                value={formData.role}
                onChange={handleInputChange("role")}
                error={errors.role}
                options={USER_ROLES.map((role) => ({
                  value: role.value,
                  label: role.label,
                }))}
                required
                fullWidth
                disabled={isLoading}
              />

              <Button type="submit" isLoading={isLoading} fullWidth size="lg" variant="success" className="mt-6">
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or</span>
                </div>
              </div>

              <div className="text-center mt-4">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => onToggleMode("login")}
                    className="text-green-600 hover:text-green-700 hover:underline font-medium"
                    disabled={isLoading}
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
