import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';  // Firestore funções
import { db } from '../firebase';  // Importando Firestore configurado

import { getAuth } from 'firebase/auth'; // Para pegar o UID do usuário logado

const NotificationSettings = () => {
  const [notificationMethod, setNotificationMethod] = useState('App');
  const [frequency, setFrequency] = useState('Por evento');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      console.error("Nenhum usuário logado.");
      return;
    }

    const userId = user.uid;  // Agora usando o UID real do usuário logado

    try {
      // Criar ou atualizar o documento no Firestore
      await setDoc(doc(db, 'notifications', userId), {
        notificationMethod,
        frequency,
      });

      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (error) {
      console.error("Erro ao salvar configurações: ", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">Configurações de Notificações</h1>

        {isSuccess && (
          <div className="mb-4 text-center text-green-500 font-semibold">
            Configurações salvas com sucesso!
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Forma de Notificação</label>
            <select
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              value={notificationMethod}
              onChange={(e) => setNotificationMethod(e.target.value)}
            >
              <option>App</option>
              <option>Email</option>
              <option>WhatsApp</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Frequência</label>
            <select
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
            >
              <option>Por evento</option>
              <option>Diário</option>
              <option>Dia programado</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 transition-colors text-white font-semibold py-3 rounded-lg shadow-md"
          >
            Salvar Configurações
          </button>
        </form>
      </div>
    </div>
  );
};

export default NotificationSettings;
