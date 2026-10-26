// src/vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  // Add other env variables if needed
  // readonly VERCEL_OIDC_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}