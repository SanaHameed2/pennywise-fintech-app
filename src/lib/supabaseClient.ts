// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';
import { env, validateEnv } from '../utils/env';

// ✅ Validate environment variables on load
const { valid, missing } = validateEnv();

if (!valid) {
  console.error(`❌ Supabase client initialization failed! Missing: ${missing.join(', ')}`);
  if (env.nodeEnv === 'production') {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

// ✅ Create and export the Supabase client
export const supabase = createClient(
  env.supabaseUrl,
  env.supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
);

// ✅ Export a function to check if Supabase is configured
export const isSupabaseConfigured = (): boolean => {
  return Boolean(env.supabaseUrl && env.supabaseAnonKey);
};

// Export type for the supabase client
export type SupabaseClient = typeof supabase;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ Database Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export type Tables = {
  users: {
    id: string;
    email: string;
    name: string;
    created_at: string;
    updated_at: string;
  };
  cards: {
    id: string;
    user_id: string;
    card_number: string;
    card_holder: string;
    expiry_date: string;
    cvv: string;
    created_at: string;
  };
  transactions: {
    id: string;
    user_id: string;
    amount: number;
    type: 'income' | 'expense' | 'transfer';
    category: string;
    description: string;
    date: string;
    created_at: string;
  };
  beneficiaries: {
    id: string;
    user_id: string;
    name: string;
    iban: string;
    bank: string;
    created_at: string;
  };
  budgets: {
    id: string;
    user_id: string;
    category: string;
    amount: number;
    spent: number;
    created_at: string;
  };
  wallets: {
    id: string;
    user_id: string;
    balance: number;
    currency: string;
    wallet_type: string;
    created_at: string;
    updated_at: string;
  };
  savings_goals: {
    id: string;
    user_id: string;
    name: string;
    current_amount: number;
    target_amount: number;
    color: string;
    created_at: string;
    updated_at: string;
  };
};