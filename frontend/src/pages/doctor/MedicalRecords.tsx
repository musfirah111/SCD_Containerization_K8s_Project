import { useState, useEffect } from 'react';
import SearchBar from '../../components/SearchBar';
import MedicalRecordForm from '../../components/doctor/MedicalRecordForm';
import { FileText } from 'lucide-react';
import { Layout } from '../../components/doctor/Layout';
import axios from 'axios';

interface DoctorResponse {
  _id: string;
  // ... other doctor properties
}

interface MedicalRecord {
  _id: string;
  patient_id: {
    _id: string;
    user_id: {
      name: string;
    };
  };
  doctor_id: string;
  diagnosis: string;
  treatment: {
    _id: string;
  }[];
  date: string;
}

export default function MedicalRecords() {
  const [showForm, setShowForm] = useState(false);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<MedicalRecord[]>([]);
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    const fetchRecords = async () => {
      try {

        const token = localStorage.getItem('authToken');
        const userId = localStorage.getItem('userId');
        console.log('User ID:', userId); // Debug log

        const doctorIdResponse = await axios.get(`http://localhost:5000/api/doctors/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        console.log('Doctor ID response:', doctorIdResponse.data); // Debug log
        const doctorId = (doctorIdResponse.data as DoctorResponse)._id;
        console.log('Doctor ID:', doctorId); // Debug log

        const response = await axios.get<MedicalRecord[]>(`http://localhost:5000/api/medical-records/doctor/${doctorId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log('Medical records response:', response.data); // Debug log
        setRecords(response.data);
        setFilteredRecords(response.data);
      } catch (error) {
        console.error('Failed to fetch medical records:', error);
      }
    };

    fetchRecords();
  }, []);

  const handleSearch = (query: string) => {
    setSearchValue(query);
    const filtered = records.filter(
      (record) =>
        record.patient_id.user_id.name.toLowerCase().includes(query.toLowerCase()) ||
        record.patient_id._id.toLowerCase().includes(query.toLowerCase()) ||
        record.diagnosis.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredRecords(filtered);
  };

  const handleCreateRecord = async (data: any) => {
    try {
      const token = localStorage.getItem('authToken');
      const userId = localStorage.getItem('userId');
      
      // Get doctor ID first
      const doctorIdResponse = await axios.get(`http://localhost:5000/api/doctors/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const doctorId = (doctorIdResponse.data as DoctorResponse)._id;
      
      // Format the data to match the expected structure
      const recordData = {
        patient_id: data.patient_id,
        doctor_id: doctorId,
        diagnosis: data.diagnosis,
        treatment: data.treatment || [],
      };
      
      console.log('Sending medical record data:', recordData);
      
      const response = await axios.post<MedicalRecord>(
        'http://localhost:5000/api/medical-records',
        recordData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Fetch the complete record data after creation
      const newRecordResponse = await axios.get<MedicalRecord>(
        `http://localhost:5000/api/medical-records/${response.data._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setRecords([newRecordResponse.data, ...records]);
      setFilteredRecords([newRecordResponse.data, ...records]);
      setShowForm(false);
    } catch (error: any) {
      console.error('Failed to create medical record:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      }
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Medical Records</h1>
          <button
            onClick={() => setShowForm(true)}
            className="bg-[#0B8FAC] text-white px-4 py-2 rounded-md hover:bg-[#0b8fac7a]"
          >
            New Record
          </button>
        </div>

        <MedicalRecordForm
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          onSubmit={handleCreateRecord}
        />

        <div className="flex space-x-4">
          <div className="flex-1">
            <SearchBar
              value={searchValue}
              onChange={handleSearch}
              placeholder="Search by patient name, ID, or diagnosis..."
            />
          </div>
        </div>

        <div className="grid gap-6">
          {filteredRecords.map((record) => (
            <div key={record._id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-2">
                    <FileText className="w-8 h-8 text-blue-600" />
                    <h3 className="text-lg font-semibold">
                      {record.patient_id?.user_id?.name || 'Unknown Patient'}
                    </h3>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  Record date: {record.date ? new Date(record.date).toLocaleDateString() : 'N/A'}
                </div>
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Diagnosis:</h4>
                  <p className="text-sm text-gray-600">{record.diagnosis || 'No diagnosis'}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Treatment:</h4>
                  <p className="text-sm text-gray-600">
                    {record.treatment?.length > 0 
                      ? `${record.treatment.length} prescriptions assigned` 
                      : 'No prescriptions assigned'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}