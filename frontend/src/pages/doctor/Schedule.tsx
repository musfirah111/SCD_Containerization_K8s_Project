import { useState, useEffect } from 'react';
import axios from 'axios';
import { DaySelector } from '../../components/doctor/schedule/DaySelector';
import { Layout } from '../../components/doctor/Layout';

interface Appointment {
  id: string;
  time: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  status: string;
  reason?: string;
  notes?: string;
  duration?: number;
}

export default function Schedule() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const formattedDate = selectedDate.toLocaleDateString('en-CA');
    fetchAppointments(formattedDate);
  }, [selectedDate]);

  const fetchAppointments = async (date: string) => {
    try {
      const userId = localStorage.getItem('userId');
      //alert(userId);
      const token = localStorage.getItem('authToken');
      const response = await axios.get(
        `http://localhost:5000/api/doctors/${userId}/schedule/${date}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      //alert(response.data.data.appointments);
      setAppointments(response.data.data.appointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    const formattedDate = date.toLocaleDateString('en-CA');
    fetchAppointments(formattedDate);
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 pt-2 pb-4">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Schedule</h1>
          <p className="text-gray-600">Manage your daily appointments</p>
        </div>

        <DaySelector
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
          className="mb-6"
        />

        <div className="space-y-6">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="bg-white rounded-lg shadow-sm">
              <div className="p-3">
                <div className="flex items-center gap-2 text-gray-700 mb-1.5">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">{appointment.time}</span>
                </div>

                <div className="bg-blue-50 p-1.5 rounded-md">
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="font-medium">{appointment.patientName}</span>
                  </div>

                  <div className="text-gray-600">
                    <span>{appointment.reason || 'Check-up'}</span>
                    <span className="mx-2">•</span>
                    <span>{appointment.duration || 30} min</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {appointments.length === 0 && (
            <div className="p-4 text-gray-500 italic">
              No appointments
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

