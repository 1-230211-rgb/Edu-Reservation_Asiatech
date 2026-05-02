export type UserRole = 'student' | 'admin';

export type Page = 
  | 'home' 
  | 'products' 
  | 'about' 
  | 'faqs' 
  | 'policies' 
  | 'notifications' 
  | 'track' 
  | 'profile'
  | 'login' 
  | 'register'
  | 'admin-dashboard'
  | 'admin-reservations'
  | 'admin-inventory'
  | 'admin-students'
  | 'admin-system-logs';

export interface User {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  grade?: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  grade: string;
  status: 'Active' | 'Inactive';
  is_verified?: number;
  joined: string;
}

export interface Reservation {
  id: string;
  uid: string;
  studentName: string;
  studentEmail: string;
  studentGrade: string;
  itemName: string;
  gender: 'Female' | 'Male' | 'N/A';
  size: string | null;
  quantity: number;
  dateReserved: string;
  status: 'Pending' | 'Approved' | 'Ready for Pickup' | 'Picked Up' | 'Rejected' | 'Cancelled';
  rejectionReason?: string;
  estimatedPickup?: string;
  statusUpdatedAt?: string;
  createdAt?: string;
}

export interface InventoryItem {
  id: number;
  name: string;
  category: string;
  gender: string;
  sizes: Record<string, number>;
  status?: 'Available' | 'Out of Stock';
}

export interface AppNotification {
  id: string;
  uid: string;
  date: string;
  message: string;
  status: 'Read' | 'Unread';
}

export interface AuditLog {
  id: number;
  user_id: number;
  admin_name: string;
  action: string;
  details: string;
  entity_type: string;
  entity_id: string;
  created_at: string;
}
