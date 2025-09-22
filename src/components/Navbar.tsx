import { HeartPulse, Settings } from "lucide-react";
import { Page } from "../types/pages";
import { Link } from "react-router-dom";

export const Navbar = () => {
  return (
    <nav className="bg-gray-800 text-white shadow-lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <Settings className="h-8 w-8 text-indigo-400" />
              <span className="font-bold text-xl">Painel de Consumíveis</span>
            </Link>
          </div>
          <div className="flex items-center">
            <a
              href={process.env.REACT_APP_HEALTH_URL}
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-gray-700 hover:bg-indigo-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300"
            >
              <HeartPulse size={20} />
              <span className="hidden sm:inline">Health Check</span>
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};