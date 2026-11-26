// src/contexts/__tests__/AuthContext.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';

// ✅ Fix: Proper mock of supabase client
vi.mock('../../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: null },
        error: null,
      }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: {
          subscription: {
            unsubscribe: vi.fn(),
          },
        },
      }),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    },
  },
}));

// Test component using useAuth
const TestComponent = () => {
  const { user, loading, login, logout, signup } = useAuth();
  return (
    <div>
      <div data-testid="loading">{loading ? 'Loading...' : 'Loaded'}</div>
      <div data-testid="user">{user ? user.email : 'No user'}</div>
      <button onClick={() => login('test@email.com', 'password')}>Login</button>
      <button onClick={() => signup('Test User', 'test@email.com', 'password')}>
        Signup
      </button>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('provides auth context', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toBeInTheDocument();
    });
  });

  it('handles login successfully', async () => {
    const { supabase } = await import('../../lib/supabaseClient');
    const mockSignIn = vi.fn().mockResolvedValue({
      data: { user: { id: '123', email: 'test@email.com' } },
      error: null,
    });
    supabase.auth.signInWithPassword = mockSignIn;

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByText('Login');
    loginButton.click();

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalled();
    });
  });

  it('handles login error', async () => {
    const { supabase } = await import('../../lib/supabaseClient');
    const mockSignIn = vi.fn().mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid credentials' },
    });
    supabase.auth.signInWithPassword = mockSignIn;

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByText('Login');
    loginButton.click();

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalled();
    });
  });

  it('handles signup successfully', async () => {
    const { supabase } = await import('../../lib/supabaseClient');
    const mockSignUp = vi.fn().mockResolvedValue({
      data: { user: { id: '123', email: 'test@email.com' } },
      error: null,
    });
    supabase.auth.signUp = mockSignUp;

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const signupButton = screen.getByText('Signup');
    signupButton.click();

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalled();
    });
  });

  it('handles signup error', async () => {
    const { supabase } = await import('../../lib/supabaseClient');
    const mockSignUp = vi.fn().mockResolvedValue({
      data: { user: null },
      error: { message: 'Email already registered' },
    });
    supabase.auth.signUp = mockSignUp;

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const signupButton = screen.getByText('Signup');
    signupButton.click();

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalled();
    });
  });

  it('handles logout successfully', async () => {
    const { supabase } = await import('../../lib/supabaseClient');
    const mockSignOut = vi.fn().mockResolvedValue({ error: null });
    supabase.auth.signOut = mockSignOut;

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const logoutButton = screen.getByText('Logout');
    logoutButton.click();

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
    });
  });

  it('handles logout error', async () => {
    const { supabase } = await import('../../lib/supabaseClient');
    const mockSignOut = vi.fn().mockResolvedValue({
      error: { message: 'Logout failed' },
    });
    supabase.auth.signOut = mockSignOut;

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const logoutButton = screen.getByText('Logout');
    logoutButton.click();

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
    });
  });
});