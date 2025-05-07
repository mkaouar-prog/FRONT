// src/hooks/useRegisterEnseignant.ts
import { useState } from 'react';
import axiosInstance from '../utils/AxiosInstance';

export interface RegisterEnseignantData {
  fullName: string;
  email: string;
  phone: string;
  dob: string;
  stateTunisia: string;
  categorie: string;
  niveau: string;
  sousCategorie?: string;
  password: string;
  yearsOfExperience: number;
  additionalInfo?: string;
}

export function useRegisterEnseignant() {
  const [loading, setLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const registerEnseignant = async (data: RegisterEnseignantData): Promise<any> => {
    setLoading(true);
    setApiError(null);
    try {
      const response = await axiosInstance.post('/users/register-enseignant', data, {
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

  return { registerEnseignant, loading, apiError };
}
