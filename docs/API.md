# API Documentation - Timeline Project System

## Índice

- [Visão Geral](#visão-geral)
- [Autenticação](#autenticação)
- [Endpoints](#endpoints)
  - [Auth](#auth)
  - [Usuários](#usuários)
  - [Clientes](#clientes)
  - [Projetos](#projetos)
  - [Timeline](#timeline)
  - [Arquivos](#arquivos)
- [Tipos de Dados](#tipos-de-dados)
- [Códigos de Erro](#códigos-de-erro)
- [Rate Limiting](#rate-limiting)

## Visão Geral

A API do Timeline Project System é construída sobre o Supabase, fornecendo endpoints RESTful e funcionalidades em tempo real através de WebSockets. Todas as requisições devem incluir autenticação apropriada.

### Base URL

```
https://seu-projeto.supabase.co/rest/v1/
```

### Headers Padrão

```javascript
{
  "apikey": "sua-chave-anonima",
  "Authorization": "Bearer {token-jwt}",
  "Content-Type": "application/json",
  "Prefer": "return=representation"
}
```

## Autenticação

### Login

```http
POST /auth/v1/token?grant_type=password
```

**Body:**
```json
{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "token-de-refresh",
  "user": {
    "id": "uuid",
    "email": "usuario@exemplo.com",
    "role": "authenticated"
  }
}
```

### Logout

```http
POST /auth/v1/logout
Authorization: Bearer {token}
```

### Refresh Token

```http
POST /auth/v1/token?grant_type=refresh_token
```

**Body:**
```json
{
  "refresh_token": "token-de-refresh"
}
```

## Endpoints

### Auth

#### Obter Usuário Atual

```http
GET /auth/v1/user
Authorization: Bearer {token}
```

### Usuários

#### Listar Usuários

```http
GET /users
Authorization: Bearer {token}
```

**Query Parameters:**
- `select`: Campos a retornar (ex: `id,nome,email,role`)
- `cliente_id`: Filtrar por cliente
- `role`: Filtrar por role (`admin` ou `cliente`)

#### Buscar Usuário

```http
GET /users?id=eq.{user_id}
Authorization: Bearer {token}
```

#### Criar Usuário

```http
POST /users
Authorization: Bearer {token}
```

**Body:**
```json
{
  "email": "usuario@exemplo.com",
  "nome": "Nome do Usuário",
  "role": "cliente",
  "cliente_id": "uuid-do-cliente"
}
```

### Clientes

#### Listar Clientes

```http
GET /clientes
Authorization: Bearer {token}
```

**Query Parameters:**
- `select`: Campos a retornar
- `ativo`: Filtrar por status (`true` ou `false`)
- `order`: Ordenação (ex: `nome.asc`)
- `limit`: Limite de resultados
- `offset`: Paginação

#### Buscar Cliente

```http
GET /clientes?id=eq.{cliente_id}
Authorization: Bearer {token}
```

#### Criar Cliente

```http
POST /clientes
Authorization: Bearer {token}
```

**Body:**
```json
{
  "nome": "Nome do Cliente",
  "email": "cliente@exemplo.com",
  "telefone": "(11) 98765-4321",
  "empresa": "Empresa LTDA",
  "ativo": true
}
```

#### Atualizar Cliente

```http
PATCH /clientes?id=eq.{cliente_id}
Authorization: Bearer {token}
```

**Body:**
```json
{
  "nome": "Nome Atualizado",
  "ativo": false
}
```

### Projetos

#### Listar Projetos

```http
GET /projetos
Authorization: Bearer {token}
```

**Query Parameters:**
- `select`: Incluir relações (ex: `*,cliente(nome,empresa)`)
- `cliente_id`: Filtrar por cliente
- `ativo`: Filtrar por status
- `order`: Ordenação

**Exemplo com relações:**
```http
GET /projetos?select=*,cliente(nome,empresa),projeto_timeline(*)
```

#### Criar Projeto

```http
POST /projetos
Authorization: Bearer {token}
```

**Body:**
```json
{
  "cliente_id": "uuid-do-cliente",
  "nome": "Projeto 2024",
  "descricao": "Descrição do projeto",
  "data_inicio": "2024-01-01",
  "data_fim_prevista": "2024-12-31",
  "ativo": true
}
```

### Timeline

#### Buscar Timeline do Projeto

```http
GET /projeto_timeline?projeto_id=eq.{projeto_id}
Authorization: Bearer {token}
```

**Com relações:**
```http
GET /projeto_timeline?projeto_id=eq.{projeto_id}&select=*,etapa(*,fase(*)),arquivos(*)
```

#### Atualizar Status da Etapa

```http
PATCH /projeto_timeline?id=eq.{timeline_id}
Authorization: Bearer {token}
```

**Body:**
```json
{
  "status": "em_andamento",
  "observacoes": "Iniciado conforme planejado",
  "data_inicio": "2024-01-15T10:00:00Z"
}
```

### Arquivos

#### Listar Arquivos

```http
GET /arquivos?projeto_timeline_id=eq.{timeline_id}
Authorization: Bearer {token}
```

#### Registrar Upload de Arquivo

```http
POST /arquivos
Authorization: Bearer {token}
```

**Body:**
```json
{
  "projeto_timeline_id": "uuid-da-timeline",
  "nome": "documento.pdf",
  "tipo": "pdf",
  "tamanho": 1048576,
  "url_google_drive": "https://drive.google.com/file/...",
  "google_drive_id": "id-do-google-drive",
  "uploaded_by": "uuid-do-usuario"
}
```

#### Remover Arquivo

```http
DELETE /arquivos?id=eq.{arquivo_id}
Authorization: Bearer {token}
```

## Tipos de Dados

### User
```typescript
{
  id: string;
  email: string;
  nome: string;
  role: 'admin' | 'cliente';
  cliente_id?: string;
  created_at: string;
  updated_at: string;
}
```

### Cliente
```typescript
{
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  empresa?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}
```

### Projeto
```typescript
{
  id: string;
  cliente_id: string;
  nome: string;
  descricao?: string;
  data_inicio: string;
  data_fim_prevista?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}
```

### ProjetoTimeline
```typescript
{
  id: string;
  projeto_id: string;
  etapa_id: string;
  status: 'pendente' | 'em_andamento' | 'concluido';
  observacoes?: string;
  data_inicio?: string;
  data_conclusao?: string;
  created_at: string;
  updated_at: string;
}
```

### Arquivo
```typescript
{
  id: string;
  projeto_timeline_id: string;
  nome: string;
  tipo: 'pdf' | 'doc' | 'docx' | 'xlsx' | 'csv' | 'link';
  tamanho?: number;
  url_google_drive: string;
  google_drive_id: string;
  uploaded_by: string;
  created_at: string;
}
```

## Códigos de Erro

### Erros Comuns

| Código | Descrição | Solução |
|--------|-----------|---------|
| 400 | Bad Request | Verifique os dados enviados |
| 401 | Unauthorized | Token inválido ou expirado |
| 403 | Forbidden | Sem permissão (RLS) |
| 404 | Not Found | Recurso não encontrado |
| 409 | Conflict | Registro duplicado |
| 422 | Unprocessable Entity | Validação falhou |
| 500 | Internal Server Error | Erro no servidor |

### Formato de Erro

```json
{
  "code": "PGRST116",
  "details": null,
  "hint": null,
  "message": "The result contains 0 rows"
}
```

## Rate Limiting

O Supabase implementa rate limiting automático:

- **Anônimo**: 60 requisições por minuto
- **Autenticado**: 300 requisições por minuto
- **Service Role**: Sem limite

Headers de resposta incluem:
```
X-RateLimit-Limit: 300
X-RateLimit-Remaining: 299
X-RateLimit-Reset: 1640995200
```

## Real-time Subscriptions

### Conectar ao WebSocket

```javascript
const channel = supabase
  .channel('projeto-updates')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'projeto_timeline',
      filter: 'projeto_id=eq.uuid'
    },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()
```

### Eventos Disponíveis

- `INSERT`: Novo registro criado
- `UPDATE`: Registro atualizado
- `DELETE`: Registro removido
- `*`: Todos os eventos

## Exemplos de Uso

### JavaScript/TypeScript

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://seu-projeto.supabase.co',
  'sua-chave-anonima'
)

// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'usuario@exemplo.com',
  password: 'senha123'
})

// Buscar projetos
const { data: projetos } = await supabase
  .from('projetos')
  .select('*, cliente(nome)')
  .eq('ativo', true)
  .order('created_at', { ascending: false })

// Atualizar timeline
const { error } = await supabase
  .from('projeto_timeline')
  .update({ status: 'concluido' })
  .eq('id', 'timeline-id')
```

### cURL

```bash
# Login
curl -X POST 'https://seu-projeto.supabase.co/auth/v1/token?grant_type=password' \
  -H 'apikey: sua-chave-anonima' \
  -H 'Content-Type: application/json' \
  -d '{"email":"usuario@exemplo.com","password":"senha123"}'

# Buscar projetos
curl 'https://seu-projeto.supabase.co/rest/v1/projetos?select=*&ativo=eq.true' \
  -H 'apikey: sua-chave-anonima' \
  -H 'Authorization: Bearer token-jwt'
```

## Segurança

### Row Level Security (RLS)

Todas as tabelas implementam RLS:

- **Administradores**: Acesso total (CRUD)
- **Clientes**: Apenas leitura em seus próprios dados
- **Anônimo**: Sem acesso

### Boas Práticas

1. Sempre use HTTPS
2. Nunca exponha a service key no frontend
3. Implemente validação no cliente e servidor
4. Use tokens de curta duração
5. Monitore logs de acesso
6. Configure CORS apropriadamente

## Suporte

Para dúvidas ou problemas:
- Documentação Supabase: https://supabase.com/docs
- Issues do projeto: https://github.com/seu-usuario/timeline-project-system/issues