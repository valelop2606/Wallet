import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiFetch } from '../services/api';

interface User {
  id: number;
  email: string;
  name: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('wallet_token');
    const storedUser = localStorage.getItem('wallet_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  async function login(email: string, password: string): Promise<void> {
    const data = await apiFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('wallet_token', data.token);
    localStorage.setItem('wallet_user', JSON.stringify(data.user));
  }

  async function register(email: string, password: string, name: string): Promise<void> {
    const data = await apiFetch<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });

    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('wallet_token', data.token);
    localStorage.setItem('wallet_user', JSON.stringify(data.user));
  }

  function logout(): void {
    setUser(null);
    setToken(null);
    localStorage.removeItem('wallet_token');
    localStorage.removeItem('wallet_user');
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
