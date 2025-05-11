export interface Appointment {
  id: string;
  patientName: string;
  time: string;
  duration: number;
  type: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface TimeSlot {
  time: string;
  appointments: Appointment[];
}