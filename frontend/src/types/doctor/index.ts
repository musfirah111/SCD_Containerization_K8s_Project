export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  contact: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'reschedule-requested';
  reason: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }[];
  notes: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  diagnosis: string;
  treatment: string;
  notes: string;
}

export interface LabReport {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  testType: string;
  results: string;
  status: 'pending' | 'completed';
  reportUrl?: string;
}