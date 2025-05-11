import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  className = '', 
  ...props 
}) => {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        className={`w-full px-4 py-2 rounded-lg border ${
          error 
            ? 'border-[#F30000] focus:ring-[#F30000]' 
            : 'border-gray-300 focus:ring-[#7BC1B7]'
        } focus:border-transparent focus:outline-none focus:ring-2 transition-all duration-200 ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-[#F30000]">{error}</p>
      )}
    </div>
  );
};