import React, { useState, useContext } from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { AuthContext } from '../context/AuthContext';

export const Login: React.FC = () => {
  const { setUser } = useContext(AuthContext) as { setUser: (user: any) => void };
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await response.json();

      console.log('------------------------------> user role: ', data.role);

      // Save token, role, id, and email in localStorage
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userRole', data.role);
      localStorage.setItem('userId', data.id);
      localStorage.setItem('userEmail', data.email);

      // Set user in context with a more structured object
      setUser({ token: data.token, role: data.role, ...data });
      console.log('=================Logged in user:', data);

      // Redirect based on the user's role
      if (data.role === 'Patient') {
        navigate('/dashboard');
      }
      else if (data.role === 'Doctor') {
        navigate('/doctor/dashboard');
      }
      else if (data.role === 'Admin') {
        navigate('/admin/dashboard');
      }
      else {
        throw new Error('Role not recognized');
      }
    }
    catch (error: any) {
      console.error('Login failed:', error.message);
      setError('Login failed. Please check your email and password.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#D2EBE7] to-[#7BC1B7] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#0B8FAC] mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to continue to OSIS</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input type="checkbox" className="rounded border-gray-300 text-[#7BC1B7] focus:ring-[#7BC1B7]" />
              <span className="ml-2 text-sm text-gray-600">Remember me</span>
            </label>
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="text-sm text-[#0B8FAC] hover:text-[#7BC1B7] transition-colors"
            >
              Forgot Password?
            </button>
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          <Button type="submit" className="w-full">
            Sign In
            <ArrowRight className="ml-2 inline-block" size={20} />
          </Button>
        </form>
      </div>
    </div>
  );
};

