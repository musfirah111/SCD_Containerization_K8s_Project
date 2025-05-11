import WelcomeCard from '../components/WelcomeCard';
import HospitalInfoCards from '../components/HospitalInfoCard';
import DoctorCard from '../components/DoctorCardDashboard';
import AppointmentCard from '../components/AppointmentCard';
import { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { Layout } from '../components/Layout';
import { AuthContext } from '../context/AuthContext';

interface DoctorResponse {
  [key: string]: {
    department_name: string;
    top_rated: Array<{
      doctor_name: string;
      department: string;
      averageRating: number;
    }>;
  };
}

interface AppointmentResponse {
  totalCount: number;
  totalPages: number;
  currentPage: number;
  appointments: Array<{
    doctor_id: {
      user_id: {
        name: string;
      };
      department_id: {
        name: string;
      };
    };
    appointment_date: string;
    appointment_time: string;
    status: string;
  }>;
}

interface Doctor {
  name: string;
  specialty: string;
  rating: number;
  image: string;
}

interface Appointment {
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
}

interface PatientResponse {
  id: string;
}

function Dashboard() {
  const { user } = useContext(AuthContext);
  const [topDoctors, setTopDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    console.log('Dashboard mounted, userId:', userId); // Debug log

    const fetchDashboardData = async () => {
      try {
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('authToken');

        const patientResponse = await axios.get<PatientResponse>(
          `http://localhost:5000/api/patients/user/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log('Patient response:', patientResponse.data);
        const patientId = patientResponse.data.id;

        const appointmentsResponse = await axios.get<AppointmentResponse>(
          `http://localhost:5000/api/appointments/patient/${patientId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log('Appointments response:', appointmentsResponse.data);

        // Check if appointments exist and are in an array
        const appointments = Array.isArray(appointmentsResponse.data.appointments) 
          ? appointmentsResponse.data.appointments
              .map(apt => {
                // Handle cases where doctor_id is null
                return {
                  doctorName: apt?.doctor_id?.user_id?.name || 'Doctor Not Assigned',
                  specialty: apt?.doctor_id?.department_id?.name || 'Department Pending',
                  date: new Date(apt.appointment_date).toLocaleDateString(),
                  time: apt.appointment_time,
                  status: apt.status || 'Pending'
                };
              })
          : [];

        setAppointments(appointments);

        // Fetch top rated doctors across all departments
        const doctorsResponse = await axios.get<DoctorResponse>('http://localhost:5000/api/statistics/ratings/departments/top-doctors', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        // Transform doctors data to match the component's format
        const formattedDoctors = Object.values(doctorsResponse.data)
          .flatMap(dept => dept.top_rated)
          .map(doctor => ({
            name: doctor.doctor_name,
            specialty: doctor.department,
            rating: doctor.averageRating,
            // You might want to add a default image or fetch from user profile
            image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300"
          }))
          .slice(0, 3); // Keep only top 3 doctors

        setTopDoctors(formattedDoctors);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // You might want to add error handling UI here
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return <div className="min-h-screen bg-[#D2EBE7] flex items-center justify-center">
      <div>Loading...</div>
    </div>;
  }

  return (
    <Layout>
      <div className="min-h-screen bg-[#D2EBE7]">
        <div className="container mx-auto px-16 py-8">
          <WelcomeCard />

          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">About Oasis Hospital</h2>
            <div className="overflow-x-auto pb-4">
              <HospitalInfoCards />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mt-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">Top Rated Doctors</h2>
              <div className="space-y-4">
                {topDoctors.map((doctor, index) => (
                  <DoctorCard
                    key={index}
                    name={doctor.name}
                    specialty={doctor.specialty}
                    rating={doctor.rating}
                    image={doctor.image}
                  />
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Your Appointments</h2>
              {appointments.map((appointment, index) => (
                <AppointmentCard key={index} {...appointment} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;
