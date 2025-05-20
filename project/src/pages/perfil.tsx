import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ArrowLeft, Save, KeyRound } from 'lucide-react';
import {
  getAuth,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  deleteUser,
  User as FirebaseUser
} from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const db = getFirestore();

const Perfil: React.FC = () => {
  const navigate = useNavigate();
  const auth = getAuth();

  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [newPhotoFile, setNewPhotoFile] = useState<File | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageModalText, setMessageModalText] = useState('');
  const [accountDeleted, setAccountDeleted] = useState(false);

  useEffect(() => {
    setAuthLoading(true);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        setDisplayName(user.displayName || '');
        setEmail(user.email || '');
        setPhotoURL(user.photoURL || '');
      } else {
        if (!accountDeleted) {
          navigate('/login');
        }
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, [auth, navigate, accountDeleted]);

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSave = async () => {
    if (!currentUser) {
      setError('Usuário não autenticado.');
      return;
    }
    if (!displayName.trim()) {
      setError('O nome de exibição não pode ficar em branco.');
      return;
    }
    if (!isValidEmail(email)) {
      setError('O e-mail inserido não é válido.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      let updatedPhotoURL = photoURL;

      if (newPhotoFile) {
        updatedPhotoURL = URL.createObjectURL(newPhotoFile);
      }

      await updateProfile(currentUser, { displayName, photoURL: updatedPhotoURL });

      const userDocRef = doc(db, 'users', currentUser.uid);
      await setDoc(userDocRef, { displayName, photoURL: updatedPhotoURL }, { merge: true });

      setPhotoURL(updatedPhotoURL);
      setNewPhotoFile(null);
      setIsEditing(false);
      setSuccessMessage('Perfil atualizado com sucesso!');
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
      setError('Erro ao salvar as alterações.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) return;
    try {
      await sendPasswordResetEmail(auth, email);
      setMessageModalText('🔐 Link de redefinição de senha enviado para seu e-mail.');
      setShowMessageModal(true);
    } catch (error: any) {
      console.error('Erro ao enviar e-mail de redefinição:', error);
      setMessageModalText('❌ Não foi possível enviar o e-mail de redefinição.');
      setShowMessageModal(true);
    }
  };

  const handleDeleteAccount = async () => {
    if (!currentUser) return;
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      setAccountDeleted(true);
      await deleteUser(currentUser);
      setShowDeleteModal(false);

      setMessageModalText('✅ Conta excluída com sucesso!');
      setShowMessageModal(true);
    } catch (error: any) {
      console.error('Erro ao excluir conta:', error);
      let errorMessage = 'Não foi possível excluir a conta.';
      if (error.code === 'auth/requires-recent-login') {
        errorMessage = 'Por segurança, faça login novamente para excluir sua conta.';
      }

      setShowDeleteModal(false);
      setMessageModalText(`❌ Erro ao excluir a conta: ${errorMessage}`);
      setShowMessageModal(true);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseMessageModal = () => {
    setShowMessageModal(false);
    if (messageModalText.includes('sucesso')) {
      navigate('/login');
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
            <img
              src={photoURL}
              alt="Foto de perfil"
              className="h-16 w-16 rounded-full mx-auto object-cover mb-2"
            />
          ) : (
            <User className="h-16 w-16 text-blue-600 mx-auto bg-blue-100 p-3 rounded-full mb-2" />
          )}
          <h2 className="text-xl font-semibold text-gray-800">Perfil</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="displayName" className="text-sm font-medium text-gray-700">
              Nome
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              readOnly={!isEditing}
              disabled={loading}
              className={`mt-1 w-full px-3 py-2 rounded-lg border ${isEditing
                ? 'bg-white border-blue-300'
                : 'bg-gray-100 border-gray-300 cursor-not-allowed'
                }`}
            />
          </div>

          <div>
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              readOnly
              disabled
              className="mt-1 w-full px-3 py-2 rounded-lg border bg-gray-100 border-gray-300 cursor-not-allowed"
            />
          </div>

          {isEditing && (
            <div>
              <label htmlFor="photoUpload" className="text-sm font-medium text-gray-700 block mb-1">
                Alterar foto de perfil
              </label>
              <input
                type="file"
                id="photoUpload"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setNewPhotoFile(e.target.files[0]);
                    setPhotoURL(URL.createObjectURL(e.target.files[0]));
                  }
                }}
                disabled={loading}
                className="mt-1 w-full text-sm text-gray-700"
              />
            </div>
          )}

          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
          {successMessage && <p className="text-sm text-green-600 mt-2">{successMessage}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            {isEditing ? (
              <button
                onClick={handleSave}
                disabled={loading}
                className="py-2 px-4 border border-blue-500 text-blue-600 rounded-xl hover:bg-blue-50 transition text-sm flex items-center justify-center"
              >
                <Save className="mr-2 h-4 w-4" /> {loading ? 'Salvando...' : 'Salvar'}
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                disabled={loading}
                className="py-2 px-4 border border-blue-500 text-blue-600 rounded-xl hover:bg-blue-50 transition text-sm"
              >
                Editar Perfil
              </button>
            )}

            <button
              onClick={handleResetPassword}
              disabled={loading}
              className="py-2 px-4 border border-yellow-500 text-yellow-600 rounded-xl hover:bg-yellow-50 transition text-sm flex items-center justify-center"
            >
              <KeyRound className="mr-2 h-4 w-4" />
              Redefinir Senha
            </button>

            <button
              onClick={() => setShowDeleteModal(true)}
              disabled={loading}
              className="py-2 px-4 border border-red-500 text-red-600 rounded-xl hover:bg-red-50 transition text-sm col-span-1 sm:col-span-2"
            >
              Excluir Conta
            </button>
          </div>
        </div>

        {/* Modal de confirmação de exclusão */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Excluir Conta</h3>
              <p className="text-sm text-gray-600 mb-6">
                Tem certeza que deseja excluir sua conta? Essa ação é irreversível.
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                  disabled={loading}
                >
                  {loading ? 'Excluindo...' : 'Excluir'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de mensagens de feedback */}
        {showMessageModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl text-center">
              <p className="text-gray-800 mb-6">{messageModalText}</p>
              <button
                onClick={handleCloseMessageModal}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                OK
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Perfil;
