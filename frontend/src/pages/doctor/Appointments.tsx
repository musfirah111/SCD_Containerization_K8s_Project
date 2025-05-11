import { useState, useEffect } from 'react';
import AppointmentList from '../../components/doctor/AppointmentList';
import { Layout } from '../../components/doctor/Layout';
import axios from 'axios';
import SearchBar from '../../components/SearchBar';

interface DoctorResponse {
  _id: string;
}

// interface AppointmentsResponse {
//   appointments: any[];  // Replace 'any' with your appointment type if available
// }

export default function Appointments() {
  const [filteredAppointments, setFilteredAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchValue, setSearchValue] = useState('');

    const fetchAppointments = async () => {
      try {
        setLoading(true);
        console.log('Fetching appointments...'); // Debug log
        const token = localStorage.getItem('authToken');
        const userId = localStorage.getItem('userId');
        console.log('User ID:', userId); // Debug log

        const doctorIdResponse = await axios.get(`http://localhost:5000/api/doctors/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log('Doctor ID response:', doctorIdResponse.data); // Debug log
        const doctorId = (doctorIdResponse.data as DoctorResponse)._id;
        console.log('Doctor ID:', doctorId); // Debug log

        const appointmentsResponse = await axios.get(`http://localhost:5000/api/appointments/doctor/${doctorId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log('Appointments response:', appointmentsResponse.data); // Debug log
        
        setFilteredAppointments((appointmentsResponse.data as { appointments: any[] }).appointments);
      } catch (error) {
        console.error('Error fetching appointments:', error); // Debug log
        setError('Error fetching appointments');
      } finally {
        setLoading(false);
        console.log('Appointments fetching completed.'); // Debug log
      }
    };

    useEffect(() => {
      fetchAppointments();
    }, []);
    
  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.put(
        `http://localhost:5000/api/appointments/${id}/status`,
        { status: status.charAt(0).toUpperCase() + status.slice(1) },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      fetchAppointments();
    } catch (error) {
      setError('Error updating appointment status');
      console.error('Error:', error);
    }
  };

  const handleSearch = (value: string) => {
    if (!value.trim()) {
      // If search is cleared, fetch all appointments again
      fetchAppointments();
    } else {
      const filtered = filteredAppointments.filter(appointment => 
        appointment.patient_id?.user_id?.name?.toLowerCase()
        .includes(value.toLowerCase())
      );
      setFilteredAppointments(filtered);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Appointments</h1>
        </div>
        <SearchBar
          value={searchValue}
          onChange={(value) => {
            setSearchValue(value);
            handleSearch(value);
          }}
          placeholder="Search by patient name..."
        />
        <AppointmentList
          appointments={filteredAppointments}
          onStatusUpdate={handleStatusUpdate}
          loading={loading}
        />
      </div>
    </Layout>
  );
}