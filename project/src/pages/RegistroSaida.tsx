import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, PackageMinus, CalendarDays, Hash } from 'lucide-react';
import { collection, addDoc, serverTimestamp, getDocs, doc, updateDoc, increment } from "firebase/firestore";
import { db } from '../firebase';
import { Combobox } from './combobox';

type Medicamento = {
  id: string;
  nome: string;
  dosagem?: string;
  quantidadeEstoque: number;
};

const RegistroSaida: React.FC = () => {
  const navigate = useNavigate();

  const [medicamentoId, setMedicamentoId] = useState<string>('');
  const [quantidade, setQuantidade] = useState<string>('');
  const [motivo, setMotivo] = useState<string>('');
  const [dataSaida, setDataSaida] = useState<string>(new Date().toISOString().split('T')[0]);

  // Novos campos adicionados
  const [ordemServico, setOrdemServico] = useState<string>('');
  const [numeroAmostra, setNumeroAmostra] = useState<string>('');
  const [validade, setValidade] = useState<string>('');
  const [lote, setLote] = useState<string>('');
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
        setMedicamentosList(medsData.filter(med => med.quantidadeEstoque > 0));
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

    const selectedMedicamento = medicamentosList.find(med => med.id === medicamentoId);

    if (!selectedMedicamento || quantidadeNum > selectedMedicamento.quantidadeEstoque) {
      setError(`Quantidade solicitada (${quantidadeNum}) excede o estoque disponível (${selectedMedicamento?.quantidadeEstoque ?? 0}).`);
      return;
    }

    setLoading(true);

    try {
      await addDoc(collection(db, "saidas"), {
        medicamentoId,
        medicamentoNome: selectedMedicamento?.nome || 'Nome não encontrado',
        quantidade: quantidadeNum,
        motivo,
        dataSaida,
        ordemServico,
        numeroAmostra,
        validade,
        lote,
        responsavel,
        timestamp: serverTimestamp()
      });

      const medRef = doc(db, "medicamentos", medicamentoId);
      await updateDoc(medRef, {
        quantidadeEstoque: increment(-quantidadeNum)
      });

      setShowSplash(true);
      setTimeout(() => {
        setShowSplash(false);
        navigate('/home');
      }, 2000);

    } catch (err) {
      console.error("Erro ao registrar saída:", err);
      setError('Erro ao registrar saída. Tente novamente.');
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
            <h3 className="text-xl font-semibold text-red-600">Saída Registrada com Sucesso!</h3>
            <p className="text-gray-500">O medicamento foi retirado do estoque.</p>
          </div>
        </div>
      )}

      <div className="w-full max-w-lg bg-white p-8 rounded-xl shadow-lg border border-gray-200 relative">
        {/* Botão Voltar */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 flex items-center text-sm text-blue-600 hover:text-blue-800 z-10 disabled:opacity-50"
          disabled={loading || fetchingMeds}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Voltar
        </button>

        <div className="text-center mb-8 pt-6">
          <PackageMinus className="h-12 w-12 mx-auto text-red-600 mb-2" />
          <h2 className="text-2xl font-bold text-gray-800">Registrar Saída de Medicamento</h2>
          <p className="text-gray-500 text-sm">Informe os detalhes da saída do estoque.</p>
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
              Quantidade Retirada <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="quantidade"
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
              min={1}
              max={medicamentosList.find(m => m.id === medicamentoId)?.quantidadeEstoque}
              required
              disabled={loading || fetchingMeds}
              placeholder="Ex: 10"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100"
            />
          </div>

          {/* Motivo */}
          <div>
            <label htmlFor="motivo" className="block text-sm font-medium text-gray-700 mb-1">
              Motivo / Destino
            </label>
            <input
              type="text"
              id="motivo"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              disabled={loading || fetchingMeds}
              placeholder="Ex: Doação para Posto X, Descarte por validade"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100"
            />
          </div>

          {/* Data Saída */}
          <div>
            <label htmlFor="dataSaida" className="block text-sm font-medium text-gray-700 mb-1">
              Data de Saída
            </label>
            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="date"
                id="dataSaida"
                value={dataSaida}
                onChange={(e) => setDataSaida(e.target.value)}
                required
                disabled={loading || fetchingMeds}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100"
              />
            </div>
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100"
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
              placeholder="Ex: AMO12345"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100"
            />
          </div>

          {/* Validade */}
          <div>
            <label htmlFor="validade" className="block text-sm font-medium text-gray-700 mb-1">
              Validade do Lote
            </label>
            <input
              type="date"
              id="validade"
              value={validade}
              onChange={(e) => setValidade(e.target.value)}
              disabled={loading || fetchingMeds}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100"
            />
          </div>

          {/* Lote */}
          <div>
            <label htmlFor="lote" className="block text-sm font-medium text-gray-700 mb-1">
              Lote
            </label>
            <input
              type="text"
              id="lote"
              value={lote}
              onChange={(e) => setLote(e.target.value)}
              disabled={loading || fetchingMeds}
              placeholder="Ex: L123456"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100"
            />
          </div>

          {/* Responsável */}
          <div>
            <label htmlFor="responsavel" className="block text-sm font-medium text-gray-700 mb-1">
              Responsável
            </label>
            <input
              type="text"
              id="responsavel"
              value={responsavel}
              onChange={(e) => setResponsavel(e.target.value)}
              disabled={loading || fetchingMeds}
              placeholder="Nome do responsável"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100"
            />
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-sm text-red-600 text-center">{error}</p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || fetchingMeds}
            className="w-full flex justify-center items-center py-3 px-4 bg-red-600 text-white font-medium rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                <PackageMinus className="h-5 w-5 mr-2" />
                Registrar Saída
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegistroSaida;
