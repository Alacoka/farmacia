import React from 'react';
import { ScrollView, Text } from 'react-native';

export default function LGPDScreen() {
  return (
    <ScrollView className="flex-1 p-4 bg-white">
      <Text className="text-xl font-bold mb-4">Conformidade e LGPD</Text>

      <Text className="font-semibold mb-1">Consentimento explícito</Text>
      <Text className="mb-3">Ao se cadastrar, você consente com a coleta e uso dos seus dados de forma transparente.</Text>

      <Text className="font-semibold mb-1">Finalidade de uso dos dados</Text>
      <Text className="mb-3">Seus dados são usados exclusivamente para funcionamento e melhorias do app.</Text>

      <Text className="font-semibold mb-1">Direito à portabilidade e eliminação</Text>
      <Text className="mb-3">Você pode solicitar a exportação ou exclusão de seus dados a qualquer momento.</Text>

      <Text className="font-semibold mb-1">Segurança da informação</Text>
      <Text className="mb-3">Adotamos protocolos de segurança para proteger suas informações pessoais contra acessos não autorizados.</Text>

      <Text className="font-semibold mb-1">Controlador de dados</Text>
      <Text>Responsável: Nome da empresa ou pessoa física (inserir aqui). Contato disponível no app ou site oficial.</Text>
    </ScrollView>
  );
}
