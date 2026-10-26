// src/__tests__/integration/signup-flow.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Signup from '../../app/pages/Signup';
import { AuthProvider } from '../../contexts/AuthContext';

// ✅ Full mock of supabase client
vi.mock('../../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
    },
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({ data: { id: '123' }, error: null }),
        })),
      })),
    })),
  },
}));

// ✅ Mock useAuth hook
const mockSignup = vi.fn();
vi.mock('../../hooks/useAuth', async (importActual) => ({
  ...(await importActual<typeof import('../../hooks/useAuth')>()),
  useAuth: () => ({
    signup: mockSignup,
    user: null,
    loading: false,
  }),
}));

describe('Signup Flow - Integration', () => {
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
    mockSignup.mockReset();
  });

  it('renders signup page', async () => {
    renderWithProviders(<Signup />);
    
    await waitFor(() => {
      expect(screen.getByText('Create your account')).toBeInTheDocument();
    });
  });

  it('submits signup form with valid data', async () => {
    mockSignup.mockResolvedValue({ success: true });

    renderWithProviders(<Signup />);

    await waitFor(() => {
      expect(screen.getByText('Create your account')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('Your full name'), {
      target: { value: 'Test User' },
    });
    fireEvent.change(screen.getByPlaceholderText('you@email.com'), {
      target: { value: 'test@email.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Create a strong password'), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByText('Create Account'));

    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalledWith('Test User', 'test@email.com', 'password123');
    });
  });
});