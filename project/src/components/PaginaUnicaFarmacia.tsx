import React from 'react';
import { ChevronDown } from 'lucide-react';

const faqItems = [
  {
    question: 'Como faço para cadastrar medicamentos?',
    answer: 'Você pode cadastrar medicamentos acessando a página de Cadastro de Medicamentos no menu principal. Preencha as informações necessárias, como nome, descrição e quantidade.'
  },
  {
    question: 'Como visualizar o estoque atual?',
    answer: 'O estoque atual pode ser visualizado na página principal do sistema, que exibe a quantidade disponível de cada medicamento.'
  },
  {
    question: 'Como registrar a entrada de novos medicamentos?',
    answer: 'Acesse a página de Registro de Entrada, selecione o medicamento e adicione a quantidade que chegou ao estoque.'
  },
  {
    question: 'Como registrar a saída de medicamentos?',
    answer: 'Acesse a página de Registro de Saída, selecione o medicamento e registre a quantidade que foi retirada do estoque.'
  },
  {
    question: 'O que fazer se esqueci minha senha?',
    answer: 'Você pode redefinir sua senha na página de login, clicando na opção “Esqueci minha senha”.'
  }
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-blue-600 mb-6">Perguntas Frequentes</h1>
        <ul className="space-y-6">
          {faqItems.map((item, index) => (
            <li key={index} className="bg-gray-50 p-4 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center justify-between cursor-pointer">
                {item.question}
                <ChevronDown className="h-6 w-6 text-gray-400" />
              </h2>
              <p className="mt-2 text-gray-600">{item.answer}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}


