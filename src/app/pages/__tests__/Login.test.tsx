// src/app/pages/__tests__/Login.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../Login';
import { AuthProvider } from '../../../contexts/AuthContext';

// Mock useAuth
const mockLogin = vi.fn();
vi.mock('../../../hooks/useAuth', async (importActual) => ({
  ...(await importActual<typeof import('../../../hooks/useAuth')>()),
  useAuth: () => ({
    login: mockLogin,
    user: null,
    loading: false,
  }),
}));

// Mock Supabase
vi.mock('../../../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
    },
  },
}));

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLogin.mockReset();
  });

  it('renders login form', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Sign in to Pennywise')).toBeInTheDocument();
    });
    expect(screen.getByPlaceholderText('you@email.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
  });

  it('displays error message on failed login', async () => {
    mockLogin.mockResolvedValue({
      success: false,
      error: 'Invalid email or password',
    });

    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Sign in to Pennywise')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('you@email.com'), {
      target: { value: 'test@email.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
      target: { value: 'wrongpassword' },
    });

    fireEvent.click(screen.getByText('Sign In'));

    await waitFor(() => {
      expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
    });
  });

  it('handles network error during login', async () => {
    mockLogin.mockRejectedValue(new Error('Network error'));

    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Sign in to Pennywise')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('you@email.com'), {
      target: { value: 'test@email.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
      target: { value: 'password' },
    });

    fireEvent.click(screen.getByText('Sign In'));

    await waitFor(() => {
      expect(screen.getByText('Something went wrong. Please try again.')).toBeInTheDocument();
    });
  });
});