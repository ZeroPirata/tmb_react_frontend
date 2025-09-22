import { OrderStatusHistory } from "./orderStatusHistory";
import { OrderStatus } from "./status";



export interface Order {
    uuid: string;
    cliente: string;
    status: OrderStatus;
    produto: string;
    valor: number;
    dataCriacao: string;
    statusHistories: OrderStatusHistory[];
}