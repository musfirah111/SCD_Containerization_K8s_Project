export type AppointmentStatus = 'scheduled' | 'reschedule-requested' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  reason: string;
}