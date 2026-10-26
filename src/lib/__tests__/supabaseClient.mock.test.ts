// src/lib/__tests__/supabaseClient.mock.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the supabase client
vi.mock('../supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn(),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(),
      })),
    })),
    channel: vi.fn(() => ({
      on: vi.fn(() => ({
        subscribe: vi.fn(),
      })),
    })),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(),
        getPublicUrl: vi.fn(),
      })),
    },
    realtime: {
      channel: vi.fn(),
    },
  },
}));

describe('Supabase Client (Mocked)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have mocked auth methods', async () => {
    const { supabase } = await import('../supabaseClient');
    expect(supabase.auth).toBeDefined();
    expect(supabase.auth.getSession).toBeDefined();
    expect(supabase.auth.signInWithPassword).toBeDefined();
  });

  it('should have mocked database methods', async () => {
    const { supabase } = await import('../supabaseClient');
    expect(supabase.from).toBeDefined();
  });

  it('should allow chaining on from', async () => {
    const { supabase } = await import('../supabaseClient');
    const query = supabase.from('wallets').select('*').eq('user_id', '123');
    expect(query).toBeDefined();
  });
});