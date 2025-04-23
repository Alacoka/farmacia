import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ArrowLeft, Save } from 'lucide-react';
import { getAuth, onAuthStateChanged, updateProfile, User as FirebaseUser, sendPasswordResetEmail } from 'firebase/auth';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const db = getFirestore();
const storage = getStorage();

const Perfil: React.FC = () => {
    const navigate = useNavigate();
    const auth = getAuth();

    const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [photo, setPhoto] = useState<File | null>(null);
    const [photoURL, setPhotoURL] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [showPasswordReset, setShowPasswordReset] = useState(false);
    const [resetEmailSent, setResetEmailSent] = useState(false);

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
            let newPhotoURL = photoURL;
            if (photo) {
                if (!photo.type.startsWith("image/")) {
                    throw new Error("Arquivo selecionado não é uma imagem.");
                }
                const photoRef = ref(storage, `profilePictures/${currentUser.uid}`);
                await uploadBytes(photoRef, photo);
                newPhotoURL = await getDownloadURL(photoRef);
            }

            await updateProfile(currentUser, {
                displayName: displayName.trim(),
                photoURL: newPhotoURL,
            });

            const userDocRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userDocRef, {
                displayName: displayName.trim(),
                email: email.trim(),
                photoURL: newPhotoURL,
            });

            setPhotoURL(newPhotoURL);
            setIsEditing(false);
            setPhoto(null); // limpa foto selecionada após salvar
        } catch (err) {
            console.error("Erro ao atualizar perfil: ", err);
            setError('Erro ao atualizar o perfil.');
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
                                onClick={async () => {
                                    if (!email) {
                                        setError('Email não disponível para redefinir senha.');
                                        return;
                                    }
                                    try {
                                        await sendPasswordResetEmail(auth, email);
                                        setShowPasswordReset(true);
                                        setResetEmailSent(true);
                                    } catch (err) {
                                        console.error("Erro ao enviar email de redefinição:", err);
                                        setError('Erro ao enviar o email de redefinição de senha.');
                                    }
                                }}
                                disabled={loading || resetEmailSent}
                                className="mt-1 w-full text-left px-3 py-2 rounded-lg bg-gray-100 border border-gray-300 text-blue-600 hover:bg-blue-50 text-sm"
                            >
                                Redefinir senha por e-mail
                            </button>
                        )}
                    </div>

                    {isEditing && (
                        <div>
                            <label htmlFor="photo" className="text-sm font-medium text-gray-700">Nova Foto</label>
                            <input
                                id="photo"
                                type="file"
                                accept="image/*"
                                onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                                disabled={loading}
                                className="mt-1 block w-full text-sm file:py-2 file:px-4 file:border file:rounded-lg file:bg-gray-100 hover:file:bg-gray-200"
                            />
                        </div>
                    )}

                    {error && <p className="text-sm text-red-600 text-center">{error}</p>}

                    <div className="flex justify-end gap-3 pt-4">
                        {isEditing ? (
                            <>
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        setDisplayName(currentUser?.displayName || '');
                                        setEmail(currentUser?.email || '');
                                        setPhoto(null);
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
