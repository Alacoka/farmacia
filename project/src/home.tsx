import { useNavigate } from 'react-router-dom';
import { FileText, PlusCircle, User, Pill, PackagePlus, PackageMinus } from 'lucide-react'; 
import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore'; // Import Firestore

const Home = () => {
    const navigate = useNavigate();
    const auth = getAuth();
    const db = getFirestore(); // Firestore instance
    const [displayName, setDisplayName] = useState<string>('users');
    const [authLoading, setAuthLoading] = useState<boolean>(true);
    const [totalStock, setTotalStock] = useState<number>(0); // State for total stock
    const [recentEntries, setRecentEntries] = useState<number>(0); // State for recent entries
    const [recentExits, setRecentExits] = useState<number>(0); // State for recent exits

    useEffect(() => {
        setAuthLoading(true);
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setDisplayName(user.displayName || '');
            } else {
                navigate('/login');
            }
            setAuthLoading(false);
        });

        return () => unsubscribe();
    }, [auth, navigate]);

    useEffect(() => {
        // Fetch stock data from Firestore
        const fetchData = async () => {
            try {
                // Total stock from 'medicamentos' collection
                const stockSnapshot = await getDocs(collection(db, 'medicamentos'));
                setTotalStock(stockSnapshot.size); // Assuming each document represents an item

                // Recent entries (last 7 days)
                const entriesQuery = query(collection(db, 'entradas'), where('date', '>=', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)));
                const entriesSnapshot = await getDocs(entriesQuery);
                setRecentEntries(entriesSnapshot.size);

                // Recent exits (last 7 days)
                const exitsQuery = query(collection(db, 'saidas'), where('date', '>=', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)));
                const exitsSnapshot = await getDocs(exitsQuery);
                setRecentExits(exitsSnapshot.size);
            } catch (error) {
                console.error('Error fetching data: ', error);
            }
        };

        fetchData();
    }, [db]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/login');
        } catch (error) {
            console.error("Error signing out: ", error);
            alert("Erro ao fazer logout.");
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
                <p>Carregando...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white font-sans">
            <nav className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <Pill className="h-6 w-6 text-blue-600 mr-2" />
                            <span className="text-xl font-bold text-gray-900">Stockly</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={() => navigate('/perfil')} className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                                <User className="h-4 w-4 mr-1.5" />
                                Perfil
                            </button>
                            <button onClick={handleLogout} className="flex items-center px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium">
                                Sair
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl md:text-5xl">
                        Bem-vindo(a), <span className="text-blue-600">{displayName}</span>
                    </h1>
                    <p className="mt-3 max-w-md mx-auto text-base text-gray-600 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                        Controle de medicamentos, entradas e saídas para sua farmácia solidária.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-12">
                    <div className="bg-white p-5 rounded-xl shadow-md text-center border border-gray-200">
                        <h3 className="text-lg font-medium text-gray-700 mb-1">Estoque total</h3>
                        <p className="text-3xl font-semibold text-blue-600">{totalStock}</p>
                        <p className="text-xs text-gray-500 mt-1">Itens diferentes</p>
                    </div>
                    <div className="bg-white p-5 rounded-xl shadow-md text-center border border-gray-200">
                        <h3 className="text-lg font-medium text-gray-700 mb-1">Entradas Recentes</h3>
                        <p className="text-3xl font-semibold text-green-600">{recentEntries}</p>
                        <p className="text-xs text-gray-500 mt-1">Últimos 7 dias</p>
                    </div>
                    <div className="bg-white p-5 rounded-xl shadow-md text-center border border-gray-200">
                        <h3 className="text-lg font-medium text-gray-700 mb-1">Saídas Recentes</h3>
                        <p className="text-3xl font-semibold text-red-600">{recentExits}</p>
                        <p className="text-xs text-gray-500 mt-1">Últimos 7 dias</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-12">
                    <div onClick={() => navigate('/cadastro-medicamento')} className="flex flex-col items-center justify-center bg-blue-600 text-white p-6 rounded-xl shadow-lg cursor-pointer hover:bg-blue-700 transition-colors transform hover:scale-105">
                        <PackagePlus className="h-8 w-8 mb-2" />
                        <span className="text-lg font-medium text-center">Cadastrar Medicamento</span>
                    </div>
                    <div onClick={() => navigate('/registro-entrada')} className="flex flex-col items-center justify-center bg-green-600 text-white p-6 rounded-xl shadow-lg cursor-pointer hover:bg-green-700 transition-colors transform hover:scale-105">
                        <FileText className="h-8 w-8 mb-2" />
                        <span className="text-lg font-medium text-center">Registrar Entrada</span>
                    </div>
                    <div onClick={() => navigate('/registro-saida')} className="flex flex-col items-center justify-center bg-red-600 text-white p-6 rounded-xl shadow-lg cursor-pointer hover:bg-red-700 transition-colors transform hover:scale-105">
                        <PackageMinus className="h-8 w-8 mb-2" />
                        <span className="text-lg font-medium text-center">Registrar Saída</span>
                    </div>
                </div>

                <div className="text-center">
                    <button onClick={() => alert('Página de Relatórios ainda não implementada.')} className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg">
                        Ver Relatórios
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Home;
