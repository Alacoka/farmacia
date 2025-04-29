import { Pill, User, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';

interface Props {
    displayName: string;
    onToggleSidebar: () => void;
}

const Header = ({ displayName, onToggleSidebar }: Props) => {
    const navigate = useNavigate();
    const auth = getAuth();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/login');
        } catch {
            alert('Erro ao fazer logout.');
        }
    };

    return (
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
                <button onClick={onToggleSidebar} className="md:hidden">
                    <Menu className="w-6 h-6 text-gray-700" />
                </button>
            </div>
        </header>
    );
};

export default Header;
