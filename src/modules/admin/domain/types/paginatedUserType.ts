import { CustomerEntity } from "src/modules/users/domain/entities/customer.entity";
export interface PaginatedUsersResponse {
    data: CustomerEntity[];
    total: number;
    offset: number;
    limit: number;
    
  }
  