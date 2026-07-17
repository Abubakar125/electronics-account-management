export interface User {
  id: number;
  username: string;
  created_at: string;
}

export interface Customer {
  id: number;
  customer_code: string;
  name: string;
  father_name?: string;
  cnic: string;
  phone1: string;
  phone2?: string;
  address?: string;
  occupation?: string;
  reference?: string;
  photo?: string;
  cnic_front?: string;
  cnic_back?: string;
  accounts?: Account[];
  created_at: string;
  updated_at: string;
}

export interface Account {
  id: number;
  account_number: string;
  customer_id: number;
  product_name: string;
  brand?: string;
  model?: string;
  total_price: number;
  advance: number;
  remaining: number;
  monthly_installment: number;
  duration: number;
  purchase_date: string;
  due_date?: string;
  status: 'active' | 'completed' | 'cancelled' | 'overdue';
  customer?: Customer;
  payments?: Payment[];
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: number;
  receipt_no: string;
  account_id: number;
  payment_date: string;
  amount: number;
  remaining_balance: number;
  remarks?: string;
  account?: Account;
  created_at: string;
  updated_at: string;
}

export interface Setting {
  id: number;
  company_name: string;
  logo?: string;
  phone?: string;
  address?: string;
  currency: string;
  receipt_footer?: string;
}

export interface DashboardStats {
  totalCustomers: number;
  activeAccounts: number;
  completedAccounts: number;
  outstanding: number;
  todayCollection: number;
  monthlyCollection: number;
  recentPayments: Payment[];
  recentCustomers: Customer[];
  upcomingDue: Account[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  total: number;
  page: number;
  limit: number;
  data: T[];
}

export interface TimelineEvent {
  type: string;
  date: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

export interface CustomerSummary {
  totalAccounts: number;
  activeAccounts: number;
  completedAccounts: number;
  outstanding: number;
  totalPaid: number;
}
