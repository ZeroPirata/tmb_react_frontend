export enum OrderStatus {
  Pendente,    // 0
  Processando, // 1
  Finalizado   // 2
}



export const OrderStatusMap: { [key: string]: OrderStatus } = {
  "Pendente": OrderStatus.Pendente,
  "Processando": OrderStatus.Processando,
  "Finalizado": OrderStatus.Finalizado,
};