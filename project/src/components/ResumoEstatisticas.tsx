interface Props {
    totalStock: number | null;
    recentEntries: number | null;
    recentExits: number | null;
}

const ResumoEstatisticas = ({ totalStock, recentEntries, recentExits }: Props) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Estoque total */}
            <div className="bg-white p-5 rounded-xl shadow-md text-center border">
                <h3 className="text-lg font-medium text-gray-700 mb-1">Estoque total</h3>
                {totalStock === null ? (
                    <p className="text-sm text-gray-400">Carregando...</p>
                ) : (
                    <>
                        <p className="text-3xl font-semibold text-blue-600">{totalStock}</p>
                        <p className="text-xs text-gray-500 mt-1">Itens cadastrados</p>
                    </>
                )}
            </div>

            {/* Entradas recentes */}
            <div className="bg-white p-5 rounded-xl shadow-md text-center border">
                <h3 className="text-lg font-medium text-gray-700 mb-1">Entradas Recentes</h3>
                {recentEntries === null ? (
                    <p className="text-sm text-gray-400">Carregando...</p>
                ) : (
                    <>
                        <p className="text-3xl font-semibold text-green-600">{recentEntries}</p>
                        <p className="text-xs text-gray-500 mt-1">Últimos 7 dias</p>
                    </>
                )}
            </div>

            {/* Saídas recentes */}
            <div className="bg-white p-5 rounded-xl shadow-md text-center border">
                <h3 className="text-lg font-medium text-gray-700 mb-1">Saídas Recentes</h3>
                {recentExits === null ? (
                    <p className="text-sm text-gray-400">Carregando...</p>
                ) : (
                    <>
                        <p className="text-3xl font-semibold text-red-600">{recentExits}</p>
                        <p className="text-xs text-gray-500 mt-1">Últimos 7 dias</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default ResumoEstatisticas;
