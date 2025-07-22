# Timeline Project System

Sistema web completo para acompanhamento de projetos através de timeline visual interativa, desenvolvido com React, TypeScript e Supabase.

## 🚀 Funcionalidades Principais

### Para Administradores
- **Gestão completa de clientes**: Criar, editar e gerenciar clientes
- **Gestão de projetos**: Criar e acompanhar múltiplos projetos
- **Timeline interativa**: Atualizar status das etapas em tempo real
- **Upload de arquivos**: Fazer upload de documentos para cada etapa
- **Dashboard analítico**: Visualizar métricas e progresso geral

### Para Clientes
- **Visualização de projetos**: Acompanhar seus projetos ativos
- **Timeline read-only**: Visualizar progresso das etapas
- **Download de arquivos**: Acessar documentos disponibilizados

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 18+ com TypeScript
- **Estilização**: Tailwind CSS (classes core)
- **Banco de Dados**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth com RLS
- **Storage**: Google Drive API
- **Build Tool**: Vite
- **Hospedagem**: Vercel/Netlify

## 📋 Pré-requisitos

- Node.js 18+ instalado
- NPM ou Yarn
- Conta no [Supabase](https://supabase.com)
- Projeto no [Google Cloud Console](https://console.cloud.google.com) com Drive API habilitada
- Git instalado

## 🔧 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/timeline-project-system.git
cd timeline-project-system
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais:

```env
# Supabase
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima

# Google Drive API
VITE_GOOGLE_CLIENT_ID=seu-client-id.apps.googleusercontent.com
VITE_GOOGLE_API_KEY=sua-api-key
VITE_GOOGLE_DRIVE_FOLDER_ID=id-da-pasta-raiz-no-drive
```

### 4. Configure o Supabase

1. Crie um novo projeto no [Supabase](https://app.supabase.com)
2. Execute o script SQL fornecido em `database/schema.sql` no editor SQL do Supabase
3. Configure as políticas RLS conforme necessário

### 5. Configure o Google Drive API

1. Acesse o [Google Cloud Console](https://console.cloud.google.com)
2. Crie um novo projeto ou selecione um existente
3. Ative a Google Drive API
4. Crie credenciais OAuth 2.0 e uma chave de API
5. Configure as URLs autorizadas (adicione `http://localhost:5173` para desenvolvimento)

## 🚀 Executando o Projeto

### Modo de desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

### Build para produção

```bash
npm run build
```

### Preview do build

```bash
npm run preview
```

## 📝 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria o build de produção
- `npm run preview` - Visualiza o build de produção localmente
- `npm run lint` - Executa o linter
- `npm run format` - Formata o código com Prettier
- `npm run type-check` - Verifica tipos TypeScript
- `npm run test` - Executa os testes
- `npm run test:watch` - Executa os testes em modo watch
- `npm run test:coverage` - Gera relatório de cobertura

## 📁 Estrutura do Projeto

```
timeline-project-system/
├── src/
│   ├── components/      # Componentes reutilizáveis
│   ├── contexts/        # Contextos React
│   ├── hooks/           # Hooks customizados
│   ├── lib/             # Configurações e utilitários
│   ├── pages/           # Páginas da aplicação
│   ├── services/        # Serviços externos
│   ├── types/           # Tipos TypeScript
│   └── utils/           # Funções utilitárias
├── public/              # Arquivos públicos
├── database/            # Scripts SQL
└── docs/                # Documentação adicional
```

## 🔐 Autenticação e Segurança

O sistema utiliza Supabase Auth com Row Level Security (RLS) para garantir que:
- Administradores podem gerenciar todos os dados
- Clientes podem apenas visualizar seus próprios projetos
- Upload de arquivos é restrito a administradores
- Todas as operações são validadas no backend

## 📊 Fases e Etapas do Timeline

### Fase 1: Diagnóstico
1. Análise da situação atual
2. Análise de mercado
3. Diagnóstico do processo comercial
4. Mapeamento da jornada do cliente
5. Avaliação de canais ativos e funil atual
6. Persona
7. Matriz SWOT
8. Benchmark com concorrentes

### Fase 2: Posicionamento
1. Proposta de valor
2. Visão de futuro
3. Plano de ação
4. Criação de linha editorial
5. Posicionamento

## 🌐 Deploy

### Vercel

```bash
npm i -g vercel
vercel
```

### Netlify

1. Conecte seu repositório ao Netlify
2. Configure as variáveis de ambiente
3. Build command: `npm run build`
4. Publish directory: `dist`

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Autores

- Seu Nome - [@seu-usuario](https://github.com/seu-usuario)

## 📞 Suporte

Para suporte, envie um email para suporte@suaempresa.com ou abra uma issue no GitHub.

## 🔍 Status do Projeto

🟢 **Em Produção** - Versão 1.0.0

---

Desenvolvido com ❤️ pela Sua Empresa