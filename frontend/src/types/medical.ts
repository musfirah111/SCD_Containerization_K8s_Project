export interface Appointment {
  id: string;
  doctor_id: string;
  appointment_date: string;
  appointment_time: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'Rescheduled' | 'Requested';
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export interface Prescription {
  id: string;
  doctor_id: string;
  medications: Medication[];
  instructions?: string;
  date: string;
}

export interface MedicalRecord {
  id: string;
  doctor_id: string;
  diagnosis: string;
  treatment: string[];
  date: string;
}

export interface LabReport {
  id: string;
  doctor_id: string;
  test_name: string;
  test_date: string;
  result: string;
}

export interface Review {
  id: string;
  doctor_id: string;
  patient_id: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Doctor {
  id: string;
  name: string;
  department: string;
  specialization: string;
  experience: string;
  rating: number;
  image: string;
  description: string;
  price: number;
  workingHours: string;
}