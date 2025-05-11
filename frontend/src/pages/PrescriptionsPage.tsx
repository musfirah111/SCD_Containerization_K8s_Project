import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { formatDate } from '../utils/date';
import { Layout } from '../components/Layout';
import axios from 'axios';

// Define a type for the prescription data
interface Prescription {
  id: string;
  doctor_id: {
    _id: string;
    user_id: {
      name: string;
      profile_picture: string;
    };
    specialization: string;
  };
  medications: { name: string; dosage: string; frequency: string; duration: string }[];
  date_issued: string;
  instructions?: string;
}

interface PatientResponse {
  id: string;
}

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('authToken');  

        if (!userId || !token) {
          console.error('User ID or token is missing');
          return;
        }

        const patientResponse = await axios.get<PatientResponse>(
          `http://localhost:5000/api/patients/user/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const patientId = patientResponse.data.id;

        if (!patientId) {
          console.error('Patient ID is undefined');
          return;
        }

        const response = await axios.get<Prescription[]>(
          `http://localhost:5000/api/prescriptions/patient/${patientId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setPrescriptions(response.data);
      } catch (error) {
        console.error('Error fetching prescriptions:', error);
      }
    };

    fetchPrescriptions();
  }, []);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Current Prescriptions</h1>

        <div className="space-y-6">
          {prescriptions.map((prescription) => {
            const doctor = prescription.doctor_id;

            return (
              <div key={prescription.id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-start space-x-4">
                  <img
                    src={doctor.user_id.profile_picture}
                    alt={doctor.user_id.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{doctor.user_id.name}</h3>
                        <p className="text-[#0B8FAC]">{doctor.specialization}</p>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        {formatDate(prescription.date_issued)}
                      </div>
                    </div>

                    <div className="mt-6 space-y-4">
                      {prescription.medications.map((medication, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900">{medication.name}</h4>
                          <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Dosage:</span>
                              <p className="font-medium">{medication.dosage}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Frequency:</span>
                              <p className="font-medium">{medication.frequency}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Duration:</span>
                              <p className="font-medium">{medication.duration}</p>
                            </div>
                          </div>
                        </div>
                      ))}

                      {prescription.instructions && (
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <h4 className="font-semibold text-blue-900 mb-2">Instructions</h4>
                          <p className="text-blue-800">{prescription.instructions}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}