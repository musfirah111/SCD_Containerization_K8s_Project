import { useState, useEffect } from 'react';
import { SearchInput } from '../../components/admin/shared/SearchInput';
import { Table } from '../../components/admin/shared/Table';
import { Pagination } from '../../components/admin/shared/Pagination';
import { ConfirmationModal } from '../../components/shared/ConfirmationModal';
import React from 'react';
import { Layout } from '../../components/admin/AdminLayout';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface ApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <p className="mb-6">{message}</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            Schedule
          </button>
        </div>
      </div>
    </div>
  );
};

interface Appointment {
  id: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  status: 'Confirmed' | 'Requested' | 'Cancelled' | 'Rescheduled' | 'Scheduled';
  patient: string;
  doctor_id: {
    id: string;
    name: string;
    specialization: string;
    image: string;
  };
}

export function AdminAppointmentsPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'All' | 'Scheduled' | 'Requested' | 'Cancelled' | 'Rescheduled' | 'Completed'>('All');
  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);
  const [isApprovalModalVisible, setIsApprovalModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const ITEMS_PER_PAGE = 8;
  const totalPages = Math.ceil(filteredAppointments.length / ITEMS_PER_PAGE);

  useEffect(() => {
    // Filter appointments based on search and active tab
    const filtered = appointments.filter(apt => {
      const matchesSearch = 
        apt.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.patient.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesTab = activeTab === 'All' || apt.status === activeTab;
      
      return matchesSearch && matchesTab;
    });
    
    setFilteredAppointments(filtered);
    
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [searchTerm, activeTab, appointments]);

  // Calculate paginated data
  const paginatedAppointments = filteredAppointments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const baseColumns = [
    { 
      key: 'date', 
      header: 'Date',
      render: (value: string) => value
    },
    { 
      key: 'time', 
      header: 'Time',
      render: (value: string) => value
    },
    { 
      key: 'doctorName', 
      header: 'Doctor',
      render: (value: string) => value
    },
    { 
      key: 'patient', 
      header: 'Patient',
      render: (value: string) => value
    }
  ];

  const statusAndActionsColumns = [
    {
      key: 'status',
      header: 'Status',
      render: (value: 'Scheduled' | 'Requested' | 'Rescheduled' | 'Cancelled' | 'Completed') => (
        <span
          className={`px-3 py-1 rounded-full text-xs ${
            value === 'Scheduled' ? 'bg-[#DCFCE7] text-[#129820]' :
            value === 'Requested' ? 'bg-[#FFF7E6] text-[#F89603]' :
            value === 'Rescheduled' ? 'bg-[#E5F2F0] text-[#7BC1B7]' :
            value === 'Completed' ? 'bg-[#E5F4F9] text-[#0B8FAC]' :
            'bg-[#FEE2E2] text-[#F30000]'  // for Cancelled
          }`}
        >
          {value}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_: unknown, row: any) => {
        if (row.status === 'Completed' || row.status === 'Cancelled' || row.status === 'Scheduled') {
          return null;
        }

        return (
          <div className="flex space-x-2">
            {row.status === 'Requested' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleApprovalClick(row);
                }}
                className="px-3 py-1 rounded-md bg-[#0B8FAC] text-white hover:opacity-90"
              >
                Approve
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCancelClick(row);
              }}
              className="px-3 py-1 rounded-md bg-red-600 text-white hover:opacity-90"
            >
              Cancel
            </button>
          </div>
        );
      },
    },
  ];

  const columns = activeTab === 'All' ? [...baseColumns, ...statusAndActionsColumns] : baseColumns;

  const handleCancelClick = (appointment: any) => {
    setSelectedAppointment(appointment);
    setIsCancelModalVisible(true);
  };

  const handleApprovalClick = (appointment: any) => {
    setSelectedAppointment(appointment);
    setIsApprovalModalVisible(true);
  };

  const confirmCancellation = async () => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.put(
        `http://localhost:5000/api/appointments/${selectedAppointment?.id}/status`,
        { 
          status: 'Cancelled'
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Close modal and clear selection
      setIsCancelModalVisible(false);
      setSelectedAppointment(null);

      // Refresh data and navigate
      await fetchAppointments();
      navigate('/admin/appointments');
      
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      // Add error handling here
    }
  };

  const confirmApproval = async () => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.put(
        `http://localhost:5000/api/appointments/${selectedAppointment?.id}/status`,
        { 
          status: 'Scheduled'
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Close modal and clear selection
      setIsApprovalModalVisible(false);
      setSelectedAppointment(null);

      // Refresh data and navigate
      await fetchAppointments();
      navigate('/admin/appointments');
      
    } catch (err) {
      console.error('Error updating appointment status:', err);
      // Add error handling here
    }
  };

  const statusCounts = appointments.reduce((acc, appointment) => {
    const status = appointment.status;
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      const appointmentsResponse = await axios.get(
        'http://localhost:5000/api/appointments',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log('Raw appointments:', appointmentsResponse.data); // Debug log

      if (Array.isArray(appointmentsResponse.data)) {
        const formattedAppointments = appointmentsResponse.data.map((apt: any) => ({
          id: apt._id,
          doctorName: apt.doctor_id?.user_id?.name || 'Unknown',
          specialty: apt.doctor_id?.specialization || 'Unknown',
          date: new Date(apt.appointment_date).toISOString().split('T')[0],
          time: apt.appointment_time,
          status: apt.status,
          patient: apt.patient_id?.user_id?.name || 'Unknown',
          doctor_id: {
            id: apt.doctor_id?._id || '',
            name: apt.doctor_id?.user_id?.name || 'Unknown',
            specialization: apt.doctor_id?.specialization || 'Unknown',
            image: apt.doctor_id?.image || ''
          }
        }));

        console.log('Formatted appointments:', formattedAppointments); // Debug log
        
        setAppointments(formattedAppointments);
        setFilteredAppointments(formattedAppointments);
        setError(null);
      } else {
        console.error('Unexpected response format:', appointmentsResponse.data);
        // Handle the unexpected format case
      }
    } catch (err: any) {
      console.error('Error fetching appointments:', err);
      setError(err.response?.data?.message || 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    
    const searchValue = value.toLowerCase().trim();
    const filteredAppointments = appointments.filter((apt) => {
      return (
        apt.doctorName.toLowerCase().includes(searchValue) ||
        apt.patient.toLowerCase().includes(searchValue)
      );
    });
    setFilteredAppointments(filteredAppointments);
  };

  return (
    <Layout>
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-black">Appointments</h2>

        <div className="flex justify-between items-center">
          <div className="flex space-x-4 border-b border-gray-200 w-full">
            {['All', 'Scheduled', 'Requested', 'Cancelled', 'Rescheduled', 'Completed'].map((tab) => (
              <button
                key={tab}
                className={`px-4 py-2 font-medium ${
                  activeTab === tab 
                    ? 'text-[#0B8FAC] border-b-2 border-[#0B8FAC]' 
                    : 'text-gray-500'
                }`}
                onClick={() => setActiveTab(tab as typeof activeTab)}
              >
                {tab}
                {tab !== 'All' && (
                  <span className={`ml-2 text-sm font-semibold ${
                    activeTab === tab ? 'text-[#0B8FAC]' : 'text-gray-500'
                  }`}>
                    {statusCounts[tab] || 0}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-4">
            <SearchInput
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search appointments"
            />
          </div>

          <Table
            columns={columns}
            data={paginatedAppointments}
            onRowClick={(row) => console.log('Row clicked:', row)}
          />
          
          <div className="p-4 border-t border-gray-200">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
          
        </div>

        <ConfirmationModal
          isOpen={isCancelModalVisible}
          onClose={() => {
            setIsCancelModalVisible(false);
            setSelectedAppointment(null);
          }}
          onConfirm={confirmCancellation}
          title="Cancel Appointment"
          message="Are you sure you want to cancel this appointment? This action cannot be undone."
          confirmButtonText="Cancel Appointment"
        />

        <ApprovalModal
          isOpen={isApprovalModalVisible}
          onClose={() => {
            setIsApprovalModalVisible(false);
            setSelectedAppointment(null);
          }}
          onConfirm={confirmApproval}
          title="Schedule Appointment"
          message="Are you sure you want to schedule this appointment? This will change the status from Requested to Scheduled."
        />
      </div>
    </Layout>
);
}