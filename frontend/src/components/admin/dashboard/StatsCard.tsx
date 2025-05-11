interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  bgColor: string;
}

export function StatsCard({ icon, label, value, bgColor }: StatsCardProps) {
  return (
    <div className={`${bgColor} p-6 rounded-lg shadow-sm`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-3xl font-semibold mt-1">{value}</p>
        </div>
        <div className="text-gray-600">{icon}</div>
      </div>
    </div>
  );
}