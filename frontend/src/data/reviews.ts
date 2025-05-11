import type { Review } from '../types/medical';

export const reviews: Review[] = [
  {
    id: '1',
    doctor_id: '1',
    patient_id: 'user123',
    rating: 5,
    comment: 'Dr. Pawan was very professional and thorough in his examination. Highly recommended!',
    date: '2024-03-15'
  },
  {
    id: '2',
    doctor_id: '2',
    patient_id: 'user123',
    rating: 4,
    comment: 'Very knowledgeable doctor. Explained everything in detail.',
    date: '2024-03-10'
  }
];