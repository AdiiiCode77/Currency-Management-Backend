import { CustomerEntity } from "../../../users/domain/entities/customer.entity";
export interface PaginatedUsersResponse {
    data: CustomerEntity[];
    total: number;
    offset: number;
    limit: number;
    
  }
  