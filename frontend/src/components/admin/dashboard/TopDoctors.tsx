import { useEffect, useState } from 'react';
import axios from 'axios';

interface Doctor {
  _id: string;
  name: string;
  specialty: string;
  rating: number;
  patients: number;
  availability: boolean;
  image: string;
}

interface TopDoctorsProps {
  className?: string;
}

export function TopDoctors({ className }: TopDoctorsProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [doctorStats, setDoctorStats] = useState<{ [key: string]: { rating: number, totalPatients: number } }>({});

  useEffect(() => {
    const fetchTopDoctors = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get('http://localhost:5000/api/doctors', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log("API Response:", response.data);

        // Check if response.data is an array
        const doctorsArray = Array.isArray(response.data) ? response.data : response.data.doctors;

        // Transform the API response to match our component's data structure
        const transformedDoctors = doctorsArray.map((doctor: any) => ({
          _id: doctor._id || doctor.user_id?._id,
          name: doctor.user_id?.name || 'Unknown Doctor',
          specialty: doctor.specialization || 'General',
          rating: doctor.rating || 0,
          patients: doctor.patients_count,
          availability: doctor.availability_status || false,
          image: doctor.user_id?.profile_picture || 'https://example.com/default-doctor.jpg'
        }));

        // Sort by rating and take top 6
        const topDoctors = transformedDoctors
          .sort((a: Doctor, b: Doctor) => b.rating - a.rating)
          .slice(0, 6);

        setDoctors(topDoctors);
      } catch (error) {
        console.error('Error fetching top doctors:', error);
        setDoctors([]);
      }
    };

    fetchTopDoctors();
  }, []);

  useEffect(() => {
    const fetchDoctorStats = async (doctorId: string) => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(
          `http://localhost:5000/api/statistics/doctor/${doctorId}/stats`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        return response.data.stats;
      } catch (error) {
        console.error('Error fetching doctor stats:', error);
        return { rating: 0, totalPatients: 0 };
      }
    };

    const fetchAllDoctorStats = async () => {
      const stats: { [key: string]: { rating: number, totalPatients: number } } = {};
      for (const doctor of doctors) {
        stats[doctor._id] = await fetchDoctorStats(doctor._id);
      }
      setDoctorStats(stats);
    };

    if (doctors.length > 0) {
      fetchAllDoctorStats();
    }
  }, [doctors]);

  return (
    <div className={`bg-white rounded-lg p-6 ${className}`}>
      <h2 className="text-xl font-semibold mb-6 text-[#0B8FAC]">Top Rated Doctors</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {doctors.map((doctor) => (
          <div
            key={doctor.name}
            className="relative group overflow-hidden rounded-xl bg-gradient-to-b from-[#7BC1B7] to-[#0B8FAC] p-[2px]"
          >
            <div className="bg-white rounded-[10px] p-4 h-full">
              <div className="relative mb-4">
                <img
                  src={doctor.image}
                  alt={doctor.name}
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">{doctor.name}</h3>
                <p className="text-sm text-gray-600">{doctor.specialty}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="text-[#F89603]">★</span>
                    <span className="font-medium">{doctorStats[doctor._id]?.rating || 0}</span>
                  </div>
                  <span className="text-sm text-gray-600">{doctorStats[doctor._id]?.totalPatients || 0} patients</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 