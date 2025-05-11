import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import axios from 'axios';

interface MedicalRecordFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

interface DoctorResponse {
  _id: string;
  // ... other doctor properties
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

interface Prescription {
  _id: string;
}

export default function MedicalRecordForm({ isOpen, onClose, onSubmit }: MedicalRecordFormProps) {
  const [formData, setFormData] = useState({
    appointment: '',
    diagnosis: '',
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

      const appointmentsResponse = await axios.get<Appointment[]>(`http://localhost:5000/api/appointments/doctor/${doctorId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Debug the response
      console.log('Appointments response type:', typeof appointmentsResponse.data);
      console.log('Is array?', Array.isArray(appointmentsResponse.data));
      console.log('Raw appointments data:', appointmentsResponse.data);

      // Ensure we're setting an array
      const appointmentsArray = Array.isArray(appointmentsResponse.data) 
        ? appointmentsResponse.data 
        : (appointmentsResponse.data as { appointments: Appointment[] }).appointments || [];
        
      console.log('Sample full appointment:', appointmentsArray[0]);
      setAppointments(appointmentsArray);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
      setAppointments([]); // Set empty array on error
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleAppointmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({ ...formData, appointment: e.target.value });
  };

  const handleDiagnosisChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, diagnosis: e.target.value });
  };

  const resetForm = () => {
    setFormData({
      appointment: '',
      diagnosis: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Add debug logs
      console.log('Token:', token);
      console.log('Headers:', {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      });

      const selectedAppointment = appointments.find(apt => apt._id === formData.appointment);
  
      // Make sure token is valid by checking its format
      if (!token.match(/^[A-Za-z0-9-_]*\.[A-Za-z0-9-_]*\.[A-Za-z0-9-_]*$/)) {
        throw new Error('Invalid token format');
      }

      const prescriptionsResponse = await axios.get(`http://localhost:5000/api/prescriptions/appointment/${selectedAppointment?._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      const medicalRecordData = {
        patient_id: selectedAppointment?.patient_id._id,
        doctor_id: selectedAppointment?.doctor_id,
        diagnosis: formData.diagnosis,
        treatment: (prescriptionsResponse.data as Prescription[]).map((prescription: Prescription) => prescription._id),
        date: new Date(),
      };
  
      console.log('Submitting medical record:', medicalRecordData);
  
      const response = await axios.post(
        'http://localhost:5000/api/medical-records', 
        medicalRecordData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
  
      // Debugging success response
      console.log('Medical record submitted:', response.data);
  
      // Refresh appointments after successful submission
      await fetchAppointments();
      resetForm();
      onSubmit(response.data);
      onClose();
    } catch (error) {
      console.error('Failed to submit medical record:', error);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <form onSubmit={handleSubmit} className="p-6">
        <h2 className="text-xl font-semibold mb-6">New Medical Record</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Appointment
            </label>
            <select
              name="appointment"
              value={formData.appointment}
              onChange={handleAppointmentChange}
              className="w-full border rounded-md px-3 py-2"
              required
            >
              <option value="">Select an Appointment</option>
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
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Diagnosis
            </label>
            <textarea
              name="diagnosis"
              value={formData.diagnosis}
              onChange={handleDiagnosisChange}
              className="w-full border rounded-md px-3 py-2"
              required
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleClose}
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