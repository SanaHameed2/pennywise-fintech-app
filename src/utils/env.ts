// src/utils/env.ts

/**
 * Environment variable validation and utilities
 */

// Get environment variables with type safety
export const env = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  appUrl: import.meta.env.VITE_APP_URL || 'http://localhost:5173',
  appName: import.meta.env.VITE_APP_NAME || 'Pennywise',
  nodeEnv: import.meta.env.MODE || 'development',
};

// Check if environment is production
export const isProduction = env.nodeEnv === 'production';

// Check if environment is development
export const isDevelopment = env.nodeEnv === 'development';

// Validate required environment variables
export const validateEnv = (): { valid: boolean; missing: string[] } => {
  const required = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
  const missing = required.filter(key => !import.meta.env[key]);

  if (missing.length > 0) {
    console.warn(`⚠️ Missing environment variables: ${missing.join(', ')}`);
    if (isProduction) {
      console.error('❌ Critical: Missing required env vars in production!');
    }
  }

  return {
    valid: missing.length === 0,
    missing,
  };
};

// Log environment info (without exposing secrets)
export const logEnvInfo = (): void => {
  console.log('📦 Environment:', env.nodeEnv);
  console.log('📍 App URL:', env.appUrl);
  console.log('🏷️ App Name:', env.appName);
  console.log('🔗 Supabase URL:', env.supabaseUrl ? '✅ Configured' : '❌ Missing');
  console.log('🔑 Supabase Key:', env.supabaseAnonKey ? '✅ Configured' : '❌ Missing');
};