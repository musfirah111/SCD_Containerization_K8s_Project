export interface Doctor {
  id: string;
  name: string;
  department: string;
  specialization: string;
  image: string;
  description: string;
  experience: string;
  rating: number;
  price: number;
  workingHours: WorkingHours[];
}

export interface WorkingHours {
  day: string;
  slots: string[];
}