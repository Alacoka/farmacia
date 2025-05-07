import { Pill, User, Menu, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import { useState, useRef, useEffect } from 'react';

interface Props {
    displayName: string;
    onToggleSidebar: () => void;
}

const Header = ({ displayName, onToggleSidebar }: Props) => {
    const navigate = useNavigate();
    const auth = getAuth();
    const [showNotifications, setShowNotifications] = useState(false);
    const notifRef = useRef<HTMLDivElement>(null); // ref para detectar clique fora

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/login');
        } catch {
            alert('Erro ao fazer logout.');
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        };

        if (showNotifications) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showNotifications]);

    return (
        <header className="fixed top-0 left-0 right-0 z-30 h-20 bg-white px-6 py-4 shadow-md flex items-center justify-between">
            <div className="flex items-center">
                <Pill className="h-6 w-6 text-blue-600 mr-2" />
                <span className="text-xl font-bold text-gray-900">Stockly</span>
            </div>
            <div className="flex items-center gap-3 relative" ref={notifRef}>
                <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
                >
                    <Bell className="h-4 w-4 mr-1" />
                    Notificações
                </button>
                {showNotifications && (
                    <div className="absolute right-32 top-14 w-64 bg-white border border-gray-200 rounded-md shadow-lg p-4 z-40">
                        <p className="text-sm text-gray-700">Você não tem novas notificações.</p>
                    </div>
                )}
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
