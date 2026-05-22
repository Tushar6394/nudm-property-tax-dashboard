export interface Property {
  property_id: string;
  tenant: string;
  owner_name: string;
  property_type: string;
  ward: string;
  area_sqft: number;
  status: 'Approved' | 'Rejected' | 'Pending';
  annual_tax_inr: number;
  collection_inr: number;
  registration_date: string;
  floor_count: number;
  address: string;
}

export interface DashboardStats {
  totalRegistered: number;
  totalApproved: number;
  totalRejected: number;
  totalPending: number;
  totalCollection: number;
}

export interface CityChartData {
  city: string;
  collection: number;
  approved: number;
  rejected: number;
  pending: number;
  total: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}
