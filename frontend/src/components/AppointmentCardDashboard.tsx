import { Calendar, Clock } from 'lucide-react';

interface AppointmentProps {
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
}

const AppointmentCard = ({ doctorName, specialty, date, time }: AppointmentProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-3 w-3/4 mx-auto">
      <h3 className="font-semibold text-gray-800">{doctorName}</h3>
      <p className="text-sm text-gray-600 mb-2">{specialty}</p>
      <div className="flex items-center gap-4">
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="w-4 h-4 mr-1" />
          {date}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="w-4 h-4 mr-1" />
          {time}
        </div>
      </div>
    </div>
  );
};

export default AppointmentCard;