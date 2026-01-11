"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authApi, userApi, tokenManager, User, ApiError } from "./api-client";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (emailOrUsername: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

  // Initialize auth state from stored tokens
  useEffect(() => {
    const initAuth = async () => {
      if (tokenManager.hasTokens()) {
        try {
          const user = await userApi.getMe();
          setState({
            user,
            isLoading: false,
            isAuthenticated: true,
            error: null,
          });
        } catch (error) {
          // Token invalid or expired
          tokenManager.clearTokens();
          setState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
            error: null,
          });
        }
      } else {
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: null,
        });
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (emailOrUsername: string, password: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await authApi.login({ emailOrUsername, password });
      const user = await userApi.getMe();

      setState({
        user,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      });
    } catch (error) {
      const message = error instanceof ApiError
        ? error.message
        : "Login failed. Please try again.";

      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      throw error;
    }
  }, []);

  const register = useCallback(async (
    email: string,
    username: string,
    password: string,
    displayName?: string
  ) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      await authApi.register({ email, username, password, displayName });
      const user = await userApi.getMe();

      setState({
        user,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      });
    } catch (error) {
      const message = error instanceof ApiError
        ? error.message
        : "Registration failed. Please try again.";

      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      await authApi.logout();
    } catch (error) {
      // Ignore logout errors
    } finally {
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
      });
    }
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const refreshUser = useCallback(async () => {
    if (!tokenManager.hasTokens()) return;

    try {
      const user = await userApi.getMe();
      setState((prev) => ({ ...prev, user }));
    } catch (error) {
      // If refresh fails, log out
      await logout();
    }
  }, [logout]);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        clearError,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Hook for protected routes
export function useRequireAuth(redirectTo = "/login") {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = redirectTo;
    }
  }, [isAuthenticated, isLoading, redirectTo]);

  return { isAuthenticated, isLoading };
}
