import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ArrowLeft, Save } from 'lucide-react';
import {
  getAuth,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser,
  deleteUser
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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageModalText, setMessageModalText] = useState('');

  const [accountDeleted, setAccountDeleted] = useState(false); // NOVO

  useEffect(() => {
    setAuthLoading(true);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        setDisplayName(user.displayName || '');
        setEmail(user.email || '');
        setPhotoURL(user.photoURL || '');
      } else {
        // Evita redirecionamento se conta foi excluída
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

    try {
      await updateProfile(currentUser, { displayName });
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, { displayName });
      setIsEditing(false);
      setSuccessMessage('Perfil atualizado com sucesso!');
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
      setError('Erro ao salvar as alterações.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!currentUser) return;
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      setAccountDeleted(true); // IMPORTANTE: evitar redirecionamento automático
      await deleteUser(currentUser);
      setShowDeleteModal(false);

      setMessageModalText('✅ Conta excluída com sucesso!');
      setShowMessageModal(true);
      setLoading(false);
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
              className={`mt-1 w-full px-3 py-2 rounded-lg border ${
                isEditing
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

          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
          {successMessage && <p className="text-sm text-green-600 mt-2">{successMessage}</p>}

          {isEditing ? (
            <button
              onClick={handleSave}
              disabled={loading}
              className="mt-4 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center justify-center"
            >
              <Save className="mr-2 h-4 w-4" /> Salvar
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              disabled={loading}
              className="mt-4 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              Editar Perfil
            </button>
          )}

          <button
            onClick={() => setShowDeleteModal(true)}
            disabled={loading}
            className="mt-4 w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
          >
            Excluir Conta
          </button>
        </div>

        {/* Modal de confirmação exclusão */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirmação de exclusão</h3>
              <p className="mb-6">Tem certeza que deseja excluir sua conta? Esta ação é irreversível.</p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={loading}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 text-gray-700"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 text-white"
                >
                  {loading ? 'Excluindo...' : 'Excluir Conta'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de mensagem pós exclusão */}
        {showMessageModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg text-center">
              <p className="mb-6">{messageModalText}</p>
              <button
                onClick={handleCloseMessageModal}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
