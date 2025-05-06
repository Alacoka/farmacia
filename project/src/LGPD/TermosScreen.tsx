import React from 'react';
import { ScrollView, Text } from 'react-native';

export default function TermosScreen() {
  return (
    <ScrollView className="flex-1 p-4 bg-white">
      <Text className="text-xl font-bold mb-4">Termos de Uso</Text>

      <Text className="font-semibold mb-1">Regras para uso do app</Text>
      <Text className="mb-3">O uso deste aplicativo é permitido apenas para maiores de 18 anos. É proibido utilizá-lo para atividades ilícitas.</Text>

      <Text className="font-semibold mb-1">Responsabilidades do usuário</Text>
      <Text className="mb-3">Você é responsável por manter suas informações corretas e por toda atividade realizada em sua conta.</Text>

      <Text className="font-semibold mb-1">Limitações de responsabilidade</Text>
      <Text className="mb-3">O desenvolvedor não se responsabiliza por danos causados por uso indevido do aplicativo.</Text>

      <Text className="font-semibold mb-1">Modificações nos serviços</Text>
      <Text className="mb-3">O app pode ser atualizado ou ter recursos alterados sem aviso prévio.</Text>

      <Text className="font-semibold mb-1">Encerramento de conta</Text>
      <Text>Reservamo-nos o direito de suspender ou excluir contas que violem estes termos.</Text>
    </ScrollView>
  );
}
