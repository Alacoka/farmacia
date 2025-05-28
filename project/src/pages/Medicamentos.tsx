import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Edit } from 'lucide-react';
import EditarMedicamentoModal from './EditarMedicamentoModal';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const Medicamentos: React.FC = () => {
    const [medicamentos, setMedicamentos] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [medicamentoSelecionado, setMedicamentoSelecionado] = useState<any>(null);
    const [modalAberto, setModalAberto] = useState<boolean>(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMedicamentos = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'medicamentos'));
                const meds: any[] = [];
                querySnapshot.forEach((doc) => {
                    meds.push({ id: doc.id, ...doc.data() });
                });
                setMedicamentos(meds);
            } catch (err) {
                setError('Erro ao buscar medicamentos.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchMedicamentos();
    }, []);

    const abrirModalEdicao = (medicamento: any) => {
        setMedicamentoSelecionado(medicamento);
        setModalAberto(true);
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const displayName = "Usuário"; // Substitua pelo nome real do usuário

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Header displayName={displayName} onToggleSidebar={toggleSidebar} />

            <div className="flex pt-1">
                <Sidebar sidebarOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

                <main className="flex-1 p-4 md:p-8 mt-20">
                    <div className="max-w-6xl mx-auto">
                        {/* Cabeçalho */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">Medicamentos</h1>
                            </div>
                            <button
                                onClick={() => navigate('/cadastro-medicamento')}
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md hover:shadow-lg"
                            >
                                <PlusCircle className="h-5 w-5 mr-2" />
                                Novo Medicamento
                            </button>
                        </div>

                        {/* Card principal */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            {loading ? (
                                <div className="p-8 text-center">
                                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                                    <p className="mt-2 text-gray-600">Carregando medicamentos...</p>
                                </div>
                            ) : error ? (
                                <div className="p-6 bg-red-50 border-l-4 border-red-500">
                                    <p className="text-red-700 font-medium">{error}</p>
                                </div>
                            ) : medicamentos.length === 0 ? (
                                <div className="p-8 text-center">
                                    <p className="text-gray-500 mb-4">Nenhum medicamento cadastrado.</p>
                                    <button
                                        onClick={() => navigate('/cadastro-medicamento')}
                                        className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
                                    >
                                        Cadastrar Primeiro Medicamento
                                    </button>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantidade</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Validade</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {medicamentos.map((med) => (
                                                <tr key={med.id} className="hover:bg-gray-50 transition cursor-default">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="font-medium text-gray-900">{med.nome}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                            ${med.quantidadeEstoque > 10 ? 'bg-green-100 text-green-800' :
                                                                med.quantidadeEstoque > 0 ? 'bg-yellow-100 text-yellow-800' :
                                                                    'bg-red-100 text-red-800'}`}>
                                                            {med.quantidadeEstoque} unidades
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {med.validade || 'Não informada'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <button
                                                            onClick={() => abrirModalEdicao(med)}
                                                            className="text-blue-600 hover:text-blue-900 flex items-center justify-end w-full cursor-default"
                                                        >
                                                            <Edit className="h-4 w-4 mr-1" />
                                                            Editar
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Modal de edição */}
                    {modalAberto && medicamentoSelecionado && (
                        <EditarMedicamentoModal
                            medicamento={medicamentoSelecionado}
                            onClose={() => setModalAberto(false)}
                            onSaved={() => {
                                setModalAberto(false);
                                // Adicione aqui a lógica para atualizar a lista de medicamentos
                            }}
                        />
                    )}
                </main>
            </div>
        </div>
    );
};

export default Medicamentos;