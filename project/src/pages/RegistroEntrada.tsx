import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, PlusCircle, CalendarDays, Hash } from 'lucide-react';
// Assuming your firebase config is correctly set up and exported as 'db'
import { collection, addDoc, serverTimestamp, getDocs, doc, updateDoc, increment } from "firebase/firestore";
import { db } from '../firebase'; // Adjust path if needed

// Define type for medication fetched from Firestore
type Medicamento = {
    id: string;
    nome: string;
    dosagem?: string; // Make optional if not always present
    quantidadeEstoque: number;
    // Add other fields if needed
};

const RegistroEntrada: React.FC = () => {
    const navigate = useNavigate();
    const [medicamentoId, setMedicamentoId] = useState<string>(''); // Store the ID of the selected medication
    const [quantidade, setQuantidade] = useState<string>('');
    const [lote, setLote] = useState<string>('');
    const [dataEntrada, setDataEntrada] = useState<string>(new Date().toISOString().split('T')[0]);
    const [medicamentosList, setMedicamentosList] = useState<Medicamento[]>([]); // State to hold fetched medications
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [fetchingMeds, setFetchingMeds] = useState<boolean>(true); // Loading state for medication list

    // --- Fetch medicamentos for dropdown
    useEffect(() => {
        const fetchMedicamentos = async () => {
            setFetchingMeds(true);
            setError(null);
            try {
                // Uncomment and use your actual db instance
                const querySnapshot = await getDocs(collection(db, "medicamentos"));
                const medsData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Medicamento[]; // Type assertion
                setMedicamentosList(medsData);

                // --- Mock Data ---
                await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate fetch delay
                const mockMeds: Medicamento[] = [
                    { id: 'med1', nome: 'Paracetamol', dosagem: '500mg', quantidadeEstoque: 50 },
                    { id: 'med2', nome: 'Ibuprofeno', dosagem: '200mg', quantidadeEstoque: 100 },
                    { id: 'med3', nome: 'Amoxicilina', dosagem: '250mg/5ml', quantidadeEstoque: 20 },
                ];
                setMedicamentosList(mockMeds);
                // --- End Mock Data ---

            } catch (err) {
                console.error("Error fetching medications: ", err);
                setError("Erro ao buscar lista de medicamentos.");
                setMedicamentosList([]); // Clear list on error
            } finally {
                setFetchingMeds(false);
            }
        };

        fetchMedicamentos();
    }, []); // Empty dependency array means run once on mount

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

        setLoading(true);
        const selectedMedicamento = medicamentosList.find(med => med.id === medicamentoId);
        console.log('Registrando entrada:', {
            medicamentoId,
            medicamentoNome: selectedMedicamento?.nome, // Get name for logging/record
            quantidade: quantidadeNum,
            lote,
            dataEntrada
        });

        // --- Firebase Logic ---
        try {
            // Uncomment and use your actual db instance
            // // 1. Add entry to 'entradas' collection
            await addDoc(collection(db, "entradas"), {
                medicamentoId: medicamentoId,
                medicamentoNome: selectedMedicamento?.nome || 'Nome não encontrado', // Store name for easier display
                quantidade: quantidadeNum,
                lote: lote,
                dataEntrada: dataEntrada, // Store as string or convert to Timestamp
                timestamp: serverTimestamp()
            });
            //
            // // 2. Update stock quantity in 'medicamentos' collection
            const medRef = doc(db, "medicamentos", medicamentoId);
            await updateDoc(medRef, {
                quantidadeEstoque: increment(quantidadeNum) // Use Firestore increment
            });

            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            alert('Entrada registrada com sucesso! (Simulado)');
            // Clear form or navigate away
            setMedicamentoId('');
            setQuantidade('');
            setLote('');
            setDataEntrada(new Date().toISOString().split('T')[0]);
            navigate('/home'); // Navigate back

        } catch (err) {
            console.error("Error registering entry: ", err);
            setError('Erro ao registrar entrada. Tente novamente.');
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
                    <FileText className="h-12 w-12 mx-auto text-green-600 mb-2" />
                    <h2 className="text-2xl font-bold text-gray-800">Registrar Entrada de Medicamento</h2>
                    <p className="text-gray-500 text-sm">Informe os detalhes da entrada no estoque.</p>
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
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
                            disabled={loading || fetchingMeds || medicamentosList.length === 0}
                        >
                            <option value="" disabled>
                                {fetchingMeds ? 'Carregando medicamentos...' : (medicamentosList.length === 0 ? 'Nenhum medicamento encontrado' : 'Selecione...')}
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
                        <label htmlFor="quantidade" className="block text-sm font-medium text-gray-700 mb-1">Quantidade Recebida <span className="text-red-500">*</span></label>
                        <input
                            type="number"
                            id="quantidade"
                            value={quantidade}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuantidade(e.target.value)}
                            required
                            min="1"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
                            placeholder="Ex: 100"
                            disabled={loading || fetchingMeds}
                        />
                    </div>

                    {/* Lote */}
                    <div>
                        <label htmlFor="lote" className="block text-sm font-medium text-gray-700 mb-1">Lote / Origem</label>
                        <div className="relative">
                            <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                id="lote"
                                value={lote}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLote(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
                                placeholder="Número do lote ou doador"
                                disabled={loading || fetchingMeds}
                            />
                        </div>
                    </div>

                    {/* Data Entrada */}
                    <div>
                        <label htmlFor="dataEntrada" className="block text-sm font-medium text-gray-700 mb-1">Data de Entrada</label>
                        <div className="relative">
                            <CalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="date"
                                id="dataEntrada"
                                value={dataEntrada}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDataEntrada(e.target.value)}
                                required
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
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
                        className="w-full flex justify-center items-center py-3 px-4 bg-green-600 text-white font-medium rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading || fetchingMeds}
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">...</svg>
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
