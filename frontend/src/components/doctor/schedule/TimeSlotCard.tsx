import React from 'react';
import type { TimeSlot } from '../../../types/doctor/schedule';
import { Clock, User } from 'lucide-react';

interface TimeSlotCardProps {
  slot: TimeSlot;
}

export function TimeSlotCard({ slot }: TimeSlotCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <div className="flex items-center mb-3">
        <Clock className="w-4 h-4 text-gray-500 mr-2" />
        <span className="font-medium">{slot.time}</span>
      </div>

      {slot.appointments.length > 0 ? (
        <div className="space-y-3">
          {slot.appointments.map((appointment) => (
            <div
              key={appointment.id}
              className={`p-3 rounded-md ${appointment.status === 'completed'
                ? 'bg-green-50'
                : appointment.status === 'cancelled'
                  ? 'bg-red-50'
                  : 'bg-blue-50'
                }`}
            >
              <div className="flex items-center mb-1">
                <User className="w-4 h-4 text-gray-500 mr-2" />
                <span className="font-medium">{appointment.patientName}</span>
              </div>
              <div className="text-sm text-gray-600">
                <span className="mr-3">{appointment.type}</span>
                <span>{appointment.duration} min</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-gray-500 italic">No appointments</div>
      )}
    </div>
  );
}