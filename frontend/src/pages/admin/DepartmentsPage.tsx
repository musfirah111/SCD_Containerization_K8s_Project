import { useState, useEffect } from 'react';
import axios from 'axios';
import { SearchInput } from '../../components/admin/shared/SearchInput';
import { Table } from '../../components/admin/shared/Table';
import { Pagination } from '../../components/admin/shared/Pagination';
import { DepartmentConfirmationModal } from '../../components/admin/departments/DepartmentConfirmationModal';
import { Department } from '../../types/admin';
import { Layout } from '../../components/admin/AdminLayout';
import { ConfirmationModal } from '../../components/shared/ConfirmationModal';
import { DepartmentForm } from '../../components/admin/forms/DepartmentForm';

interface StaffCountResponse {
  _id: string;
  count: number;
}

export function DepartmentsPage() {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [departmentData, setDepartmentData] = useState<Department[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([]);
  const [staffCounts, setStaffCounts] = useState<{ [key: string]: number }>({});
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<'active' | 'inactive' | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  
  const ITEMS_PER_PAGE = 8;
  const totalPages = Math.ceil(filteredDepartments.length / ITEMS_PER_PAGE);

  const paginatedDepartments = filteredDepartments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await axios.get<Department[]>(
        'http://localhost:5000/api/departments',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const mappedData = response.data.map((dept) => ({
        ...dept,
        isActive: dept.active_status,
        status: dept.status || (dept.active_status ? 'active' : 'inactive'),
        staffCount: dept.staff_count,
        headOfDepartment: dept.head_of_department?.name || 'Not Assigned'
      }));

      setDepartmentData(mappedData);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching departments:', err);
      setError(err.response?.data?.message || 'Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffCounts = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get<StaffCountResponse[]>(
        'http://localhost:5000/api/doctors/count',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      console.log('Staff counts response:', response.data);
      
      const countsMap = response.data.reduce((acc: { [key: string]: number }, curr) => {
        acc[curr._id.toString()] = curr.count;
        return acc;
      }, {});
      
      console.log('Processed counts map:', countsMap);
      setStaffCounts(countsMap);
    } catch (err: any) {
      console.error('Error fetching staff counts:', err);
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchStaffCounts();
  }, []);

  useEffect(() => {
    // Update filtered departments when search or departmentData changes
    const filtered = departmentData.filter(dept =>
      dept.name.toLowerCase().includes(search.toLowerCase()) ||
      dept.description.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredDepartments(filtered);
    // Reset to first page when filter changes
    setCurrentPage(1);
  }, [search, departmentData]);


  const handleDeleteConfirm = async () => {
    if (selectedDepartment && !selectedDepartment.isActive) {
      try {
        const token = localStorage.getItem('authToken');
        await axios.delete(`http://localhost:5000/api/departments/${selectedDepartment._id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Refresh departments after deletion
        await fetchDepartments();
        setIsDeleteModalOpen(false);
        setSelectedDepartment(null);
      } catch (err: any) {
        console.error('Error deleting department:', err);
        setError(err.response?.data?.message || 'Failed to delete department');
      }
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedDepartment || !selectedStatus) return;
    
    try {
      const token = localStorage.getItem('authToken');
      await axios.put(
        `http://localhost:5000/api/departments/${selectedDepartment._id}/status`,
        {
          active_status: selectedStatus === 'active',
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      await fetchDepartments();
      setIsStatusModalOpen(false);
      setSelectedStatus(null);
      setSelectedDepartment(null);
    } catch (err: any) {
      console.error('Error updating department status:', err);
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  const columns = [
    { key: 'name', header: 'Department Name' },
    { key: 'description', header: 'Description' },
    {
      key: 'staffCount',
      header: 'Staff Count',
      render: (_: unknown, row: Department) => {
        console.log('Row _id:', row._id, 'Staff counts:', staffCounts);
        return <span>{staffCounts[row._id] || 0}</span>;
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (_: unknown, row: Department) => {
        const statusConfig = {
          active: { bg: 'bg-[#2BA47A]/10', text: 'text-[#2BA47A]' },
          inactive: { bg: 'bg-[#FFA500]/10', text: 'text-[#FFA500]' },
          close: { bg: 'bg-[#F30000]/10', text: 'text-[#F30000]' }
        };

        const status = row.status || 'unknown';
        const config = statusConfig[status as keyof typeof statusConfig] || { bg: 'bg-gray-200', text: 'text-gray-600' };

        return (
          <span className={`px-2 py-1 rounded-full text-xs ${config.bg} ${config.text}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_: unknown, row: Department) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedDepartment(row);
            setIsStatusModalOpen(true);
          }}
          className="px-3 py-1 text-sm text-white bg-[#0B8FAC] rounded-md hover:opacity-90"
        >
          Update Status
        </button>
      ),
    },
  ];

  const handleFormSubmitSuccess = () => {
    setIsFormModalOpen(false);
    fetchDepartments();  // Re-fetch the departments list
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-black">Department Info</h2>
          <button 
            onClick={() => setIsFormModalOpen(true)}
            className="bg-[#0B8FAC] text-white px-4 py-2 rounded-md hover:opacity-90"
          >
            + New Department
          </button>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search departments..."
            />
          </div>

          <Table
            columns={columns}
            data={paginatedDepartments}
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

        <DepartmentConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
          department={selectedDepartment}
        />

        <ConfirmationModal
          isOpen={isStatusModalOpen}
          onClose={() => {
            setIsStatusModalOpen(false);
            setSelectedStatus(null);
            setSelectedDepartment(null);
          }}
          onConfirm={handleStatusUpdate}
          title="Update Status"
          message={`Are you sure you want to change the status of ${selectedDepartment?.name}?`}
          confirmButtonText="Update Status"
        >
          <div className="space-y-4">
            <p>Select new status for {selectedDepartment?.name}:</p>
            <div className="flex gap-2">
              {['active', 'inactive'].map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status as typeof selectedStatus)}
                  className={`px-3 py-1 rounded-md ${
                    selectedStatus === status
                      ? 'bg-[#0B8FAC] text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </ConfirmationModal>

        {isFormModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-md w-full">
              <DepartmentForm 
                onClose={() => setIsFormModalOpen(false)}
                onSubmitSuccess={handleFormSubmitSuccess}
              />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}