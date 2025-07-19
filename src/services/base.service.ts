// src/services/base.service.ts - VERSION COMPLÈTE CORRIGÉE
import { API_BASE_URL } from '../config/env';

export interface AuthUser {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  role: 'CLIENT' | 'IMPRIMEUR' | 'PROPRIETAIRE';
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: AuthUser;
  utilisateur?: AuthUser;
  sessionId?: string; // ✅ AJOUT : Session ID du backend
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, motDePasse: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

// ✅ NOUVELLE FONCTION : Récupérer le cookie de session manuellement
const getSessionCookie = (): string | null => {
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'connect.sid') {
      return value;
    }
  }
  return null;
};

// ✅ NOUVELLE FONCTION : Construire le header Cookie manuellement
const buildCookieHeader = (): string => {
  const sessionCookie = getSessionCookie();
  const cookies = [];
  
  if (sessionCookie) {
    cookies.push(`connect.sid=${sessionCookie}`);
  }
  
  // Ajouter les autres cookies de debug si présents
  const debugCookies = document.cookie.split(';').filter(c => 
    c.trim().startsWith('debug_session=') || 
    c.trim().startsWith('test_')
  );
  
  debugCookies.forEach(cookie => {
    cookies.push(cookie.trim());
  });
  
  return cookies.join('; ');
};

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface FileClient {
  id: number;
  nom: string;
  cheminFichier: string;
  tailleFichier: number;
  typeContenu: string;
  estVerifie: boolean;
  dateCreation: string;
  dateModification: string;
  utilisateurId: number;
  utilisateur?: {
    id: number;
    email: string;
    nom: string;
    prenom: string;
  };
}

export interface FileClientResponse {
  success: boolean;
  message?: string;
  files?: FileClient[];
  file?: FileClient;
}

