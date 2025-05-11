import { Doctor } from "../types/index";

export const doctors: Doctor[] = [
  {
    id: '1',
    name: 'Dr. Pawan Kumar',
    department: 'Cardiology',
    specialization: 'Heart Specialist',
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&auto=format&fit=crop&q=60',
    description: 'Dr. Pawan is a renowned cardiologist with over 15 years of experience in treating complex heart conditions. He specializes in interventional cardiology and has performed over 1000 successful procedures.',
    experience: '15 years',
    rating: 4.9,
    price: 150,
    workingHours: [
      { day: 'Monday', slots: ['09:00', '10:00', '11:00', '14:00', '15:00'] },
      { day: 'Wednesday', slots: ['09:00', '10:00', '11:00', '14:00', '15:00'] },
      { day: 'Friday', slots: ['09:00', '10:00', '11:00', '14:00', '15:00'] }
    ]
  },
  {
    id: '2',
    name: 'Dr. Wanitha Silva',
    department: 'Pediatrics',
    specialization: 'Child Specialist',
    image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&auto=format&fit=crop&q=60',
    description: "Dr. Wanitha is a compassionate pediatrician who has dedicated her career to children's healthcare. She has extensive experience in treating various pediatric conditions and is known for her gentle approach.",
    experience: '12 years',
    rating: 5.0,
    price: 120,
    workingHours: [
      { day: 'Tuesday', slots: ['09:00', '10:00', '11:00', '14:00', '15:00'] },
      { day: 'Thursday', slots: ['09:00', '10:00', '11:00', '14:00', '15:00'] },
      { day: 'Saturday', slots: ['09:00', '10:00', '11:00'] }
    ]
  },
  // Add more doctors as needed
];