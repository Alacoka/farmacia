import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ArrowLeft, Save, Trash2 } from 'lucide-react';
import { getAuth, onAuthStateChanged, updateProfile, deleteUser } from 'firebase/auth';
import { getFirestore, doc, deleteDoc } from 'firebase/firestore';

const db = getFirestore();

const Perfil: React.FC = () => {
  const navigate = useNavigate();
  const auth = getAuth();

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

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

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSave = async () => {
    if (!currentUser) return setError("Usuário não autenticado.");
    if (!displayName.trim()) return setError("O nome de exibição não pode ficar em branco.");
    if (!isValidEmail(email)) return setError("O e-mail inserido não é válido.");

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

  const handleDeleteAccount = async () => {
    if (!currentUser) {
      console.error("Nenhum usuário autenticado encontrado.");
      return;
    }

    setLoading(true);
    try {
      // Deleta o usuário do Firestore
      const userDocRef = doc(db, 'users', currentUser.uid);
      await deleteDoc(userDocRef);

      // Deleta o usuário da autenticação
      await deleteUser(currentUser);

      // Redireciona o usuário para a tela de login após exclusão
      navigate('/login');
    } catch (err) {
      console.error('Erro ao excluir conta:', err);
      setError('Erro ao excluir a conta. Tente novamente.');
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

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <div className="flex justify-between gap-2 pt-4">
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
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm"
                >
                  Editar
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 text-sm flex items-center"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Excluir conta
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Perfil;
