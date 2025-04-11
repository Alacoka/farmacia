import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, href } from 'react-router-dom';
import { Pill, ShieldCheck, Clock, Users, LogIn, ChevronRight } from 'lucide-react';
import { auth } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import Login from './components/login';

function Home() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  const navigate = useNavigate(); // Hook para navegação

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Pill className="h-10 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Stockly</span>
            </div>
            {/* 🔹 Botão agora usa navigate para ir à tela de Login */}
            <button
              onClick={() => navigate('/login')}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <LogIn className="h-5 w-5 mr-2" />
              Login
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            Gestão Farmacêutica Inteligente
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Sistema completo para gerenciamento de farmácias, controle de estoque e atendimento ao cliente.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <button
                onClick={() => window.location.href = 'https://unipiaget.edu.br/ambientes-e-servicos/farmacia-universitaria-solidaria/'}
                className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
              >
                Visitar site da fármacia
                <ChevronRight className="ml-2 h-5 w-5" />
              </button>

            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100">
                <ShieldCheck className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Segurança Total</h3>
              <p className="mt-2 text-base text-gray-500">
                Controle total de acesso e proteção de dados dos clientes e estoque.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100">
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Gestão em Tempo Real</h3>
              <p className="mt-2 text-base text-gray-500">
                Acompanhamento de estoque em tempo real com alertas automáticos.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Foco no Cliente</h3>
              <p className="mt-2 text-base text-gray-500">
                Histórico completo de atendimentos e programa de fidelidade integrado.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Software Preview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="lg:flex lg:items-center lg:justify-between">
          <div className="lg:w-1/2">
            <h2 className="text-3xl font-bold text-gray-900">
              Sistema Completo e Intuitivo
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Interface moderna e fácil de usar, desenvolvida especialmente para o setor farmacêutico.
              Estoque, relatórios gerenciais e muito mais.
            </p>
            <ul className="mt-8 space-y-4">
              {[
                'Controle de Estoque Eficiente',
                'Relatórios Personalizados',
                'Controle de Medicamentos Controlados',
                'Relatórios Gerenciais',
              ].map((feature) => (
                <li key={feature} className="flex items-center">
                  <ShieldCheck className="h-5 w-5 text-blue-600" />
                  <span className="ml-2 text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-8 lg:mt-0 lg:w-1/2">
            <div className="relative rounded-lg overflow-hidden shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=2940"
                alt="Sistema em uso"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
