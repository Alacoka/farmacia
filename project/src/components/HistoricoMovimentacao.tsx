import { Clock } from 'lucide-react';

interface MovimentacaoItem {
    id: string;
    medicamentoNome?: string;
    quantidade: number;
    timestamp: {
        seconds: number;
        nanoseconds?: number;
    };
}

interface Props {
    titulo: string;
    cor: 'green' | 'red';
    itens: MovimentacaoItem[];
}

const HistoricoMovimentacao = ({ titulo, cor, itens }: Props) => {
    const formatarData = (timestamp: { seconds: number }) => {
        const date = new Date(timestamp.seconds * 1000);
        return new Intl.DateTimeFormat('pt-BR', {
            dateStyle: 'short',
            timeStyle: 'medium'
        }).format(date);
    };

    return (
        <div className="bg-white p-5 rounded-xl shadow-md border">
            <h3 className={`text-lg font-semibold text-${cor}-600 mb-4`}>
                {titulo}
            </h3>
            {itens.length === 0 ? (
                <p className="text-sm text-gray-400">Nenhum registro recente.</p>
            ) : (
                <ul className="space-y-3">
                    {itens.map(item => (
                        <li key={item.id} className="border-b pb-2 text-sm">
                            <p className="text-gray-800 font-medium">{item.medicamentoNome || 'Desconhecido'}</p>
                            <p className="text-gray-600">{item.quantidade} un.</p>
                            <p className="flex items-center text-gray-500 text-xs mt-1">
                                <Clock className="w-4 h-4 mr-1" />
                                {formatarData(item.timestamp)}
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default HistoricoMovimentacao;
