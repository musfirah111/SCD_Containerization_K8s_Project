import { Activity } from '../../types/doctor/activity';

interface RecentActivityProps {
  activities: Activity[];
}

export default function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Recent Activity</h2>
        <button className="text-sm text-blue-600 hover:text-blue-800">View all</button>
      </div>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-center space-x-4">
            <div className={`w-2 h-2 rounded-full ${activity.color}`}></div>
            <div>
              <p className="text-sm text-gray-600">{activity.description}</p>
              <p className="text-xs text-gray-400">{activity.timeAgo}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}