# 🏥 Sistema de Gestão para Farmácia

Um sistema moderno, escalável e inteligente para gestão de farmácias e drogarias. Desenvolvido com foco em alta performance, usabilidade intuitiva e integração com ferramentas de Inteligência Artificial para otimização de processos e tomada de decisão.

## 🚀 Tecnologias Utilizadas

Este projeto foi construído utilizando um ecossistema robusto de tecnologias modernas:

### Frontend
* **[React 18](https://reactjs.org/)** + **[Vite](https://vitejs.dev/)**: Core da aplicação, garantindo alta performance e build otimizado.
* **[TypeScript](https://www.typescriptlang.org/)**: Tipagem estática para maior segurança, autocompletar e manutenibilidade do código.
* **[Tailwind CSS](https://tailwindcss.com/)**: Estilização utilitária para uma interface responsiva, padronizada e moderna.
* **[Framer Motion](https://www.framer.com/motion/)**: Criação de animações fluidas e transições interativas.
* **[Radix UI](https://www.radix-ui.com/)**: Componentes base acessíveis (primitivos).
* **[Lucide React](https://lucide.dev/)** & **[React Icons](https://react-icons.github.io/react-icons/)**: Bibliotecas de iconografia rica e leve.

### Backend & Cloud Services
* **[Firebase](https://firebase.google.com/)**: Utilizado para Autenticação segura (`@firebase/auth`), Banco de Dados e Cloud Functions.
* **[Express](https://expressjs.com/)**: Servidor Node.js para criação de endpoints e rotas customizadas.
* **[SendGrid](https://sendgrid.com/)**: Serviço de disparo de e-mails transacionais e notificações automatizadas.

### Inteligência Artificial
* **[Genkit AI](https://firebase.google.com/docs/genkit)** & **[Vertex AI](https://cloud.google.com/vertex-ai)**: Integração com os modelos de IA do Google para recursos avançados.
* **[ChatGPT API](https://openai.com/)**: Processamento de linguagem natural, podendo atuar como assistente virtual ou analisador de dados.

### Utilitários & Relatórios (Dashboards)
* **[Recharts](https://recharts.org/)**: Geração de gráficos e dashboards interativos para análise de vendas e estoque.
* **[jsPDF](https://parall.ax/products/jspdf)** & **[jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable)**: Geração e exportação instantânea de relatórios gerenciais e recibos em formato PDF.
* **[XLSX](https://sheetjs.com/)** & **[File-Saver](https://github.com/eligrey/FileSaver.js/)**: Exportação de dados estruturados para planilhas Excel.
* **[Date-fns](https://date-fns.org/)**: Manipulação, formatação e cálculos avançados de datas e horários.
* **[React Hot Toast](https://react-hot-toast.com/)** / **[React Toastify](https://fkhadra.github.io/react-toastify/)**: Feedback visual e notificações em tempo real para as ações do usuário.

## ⚙️ Principais Funcionalidades
- **Autenticação e Autorização:** Login seguro e controle de acesso via Firebase Auth.
- **Painel Analítico:** Dashboards visuais com indicadores de desempenho da farmácia.
- **Geração de Relatórios:** Exportação de dados de movimentação e estoque em PDF e Excel.
- **Assistente IA Integrado:** Suporte inteligente para buscas complexas ou análise de dados usando modelos do Google e OpenAI.
- **Comunicação Ativa:** Envio de alertas e e-mails automatizados usando SendGrid.
- **Interface Reativa:** Feedback instantâneo para o usuário através de toasts e animações de estado.

## 🛠️ Como Executar o Projeto

### Pré-requisitos
* [Node.js](https://nodejs.org/) (versão 18+ recomendada)
* NPM ou Yarn instalado na máquina.

### Passos para Instalação

1. Clone o repositório:
    ```bash
    git clone [https://github.com/seu-usuario/nome-do-repositorio.git](https://github.com/seu-usuario/nome-do-repositorio.git)
    ```

2. Acesse o diretório do projeto:
    ```bash
    cd farmacia
    ```

3. Instale as dependências:
    ```bash
    npm install
    ```

4. Configure as variáveis de ambiente:
Crie um arquivo `.env` na raiz do projeto e preencha com as suas credenciais do Firebase, OpenAI e SendGrid (use o `.env.example` como base, se houver).

5. Inicie o servidor de desenvolvimento:
    ```bash
    npm run dev
    ```

A aplicação estará disponível no seu navegador em `http://localhost:5173`.

## 📜 Scripts NPM Disponíveis

* `npm run dev`: Inicia o ambiente de desenvolvimento local via Vite.
* `npm run build`: Gera os arquivos estáticos otimizados para produção na pasta `dist`.
* `npm run preview`: Sobe um servidor local para testar a versão gerada pelo comando de build.

## 👨‍💻 Autor

Desenvolvido por **Kawã Alacoque**, **Erick Silvestre**, **Vinicius Wingeter**, **Luiz Benicio** e **Leandro Mizuta**.

- [LinkedIn](https://www.linkedin.com/in/kawaalacoque/)
- [Portfólio]([https://seu-portfolio.com](https://portifolio-alacoque.vercel.app/))
