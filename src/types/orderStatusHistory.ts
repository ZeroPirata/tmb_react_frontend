import { OrderStatus } from "./status";


export interface OrderStatusHistoryFromApi {
  Id: number;
  PreviousStatus: OrderStatus;
  NewStatus: OrderStatus;
  ChangedAt: string;
}

export interface OrderStatusHistory {
  id: number;
  previousStatus: OrderStatus;
  newStatus: OrderStatus;
  changedAt: string;
}