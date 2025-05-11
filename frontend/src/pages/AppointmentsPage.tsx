import  { useState, useEffect, useContext } from 'react';
import { Calendar, Clock, Star } from 'lucide-react';
import { formatDate } from '../utils/date';
import type { Doctor } from '../types/medical';
import SearchBar from '../components/SearchBar';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { ConfirmationModal } from '../components/shared/ConfirmationModal';

interface PatientResponse {
  id: string;
}

interface Appointment {
  id: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  doctor_id: {
    id: string;
    name: string;
    specialization: string;
    image: string;
  };
}

type AppointmentStatus = 'All' | 'Scheduled' | 'Completed' | 'Requested' | 'Cancelled' | 'Rescheduled';

// Define the expected response structure
interface RescheduleResponse {
  doctor_id: string;
}

interface AppointmentsResponse {
  appointments: Array<{
    _id: string;
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

export default function AppointmentsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStatus, setActiveStatus] = useState<AppointmentStatus>('All');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  // const [showRescheduleModal, setShowRescheduleModal] =useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] =useState<string>('');
  
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchAppointments();
  }, [user]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const userId = localStorage.getItem('userId');

      const patientResponse = await axios.get<{ id: string }>(
        `http://localhost:5000/api/patients/user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (patientResponse.data && patientResponse.data.id) {
        const appointmentsResponse = await axios.get<AppointmentsResponse>(
          `http://localhost:5000/api/appointments/patient/${patientResponse.data.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        console.log('Raw appointments response:', appointmentsResponse.data); // Debug log

        if (appointmentsResponse.data && appointmentsResponse.data.appointments) {
          const formattedAppointments = appointmentsResponse.data.appointments.map((apt) => {
            const doctorData = apt.doctor_id && typeof apt.doctor_id === 'object' && '_id' in apt.doctor_id
              ? apt.doctor_id
              : {
                  _id: String(apt.doctor_id),
                  user_id: { name: 'Dr. Wanitha Silva' },
                  department_id: { name: 'Child Specialist' }
                };

            return {
              id: apt._id,
              doctorName: doctorData.user_id.name,
              specialty: doctorData.department_id?.name || 'Specialist',
              date: apt.appointment_date,
              time: apt.appointment_time,
              status: apt.status as AppointmentStatus,
              doctor_id: {
                id: String(doctorData._id),
                name: doctorData.user_id.name,
                specialization: doctorData.department_id?.name || 'Specialist',
                image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300"
              }
            };
          });

          console.log('Formatted appointments:', formattedAppointments); // Debug log
          setAppointments(formattedAppointments);
          setError(null);
        }
      }
    } catch (err: any) {
      console.error('Error fetching appointments:', err);
      setError(err.response?.data?.message || 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleAddReview = (doctorData: { id: string; name: string; specialization: string; image: string }) => {
    setSelectedDoctor(doctorData as Doctor);
    setIsModalOpen(true);
  };

  const handleSubmitReview = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const userId = localStorage.getItem('userId');

      // First get the patient ID for the logged-in user
      const patientResponse = await axios.get<PatientResponse>(
        `http://localhost:5000/api/patients/user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!patientResponse.data || !patientResponse.data.id) {
        throw new Error('Patient ID not found');
      }

      // Call the addReview endpoint with only the required fields
      await axios.post(
        'http://localhost:5000/api/reviews',
        {
          doctor_id: selectedDoctor?.id,
          patient_id: patientResponse.data.id,
          rating: rating,
          review: reviewText || '' // Make review optional
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Close modal and reset form
      setIsModalOpen(false);
      setRating(0);
      setReviewText('');
      
      // Show success message
      alert('Review submitted successfully!');

    } catch (err: any) {
      console.error('Error submitting review:', err);
      alert(err.response?.data?.message || 'Failed to submit review');
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.post(
        `http://localhost:5000/api/appointments/cancel`,
        { appointment_id: appointmentId },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Refresh the appointments list after cancellation
      await fetchAppointments();
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      // Optionally add error handling/user notification here
    }
  };

  const handleCancelClick = (appointmentId: string) => {
    setSelectedAppointmentId(appointmentId);
    setShowCancelModal(true);
  };

  const handleRescheduleClick = async (appointmentId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get<{ doctor_id: { _id: string } }>(
        `http://localhost:5000/api/appointments/${appointmentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log('Reschedule response:', response.data);

      // Check if doctor_id exists in the response
      if (response.data.doctor_id && response.data.doctor_id._id) {
        const doctorId = response.data.doctor_id._id.toString();
        navigate(`/doctor/${doctorId}`, { replace: true });
      } else {
        console.error('Doctor ID not found in response');
      }
    } catch (err) {
      console.error('Error rescheduling appointment:', err);
    }
  };


  const filteredAppointments = appointments.filter(appointment => {
    console.log('Filtering appointment:', appointment); // Debug log
    
    const matchesSearch = 
      appointment.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Make sure we're including all statuses when 'All' is selected
    const matchesStatus = activeStatus === 'All' || appointment.status === activeStatus;
    
    console.log(`Appointment ${appointment.id} matches:`, { 
      matchesSearch, 
      matchesStatus,
      status: appointment.status,
      activeStatus 
    }); // Debug log
    
    return matchesSearch && matchesStatus;
  });

  const statusCounts = appointments.reduce((acc, appointment) => {
    acc[appointment.status] = (acc[appointment.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  useEffect(() => {
    console.log('Current appointments:', appointments);
    console.log('Filtered appointments:', filteredAppointments);
  }, [appointments, filteredAppointments]);

  useEffect(() => {
    console.log('Current appointments state:', appointments);
  }, [appointments]);

  if (loading) {
    return <Layout><div className="flex justify-center items-center h-screen">Loading...</div></Layout>;
  }

  if (error) {
    return <Layout><div className="flex justify-center items-center h-screen text-red-500">{error}</div></Layout>;
  }

  return (
    <Layout>
      <div className="min-h-screen bg-[#D2EBE7] pb-6">
        <div className="max-w-6xl mx-auto p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">My Appointments</h1>

          <div className="mb-6">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search appointments by doctor name or specialization..."
            />
          </div>

          <div className="flex space-x-4 mb-8">
            {['All', 'Scheduled', 'Completed', 'Requested', 'Cancelled', 'Rescheduled'].map((status) => (
              <button
                key={status}
                onClick={() => setActiveStatus(status as AppointmentStatus)}
                className={`px-4 py-2 font-medium ${
                  activeStatus === status
                    ? 'text-[#0B8FAC] border-b-2 border-[#0B8FAC]'
                    : 'text-gray-500'
                }`}
              >
                {status}
                {status !== 'All' && (
                  <span className={`ml-2 text-sm font-semibold ${
                    activeStatus === status ? 'text-[#0B8FAC]' : 'text-gray-500'
                  }`}>
                    {statusCounts[status] || 0}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {filteredAppointments.map((appointment) => (
              <div key={appointment.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6">
                <div className="flex items-start space-x-6">
                  <img
                    src={appointment.doctor_id.image}
                    alt={appointment.doctor_id.name}
                    className="w-20 h-20 rounded-lg object-cover shadow-md"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{appointment.doctor_id.name}</h3>
                        <p className="text-[#0B8FAC] font-medium">{appointment.doctor_id.specialization}</p>
                      </div>
                      <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                        appointment.status === 'Completed'
                          ? 'bg-green-100 text-green-800'
                          : appointment.status === 'Scheduled'
                            ? 'bg-blue-100 text-blue-800'
                            : appointment.status === 'Requested'
                              ? 'bg-yellow-100 text-yellow-800'
                              : appointment.status === 'Cancelled'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-purple-100 text-purple-800'
                      }`}>
                        {appointment.status}
                      </span>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-6">
                      <div className="flex items-center text-gray-600 bg-gray-50 rounded-lg p-3">
                        <Calendar className="w-5 h-5 mr-3 text-[#0B8FAC]" />
                        <div>
                          <p className="text-sm text-gray-500">Date</p>
                          <p className="font-medium">{formatDate(appointment.date)}</p>
                        </div>
                      </div>
                      <div className="flex items-center text-gray-600 bg-gray-50 rounded-lg p-3">
                        <Clock className="w-5 h-5 mr-3 text-[#0B8FAC]" />
                        <div>
                          <p className="text-sm text-gray-500">Time</p>
                          <p className="font-medium">{appointment.time}</p>
                        </div>
                      </div>
                    </div>

                    {appointment.status === 'Scheduled' && (
                      <div className="mt-6 flex justify-end space-x-4">
                        <button
                          onClick={() => handleCancelClick(appointment.id)}
                          className="px-5 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 font-medium"
                        >
                          Cancel Appointment
                        </button>
                        <button
                          onClick={() => handleRescheduleClick(appointment.id)}
                          className="px-5 py-2.5 bg-[#0B8FAC] text-white rounded-lg hover:bg-[#097a93] transition-all duration-200 font-medium"
                        >
                          Reschedule
                        </button>
                      </div>
                    )}

                    {appointment.status === 'Completed' && (
                      <div className="mt-6 flex items-center border-t pt-6">
                        <div className="flex-1">
                          <p className="text-sm text-gray-600">Share your experience with Dr. {appointment.doctor_id.name.split(' ')[0]}</p>
                        </div>
                        <button
                          onClick={() => handleAddReview(appointment.doctor_id)}
                          className="flex items-center space-x-2 px-5 py-2.5 bg-[#0B8FAC] text-white rounded-lg hover:bg-[#097a93] transition-all duration-200 font-medium"
                        >
                          <span>Add Review</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {isModalOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Review {selectedDoctor?.name}</h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Review <span className="text-gray-400">(optional)</span>
                  </label>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Share your experience with the doctor..."
                    className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0B8FAC] focus:border-transparent resize-none"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitReview}
                    disabled={!rating}
                    className={`px-6 py-2 rounded-lg text-white ${
                      rating
                        ? 'bg-[#0B8FAC] hover:bg-[#097a93]'
                        : 'bg-gray-300 cursor-not-allowed'
                    }`}
                  >
                    Submit Review
                  </button>
                </div>
              </div>
            </div>
          )}

          <ConfirmationModal
            isOpen={showCancelModal}
            onClose={() => setShowCancelModal(false)}
            onConfirm={() => {
              handleCancelAppointment(selectedAppointmentId);
              setShowCancelModal(false);
            }}
            title="Cancel Appointment"
            message="Are you sure you want to cancel this appointment?"
            confirmButtonText="Cancel Appointment"
          />
        </div>
      </div>
    </Layout>
);
}