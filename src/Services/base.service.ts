// src/services/base.service.ts
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
  utilisateur?: AuthUser; // Compatibilité avec votre backend
}

// ✅ AJOUT : Interface AuthContextType manquante
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

// ✅ AJOUT : Interface pour les files (cohérent avec votre backend)
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
    console.log('🏗️ BaseService initialisé avec baseURL:', this.baseURL);
  }

  // ✅ CORRECTION : Plus besoin de headers JWT, juste les cookies
  private prepareHeaders(options: RequestInit = {}): Record<string, string> {
    const defaultHeaders: Record<string, string> = {
      'Accept': 'application/json',
    };

    // ✅ Ne pas définir Content-Type pour FormData (le navigateur le fait automatiquement)
    const isFormData = options.body instanceof FormData;
    if (!isFormData && options.method !== 'GET') {
      defaultHeaders['Content-Type'] = 'application/json';
    }

    // ✅ Fusionner avec les headers personnalisés
    const customHeaders = options.headers as Record<string, string> || {};
    
    console.log('🏷️ Headers préparés:', {
      ...defaultHeaders,
      ...customHeaders,
      authMode: 'Session/Cookie'
    });

    return { ...defaultHeaders, ...customHeaders };
  }

  private buildUrl(endpoint: string): string {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const finalUrl = `${this.baseURL}${cleanEndpoint}`;
    
    console.log('🌐 Construction URL:', {
      baseURL: this.baseURL,
      endpoint: cleanEndpoint,
      finalUrl: finalUrl
    });
    
    return finalUrl;
  }

  // ✅ CORRECTION : Méthode request simplifiée pour les sessions
  async request<T = any>(
    endpoint: string,
    options: RequestInit = {},
    onProgress?: (progress: number) => void
  ): Promise<T> {
    const url = this.buildUrl(endpoint);
    const headers = this.prepareHeaders(options);
    
    const defaultOptions: RequestInit = {
      credentials: 'include', // ✅ CRUCIAL pour les cookies de session
      headers,
      ...options,
    };

    console.log('📡 Requête préparée:', {
      method: options.method || 'GET',
      url,
      headers,
      bodyType: options.body?.constructor.name || 'none',
      hasBody: !!options.body,
      credentials: 'include'
    });

    // ✅ Upload avec progression si nécessaire
    if (onProgress && options.body instanceof FormData) {
      return this.requestWithProgress<T>(url, defaultOptions, onProgress);
    }

    // ✅ Requête fetch normale
    try {
      console.log(`🔄 FETCH ${options.method || 'GET'} ${url}`);
      
      const response = await fetch(url, defaultOptions);
      
      console.log('📡 Response reçue:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        ok: response.ok
      });
      
      if (!response.ok) {
        let errorMessage = `Erreur HTTP ${response.status}`;
        
        // ✅ Gestion spécifique des erreurs de session
        switch (response.status) {
          case 401:
            errorMessage = 'Session expirée - veuillez vous reconnecter';
            break;
          case 403:
            errorMessage = 'Accès refusé - permissions insuffisantes';
            break;
          case 404:
            errorMessage = 'Ressource non trouvée';
            break;
          case 413:
            errorMessage = 'Fichier trop volumineux';
            break;
          case 500:
            errorMessage = 'Erreur interne du serveur';
            break;
        }
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
          console.error('❌ Erreur serveur détaillée:', errorData);
        } catch (parseError) {
          console.warn('⚠️ Impossible de parser l\'erreur JSON');
        }
        
        console.error(`❌ Erreur ${response.status}:`, errorMessage);
        throw new Error(errorMessage);
      }
      
      // ✅ Traitement de la réponse
      const contentType = response.headers.get('Content-Type') || '';
      
      if (contentType.includes('application/json')) {
        const jsonResponse = await response.json();
        console.log('✅ Réponse JSON parsée:', jsonResponse);
        return jsonResponse;
      } else {
        const textResponse = await response.text();
        console.log('✅ Réponse texte reçue:', textResponse);
        return { success: true, data: textResponse } as unknown as T;
      }
      
    } catch (error: any) {
      console.error('❌ Erreur dans request:', error);
      
      // ✅ CORRECTION : Meilleure gestion des erreurs de connexion
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        throw new Error('Erreur de connexion - vérifiez que le serveur est accessible');
      }
      
      if (error.name === 'AbortError') {
        throw new Error('Requête annulée');
      }
      
      throw error;
    }
  }

  // ✅ CORRECTION : XMLHttpRequest pour upload avec session
  private requestWithProgress<T>(
    url: string,
    options: RequestInit,
    onProgress: (progress: number) => void
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      // ✅ Configuration de la progression
      if (xhr.upload) {
        xhr.upload.addEventListener('loadstart', () => {
          console.log('🚀 Début de l\'upload');
        });
        
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded * 100) / event.total);
            onProgress(progress);
            console.log(`📊 Upload progression: ${progress}% (${event.loaded}/${event.total} bytes)`);
          }
        });
        
        xhr.upload.addEventListener('load', () => {
          console.log('📤 Upload terminé');
        });
        
        xhr.upload.addEventListener('error', () => {
          console.error('❌ Erreur upload');
        });
      }
      
      // ✅ Gestion des événements
      xhr.onload = () => {
        console.log('📡 XHR Response:', {
          status: xhr.status,
          statusText: xhr.statusText,
          responseURL: xhr.responseURL,
          responseText: xhr.responseText.substring(0, 200) + '...' // Truncated pour les logs
        });
        
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            console.log('✅ Upload réussi:', response);
            resolve(response);
          } catch (parseError) {
            console.warn('⚠️ Erreur parsing JSON, mais upload réussi');
            resolve({ success: true, message: 'Upload réussi' } as unknown as T);
          }
        } else {
          let errorMessage = `Erreur HTTP ${xhr.status}`;
          
          // ✅ Messages d'erreur spécifiques aux sessions
          switch (xhr.status) {
            case 0:
              errorMessage = 'Erreur de connexion réseau';
              break;
            case 401:
              errorMessage = 'Session expirée - veuillez vous reconnecter';
              break;
            case 403:
              errorMessage = 'Accès refusé';
              break;
            case 413:
              errorMessage = 'Fichier trop volumineux';
              break;
            case 500:
              errorMessage = 'Erreur interne du serveur';
              break;
          }
          
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            errorMessage = errorResponse.message || errorResponse.error || errorMessage;
            console.error('❌ Erreur détaillée:', errorResponse);
          } catch {
            console.warn('⚠️ Impossible de parser l\'erreur');
          }
          
          console.error(`❌ XHR Error ${xhr.status}:`, errorMessage);
          reject(new Error(errorMessage));
        }
      };
      
      xhr.onerror = () => {
        console.error('❌ XHR Network Error');
        reject(new Error('Erreur réseau lors de la requête'));
      };
      
      xhr.ontimeout = () => {
        console.error('❌ XHR Timeout');
        reject(new Error('Timeout - le serveur met trop de temps à répondre'));
      };
      
      // ✅ Configuration de la requête avec session
      console.log('🔄 XHR POST', url, '(avec progression et session)');
      xhr.open(options.method || 'POST', url);
      
      // ✅ Ajout des headers (pas de Content-Type pour FormData)
      const headers = options.headers as Record<string, string> || {};
      Object.entries(headers).forEach(([key, value]) => {
        if (key.toLowerCase() !== 'content-type' || !(options.body instanceof FormData)) {
          xhr.setRequestHeader(key, value);
          console.log(`🏷️ Header ajouté: ${key}: ${value}`);
        }
      });
      
      // ✅ Configuration des cookies/session
      xhr.withCredentials = true; // CRUCIAL pour les cookies de session
      xhr.timeout = 120000; // 2 minutes
      
      console.log('📤 Envoi de la requête XHR avec session...');
      xhr.send(options.body as any);
    });
  }

  // ✅ Méthodes utilitaires inchangées
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
      ...options,
      method: 'POST',
      body: isFormData ? data : JSON.stringify(data),
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

  // ✅ AJOUT : Méthode pour tester la session
  async checkSession(): Promise<boolean> {
    try {
      await this.get('/auth/profile');
      return true;
    } catch (error) {
      console.warn('⚠️ Session invalide:', error);
      return false;
    }
  }

  // ✅ AJOUT : Méthode pour télécharger des fichiers
  async downloadFile(endpoint: string, filename?: string): Promise<void> {
    try {
      const response = await fetch(this.buildUrl(endpoint), {
        credentials: 'include',
        headers: {
          'Accept': 'application/octet-stream'
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur téléchargement: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'file';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('❌ Erreur téléchargement:', error);
      throw error;
    }
  }
}

export const baseService = new BaseService();