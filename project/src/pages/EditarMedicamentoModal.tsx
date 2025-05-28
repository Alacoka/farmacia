import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { X } from 'lucide-react';

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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white w-full max-w-xl rounded-lg shadow-xl p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
                >
                    <X className="h-5 w-5" />
                </button>

                <h2 className="text-xl font-bold text-center mb-4 text-blue-600">Editar Medicamento</h2>

                <div className="space-y-4">
                    <input id="nome" type="text" value={form.nome} onChange={handleChange} placeholder="Nome" className="w-full px-3 py-2 border rounded" />
                    <input id="principioAtivo" type="text" value={form.principioAtivo || ''} onChange={handleChange} placeholder="Princípio Ativo" className="w-full px-3 py-2 border rounded" />
                    <input id="concentracao" type="text" value={form.concentracao || ''} onChange={handleChange} placeholder="Concentração" className="w-full px-3 py-2 border rounded" />
                    <input id="nomeComercial" type="text" value={form.nomeComercial || ''} onChange={handleChange} placeholder="Nome Comercial" className="w-full px-3 py-2 border rounded" />
                    <input id="formaFarmaceutica" type="text" value={form.formaFarmaceutica || ''} onChange={handleChange} placeholder="Forma Farmacêutica" className="w-full px-3 py-2 border rounded" />
                    <input id="dosagem" type="text" value={form.dosagem || ''} onChange={handleChange} placeholder="Dosagem" className="w-full px-3 py-2 border rounded" />
                    <input id="fabricante" type="text" value={form.fabricante || ''} onChange={handleChange} placeholder="Fabricante" className="w-full px-3 py-2 border rounded" />
                    <input id="lote" type="text" value={form.lote || ''} onChange={handleChange} placeholder="Lote" className="w-full px-3 py-2 border rounded" />
                    <input id="validade" type="date" value={form.validade || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded" />
                    <input id="quantidadeEstoque" type="number" value={form.quantidadeEstoque || 0} onChange={handleChange} placeholder="Quantidade" className="w-full px-3 py-2 border rounded" />

                    <button
                        onClick={handleSalvar}
                        disabled={loading}
                        className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditarMedicamentoModal;
