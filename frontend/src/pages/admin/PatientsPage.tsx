import { useState, useEffect } from 'react';
import { SearchInput } from '../../components/admin/shared/SearchInput';
import { Table } from '../../components/admin/shared/Table';
import { Pagination } from '../../components/admin/shared/Pagination';
import { Avatar } from '../../components/admin/shared/Avatar';
import { Trash2 } from 'lucide-react';
import { RegistrationModal } from '../../components/admin/forms/RegistrationModal';
import { PatientRegistrationForm } from '../../components/admin/forms/PatientRegistrationForm';
import { ConfirmationModal } from '../../components/shared/ConfirmationModal';
import { Layout } from '../../components/admin/AdminLayout';
import axios from 'axios';

interface Patient {
  _id: string;
  user_id: {
    name: string;
    email: string;
    age: number;
    gender: string;
    phone_number: string;
    profile_picture: string;
  };
}

interface PatientResponse {
  id: string;
}

export function PatientsPage() {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [patientData, setPatientData] = useState<Patient[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const ITEMS_PER_PAGE = 8;
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const totalPages = Math.ceil(filteredPatients.length / ITEMS_PER_PAGE);

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get<{ patients: Patient[], total: number }>(
        `http://localhost:5000/api/patients?page=${currentPage}&limit=${ITEMS_PER_PAGE}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

        setPatientData(response.data.patients);
        const total = Number(response.data.total) || 0;
      } catch (error) {
        console.error('Error fetching patients:', error);
      }
    };

  useEffect(() => {
    fetchPatients();
  }, [currentPage]);

  useEffect(() => {
    // Filter patients based on search
    const filtered = patientData.filter((patient) => {
      const searchLower = search.toLowerCase();
      const userData = patient.user_id;
      
      return (
        userData.name.toLowerCase().includes(searchLower) ||
        userData.email.toLowerCase().includes(searchLower) ||
        userData.phone_number.includes(search) ||
        userData.gender.toLowerCase().includes(searchLower)
      );
    });
    
    setFilteredPatients(filtered);
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [search, patientData]);

  // Calculate paginated data
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleDeleteClick = (patient: any) => {
    setSelectedPatient(patient);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await axios.delete(`http://localhost:5000/api/patients/${selectedPatient._id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      console.log('Deleted patient:', response.data);
      setPatientData(prevData =>
        prevData.filter(pat => pat._id !== selectedPatient._id)
      );
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('Error deleting patient:', error);
    }
  };

  const columns = [
    {
      key: 'user_id.name',
      header: 'Patient Name',
      render: (_: string, row: Patient) => (
        <div className="flex items-center space-x-3">
          <Avatar 
            name={row.user_id.name} 
            image={row.user_id.profile_picture} 
          />
          <span>{row.user_id.name}</span>
        </div>
      ),
    },
    { 
      key: 'user_id.age', 
      header: 'Age',
      render: (_: string, row: Patient) => row.user_id.age
    },
    { 
      key: 'user_id.gender', 
      header: 'Gender',
      render: (_: string, row: Patient) => row.user_id.gender
    },
    { 
      key: 'user_id.phone_number', 
      header: 'Phone Number',
      render: (_: string, row: Patient) => row.user_id.phone_number
    },
    { 
      key: 'user_id.email', 
      header: 'Email ID',
      render: (_: string, row: Patient) => row.user_id.email
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_: unknown, row: Patient) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteClick(row);
          }}
          className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-50"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      ),
    },
  ];

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-black">Patient Info</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#0B8FAC] text-white px-4 py-2 rounded-md hover:opacity-90"
          >
            + New Patient
          </button>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search patients..."
            />
          </div>

          <Table
            columns={columns}
            data={paginatedPatients}
            onRowClick={(row) => console.log('Clicked row:', row)}
          />

          <div className="p-4 border-t border-gray-200">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>

        </div>

        <RegistrationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <PatientRegistrationForm 
            onClose={() => setIsModalOpen(false)} 
            onPatientAdded={() => {
              const currentPage = 1;  // Reset to first page
              fetchPatients();
            }} 
          />
        </RegistrationModal>

        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
          title="Delete Patient"
          message="Are you sure you want to delete this patient? This action cannot be undone."
          confirmButtonText="Delete Patient"
        />
      </div>
    </Layout>
  );
}