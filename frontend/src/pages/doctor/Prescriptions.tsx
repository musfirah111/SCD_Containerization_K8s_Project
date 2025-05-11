import { useState, useEffect } from 'react';
import axios from 'axios';
import SearchBar from '../../components/doctor/SearchBar';
import PrescriptionForm from '../../components/doctor/PrescriptionForm';
import { FileText } from 'lucide-react';
import { Layout } from '../../components/doctor/Layout';

interface Prescription {
  _id: string;
  patient_id: {
    user_id: {
      name: string;
      email: string;
      profile_picture?: string;
    };
    _id: string;
  } | string;
  doctor_id: string;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }>;
  instructions: string;
  tests: Array<{ test_name: string; _id: string }>;
  status: string;
  date_issued: string;
}

// Helper function to get patient name
const getPatientName = (prescription: Prescription) => {
  if (typeof prescription.patient_id === 'string') {
    return 'Patient ID: ' + prescription.patient_id;
  }
  return prescription.patient_id.user_id.name;
};

// Helper function to get patient email
const getPatientEmail = (prescription: Prescription) => {
  if (typeof prescription.patient_id === 'string') {
    return 'No email available';
  }
  return prescription.patient_id.user_id.email || 'No email available';
};

export default function Prescriptions() {
  const [showForm, setShowForm] = useState(false);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patientId] = useState<string | null>(null);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const userId = localStorage.getItem('userId');

      if (!userId || !token) {
        throw new Error('Authentication information missing');
      }

      const doctorResponse = await axios.get<{ _id: string }>(
        `http://localhost:5000/api/doctors/user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const doctorId = doctorResponse.data._id;

      const prescriptionsResponse = await axios.get<Prescription[]>(
        `http://localhost:5000/api/prescriptions/doctor/${doctorId}?populate[patient_id]=true&populate[patient_id.user_id]=true`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setPrescriptions(prescriptionsResponse.data);
      setFilteredPrescriptions(prescriptionsResponse.data);
    } catch (err: any) {
      console.error('Error fetching prescriptions:', err);
      setError(
        err.response?.data?.message || 
        err.message || 
        'Failed to fetch prescriptions. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    const filtered = prescriptions.filter(
      (prescription) =>
        getPatientName(prescription).toLowerCase().includes(query.toLowerCase()) ||
        getPatientEmail(prescription).toLowerCase().includes(query.toLowerCase())
    );
    setFilteredPrescriptions(filtered);
  };

  const handleCreatePrescription = async (data: any) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post<Prescription>(
        'http://localhost:5000/api/prescriptions',
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setPrescriptions([response.data, ...prescriptions]);
      setFilteredPrescriptions([response.data, ...prescriptions]);
    } catch (err) {
      console.error('Error creating prescription:', err);
      setError('Failed to create prescription. Please try again.');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <Layout>
      <div className="space-y-6">
 
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Prescriptions</h1>
          <button
            onClick={() => setShowForm(true)}
            className="bg-[#0B8FAC] text-white px-4 py-2 rounded-md hover:bg-[#0b8fac7d]"
          >
            + New Prescription
          </button>
        </div>

        <PrescriptionForm
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          onSubmit={handleCreatePrescription}
          fetchPrescriptions={fetchPrescriptions}
        />

        <div className="flex space-x-4">
          <div className="flex-1">
            <SearchBar
              onChange={(query) => handleSearch(query)} 
              placeholder="Search by patient name..."
            />
          </div>
        </div>

        {filteredPrescriptions.length === 0 ? (
          <div className="text-center text-gray-500 mt-4">
            No prescriptions found
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredPrescriptions.map((prescription) => {
              console.log('Patient data:', prescription.patient_id);
              console.log('Rendering prescription:', prescription);
              return (
                <div key={prescription._id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center space-x-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-semibold">
                          {getPatientName(prescription)}
                        </h3>
                        <span className="text-sm text-gray-500">
                          ({getPatientEmail(prescription)})
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Prescribed on {new Date(prescription.date_issued).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Medications:</h4>
                    <ul className="space-y-2">
                      {prescription.medications.map((med, index) => (
                        <li key={index} className="text-sm text-gray-600">
                          {med.name} - {med.dosage} ({med.frequency}) for {med.duration}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {prescription.instructions && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Instructions:</h4>
                      <p className="text-sm text-gray-600">{prescription.instructions}</p>
                    </div>
                  )}

                  {prescription.tests && prescription.tests.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Tests:</h4>
                      <ul className="space-y-1">
                        {prescription.tests.map((test, index) => (
                          <li key={index} className="text-sm text-gray-600">
                            {test.test_name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}