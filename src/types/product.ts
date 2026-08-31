export interface Product {
  productId: number;
  productName: string;
  categoryName: string;
  supplierName: string;
  quantityPerUnit: string;
  unitPrice: number;
  unitsInStock: number;
  unitsOnOrder: number;
  reorderLevel: number;
  discontinued: boolean;
}
