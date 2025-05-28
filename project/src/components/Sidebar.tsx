import { useNavigate } from 'react-router-dom';
import { FileText, PackageMinus, PackagePlus } from 'lucide-react';

interface Props {
    sidebarOpen: boolean;
    onClose: () => void;
}

const Sidebar = ({ sidebarOpen, onClose }: Props) => {
    const navigate = useNavigate();

    return (
        <>
            {sidebarOpen && <div onClick={onClose} className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden" />}
            <aside className={`
                fixed top-20 left-0 z-20 w-full md:w-64 bg-white border-r shadow-sm p-4 space-y-4
                transform transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
                md:relative md:top-20 md:h-[calc(100vh-5rem)]
            `}>
                <nav className="flex flex-col gap-3">
                    <button
                        onClick={() => navigate('/medicamentos')}
                        className="flex items-center gap-2 px-3 py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                    >
                        <PackagePlus className="w-6 h-6" />
                        <span>Medicamentos</span>
                    </button>

                    <button
                        onClick={() => navigate('/registro-entrada')}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
                    >
                        <FileText className="w-5 h-5" />
                        Registrar Entrada
                    </button>

                    <button
                        onClick={() => navigate('/registro-saida')}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
                    >
                        <PackageMinus className="w-5 h-5" />
                        Registrar Saída
                    </button>

                    <button
                        onClick={() => navigate('/movimentacoes')}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-600 text-white hover:bg-yellow-700 transition"
                    >
                        <FileText className="w-5 h-5" />
                        Movimentações
                    </button>


                    <button
                        onClick={() => navigate('/login-relatorio')}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
                    >
                        <FileText className="w-5 h-5" />
                        Ver Relatórios
                    </button>
                </nav>
            </aside>
        </>
    );
};

export default Sidebar;
