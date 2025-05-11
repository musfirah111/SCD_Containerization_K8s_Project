import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { validatePassword } from '../utils/passwordValidation';
import axios from 'axios';

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitted, setSubmitted] = useState(false);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
      newErrors.newPassword = passwordErrors[0];
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const token = localStorage.getItem('authToken');
      const userId = localStorage.getItem('userId');

      if (!token || !userId) {
        throw new Error('Authentication required');
      }

      await axios.put(
        `http://localhost:5000/api/users/profile/password`,
        {
          currentPassword: currentPassword,
          password: newPassword
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setSubmitted(true);
    } catch (error: any) {
      if (error.response?.data?.message?.toLowerCase().includes('current password')) {
        setErrors({
          ...errors,
          currentPassword: 'Current password is incorrect'
        });
      } else {
        setErrors({
          submit: error.response?.data?.message || 'Failed to update password'
        });
      }
    }
  };

  const PasswordToggleButton: React.FC<{
    show: boolean;
    onClick: () => void;
    className?: string;
  }> = ({ show, onClick, className = '' }) => (
    <button
      type="button"
      onClick={onClick}
      className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 ${className}`}
    >
      {show ? <Eye size={20} /> : <EyeOff size={20} />}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#D2EBE7] to-[#7BC1B7] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <button
          onClick={() => navigate('/login')}
          className="inline-flex items-center text-[#0B8FAC] hover:text-[#7BC1B7] mb-6 transition-colors"
        >
          <ArrowLeft className="mr-2" size={20} />
          Back to Login
        </button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#0B8FAC] mb-2">Reset Password</h1>
          <p className="text-gray-600">
            {!submitted
              ? "Please enter your current password and create a new password"
              : "Your password has been successfully reset"}
          </p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <Input
                label="Current Password"
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
                required
                error={errors.currentPassword}
              />
              <PasswordToggleButton
                show={showCurrentPassword}
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              />
            </div>

            <div className="relative">
              <Input
                label="New Password"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter your new password"
                required
                error={errors.newPassword}
              />
              <PasswordToggleButton
                show={showNewPassword}
                onClick={() => setShowNewPassword(!showNewPassword)}
              />
            </div>

            <div className="relative">
              <Input
                label="Confirm New Password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                required
                error={errors.confirmPassword}
              />
              <PasswordToggleButton
                show={showConfirmPassword}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              />
            </div>

            <Button type="submit" className="w-full">
              Reset Password
            </Button>
          </form>
        ) : (
          <div className="text-center">
            <div className="mb-6 text-[#129820] bg-[#D2EBE7] p-4 rounded-lg">
              Your password has been successfully reset
            </div>
            <Button
              variant="secondary"
              onClick={() => navigate('/login')}
              className="w-full"
            >
              Return to Login
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};