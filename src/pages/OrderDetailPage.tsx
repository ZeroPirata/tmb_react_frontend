import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getOrderByUuid } from "../services/orderService";
import { Order } from "../types/order";
import { StatusBadge } from "../components/StatusBadge";
import { HubConnectionBuilder } from "@microsoft/signalr";
import { OrderStatusMap } from "../types/status";
import {
  OrderStatusHistory,
} from "../types/orderStatusHistory";
import {
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  Clock,
  LoaderCircle,
  Settings,
} from "lucide-react";

interface StatusInfo {
  [key: number]: {
    text: string;
    color: string;
    ring: string;
    icon: React.ElementType;
  };
}

const OrderStatusInfo: StatusInfo = {
  0: {
    text: "Pendente",
    color: "bg-yellow-100 text-yellow-800",
    ring: "ring-yellow-500/10",
    icon: Clock,
  },
  1: {
    text: "Processando",
    color: "bg-green-100 text-green-800",
    ring: "ring-green-500/10",
    icon: Settings,
  },
  2: {
    text: "Finalizado",
    color: "bg-indigo-100 text-indigo-800",
    ring: "ring-indigo-500/10",
    icon: CheckCircle,
  },
};

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("ID do pedido não fornecido.");
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const data = await getOrderByUuid(id);
        setOrder(data);
      } catch (err) {
        setError("Pedido não encontrado.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();

    const connection = new HubConnectionBuilder()
      .withUrl(process.env.REACT_APP_SIGNALR_HUB_URL as string)
      .withAutomaticReconnect()
      .build();

    const orderStatusUpdateHandler = (
      uuid: string,
      newStatusString: string
    ) => {
      if (uuid === id) {
        const newStatusEnum = OrderStatusMap[newStatusString];
        if (newStatusEnum !== undefined) {
          setOrder((currentOrder) => {
            if (!currentOrder) return null;
            const newHistoryEntry: OrderStatusHistory = {
              id: (currentOrder.statusHistories?.length || 0) + 1,
              previousStatus: currentOrder.status,
              newStatus: newStatusEnum,
              changedAt: new Date().toISOString(),
            };
            return {
              ...currentOrder,
              status: newStatusEnum,
              statusHistories: [
                ...(currentOrder.statusHistories || []),
                newHistoryEntry,
              ],
            };
          });
        }
      }
    };

    connection.on("OrderStatusUpdated", orderStatusUpdateHandler);

    connection
      .start()
      .then(() => connection.invoke("SubscribeToOrder", id))
      .catch((err) => console.error("Erro na conexão com SignalR: ", err));

    return () => {
      connection.off("OrderStatusUpdated", orderStatusUpdateHandler);
      connection
        .invoke("UnsubscribeFromOrder", id)
        .catch((err) => console.error("SignalR: Falha ao desinscrever.", err))
        .finally(() => connection.stop());
    };
  }, [id]);

  if (loading)
    return (
      <div className="text-center p-10">
        <LoaderCircle className="mx-auto h-12 w-12 animate-spin text-indigo-600" />
      </div>
    );
  if (error)
    return (
      <div className="container mx-auto p-8 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <p className="mt-4 text-red-600">{error}</p>
        <Link
          to="/"
          className="mt-4 inline-block text-indigo-600 hover:underline"
        >
          &larr; Voltar para a lista
        </Link>
      </div>
    );
  if (!order)
    return <p className="text-center mt-10">Nenhum pedido para exibir.</p>;

  const formattedDate = new Date(order.dataCriacao).toLocaleString("pt-BR");

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-indigo-600 hover:text-indigo-800 flex items-center gap-2"
        >
          <ChevronLeft size={20} />
          Voltar
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-8 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Detalhes do Pedido
              </h1>
              <p className="text-sm text-gray-500 font-mono mt-1">
                {order.uuid}
              </p>
            </div>
            <StatusBadge status={order.status} />
          </div>
          <div className="border-t border-gray-200 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
            <div>
              <p className="font-semibold text-gray-500">CLIENTE</p>
              <p className="text-gray-800 font-medium">{order.cliente}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-500">PRODUTO</p>
              <p className="text-gray-800 font-medium">{order.produto}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-500">DATA</p>
              <p className="text-gray-800 font-medium">{formattedDate}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-500">VALOR</p>
              <p className="text-green-600 font-bold text-base">
                {order.valor.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            Histórico de Status
          </h2>
          <div className="flow-root">
            <ul className="-mb-8">
              {order.statusHistories?.map((history, index) => {
                const StatusIcon =
                  OrderStatusInfo[history.newStatus]?.icon || Clock;
                return (
                  <li key={history.id}>
                    <div className="relative pb-8">
                      {index !== order.statusHistories.length - 1 ? (
                        <span
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center ring-8 ring-white">
                            <StatusIcon className="h-5 w-5 text-gray-500" />
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-800 font-medium">
                              {OrderStatusInfo[history.newStatus]?.text}
                            </p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            <time dateTime={history.changedAt}>
                              {new Date(history.changedAt).toLocaleTimeString(
                                "pt-BR",
                                { hour: "2-digit", minute: "2-digit" }
                              )}
                            </time>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
