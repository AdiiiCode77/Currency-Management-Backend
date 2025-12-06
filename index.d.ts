declare namespace Express {
  interface Request {
    userId?: string;
    customerId?: string;
    riderId?: string;
    adminId?: string;
    storeId?: string;
    vendorId?: string;
  }
}
