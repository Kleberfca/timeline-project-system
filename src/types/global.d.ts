// src/types/global.d.ts
/**
 * Declarações de tipos globais
 * Define tipos para APIs externas e variáveis globais
 */

declare global {
  interface Window {
    // Google APIs
    gapi: any;
    google: any;
    
    // File System API (para leitura de arquivos)
    fs: {
      readFile: (
        path: string, 
        options?: { encoding?: string }
      ) => Promise<Uint8Array | string>;
    };
  }
  
  // Variáveis globais do Google
  const gapi: any;
  const google: any;
}

// Tipos para import.meta.env
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_GOOGLE_CLIENT_ID: string;
  readonly VITE_GOOGLE_API_KEY: string;
  readonly VITE_GOOGLE_DRIVE_FOLDER_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

export {};