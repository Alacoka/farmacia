import React from 'react';
import { ScrollView, Text } from 'react-native';

export default function PrivacidadeScreen() {
  return (
    <ScrollView className="flex-1 p-4 bg-white">
      <Text className="text-xl font-bold mb-4">Política de Privacidade</Text>

      <Text className="font-semibold mb-1">Como os dados são coletados</Text>
      <Text className="mb-3">Coletamos dados fornecidos no cadastro e durante o uso do app, como nome, e-mail e localização.</Text>

      <Text className="font-semibold mb-1">Finalidade do uso</Text>
      <Text className="mb-3">Utilizamos os dados para oferecer funcionalidades, melhorar a experiência do usuário e garantir segurança.</Text>

      <Text className="font-semibold mb-1">Compartilhamento com terceiros</Text>
      <Text className="mb-3">Não compartilhamos dados com terceiros, exceto quando exigido por lei ou com consentimento explícito.</Text>

      <Text className="font-semibold mb-1">Segurança e retenção dos dados</Text>
      <Text className="mb-3">Os dados são armazenados com criptografia e medidas de proteção. São retidos apenas enquanto forem necessários.</Text>

      <Text className="font-semibold mb-1">Direitos do usuário</Text>
      <Text>Você pode acessar, corrigir ou excluir seus dados a qualquer momento, conforme garantido pela LGPD.</Text>
    </ScrollView>
  );
}
