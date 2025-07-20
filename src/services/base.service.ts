// src/services/base.service.ts - VERSION COMPLÈTE CORRIGÉE
import { API_BASE_URL, DEBUG_COOKIES } from '../config/env';

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

// ✅ SUPPRIMÉ: Gestion manuelle des cookies - laisser le navigateur gérer automatiquement

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
    // ✅ UTILISER LA CONFIGURATION D'ENVIRONNEMENT
    this.baseURL = API_BASE_URL;
  }

  private buildUrl(endpoint: string): string {
    return `${this.baseURL}${endpoint}`;
  }

  private prepareHeaders(options: RequestInit = {}): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // ✅ SIMPLIFICATION: Laisser le navigateur gérer les cookies automatiquement
    // Ne plus construire manuellement les headers de cookies

    return headers;
  }

  async request<T = any>(
    endpoint: string,
    options: RequestInit = {},
    onProgress?: (progress: number) => void
  ): Promise<T> {
    const url = this.buildUrl(endpoint);
    const headers = this.prepareHeaders(options);
    
    // 🔍 DEBUG COOKIES AVEC CONFIGURATION D'ENVIRONNEMENT
    if (DEBUG_COOKIES) {
      console.log('🍪 === COOKIES DEBUG SIMPLIFIÉ ===');
      console.log('🍪 Cookies disponibles:', document.cookie);
      console.log('🌍 Domain actuel:', window.location.hostname);
      console.log('🔗 URL cible:', url);
      console.log('🔗 Origin:', window.location.origin);
      console.log('🍪 ================================');
    }
    
    // ✅ CONFIGURATION SIMPLE: Toujours inclure les credentials
    const requestOptions: RequestInit = {
      credentials: 'include', // 🔑 SESSIONS : Toujours inclure les cookies
      headers,
      ...options,
    };

    // ✅ FORCER credentials: 'include' même si options le remplace
    requestOptions.credentials = 'include';

    if (DEBUG_COOKIES) {
      console.log('📡 Requête SESSION SIMPLIFIÉE:', {
        method: options.method || 'GET',
        url,
        hasBody: !!options.body,
        credentials: requestOptions.credentials,
        origin: window.location.origin
      });
    }

    // Upload avec progression si nécessaire
    if (onProgress && options.body instanceof FormData) {
      return this.requestWithProgress<T>(url, requestOptions, onProgress);
    }

    try {
      const response = await fetch(url, requestOptions);
      
      if (DEBUG_COOKIES) {
        console.log('📡 Réponse SIMPLIFIÉE:', {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          url: response.url
        });
      }

      // ✅ VÉRIFIER LES COOKIES DANS LA RÉPONSE
      const setCookieHeader = response.headers.get('Set-Cookie');
      if (setCookieHeader) {
        console.log('🍪 === COOKIE DE SESSION REÇU ===');
        console.log('🍪 Set-Cookie header:', setCookieHeader);
        console.log('🍪 Nombre de cookies dans le header:', setCookieHeader.split(',').length);
        
        // Parser le cookie de session
        const sessionCookie = setCookieHeader.split(';')[0];
        console.log('🍪 Cookie de session parsé:', sessionCookie);
        
        // Vérifier si c'est un cookie connect.sid
        if (sessionCookie.includes('connect.sid=')) {
          console.log('✅ Cookie de session Express détecté !');
          const sessionId = sessionCookie.split('=')[1];
          console.log('🔑 Session ID extrait:', sessionId);
        }
        console.log('🍪 ================================');
      }
      
      // 🔍 DEBUG COOKIES APRÈS RÉPONSE
      if (DEBUG_COOKIES) {
        console.log('🍪 === COOKIES STOCKÉS PAR LE NAVIGATEUR ===');
        console.log('🍪 document.cookie complet:', document.cookie);
        
        // Lister tous les cookies individuellement
        const cookies = document.cookie.split(';');
        console.log('🍪 Nombre total de cookies:', cookies.length);
        
        cookies.forEach((cookie, index) => {
          const trimmedCookie = cookie.trim();
          if (trimmedCookie) {
            console.log(`🍪 Cookie ${index + 1}:`, trimmedCookie);
            
            // Vérifier si c'est le cookie de session
            if (trimmedCookie.startsWith('connect.sid=')) {
              console.log('✅ Cookie de session trouvé dans le navigateur !');
              const sessionId = trimmedCookie.split('=')[1];
              console.log('🔑 Session ID stocké:', sessionId);
            }
          }
        });
        console.log('🍪 ===========================================');
      }
      
      if (!response.ok) {
        let errorMessage = `Erreur HTTP ${response.status}`;
        
        switch (response.status) {
          case 401:
            errorMessage = 'Session expirée - veuillez vous reconnecter';
            console.error('🔒 ERREUR 401 - Session expirée ou invalide');
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
      console.error('❌ Erreur dans la requête:', error);
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