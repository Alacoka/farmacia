import React, { useState } from 'react';
import { auth, db } from '../firebase'; // Certifique-se de importar o auth e db corretamente
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false); // Para alternar entre login e cadastro
  const [loading, setLoading] = useState(false); // Adicionando um estado de carregamento

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Reseta a mensagem de erro
    setLoading(true); // Define que a operação está carregando

    if (isSignUp) {
      // Verifica se as senhas coincidem
      if (password !== confirmPassword) {
        setError('As senhas não coincidem.');
        setLoading(false); // Finaliza o carregamento
        return;
      }

      try {
        // Realiza o cadastro com o Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log('Cadastro bem-sucedido:', userCredential);

        // Cria um documento na coleção "user" do Firestore
        const user = userCredential.user;
        await setDoc(doc(db, 'user', user.uid), {
          email: email,
          senha: password,
        });

        // Redireciona para a página de login após cadastro bem-sucedido
        setLoading(false);
        navigate('/login'); // Redireciona para a tela de login
      } catch (err) {
        console.error('Erro ao criar conta:', err); // Log do erro para depuração

        if (err instanceof Error) {
          setError(err.message); // Exibe a mensagem de erro específica
        } else {
          setError('Não foi possível criar a conta. Tente novamente.');
        }

        setLoading(false); // Finaliza o carregamento
      }
    } else {
      try {
        // Realiza o login com o Firebase Authentication
        await signInWithEmailAndPassword(auth, email, password);
        console.log('Login bem-sucedido');
        navigate('/'); // Redireciona para a home após login
      } catch (err) {
        console.error('Erro ao fazer login:', err); // Log do erro para depuração
        if (err instanceof Error) {
          setError('E-mail ou senha inválidos. Tente novamente.');
        } else {
          setError('Erro desconhecido. Tente novamente.');
        }
        setLoading(false); // Finaliza o carregamento
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r relative overflow-hidden">
      {/* Fundo animado */}
      <div className="absolute inset-0 animate-gradient bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500"></div>

      {/* Container do Login */}
      <div className="relative z-10 bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          {isSignUp ? 'Crie sua conta' : 'Acesse sua conta'}
        </h2>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="email">
              E-mail
            </label>
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
            <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="password">
              Senha
            </label>
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
              <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="confirmPassword">
                Confirmar Senha
              </label>
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
            disabled={loading} // Desabilita o botão enquanto o processo está em andamento
          >
            {loading ? 'Processando...' : isSignUp ? 'Criar Conta' : 'Entrar'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)} // Alterna entre login e cadastro
            className="text-blue-600 hover:text-blue-800"
          >
            {isSignUp ? 'Já tem uma conta? Faça login' : 'Não tem uma conta? Crie uma'}
          </button>
        </div>
      </div>

      {/* Estilo da animação */}
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
