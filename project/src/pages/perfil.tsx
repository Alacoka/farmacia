import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ArrowLeft, Save } from 'lucide-react';
import { getAuth, onAuthStateChanged, updateProfile, User as FirebaseUser } from 'firebase/auth';
// No need to import firebase config directly if only using auth

const Perfil: React.FC = () => {
    const navigate = useNavigate();
    const auth = getAuth(); // Get Firebase auth instance

    const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
    const [displayName, setDisplayName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false); // Loading state for profile update
    const [error, setError] = useState<string | null>(null);
    const [authLoading, setAuthLoading] = useState<boolean>(true); // Loading state for initial auth check

    useEffect(() => {
        setAuthLoading(true);
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setCurrentUser(user);
                setDisplayName(user.displayName || ''); // Use empty string if null
                setEmail(user.email || 'Email não disponível');
            } else {
                // User not logged in, redirect to login
                navigate('/login');
            }
             setAuthLoading(false); // Auth check finished
        });
        return () => unsubscribe(); // Cleanup listener on unmount
    }, [auth, navigate]);

    const handleSave = async () => {
        if (!currentUser) {
            setError("Usuário não autenticado.");
            return;
        }
        if (!displayName.trim()) {
            setError("O nome de exibição não pode ficar em branco.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await updateProfile(currentUser, {
                displayName: displayName.trim() // Trim whitespace
            });
            alert('Perfil atualizado com sucesso!');
            setIsEditing(false); // Exit editing mode
        } catch (err) {
            console.error("Erro ao atualizar perfil: ", err);
            setError('Erro ao atualizar o perfil. Tente novamente.');
        } finally {
             setLoading(false);
        }
    };

    // Display loading indicator while checking auth state
    if (authLoading) {
         return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p>Carregando perfil...</p> {/* Or use a spinner component */}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-200 relative">
                 {/* Back Button */}
                 <button
                    onClick={() => navigate(-1)}
                    className="absolute top-4 left-4 flex items-center text-sm text-blue-600 hover:text-blue-800 z-10 disabled:opacity-50"
                    disabled={loading}
                >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Voltar
                </button>

                <div className="text-center mb-8 pt-6">
                    <User className="h-16 w-16 mx-auto text-blue-600 mb-3 p-3 bg-blue-100 rounded-full" />
                    <h2 className="text-2xl font-bold text-gray-800">Perfil do Usuário</h2>
                    <p className="text-gray-500 text-sm">Gerencie suas informações.</p>
                </div>

                <div className="space-y-5">
                    {/* Display Name */}
                    <div>
                        <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">Nome de Exibição</label>
                        <input
                            type="text"
                            id="displayName"
                            value={displayName}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDisplayName(e.target.value)}
                            readOnly={!isEditing || loading}
                            className={`w-full px-4 py-2 border rounded-lg ${isEditing ? 'border-blue-300 focus:ring-blue-500 focus:border-blue-500 bg-white' : 'border-gray-300 bg-gray-100 cursor-not-allowed'} disabled:opacity-70`}
                            disabled={loading}
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            readOnly // Email is not editable via updateProfile
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                        />
                    </div>

                     {/* Error Message */}
                     {error && (
                        <p className="text-sm text-red-600 text-center">{error}</p>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4">
                        {isEditing ? (
                            <>
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        // Reset display name to original value if cancelled
                                        setDisplayName(currentUser?.displayName || '');
                                        setError(null); // Clear error on cancel
                                    }}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium disabled:opacity-50"
                                    disabled={loading}
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="px-4 py-2 flex items-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={loading}
                                >
                                    {loading ? (
                                         <>
                                            <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">...</svg>
                                            Salvando...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4 mr-1.5" />
                                            Salvar Alterações
                                        </>
                                    )}
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm font-medium"
                            >
                                Editar Nome
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Perfil;
