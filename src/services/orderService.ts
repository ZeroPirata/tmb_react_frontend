import axios from 'axios';
import { Order } from '../types/order';
import { PaginatedResult } from '../types/paginatedResult';

const API_URL = process.env.REACT_APP_TBM_API_URL;

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

type CreateOrderData = Omit<Order, 'uuid' | 'dataCriacao' | 'status' | 'statusHistories'>;

export const getOrders = async (pageNumber: number, pageSize: number): Promise<PaginatedResult<Order>> => {
    const response = await apiClient.get<PaginatedResult<Order>>('/orders', {
        params: {
            pageNumber, 
            pageSize    
        }
    });
    return response.data;
};

export const createOrder = async (data: CreateOrderData): Promise<Order> => {
    const response = await apiClient.post<Order>('/orders', data);
    return response.data;
};

export const getOrderByUuid = async (uuid: string): Promise<Order> => {
    const response = await apiClient.get<Order>(`/orders/${uuid}`);
    return response.data;
}