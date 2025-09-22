import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createOrder } from '../services/orderService';
import { AlertCircle, ChevronLeft, DollarSign, LoaderCircle, Package, ShieldCheck, User } from 'lucide-react';

interface NotificationState {
    message: string;
    type: 'success' | 'error' | '';
}

export const CreateOrderPage: React.FC = () => {
  const [produto, setProduto] = useState<string>('');
  const [cliente, setCliente] = useState<string>('');
  const [valor, setValor] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<NotificationState>({ message: '', type: '' });
  const navigate = useNavigate();

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 4000);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!produto || !cliente || !valor) {
      showNotification('Por favor, preencha todos os campos.', 'error');
      return;
    }
    setIsLoading(true);
    try {
      const orderData = { produto, cliente, valor: parseFloat(valor) };
      await createOrder(orderData);
      showNotification('Pedido criado com sucesso!', 'success');
      setTimeout(() => navigate('/'), 2000);
    } catch (error) {
      console.error("Erro ao criar pedido:", error);
      showNotification('Houve um erro ao criar o pedido. Tente novamente.', 'error');
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 flex justify-center">
      <div className="w-full max-w-lg">
        <div className="flex items-center mb-6">
          <button onClick={() => navigate(-1)} className="text-indigo-600 hover:text-indigo-800 flex items-center gap-2">
            <ChevronLeft size={20} />
            Voltar
          </button>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">Criar Novo Pedido</h1>
          <p className="text-center text-gray-500 mb-8">Preencha os detalhes abaixo para registrar um novo consumível.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="produto" className="block text-sm font-medium text-gray-700 mb-1">Produto</label>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input id="produto" type="text" value={produto} onChange={(e) => setProduto(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition" required />
              </div>
            </div>
            <div>
              <label htmlFor="cliente" className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input id="cliente" type="text" value={cliente} onChange={(e) => setCliente(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition" required />
              </div>
            </div>
            <div>
              <label htmlFor="valor" className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input id="valor" type="number" step="0.01" min="0" value={valor} onChange={(e) => setValor(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 transition" required />
              </div>
            </div>
            <div>
              <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center gap-3 px-4 py-2.5 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300">
                {isLoading ? <><LoaderCircle className="animate-spin h-5 w-5" /> Criando...</> : 'Criar Pedido'}
              </button>
            </div>
          </form>
        </div>
        {notification.message && (
          <div className={`mt-4 p-4 rounded-md text-sm flex items-center gap-3 ${notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
             {notification.type === 'success' ? <ShieldCheck size={20} /> : <AlertCircle size={20} />}
            {notification.message}
          </div>
        )}
      </div>
    </div>
  );
};