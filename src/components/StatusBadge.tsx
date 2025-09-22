import { OrderStatus } from "../types/status";


const statusMap: Record<OrderStatus, string> = {
  0: 'Pendente',
  1: 'Processando',
  2: 'Finalizado',
};


export const StatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => {
  const colorClasses: Record<string, string> = {
    Pendente: 'bg-yellow-200 text-yellow-800',
    Processando: 'bg-blue-200 text-blue-800',
    Finalizado: 'bg-green-200 text-green-800',
  };

  const statusText = statusMap[status];

  return (
    <span className={`px-2 py-1 text-sm font-semibold rounded-full ${colorClasses[statusText]}`}>
      {statusText}
    </span>
  );
}