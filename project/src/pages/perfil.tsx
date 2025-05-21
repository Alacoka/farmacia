import React, { useState, useEffect, useRef } from 'react';
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
import { motion } from 'framer-motion';

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

  // For accessibility: focus first button in modal
  const messageModalOkRef = useRef<HTMLButtonElement>(null);
  const deleteModalCancelRef = useRef<HTMLButtonElement>(null);

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

  useEffect(() => {
    if (showMessageModal) {
      messageModalOkRef.current?.focus();
    }
  }, [showMessageModal]);

  useEffect(() => {
    if (showDeleteModal) {
      deleteModalCancelRef.current?.focus();
    }
  }, [showDeleteModal]);

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Checa se houve alguma alteração pra habilitar botão salvar
  const hasChanges =
    displayName !== (currentUser?.displayName || '') ||
    (newPhotoFile !== null);

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

  // Skeleton Loader simples
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-md">
          <div className="animate-pulse space-y-4">
            <div className="h-20 w-20 rounded-full bg-gray-300 mx-auto" />
            <div className="h-6 bg-gray-300 rounded w-3/4 mx-auto" />
            <div className="h-10 bg-gray-300 rounded" />
            <div className="h-10 bg-gray-300 rounded" />
            <div className="h-10 bg-gray-300 rounded" />
          </div>
        </div>
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
          aria-label="Voltar"
        >
          <ArrowLeft className="inline-block h-4 w-4 mr-1" /> Voltar
        </button>

        <div className="text-center mb-6 pt-6">
          <div className="h-20 w-20 mx-auto rounded-full overflow-hidden bg-blue-100 flex items-center justify-center shadow-inner border-2 border-blue-300 relative">
            {photoURL ? (
              <img
                src={photoURL}
                alt="Foto de perfil"
                onError={() => setPhotoURL('')}
                className="h-full w-full object-cover"
              />
            ) : (
              <User className="h-10 w-10 text-blue-600" />
            )}
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mt-3">Perfil</h2>
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
              className={`mt-1 w-full px-3 py-2 rounded-lg border ${isEditing ? 'bg-white border-blue-300' : 'bg-gray-100 border-gray-300 cursor-not-allowed'
                }`}
              aria-label="Nome de exibição"
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
              aria-label="Email"
            />
          </div>

          {/* Preview foto maior + remover antes de salvar */}
          {isEditing && (
            <div className="mt-4 flex flex-col items-center">
              {photoURL && (
                <div className="relative w-24 h-24 rounded-full overflow-hidden mb-2 border border-gray-300">
                  <img src={photoURL} alt="Preview da foto" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setNewPhotoFile(null);
                      setPhotoURL('');
                    }}
                    className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-1 text-xs hover:bg-red-700 transition"
                    aria-label="Remover foto selecionada"
                  >
                    ×
                  </button>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setNewPhotoFile(e.target.files[0]);
                    setPhotoURL(URL.createObjectURL(e.target.files[0]));
                  }
                }}
                disabled={loading}
                className="text-sm text-gray-700"
                aria-label="Selecionar nova foto de perfil"
              />
            </div>
          )}

          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
          {successMessage && <p className="text-sm text-green-600 mt-2">{successMessage}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            {isEditing ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSave}
                  disabled={loading || !hasChanges}
                  className={`py-2 px-4 rounded-xl text-sm flex items-center justify-center transition shadow-md ${!hasChanges || loading
                    ? 'bg-gray-400 cursor-not-allowed text-gray-700'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  aria-disabled={loading || !hasChanges}
                  aria-label="Salvar alterações do perfil"
                >
                  <Save className="mr-2 h-4 w-4" /> {loading ? 'Salvando...' : 'Salvar'}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setDisplayName(currentUser?.displayName || '');
                    setPhotoURL(currentUser?.photoURL || '');
                    setNewPhotoFile(null);
                    setError(null);
                    setSuccessMessage(null);
                    setIsEditing(false);
                  }}
                  disabled={loading}
                  className="py-2 px-4 rounded-xl shadow-md bg-gray-300 hover:bg-gray-400 text-gray-800 transition text-sm"
                  aria-label="Cancelar edição do perfil"
                >
                  Cancelar
                </motion.button>
              </>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditing(true)}
                disabled={loading}
                className="py-2 px-4 border border-blue-500 text-blue-600 rounded-xl hover:bg-blue-50 transition text-sm"
                aria-label="Editar perfil"
              >
                Editar Perfil
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleResetPassword}
              disabled={loading}
              className="py-2 px-4 border border-yellow-500 text-yellow-600 rounded-xl hover:bg-yellow-50 transition text-sm flex items-center justify-center"
              aria-label="Redefinir senha"
            >
              <KeyRound className="mr-2 h-4 w-4" />
              Redefinir Senha
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowDeleteModal(true)}
              disabled={loading}
              className="py-2 px-4 border border-red-500 text-red-600 rounded-xl hover:bg-red-50 transition text-sm"
              aria-label="Excluir conta"
            >
              Excluir Conta
            </motion.button>
          </div>
        </div>
      </div>

      {/* Modal mensagem */}
      {showMessageModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modalTitle"
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4"
          onClick={handleCloseMessageModal}
        >
          <div
            className="bg-white rounded-xl p-6 max-w-sm w-full shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="modalTitle" className="text-lg font-semibold mb-4">
              Mensagem
            </h3>
            <p className="mb-6">{messageModalText}</p>
            <button
              ref={messageModalOkRef}
              onClick={handleCloseMessageModal}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              aria-label="Fechar mensagem"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Modal excluir conta */}
      {showDeleteModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="deleteModalTitle"
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="bg-white rounded-xl p-6 max-w-sm w-full shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="deleteModalTitle" className="text-lg font-semibold mb-4 text-red-600">
              Confirmar Exclusão
            </h3>
            <p className="mb-6">
              Tem certeza que deseja excluir sua conta? Essa ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-3">
              <button
                ref={deleteModalCancelRef}
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
                aria-label="Cancelar exclusão"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={loading}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                aria-label="Confirmar exclusão da conta"
              >
                {loading ? 'Excluindo...' : 'Excluir Conta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Perfil;
