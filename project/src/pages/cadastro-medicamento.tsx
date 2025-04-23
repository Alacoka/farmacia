import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, PackagePlus, PlusCircle } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from '../firebase';

const CadastroMedicamento: React.FC = () => {
    const navigate = useNavigate();
    const [nome, setNome] = useState<string>('');
    const [dosagem, setDosagem] = useState<string>('');
    const [fabricante, setFabricante] = useState<string>('');
    const [quantidade, setQuantidade] = useState<string>(''); // Keep as string for input, parse on submit
    const [validade, setValidade] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null); // Clear previous errors

        if (!nome || !quantidade || !validade) {
            setError('Preencha pelo menos Nome, Quantidade e Validade.');
            return;
        }
        const quantidadeNum = parseInt(quantidade);
        if (isNaN(quantidadeNum) || quantidadeNum <= 0) {
            setError('Quantidade inicial inválida. Deve ser um número maior que zero.');
            return;
        }

        setLoading(true);
        console.log('Cadastrando medicamento:', { nome, dosagem, fabricante, quantidade: quantidadeNum, validade });

        // --- Firebase Firestore Logic ---
        try {
            // Uncomment and use your actual db instance
            await addDoc(collection(db, "medicamentos"), {
                nome: nome,
                dosagem: dosagem,
                fabricante: fabricante,
                quantidadeEstoque: quantidadeNum, // Use parsed number
                validade: validade, // Store as string (YYYY-MM-DD) or convert to Firebase Timestamp if needed
                dataCadastro: serverTimestamp()
            });

            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            alert('Medicamento cadastrado com sucesso! (Simulado)');
            // Clear form
            setNome('');
            setDosagem('');
            setFabricante('');
            setQuantidade('');
            setValidade('');
            navigate('/home'); // Navigate back home after success

        } catch (err) {
            console.error("Error adding document: ", err);
            setError('Erro ao cadastrar medicamento. Tente novamente.');
        } finally {
            setLoading(false);
        }
        // --- End of Firebase Logic ---
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans">
            <div className="w-full max-w-lg bg-white p-8 rounded-xl shadow-lg border border-gray-200 relative">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)} // Go back to the previous page
                    className="absolute top-4 left-4 flex items-center text-sm text-blue-600 hover:text-blue-800 z-10 disabled:opacity-50"
                    disabled={loading}
                >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Voltar
                </button>

                <div className="text-center mb-8 pt-6">
                    <PackagePlus className="h-12 w-12 mx-auto text-blue-600 mb-2" />
                    <h2 className="text-2xl font-bold text-gray-800">Cadastrar Novo Medicamento</h2>
                    <p className="text-gray-500 text-sm">Insira os detalhes do medicamento.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Nome */}
                    <div>
                        <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">Nome do Medicamento <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            id="nome"
                            value={nome}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNome(e.target.value)}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                            placeholder="Ex: Paracetamol"
                            disabled={loading}
                        />
                    </div>

                    {/* Dosagem */}
                    <div>
                        <label htmlFor="dosagem" className="block text-sm font-medium text-gray-700 mb-1">Dosagem</label>
                        <input
                            type="text"
                            id="dosagem"
                            value={dosagem}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDosagem(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                            placeholder="Ex: 500mg"
                            disabled={loading}
                        />
                    </div>

                    {/* Fabricante */}
                    <div>
                        <label htmlFor="fabricante" className="block text-sm font-medium text-gray-700 mb-1">Fabricante</label>
                        <input
                            type="text"
                            id="fabricante"
                            value={fabricante}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFabricante(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                            placeholder="Ex: Medley"
                            disabled={loading}
                        />
                    </div>

                    {/* Quantidade Inicial */}
                    <div>
                        <label htmlFor="quantidade" className="block text-sm font-medium text-gray-700 mb-1">Quantidade Inicial <span className="text-red-500">*</span></label>
                        <input
                            type="number"
                            id="quantidade"
                            value={quantidade}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuantidade(e.target.value)}
                            required
                            min="1"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                            placeholder="Ex: 50"
                            disabled={loading}
                        />
                    </div>

                    {/* Validade */}
                    <div>
                        <label htmlFor="validade" className="block text-sm font-medium text-gray-700 mb-1">Data de Validade <span className="text-red-500">*</span></label>
                        <input
                            type="date"
                            id="validade"
                            value={validade}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValidade(e.target.value)}
                            required
                            // Optional: Set min date to today
                            min={new Date().toISOString().split("T")[0]}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                            disabled={loading}
                        />
                    </div>

                    {/* Error Message */}
                    {error && (
                        <p className="text-sm text-red-600 text-center">{error}</p>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full flex justify-center items-center py-3 px-4 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Cadastrando...
                            </>
                        ) : (
                            <>
                                <PlusCircle className="h-5 w-5 mr-2" />
                                Cadastrar Medicamento
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CadastroMedicamento;
