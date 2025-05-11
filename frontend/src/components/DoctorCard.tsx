import React from 'react';
import { Star, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Doctor } from '../types';

interface DoctorCardProps {
  doctor: Doctor;
  onClick: () => void;
}

export default function DoctorCard({ doctor, onClick }: DoctorCardProps) {
  return (
    <div 
      className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <div className="flex items-start space-x-4">
        <img
          src={doctor.image}
          alt={doctor.name}
          className="w-24 h-24 rounded-lg object-cover"
        />
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-gray-900">{doctor.name}</h2>
          <p className="text-[#0B8FAC] font-medium">{doctor.specialization}</p>
          <div className="flex items-center mt-2 text-gray-600">
            <Clock className="w-4 h-4 mr-2" style={{ color: '#0B8FAC' }} />
            <span>{doctor.experience} experience</span>
          </div>
          <div className="flex items-center mt-1">
            <Star className="w-4 h-4 mr-2 text-yellow-400" />
            <span className="ml-1 text-gray-600">{doctor.rating}</span>
          </div>
        </div>
      </div>
      
      <p className="mt-4 text-gray-600 line-clamp-2">{doctor.description}</p>
      
      <div className="flex justify-between items-center mt-4">
        <span className="text-lg font-semibold text-[#0B8FAC]">Consultation Fee: PKR {doctor.price}</span>
        <Link
          to={`/doctor/${doctor.id}`}
          className="px-6 py-2 bg-[#0B8FAC] text-white rounded-lg hover:bg-[#097a93] transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          Book Appointment
        </Link>
      </div>
    </div>
  );
}