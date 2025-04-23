import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, PackageMinus, CalendarDays } from 'lucide-react';
// Assuming your firebase config is correctly set up and exported as 'db'
import { collection, addDoc, serverTimestamp, getDocs, doc, updateDoc, increment } from "firebase/firestore";
import { db } from '../firebase'; // Adjust path if needed

// Define type for medication fetched from Firestore (can share with RegistroEntrada)
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
    const [medicamentosList, setMedicamentosList] = useState<Medicamento[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [fetchingMeds, setFetchingMeds] = useState<boolean>(true);

    // --- Fetch medicamentos for dropdown ---
    useEffect(() => {
        const fetchMedicamentos = async () => {
            setFetchingMeds(true);
            setError(null);
            try {
                // Uncomment and use your actual db instance
                const querySnapshot = await getDocs(collection(db, "medicamentos"));
                const medsData = querySnapshot.docs
                    .map(doc => ({ id: doc.id, ...doc.data() } as Medicamento))
                    .filter(med => med.quantidadeEstoque > 0); // Only show meds with stock > 0
                setMedicamentosList(medsData);

                // --- Mock Data ---
                await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate fetch delay
                const mockMeds: Medicamento[] = [
                    { id: 'med1', nome: 'Paracetamol', dosagem: '500mg', quantidadeEstoque: 50 },
                    { id: 'med2', nome: 'Ibuprofeno', dosagem: '200mg', quantidadeEstoque: 100 },
                    { id: 'med3', nome: 'Amoxicilina', dosagem: '250mg/5ml', quantidadeEstoque: 20 },
                ].filter(med => med.quantidadeEstoque > 0); // Filter mock data too
                setMedicamentosList(mockMeds);
                // --- End Mock Data ---

            } catch (err) {
                console.error("Error fetching medications: ", err);
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
            setError('Quantidade inválida. Deve ser um número maior que zero.');
            return;
        }

        const selectedMedicamento = medicamentosList.find(med => med.id === medicamentoId);

        // Check if stock is sufficient
        if (!selectedMedicamento || quantidadeNum > selectedMedicamento.quantidadeEstoque) {
            setError(`Quantidade solicitada (${quantidadeNum}) excede o estoque disponível (${selectedMedicamento?.quantidadeEstoque ?? 0}).`);
            return;
        }

        setLoading(true);
        console.log('Registrando saída:', {
            medicamentoId,
            medicamentoNome: selectedMedicamento?.nome,
            quantidade: quantidadeNum,
            motivo,
            dataSaida
        });

        // --- Firebase Logic ---
        try {
            // Uncomment and use your actual db instance
            // // 1. Add entry to 'saidas' collection
            await addDoc(collection(db, "saidas"), {
                medicamentoId: medicamentoId,
                medicamentoNome: selectedMedicamento?.nome || 'Nome não encontrado',
                quantidade: quantidadeNum,
                motivo: motivo,
                dataSaida: dataSaida,
                timestamp: serverTimestamp()
            });
            // // 2. Update stock quantity in 'medicamentos' collection (decrement)
            const medRef = doc(db, "medicamentos", medicamentoId);
            await updateDoc(medRef, {
                quantidadeEstoque: increment(-quantidadeNum) // Use Firestore increment (negative)
            });

            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            alert('Saída registrada com sucesso! (Simulado)');
            // Clear form or navigate away
            setMedicamentoId('');
            setQuantidade('');
            setMotivo('');
            setDataSaida(new Date().toISOString().split('T')[0]);
            navigate('/home'); // Navigate back

        } catch (err) {
            console.error("Error registering exit: ", err);
            setError('Erro ao registrar saída. Tente novamente.');
        } finally {
            setLoading(false);
        }
        // --- End Firebase Logic ---
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans">
            <div className="w-full max-w-lg bg-white p-8 rounded-xl shadow-lg border border-gray-200 relative">
                {/* Back Button */}
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
                    {/* Medicamento Selection */}
                    <div>
                        <label htmlFor="medicamento" className="block text-sm font-medium text-gray-700 mb-1">Medicamento <span className="text-red-500">*</span></label>
                        <select
                            id="medicamento"
                            value={medicamentoId}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setMedicamentoId(e.target.value)}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100"
                            disabled={loading || fetchingMeds || medicamentosList.length === 0}
                        >
                            <option value="" disabled>
                                {fetchingMeds ? 'Carregando medicamentos...' : (medicamentosList.length === 0 ? 'Nenhum medicamento em estoque' : 'Selecione...')}
                            </option>
                            {medicamentosList.map(med => (
                                <option key={med.id} value={med.id}>
                                    {med.nome} {med.dosagem ? `(${med.dosagem})` : ''} - Estoque: {med.quantidadeEstoque}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Quantidade */}
                    <div>
                        <label htmlFor="quantidade" className="block text-sm font-medium text-gray-700 mb-1">Quantidade Retirada <span className="text-red-500">*</span></label>
                        <input
                            type="number"
                            id="quantidade"
                            value={quantidade}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuantidade(e.target.value)}
                            required
                            min="1"
                            // Optional: Set max based on selected medication's stock
                            max={medicamentosList.find(m => m.id === medicamentoId)?.quantidadeEstoque}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100"
                            placeholder="Ex: 10"
                            disabled={loading || fetchingMeds || !medicamentoId} // Disable if no med selected
                        />
                    </div>

                    {/* Motivo */}
                    <div>
                        <label htmlFor="motivo" className="block text-sm font-medium text-gray-700 mb-1">Motivo / Destino</label>
                        <input
                            type="text"
                            id="motivo"
                            value={motivo}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMotivo(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100"
                            placeholder="Ex: Doação para Posto X, Descarte por validade"
                            disabled={loading || fetchingMeds}
                        />
                    </div>

                    {/* Data Saída */}
                    <div>
                        <label htmlFor="dataSaida" className="block text-sm font-medium text-gray-700 mb-1">Data de Saída</label>
                        <div className="relative">
                            <CalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="date"
                                id="dataSaida"
                                value={dataSaida}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDataSaida(e.target.value)}
                                required
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100"
                                disabled={loading || fetchingMeds}
                            />
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <p className="text-sm text-red-600 text-center">{error}</p>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full flex justify-center items-center py-3 px-4 bg-red-600 text-white font-medium rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading || fetchingMeds}
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">...</svg>
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
