// src/lib/__tests__/supabaseClient.test.ts
import { describe, it, expect } from 'vitest';  // ✅ Removed unused vi

describe('supabaseClient', () => {
  it('should be defined', async () => {
    // Import the client dynamically to avoid initialization issues
    const { supabase } = await import('../supabaseClient');
    expect(supabase).toBeDefined();
  });

  it('should have auth methods', async () => {
    const { supabase } = await import('../supabaseClient');
    expect(supabase.auth).toBeDefined();
    expect(supabase.auth.getSession).toBeDefined();
    expect(supabase.auth.signInWithPassword).toBeDefined();
    expect(supabase.auth.signUp).toBeDefined();
    expect(supabase.auth.signOut).toBeDefined();
  });

  it('should have database methods', async () => {
    const { supabase } = await import('../supabaseClient');
    expect(supabase.from).toBeDefined();
    expect(supabase.channel).toBeDefined();
  });

  it('should have storage methods', async () => {
    const { supabase } = await import('../supabaseClient');
    expect(supabase.storage).toBeDefined();
  });

  it('should have realtime methods', async () => {
    const { supabase } = await import('../supabaseClient');
    expect(supabase.realtime).toBeDefined();
  });
});