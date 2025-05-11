import { Doctor, Patient, Appointment, Department, Review } from '../types/admin';

export const doctors: Doctor[] = [
  {
    id: '1',
    name: 'Elizabeth Polson',
    specialization: 'Cardiology',
    qualification: 'MBBS, MD',
    department: 'Cardiology',
    phoneNumber: '+91 12345 67890',
    emailId: 'elisabethpolsan@hotmail.com',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  },
  {
    id: '2',
    name: 'John David',
    specialization: 'Peeds',
    qualification: 'MBBS',
    department: 'Pathology',
    phoneNumber: '+91 12345 67890',
    emailId: 'davidjohn22@gmail.com',
    image: ''
  },
  {
    id: '3',
    name: 'Krishtav Rajan',
    specialization: 'Orthopedics',
    qualification: 'MBBS, MS',
    department: 'Radiology',
    phoneNumber: '+91 12345 67890',
    emailId: 'krishnarajan23@gmail.com',
    image: ''
  },
  {
    id: '4',
    name: 'Sumanth Tinson',
    specialization: 'Ophthalmology',
    qualification: 'MBBS, MS',
    department: 'Opthomolgy',
    phoneNumber: '+91 12345 67890',
    emailId: 'tintintin@gmail.com',
    image: ''
  },
  {
    id: '5',
    name: 'EG Subramani',
    specialization: 'General Medicine',
    qualification: 'MBBS',
    department: 'AB+ve',
    phoneNumber: '+91 12345 67890',
    emailId: 'egs31322@gmail.com',
    image: ''
  }
];



export const patients: Patient[] = [
  {
    id: '1',
    name: 'Elizabeth Polson',
    age: 32,
    gender: 'Female',
    bloodGroup: 'B+ve',
    phoneNumber: '+91 12345 67890',
    emailId: 'elisabethpolsan@hotmail.com',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  },
  {
    id: '2',
    name: 'John David',
    age: 28,
    gender: 'Male',
    bloodGroup: 'B+ve',
    phoneNumber: '+91 12345 67890',
    emailId: 'davidjohn22@gmail.com',
    image: ''
  },
  {
    id: '3',
    name: 'Krishtav Rajan',
    age: 24,
    gender: 'Male',
    bloodGroup: 'AB-ve',
    phoneNumber: '+91 12345 67890',
    emailId: 'krishnarajan23@gmail.com',
    image: ''
  },
  {
    id: '4',
    name: 'Sumanth Tinson',
    age: 26,
    gender: 'Male',
    bloodGroup: 'O+ve',
    phoneNumber: '+91 12345 67890',
    emailId: 'tintintin@gmail.com',
    image: ''
  },
  {
    id: '5',
    name: 'EG Subramani',
    age: 77,
    gender: 'Male',
    bloodGroup: 'AB+ve',
    phoneNumber: '+91 12345 67890',
    emailId: 'egs31322@gmail.com',
    image: ''
  }
];

export const appointments: Appointment[] = [
  {
    id: '1',
    time: '9:30 AM',
    date: '05/12/2022',
    patientName: 'Elizabeth Polson',
    patientAge: 32,
    doctor: 'Dr. John',
    feeStatus: 'Paid',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  },
  {
    id: '2',
    time: '10:30 AM',
    date: '05/12/2022',
    patientName: 'John David',
    patientAge: 28,
    doctor: 'Dr. Joel',
    feeStatus: 'UnPaid',
    image: ''
  },
  {
    id: '3',
    time: '11:00 AM',
    date: '05/12/2022',
    patientName: 'Krishtav Rajan',
    patientAge: 24,
    doctor: 'Dr. Joel',
    feeStatus: 'Paid',
    image: ''
  },
  {
    id: '4',
    time: '11:30 AM',
    date: '05/12/2022',
    patientName: 'Sumanth Tinson',
    patientAge: 26,
    doctor: 'Dr. John',
    feeStatus: 'UnPaid',
    image: ''
  },
  {
    id: '5',
    time: '12:00 PM',
    date: '05/12/2022',
    patientName: 'EG Subramani',
    patientAge: 77,
    doctor: 'Dr. John',
    feeStatus: 'Paid',
    image: ''
  }
];

export const departments: Department[] = [
  {
    id: '1',
    name: 'Cardiology',
    description: 'Heart and cardiovascular care',
    isActive: true,
    status: 'Active',
    staffCount: 45,
    headOfDepartment: 'Dr. Sarah Johnson'
  },
  {
    id: '2',
    name: 'Neurology',
    description: 'Brain and nervous system care',
    isActive: true,
    status: 'Active',
    staffCount: 32,
    headOfDepartment: 'Dr. Michael Chen'
  },
  {
    id: '3',
    name: 'Pediatrics',
    description: 'Child healthcare',
    isActive: false,
    status: 'Closed',
    staffCount: 28,
    headOfDepartment: 'Dr. Emily Williams'
  },
  {
    id: '4',
    name: 'Ophthalmology',
    description: 'Eye care and vision health specialists',
    isActive: true,
    status: 'Active',
    staffCount: 8,
    headOfDepartment: 'Dr. Sumanth Tinson'
  }
];

export const reviews: Review[] = [
  {
    id: '1',
    doctorName: 'Dr. Elizabeth Polson',
    department: 'Cardiology',
    rating: 5,
    review: 'Excellent doctor with great bedside manner. Very thorough in explanations.',
    date: '2024-03-15'
  },
  {
    id: '2',
    doctorName: 'Dr. John David',
    department: 'Pediatrics',
    rating: 4,
    review: 'Very good with children, makes them feel comfortable during visits.',
    date: '2024-03-14'
  },
  {
    id: '3',
    doctorName: 'Dr. Krishtav Rajan',
    department: 'Orthopedics',
    rating: 5,
    review: 'Highly skilled surgeon with excellent post-operative care.',
    date: '2024-03-13'
  }
];