import React from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  onChange: (value: string) => void;
  placeholder: string;
  value?: string;
}

export default function SearchBar({ value, onChange, placeholder = "Search..." }: SearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B8FAC] focus:border-transparent outline-none"
      />
    </div>
  );
}