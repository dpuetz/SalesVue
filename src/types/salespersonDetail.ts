export interface SalespersonDetail {
  employeeId: number;
  salesPerson: string | undefined | null;
  kpis: {
    totalRevenue: number;
    totalOrders: number;
    avgOrderValue: number;
    shippedOrders: number;
    pendingOrders: number;
  };
  revenueByMonth: { month: number; revenue: number }[]; // 1–12
  orders: {
    orderId: number;
    customerName: string;
    orderDate: string;
    orderTotal: number;
    status: string;
  }[];
  topCustomers: {
    customerId: string;
    customerName: string;
    country: string | undefined | null;
    revenue: number;
  }[];
}
