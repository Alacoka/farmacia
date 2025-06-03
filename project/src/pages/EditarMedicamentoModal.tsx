import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { X, Pencil } from 'lucide-react';

interface Medicamento {
    id: string;
    nome: string;
    principioAtivo?: string;
    concentracao?: string;
    nomeComercial?: string;
    formaFarmaceutica?: string;
    dosagem?: string;
    fabricante?: string;
    quantidadeEstoque?: number;
    validade?: string;
    lote?: string;
}

interface Props {
    medicamento: Medicamento;
    onClose: () => void;
    onSaved: () => void;
}

const EditarMedicamentoModal: React.FC<Props> = ({ medicamento, onClose, onSaved }) => {
    const [form, setForm] = useState<Medicamento>(medicamento);
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setForm(prev => ({ ...prev, [id]: value }));
    };

    const handleSalvar = async () => {
        setLoading(true);
        try {
            const docRef = doc(db, 'medicamentos', medicamento.id);
            const { id, ...fieldsToUpdate } = form;
            await updateDoc(docRef, fieldsToUpdate);
            onSaved();
            onClose();
        } catch (err) {
            console.error('Erro ao salvar medicamento:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-200 bg-opacity-90 animate-fade-in">
            <div className="relative w-full max-w-lg md:max-w-xl rounded-2xl shadow-2xl bg-white p-4 sm:p-8 border border-blue-100 overflow-y-auto max-h-[95vh]">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-blue-600 transition-colors"
                    aria-label="Fechar"
                >
                    <X className="h-6 w-6 sm:h-7 sm:w-7" />
                </button>

                <div className="flex flex-col items-center mb-4 sm:mb-6">
                    <span className="bg-blue-100 p-2 sm:p-3 rounded-full mb-2">
                        <Pencil className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600" />
                    </span>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-blue-700 tracking-tight text-center">Editar Medicamento</h2>
                </div>

                <form className="space-y-3 sm:space-y-4" onSubmit={e => { e.preventDefault(); handleSalvar(); }}>
                    <input id="nome" type="text" value={form.nome} onChange={handleChange} placeholder="Nome do medicamento" className="w-full px-3 py-2 sm:px-4 sm:py-2 border-2 border-blue-100 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition text-sm sm:text-base" />
                    <input id="principioAtivo" type="text" value={form.principioAtivo || ''} onChange={handleChange} placeholder="Princípio Ativo" className="w-full px-3 py-2 sm:px-4 sm:py-2 border-2 border-blue-100 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition text-sm sm:text-base" />
                    <input id="concentracao" type="text" value={form.concentracao || ''} onChange={handleChange} placeholder="Concentração" className="w-full px-3 py-2 sm:px-4 sm:py-2 border-2 border-blue-100 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition text-sm sm:text-base" />
                    <input id="nomeComercial" type="text" value={form.nomeComercial || ''} onChange={handleChange} placeholder="Nome Comercial" className="w-full px-3 py-2 sm:px-4 sm:py-2 border-2 border-blue-100 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition text-sm sm:text-base" />
                    <input id="formaFarmaceutica" type="text" value={form.formaFarmaceutica || ''} onChange={handleChange} placeholder="Forma Farmacêutica" className="w-full px-3 py-2 sm:px-4 sm:py-2 border-2 border-blue-100 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition text-sm sm:text-base" />
                    <input id="dosagem" type="text" value={form.dosagem || ''} onChange={handleChange} placeholder="Dosagem" className="w-full px-3 py-2 sm:px-4 sm:py-2 border-2 border-blue-100 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition text-sm sm:text-base" />
                    <input id="fabricante" type="text" value={form.fabricante || ''} onChange={handleChange} placeholder="Fabricante" className="w-full px-3 py-2 sm:px-4 sm:py-2 border-2 border-blue-100 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition text-sm sm:text-base" />
                    <input id="lote" type="text" value={form.lote || ''} onChange={handleChange} placeholder="Lote" className="w-full px-3 py-2 sm:px-4 sm:py-2 border-2 border-blue-100 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition text-sm sm:text-base" />
                    <input id="validade" type="date" value={form.validade || ''} onChange={handleChange} className="w-full px-3 py-2 sm:px-4 sm:py-2 border-2 border-blue-100 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition text-sm sm:text-base" />
                    <input id="quantidadeEstoque" type="number" value={form.quantidadeEstoque || 0} onChange={handleChange} placeholder="Quantidade em estoque" className="w-full px-3 py-2 sm:px-4 sm:py-2 border-2 border-blue-100 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition text-sm sm:text-base" />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 sm:py-3 mt-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition disabled:opacity-60 text-base"
                    >
                        {loading ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditarMedicamentoModal;
