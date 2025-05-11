import { Bell } from 'lucide-react';
import { useState } from 'react';

interface NotificationProps {
  count?: number;
}

export function Notification({ count = 0 }: NotificationProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        <Bell className="w-6 h-6 text-gray-600" />
        {count > 0 && (
          <span className="absolute top-0 right-0 h-5 w-5 bg-[#0B8FAC] text-white text-xs rounded-full flex items-center justify-center">
            {count}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg z-50">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Notifications</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {/* Add notification items here */}
            <div className="p-4 text-center text-gray-500">
              No new notifications
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 