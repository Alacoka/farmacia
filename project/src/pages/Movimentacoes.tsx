import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, doc, updateDoc, Timestamp,} from "firebase/firestore";
import { Dialog, DialogContent, DialogHeader, DialogTitle,} from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { format } from "date-fns";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

interface Movimentacao {
  id: string;
  tipo: "entrada" | "saida";
  medicamentoNome: string;
  quantidade: number;
  data: Timestamp;
  responsavel: string;
}

export default function Movimentacoes() {
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [selecionada, setSelecionada] = useState<Movimentacao | null>(null);
  const [quantidadeEditada, setQuantidadeEditada] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [filtroTipo, setFiltroTipo] = useState<"todos" | "entrada" | "saida">(
    "todos"
  );
  const [filtroDataInicio, setFiltroDataInicio] = useState("");
  const [filtroDataFim, setFiltroDataFim] = useState("");
  const [filtroResponsavel, setFiltroResponsavel] = useState("");
  const [filtroMedicamento, setFiltroMedicamento] = useState("");

  const displayName = "Usuário";

  const carregarMovimentacoes = async () => {
    const entradasSnap = await getDocs(collection(db, "entradas"));
    const saidasSnap = await getDocs(collection(db, "saidas"));

    const entradas = entradasSnap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        tipo: "entrada" as const,
        medicamentoNome: data.medicamentoNome || "Desconhecido",
        quantidade: data.quantidade,
        data: data.timestamp,
        responsavel: data.responsavel || "Desconhecido",
      };
    });

    const saidas = saidasSnap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        tipo: "saida" as const,
        medicamentoNome: data.medicamentoNome || "Desconhecido",
        quantidade: data.quantidade,
        data: data.timestamp,
        responsavel: data.responsavel || "Desconhecido",
      };
    });

    let todas = [...entradas, ...saidas].filter((mov) => mov.data?.seconds);

    if (filtroTipo !== "todos") {
      todas = todas.filter((mov) => mov.tipo === filtroTipo);
    }

    if (filtroDataInicio) {
      const inicio = new Date(filtroDataInicio);
      todas = todas.filter((mov) => mov.data.toDate() >= inicio);
    }
    if (filtroDataFim) {
      const fim = new Date(filtroDataFim);
      todas = todas.filter((mov) => mov.data.toDate() <= fim);
    }

    if (filtroResponsavel.trim() !== "") {
      todas = todas.filter((mov) =>
        mov.responsavel.toLowerCase().includes(filtroResponsavel.toLowerCase())
      );
    }

    if (filtroMedicamento.trim() !== "") {
      todas = todas.filter((mov) =>
        mov.medicamentoNome
          .toLowerCase()
          .includes(filtroMedicamento.toLowerCase())
      );
    }

    todas.sort((a, b) => b.data.seconds - a.data.seconds);

    setMovimentacoes(todas);
  };

  useEffect(() => {
    carregarMovimentacoes();
  }, [
    filtroTipo,
    filtroDataInicio,
    filtroDataFim,
    filtroResponsavel,
    filtroMedicamento,
  ]);

  const abrirModal = (mov: Movimentacao) => {
    setSelecionada(mov);
    setQuantidadeEditada(mov.quantidade.toString());
    setModalAberto(true);
  };

  const salvarEdicao = async () => {
    if (!selecionada) return;

    const novaQtd = parseInt(quantidadeEditada);
    if (isNaN(novaQtd)) return alert("Quantidade inválida");

    const ref = doc(
      db,
      selecionada.tipo === "entrada" ? "entradas" : "saidas",
      selecionada.id
    );
    await updateDoc(ref, { quantidade: novaQtd });

    setModalAberto(false);
    setSelecionada(null);
    carregarMovimentacoes();
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const dadosGrafico = movimentacoes.reduce((acc, mov) => {
    const key = mov.medicamentoNome;
    if (!acc[key]) {
      acc[key] = { medicamento: key, entrada: 0, saida: 0 };
    }
    acc[key][mov.tipo] += mov.quantidade;
    return acc;
  }, {} as Record<string, { medicamento: string; entrada: number; saida: number }>);

  const dadosGraficoArray = Object.values(dadosGrafico);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header displayName={displayName} onToggleSidebar={toggleSidebar} />

      <div className="flex pt-1">
        <Sidebar sidebarOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-4 md:p-8 mt-20 max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Histórico de Movimentações</h1>

          {/* FILTROS */}
          <div className="flex flex-wrap gap-4 mb-6 items-end">
            <div>
              <label className="block mb-1 font-medium text-gray-700">Tipo</label>
              <select
                className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value as any)}
              >
                <option value="todos">Todos</option>
                <option value="entrada">Entrada</option>
                <option value="saida">Saída</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 font-medium text-gray-700">Data Início</label>
              <Input
                type="date"
                value={filtroDataInicio}
                onChange={(e) => setFiltroDataInicio(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium text-gray-700">Data Fim</label>
              <Input
                type="date"
                value={filtroDataFim}
                onChange={(e) => setFiltroDataFim(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium text-gray-700">
                Responsável
              </label>
              <Input
                placeholder="Buscar responsável"
                value={filtroResponsavel}
                onChange={(e) => setFiltroResponsavel(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium text-gray-700">
                Medicamento
              </label>
              <Input
                placeholder="Buscar medicamento"
                value={filtroMedicamento}
                onChange={(e) => setFiltroMedicamento(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2"
              />
            </div>

            <Button
              onClick={() => {
                setFiltroTipo("todos");
                setFiltroDataInicio("");
                setFiltroDataFim("");
                setFiltroResponsavel("");
                setFiltroMedicamento("");
              }}
              className="ml-2 bg-red-500 hover:bg-red-600"
            >
              Limpar
            </Button>
          </div>

          {/* GRÁFICO */}
          <div className="mt-2 bg-white rounded shadow p-6">
            <h2 className="text-xl font-bold mb-4">Resumo por Medicamento</h2>
            {dadosGraficoArray.length === 0 ? (
              <p className="text-gray-500 text-center">Sem dados para mostrar.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={dadosGraficoArray}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis dataKey="medicamento" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="entrada" fill="#10B981" name="Entradas" />
                  <Bar dataKey="saida" fill="#EF4444" name="Saídas" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* LISTA */}
          <ul className="divide-y divide-gray-200 bg-white rounded shadow mt-6">
            {movimentacoes.length === 0 && (
              <li className="p-4 text-center text-gray-500">
                Nenhuma movimentação encontrada.
              </li>
            )}
            {movimentacoes.map((mov) => (
              <li
                key={mov.id}
                className="p-4 flex justify-between items-center hover:bg-gray-100"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-12">
                  <span className="font-semibold text-gray-800">
                    {mov.medicamentoNome}
                  </span>
                  <span
                    className={
                      mov.tipo === "entrada"
                        ? "text-green-600 font-semibold"
                        : "text-red-600 font-semibold"
                    }
                  >
                    {mov.tipo === "entrada" ? "+" : "-"}
                    {mov.quantidade}
                  </span>
                  <span className="text-gray-600">
                    {format(mov.data.toDate(), "dd/MM/yyyy HH:mm")}
                  </span>
                  <span className="text-gray-600 italic">{mov.responsavel}</span>
                </div>
                <Button
                  size="sm"
                  onClick={() => abrirModal(mov)}
                  className="ml-4"
                >
                  Editar
                </Button>
              </li>
            ))}
          </ul>

          {/* Modal edição */}
          <Dialog open={modalAberto} onOpenChange={setModalAberto}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Editar Quantidade</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Input
                  type="number"
                  value={quantidadeEditada}
                  onChange={(e) => setQuantidadeEditada(e.target.value)}
                />
                <Button onClick={salvarEdicao}>Salvar</Button>
              </div>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
}
