import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, signOut, updateProfile } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { FirebaseError } from 'firebase/app';
import { FiEye, FiEyeOff, FiUser, FiKey, FiLogIn } from 'react-icons/fi';

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);



  const clearFields = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResetMessage('');
    setLoading(true);

    if (isSignUp) {
      if (!name.trim()) {
        setError('O nome é obrigatório.');
        setLoading(false);
        return;
      }
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%&*])[A-Za-z\d!@#$%&*]{8,}$/;

if (!passwordRegex.test(password)) {
  setError('A senha deve conter no mínimo 8 caracteres, incluindo letra maiúscula, minúscula, número e caractere especial.');
  setLoading(false);
  return;
}


      if (password !== confirmPassword) {
        setError('As senhas não coincidem.');
        setLoading(false);
        return;
      }

      try {
        const normalizedEmail = email.trim().toLowerCase();
        const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
        const user = userCredential.user;

        // Opcional: Enviar verificação de e-mail
        // await user.sendEmailVerification();

        await updateProfile(user, {
          displayName: name,
        });

        await setDoc(doc(db, 'users', user.uid), {
          email: normalizedEmail,
          nome: name,
          createdAt: new Date(),
        });

        setShowSuccessSplash(true);
        clearFields();
        await signOut(auth);

        setTimeout(() => {
          setShowSuccessSplash(false);
          setLoading(false);
          setIsSignUp(false);
          navigate('/home');
        }, 2000);
      } catch (err) {
        if (err instanceof FirebaseError && err.code === 'auth/email-already-in-use') {
          setError('Este e-mail já está em uso. Tente fazer login ou redefinir a senha.');
        } else {
          setError('Não foi possível criar a conta. Tente novamente.');
        }
        setLoading(false);
      }
    } else {
      try {
        const normalizedEmail = email.trim().toLowerCase();
        const userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password);

        // Opcional: Verificar e-mail
        // if (!userCredential.user.emailVerified) {
        //   await signOut(auth);
        //   setError('Confirme seu e-mail antes de acessar.');
        //   setLoading(false);
        //   return;
        // }

        clearFields();
        navigate('/');
      } catch {
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
    } catch {
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
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                    <input
                      id="name"
                      type="text"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                      placeholder="Digite seu nome"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                  <input
                    id="email"
                    type="email"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    placeholder="Digite seu e-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="relative">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className="w-full px-4 py-2 border rounded-lg pr-10 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>

                {isSignUp && (
                  <div className="relative">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirmar Senha</label>
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="w-full px-4 py-2 border rounded-lg pr-10 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                      placeholder="Confirme sua senha"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'Processando...' : isSignUp ? 'Criar Conta' : 'Entrar'}
                </button>
                {isSignUp && (
<div>
  <p className="text-xs text-gray-600 text-center mt-2">
    Ao criar uma conta, você concorda com os{' '}
    <button
      type="button"
      onClick={() => setShowTermsModal(true)}
      className="text-blue-600 hover:underline"
    >
      Termos de uso da senha
    </button>
  </p>
  <p className="text-xs text-gray-600 text-center mt-2">
    <a
      href="https://drive.google.com/file/d/1Bu-XPALdXOF1D5ht0knZ4SdpTnP05IaK/view?usp=drive_link"
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 hover:underline"
    >
      Leia também nossa Política de Privacidade
    </a>
  </p>
</div>

)}
{showTermsModal && (
  <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
    <div className="bg-white max-w-2xl w-full p-6 rounded-lg shadow-lg overflow-y-auto max-h-[90vh] relative">
      <button
        onClick={() => setShowTermsModal(false)}
        className="absolute top-3 right-3 text-gray-600 hover:text-gray-800"
      >
        ✕
      </button>
      <h2 className="text-xl font-semibold mb-2 text-center">Termos para Redefinição e Criação de Senha</h2>
      <p className="text-sm text-center text-gray-500 mb-4">Última atualização: 29 de abril de 2025</p>
      <div className="space-y-4 text-sm text-gray-700">
        <section>
          <h3 className="font-medium">1. Responsabilidade do Usuário</h3>
          <p>Você é o único responsável por manter a segurança e a confidencialidade de sua senha.</p>
        </section>
        <section>
          <h3 className="font-medium">2. Requisitos de Senha</h3>
          <ul className="list-disc list-inside">
            <li>Mínimo de 8 caracteres</li>
            <li>Letras maiúsculas e minúsculas</li>
            <li>Pelo menos um número</li>
            <li>Um caractere especial (ex: !@#$%&*)</li>
          </ul>
        </section>
        <section>
          <h3 className="font-medium">3. Boas Práticas</h3>
          <ul className="list-disc list-inside">
            <li>Evite senhas óbvias</li>
            <li>Não reutilize senhas</li>
            <li>Troque senhas regularmente</li>
            <li>Use um gerenciador de senhas</li>
          </ul>
        </section>
        <section>
          <h3 className="font-medium">4. Acesso Não Autorizado</h3>
          <p>Se suspeitar de acesso indevido, redefina sua senha e informe o suporte.</p>
        </section>
        <section>
          <h3 className="font-medium">5. Política da Empresa</h3>
          <p>Redefinições exigem verificação de identidade e podem restringir acesso em caso de suspeita.</p>
        </section>
        <section>
          <h3 className="font-medium">📩 Suporte</h3>
          <p>
            Dúvidas? Contate: <a href="mailto:suporte@seudominio.com" className="text-blue-600 hover:underline">suporte@seudominio.com</a>
          </p>
        </section>
      </div>
    </div>
  </div>
)}

              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <label htmlFor="emailReset" className="block text-sm font-medium text-gray-700 mb-1">Digite seu e-mail</label>
                  <input
                    id="emailReset"
                    type="email"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
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
              <div className="mt-6 space-y-2 text-sm text-left text-gray-700">
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsResettingPassword(true);
                      setError('');
                      setResetMessage('');
                    }}
                    className="text-blue-500 hover:underline flex items-center justify-start gap-1"
                  >
                    <FiKey size={14} /> Esqueci minha senha
                  </button>
                )}

                <div className="flex justify-start">
                  {isSignUp ? (
                    <>
                      <button
                        onClick={() => {
                          setIsSignUp(false);
                          setError('');
                          setResetMessage('');
                        }}
                        className="text-blue-500 hover:underline flex items-center gap-1"
                      >
                        <FiLogIn size={14} /> Faça login
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setIsSignUp(true);
                        setError('');
                        setResetMessage('');
                      }}
                      className="text-blue-500 hover:underline flex items-center gap-1"
                    >
                      <FiUser size={14} /> Crie sua conta
                    </button>
                  )}
                </div>
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
