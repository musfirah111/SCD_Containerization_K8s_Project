import DashboardStats from '../../components/doctor/DashboardStats';
import AppointmentList from '../../components/doctor/AppointmentList';
import { Layout } from '../../components/doctor/Layout';
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

interface MedicalRecord {
  _id: string;
  patient_id: { user_id: { name: string } };
  date: string;
}

interface Prescription {
  _id: string;
  patient_id: { user_id: { name: string } };
  date: string;
}

interface LabReport {
  _id: string;
  patient_id: { 
    user_id: { 
      name: string 
    } 
  };
  doctor_id: string;
  test_name: string;
  result: string;
  test_date: string;
  comments?: string;
  status: string;
}

interface Activity {
  id: string;
  type: string;
  patient: string;
  date: Date;
  status?: string;
}

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [labReports, setLabReports] = useState<LabReport[]>([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      const token = localStorage.getItem('authToken');
      const userId = localStorage.getItem('userId');
      
      const doctorIdResponse = await axios.get<DoctorResponse>(
        `http://localhost:5000/api/doctors/user/${userId}`,
        { headers: { Authorization: `Bearer ${token}` }}
      );
      console.log('Doctor ID response:', doctorIdResponse.data); // Print doctor ID response
      const doctorId = doctorIdResponse.data._id;
      
      await Promise.all([
        fetchAppointments(),
        fetchAllActivities(doctorId, token!)
      ]);
    };
    
    fetchInitialData();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const userId = localStorage.getItem('userId');

      console.log('Fetching doctor ID...');
      const doctorIdResponse = await axios.get<DoctorResponse>(`http://localhost:5000/api/doctors/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Doctor ID response:', doctorIdResponse.data); // Print doctor ID response
      const doctorId = doctorIdResponse.data._id;

      console.log('Fetching appointments...');
      const appointmentsResponse = await axios.get<{ appointments: Appointment[] }>(`http://localhost:5000/api/appointments/doctor/${doctorId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Fetched appointments:', appointmentsResponse.data.appointments); // Print fetched appointments data
      setAppointments(appointmentsResponse.data.appointments || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAppointmentStatusUpdate = async (id: string, status: string) => {
    try {
      console.log(`Updating appointment status for ID: ${id} to ${status}...`);
      await axios.patch(`/appointments/${id}/status`, { status });
      // Refresh appointments after update
      await fetchAppointments();
    } catch (error) {
      console.error('Error updating appointment status:', error);
      // Consider adding error handling/toast notification here
    }
  };

  const getTodaysAppointments = () => {
    const today = new Date().toDateString();
    return appointments
      .filter(apt => new Date(apt.appointment_date).toDateString() === today)
      .sort((a, b) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime())
      .slice(0, 5); // Get last 5 appointments
  };

  const fetchAllActivities = async (doctorId: string, token: string) => {
    try {
     
      const userId = localStorage.getItem('userId');
      const [recordsRes, prescriptionsRes, labReportsRes] = await Promise.allSettled([
        axios.get<MedicalRecord[]>(`http://localhost:5000/api/medical-records/doctor/${doctorId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get<Prescription[]>(`http://localhost:5000/api/prescriptions/doctor/${doctorId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get<LabReport[]>(`http://localhost:5000/api/lab-reports/doctor/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      // Set data based on successful responses
      if (recordsRes.status === 'fulfilled') {
        console.log('Fetched records:', recordsRes.value.data); // Print fetched records data
        setRecords(recordsRes.value.data || []);
      }
      if (prescriptionsRes.status === 'fulfilled') {
        console.log('Fetched prescriptions:', prescriptionsRes.value.data); // Print fetched prescriptions data
        setPrescriptions(prescriptionsRes.value.data || []);
      }
      if (labReportsRes.status === 'fulfilled') {
        console.log('Fetched lab reports:', labReportsRes.value.data); // Print fetched lab reports data
        setLabReports(labReportsRes.value.data || []);
      }

    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const getAllActivities = (): Activity[] => {
    const today = new Date().toDateString();
    
    const activities = [
      ...appointments.map(apt => ({
        id: apt._id,
        type: 'appointment',
        patient: apt.patient_id.user_id.name,
        date: new Date(apt.appointment_date),
        status: apt.status
      })),
      ...records.map(rec => ({
        id: rec._id,
        type: 'record',
        patient: rec.patient_id.user_id.name,
        date: new Date(rec.date)
      })),
      ...prescriptions.map(pres => ({
        id: pres._id,
        type: 'prescription',
        patient: pres.patient_id.user_id.name,
        date: new Date(pres.date)
      })),
      ...labReports.map(report => ({
        id: report._id,
        type: 'lab',
        patient: report.patient_id.user_id.name,
        date: new Date(report.test_date),
        status: report.status
      }))
    ]
    .filter(activity => activity.date.toDateString() === today)
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 5);

    return activities;
  };

  const getActivityIcon = (type: string, status?: string) => {
    switch(type) {
      case 'appointment':
        return status === 'Completed' ? 'bg-green-500' : 'bg-blue-500';
      case 'record':
        return 'bg-purple-500';
      case 'prescription':
        return 'bg-yellow-500';
      case 'lab':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getActivityMessage = (activity: any) => {
    switch(activity.type) {
      case 'appointment':
        return `${activity.status} appointment with ${activity.patient}`;
      case 'record':
        return `Medical record created for ${activity.patient}`;
      case 'prescription':
        return `Prescription issued for ${activity.patient}`;
      case 'lab':
        return `Lab report ${activity.status.toLowerCase()} for ${activity.patient}`;
      default:
        return '';
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <div className="text-sm text-gray-500">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>

        <DashboardStats />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className=" bg-white rounded-lg p-6">
          <AppointmentList
            appointments={appointments}
            onStatusUpdate={handleAppointmentStatusUpdate}
            loading={loading}
          />
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {getAllActivities().map(activity => (
                <div key={activity.id} className="flex items-center space-x-4">
                  <div className={`w-2 h-2 ${getActivityIcon(activity.type, activity.status)} rounded-full`}></div>
                  <div>
                    <p className="text-sm text-gray-600">
                      {getActivityMessage(activity)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {activity.date.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}