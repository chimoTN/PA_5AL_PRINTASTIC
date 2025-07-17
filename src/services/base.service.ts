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

  private prepareHeaders(options: RequestInit = {}): Record<string, string> {
    const defaultHeaders: Record<string, string> = {
      'Accept': 'application/json',
    };

    // Ne pas définir Content-Type pour FormData
    const isFormData = options.body instanceof FormData;
    if (!isFormData && options.method !== 'GET') {
      defaultHeaders['Content-Type'] = 'application/json';
    }

    const customHeaders = options.headers as Record<string, string> || {};
    
    console.log('🏷️ Headers (SESSION MODE):', {
      ...defaultHeaders,
      ...customHeaders
    });

    return { ...defaultHeaders, ...customHeaders };
  }

  private buildUrl(endpoint: string): string {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const finalUrl = `${this.baseURL}${cleanEndpoint}`;
    
    console.log('🌐 URL:', finalUrl);
    
    return finalUrl;
  }

  async request<T = any>(
    endpoint: string,
    options: RequestInit = {},
    onProgress?: (progress: number) => void
  ): Promise<T> {
    const url = this.buildUrl(endpoint);
    const headers = this.prepareHeaders(options);
    
    // 🔍 DEBUG COOKIES AVANT REQUÊTE
    console.log('🍪 === COOKIES DEBUG ===');
    console.log('🍪 Cookies disponibles:', document.cookie);
    console.log('🌍 Domain actuel:', window.location.hostname);
    console.log('🔗 URL cible:', url);
    console.log('🍪 ====================');
    
    const requestOptions: RequestInit = {
      credentials: 'include', // 🔑 SESSIONS : Toujours inclure les cookies
      headers,
      ...options,
    };

    console.log('📡 Requête SESSION:', {
      method: options.method || 'GET',
      url,
      hasBody: !!options.body,
      credentials: 'include',
      documentCookies: document.cookie // 🔍 AJOUTÉ
    });

    // Upload avec progression si nécessaire
    if (onProgress && options.body instanceof FormData) {
      return this.requestWithProgress<T>(url, requestOptions, onProgress);
    }

    try {
      const response = await fetch(url, requestOptions);
      
      console.log('📡 Réponse:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
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
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          // Ignore parse errors
        }
        
        console.error(`❌ Erreur ${response.status}:`, errorMessage);
        throw new Error(errorMessage);
      }
      
      const contentType = response.headers.get('Content-Type') || '';
      
      if (contentType.includes('application/json')) {
        const jsonResponse = await response.json();
        console.log('✅ Réponse JSON:', jsonResponse);
        return jsonResponse;
      } else {
        const textResponse = await response.text();
        console.log('✅ Réponse texte:', textResponse);
        return { success: true, data: textResponse } as unknown as T;
      }
      
    } catch (error: any) {
      console.error('❌ Erreur requête:', error);
      
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        throw new Error('Erreur de connexion au serveur');
      }
      
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