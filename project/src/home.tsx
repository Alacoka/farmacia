import { useNavigate } from 'react-router-dom';
import { FileText, PlusCircle, User, Edit } from 'lucide-react';

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <span className="ml-2 text-xl font-bold text-gray-900">Stockly</span>
                        </div>
                        <div className="flex items-center gap-4">
                            {/* Botão para visualizar/alterar informações do usuário */}
                            <button
                                onClick={() => navigate('/perfil')}
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <User className="h-5 w-5 mr-2" />
                                Perfil
                            </button>
                            {/* Botão de Sair */}
                            <button
                                onClick={() => navigate('/login')}
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Sair
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Dashboard */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
                        Bem-vindo(a)
                    </h1>
                    <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                        Controle de medicamentos, entradas e saídas para sua farmácia solidária.
                    </p>
                </div>

                {/* Resumo Estatísticas */}
                <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
                    <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                        <h3 className="text-xl font-medium text-gray-900">Medicamentos em Estoque</h3>
                        <p className="mt-2 text-2xl text-blue-600">120</p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                        <h3 className="text-xl font-medium text-gray-900">Entradas Recentes</h3>
                        <p className="mt-2 text-2xl text-green-600">30</p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                        <h3 className="text-xl font-medium text-gray-900">Saídas Recentes</h3>
                        <p className="mt-2 text-2xl text-red-600">15</p>
                    </div>
                </div>

                {/* Ações Rápidas */}
                <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
                    <div
                        onClick={() => navigate('/cadastro-medicamento')}
                        className="flex items-center justify-center bg-blue-600 text-white p-6 rounded-lg shadow-lg cursor-pointer hover:bg-blue-700 transition-colors"
                    >
                        <PlusCircle className="h-6 w-6 mr-2" />
                        <span className="text-xl font-medium">Cadastrar Medicamento</span>
                    </div>

                    <div
                        onClick={() => navigate('/registro-entrada')}
                        className="flex items-center justify-center bg-green-600 text-white p-6 rounded-lg shadow-lg cursor-pointer hover:bg-green-700 transition-colors"
                    >
                        <FileText className="h-6 w-6 mr-2" />
                        <span className="text-xl font-medium">Registrar Entrada</span>
                    </div>

                    <div
                        onClick={() => navigate('/registro-saida')}
                        className="flex items-center justify-center bg-red-600 text-white p-6 rounded-lg shadow-lg cursor-pointer hover:bg-red-700 transition-colors"
                    >
                        <FileText className="h-6 w-6 mr-2" />
                        <span className="text-xl font-medium">Registrar Saída</span>
                    </div>
                </div>

                {/* Relatórios */}
                <div className="mt-12 text-center">
                    <button
                        onClick={() => navigate('/relatorios')}
                        className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                    >
                        Ver Relatórios
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Home;
