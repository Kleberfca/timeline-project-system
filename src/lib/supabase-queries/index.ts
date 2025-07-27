// src/lib/supabase-queries/index.ts
/**
 * Exportação centralizada de todas as queries do Supabase
 */

// Queries principais
export { arquivoQueries } from './arquivos';
export { projetoQueries } from './projetos';
export { clienteQueries } from './clientes';
export { timelineQueries } from './timeline';
export { userQueries } from './users';
export { realtimeSubscriptions } from './realtime';

// Re-exporta tipos e interfaces úteis
export type { CreateArquivoData } from './arquivos';
export type { CreateProjetoData } from './projetos';
export type { CreateClienteData } from './clientes';
export type { CreateTimelineData } from './timeline';
export type { CreateUserData, UpdateUserData } from './users';
export type { RealtimeEvent, RealtimeCallback } from './realtime';