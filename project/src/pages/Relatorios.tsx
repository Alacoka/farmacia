import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Combobox } from './combobox'; // Ajuste o caminho se necessário
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { AiFillFilePdf } from 'react-icons/ai';
import { AiOutlineFileExcel } from 'react-icons/ai';




interface Medicamento {
    nome: string;
    dosagem?: string;
    fabricante?: string;
    quantidadeEstoque: number;
    lote: number;
    validade: string;
}

interface Entrada {
    medicamentoNome: string;
    dosagem?: string;
    quantidade: number;
    dataEntrada: string;
}

interface Saida {
    medicamentoNome: string;
    dosagem?: string;
    quantidade: number;
    dataSaida: string;
}

const Relatorios: React.FC = () => {
    const navigate = useNavigate();
    const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
    const [entradas, setEntradas] = useState<Entrada[]>([]);
    const [saidas, setSaidas] = useState<Saida[]>([]);
    const [loading, setLoading] = useState(true);
    const [medicamentoSelecionado, setMedicamentoSelecionado] = useState<string>('');
    const [dataInicial, setDataInicial] = useState('');
    const [dataFinal, setDataFinal] = useState('');
    const [fabricanteFiltro, setFabricanteFiltro] = useState('');
    const [tipoFiltro, setTipoFiltro] = useState<'todos' | 'entradas' | 'saidas'>('todos');

    const getDosagemFromMedicamento = (nome: string) => {
        const med = medicamentos.find(m => m.nome === nome);
        return med?.dosagem || '-';
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const medsSnapshot = await getDocs(collection(db, 'medicamentos'));
                const medsData = medsSnapshot.docs.map(doc => ({
                    ...doc.data(),
                    validade: formatData(doc.data().validade),
                })) as Medicamento[];
                setMedicamentos(medsData);

                const entradasSnapshot = await getDocs(collection(db, 'entradas'));
                const entradasData = entradasSnapshot.docs.map(doc => ({
                    ...doc.data(),
                    dataEntrada: formatData(doc.data().dataEntrada),
                })) as Entrada[];
                setEntradas(entradasData);

                const saidasSnapshot = await getDocs(collection(db, 'saidas'));
                const saidasData = saidasSnapshot.docs.map(doc => ({
                    ...doc.data(),
                    dataSaida: formatData(doc.data().dataSaida),
                })) as Saida[];
                setSaidas(saidasData);

                setLoading(false);
            } catch (error) {
                console.error('Erro ao buscar dados:', error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const formatData = (rawDate: any): string => {
        try {
            if (typeof rawDate === 'string') {
                const date = new Date(rawDate);
                if (!isNaN(date.getTime())) {
                    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1)
                        .toString()
                        .padStart(2, '0')}/${date.getFullYear()}`;
                }
                return rawDate;
            }
            if (rawDate?.toDate) {
                const d = rawDate.toDate();
                return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1)
                    .toString()
                    .padStart(2, '0')}/${d.getFullYear()}`;
            }
        } catch {
            return '';
        }
        return '';
    };

    const comboboxItems = medicamentos.map(m => ({
        label: `${m.nome} ${m.dosagem ? `(${m.dosagem})` : ''}`,
        value: `${m.nome}||${m.dosagem || ''}`,
    }));

    const [selectedNome, selectedDosagem] = medicamentoSelecionado.split('||');

    // Função para converter dd/mm/yyyy para Date
    const parseDate = (str: string) => {
        const [d, m, y] = str.split('/');
        return new Date(`${y}-${m}-${d}`);
    };

    // Filtros aplicados
    const entradasFiltradas = entradas.filter(e => {
        const data = parseDate(e.dataEntrada);
        const dentroPeriodo = (!dataInicial || data >= new Date(dataInicial)) && (!dataFinal || data <= new Date(dataFinal));
        const fabricanteOk = !fabricanteFiltro || medicamentos.find(m => m.nome === e.medicamentoNome)?.fabricante === fabricanteFiltro;
        const medicamentoOk = !medicamentoSelecionado || (e.medicamentoNome === selectedNome && (e.dosagem || getDosagemFromMedicamento(e.medicamentoNome)) === selectedDosagem);
        return dentroPeriodo && fabricanteOk && medicamentoOk;
    });

    const saidasFiltradas = saidas.filter(s => {
        const data = parseDate(s.dataSaida);
        const dentroPeriodo = (!dataInicial || data >= new Date(dataInicial)) && (!dataFinal || data <= new Date(dataFinal));
        const fabricanteOk = !fabricanteFiltro || medicamentos.find(m => m.nome === s.medicamentoNome)?.fabricante === fabricanteFiltro;
        const medicamentoOk = !medicamentoSelecionado || (s.medicamentoNome === selectedNome && (s.dosagem || getDosagemFromMedicamento(s.medicamentoNome)) === selectedDosagem);
        return dentroPeriodo && fabricanteOk && medicamentoOk;
    });

    const medicamentosFiltrados = medicamentoSelecionado
        ? medicamentos.filter(m => m.nome === selectedNome && (m.dosagem || '') === selectedDosagem)
        : medicamentos;

    const fabricantes = Array.from(new Set(medicamentos.map(m => m.fabricante).filter(Boolean)));

    const exportarExcel = () => {
        // Remove medicamentoId e timestamp das entradas e saídas
        const entradasSemId = entradasFiltradas.map(({ medicamentoId, timestamp, ...rest }) => rest);
        const saidasSemId = saidasFiltradas.map(({ medicamentoId, timestamp, ...rest }) => rest);

        const wb = XLSX.utils.book_new();
        const sheetEntradas = XLSX.utils.json_to_sheet(entradasSemId);
        const sheetSaidas = XLSX.utils.json_to_sheet(saidasSemId);
        XLSX.utils.book_append_sheet(wb, sheetEntradas, 'Entradas');
        XLSX.utils.book_append_sheet(wb, sheetSaidas, 'Saidas');
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 'relatorio_farmacia.xlsx');
    };

    const exportarPDF = () => {
        const doc = new jsPDF();
        doc.text('Relatório de Entradas', 14, 14);
        (doc as any).autoTable({
            head: [['Nome', 'Dosagem', 'Quantidade', 'Data de Entrada']],
            body: entradasFiltradas.map(e => [
                e.medicamentoNome,
                e.dosagem || getDosagemFromMedicamento(e.medicamentoNome),
                e.quantidade,
                e.dataEntrada,
            ]),
            startY: 20,
        });
        doc.addPage();
        doc.text('Relatório de Saídas', 14, 14);
        (doc as any).autoTable({
            head: [['Nome', 'Dosagem', 'Quantidade', 'Data de Saída']],
            body: saidasFiltradas.map(s => [
                s.medicamentoNome,
                s.dosagem || getDosagemFromMedicamento(s.medicamentoNome),
                s.quantidade,
                s.dataSaida,
            ]),
            startY: 20,
        });
        doc.save('relatorio_farmacia.pdf');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col items-center justify-center p-4 font-sans">
            <div className="w-full max-w-5xl bg-white p-8 rounded-2xl shadow-2xl border border-blue-100 relative">
                <button
                    onClick={() => navigate(-2)}
                    className="absolute top-4 left-4 flex items-center text-sm text-blue-600 hover:text-blue-800 z-10"
                >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Voltar
                </button>

                <div className="text-center mb-8 pt-6">
                    <FileText className="h-12 w-12 mx-auto text-indigo-600 mb-2" />
                    <h2 className="text-2xl font-bold text-gray-800">Relatórios</h2>
                    <p className="text-gray-500 text-sm">Visualize os cadastros, entradas e saídas de medicamentos.</p>
                </div>

                <div className="mb-8 max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Combobox
                        items={comboboxItems}
                        value={medicamentoSelecionado}
                        onChange={setMedicamentoSelecionado}
                        placeholder="Buscar medicamento..."
                    />
                    <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        value={fabricanteFiltro}
                        onChange={e => setFabricanteFiltro(e.target.value)}
                    >
                        <option value="">Todos os fabricantes</option>
                        {fabricantes.map(f => (
                            <option key={f} value={f}>{f}</option>
                        ))}
                    </select>
                    <div className="flex gap-2">
                        <input
                            type="date"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            value={dataInicial}
                            onChange={e => setDataInicial(e.target.value)}
                        />
                        <input
                            type="date"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            value={dataFinal}
                            onChange={e => setDataFinal(e.target.value)}
                        />
                    </div>
                    <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        value={tipoFiltro}
                        onChange={e => setTipoFiltro(e.target.value as any)}
                    >
                        <option value="todos">Entradas e Saídas</option>
                        <option value="entradas">Somente Entradas</option>
                        <option value="saidas">Somente Saídas</option>
                    </select>
                    {medicamentoSelecionado && (
                        <button
                            onClick={() => setMedicamentoSelecionado('')}
                            className="mt-2 text-sm text-red-600 hover:underline"
                        >
                            Limpar filtro
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="text-center text-gray-500">Carregando dados...</div>
                ) : (
                    <>
                        <section className="mb-8">
                            <h3 className="text-xl font-semibold text-gray-700 mb-4">Medicamentos Cadastrados</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm text-left text-gray-600 border rounded-lg">
                                    <thead className="bg-gray-100 text-gray-700">
                                        <tr>
                                            <th className="py-2 px-4">Nome</th>
                                            <th className="py-2 px-4">Dosagem</th>
                                            <th className="py-2 px-4">Fabricante</th>
                                            <th className="py-2 px-4">Quantidade</th>
                                            <th className="py-2 px-4">Lote</th>
                                            <th className="py-2 px-4">Validade</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {medicamentosFiltrados.map((m, i) => (
                                            <tr key={i} className="border-t hover:bg-gray-50">
                                                <td className="py-2 px-4">{m.nome}</td>
                                                <td className="py-2 px-4">{m.dosagem || '-'}</td>
                                                <td className="py-2 px-4">{m.fabricante || '-'}</td>
                                                <td className="py-2 px-4">{m.quantidadeEstoque}</td>
                                                <td className="py-2 px-4">{m.lote}</td>
                                                <td className="py-2 px-4">{m.validade}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <section className="mb-8">
                            <h3 className="text-xl font-semibold text-gray-700 mb-4">Entradas de Medicamentos</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm text-left text-gray-600 border rounded-lg">
                                    <thead className="bg-green-100 text-green-700">
                                        <tr>
                                            <th className="py-2 px-4">Nome</th>
                                            <th className="py-2 px-4">Dosagem</th>
                                            <th className="py-2 px-4">Quantidade</th>
                                            <th className="py-2 px-4">Data de Entrada</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(tipoFiltro === 'todos' || tipoFiltro === 'entradas') && (
                                            entradasFiltradas.length > 0 ? (
                                                entradasFiltradas.map((e, i) => (
                                                    <tr key={i} className="border-t hover:bg-gray-50">
                                                        <td className="py-2 px-4">{e.medicamentoNome}</td>
                                                        <td className="py-2 px-4">{e.dosagem || getDosagemFromMedicamento(e.medicamentoNome)}</td>
                                                        <td className="py-2 px-4">{e.quantidade}</td>
                                                        <td className="py-2 px-4">{e.dataEntrada}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={4} className="py-4 text-center text-gray-500">Nenhuma entrada encontrada.</td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-xl font-semibold text-gray-700 mb-4">Saídas de Medicamentos</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm text-left text-gray-600 border rounded-lg">
                                    <thead className="bg-red-100 text-red-700">
                                        <tr>
                                            <th className="py-2 px-4">Nome</th>
                                            <th className="py-2 px-4">Dosagem</th>
                                            <th className="py-2 px-4">Quantidade</th>
                                            <th className="py-2 px-4">Data de Saida</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(tipoFiltro === 'todos' || tipoFiltro === 'saidas') && (
                                            saidasFiltradas.length > 0 ? (
                                                saidasFiltradas.map((s, i) => (
                                                    <tr key={i} className="border-t hover:bg-gray-50">
                                                        <td className="py-2 px-4">{s.medicamentoNome}</td>
                                                        <td className="py-2 px-4">{s.dosagem || getDosagemFromMedicamento(s.medicamentoNome)}</td>
                                                        <td className="py-2 px-4">{s.quantidade}</td>
                                                        <td className="py-2 px-4">{s.dataSaida}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={4} className="py-4 text-center text-gray-500">Nenhuma saída encontrada.</td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </>
                )}
                <div className="flex gap-2 mt-4">
                    <button
                        onClick={exportarExcel}
                        className="flex items-center gap-1 border border-green-500 text-green-600 text-sm font-medium px-3 py-1.5 rounded-md hover:bg-green-50 transition-all"
                    >
                        <AiOutlineFileExcel size={18} />
                        Excel
                    </button>

                    <button
                        onClick={exportarPDF}
                        className="flex items-center gap-1 border border-red-500 text-red-600 text-sm font-medium px-3 py-1.5 rounded-md hover:bg-red-50 transition-all"
                    >
                        <AiFillFilePdf size={18} />
                        PDF
                    </button>
                </div>

            </div>
        </div>
    );
};

export default Relatorios;
