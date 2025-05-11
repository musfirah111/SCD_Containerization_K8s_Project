import { ReactNode } from 'react';

interface ActivityCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  bgColor: string;
  textColor: string;
}

export function ActivityCard({ title, value, icon, bgColor }: ActivityCardProps) {
  return (
    <div className={`${bgColor} rounded-lg p-6 transition-transform hover:scale-105`}>
      <div className="flex flex-col text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-white/20 rounded-lg">{icon}</div>
          <div className="text-3xl font-bold">{value}</div>
        </div>
        <div className="text-sm opacity-90">{title}</div>
      </div>
    </div>
  );
}