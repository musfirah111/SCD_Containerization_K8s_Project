import { Users, Calendar, Clock, CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from 'axios';

interface DoctorResponse {
  _id: string;
}

interface Appointment {
  _id: string;
  patient_id: {
    _id: string;
    user_id: {
      _id: string;
      name: string;
      email: string;
      profile_picture: string;
    };
    address: string;
    emergency_contact: {
      name: string;
      phone: string;
      relationship: string;
      _id: string;
    };
  };
  doctor_id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  reminder_sent: boolean;
}

export default function DashboardStats() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const userId = localStorage.getItem('userId');

      const doctorIdResponse = await axios.get<DoctorResponse>(`http://localhost:5000/api/doctors/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const doctorId = doctorIdResponse.data._id;

      const appointmentsResponse = await axios.get<{ appointments: Appointment[] }>(`http://localhost:5000/api/appointments/doctor/${doctorId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setAppointments(appointmentsResponse.data.appointments || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalPatients = appointments.length;
  const appointmentsToday = appointments.filter(appointment => new Date(appointment.appointment_date).toDateString() === new Date().toDateString()).length;
  const pendingAppointments = appointments.filter(appointment => appointment.status === 'Scheduled').length;
  const completedToday = appointments.filter(appointment => appointment.status === 'Completed' && new Date(appointment.appointment_date).toDateString() === new Date().toDateString()).length;

  const stats = [
    {
      label: 'Total Patients',
      value: totalPatients.toString(),
      icon: Users,
      trend: '+12.5%',
      trendUp: true
    },
    {
      label: 'Appointments Today',
      value: appointmentsToday.toString(),
      icon: Calendar,
      trend: '+5.2%',
      trendUp: true
    },
    {
      label: 'Pending Appointments',
      value: pendingAppointments.toString(),
      icon: Clock,
      trend: '-2.4%',
      trendUp: false
    },
    {
      label: 'Completed Today',
      value: completedToday.toString(),
      icon: CheckCircle,
      trend: '+8.1%',
      trendUp: true
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <stat.icon className="w-6 h-6 text-blue-500" />
            </div>
            <span className={`text-sm font-medium ${stat.trendUp ? 'text-green-500' : 'text-red-500'}`}>
              {stat.trend}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
          <p className="text-sm text-gray-500">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}