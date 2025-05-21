import { useEffect, useRef, useState } from 'react';
import { db } from '../firebase';
import {
    collection,
    onSnapshot,
    query,
    orderBy
} from 'firebase/firestore';

interface Props {
    show: boolean;
    onClose: () => void;
    onNewNotification?: () => void;
    onClickNotification?: () => void;
}

interface Notificacao {
    mensagem: string;
    data: Date;
}

const Notifications = ({
    show,
    onClose,
    onNewNotification,
    onClickNotification,
}: Props) => {
    const [notifications, setNotifications] = useState<Notificacao[]>([]);
    const ref = useRef<HTMLDivElement>(null);

    const addNotification = (mensagem: string, data: Date) => {
        setNotifications(prev => {
            const novaLista = [{ mensagem, data }, ...prev];
            const ordenada = novaLista
                .sort((a, b) => b.data.getTime() - a.data.getTime())
                .slice(0, 20); // total máximo de 20 notificações
            return ordenada;
        });
        onNewNotification?.();
    };

    useEffect(() => {
        if (!show) return;

        const unsubEntradas = onSnapshot(
            query(collection(db, 'entradas'), orderBy('timestamp', 'desc')),
            snapshot => {
                snapshot.docChanges().forEach(change => {
                    if (change.type === 'added') {
                        const data = change.doc.data();
                        const msg = `Entrada: ${data.quantidade}x ${data.medicamentoNome}`;
                        addNotification(msg, data.timestamp?.toDate?.() || new Date());
                    }
                });
            }
        );

        const unsubSaidas = onSnapshot(
            query(collection(db, 'saidas'), orderBy('timestamp', 'desc')),
            snapshot => {
                snapshot.docChanges().forEach(change => {
                    if (change.type === 'added') {
                        const data = change.doc.data();
                        const msg = `Saída: ${data.quantidade}x ${data.medicamentoNome}`;
                        addNotification(msg, data.timestamp?.toDate?.() || new Date());
                    }
                });
            }
        );

        const unsubMedicamentos = onSnapshot(
            query(collection(db, 'medicamentos'), orderBy('dataCadastro', 'desc')),
            snapshot => {
                snapshot.docChanges().forEach(change => {
                    if (change.type === 'added') {
                        const data = change.doc.data();
                        const msg = `Novo medicamento cadastrado: ${data.nome}`;
                        addNotification(msg, data.dataCadastro?.toDate?.() || new Date());
                    }
                });
            }
        );

        return () => {
            unsubEntradas();
            unsubSaidas();
            unsubMedicamentos();
        };
    }, [show]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    if (!show) return null;

    return (
        <div
            ref={ref}
            className="absolute top-10 right-0 w-72 max-h-80 overflow-y-auto bg-white shadow-lg rounded-lg p-4 z-50"
        >
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Notificações</h4>
            {notifications.length === 0 ? (
                <p className="text-sm text-gray-700">Nenhuma movimentação recente.</p>
            ) : (
                <ul className="space-y-2">
                    {notifications.map((note, index) => (
                        <li
                            key={index}
                            className="text-sm text-gray-800 border-b pb-2 last:border-b-0 cursor-pointer"
                            onClick={() => onClickNotification?.()}
                        >
                            {note.mensagem}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Notifications;
