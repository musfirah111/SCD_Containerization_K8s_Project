import React from 'react';

interface ProfileFieldProps {
  label: string;
  value: string | number;
  isEditing: boolean;
  type?: string;
  name: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ProfileField({
  label,
  value,
  isEditing,
  type = 'text',
  name,
  onChange,
}: ProfileFieldProps) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      {isEditing ? (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0B8FAC] focus:border-transparent"
        />
      ) : (
        <p className="text-gray-900 py-2">{value}</p>
      )}
    </div>
  );
}