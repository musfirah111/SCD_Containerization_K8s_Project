import { useState, useEffect } from 'react';
import axios from 'axios';
import SearchBar from '../../components/doctor/SearchBar';
import LabReportForm from '../../components/doctor/LabReportForm';
import { FileText, Download, Share2 } from 'lucide-react';
import { Layout } from '../../components/doctor/Layout';

interface LabReport {
  _id: string;
  patient_id: {
    _id: string;
    user_id?: {
      name: string;
    };
  };
  test_date: string;
  test_name: string;
  result: string;
  status: string;
  report_url: string;
}

interface FormattedLabReport {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  testType: string;
  results: string;
  status: string;
  reportUrl: string;
}

interface LabReportResponse {
  _id: string;
  patient_id: {
    _id: string;
    user_id?: {
      name: string;
    };
  };
  test_date: string;
  test_name: string;
  result: string;
  status: string;
  report_url: string;
}

export default function LabReports() {
  const [showForm, setShowForm] = useState(false);
  const [reports, setReports] = useState<FormattedLabReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<FormattedLabReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [selectedReportId, setSelectedReportId] = useState('');

  useEffect(() => {
    fetchLabReports();
  }, []);

  const fetchLabReports = async () => {
    try {
      const userId = localStorage.getItem('userId');
      //alert(userId);
      const token = localStorage.getItem('authToken');
      const response = await axios.get<LabReport[]>(
        `http://localhost:5000/api/lab-reports/doctor/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const formattedReports = response.data.map((report) => ({
        id: report._id || '',
        patientId: report.patient_id?._id || '',
        patientName: report.patient_id?.user_id?.name || 'Unknown Patient',
        date: report.test_date ? new Date(report.test_date).toISOString().split('T')[0] : '',
        testType: report.test_name || 'Unknown Test',
        results: report.result || '',
        status: (report.status || 'pending').toLowerCase(),
        reportUrl: report.report_url || ''
      }));

      setReports(formattedReports);
      setFilteredReports(formattedReports);
    } catch (error) {
      console.error('Error fetching lab reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setFilteredReports(reports);
      return;
    }

    const searchTerm = query.toLowerCase().trim();
    const filtered = reports.filter((report) => {
      return (
        report.patientName.toLowerCase().includes(searchTerm) ||
        report.patientId.toLowerCase().includes(searchTerm) ||
        report.testType.toLowerCase().includes(searchTerm) ||
        report.results.toLowerCase().includes(searchTerm) ||
        report.date.includes(searchTerm)
      );
    });
    setFilteredReports(filtered);
  };

  const handleCreateReport = async (data: any) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post<LabReportResponse>(
        'http://localhost:5000/api/lab-reports',
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const newReport = {
        id: response.data._id,
        patientId: response.data.patient_id._id,
        patientName: response.data.patient_id?.user_id?.name || 'Unknown Patient',
        date: new Date(response.data.test_date).toISOString().split('T')[0],
        testType: response.data.test_name,
        results: response.data.result,
        status: response.data.status.toLowerCase() as 'pending' | 'completed',
        reportUrl: response.data.report_url
      };

      setReports([newReport, ...reports]);
      setFilteredReports([newReport, ...reports]);
      setShowForm(false);
    } catch (error) {
      console.error('Error creating lab report:', error);
    }
  };

  const handleDownload = async (reportId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get<Blob>(
        `http://localhost:5000/api/lab-reports/download/${reportId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report-${reportId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading report:', error);
    }
  };

  const handleShare = async (reportId: string) => {
    setSelectedReportId(reportId);
    setIsShareDialogOpen(true);
  };

  const submitShare = async () => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.post(
        `http://localhost:5000/api/lab-reports/${selectedReportId}/share`,
        { email: shareEmail },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      alert('Report shared successfully!');
      setIsShareDialogOpen(false);
      setShareEmail('');
    } catch (error) {
      console.error('Error sharing report:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Lab Reports</h1>
          <button
            onClick={() => setShowForm(true)}
            className="bg-[#0B8FAC] text-white px-4 py-2 rounded-md hover:bg-[#0b8fac9a]"
          >
            New Lab Report
          </button>
        </div>

        <LabReportForm
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          onSuccess={handleCreateReport}
          refetchLabTests={fetchLabReports}
        />

        <div className="flex space-x-4">
          <div className="flex-1">
            <SearchBar
              onChange={handleSearch}
              placeholder="Search by patient name, ID, or test type..."
            />
          </div>
        </div>

        <div className="grid gap-6">
          {filteredReports.map((report) => (
            <div key={report.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold">{report.patientName}</h3>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Test date: {report.date}</p>
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 text-gray-600 hover:text-gray-800 rounded-full hover:bg-gray-100" onClick={() => handleDownload(report.id)}>
                    <Download size={20} />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-gray-800 rounded-full hover:bg-gray-100" onClick={() => handleShare(report.id)}>
                    <Share2 size={20} />
                  </button>
                </div>
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Test Type:</h4>
                  <p className="text-sm text-gray-600">{report.testType}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Results:</h4>
                  <p className="text-sm text-gray-600">{report.results}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isShareDialogOpen && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen">
            <div className="fixed inset-0 bg-black opacity-30" onClick={() => setIsShareDialogOpen(false)}></div>

            <div className="relative bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h2 className="text-lg font-medium mb-4">Share Lab Report</h2>

              <input
                type="email"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                placeholder="Enter recipient's email"
                className="w-full p-2 border rounded-md mb-4"
              />

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setIsShareDialogOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={submitShare}
                  className="px-4 py-2 bg-[#0B8FAC] text-white rounded-md hover:bg-[#0b8fac9a]"
                >
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}