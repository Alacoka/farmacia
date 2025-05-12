import React from 'react';

const PrivacidadeScreen = () => {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Política de Privacidade</h1>
      <p className="mb-4">
        Esta aplicação respeita e protege a privacidade dos dados dos seus usuários, seguindo os princípios estabelecidos pela LGPD.
      </p>
      <p className="mb-4">
        Os dados coletados são utilizados exclusivamente para fins operacionais da aplicação e não são compartilhados com terceiros sem consentimento.
      </p>
      <p className="mb-4">
        As práticas adotadas envolvem criptografia, controle de acesso e armazenamento seguro.
      </p>
      <p className="text-blue-600">
        <a href="https://getprivacy.com.br/o-que-e-como-elaborar-uma-politica-de-privacidade/" target="_blank" rel="noopener noreferrer">
          Saiba mais sobre como elaborar uma política de privacidade
        </a>
      </p>
    </div>
  );
};

export default PrivacidadeScreen;