class BaseService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL || 'http://127.0.0.1:3000/api';
    console.log('🏗️ BaseService initialisé (SESSION MODE):', this.baseURL);
  }

  private buildUrl(endpoint: string): string {
    return `${this.baseURL}${endpoint}`;
  }

  private prepareHeaders(options: RequestInit = {}): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // ✅ GESTION MANUELLE DU COOKIE DE SESSION
    const cookieHeader = buildCookieHeader();
    if (cookieHeader) {
      headers['Cookie'] = cookieHeader;
      console.log('🍪 Cookie header manuel:', cookieHeader);
    }

    return headers;
  }

  async request<T = any>(
    endpoint: string,
    options: RequestInit = {},
    onProgress?: (progress: number) => void
  ): Promise<T> {
    const url = this.buildUrl(endpoint);
    const headers = this.prepareHeaders(options);
    
    // 🔍 DEBUG COOKIES AVANT REQUÊTE - VERSION PRODUCTION
    console.log('🍪 === COOKIES DEBUG PRODUCTION ===');
    console.log('🍪 Cookies disponibles:', document.cookie);
    console.log('🍪 Cookie de session manuel:', getSessionCookie());
    console.log('🌍 Domain actuel:', window.location.hostname);
    console.log('🔗 URL cible:', url);
    console.log('🔗 Origin:', window.location.origin);
    console.log('🔗 Protocol:', window.location.protocol);
    console.log('🍪 ================================');
    
    // ✅ CORRECTION: S'assurer que credentials est toujours 'include'
    const requestOptions: RequestInit = {
      credentials: 'include', // 🔑 SESSIONS : Toujours inclure les cookies
      headers,
      ...options,
    };

    // ✅ FORCER credentials: 'include' même si options le remplace
    requestOptions.credentials = 'include';

    console.log('📡 Requête SESSION PRODUCTION:', {
      method: options.method || 'GET',
      url,
      hasBody: !!options.body,
      credentials: requestOptions.credentials,
      cookieHeader: headers['Cookie'],
      origin: window.location.origin,
      userAgent: navigator.userAgent
    });

    // Upload avec progression si nécessaire
    if (onProgress && options.body instanceof FormData) {
      return this.requestWithProgress<T>(url, requestOptions, onProgress);
    }

    try {
      const response = await fetch(url, requestOptions);
      
      console.log('📡 Réponse PRODUCTION:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
        url: response.url
      });

      // ✅ VÉRIFIER LES COOKIES DANS LA RÉPONSE
      const setCookieHeader = response.headers.get('Set-Cookie');
      if (setCookieHeader) {
        console.log('🍪 Set-Cookie reçu:', setCookieHeader);
      }
      
      // 🔍 DEBUG COOKIES APRÈS RÉPONSE
      console.log('🍪 Cookies après requête:', document.cookie);
      
      if (!response.ok) {
        let errorMessage = `Erreur HTTP ${response.status}`;
        
        switch (response.status) {
          case 401:
            errorMessage = 'Session expirée - veuillez vous reconnecter';
            console.error('🔒 ERREUR 401 - Session expirée ou invalide');
            console.error('🔒 Headers de réponse:', Object.fromEntries(response.headers.entries()));
            break;
          case 403:
            errorMessage = 'Accès refusé';
            break;
          case 404:
            errorMessage = 'Ressource non trouvée';
            break;
          case 413:
            errorMessage = 'Fichier trop volumineux';
            break;
          case 500:
            errorMessage = 'Erreur serveur';
            break;
        }
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // Si pas de JSON, utiliser le message par défaut
        }
        
        const error = new Error(errorMessage);
        (error as any).status = response.status;
        throw error;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Erreur requête:', error);
      throw error;
    }
  }

  private requestWithProgress<T>(
    url: string,
    options: RequestInit,
    onProgress: (progress: number) => void
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      // Progression upload
      if (xhr.upload) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded * 100) / event.total);
            onProgress(progress);
            console.log(`📊 Upload: ${progress}%`);
          }
        });
      }
      
      xhr.onload = () => {
        console.log('📡 XHR Response:', {
          status: xhr.status,
          statusText: xhr.statusText,
          responseHeaders: xhr.getAllResponseHeaders()
        });
        
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            console.log('✅ Upload réussi:', response);
            resolve(response);
          } catch {
            resolve({ success: true, message: 'Upload réussi' } as unknown as T);
          }
        } else {
          let errorMessage = `Erreur HTTP ${xhr.status}`;
          
          switch (xhr.status) {
            case 401:
              errorMessage = 'Session expirée';
              break;
            case 403:
              errorMessage = 'Accès refusé';
              break;
            case 413:
              errorMessage = 'Fichier trop volumineux';
              break;
            case 500:
              errorMessage = 'Erreur serveur';
              break;
          }
          
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            errorMessage = errorResponse.message || errorMessage;
          } catch {
            // Ignore parse errors
          }
          
          console.error(`❌ XHR Error ${xhr.status}:`, errorMessage);
          reject(new Error(errorMessage));
        }
      };
      
      xhr.onerror = () => {
        console.error('❌ XHR Network Error');
        reject(new Error('Erreur réseau'));
      };
      
      xhr.ontimeout = () => {
        console.error('❌ XHR Timeout');
        reject(new Error('Timeout'));
      };
      
      // 🔑 SESSIONS : Configuration XHR
      xhr.open(options.method || 'POST', url);
      xhr.withCredentials = true; // CRUCIAL pour les cookies de session
      xhr.timeout = 120000; // 2 minutes
      
      // Headers (pas de Content-Type pour FormData)
      const headers = options.headers as Record<string, string> || {};
      Object.entries(headers).forEach(([key, value]) => {
        if (key.toLowerCase() !== 'content-type' || !(options.body instanceof FormData)) {
          xhr.setRequestHeader(key, value);
        }
      });
      
      console.log('📤 Envoi XHR avec session...');
      xhr.send(options.body as any);
    });
  }

  // Méthodes utilitaires
  async get<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T = any>(
    endpoint: string, 
    data?: any, 
    options: RequestInit = {},
    onProgress?: (progress: number) => void
  ): Promise<T> {
    const isFormData = data instanceof FormData;
    
    const requestOptions: RequestInit = {
      method: 'POST',
      body: isFormData ? data : JSON.stringify(data),
      ...options,
    };

    return this.request<T>(endpoint, requestOptions, onProgress);
  }

  async put<T = any>(endpoint: string, data?: any, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch<T = any>(endpoint: string, data?: any, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  // Méthodes utilitaires spécifiques
  async uploadFile<T = any>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, any>,
    onProgress?: (progress: number) => void
  ): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    console.log('📤 Upload fichier:', {
      endpoint,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      additionalData
    });

    return this.post<T>(endpoint, formData, {}, onProgress);
  }

  async uploadMultipleFiles<T = any>(
    endpoint: string,
    files: File[],
    additionalData?: Record<string, any>,
    onProgress?: (progress: number) => void
  ): Promise<T> {
    const formData = new FormData();
    
    files.forEach((file, index) => {
      formData.append(`files[${index}]`, file);
    });

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    console.log('📤 Upload multiple fichiers:', {
      endpoint,
      filesCount: files.length,
      totalSize: files.reduce((sum, file) => sum + file.size, 0),
      additionalData
    });

    return this.post<T>(endpoint, formData, {}, onProgress);
  }

  // Méthodes de debug
  getBaseURL(): string {
    return this.baseURL;
  }

  async healthCheck(): Promise<any> {
    try {
      const response = await this.get('/health');
      console.log('✅ Health check réussi:', response);
      return response;
    } catch (error) {
      console.error('❌ Health check échoué:', error);
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.healthCheck();
      return true;
    } catch {
      return false;
    }
  }
}

export const baseService = new BaseService();

// Export par défaut
export default baseService;