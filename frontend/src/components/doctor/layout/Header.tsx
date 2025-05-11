import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

interface User {
  name: string;
  role: string;
  avatar?: string;
}

interface HeaderProps {
  user: User;
}

export function DoctorHeader({ user: initialUser }: HeaderProps) {
  const navigate = useNavigate();
  const [user, setUser] = useState(initialUser);

  const fetchUserData = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('authToken');

      if (!userId || !token) return;

      const response = await axios.get(`http://localhost:5000/api/users/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setUser(response.data);
    } catch (error) {
      console.error('Failed to refresh header:', error);
    }
  };

  useEffect(() => {
    // Listen for profile updates
    window.addEventListener('userProfileUpdated', fetchUserData);

    return () => {
      window.removeEventListener('userProfileUpdated', fetchUserData);
    };
  }, []);

  const handleProfileClick = () => {
    navigate('/doctor/profile');
  };

  return (
    <header className="bg-[#D2EBE7] px-6 py-4">
      <div className="flex justify-end items-center">
        <button
          onClick={handleProfileClick}
          className="flex items-center gap-2 hover:bg-[#C1E0DC] p-2 rounded-lg transition-colors"
          aria-label={`View profile for ${user.name}`}
        >
          <img
            src={user.avatar}
            alt={user.name}
            className="h-8 w-8 rounded-full object-cover"
          />
          <div className="flex flex-col">
            <span className="text-sm font-medium">{user.name}</span>
            <span className="text-xs text-gray-500">{user.role}</span>
          </div>
        </button>
      </div>
    </header>
  );
}