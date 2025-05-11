import { formatDate } from '../utils/date';
import { Layout } from '../components/Layout';
import { useEffect, useState } from 'react';
import axios from 'axios';

interface Notification {
  _id: string;
  title: string;
  message: string;
  sent_date: string; // Adjust type based on your actual data structure
  read: boolean; // Add the read property
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('authToken');
        const response = await axios.get(`http://localhost:5000/api/appointments/notifications/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log(response);
        setNotifications(response.data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <Layout>
      <div className="min-h-screen bg-[#D2EBE7] pb-6">
        <div className="max-w-6xl mx-auto p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Notifications</h1>

          <div className="space-y-4">
            {notifications.length === 0 ? (
              <p>No notifications available.</p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`bg-white rounded-xl shadow-lg p-6 ${!notification.read ? 'border-l-4 border-[#0B8FAC]' : ''}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{notification.title}</h3>
                      <p className="text-gray-600 mt-1">{notification.message}</p>
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatDate(notification.sent_date)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
} 