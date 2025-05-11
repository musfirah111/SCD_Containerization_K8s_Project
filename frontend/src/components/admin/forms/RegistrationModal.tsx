import React from 'react';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function RegistrationModal({ isOpen, onClose, children }: RegistrationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl">
          {children}
        </div>
      </div>
    </div>
  );
}