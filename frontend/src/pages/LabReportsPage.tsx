import { useState, useEffect } from 'react';
import { FileText, Calendar, User, Share2 } from 'lucide-react';
import { formatDate } from '../utils/date';
import SearchBar from '../components/SearchBar';
import { Layout } from '../components/Layout';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface User {
  _id: string;
  name: string;
}

interface Doctor {
  _id: string;
  user_id: User;
  specialization: string;
  name: string;
}

interface LabReport {
  _id: string;
  doctor_id: Doctor;
  test_name: string;
  test_date: string;
  result: string;
  patient_id: string;
}

interface PatientResponse {
  id: string;
}

export default function LabReportsPage() {
  const [reports, setReports] = useState<LabReport[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [sharePopup, setSharePopup] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  const getAuthToken = () => localStorage.getItem('authToken');

  const navigate = useNavigate();

  const fetchReports = async (query = '') => {
    try {
      setLoading(true);
      const token = getAuthToken();

      if (!token) {
        console.error('No token found');
        return;
      }

      const userId = localStorage.getItem('userId');
      if (!userId) {
        console.error('User ID not found');
        return;
      }

      const { data: patientResponse } = await axios.get<PatientResponse>(
        `http://localhost:5000/api/patients/user/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { id: patientId } = patientResponse;
      const { data: reportsData } = await axios.get<LabReport[]>(
        `http://localhost:5000/api/lab-reports/patient/${patientId}/reports`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: query ? { name: query } : undefined,
        }
      );

      setReports(reportsData);
    } catch (error) {
      console.error('Failed to fetch lab reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    fetchReports(value);
  };

  const handleDownload = async (reportId: string) => {
    try {
      const token = getAuthToken();
      if (!token) {
        console.error('No token found');
        return;
      }

      const response = await axios.get<ArrayBuffer>(
        `http://localhost:5000/api/lab-reports/download/${reportId}`,
        {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/pdf' },
          responseType: 'arraybuffer',
        }
      );

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `report_${reportId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download report:', error);
    }
  };

  const handleShare = (reportId: string) => {
    setSelectedReportId(reportId);
    setSharePopup(true);
  };

  const handleShareConfirm = async () => {
    if (!selectedReportId) return;

    try {
      const token = getAuthToken();
      if (!token) {
        console.error('No token found');
        return;
      }

      await axios.post(
        `http://localhost:5000/api/lab-reports/share/${selectedReportId}`,
        { email: shareEmail },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('Report shared successfully');
      closeSharePopup();
      navigate('/lab-reports');
    } catch (error) {
      console.error('Failed to share report:', error);
    }
  };

  const closeSharePopup = () => {
    setSharePopup(false);
    setShareEmail('');
    setSelectedReportId(null);
  };

  const filteredReports = reports.filter((report) =>
    [report.doctor_id?.user_id?.name, report.test_name]
      .some((field) => field?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <Layout>
      <div className="min-h-screen bg-[#D2EBE7] pb-6">
        <div className="max-w-6xl mx-auto p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Medical Lab Reports</h1>
          <div className="mb-6">
            <SearchBar value={searchQuery} onChange={handleSearch} placeholder="Search by test name or doctor..." />
          </div>
          <div className="space-y-6">
            {loading ? (
              <p>Loading reports...</p>
            ) : filteredReports.length > 0 ? (
              filteredReports.map((report) => (
                <div key={report._id} className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-[#0B8FAC]">
                      <FileText className="w-5 h-5 mr-2" />
                      <h3 className="font-semibold">{report.test_name}</h3>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatDate(report.test_date)}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center text-gray-600">
                      <User className="w-4 h-4 mr-2" />
                      <span>
                        Requested by: {report.doctor_id?.user_id?.name} ({report.doctor_id?.specialization})
                      </span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-700 mb-2">Results</h4>
                      <p className="text-gray-600">{report.result}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => handleDownload(report._id)}
                        className="text-[#0B8FAC] hover:text-[#097a93] transition-colors flex items-center"
                      >
                        <FileText className="w-5 h-5 mr-2" />
                        Download Report
                      </button>
                      <button
                        onClick={() => handleShare(report._id)}
                        className="text-[#0B8FAC] hover:text-[#097a93] transition-colors flex items-center"
                      >
                        <Share2 className="w-5 h-5 mr-2" />
                        Share Report
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>No reports found.</p>
            )}
          </div>
        </div>
      </div>
      {sharePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Share Report</h2>
            <input
              type="email"
              value={shareEmail}
              onChange={(e) => setShareEmail(e.target.value)}
              placeholder="Enter email address"
              className="w-full p-2 mb-4 rounded border border-gray-300"
            />
            <button onClick={handleShareConfirm} className="bg-[#0B8FAC] text-white px-4 py-2 rounded mr-2">
              Share
            </button>
            <button onClick={closeSharePopup} className="bg-red-500 text-white px-4 py-2 rounded">
              Cancel
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}
