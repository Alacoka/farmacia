import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
    collection,
    getDocs,
    doc,
    updateDoc,
    Timestamp,
} from "firebase/firestore";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { format } from "date-fns";

interface Movimentacao {
    id: string;
    tipo: "entrada" | "saida";
    medicamento: string;
    quantidade: number;
    data: Timestamp;
    usuario: string;
}

export default function Movimentacoes() {
    const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
    const [modalAberto, setModalAberto] = useState(false);
    const [selecionada, setSelecionada] = useState<Movimentacao | null>(null);
    const [quantidadeEditada, setQuantidadeEditada] = useState("");

    const carregarMovimentacoes = async () => {
        const entradasSnap = await getDocs(collection(db, "entradas"));
        const saidasSnap = await getDocs(collection(db, "saidas"));

        const entradas = entradasSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            tipo: "entrada",
        }));

        const saidas = saidasSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            tipo: "saida",
        }));

        const todas = [...entradas, ...saidas].filter((mov) => mov.data && mov.data.seconds);

        todas.sort((a, b) => b.data.seconds - a.data.seconds);

        setMovimentacoes(todas);
    };
      

    useEffect(() => {
        carregarMovimentacoes();
    }, []);

    const abrirModal = (mov: Movimentacao) => {
        setSelecionada(mov);
        setQuantidadeEditada(mov.quantidade.toString());
        setModalAberto(true);
    };

    const salvarEdicao = async () => {
        if (!selecionada) return;

        const novaQtd = parseInt(quantidadeEditada);
        if (isNaN(novaQtd)) return alert("Quantidade inválida");

        const ref = doc(db, selecionada.tipo === "entrada" ? "entradas" : "saidas", selecionada.id);
        await updateDoc(ref, { quantidade: novaQtd });

        setModalAberto(false);
        setSelecionada(null);
        carregarMovimentacoes();
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Histórico de Movimentações</h1>
            <div className="grid grid-cols-1 gap-4">
                {movimentacoes.map((mov) => (
                    <div
                        key={mov.id}
                        className="bg-white p-4 rounded shadow flex justify-between items-center"
                    >
                        <div>
                            <p className="font-semibold">{mov.medicamento}</p>
                            <p className="text-sm text-gray-600">
                                {mov.tipo === "entrada" ? "Entrada" : "Saída"} | Quantidade:{" "}
                                {mov.quantidade} |{" "}
                                {format(mov.data.toDate(), "dd/MM/yyyy HH:mm")} | Usuário:{" "}
                                {mov.usuario}
                            </p>
                        </div>
                        <Button onClick={() => abrirModal(mov)}>Editar</Button>
                    </div>
                ))}
            </div>

            <Dialog open={modalAberto} onOpenChange={setModalAberto}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Movimentação</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p>
                            <strong>Medicamento:</strong> {selecionada?.medicamento}
                        </p>
                        <Input
                            type="number"
                            value={quantidadeEditada}
                            onChange={(e) => setQuantidadeEditada(e.target.value)}
                        />
                        <Button onClick={salvarEdicao}>Salvar</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
