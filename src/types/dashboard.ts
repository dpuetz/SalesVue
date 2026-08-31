export interface DashboardSummary {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  shippedOrders: number;
  pendingOrders: number;
}

export interface SalespersonRevenue {
  salesPerson: string;
  revenue: number;
  employeeId: number;
}

export interface MonthlyOrders {
  year: number;
  month: number;
  orderCount: number;
}

export interface TopCustomer {
  customerId: string;
  customerName: string;
  country: string;
  revenue: number;
}

export interface DashboardData {
  summary: DashboardSummary;
  revenueByEmployee: SalespersonRevenue[];
  ordersByMonth: MonthlyOrders[];
  topCustomers: TopCustomer[];
  recentOrders: RecentOrder[];
  recentAccounts: RecentAccount[];
}

export interface CountrySales {
  country: string;
  revenue: number;
  orderCount: number;
}

export interface RecentOrder {
  orderId: number;
  customerName: string | null;
  orderDate: string | null;
  orderTotal: number;
  status?: string;
}

export interface RecentAccount {
  customerId: string;
  companyName: string;
  contactName: string;
  city: string;
  country: string;
  createdDate: string;
}
