import React from 'react';

const TermosScreen = () => {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Termos de Uso</h1>
      <p className="mb-4">
        Ao utilizar esta aplicação, o usuário concorda com os seguintes termos:
      </p>
      <ul className="list-disc pl-6 mb-4">
        <li>Uso permitido apenas para fins legítimos e autorizados.</li>
        <li>É proibida a tentativa de burlar sistemas de segurança ou copiar dados não autorizados.</li>
        <li>Responsabilidade pelo sigilo das credenciais de acesso é do usuário.</li>
      </ul>
      <p className="mb-4">
        O uso indevido da aplicação pode resultar em suspensão de acesso e medidas legais.
      </p>
      <p className="text-blue-600">
        <a href="https://fullture.com/o-que-e-termo-de-uso/" target="_blank" rel="noopener noreferrer">
          Saiba mais sobre termos de uso
        </a>
      </p>
    </div>
  );
};

export default TermosScreen;