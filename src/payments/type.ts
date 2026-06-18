type UserSalesItem = {
    productName: string;
    unitPrice: number;
    quantity: number;
    total: number;
  };
  
  type UserSalesPayment = {
    paymentId: number;
    orderId: number;
    table: string | number;
    orderTime: Date;
    paidAt: Date;
    items: UserSalesItem[];
    totalAmount: number;
    serviceFee: number;
    paidAmount: number;
  };
  
  export type UserSalesResponse = {
    payments: UserSalesPayment[];
  };