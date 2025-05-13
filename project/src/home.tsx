import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ResumoEstatisticas from './components/ResumoEstatisticas';
import HistoricoMovimentacao from './components/HistoricoMovimentacao';
import { Star } from 'lucide-react';

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
    const [historicoEntradas, setHistoricoEntradas] = useState<any[]>([]);
    const [historicoSaidas, setHistoricoSaidas] = useState<any[]>([]);
    const [rating, setRating] = useState<number>(0);

    useEffect(() => {
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

                const entradasRef = query(collection(db, 'entradas'), where('timestamp', '>=', weekAgo));
                const entradasSnapshot = await getDocs(entradasRef);
                setRecentEntries(entradasSnapshot.size);
                setHistoricoEntradas(entradasSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

                const saidasRef = query(collection(db, 'saidas'), where('timestamp', '>=', weekAgo));
                const saidasSnapshot = await getDocs(saidasRef);
                setRecentExits(saidasSnapshot.size);
                setHistoricoSaidas(saidasSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } catch (error) {
                console.error('Erro ao buscar dados:', error);
            }
        };

        fetchData();
    }, [db]);

    const handleRating = (value: number) => {
        setRating(value);
    };

    if (authLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-blue-50">Carregando...</div>;
    }

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-blue-50 font-sans">
            <Header displayName={displayName} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
            <Sidebar sidebarOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <main className="flex-1 p-6 md:p-12 mt-24">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Bem-vindo(a), <span className="text-blue-600">{displayName}</span>
                </h1>
                <p className="text-gray-600 mb-8">Controle de medicamentos, entradas e saídas para sua farmácia solidária.</p>

                <ResumoEstatisticas
                    totalStock={totalStock}
                    recentEntries={recentEntries}
                    recentExits={recentExits}
                />

                <div className="mt-10">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Histórico de movimentações</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <HistoricoMovimentacao titulo="Entradas" cor="green" itens={historicoEntradas} />
                        <HistoricoMovimentacao titulo="Saídas" cor="red" itens={historicoSaidas} />
                    </div>
                </div>
            </main>
            <footer className="fixed bottom-0 left-1/2 transform -translate-x-1/2 bg-gray-100 py-4 px-8 rounded-t-lg shadow-lg z-50">
                <h3 className="text-lg font-semibold text-gray-700 mb-2 text-center">Avalie nosso sistema</h3>
                <div className="flex gap-1 justify-center mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                            key={star}
                            size={32}
                            className={star <= rating ? 'text-yellow-500 cursor-pointer' : 'text-gray-300 cursor-pointer'}
                            onClick={() => handleRating(star)}
                        />
                    ))}
                </div>
                <p className="text-gray-500 text-sm text-center">Sua avaliação nos ajuda a melhorar!</p>
            </footer>
        </div>
    );
};

export default Home;
