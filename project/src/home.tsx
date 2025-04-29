import { useNavigate } from 'react-router-dom';
import { FileText, User, Pill, PackagePlus, PackageMinus, Menu } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';

const Home = () => {
    const navigate = useNavigate();
    const auth = getAuth();
    const db = getFirestore();
    const [displayName, setDisplayName] = useState<string>('');
    const [authLoading, setAuthLoading] = useState<boolean>(true);
    const [totalStock, setTotalStock] = useState<number | null>(null);
    const [recentEntries, setRecentEntries] = useState<number | null>(null);
    const [recentExits, setRecentExits] = useState<number | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

    useEffect(() => {
        setAuthLoading(true);
        const unsubscribe = onAuthStateChanged(auth, user => {
            if (user) setDisplayName(user.displayName || '');
            else navigate('/login');
            setAuthLoading(false);
        });
        return () => unsubscribe();
    }, [auth, navigate]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const stockSnapshot = await getDocs(collection(db, 'medicamentos'));
                setTotalStock(stockSnapshot.size);

                const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                const entriesSnapshot = await getDocs(query(collection(db, 'entradas'), where('timestamp', '>=', weekAgo)));
                setRecentEntries(entriesSnapshot.size);
                const exitsSnapshot = await getDocs(query(collection(db, 'saidas'), where('timestamp', '>=', weekAgo)));
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
        } catch {
            alert('Erro ao fazer logout.');
        }
    };

    if (authLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-blue-50">Carregando...</div>;
    }

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-blue-50 font-sans">
            {/* Header fixo */}
            <header className="fixed top-0 left-0 right-0 z-30 h-20 bg-white px-6 py-4 shadow-md flex items-center justify-between">
                <div className="flex items-center">
                    <Pill className="h-6 w-6 text-blue-600 mr-2" />
                    <span className="text-xl font-bold text-gray-900">Stockly</span>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/perfil')} className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">
                        <User className="h-4 w-4 mr-1" />Perfil
                    </button>
                    <button onClick={handleLogout} className="flex items-center px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm">
                        Sair
                    </button>
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden">
                        <Menu className="w-6 h-6 text-gray-700" />
                    </button>
                </div>
            </header>

            {/* Overlay mobile */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed top-20 left-0 z-20 w-full md:w-64 bg-white border-r shadow-sm p-4 space-y-4
                transform transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
                md:relative md:top-20 md:h-[calc(100vh-5rem)]
            `}>
                <nav className="flex flex-col gap-3">
                    <button onClick={() => navigate('/cadastro-medicamento')} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                        <PackagePlus className="w-5 h-5" />Cadastrar Medicamento
                    </button>
                    <button onClick={() => navigate('/registro-entrada')} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700">
                        <FileText className="w-5 h-5" />Registrar Entrada
                    </button>
                    <button onClick={() => navigate('/registro-saida')} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700">
                        <PackageMinus className="w-5 h-5" />Registrar Saída
                    </button>
                    <button onClick={() => alert('Página de Relatórios ainda não implementada.')} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
                        <FileText className="w-5 h-5" />Ver Relatórios
                    </button>
                </nav>
            </aside>

            {/* Conteúdo principal */}
            <main className="flex-1 p-6 md:p-12 mt-24">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Bem-vindo(a), <span className="text-blue-600">{displayName}</span>
                </h1>
                <p className="text-gray-600 mb-8">Controle de medicamentos, entradas e saídas para sua farmácia solidária.</p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {/* Estoque total */}
                    <div className="bg-white p-5 rounded-xl shadow-md text-center border">
                        <h3 className="text-lg font-medium text-gray-700 mb-1">Estoque total</h3>
                        {totalStock === null ? (
                            <p className="text-sm text-gray-400">Carregando...</p>
                        ) : (
                            <>
                                <p className="text-3xl font-semibold text-blue-600">{totalStock}</p>
                                <p className="text-xs text-gray-500 mt-1">Itens diferentes</p>
                            </>
                        )}
                    </div>
                    {/* Entradas */}
                    <div className="bg-white p-5 rounded-xl shadow-md text-center border">
                        <h3 className="text-lg font-medium text-gray-700 mb-1">Entradas Recentes</h3>
                        {recentEntries === null ? (
                            <p className="text-sm text-gray-400">Carregando...</p>
                        ) : (
                            <>
                                <p className="text-3xl font-semibold text-green-600">{recentEntries}</p>
                                <p className="text-xs text-gray-500 mt-1">Últimos 7 dias</p>
                            </>
                        )}
                    </div>
                    {/* Saídas */}
                    <div className="bg-white p-5 rounded-xl shadow-md text-center border">
                        <h3 className="text-lg font-medium text-gray-700 mb-1">Saídas Recentes</h3>
                        {recentExits === null ? (
                            <p className="text-sm text-gray-400">Carregando...</p>
                        ) : (
                            <>
                                <p className="text-3xl font-semibold text-red-600">{recentExits}</p>
                                <p className="text-xs text-gray-500 mt-1">Últimos 7 dias</p>
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Home;
