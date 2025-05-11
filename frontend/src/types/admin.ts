export interface Department {
  _id: string;
  name: string;
  description: string;
  active_status: boolean;
  isActive?: boolean;
  status?: 'active' | 'inactive' | 'close' | 'unknown';
  staff_count?: number;
  head_of_department?: {
    name: string;
  };
}
