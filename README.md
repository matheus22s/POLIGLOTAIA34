# 🌐 Polyglot AI - Tradutor & Professor de Idiomas

> **Polyglot AI** é uma plataforma inteligente de tradução, prática de conversação e ensino de idiomas potencializada pelo **Google Gemini 3.8 Flash**, combinando tradução com insights culturais, correção gramatical em tempo real e flashcards de vocabulário.

---

## 🌟 Funcionalidades

### 1. 🔄 Tradutor Inteligente
- **Suporte a 16 Idiomas**: Inglês, Espanhol, Francês, Alemão, Italiano, Japonês, Mandarim, Coreano, Russo, Árabe, Holandês, Polonês, Turco, Sueco, Hindi e Português.
- **Detecção Automática**: Detecta instantaneamente o idioma de origem.
- **Pares Populares**: Atalhos de 1 clique para combinações comuns (PT ➔ EN, EN ➔ PT, PT ➔ ES, PT ➔ FR, etc.).
- **Notas Gramaticais & Contexto Cultural**: Explicação de nível de formalidade, gírias e contexto de uso para soar natural.
- **Termos-Chave Destacados**: Salve palavras-chave diretamente para sua lista de estudos com 1 clique.
- **Áudio Nativo (TTS)**: Ouça a pronúncia correta em qualquer idioma com controle de voz do navegador.
- **Voz para Texto (Mic)**: Fale no microfone para traduzir sem precisar digitar.
- **Histórico**: Acesso rápido às últimas traduções realizadas.

### 2. 🎓 Professor IA (Tutor Interativo)
- **Níveis de Proficiência**: Iniciante (A1-A2), Intermediário (B1-B2) e Avançado (C1-C2).
- **Estilos Pedagógicos**:
  - 😊 *Encorajador e Paciente*
  - ✏️ *Foco Gramatical Rigoroso*
  - 🗣️ *Conversação Informal & Gírias*
  - 💼 *Negócios & Corporativo*
- **Cenários do Cotidiano**: Simule diálogos em Restaurantes, Aeroportos, Hotéis, Entrevistas de Emprego e Consultas Médicas.
- **Correção em Tempo Real**: Feedback amigável explicando o erro e sugerindo a forma mais natural de se expressar.
- **Explicar com Tutor IA**: Botão integrado no tradutor que envia qualquer frase traduzida diretamente para uma aula explicativa com o professor.

### 3. 🗂️ Vocabulário Salvo & Flashcards
- Palavras recomendadas pelo professor são adicionadas ao vocabulário salvo.
- **Modo Flashcards**: Treine a memorização virando os cartões para testar tradução, ouvindo a pronúncia e marcando palavras aprendidas.

### 4. 🌗 Temas & Usabilidade
- Suporte a Modo Escuro (Dark) e Modo Claro (Light).
- Design responsivo adaptado para celulares, tablets e desktops.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS v4](https://tailwindcss.com/), [Lucide React](https://lucide.dev/) (ícones), [Motion](https://motion.dev/).
- **Backend**: [Express](https://expressjs.com/), [tsx](https://github.com/privatenumber/tsx), [dotenv](https://github.com/motdotla/dotenv).
- **Inteligência Artificial**: SDK oficial [`@google/genai`](https://www.npmjs.com/package/@google/genai) com o modelo **Gemini 3.8 Flash**.
- **Ferramentas de Build & Teste**: [Vite](https://vite.dev/), `node:test` e `node:assert/strict`.

---

## 🚀 Como Executar o Projeto Localmente

### 1. Pré-requisitos
- [Node.js](https://nodejs.org/) versão 18 ou superior.
- Uma chave de API do [Google AI Studio](https://aistudio.google.com/) (gratuita).

### 2. Clonar o Repositório
```bash
git clone https://github.com/SEU_USUARIO/polyglot-ai.git
cd polyglot-ai
```

### 3. Instalar Dependências
```bash
npm install
```

### 4. Configurar as Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto baseado no `.env.example`:

```bash
cp .env.example .env
```

Abra o `.env` e insira sua chave da API do Google Gemini:
```env
GEMINI_API_KEY="sua_chave_aqui"
```

> **Nota:** Caso execute sem a chave configurada, o aplicativo conta com respostas e dados de fallback estruturados para permitir navegação e testes.

### 5. Iniciar o Servidor de Desenvolvimento
```bash
npm run dev
```

Abra no navegador em: [http://localhost:3000](http://localhost:3000)

---

## 🧪 Executando os Testes Unitários

O projeto conta com testes unitários em lógica pura usando o executor de testes nativo do Node.js:

```bash
npm test
```

---

## 📦 Build para Produção

Para gerar o build de produção e iniciar o servidor:

```bash
npm run build
npm start
```

---

## 📁 Estrutura do Projeto

```
polyglot-ai/
├── src/
│   ├── components/
│   │   ├── Header.tsx           # Cabeçalho, navegação e alternador de tema
│   │   ├── TranslationView.tsx  # Tela principal de tradução e insights culturais
│   │   ├── TutorView.tsx        # Chat interativo com o professor de idiomas
│   │   ├── FlashcardModal.tsx   # Modal de cartões para estudo de vocabulário
│   │   └── Toast.tsx            # Notificações contextuais
│   ├── types/
│   │   └── index.ts             # Tipagens TypeScript
│   ├── utils/
│   │   ├── languages.ts         # Metadados dos 16 idiomas suportados
│   │   ├── languages.test.ts    # Testes unitários de idiomas
│   │   ├── textParser.ts        # Extração de vocabulário e correções
│   │   └── textParser.test.ts   # Testes unitários do parser
│   ├── App.tsx                  # Componente raiz
│   ├── main.tsx                 # Entrada React
│   └── index.css                # Estilos Tailwind CSS
├── server.ts                    # Backend Express com rotas do Gemini API e Vite
├── .env.example                 # Exemplo de variáveis de ambiente
├── .gitignore                   # Arquivos ignorados pelo Git
├── package.json                 # Dependências e scripts
├── tsconfig.json                # Configurações TypeScript
└── vite.config.ts               # Configuração do Vite
```

---

## 📄 Licença

Este projeto é disponibilizado sob a licença [MIT](LICENSE).
