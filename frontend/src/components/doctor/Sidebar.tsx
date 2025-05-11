import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  FileText,
  ClipboardList,
  TestTube2,
  MessageSquare,
  Clock,
  LogOut
} from 'lucide-react';
import MedinovaLogo from '../../assets/Medinova.svg';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/doctor/dashboard' },
  { icon: Calendar, label: 'Appointments', path: '/doctor/appointments' },
  { icon: Clock, label: 'Schedule', path: '/doctor/schedule' },
  { icon: FileText, label: 'Prescriptions', path: '/doctor/prescriptions' },
  { icon: ClipboardList, label: 'Medical Records', path: '/doctor/records' },
  { icon: TestTube2, label: 'Lab Reports', path: '/doctor/lab-reports' },
  { icon: MessageSquare, label: 'Chat', path: '/doctor/chat' },
];

export default function DoctorSidebar() {
  const location = useLocation();

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
        <button className="flex items-center space-x-2 text-gray-600 hover:text-[#0B8FAC]">
          <LogOut className="w-5 h-5" />
          <Link to="/login">Logout</Link>
        </button>
      </div>
    </div>
  );
}