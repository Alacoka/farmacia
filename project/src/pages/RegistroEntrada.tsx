import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, PlusCircle, CalendarDays, Hash } from 'lucide-react';
import { collection, addDoc, serverTimestamp, getDocs, doc, updateDoc, increment } from "firebase/firestore";
import { db } from '../firebase';
import { Combobox } from './combobox';

type Medicamento = {
  id: string;
  nome: string;
  dosagem?: string;
  quantidadeEstoque: number;
};

const RegistroEntrada: React.FC = () => {
  const navigate = useNavigate();

  const [medicamentoId, setMedicamentoId] = useState<string>('');
  const [quantidade, setQuantidade] = useState<string>('');
  const [lote, setLote] = useState<string>('');
  const [dataEntrada, setDataEntrada] = useState<string>(new Date().toISOString().split('T')[0]);
  const [validade, setValidade] = useState<string>('');
  const [numeroAmostra, setNumeroAmostra] = useState<string>('');
  const [ordemServico, setOrdemServico] = useState<string>('');
  const [responsavel, setResponsavel] = useState<string>('');

  const [medicamentosList, setMedicamentosList] = useState<Medicamento[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchingMeds, setFetchingMeds] = useState<boolean>(true);
  const [showSplash, setShowSplash] = useState<boolean>(false);

  useEffect(() => {
    const fetchMedicamentos = async () => {
      setFetchingMeds(true);
      setError(null);
      try {
        const querySnapshot = await getDocs(collection(db, "medicamentos"));
        const medsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<Medicamento, 'id'>)
        }));
        setMedicamentosList(medsData);
      } catch (err) {
        console.error("Erro ao buscar medicamentos:", err);
        setError("Erro ao buscar lista de medicamentos.");
        setMedicamentosList([]);
      } finally {
        setFetchingMeds(false);
      }
    };

    fetchMedicamentos();
  }, []);

  useEffect(() => {
    if (medicamentoId) {
      const selectedMed = medicamentosList.find(med => med.id === medicamentoId);
      setLote((selectedMed as any)?.lote || '');
    }
  }, [medicamentoId, medicamentosList]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!medicamentoId || !quantidade) {
      setError('Selecione o medicamento e informe a quantidade.');
      return;
    }

    const quantidadeNum = parseInt(quantidade);
    if (isNaN(quantidadeNum) || quantidadeNum <= 0) {
      setError('Quantidade inválida.');
      return;
    }

    setLoading(true);

    const selectedMedicamento = medicamentosList.find(med => med.id === medicamentoId);

    try {
      await addDoc(collection(db, "entradas"), {
        medicamentoId,
        medicamentoNome: selectedMedicamento?.nome || 'Nome não encontrado',
        quantidade: quantidadeNum,
        lote,
        dataEntrada,
        validade,
        numeroAmostra,
        ordemServico,
        responsavel,
        timestamp: serverTimestamp()
      });

      const medRef = doc(db, "medicamentos", medicamentoId);
      await updateDoc(medRef, {
        quantidadeEstoque: increment(quantidadeNum)
      });

      setShowSplash(true);
      setTimeout(() => {
        setShowSplash(false);
        navigate('/home');
      }, 2000);

    } catch (err) {
      console.error("Erro ao registrar entrada:", err);
      setError('Erro ao registrar entrada. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans">
      {/* Tela de Splash */}
      {showSplash && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold text-green-600">Entrada Registrada com Sucesso!</h3>
            <p className="text-gray-500">O medicamento foi adicionado ao estoque.</p>
          </div>
        </div>
      )}

      <div className="w-full max-w-lg bg-white p-8 rounded-xl shadow-lg border border-gray-200 relative">
        {/* Botão Voltar */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 flex items-center text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
          disabled={loading || fetchingMeds}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Voltar
        </button>

        <div className="text-center mb-8 pt-6">
          <FileText className="h-12 w-12 mx-auto text-green-600 mb-2" />
          <h2 className="text-2xl font-bold text-gray-800">Registrar Entrada de Medicamento</h2>
          <p className="text-gray-500 text-sm">Informe os detalhes da entrada no estoque.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Medicamento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Medicamento <span className="text-red-500">*</span>
            </label>
            <Combobox
              items={medicamentosList.map(med => ({
                label: `${med.nome}${med.dosagem ? ` (${med.dosagem})` : ''} - Estoque: ${med.quantidadeEstoque}`,
                value: med.id,
              }))}
              value={medicamentoId}
              onChange={setMedicamentoId}
              placeholder="Selecione o medicamento"
              disabled={loading || fetchingMeds}
            />
          </div>

          {/* Quantidade */}
          <div>
            <label htmlFor="quantidade" className="block text-sm font-medium text-gray-700 mb-1">
              Quantidade Recebida <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="quantidade"
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
              min="1"
              required
              disabled={loading || fetchingMeds}
              placeholder="Ex: 100"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
            />
          </div>

          {/* Lote */}
          <div>
            <label htmlFor="lote" className="block text-sm font-medium text-gray-700 mb-1">
              Lote / Origem
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                id="lote"
                value={lote}
                onChange={(e) => setLote(e.target.value)}
                disabled={loading || fetchingMeds}
                placeholder="Número do lote ou doador"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
              />
            </div>
          </div>

          {/* Data de Entrada */}
          <div>
            <label htmlFor="dataEntrada" className="block text-sm font-medium text-gray-700 mb-1">
              Data de Entrada
            </label>
            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="date"
                id="dataEntrada"
                value={dataEntrada}
                onChange={(e) => setDataEntrada(e.target.value)}
                required
                disabled={loading || fetchingMeds}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
              />
            </div>
          </div>

           
          <div>
            <label htmlFor="validade" className="block text-sm font-medium text-gray-700 mb-1">
              Validade
            </label>
            <input
              type="date"
              id="validade"
              value={validade}
              onChange={(e) => setValidade(e.target.value)}
              disabled={loading || fetchingMeds}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
            />
          </div> 

          {/* Número da Amostra */}
          <div>
            <label htmlFor="numeroAmostra" className="block text-sm font-medium text-gray-700 mb-1">
              Número da Amostra
            </label>
            <input
              type="text"
              id="numeroAmostra"
              value={numeroAmostra}
              onChange={(e) => setNumeroAmostra(e.target.value)}
              disabled={loading || fetchingMeds}
              placeholder="Ex: AM123456"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
            />
          </div>

          {/* Ordem de Serviço */}
          <div>
            <label htmlFor="ordemServico" className="block text-sm font-medium text-gray-700 mb-1">
              Ordem de Serviço
            </label>
            <input
              type="text"
              id="ordemServico"
              value={ordemServico}
              onChange={(e) => setOrdemServico(e.target.value)}
              disabled={loading || fetchingMeds}
              placeholder="Ex: OS2025-01"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
            />
          </div>

          {/* Responsável */}
          <div>
            <label htmlFor="responsavel" className="block text-sm font-medium text-gray-700 mb-1">
              Responsável <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="responsavel"
              value={responsavel}
              required
              onChange={(e) => setResponsavel(e.target.value)}
              disabled={loading || fetchingMeds}
              placeholder="Nome do responsável"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 text-center">{error}</p>
          )}

          {/* Botão Submit */}
          <button
            type="submit"
            disabled={loading || fetchingMeds}
            className="w-full flex justify-center items-center py-3 px-4 bg-green-600 text-white font-medium rounded-lg shadow-md hover:bg-green-700 disabled:opacity-50 transition"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
                Registrando...
              </>
            ) : (
              <>
                <PlusCircle className="h-5 w-5 mr-2" />
                Registrar Entrada
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegistroEntrada;
