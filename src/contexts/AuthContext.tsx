// src/contexts/AuthContext.tsx
import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import { useIdleTimer } from '../hooks/useIdleTimer';
import { toast } from 'sonner'; // ✅ Import Toast

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  logout: () => Promise<{ success: boolean; error?: string }>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser(session.user);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setUser(session.user);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { success: false, error: error.message };
      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Login failed' };
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      });
      if (error) return { success: false, error: error.message };
      return { success: true, user: data.user || undefined };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Signup failed' };
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) return { success: false, error: error.message };
      
      setUser(null);
      setIsAuthenticated(false);
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Logout failed' };
    }
  };

  // ✅ Idle Timeout with Session Validity Check
  useIdleTimer(15 * 60 * 1000, async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (session || user) {
      try {
        if (session) {
          const { error } = await supabase.auth.signOut();
          if (error) {
            console.error('Idle logout signOut failed:', error.message);
          }
        }

        setUser(null);
        setIsAuthenticated(false);
        
        // ✅ Replaced alert with toast
        toast.error('Session expired due to 15 minutes of inactivity.');
        window.location.href = '/login'; 
      } catch (err) {
        console.error('Error during idle logout:', err);
      }
    }
  }, !!user);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};