import { FileText, Users, DollarSign, TestTube2 } from 'lucide-react';
import { ActivityCard } from '../../components/admin/dashboard/ActivityCard';
import { DepartmentChart } from '../../components/admin/dashboard/DepartmentChart';
import { TopDoctors } from '../../components/admin/dashboard/TopDoctors';
import { WelcomeBanner } from '../../components/admin/dashboard/WelcomeBanner';
import { Layout } from '../../components/admin/AdminLayout';
import { useEffect, useState } from 'react';
import axios from 'axios';

interface DashboardStats {
  appointments: number;
  patients: number;
  revenue: number;
  labTests: number;
}

interface DepartmentStats {
  name: string;
  percentage: number;
  patients: number;
  color: string;
}

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    appointments: 0,
    patients: 0,
    revenue: 0,
    labTests: 0
  });
  const [departmentData, setDepartmentData] = useState<DepartmentStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch appointments count
        const appointmentsRes = await axios.get('http://localhost:5000/api/appointments/monthly-registrations', { headers });
        console.log("----------------------------------------------appointmentsRes", appointmentsRes);
        // Fetch patients count
        const patientsRes = await axios.get('http://localhost:5000/api/patients/monthly-registrations', { headers });

        // Fetch lab tests count
        const labTestsRes = await axios.get('http://localhost:5000/api/lab-reports/monthly-registrations', { headers });
        console.log("----------------------------------------------labTestsRes", labTestsRes);
        // Fetch revenue data
        const revenueRes = await axios.get('http://localhost:5000/api/doctors/revenue', { headers });
        console.log("----------------------------------------------revenueRes", revenueRes);

        // Fetch departments data
        const departmentsRes = await axios.get('http://localhost:5000/api/departments', { headers });
        const doctorCountRes = await axios.get('http://localhost:5000/api/doctors/count', { headers });

        // Transform department data
        const colors = ['#129820', '#7BC1B7', '#F89603', '#0B8FAC'];
        const transformedDepartments = departmentsRes.data.map((dept: any, index: number) => ({
          name: dept.name,
          percentage: (doctorCountRes.data[dept._id] || 0) * 10, // Calculate percentage based on doctor count
          patients: doctorCountRes.data[dept._id] || 0,
          color: colors[index % colors.length]
        }));

        console.log("----------------------------------------------transformedDepartments", transformedDepartments);

        setStats({
          appointments: appointmentsRes.data.monthlyCount,
          patients: patientsRes.data.monthlyCount,
          revenue: revenueRes.data.revenue || 1290,
          labTests: labTestsRes.data.monthlyCount
        });

        console.log("---------------------------------------------stats", stats);

        setDepartmentData(transformedDepartments);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const activityData = [
    {
      title: 'Appointments',
      value: stats.appointments.toString(),
      icon: <FileText className="w-6 h-6" />,
      bgColor: 'bg-[#0B8FAC]',
      textColor: 'text-[#0B8FAC]'
    },
    {
      title: 'New Patients',
      value: stats.patients.toString(),
      icon: <Users className="w-6 h-6" />,
      bgColor: 'bg-[#F30000]',
      textColor: 'text-[#129820]'
    },
    {
      title: 'Revenue',
      value: `$${stats.revenue}`,
      icon: <DollarSign className="w-6 h-6" />,
      bgColor: 'bg-[#F89603]',
      textColor: 'text-[#F89603]'
    },
    {
      title: 'Lab Tests',
      value: stats.labTests.toString(),
      icon: <TestTube2 className="w-6 h-6" />,
      bgColor: 'bg-[#129820]',
      textColor: 'text-[#7BC1B7]'
    },
  ];

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-lg">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 p-6">
        <WelcomeBanner />

        <div className="grid grid-cols-4 gap-4">
          {activityData.map((item) => (
            <ActivityCard key={item.title} {...item} />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          <TopDoctors className="col-span-2" />
          <DepartmentChart />
        </div>
      </div>
    </Layout>
  );
}