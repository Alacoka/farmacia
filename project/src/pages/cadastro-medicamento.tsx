// ...importações permanecem iguais
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, PackagePlus, PlusCircle } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from '../firebase';

const CadastroMedicamento: React.FC = () => {
    const navigate = useNavigate();

    const [nome, setNome] = useState<string>('');
    const [principioAtivo, setPrincipioAtivo] = useState<string>(''); // Novo
    const [concentracao, setConcentracao] = useState<string>('');     // Novo
    const [nomeComercial, setNomeComercial] = useState<string>('');   // Novo
    const [formaFarmaceutica, setFormaFarmaceutica] = useState<string>(''); // Novo
    const [dosagem, setDosagem] = useState<string>('');
    const [fabricante, setFabricante] = useState<string>('');
    const [quantidade, setQuantidade] = useState<string>('');
    const [validade, setValidade] = useState<string>('');
    const [lote, setLote] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [showSplash, setShowSplash] = useState<boolean>(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        if (!nome || !quantidade) {
            setError('Preencha pelo menos Nome, Quantidade e Validade.');
            return;
        }

        const quantidadeNum = parseInt(quantidade);
        if (isNaN(quantidadeNum) || quantidadeNum <= 0) {
            setError('Quantidade inicial inválida. Deve ser um número maior que zero.');
            return;
        }

        setShowSplash(true);
        setTimeout(() => {
            setShowSplash(false);
            navigate('/home');
        }, 2000);

        setLoading(true);

        try {
            await addDoc(collection(db, "medicamentos"), {
                nome,
                principioAtivo,
                concentracao,
                nomeComercial,
                formaFarmaceutica,
                dosagem,
                quantidadeEstoque: quantidadeNum,
                validade,
                dataCadastro: serverTimestamp()
            });

            await new Promise(resolve => setTimeout(resolve, 1000));

            setNome('');
            setPrincipioAtivo('');
            setConcentracao('');
            setNomeComercial('');
            setFormaFarmaceutica('');
            setDosagem('');
            setQuantidade('');
            setValidade('');
            navigate('/home');
        } catch (err) {
            console.error("Error adding document: ", err);
            setError('Erro ao cadastrar medicamento. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans">
            {showSplash && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <h3 className="text-xl font-semibold text-green-600">Cadastro realizado com sucesso!</h3>
                        <p className="text-gray-500">O medicamento foi adicionado ao estoque.</p>
                    </div>
                </div>
            )}
            <div className="w-full max-w-lg bg-white p-8 rounded-xl shadow-lg border border-gray-200 relative">
                <button
                    onClick={() => navigate(-1)}
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
                        <input type="text" id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required className="w-full px-4 py-2 border rounded-lg" placeholder="Ex: Paracetamol" disabled={loading} />
                    </div>

                    {/* Novos Campos */}
                    <div>
                        <label htmlFor="principioAtivo" className="block text-sm font-medium text-gray-700 mb-1">Princípio Ativo</label>
                        <input type="text" id="principioAtivo" value={principioAtivo} onChange={(e) => setPrincipioAtivo(e.target.value)} className="w-full px-4 py-2 border rounded-lg" disabled={loading} />
                    </div>

                    <div>
                        <label htmlFor="concentracao" className="block text-sm font-medium text-gray-700 mb-1">Concentração</label>
                        <input type="text" id="concentracao" value={concentracao} onChange={(e) => setConcentracao(e.target.value)} className="w-full px-4 py-2 border rounded-lg" placeholder="Ex: 500mg" disabled={loading} />
                    </div>

                    <div>
                        <label htmlFor="nomeComercial" className="block text-sm font-medium text-gray-700 mb-1">Nome Comercial</label>
                        <input type="text" id="nomeComercial" value={nomeComercial} onChange={(e) => setNomeComercial(e.target.value)} className="w-full px-4 py-2 border rounded-lg" placeholder="Ex: Tylenol" disabled={loading} />
                    </div>

                    <div>
                        <label htmlFor="formaFarmaceutica" className="block text-sm font-medium text-gray-700 mb-1">Forma Farmacêutica</label>
                        <input type="text" id="formaFarmaceutica" value={formaFarmaceutica} onChange={(e) => setFormaFarmaceutica(e.target.value)} className="w-full px-4 py-2 border rounded-lg" placeholder="Ex: Comprimido" disabled={loading} />
                    </div>

                    {/* Campos existentes */}
                    <div>
                        <label htmlFor="dosagem" className="block text-sm font-medium text-gray-700 mb-1">Dosagem</label>
                        <input type="text" id="dosagem" value={dosagem} onChange={(e) => setDosagem(e.target.value)} className="w-full px-4 py-2 border rounded-lg" placeholder="Ex: 500mg" disabled={loading} />
                    </div>


                    <div>
                        <label htmlFor="quantidade" className="block text-sm font-medium text-gray-700 mb-1">Quantidade Inicial <span className="text-red-500">*</span></label>
                        <input type="number" id="quantidade" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} required min="1" className="w-full px-4 py-2 border rounded-lg" placeholder="Ex: 50" disabled={loading} />
                    </div>


                    {error && <p className="text-sm text-red-600 text-center">{error}</p>}

                    <button type="submit" className="w-full flex justify-center items-center py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50" disabled={loading}>
                        {loading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
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
