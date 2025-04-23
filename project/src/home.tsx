import { useNavigate } from 'react-router-dom';
import { FileText, PlusCircle, User, Pill, PackagePlus, PackageMinus } from 'lucide-react'; // Added Pill, PackagePlus, PackageMinus
import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth'; // Added signOut

const Home = () => {
    const navigate = useNavigate();
    const auth = getAuth();
    const [displayName, setDisplayName] = useState<string>('users');
    const [authLoading, setAuthLoading] = useState<boolean>(true); // Loading state for auth check

    useEffect(() => {
        setAuthLoading(true);
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setDisplayName(user.displayName || '');
            } else {
                // If user is not logged in, redirect to login page
                navigate('/login');
            }
            setAuthLoading(false); // Auth check finished
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [auth, navigate]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/login'); // Redirect to login after successful logout
        } catch (error) {
            console.error("Error signing out: ", error);
            alert("Erro ao fazer logout.");
        }
    };

     // Show loading state while checking auth
     if (authLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
                <p>Carregando...</p> {/* Or a spinner */}
            </div>
        );
    }


    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white font-sans">
             {/* --- Navigation Bar --- */}
            <nav className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                             <Pill className="h-6 w-6 text-blue-600 mr-2" />
                            <span className="text-xl font-bold text-gray-900">Stockly</span>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Navigate to Perfil page */}
                            <button
                                onClick={() => navigate('/perfil')}
                                className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                            >
                                <User className="h-4 w-4 mr-1.5" />
                                Perfil
                            </button>
                            {/* Logout Button */}
                            <button
                                onClick={handleLogout} // Call handleLogout function
                                className="flex items-center px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                            >
                                Sair
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* --- Main Content --- */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl md:text-5xl">
                        Bem-vindo(a) <span className="text-blue-600">{displayName}</span>
                    </h1>
                    <p className="mt-3 max-w-md mx-auto text-base text-gray-600 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                        Controle de medicamentos, entradas e saídas para sua farmácia solidária.
                    </p>
                </div>

                {/* --- Stats Cards --- */}
                {/* TODO: Fetch actual data for these cards */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-12">
                    <div className="bg-white p-5 rounded-xl shadow-md text-center border border-gray-200">
                        <h3 className="text-lg font-medium text-gray-700 mb-1">Estoque total</h3>
                        <p className="text-3xl font-semibold text-blue-600">120</p> {/* Placeholder */}
                        <p className="text-xs text-gray-500 mt-1">Itens diferentes</p>
                    </div>
                    <div className="bg-white p-5 rounded-xl shadow-md text-center border border-gray-200">
                        <h3 className="text-lg font-medium text-gray-700 mb-1">Entradas Recentes</h3>
                        <p className="text-3xl font-semibold text-green-600">30</p> {/* Placeholder */}
                         <p className="text-xs text-gray-500 mt-1">Últimos 7 dias</p>
                    </div>
                    <div className="bg-white p-5 rounded-xl shadow-md text-center border border-gray-200">
                        <h3 className="text-lg font-medium text-gray-700 mb-1">Saídas Recentes</h3>
                        <p className="text-3xl font-semibold text-red-600">15</p> {/* Placeholder */}
                         <p className="text-xs text-gray-500 mt-1">Últimos 7 dias</p>
                    </div>
                </div>

                {/* --- Action Buttons --- */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-12">
                    {/* Navigate to Cadastro Medicamento page */}
                    <div
                        onClick={() => navigate('./cadastro-medicamento')}
                        className="flex flex-col items-center justify-center bg-blue-600 text-white p-6 rounded-xl shadow-lg cursor-pointer hover:bg-blue-700 transition-colors transform hover:scale-105"
                    >
                        <PackagePlus className="h-8 w-8 mb-2" />
                        <span className="text-lg font-medium text-center">Cadastrar Medicamento</span>
                    </div>
                     {/* Navigate to Registro Entrada page */}
                    <div
                        onClick={() => navigate('/registro-entrada')}
                        className="flex flex-col items-center justify-center bg-green-600 text-white p-6 rounded-xl shadow-lg cursor-pointer hover:bg-green-700 transition-colors transform hover:scale-105"
                    >
                        <FileText className="h-8 w-8 mb-2" /> {/* Icon can be changed if desired */}
                        <span className="text-lg font-medium text-center">Registrar Entrada</span>
                    </div>
                     {/* Navigate to Registro Saida page */}
                    <div
                        onClick={() => navigate('/registro-saida')}
                        className="flex flex-col items-center justify-center bg-red-600 text-white p-6 rounded-xl shadow-lg cursor-pointer hover:bg-red-700 transition-colors transform hover:scale-105"
                    >
                        <PackageMinus className="h-8 w-8 mb-2" />
                        <span className="text-lg font-medium text-center">Registrar Saída</span>
                    </div>
                </div>

                 {/* --- Reports Button --- */}
                <div className="text-center">
                     {/* TODO: Create a /relatorios route and component */}
                    <button
                        onClick={() => alert('Página de Relatórios ainda não implementada.')} // Placeholder action
                        // onClick={() => navigate('/relatorios')} // Uncomment when ready
                        className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
                    >
                        Ver Relatórios
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Home;

