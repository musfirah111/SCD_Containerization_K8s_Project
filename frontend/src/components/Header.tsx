import { useNavigate, Link } from 'react-router-dom';
import { Avatar } from './Avatar';
import { Bell } from 'lucide-react';

export function Header() {
  const navigate = useNavigate();
  const user = {
    name: 'John Doe',
    image: '/path/to/profile-image.jpg', // Replace with actual image path
  };

  return (
    <header className="bg-[#D2EBE7] shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-end items-center h-16">
          {/* Right side navigation */}
          <div className="flex items-center space-x-4">
            <Link to="/notifications">
              <Bell className="w-6 h-6" />
            </Link>
            <div 
              className="cursor-pointer"
              onClick={() => navigate('/profile')}
            >
              <Avatar name={user.name} image={user.image} size="sm" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
} 