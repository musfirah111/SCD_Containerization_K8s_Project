import { useEffect, useState } from 'react';
import { Stethoscope } from 'lucide-react';

const WelcomeCard = () => {
  const [patientName, setPatientName] = useState('Guest');
  const [, setIsLoading] = useState(true);
  // const patientId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchPatientName = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('http://localhost:5000/api/users/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        setPatientName(data.name);
      } catch (error) {
        console.error('Failed to fetch patient name:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatientName();
  }, []);

  return (
    <div className="bg-[#0B8FAC] rounded-xl p-6 text-white shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Welcome back, {patientName}!</h2>
          <p className="text-blue-100">Your health is our priority at Oasis Hospital</p>
        </div>
        <Stethoscope className="w-12 h-12 text-blue-100" />
      </div>
    </div>
  );
};

export default WelcomeCard;