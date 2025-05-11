import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface PrescriptionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  fetchPrescriptions: () => void;
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
  };
  doctor_id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
}


export default function PrescriptionForm({ isOpen, onClose, fetchPrescriptions }: PrescriptionFormProps) {
  const [step, setStep] = useState(1);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [formData, setFormData] = useState({
    appointmentId: '',
    medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
    instructions: '',
    testsRecommended: ''
  });

  const navigate = useNavigate();

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const userId = localStorage.getItem('userId');

      const doctorIdResponse = await axios.get<{_id: string}>(`http://localhost:5000/api/doctors/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const doctorId = doctorIdResponse.data._id;

      const appointmentsResponse = await axios.get<Appointment[]>(
        `http://localhost:5000/api/appointments/doctor/${doctorId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const appointmentsArray = Array.isArray(appointmentsResponse.data)
        ? appointmentsResponse.data
        : (appointmentsResponse.data as { appointments: Appointment[] }).appointments || [];

      setAppointments(appointmentsArray);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
      setAppointments([]);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleNext = () => {
    setStep(step + 1);
  };

  const handlePrevious = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('No auth token found');
        navigate('/login');
        return;
      }

      const selectedAppointment = appointments.find(apt => apt._id === formData.appointmentId);

      const formattedTests = formData.testsRecommended
        ? formData.testsRecommended.split(',').map(test => ({
            test_name: test.trim()
          }))
        : [];

      const prescriptionData = {
        patient_id: selectedAppointment?.patient_id._id,
        doctor_id: selectedAppointment?.doctor_id,
        appointment_id: formData.appointmentId,
        medications: formData.medications,
        instructions: formData.instructions,
        tests: formattedTests
      };

      await axios.post(
        'http://localhost:5000/api/prescriptions',
        prescriptionData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      onClose();
      navigate('/doctor/prescriptions');
      fetchPrescriptions();

    } catch (error: any) {
      console.error('Failed to create prescription:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  const addMedication = () => {
    setFormData({
      ...formData,
      medications: [...formData.medications, { name: '', dosage: '', frequency: '', duration: '' }]
    });
  };

  const updateMedication = (index: number, field: string, value: string) => {
    const newMedications = formData.medications.map((med, i) => 
      i === index ? { ...med, [field]: value } : med
    );
    setFormData({ ...formData, medications: newMedications });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit} className="p-6">
        <h2 className="text-xl font-semibold mb-6">New Prescription</h2>
        
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Appointment
              </label>
              <select
                value={formData.appointmentId}
                onChange={(e) => setFormData({ ...formData, appointmentId: e.target.value })}
                className="w-full border rounded-md px-3 py-2"
                required
              >
                <option value="">Select appointment</option>
                {Array.isArray(appointments) && appointments.map(appointment => (
                  <option key={appointment._id} value={appointment._id}>
                    {`${appointment.patient_id.user_id.name} - ${new Date(appointment.appointment_date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })} ${appointment.appointment_time}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-4">
              {formData.medications.map((med, index) => (
                <div key={index} className="p-4 border rounded-md space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Medication Name
                    </label>
                    <input
                      type="text"
                      value={med.name}
                      onChange={(e) => updateMedication(index, 'name', e.target.value)}
                      className="w-full border rounded-md px-3 py-2"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dosage
                      </label>
                      <input
                        type="text"
                        value={med.dosage}
                        onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                        className="w-full border rounded-md px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Frequency
                      </label>
                      <input
                        type="text"
                        value={med.frequency}
                        onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                        className="w-full border rounded-md px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Duration
                      </label>
                      <input
                        type="text"
                        value={med.duration}
                        onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                        className="w-full border rounded-md px-3 py-2"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addMedication}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                + Add Another Medication
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instructions
              </label>
              <textarea
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                className="w-full border rounded-md px-3 py-2 h-32"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tests Recommended
              </label>
              <textarea
                value={formData.testsRecommended}
                onChange={(e) => setFormData({ ...formData, testsRecommended: e.target.value })}
                className="w-full border rounded-md px-3 py-2 h-32"
              />
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end space-x-3">
          {step > 1 && (
            <button
              type="button"
              onClick={handlePrevious}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Previous
            </button>
          )}
          {step < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
            >
              Submit
            </button>
          )}
        </div>
      </form>
    </Modal>
  );
}