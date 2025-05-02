import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ArrowLeft, Save } from 'lucide-react';
import { getAuth, onAuthStateChanged, updateProfile, User as FirebaseUser, sendPasswordResetEmail } from 'firebase/auth';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const db = getFirestore();
const Storage = getStorage();


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
    const [showPasswordReset, setShowPasswordReset] = useState(false);
    const [resetEmailSent, setResetEmailSent] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [showConfirmResetModal, setShowConfirmResetModal] = useState(false);



    useEffect(() => {
        setAuthLoading(true);
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

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p>Carregando perfil...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-md relative">
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-4 left-4 text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
                    disabled={loading}
                >
                    <ArrowLeft className="inline-block h-4 w-4 mr-1" /> Voltar
                </button>

                <div className="text-center mb-6 pt-6">
                    {photoURL ? (
                        <img src={photoURL} alt="Foto de perfil" className="h-16 w-16 rounded-full mx-auto object-cover mb-2" />
                    ) : (
                        <User className="h-16 w-16 text-blue-600 mx-auto bg-blue-100 p-3 rounded-full mb-2" />
                    )}
                    <h2 className="text-xl font-semibold text-gray-800">Perfil</h2>
                </div>

                <div className="space-y-4">
                    <div>
                        <label htmlFor="displayName" className="text-sm font-medium text-gray-700">Nome</label>
                        <input
                            id="displayName"
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            readOnly={!isEditing}
                            disabled={loading}
                            className={`mt-1 w-full px-3 py-2 rounded-lg border ${isEditing ? 'bg-white border-blue-300' : 'bg-gray-100 border-gray-300 cursor-not-allowed'}`}
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            readOnly={!isEditing}
                            disabled={loading}
                            className={`mt-1 w-full px-3 py-2 rounded-lg border ${isEditing ? 'bg-white border-blue-300' : 'bg-gray-100 border-gray-300 cursor-not-allowed'}`}
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700">Senha</label>
                        {showPasswordReset ? (
                            <div className="mt-1 text-sm text-green-600">
                                Link de redefinição enviado para {email}
                            </div>
                                ) : (
                            <button
                                type="button"
                                onClick={() => setShowConfirmResetModal(true)}
                                disabled={loading || resetEmailSent}
                                className="mt-1 w-full text-left px-3 py-2 rounded-lg bg-gray-100 border border-gray-300 text-blue-600 hover:bg-blue-50 text-sm"
                                >
                                Redefinir senha por e-mail
                             </button>
                              )}
                                {showConfirmResetModal && (
                                    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                                    <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Confirmar redefinição de senha</h3>
                                    <p className="text-sm text-gray-600 mb-4">
                                    Deseja realmente enviar um e-mail para redefinir sua senha? Ao continuar, você concorda com nossos{' '}
                                    <button
    onClick={() => setShowTermsModal(true)}
    className="text-blue-600 hover:underline"
>
    Termos de segurança
</button>

                                    </p>
                                    {showTermsModal && (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 overflow-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full relative">
            <h3 className="text-xl font-semibold text-gray-800 mb-1 text-center">Termos para Redefinição e Criação de Senha</h3>
            <p className="text-xs text-gray-500 text-center mb-4">Última atualização: 29 de abril de 2025</p>

            <div className="space-y-4 text-gray-700 text-sm max-h-[70vh] overflow-y-auto pr-2">
                <section>
                    <h4 className="font-medium text-base mb-1">1. Responsabilidade do Usuário</h4>
                    <p>Você é o único responsável por manter a segurança e a confidencialidade de sua senha. Nunca compartilhe sua senha com terceiros.</p>
                </section>

                <section>
                    <h4 className="font-medium text-base mb-1">2. Requisitos de Senha</h4>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Conter no mínimo <strong>8 caracteres</strong>;</li>
                        <li>Incluir <strong>letras maiúsculas e minúsculas</strong>;</li>
                        <li>Conter pelo menos <strong>um número</strong>;</li>
                        <li>Incluir <strong>um caractere especial</strong> (ex: <code>!@#$%&*</code>);</li>
                    </ul>
                </section>

                <section>
                    <h4 className="font-medium text-base mb-1">3. Boas Práticas de Segurança</h4>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Evite utilizar senhas óbvias como <code>123456</code>, <code>senha</code>, ou datas de aniversário;</li>
                        <li>Não reutilize senhas de outros serviços;</li>
                        <li>Altere sua senha periodicamente;</li>
                        <li>Utilize um gerenciador de senhas confiável.</li>
                    </ul>
                </section>

                <section>
                    <h4 className="font-medium text-base mb-1">4. Acesso Não Autorizado</h4>
                    <p>Caso suspeite de acesso indevido à sua conta, você deve <strong>redefinir sua senha imediatamente</strong> e informar nossa equipe de suporte.</p>
                </section>

                <section>
                    <h4 className="font-medium text-base mb-1">5. Política da Empresa</h4>
                    <p>A redefinição de senha está sujeita à verificação de identidade. Nos reservamos o direito de restringir o acesso em caso de atividade suspeita ou violação destes termos.</p>
                </section>

                <section>
                    <h4 className="font-medium text-base mb-1">📩 Suporte</h4>
                    <p>
                        Se precisar de ajuda, entre em contato com nossa equipe pelo e-mail:{' '}
                        <a href="mailto:suporte@seudominio.com" className="text-blue-600 hover:underline">
                            suporte@seudominio.com
                        </a>
                    </p>
                </section>
            </div>

            <div className="flex justify-end pt-4">
                <button
                    onClick={() => setShowTermsModal(false)}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Fechar
                </button>
            </div>
        </div>
    </div>
)}


                                <div className="flex justify-end space-x-2">
                                    <button
                                    onClick={() => setShowConfirmResetModal(false)}
                                    className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                                    >
                                    Cancelar
                                    </button>
                                    <button
                                    onClick={async () => {
                                    if (!email) {
                                    setError('Email não disponível para redefinir senha.');
                                    setShowConfirmResetModal(false);
                                    return;
                                    }
                                try {
                                    await sendPasswordResetEmail(auth, email);
                                    setShowPasswordReset(true);
                                    setResetEmailSent(true);
                                } catch (err) {
                                console.error("Erro ao enviar email de redefinição:", err);
                                    setError('Erro ao enviar o email de redefinição de senha.');
                                } finally {
                                    setShowConfirmResetModal(false);
                                }
                                }}
                                className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Confirmar
                                    </button>
                                </div>
                            </div>
                        </div>
                        )}

                    </div>

                    {/* {isEditing && (
                        <div>
                            <label htmlFor="photo" className="text-sm font-medium text-gray-700">Foto de perfil</label>
                            <input
                                id="photo"
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        setPhoto(e.target.files[0]);
                                    }
                                }}
                                disabled={loading}
                                className="mt-1 w-full px-3 py-2 rounded-lg border bg-white border-blue-300"
                            />
                        </div>
                    )} */}

                    {error && <p className="text-sm text-red-600 text-center">{error}</p>}

                    <div className="flex justify-end gap-3 pt-4">
                        {isEditing ? (
                            <>
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        setDisplayName(currentUser?.displayName || '');
                                        setEmail(currentUser?.email || '');
                                        setError(null);
                                    }}
                                    disabled={loading}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={loading}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center"
                                >
                                    {loading ? (
                                        <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                        </svg>
                                    ) : (
                                        <Save className="h-4 w-4 mr-2" />
                                    )}
                                    Salvar
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm"
                            >
                                Editar
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Perfil;
