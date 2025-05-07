import React from 'react';

const LGPDScreen = () => {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Conformidade e LGPD</h1>
      <p className="mb-4">
        Conformidade de software é o alinhamento do software com normas, regulamentos e políticas.
        Isso abrange o design, desenvolvimento, implantação e uso do software.
      </p>
      <ul className="list-disc pl-6 mb-4">
        <li>Garantir que o software atende a critérios de segurança, privacidade, qualidade e ética.</li>
        <li>Cumprir com requisitos legais, padrões da indústria e políticas organizacionais.</li>
        <li>Garantir que o software é licenciado e autorizado para uso.</li>
        <li>Proteger dados confidenciais, como informações pessoais, médicas e financeiras.</li>
      </ul>
      <h2 className="text-2xl font-semibold mt-6 mb-2">Fontes de Conformidade</h2>
      <ul className="list-disc pl-6 mb-4">
        <li>Requisitos legais</li>
        <li>Padrões da indústria</li>
        <li>Políticas organizacionais</li>
        <li>Contratos de licenciamento</li>
        <li>Regulamentações governamentais</li>
      </ul>
      <h2 className="text-2xl font-semibold mt-6 mb-2">Importância da Conformidade</h2>
      <ul className="list-disc pl-6">
        <li>A conformidade é crítica devido à rápida evolução tecnológica e à inovação.</li>
        <li>É uma preocupação empresarial prevalente devido ao aumento de regulamentações.</li>
        <li>Ajuda a proteger a organização e os interesses do consumidor.</li>
      </ul>
      <div className="mt-8">
        <p className="text-blue-600">
          <a href="https://blog.ateliware.com/lgpd-desenvolvimento-software/" target="_blank" rel="noopener noreferrer">
            Introdução à LGPD no desenvolvimento de software
          </a>
        </p>
      </div>
    </div>
  );
};

export default LGPDScreen;