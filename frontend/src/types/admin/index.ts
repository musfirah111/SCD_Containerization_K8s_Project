export interface User {
  name: string;
  role: string;
  image: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  bloodGroup: string;
  phoneNumber: string;
  emailId: string;
  image: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  qualification: string;
  department: string;
  phoneNumber: string;
  emailId: string;
  image: string;
}

export interface Appointment {
  id: string;
  time: string;
  date: string;
  patientName: string;
  patientAge?: number;
  doctor: string;
  feeStatus?: 'Paid' | 'UnPaid';
  image: string;
}

export interface Department {
  _id: string;
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  staffCount: number;
  status?: 'active' | 'inactive' | 'close';
}

export interface Review {
  id: string;
  doctorName: string;
  department: string;
  rating: number;
  review: string;
  date: string;
}

export interface DepartmentData {
  name: string;
  percentage: number;
  patients: number;
  color: string;
}