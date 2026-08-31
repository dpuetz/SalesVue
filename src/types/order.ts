export interface Order {
  orderId: number;
  orderDate: string | null;
  shippedDate: string | null;
  freight: number;
  orderTotal: number;
  shipCountry: string;
  customerId: string;
  customerName: string;
  employeeId: number;
  salesPerson: string;
}

export interface PagedResult<T> {
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface OrderCustomerLookup {
  customerId: string;
  customerName: string;
}

export interface OrderSalespersonLookup {
  employeeId: number;
  fullName: string;
}

export interface OrderCountryLookup {
  country: string;
}

export interface OrderLineItem {
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  discount: number;
  lineTotal: number;
}

export interface OrderDetail {
  orderId: number;
  orderDate: string;
  shippedDate: string | null;
  status: string;
  customer: {
    customerId: string;
    customerName: string;
    city: string;
    country: string;
  };
  salesperson: {
    employeeId: number;
    salesPerson: string;
  };
  summary: {
    subtotal: number;
    totalDiscount: number;
    orderTotal: number;
    itemCount: number;
  };
  lineItems: OrderLineItem[];
}

export interface OrderFilters {
  search?: string;
  sortBy?: string;
  sortDir?: string;
  customerId?: string;
  employeeId?: number;
  orderDateStart?: string;
  orderDateEnd?: string;
  shippedDateStart?: string;
  shippedDateEnd?: string;
  shipCountry?: string;
}

export interface CountrySalesPerson {
  country: string;
  EmployeeId: number;
  salesPerson: string;
  totalSales: number;
  orderCount: number;
  firstOrderDate: string | null;
  lastOrderDate: string | null;
}

export interface CountryCustomer {
  country: string;
  customerId: string;
  companyName: string;
  totalSales: number;
  orderCount: number;
  firstOrderDate: string | null;
  lastOrderDate: string | null;
}
