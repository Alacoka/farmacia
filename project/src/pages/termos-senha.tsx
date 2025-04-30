// src/pages/TermosSenha.tsx
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TermosSenha: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
            <div className="w-full max-w-3xl bg-white p-6 rounded-xl shadow-md relative">
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-4 left-4 text-sm text-blue-600 hover:text-blue-800"
                >
                    <ArrowLeft className="inline-block h-4 w-4 mr-1" /> Voltar
                </button>

                <h1 className="text-2xl font-semibold text-gray-800 text-center mb-4 pt-6">Termos para Redefinição e Criação de Senha</h1>
                <p className="text-sm text-gray-500 text-center mb-8">Última atualização: 29 de abril de 2025</p>

                <div className="space-y-6 text-gray-700 text-sm">
                    <section>
                        <h2 className="font-medium text-base mb-2">1. Responsabilidade do Usuário</h2>
                        <p>
                            Você é o único responsável por manter a segurança e a confidencialidade de sua senha. Nunca compartilhe sua senha com terceiros.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-medium text-base mb-2">2. Requisitos de Senha</h2>
                        <ul className="list-disc list-inside space-y-1">
                            <li>Conter no mínimo <strong>8 caracteres</strong>;</li>
                            <li>Incluir <strong>letras maiúsculas e minúsculas</strong>;</li>
                            <li>Conter pelo menos <strong>um número</strong>;</li>
                            <li>Incluir <strong>um caractere especial</strong> (ex: <code>!@#$%&*</code>);</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="font-medium text-base mb-2">3. Boas Práticas de Segurança</h2>
                        <ul className="list-disc list-inside space-y-1">
                            <li>Evite utilizar senhas óbvias como <code>123456</code>, <code>senha</code>, ou datas de aniversário;</li>
                            <li>Não reutilize senhas de outros serviços;</li>
                            <li>Altere sua senha periodicamente;</li>
                            <li>Utilize um gerenciador de senhas confiável.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="font-medium text-base mb-2">4. Acesso Não Autorizado</h2>
                        <p>
                            Caso suspeite de acesso indevido à sua conta, você deve <strong>redefinir sua senha imediatamente</strong> e informar nossa equipe de suporte.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-medium text-base mb-2">5. Política da Empresa</h2>
                        <p>
                            A redefinição de senha está sujeita à verificação de identidade. Nos reservamos o direito de restringir o acesso em caso de atividade suspeita ou violação destes termos.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-medium text-base mb-2">📩 Suporte</h2>
                        <p>
                            Se precisar de ajuda, entre em contato com nossa equipe pelo e-mail:{" "}
                            <a href="mailto:suporte@seudominio.com" className="text-blue-600 hover:underline">
                                suporte@seudominio.com
                            </a>
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default TermosSenha;
