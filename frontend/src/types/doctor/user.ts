export interface User {
  id: string;
  name: string;
  email: string;
  age: number;
  phoneNumber: string;
  role: string;
  avatar: string;
  specialization: string;
  qualification: string;
  department: string;
  gender?: string;
  address?: string;
}