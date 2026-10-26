// src/app/pages/__tests__/Signup.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Signup from '../Signup';
import { AuthProvider } from '../../../contexts/AuthContext';

const mockSignup = vi.fn();
vi.mock('../../../hooks/useAuth', async (importActual) => ({
  ...(await importActual<typeof import('../../../hooks/useAuth')>()),
  useAuth: () => ({
    signup: mockSignup,
    user: null,
    loading: false,
  }),
}));

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

describe('Signup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSignup.mockReset();
  });

  it('renders signup form', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Signup />
        </AuthProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Create your account')).toBeInTheDocument();
    });
    expect(screen.getByPlaceholderText('Your full name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@email.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Create a strong password')).toBeInTheDocument();
  });

  it('displays error message on failed signup', async () => {
    mockSignup.mockResolvedValue({
      success: false,
      error: 'Email already registered',
    });

    render(
      <BrowserRouter>
        <AuthProvider>
          <Signup />
        </AuthProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Create your account')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('Your full name'), {
      target: { value: 'Test User' },
    });
    fireEvent.change(screen.getByPlaceholderText('you@email.com'), {
      target: { value: 'existing@email.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Create a strong password'), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByText('Create Account'));

    await waitFor(() => {
      expect(screen.getByText('Email already registered')).toBeInTheDocument();
    });
  });

  it('handles network error during signup', async () => {
    mockSignup.mockRejectedValue(new Error('Network error'));

    render(
      <BrowserRouter>
        <AuthProvider>
          <Signup />
        </AuthProvider>
      </BrowserRouter>
    );

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
      expect(screen.getByText('Something went wrong. Please try again.')).toBeInTheDocument();
    });
  });
});