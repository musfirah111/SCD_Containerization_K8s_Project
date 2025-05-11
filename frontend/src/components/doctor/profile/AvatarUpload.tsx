import React from 'react';
import { Camera } from 'lucide-react';

interface AvatarUploadProps {
  currentAvatar: string;
  isEditing: boolean;
  onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function AvatarUpload({ currentAvatar, isEditing, onAvatarChange }: AvatarUploadProps) {
  return (
    <div className="relative inline-block">
      <img
        src={currentAvatar}
        alt="Profile"
        className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
      />
      {isEditing && (
        <label className="absolute bottom-0 right-0 bg-[#0B8FAC] p-2 rounded-full cursor-pointer shadow-lg">
          <Camera className="w-5 h-5 text-white" />
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={onAvatarChange}
          />
        </label>
      )}
    </div>
  );
}