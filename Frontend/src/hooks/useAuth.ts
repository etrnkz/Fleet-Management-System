import { useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { authStorage, authApi, LoginCredentials } from '@/lib/auth';

export const useAuth = () => {
  const { user, token, isAuthenticated, isLoading, setAuth, clearAuth, setLoading } = useAuthStore();

  useEffect(() => {
    const initAuth = () => {
      const storedToken = authStorage.getToken();
      const storedUser = authStorage.getUser();

      if (storedToken && storedUser) {
        setAuth(storedUser, storedToken);
      } else {
        setLoading(false);
      }
    };

    initAuth();
  }, [setAuth, setLoading]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      const { token, user } = await authApi.login(credentials);
      
      authStorage.setToken(token);
      authStorage.setUser(user);
      setAuth(user, token);
      
      return { success: true };
    } catch (error) {
      setLoading(false);
      return { success: false, error: error instanceof Error ? error.message : 'Login failed' };
    }
  }, [setAuth, setLoading]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      authStorage.clear();
      clearAuth();
    }
  }, [clearAuth]);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };
};
