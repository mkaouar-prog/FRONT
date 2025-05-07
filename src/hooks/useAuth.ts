// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { jwtDecode as jwt_decode } from 'jwt-decode';
export interface JwtPayload {
    id: string;
    name: string;
    role: string;
    exp: number;
    
  }

export function useAuth() {
  const [user, setUser] = useState<JwtPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token,setA]=useState<String | null>(null);
  useEffect(() => {
    const token = localStorage.getItem('token');
    setA(token);
    if (token) {
      try {
        const decoded = jwt_decode<JwtPayload>(token);
        setUser(decoded);
      } catch (error) {
        setUser(null);
      }
    } else {
      setUser(null);
      setIsLoading(false);
    }
    setIsLoading(false);
  }, []);

  return { user, isLoading };
}
