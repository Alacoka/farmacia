import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, signOut, } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { FirebaseError } from 'firebase/app';

const Login = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccessSplash, setShowSuccessSplash] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResetMessage('');
    setLoading(true);

    if (isSignUp) {
      if (password !== confirmPassword) {
        setError('As senhas não coincidem.');
        setLoading(false);
        return;
      }

      try {
        const normalizedEmail = email.trim().toLowerCase();
        const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
        const user = userCredential.user;
        await setDoc(doc(db, 'users', user.uid), {
          email: normalizedEmail,
          senha: password,
          nome: name,
          createdAt: new Date(),
        });

        setShowSuccessSplash(true);
        await signOut(auth);

        // Redireciona automaticamente para login após splash
        setTimeout(() => {
          setShowSuccessSplash(false);
          setLoading(false);
          setIsSignUp(false);
          console.log('Bem vindo(a),', name);
          navigate('/home');
        }, 2000);
      } catch (err) {
        console.error('Erro ao criar conta:', err);
        if (err instanceof FirebaseError) {
          if (err.code === 'auth/email-already-in-use') {
            setError('Este e-mail já está em uso. Tente fazer login ou redefinir a senha.');
          } else {
            setError(err.message);
          }
        } else {
          setError('Não foi possível criar a conta. Tente novamente.');
        }
        setLoading(false);
      }
    } else {
      try {
        const normalizedEmail = email.trim().toLowerCase();
        await signInWithEmailAndPassword(auth, normalizedEmail, password);
        console.log('Login bem-sucedido');
        navigate('/');
      } catch (err) {
        console.error('Erro ao fazer login:', err);
        setError('E-mail ou senha inválidos. Tente novamente.');
        setLoading(false);
      }
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError('Digite seu e-mail para redefinir a senha.');
      return;
    }
    try {
      const normalizedEmail = email.trim().toLowerCase();
      await sendPasswordResetEmail(auth, normalizedEmail);
      setResetMessage('E-mail de redefinição enviado com sucesso.');
      setIsResettingPassword(false);
    } catch (error) {
      console.error('Erro ao enviar e-mail de redefinição:', error);
      setError('Erro ao enviar e-mail de redefinição.');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r relative overflow-hidden">
      <div className="absolute inset-0 animate-gradient bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500"></div>

      <div className="relative z-10 bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        {showSuccessSplash ? (
          <h2 className="text-xl font-semibold text-green-600 text-center">Usuário cadastrado com sucesso!</h2>
        ) : (
          <>
            <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
              {isSignUp ? 'Crie sua conta' : isResettingPassword ? 'Redefinir Senha' : 'Acesse sua conta'}
            </h2>

            {error && <p className="text-red-500 text-center mb-4">{error}</p>}
            {resetMessage && <p className="text-green-600 text-center mb-4">{resetMessage}</p>}

            {!isResettingPassword ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="name">Nome</label>
                    <input
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                      id="name"
                      type="text"
                      placeholder="Digite seu nome"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                )}
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="email">E-mail</label>
                  <input
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    id="email"
                    type="email"
                    placeholder="Digite seu e-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="password">Senha</label>
                  <input
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    id="password"
                    type="password"
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                {isSignUp && (
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="confirmPassword">Confirmar Senha</label>
                    <input
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirme sua senha"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                )}

                <button
                  className={`w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Processando...' : isSignUp ? 'Criar Conta' : 'Entrar'}
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="email">Digite seu e-mail para redefinir a senha</label>
                  <input
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    id="email"
                    type="email"
                    placeholder="Digite seu e-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <button
                  onClick={handleResetPassword}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300"
                >
                  Enviar redefinição
                </button>
                <button
                  onClick={() => {
                    setIsResettingPassword(false);
                    setError('');
                    setResetMessage('');
                  }}
                  className="w-full text-blue-600 hover:underline text-sm"
                >
                  Voltar para o login
                </button>
              </div>
            )}

            {!isResettingPassword && (
              <div className="mt-4 flex justify-center gap-4 text-sm text-center">
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsResettingPassword(true);
                      setError('');
                      setResetMessage('');
                    }}
                    className="text-blue-600 hover:underline"
                  >
                    Esqueci minha senha
                  </button>
                )}
                <button
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError('');
                    setResetMessage('');
                  }}
                  className="text-blue-600 hover:underline"
                >
                  {isSignUp ? 'Já tem uma conta? Faça login' : 'Não tem uma conta? Crie uma'}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <style>
        {`
          @keyframes gradientAnimation {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }

          .animate-gradient {
            background-size: 300% 300%;
            animation: gradientAnimation 8s ease infinite;
          }
        `}
      </style>
    </div>
  );
};

export default Login;
