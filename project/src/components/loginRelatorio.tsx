// src/components/loginRelatorio.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Lock, FileText, ArrowLeft } from 'lucide-react';

const LoginRelatorio: React.FC = () => {
    const navigate = useNavigate();
    const [senhaInput, setSenhaInput] = useState('');
    const [erro, setErro] = useState('');

    const verificarSenha = async () => {
        try {
            const snapshot = await getDocs(collection(db, 'senhaRelatorio'));
            const senhas = snapshot.docs.map(doc => doc.data().senha);

            if (senhas.includes(senhaInput)) {
                navigate('/relatorios');
            } else {
                setErro('Senha incorreta. Tente novamente.');
            }
        } catch (error) {
            console.error('Erro ao verificar senha:', error);
            setErro('Erro ao verificar senha. Tente novamente mais tarde.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white px-4">
            <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8 border border-gray-200 relative">

                {/* Botão de Voltar */}
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-4 left-4 text-sm text-blue-600 hover:text-blue-800 flex items-center"
                >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Voltar
                </button>

                <div className="text-center mb-6 pt-4">
                    <FileText className="h-10 w-10 text-indigo-600 mx-auto mb-2" />
                    <h2 className="text-2xl font-bold text-gray-800">Acesso ao Relatório</h2>
                    <p className="text-gray-500 text-sm">Digite a senha para visualizar os relatórios</p>
                </div>

                <div className="mb-4">
                    <label htmlFor="senha" className="block text-sm font-medium text-gray-700 mb-1">
                        Senha
                    </label>
                    <div className="relative">
                        <input
                            id="senha"
                            type="password"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Digite a senha"
                            value={senhaInput}
                            onChange={(e) => {
                                setSenhaInput(e.target.value);
                                setErro('');
                            }}
                        />
                        <Lock className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                    {erro && <p className="mt-2 text-sm text-red-600">{erro}</p>}
                </div>

                <button
                    onClick={verificarSenha}
                    className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-md transition-colors"
                >
                    Ver Relatório
                </button>
            </div>
        </div>
    );
};

export default LoginRelatorio;
