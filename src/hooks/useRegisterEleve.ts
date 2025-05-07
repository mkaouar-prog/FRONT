// src/hooks/useRegisterEleve.ts
import { useState } from 'react';
import axiosInstance from 'utils/AxiosInstance';


export interface RegisterEleveData {
  fullName: string;
  email: string;
  phone: string;
  dob: string; // ISO date string
  stateTunisia: string;
  categorie: string;
  niveau: string;
  sousCategorie?: string;
  password: string;
}

export function useRegisterEleve() {
  const [loading, setLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const registerEleve = async (data: RegisterEleveData): Promise<any> => {
    setLoading(true);
    setApiError(null);
    try {
      const response = await axiosInstance.post('/users/register', data, {
        headers: { 'Content-Type': 'application/json' },
      });
      setLoading(false);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        setApiError(error.response.data.message || 'Erreur lors de l’inscription.');
      } else {
        setApiError(error.message || 'Erreur inconnue.');
      }
      setLoading(false);
      return null;
    }
  };

  return { registerEleve, loading, apiError };
}
