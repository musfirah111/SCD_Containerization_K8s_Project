import { useState, useEffect } from 'react';
import { useParams, useNavigate} from 'react-router-dom';
import { format } from 'date-fns';
import { Star, ArrowLeft } from 'lucide-react';
import { formatDate, getAvailableSlots } from '../utils/date';
import { Layout } from '../components/Layout';
import axios from 'axios';

interface Doctor {
  _id: string;
  user_id: {
    _id: string;
    name: string;
    email: string;
    age: number;
    gender: string;
    phone_number: string;
    role: string;
    profile_picture: string;
    date_created: string;
  };
  description: string;
  specialization: string;
  qualification: string[];
  department_id: any;
  shift: string;
  working_hours: string;
  availability_status: boolean;
  rating: number;
  experience: number;
  consultation_fee: number;
  date_of_joining: string;
}

interface Review {
  _id: string;
  review: string;
  rating: number;
  createdAt: string;
}

export default function DoctorDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');

  useEffect(() => {
    const fetchDoctorDetails = async () => {
      try {

        const token = localStorage.getItem('authToken');
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        const response = await axios.get<Doctor>(`http://localhost:5000/api/doctors/${id}`, config);
        setDoctor(response.data);
      } catch (error) {
        console.error('Error fetching doctor details:', error);
      }
    };


    const fetchReviews = async () => {
          const token = localStorage.getItem('authToken');
          const config = {
            headers: {
              Authorization: `Bearer ${token}`
            }
          };
          const response = await axios.get<Review[]>(`http://localhost:5000/api/reviews/doctorReviews/${id}`, config);
          setReviews(response.data);
    };
    fetchDoctorDetails();
    fetchReviews();
  }, [id]);

  if (!doctor) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Doctor not found</h2>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-6 py-2 bg-[#0B8FAC] text-white rounded-lg hover:bg-[#097a93] transition-colors"
        >
          Return to Home
        </button>
      </div>
    );
  }

  const availableSlots = selectedDate && doctor ? 
    getAvailableSlots(doctor.working_hours, selectedDate) : 
    [];

  const handleBooking = async () => {
    if (!selectedDate || !selectedSlot) {
      alert('Please select both date and time slot');
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const patientId = localStorage.getItem('patientId');

      if (!token || !patientId) {
        alert('Please login to book an appointment');
        navigate('/login');
        return;
      }

      console.log('Making request with:', {
        doctor_id: doctor?._id,
        patient_id: patientId,
        appointment_date: selectedDate,
        appointment_time: selectedSlot
      });

      const response = await axios.post(
        'http://localhost:5000/api/appointments/request',
        {
          doctor_id: doctor?._id,
          patient_id: patientId,
          appointment_date: selectedDate,
          appointment_time: selectedSlot
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Response:', response.data);

      if (response.data.success) {
        localStorage.setItem('appointmentId', response.data.appointment._id);
        navigate(`/booking/${doctor?._id}?date=${selectedDate}&slot=${selectedSlot}`);
      } else {
        alert('Failed to request appointment. Please try again.');
      }
    } catch (error: any) {
      console.error('Error requesting appointment:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
      }
      alert(error.response?.data?.message || 'An error occurred while requesting the appointment. Please try again.');
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-[#D2EBE7] pb-6">
        <div className="max-w-4xl mx-auto p-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-[#0B8FAC] mb-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>

          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-start space-x-6 mb-6">
              <img
                src={doctor.user_id.profile_picture}
                alt={doctor.user_id.name}
                className="w-32 h-32 rounded-lg object-cover"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{doctor.user_id.name}</h1>
                <p className="text-[#0B8FAC] font-medium">{doctor.specialization}</p>
                <div className="flex flex-col mt-2">
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="ml-2 text-gray-600">{doctor.rating} Rating</span>
                  </div>
                  <span className="text-gray-600 mt-1">{doctor.experience} Years of Experience</span>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold mb-4">About Doctor</h2>
              <p className="text-gray-600">{doctor.description}</p>
            </div>
          </div>

          {reviews.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h2 className="text-xl font-semibold mb-6">Patient Reviews</h2>
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review._id} className="border-b pb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < review.rating 
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                              }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                    <p className="text-gray-600">{review.review}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-6">Book Appointment</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 mb-2">Select Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedSlot('');
                  }}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#0B8FAC] focus:outline-none"
                  min={format(new Date(), 'yyyy-MM-dd')}
                />
                {selectedDate && (
                  <p className="mt-2 text-sm text-gray-600">
                    Selected: {formatDate(selectedDate)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Available Slots</label>
                {selectedDate ? (
                  <div className="grid grid-cols-3 gap-2">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setSelectedSlot(slot)}
                        className={`p-2 rounded-lg text-center ${selectedSlot === slot
                          ? 'bg-[#0B8FAC] text-white'
                          : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Please select a date first</p>
                )}
              </div>
            </div>

            <div className="mt-8 flex justify-between items-center">
              <div>
                <span className="text-gray-600">Consultation Fee</span>
                <p className="text-2xl font-bold text-[#0B8FAC]">PKR{doctor.consultation_fee}</p>
              </div>
              <button
                onClick={handleBooking}
                className="px-8 py-3 bg-[#0B8FAC] text-white rounded-lg hover:bg-[#097a93] transition-colors"
              >
                Proceed to Payment
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}