// src/hooks/useFilesClient.ts
import { useState, useCallback } from 'react';
import { filesClientService, FileClientUploadData } from '../services/filesClient.service';
import { Modele3DClient } from '../types/FileClientData';

export const useFilesClient = () => {
  const [files, setFiles] = useState<Modele3DClient[]>([]); // ✅ Type correct
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);

  // ✅ Fonction d'upload modifiée pour accepter FileClientUploadData
  const uploadFile = useCallback(async (
    uploadData: FileClientUploadData,
    onProgress?: (progress: number) => void
  ): Promise<any> => { // Changed from FileClientUploadResponse to any
    if (uploading) {
      throw new Error('Un upload est déjà en cours');
    }
    
    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      console.log('🔄 Upload avec données:', uploadData);
      
      const result = await filesClientService.uploadFileClient(
        uploadData,
        (progress) => {
          setProgress(progress);
          onProgress?.(progress);
        }
      );
      
      console.log('✅ Upload terminé:', result);
      
      // Recharger les fichiers après upload
      await refreshFiles();
      
      return result;
      
    } catch (err: any) {
      console.error('❌ Erreur upload dans hook:', err);
      const errorMessage = err.message || 'Erreur lors de l\'upload';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, [uploading]);

  // ✅ Fonction pour recharger les fichiers
  const refreshFiles = useCallback(async (showAllFiles: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Chargement des fichiers...', { showAllFiles });
      
      // ✅ CORRECTION : Utiliser seulement getFilesClient 
      // Le paramètre showAllFiles sera géré côté backend ou ignoré pour l'instant
      const response = await filesClientService.getFilesClient();
      
      const filesList = response.data || [];
      if (response.success) {
        setFiles(filesList);
        console.log('✅ Fichiers chargés:', filesList.length);
      } else {
        throw new Error(response.message || 'Erreur lors du chargement des fichiers');
      }
    } catch (error: any) {
      console.error('❌ Erreur chargement fichiers:', error);
      const errorMessage = error.message || 'Erreur lors du chargement des fichiers';
      setError(errorMessage);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Fonction pour supprimer un fichier (améliorée)
  const deleteFile = useCallback(async (id: number) => {
    try {
      setError(null);
      
      console.log('🗑️ Suppression du fichier:', id);
      
      const response = await filesClientService.deleteFileClient(id);
      
      if (response.success) {
        // Supprimer le fichier de l'état local immédiatement
        setFiles(prevFiles => prevFiles.filter(file => file.id !== id));
        console.log('✅ Fichier supprimé:', id);
      } else {
        throw new Error(response.message || 'Erreur lors de la suppression');
      }
      
    } catch (err: any) {
      console.error('❌ Erreur delete file:', err);
      const errorMessage = err.message || 'Erreur lors de la suppression';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // ✅ Fonction de validation de fichier 3D
  const isValid3DFile = useCallback((filename: string): boolean => {
    const validExtensions = ['stl', 'obj', 'ply', '3mf', 'amf'];
    const extension = filename.split('.').pop()?.toLowerCase();
    return validExtensions.includes(extension || '');
  }, []);

  // ✅ Fonction de validation de taille
  const isValidFileSize = useCallback((size: number): boolean => {
    const maxSize = 50 * 1024 * 1024; // 50MB
    return size <= maxSize;
  }, []);

  // ✅ Fonction de reset
  const reset = useCallback(() => {
    setError(null);
    setProgress(0);
    setUploading(false);
    setLoading(false);
  }, []);

  // ✅ Fonction pour obtenir les détails d'un fichier
  const getFileById = useCallback((id: number): Modele3DClient | undefined => {
    return files.find(file => file.id === id);
  }, [files]);

  // ✅ Fonction pour obtenir les statistiques
  const getFilesStats = useCallback(() => {
    return {
      total: files.length,
      totalSize: files.reduce((sum, file) => sum + (Number(file.fichier3D?.tailleFichier) || 0), 0),
      formats: [...new Set(files.map(file => file.fichier3D?.nomFichier?.split('.').pop()?.toLowerCase() || 'unknown'))],
      recent: files.slice(0, 5),
      verified: files.filter(file => file.estVerifie).length,
      unverified: files.filter(file => !file.estVerifie).length
    };
  }, [files]);

  // ✅ Fonction pour filtrer les fichiers
  const getFilteredFiles = useCallback((filter: {
    verified?: boolean;
    format?: string;
    search?: string;
  }) => {
    return files.filter(file => {
      if (filter.verified !== undefined && file.estVerifie !== filter.verified) {
        return false;
      }
      
      if (filter.format && !file.fichier3D?.nomFichier?.toLowerCase().endsWith(filter.format.toLowerCase())) {
        return false;
      }
      
      if (filter.search) {
        const searchTerm = filter.search.toLowerCase();
        return file.nom?.toLowerCase().includes(searchTerm) || 
               file.fichier3D?.nomFichier?.toLowerCase().includes(searchTerm);
      }
      
      return true;
    });
  }, [files]);

  // ✅ Fonction pour obtenir les formats disponibles
  const getAvailableFormats = useCallback(() => {
    const formats = new Set<string>();
    files.forEach(file => {
      if (file.fichier3D?.nomFichier) {
        const extension = file.fichier3D.nomFichier.split('.').pop()?.toLowerCase();
        if (extension) {
          formats.add(extension);
        }
      }
    });
    return Array.from(formats).sort();
  }, [files]);

  return {
    // ✅ État
    files,
    uploading,
    loading,
    error,
    progress,
    
    // ✅ Actions principales
    uploadFile,
    deleteFile,
    refreshFiles,
    reset,
    
    // ✅ Utilitaires de validation
    isValid3DFile,
    isValidFileSize,
    
    // ✅ Utilitaires de données
    getFileById,
    getFilesStats,
    getFilteredFiles,
    getAvailableFormats,
    
    // ✅ Propriétés calculées
    hasFiles: files.length > 0,
    isEmpty: files.length === 0,
    isIdle: !uploading && !loading,
    canUpload: !uploading && !loading,
    
    // ✅ Statistiques rapides
    filesCount: files.length,
    verifiedCount: files.filter(f => f.estVerifie).length,
    unverifiedCount: files.filter(f => !f.estVerifie).length,
    totalSize: files.reduce((sum, file) => sum + (Number(file.fichier3D?.tailleFichier) || 0), 0)
  };
};

export default useFilesClient;
