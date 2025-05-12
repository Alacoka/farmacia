import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ArrowLeft, Save, Trash } from 'lucide-react';
import {
    getAuth,
    onAuthStateChanged,
    updateProfile,
    deleteUser,
    User as FirebaseUser
} from 'firebase/auth';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';

const db = getFirestore();
const Perfil: React.FC = () => {
    const navigate = useNavigate();
    const auth = getAuth();

    const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [photoURL, setPhotoURL] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setCurrentUser(user);
                setDisplayName(user.displayName || '');
                setEmail(user.email || '');
                setPhotoURL(user.photoURL || '');
            } else {
                navigate('/login');
            }
            setAuthLoading(false);
        });

        return () => unsubscribe();
    }, [auth, navigate]);

    const isValidEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleSave = async () => {
        if (!currentUser) {
            setError("Usuário não autenticado.");
            return;
        }

        if (!displayName.trim()) {
            setError("O nome de exibição não pode ficar em branco.");
            return;
        }

        if (!isValidEmail(email)) {
            setError("O e-mail inserido não é válido.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await updateProfile(currentUser, { displayName });
            const userDocRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userDocRef, { displayName });
            setIsEditing(false);
        } catch (err) {
            console.error("Erro ao atualizar perfil:", err);
            setError("Erro ao salvar as alterações.");
        } finally {
            setLoading(false);
        }
    };

    const confirmDeleteAccount = async () => {
        try {
            if (currentUser) {
                await deleteUser(currentUser);
                navigate('/login');
            }
        } catch (err) {
            console.error("Erro ao excluir conta:", err);
            setError("Erro ao excluir sua conta.");
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-lg text-gray-600">Carregando perfil...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 via-white to-gray-100 p-6 relative">
            <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8 relative">
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-4 left-4 text-blue-600 hover:text-blue-800 transition"
                    disabled={loading}
                >
                    <ArrowLeft className="inline-block h-5 w-5 mr-2" /> Voltar
                </button>

                <div className="text-center mb-6 pt-6">
                    {photoURL ? (
                        <img src={photoURL} alt="Foto de perfil" className="h-24 w-24 rounded-full mx-auto object-cover mb-4 border-4 border-blue-600" />
                    ) : (
                        <User className="h-24 w-24 text-blue-600 mx-auto bg-blue-100 p-5 rounded-full mb-4" />
                    )}
                    <h2 className="text-3xl font-semibold text-gray-800">Olá, {displayName || 'Usuário'}</h2>
                </div>

                <div className="space-y-6">
                    <div>
                        <label htmlFor="displayName" className="text-sm font-semibold text-gray-700">Nome</label>
                        <input
                            id="displayName"
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            readOnly={!isEditing}
                            disabled={loading}
                            className={`mt-2 w-full px-5 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 ${isEditing ? 'bg-white border-blue-400' : 'bg-gray-100 border-gray-300 cursor-not-allowed'}`}
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="text-sm font-semibold text-gray-700">E-mail</label>
<input
    id="email"
    type="email"
    value={email}
    readOnly
    disabled
    className="mt-2 w-full px-5 py-3 rounded-xl border bg-gray-100 border-gray-300 cursor-not-allowed"
/>

                    </div>

                    <div className="mt-8">
                        <h3 className="text-lg font-semibold text-gray-700">Política de Acesso</h3>
                        <p className="text-sm text-gray-600">
                            Manter-se como usuário garante acesso contínuo aos recursos exclusivos, atualizações regulares e melhorias constantes na plataforma.
                        </p>
                    </div>

                    {error && <p className="text-sm text-red-600 text-center mt-4">{error}</p>}

                    <div className="flex justify-between gap-4 pt-6">
                        {isEditing ? (
                            <>
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        setDisplayName(currentUser?.displayName || '');
                                        setError(null);
                                    }}
                                    disabled={loading}
                                    className="w-full px-5 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition text-sm"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={loading}
                                    className="w-full px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center justify-center transition text-sm"
                                >
                                    {loading ? (
                                        <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                        </svg>
                                    ) : (
                                        <Save className="h-5 w-5 mr-2" />
                                    )}
                                    Salvar
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="w-full px-5 py-3 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition text-sm"
                            >
                                Editar
                            </button>
                        )}
                    </div>

                    <div className="flex justify-center mt-8">
                        <button
                            onClick={() => setShowConfirmDelete(true)}
                            className="w-full px-5 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 flex items-center justify-center transition text-sm"
                        >
                            <Trash className="h-5 w-5 mr-2" />
                            Excluir Conta
                        </button>
                    </div>
                </div>
            </div>

            {showConfirmDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 shadow-lg w-full max-w-sm">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Tem certeza que deseja excluir sua conta?</h2>
                        <p className="text-sm text-gray-600 mb-6">Essa ação é irreversível.</p>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setShowConfirmDelete(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmDeleteAccount}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Perfil;
