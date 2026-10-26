// src/__tests__/integration/login-flow.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Login from '../../app/pages/Login';
import { AuthProvider } from '../../contexts/AuthContext';

// ✅ Full mock of supabase client
vi.mock('../../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        })),
      })),
    })),
  },
}));

// ✅ Mock useAuth hook
const mockLogin = vi.fn();
vi.mock('../../hooks/useAuth', async (importActual) => ({
  ...(await importActual<typeof import('../../hooks/useAuth')>()),
  useAuth: () => ({
    login: mockLogin,
    user: null,
    loading: false,
  }),
}));

describe('Login Flow - Integration', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const renderWithProviders = (component: React.ReactNode) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            {component}
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockLogin.mockReset();
  });

  it('renders login page', async () => {
    renderWithProviders(<Login />);
    
    await waitFor(() => {
      expect(screen.getByText('Sign in to Pennywise')).toBeInTheDocument();
    });
  });

  it('handles login attempt', async () => {
    mockLogin.mockResolvedValue({ success: true });

    renderWithProviders(<Login />);
    
    await waitFor(() => {
      expect(screen.getByText('Sign in to Pennywise')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('you@email.com'), {
      target: { value: 'test@email.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByText('Sign In'));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@email.com', 'password123');
    });
  });
});