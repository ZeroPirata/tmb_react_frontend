import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { OrderListPage } from './pages/OrderListPage';
import { CreateOrderPage } from './pages/CreateOrderPage';
import { OrderDetailPage } from './pages/OrderDetailPage';
import { Navbar } from './components/Navbar';

export default function App() {
  return (
    <BrowserRouter>
      <div className="bg-gray-50 min-h-screen">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<OrderListPage />} />
            <Route path="/orders/new" element={<CreateOrderPage />} />
            <Route path="/orders/:id" element={<OrderDetailPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
