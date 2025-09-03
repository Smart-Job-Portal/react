import React, { useState } from 'react';
import { Mail, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '../../components/ui';
import { validateEmail } from '../../utils';

interface ForgotPasswordFormProps {
  onToggleMode: (mode: 'login' | 'register' | 'forgot-password') => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onToggleMode }) => {
  const { forgotPassword, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const validateForm = (): boolean => {
    if (!email) {
      setError('Email is required');
      return false;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    const result = await forgotPassword({ email });

    if (result.success) {
      setSuccessMessage(result.message || 'Password reset email sent successfully!');
      setEmail('');
    } else {
      setError(result.message || 'Failed to send reset email');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
    // Clear success message when user makes changes
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  // If email was sent successfully, show success message
  if (successMessage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card>
            <CardContent className="text-center py-8">
              <div className="text-green-600 text-6xl mb-4">📧</div>
              <CardTitle className="text-2xl mb-4 text-gray-800">
                Email Sent!
              </CardTitle>
              <p className="text-gray-600 mb-6">
                {successMessage}
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Please check your email inbox and follow the instructions to reset your password.
              </p>
              <Button
                onClick={() => onToggleMode('login')}
                size="lg"
                leftIcon={<ArrowLeft className="h-4 w-4" />}
              >
                Back to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center text-gray-800">
              Reset Your Password
            </CardTitle>
            <p className="text-center text-gray-600 text-sm">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={handleInputChange}
                error={error}
                leftIcon={<Mail className="h-4 w-4" />}
                required
                fullWidth
                autoComplete="email"
                disabled={isLoading}
                autoFocus
              />

              <Button
                type="submit"
                isLoading={isLoading}
                fullWidth
                size="lg"
                className="mt-6"
                variant="primary"
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
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

              <div className="mt-4 flex flex-col space-y-2">
                <button
                  type="button"
                  onClick={() => onToggleMode('login')}
                  className="flex items-center justify-center text-sm text-blue-600 hover:text-blue-700 hover:underline"
                  disabled={isLoading}
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to Sign In
                </button>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => onToggleMode('register')}
                      className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
                      disabled={isLoading}
                    >
                      Sign up
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
