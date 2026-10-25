import { apiFetch } from './client';
import type { AuthResponse } from '../types/api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  role: 'buyer' | 'seller';
}

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

export async function register(credentials: RegisterCredentials): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}
