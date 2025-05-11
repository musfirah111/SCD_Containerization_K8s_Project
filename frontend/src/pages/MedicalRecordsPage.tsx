import { useContext, useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';
import { formatDate } from '../utils/date';
import { Layout } from '../components/Layout';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

interface User {
  _id: string;
  name: string;
  profile_picture: string;
}

interface Doctor {
  _id: string;
  user_id: User;
  specialization: string;
}

interface Treatment {
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }[];
  instructions: string;
}

interface MedicalRecord {
  _id: string;
  doctor_id: Doctor;
  diagnosis: string;
  treatment: Treatment[];
  date: string;
}

interface PatientResponse {
  id: string;
}

export default function MedicalRecordsPage() {
  const { user } = useContext(AuthContext);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMedicalRecords = async () => {
      if (!user || !user.id) {
        console.error('User ID is null, cannot fetch medical records.');
        setLoading(false);
        return;
      }

      try {
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('authToken');

        if (!userId || !token) {
          console.error('User ID or token not found in localStorage');
          setLoading(false);
          return;
        }

        const patientResponse = await axios.get<PatientResponse>(
          `http://localhost:5000/api/patients/user/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const patientId = patientResponse.data.id;

        const recordsResponse = await axios.get<MedicalRecord[]>(
          `http://localhost:5000/api/medical-records/patient/${patientId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setMedicalRecords(recordsResponse.data);
      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicalRecords();
  }, [user]);

  return (
    <Layout>
      <div className="min-h-screen bg-[#D2EBE7] pb-6">
        <div className="max-w-6xl mx-auto p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Medical Records</h1>

          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="space-y-6">
              {Array.isArray(medicalRecords) && medicalRecords.length === 0 ? (
                <p>No medical records found.</p>
              ) : (
                medicalRecords.map((record) => {
                  const doctor = record.doctor_id;

                  // Fallback handling for missing doctor details
                  const doctorSpecialization =
                    doctor?.specialization || 'Specialization not available';
                  const doctorProfilePicture =
                    doctor?.user_id?.profile_picture || 'Profile picture not available';

                  return (
                    <div key={record._id} className="bg-white rounded-xl shadow-lg p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden">
                          <img src={doctorProfilePicture} alt="Doctor Profile" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold text-lg">
                                {doctor?.user_id.name || 'Not available'}
                              </h3>
                              <p className="text-[#0B8FAC]">{doctorSpecialization}</p>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <Calendar className="w-4 h-4 mr-2" />
                              {formatDate(record.date)}
                            </div>
                          </div>

                          <div className="mt-6 space-y-4">
                            <div>
                              <h4 className="font-semibold text-gray-700 mb-2">Diagnosis</h4>
                              <p className="text-gray-600">
                                {record.diagnosis || 'Diagnosis not available'}
                              </p>
                            </div>

                            <div>
                              <h4 className="font-semibold text-gray-700 mb-2">Treatment</h4>
                              <div className="bg-gray-50 rounded-lg p-4">
                                {record.treatment.map((treatment, index) => (
                                  <div key={index} className="mb-4">
                                    <p className="font-semibold text-gray-800">Medications:</p>
                                    {treatment.medications.map((med, medIndex) => (
                                      <p key={medIndex} className="text-gray-600">
                                        {med.name} - {med.dosage} - {med.frequency} - {med.duration}
                                      </p>
                                    ))}
                                    <p className="text-gray-600 mt-2">
                                      Instructions: {treatment.instructions || 'Not available'}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}