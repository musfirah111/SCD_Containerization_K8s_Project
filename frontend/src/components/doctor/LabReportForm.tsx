import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import axios from 'axios';

interface LabReportFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: any) => void;
  refetchLabTests: () => void;
}

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
  };
  doctor_id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
}

export default function LabReportForm({ isOpen, onClose, onSuccess, refetchLabTests }: LabReportFormProps) {
  const [formData, setFormData] = useState({
    appointment: '',
    testName: '',
    results: ''
  });
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const userId = localStorage.getItem('userId');

      const doctorIdResponse = await axios.get(`http://localhost:5000/api/doctors/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const doctorId = (doctorIdResponse.data as DoctorResponse)._id;

      const appointmentsResponse = await axios.get<Appointment[]>(
        `http://localhost:5000/api/appointments/doctor/${doctorId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Debug the response
      console.log('Appointments response:', appointmentsResponse.data);

      // Ensure we're setting an array
      const appointmentsArray = Array.isArray(appointmentsResponse.data)
        ? appointmentsResponse.data
        : (appointmentsResponse.data as { appointments: Appointment[] }).appointments || [];

      // Filter for completed appointments only
      const completedAppointments = appointmentsArray.filter(apt => apt.status === 'Completed');
      setAppointments(completedAppointments);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
      setAppointments([]);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAppointments();
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const resetForm = () => {
    setFormData({
      appointment: '',
      testName: '',
      results: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('authToken');
      const selectedAppointment = appointments.find(apt => apt._id === formData.appointment);

      if (!selectedAppointment) {
        alert('Please select an appointment');
        return;
      }

      const labReportData = {
        appointment_id: selectedAppointment._id,
        patient_id: selectedAppointment.patient_id._id,
        doctor_id: selectedAppointment.doctor_id,
        test_name: formData.testName,
        result: formData.results,
        test_date: new Date().toISOString(),
        status: 'pending'
      };

      console.log('Lab report data being sent:', labReportData);

      const response = await axios.post(
        'http://localhost:5000/api/lab-reports',
        labReportData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Lab report submitted:', response.data);
      onSuccess(response.data);
      resetForm();
      onClose();
      refetchLabTests();
    } catch (error) {
      console.error('Failed to submit lab report:', error);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={() => {
        resetForm();
        onClose();
      }}
    >
      <form onSubmit={handleSubmit} className="p-6">
        <h2 className="text-xl font-semibold mb-6">New Lab Report</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Appointment
            </label>
            <select
              name="appointment"
              value={formData.appointment}
              onChange={handleInputChange}
              className="w-full border rounded-md px-3 py-2"
              required
            >
              <option value="">Select an appointment</option>
              {appointments.map((appointment) => (
                <option key={appointment._id} value={appointment._id}>
                  {appointment.patient_id.user_id.name} - {new Date(appointment.appointment_date).toLocaleDateString()} {appointment.appointment_time}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Test Name
            </label>
            <input
              type="text"
              name="testName"
              value={formData.testName}
              onChange={handleInputChange}
              className="w-full border rounded-md px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Results
            </label>
            <textarea
              name="results"
              value={formData.results}
              onChange={handleInputChange}
              className="w-full border rounded-md px-3 py-2 h-32"
              required
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
          >
            Submit
          </button>
        </div>
      </form>
    </Modal>
  );
}