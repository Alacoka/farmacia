import React from 'react';

const NotificationSettings = () => {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Configurações de Notificações</h1>
      
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Forma de Notificação</label>
          <select className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
            <option>App</option>
            <option>Email</option>
            <option>WhatsApp</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Frequência</label>
          <select className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
            <option>Por evento</option>
            <option>Diário</option>
            <option>Dia programado</option>
          </select>
        </div>

        <button type="submit" className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          Salvar Configurações
        </button>
      </form>
    </div>
  );
};

export default NotificationSettings;
