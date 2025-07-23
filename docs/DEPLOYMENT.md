# Guia de Deploy - Timeline Project System

## Índice

- [Pré-requisitos](#pré-requisitos)
- [Deploy no Vercel](#deploy-no-vercel)
- [Deploy no Netlify](#deploy-no-netlify)
- [Configuração do Supabase](#configuração-do-supabase)
- [Configuração do Google Drive](#configuração-do-google-drive)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [CI/CD com GitHub Actions](#cicd-com-github-actions)
- [Monitoramento](#monitoramento)
- [Troubleshooting](#troubleshooting)

## Pré-requisitos

Antes de fazer o deploy, certifique-se de ter:

- [ ] Conta no Supabase com projeto criado
- [ ] Conta no Google Cloud com Drive API habilitada
- [ ] Conta na Vercel ou Netlify
- [ ] Código fonte no GitHub
- [ ] Variáveis de ambiente configuradas
- [ ] Banco de dados configurado com schema
- [ ] RLS (Row Level Security) configurado

## Deploy no Vercel

### 1. Via GitHub (Recomendado)

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em "New Project"
3. Importe o repositório do GitHub
4. Configure as variáveis de ambiente:
   ```
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-anonima
   VITE_GOOGLE_CLIENT_ID=seu-client-id.apps.googleusercontent.com
   VITE_GOOGLE_API_KEY=sua-api-key
   VITE_GOOGLE_DRIVE_FOLDER_ID=id-da-pasta-raiz
   ```
5. Configurações de build:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
6. Clique em "Deploy"

### 2. Via CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Na pasta do projeto
vercel

# Seguir os prompts e configurar:
# - Link ao projeto existente ou criar novo
# - Configurar variáveis de ambiente
# - Confirmar configurações de build
```

### 3. Configuração de Domínio

1. No dashboard da Vercel, vá em "Settings" → "Domains"
2. Adicione seu domínio customizado
3. Configure DNS no seu provedor:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

## Deploy no Netlify

### 1. Via GitHub

1. Acesse [netlify.com](https://netlify.com) e faça login
2. Clique em "Add new site" → "Import an existing project"
3. Conecte ao GitHub e selecione o repositório
4. Configure o build:
   ```
   Base directory: /
   Build command: npm run build
   Publish directory: dist
   ```
5. Adicione variáveis de ambiente em "Site settings" → "Environment variables"
6. Deploy!

### 2. Via CLI

```bash
# Instalar Netlify CLI
npm i -g netlify-cli

# Na pasta do projeto
netlify init

# Build local
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

### 3. Arquivo netlify.toml

Crie `netlify.toml` na raiz do projeto:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

## Configuração do Supabase

### 1. Criar Projeto

1. Acesse [app.supabase.com](https://app.supabase.com)
2. Crie novo projeto
3. Anote a URL e anon key

### 2. Configurar Banco de Dados

```sql
-- No SQL Editor do Supabase, execute:
-- (conteúdo do arquivo database/schema.sql)
```

### 3. Configurar RLS

Para cada tabela, configure as políticas:

```sql
-- Exemplo para tabela projetos
ALTER TABLE projetos ENABLE ROW LEVEL SECURITY;

-- Admin pode tudo
CREATE POLICY "Admin full access" ON projetos
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Cliente vê apenas seus projetos
CREATE POLICY "Cliente read own" ON projetos
  FOR SELECT USING (
    cliente_id IN (
      SELECT cliente_id FROM users 
      WHERE id = auth.uid()
    )
  );
```

### 4. Configurar Autenticação

1. Em "Authentication" → "Providers", habilite "Email"
2. Configure templates de email se necessário
3. Ajuste "Auth settings":
   - Site URL: `https://seu-dominio.com`
   - Redirect URLs: `https://seu-dominio.com/*`

### 5. Configurar Storage (Opcional)

Se usar Supabase Storage além do Google Drive:

```sql
-- Criar bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('arquivos', 'arquivos', false);

-- Configurar políticas
CREATE POLICY "Admin upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'arquivos' AND
    auth.jwt() ->> 'role' = 'admin'
  );
```

## Configuração do Google Drive

### 1. Criar Projeto no Google Cloud

1. Acesse [console.cloud.google.com](https://console.cloud.google.com)
2. Crie novo projeto ou selecione existente
3. Ative "Google Drive API"

### 2. Criar Credenciais

#### OAuth 2.0 Client ID:
1. APIs & Services → Credentials → Create Credentials
2. Escolha "OAuth client ID"
3. Application type: "Web application"
4. Authorized JavaScript origins:
   - `https://seu-dominio.com`
   - `http://localhost:5173` (desenvolvimento)
5. Authorized redirect URIs:
   - `https://seu-dominio.com`

#### API Key:
1. Create Credentials → API key
2. Restrict key:
   - Application restrictions: HTTP referrers
   - Website restrictions: Seu domínio
   - API restrictions: Google Drive API

### 3. Criar Pasta Raiz

1. No Google Drive, crie pasta "Timeline Projects"
2. Obtenha o ID da pasta (na URL)
3. Configure compartilhamento apropriado

## Variáveis de Ambiente

### Produção

```env
# Supabase
VITE_SUPABASE_URL=https://xyzcompany.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Google Drive
VITE_GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
VITE_GOOGLE_API_KEY=AIzaSyD-abc123...
VITE_GOOGLE_DRIVE_FOLDER_ID=1abc123DEF456...

# Opcional
VITE_API_URL=https://api.seu-dominio.com
VITE_APP_URL=https://seu-dominio.com
```

### Desenvolvimento

Crie `.env.local`:
```env
VITE_SUPABASE_URL=https://localhost-project.supabase.co
VITE_SUPABASE_ANON_KEY=local-anon-key
# ... outras variáveis de dev
```

## CI/CD com GitHub Actions

### 1. Deploy Automático

Crie `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
          VITE_GOOGLE_CLIENT_ID: ${{ secrets.VITE_GOOGLE_CLIENT_ID }}
          VITE_GOOGLE_API_KEY: ${{ secrets.VITE_GOOGLE_API_KEY }}
          VITE_GOOGLE_DRIVE_FOLDER_ID: ${{ secrets.VITE_GOOGLE_DRIVE_FOLDER_ID }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

### 2. Preview Deployments

```yaml
name: Preview Deployment

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  preview:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy Preview
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

## Monitoramento

### 1. Vercel Analytics

```tsx
// Em src/App.tsx
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <>
      {/* Seu app */}
      <Analytics />
    </>
  );
}
```

### 2. Sentry para Erros

```bash
npm install @sentry/react
```

```tsx
// src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://seu-dsn@sentry.io/...",
  environment: import.meta.env.MODE,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay(),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
});
```

### 3. Supabase Logs

No dashboard do Supabase:
- API Logs: Monitore requisições
- Auth Logs: Acompanhe logins
- Database Logs: Veja queries

## Troubleshooting

### Erro: "Supabase URL não definida"

**Solução**: Verifique se as variáveis de ambiente estão configuradas na plataforma de deploy.

### Erro: "Google Drive não autorizado"

**Solução**: 
1. Verifique authorized origins no Google Cloud
2. Limpe cache/cookies
3. Teste em aba anônima

### Build falha no deploy

**Solução**:
```bash
# Teste build local
npm run build

# Verifique erros TypeScript
npm run type-check

# Limpe cache
rm -rf node_modules dist
npm install
npm run build
```

### CORS errors

**Solução**: Configure headers apropriados:

```javascript
// vercel.json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET,POST,PUT,DELETE,OPTIONS" }
      ]
    }
  ]
}
```

### Performance Issues

1. Habilite cache no Vercel/Netlify
2. Use lazy loading para rotas:
   ```tsx
   const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
   ```
3. Otimize imagens
4. Configure CDN

## Checklist de Deploy

- [ ] Variáveis de ambiente configuradas
- [ ] Banco de dados com schema aplicado
- [ ] RLS configurado e testado
- [ ] Google Drive API configurada
- [ ] Domínio configurado
- [ ] SSL/HTTPS ativo
- [ ] Testes passando
- [ ] Build sem erros
- [ ] Analytics configurado
- [ ] Monitoramento de erros ativo
- [ ] Backup do banco configurado
- [ ] Documentação atualizada

## Comandos Úteis

```bash
# Verificar build local
npm run build && npm run preview

# Verificar variáveis de ambiente
npx dotenv-checker

# Deploy manual Vercel
vercel --prod

# Deploy manual Netlify
netlify deploy --prod

# Logs em tempo real
vercel logs --follow
netlify logs:function:stream
```

## Segurança em Produção

1. **Headers de Segurança**: Configure CSP, HSTS, etc
2. **Rate Limiting**: Configure no Supabase
3. **Backup**: Configure backup automático do banco
4. **Monitoring**: Configure alertas para erros
5. **Updates**: Mantenha dependências atualizadas

## Suporte

- Vercel: [vercel.com/docs](https://vercel.com/docs)
- Netlify: [docs.netlify.com](https://docs.netlify.com)
- Supabase: [supabase.com/docs](https://supabase.com/docs)
- Issues: [GitHub Issues](https://github.com/seu-usuario/timeline-project-system/issues)