import React from 'react';
import { Building2, Users, Award, Clock } from 'lucide-react';

interface InfoCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const InfoCard = ({ icon, title, description }: InfoCardProps) => (
  <div className="bg-white rounded-lg p-4 shadow-md">
    <div className="flex items-center gap-3">
      <div style={{ color: '#0B8FAC' }}>{icon}</div>
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  </div>
);

const HospitalInfoCards = () => {
  const cards = [
    {
      icon: <Building2 />,
      title: "State-of-the-Art Facility",
      description: "Modern medical equipment and comfortable environments"
    },
    {
      icon: <Users />,
      title: "Expert Medical Team",
      description: "Over 100 specialized doctors and medical professionals"
    },
    {
      icon: <Award />,
      title: "Accredited Excellence",
      description: "Internationally recognized healthcare standards"
    },
    {
      icon: <Clock />,
      title: "24/7 Emergency Care",
      description: "Round-the-clock emergency medical services"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {cards.map((card, index) => (
        <InfoCard key={index} {...card} />
      ))}
    </div>
  );
};

export default HospitalInfoCards;