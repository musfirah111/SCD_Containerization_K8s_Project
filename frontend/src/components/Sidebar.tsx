import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Calendar,
  LogOut,
  ClipboardList,
  TestTube2,
  FileText,
  Pill,
  LayoutDashboard,
  MessageSquare
} from 'lucide-react';
import MedinovaLogo from '../assets/Medinova.svg';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Calendar, label: 'Book Appointment', path: '/' },
  { icon: ClipboardList, label: 'My Appointments', path: '/appointments' },
  { icon: TestTube2, label: 'Medical Lab Reports', path: '/lab-reports' },
  { icon: FileText, label: 'Medical Records', path: '/medical-records' },
  { icon: Pill, label: 'Current Prescriptions', path: '/prescriptions' },
  { icon: MessageSquare, label: 'Chat', path: '/chat' },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="w-64 bg-white h-screen fixed left-0 top-0 border-r border-gray-200">
      <div className="p-4">
        <Link to="/" className="flex items-center gap-3">
          <img
            src={MedinovaLogo}
            alt="Oasis Logo"
            className="w-10 h-10"
          />
          <span className="text-xl font-bold text-[#0B8FAC]">Oasis</span>
        </Link>
      </div>

      <nav className="mt-8">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-2 px-6 py-3 text-gray-600 hover:bg-[#D2EBE7] hover:text-[#0B8FAC] ${isActive ? 'bg-[#7BC1B7] text-white' : ''
                }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-8 w-full px-6">
        <button
          className="flex items-center space-x-2 text-gray-600 hover:text-[#0B8FAC]"
          onClick={() => navigate('/login')}
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}