import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getOrders } from "../services/orderService";
import { Order } from "../types/order";
import { StatusBadge } from "../components/StatusBadge";
import { PaginatedResult } from "../types/paginatedResult";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { OrderStatusMap } from "../types/status";
import { AlertCircle, Eye, PlusCircle } from "lucide-react";
import { Pagination } from "../components/Pagination";

export const OrderListPage: React.FC = () => {
  const [orders, setOrders] = useState<PaginatedResult<Order> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const PAGE_SIZE = 10;


  const fetchOrders = useCallback(async (page: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getOrders(page, PAGE_SIZE);
      setOrders(data);
    } catch (err) {
      console.error("Erro ao buscar pedidos:", err);
      setError("Não foi possível carregar os pedidos. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage, fetchOrders]);
  
  useEffect(() => {
    const connection = new HubConnectionBuilder()
      .withUrl(process.env.REACT_APP_SIGNALR_HUB_URL as string)
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    connection
      .start()
      .then(() => console.log("Conectado ao SignalR!"))
      .catch((err) => console.error("Erro na conexão com SignalR: ", err));

    connection.on("OrderStatusUpdated", (uuid: string, newStatus: string) => {
      console.log(`Atualização de status recebida: Pedido ${uuid} agora está ${newStatus}`);
      
      const newStatusNumber = OrderStatusMap[newStatus];
      if (newStatusNumber === undefined) return;

      setOrders((currentPaginatedResult) => {
        if (!currentPaginatedResult) return currentPaginatedResult;

        const updatedItems = currentPaginatedResult.items.map((order) =>
          order.uuid === uuid ? { ...order, status: newStatusNumber } : order
        );

        return { ...currentPaginatedResult, items: updatedItems };
      });
    });

    return () => {
      if (connection) {
        connection.stop();
      }
    };
  }, []);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const renderSkeleton = () => (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
       <div className="hidden md:block space-y-2">
         {[...Array(10)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 rounded"></div>
        ))}
       </div>
        <div className="md:hidden space-y-4">
         {[...Array(5)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
        ))}
       </div>
    </div>
  );

  if (error) {
    return (
      <div className="text-center p-10 bg-red-50 border border-red-200 rounded-lg">
        <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
        <h3 className="mt-2 text-sm font-medium text-red-800">Ocorreu um erro</h3>
        <p className="mt-1 text-sm text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Painel de Pedidos</h1>
        <button className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg shadow-md hover:bg-indigo-700 transition-all duration-300 font-semibold">
          <Link to="/orders/new" className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg shadow-md hover:bg-indigo-700 transition-all duration-300 font-semibold">
            <PlusCircle size={20} />
            <span>Criar Novo Pedido</span>
          </Link>
        </button>
      </div>

      {loading && !orders ? renderSkeleton() : (
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg">
          <div className="overflow-x-auto hidden md:block">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders?.items?.map((order) => (
                  <tr key={order.uuid} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.cliente}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.produto}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.dataCriacao).toLocaleDateString('pt-BR')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">R$ {order.valor.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500"><StatusBadge status={order.status} /></td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link to={`/orders/${order.uuid}`} className="flex items-center justify-center gap-1 text-indigo-600 hover:text-indigo-900">
                        <Eye size={16} /> Ver Detalhes
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="space-y-4 md:hidden">
            {orders?.items?.map((order) => (
              <div key={order.uuid} className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-gray-800">{order.cliente}</p>
                    <p className="text-sm text-gray-600">{order.produto}</p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>
                <div className="mt-4 flex justify-between items-center text-sm">
                  <div>
                    <p className="text-gray-500">Valor: <span className="font-medium text-gray-700">R$ {order.valor.toFixed(2)}</span></p>
                     <p className="text-gray-500">Data: <span className="font-medium text-gray-700">{order.dataCriacao}</span></p>
                  </div>
                  <a href="#" className="flex items-center gap-1 text-indigo-600 font-semibold">
                    <Eye size={16} /> Detalhes
                  </a>
                </div>
              </div>
            ))}
          </div>

          {orders && orders.totalPages > 1 && (
            <Pagination 
              currentPage={currentPage}
              totalPages={orders.totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      )}
    </div>
  );
};
