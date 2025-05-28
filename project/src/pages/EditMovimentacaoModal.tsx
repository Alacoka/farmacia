import React, { useState } from 'react';

interface EditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: { id: string, tipo: string, quantidade: number }) => void;
    movimentacao: { id: string; tipo: string; quantidade: number } | null;
}

const EditMovimentacaoModal = ({ isOpen, onClose, onSave, movimentacao }: EditModalProps) => {
    const [quantidade, setQuantidade] = useState(movimentacao?.quantidade || 0);

    if (!isOpen || !movimentacao) return null;

    const handleSave = () => {
        onSave({ id: movimentacao.id, tipo: movimentacao.tipo, quantidade });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
                <h2 className="text-xl font-semibold mb-4">Editar Movimentação</h2>
                <label className="block mb-2 text-sm font-medium">Quantidade</label>
                <input
                    type="number"
                    value={quantidade}
                    onChange={(e) => setQuantidade(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
                />
                <div className="flex justify-end space-x-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-black"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        Salvar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditMovimentacaoModal;
