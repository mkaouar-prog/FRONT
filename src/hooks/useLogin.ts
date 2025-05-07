// src/hooks/useLogin.ts
import { useState } from 'react';
import axiosInstance from 'utils/AxiosInstance'; // Adjust path if needed

export interface LoginData {
  email: string;
  password: string;
}

export function useLogin() {
  const [loading, setLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const login = async (data: LoginData): Promise<any> => {
    setLoading(true);
    setApiError(null);
    try {
      const response = await axiosInstance.post('/users/login', data, {
        headers: { 'Content-Type': 'application/json' },
      });
      setLoading(false);
      return response.data; // expected to include your JWT token, e.g. { Token: "..." }
    } catch (error: any) {
      if (error.response && error.response.data) {
        setApiError(error.response.data.message || 'Erreur lors de la connexion.');
      } else {
        setApiError(error.message || 'Erreur inconnue.');
      }
      setLoading(false);
      return null;
    }
  };

  return { login, loading, apiError };
}
