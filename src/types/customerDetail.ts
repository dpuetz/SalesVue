export interface CustomerDetail {
  customerId: string;
  customerName: string;
  city: string;
  country: string;
  kpis: {
    totalRevenue: number;
    totalOrders: number;
    avgOrderValue: number;
    shippedOrders: number;
    pendingOrders: number;
  };
  revenueByMonth: { month: number; revenue: number }[];
  orders: {
    orderId: number;
    orderDate: string;
    orderTotal: number;
    status: string;
    salesperson: string;
  }[];
  salespersonBreakdown: {
    employeeId: number;
    salesPerson: string | undefined | null;
    revenue: number;
    orderCount: number;
  }[];
}
