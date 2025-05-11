import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import { Layout } from '../components/Layout';
import axios from 'axios';
import { Doctor } from '../types/index';
import DoctorCard from '../components/DoctorCard';

const defaultDoctorImage = 'https://www.freepik.com/free-photo/creative-arrangement-lgbt-family-concept_7405072.htm';

interface PatientResponse {
  id: string;
}

export default function DoctorList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [patientId, setPatientId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        const userId = localStorage.getItem('userId');

        if (!token || !userId) {
          setError('Please login to continue');
          navigate('/login');
          return;
        }

        // Fetch patient ID
        const patientResponse = await axios.get<PatientResponse>(
          `http://localhost:5000/api/patients/user/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        console.log('Patient response:', patientResponse.data);
        setPatientId(patientResponse.data.id);
        localStorage.setItem('patientId', patientResponse.data.id); // Store for later use

        // Fetch doctors
        const response = await axios.get<{ doctors: Doctor[] }>('http://localhost:5000/api/doctors', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const doctorsData = response.data.doctors;
        
        const transformedDoctors = doctorsData.map((doctor: any) => {
          return {
            id: doctor._id,
            name: doctor.user_id.name,
            department: doctor.department_id?.name || 'General',
            specialization: doctor.specialization || 'General',
            experience: doctor.experience || '0',
            rating: doctor.rating || 4.5,
            image: doctor.user_id.profile_image || defaultDoctorImage,
            description: doctor.description || '',
            price: doctor.consultation_fee || 0,
            workingHours: doctor.working_hours || '9 AM - 5 PM'
          };
        });

        setDoctors(transformedDoctors);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [navigate]);

  const filteredDoctors = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.specialization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDoctorClick = (doctorId: string) => {
    if (!patientId) {
      alert('Please login to book an appointment');
      navigate('/login');
      return;
    }
    navigate(`/doctors/${doctorId}`);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">Loading...</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto p-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900">{error}</h2>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-[#D2EBE7] pb-6">
        <div className="max-w-6xl mx-auto p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Doctor</h1>
          <p className="text-gray-600 mb-6">Book appointments with the best doctors</p>

          <div className="mb-8">
            <SearchBar 
              value={searchQuery} 
              onChange={setSearchQuery}
              placeholder="Search by doctor name or specialization..."
            />
          </div>

          <div className="grid grid-cols-1 gap-6">
            {filteredDoctors.map(doctor => (
              <DoctorCard
                key={doctor.id}
                doctor={doctor as Doctor}
                onClick={() => handleDoctorClick(doctor.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}

