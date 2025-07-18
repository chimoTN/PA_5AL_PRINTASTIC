// src/components/ProductFileUpload.tsx
import React, { useState, useRef, DragEvent, ChangeEvent, useEffect } from 'react';
import { FileClientUploadData } from '../services/filesClient.service';
import { useAuth } from '../hooks/useAuth';
import type { Material } from '../services/materials.service';
import '../assets/styles/FileUpload.css';
import { filesClientService } from '../services/filesClient.service';
import { useMaterials } from '../hooks/useMateriaux';

interface ProductFileUploadProps {
  onUploadSuccess?: (response: any) => void; // Changed from FileClientUploadResponse
  onUploadError?: (error: string) => void;
}

interface ProductMetadata {
  nom: string;
  description: string;
  scaling: number;
  selectedMaterialId: number | null;
}

const ProductFileUpload: React.FC<ProductFileUploadProps> = ({ 
  onUploadSuccess, 
  onUploadError 
}) => {
  // ✅ CORRECTION : Utiliser useMaterials au lieu de useMateriaux
  const { isAuthenticated, refreshAuth } = useAuth();
  const { materials, loading: materialsLoading, loadMaterials } = useMaterials(); // ✅ Correction
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  // ✅ CORRECTION : Structure des données produit adaptée
  const [productData, setProductData] = useState<ProductMetadata>({
    nom: '',
    description: '',
    scaling: 100,
    selectedMaterialId: null,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Formats de fichiers acceptés
  const acceptedFormats = ['.stl', '.obj', '.3mf', '.ply', '.amf'];
  const maxFileSize = 50 * 1024 * 1024; // 50MB

  // ✅ Charger les matériaux au montage du composant
  useEffect(() => {
    if (isAuthenticated) {
      loadMaterials();
    }
  }, [isAuthenticated, loadMaterials]);

  // Debug : Afficher l'état d'authentification
  useEffect(() => {
    // console.log('🔍 Debug ProductFileUpload:');
    // console.log('- Auth Loading:', authLoading);
    // console.log('- Is Authenticated:', isAuthenticated);
    // console.log('- Materials:', materials.length);
  }, [isAuthenticated, materials]);

  // Validation du fichier
  const validateFile = (file: File): string[] => {
    const errors: string[] = [];
    
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedFormats.includes(fileExtension)) {
      errors.push(`Format non supporté. Formats acceptés: ${acceptedFormats.join(', ')}`);
    }
    
    if (file.size > maxFileSize) {
      errors.push(`Fichier trop volumineux. Taille maximale: ${maxFileSize / (1024 * 1024)}MB`);
    }
    
    return errors;
  };

  // ✅ CORRECTION : Validation des métadonnées produit adaptée
  const validateProductData = (): string[] => {
    const errors: string[] = [];
    
    if (!productData.nom.trim()) {
      errors.push('Le nom du produit est requis');
    }

    if (!productData.description.trim() || productData.description.trim().length < 10) {
      errors.push('La description doit contenir au moins 10 caractères');
    }

    if (productData.scaling < 10 || productData.scaling > 1000) {
      errors.push('Le scaling doit être entre 10% et 1000%');
    }

    if (!productData.selectedMaterialId) {
      errors.push('Veuillez sélectionner un matériau');
    }
    
    return errors;
  };

  // Gestion du drag & drop
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  // Gestion de la sélection de fichier
  const handleFileSelection = (file: File) => {
    const errors = validateFile(file);
    setValidationErrors(errors);
    
    if (errors.length === 0) {
      setSelectedFile(file);
      // Auto-remplir le nom du produit avec le nom du fichier (sans extension)
      if (!productData.nom) {
        const fileName = file.name.replace(/\.[^/.]+$/, '');
        setProductData(prev => ({ ...prev, nom: fileName }));
      }
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  // ✅ CORRECTION : Gestion des changements adaptée aux nouveaux types
  const handleProductDataChange = (field: keyof ProductMetadata, value: string | number | null) => {
    setProductData(prev => ({
      ...prev,
      [field]: value
    }));
  };



  // ✅ CORRECTION : Upload du fichier avec FileClientUploadData
  const handleUpload = async () => {
    if (!selectedFile || !productData.selectedMaterialId) return;

    // Vérifier à nouveau l'authentification avant l'upload
    if (!isAuthenticated) {
      // console.log('🔄 Tentative de rafraîchissement de l\'authentification...');
      await refreshAuth();
      
      if (!isAuthenticated) {
        onUploadError?.('Vous devez être connecté pour uploader des fichiers');
        return;
      }
    }

    const productErrors = validateProductData();
    if (productErrors.length > 0) {
      setValidationErrors(productErrors);
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);
      setValidationErrors([]);

      // console.log('🚀 Début upload avec authentification vérifiée');
      // console.log('📁 Fichier:', selectedFile.name);
      // console.log('👤 Authentifié:', isAuthenticated);
      
      // ✅ CORRECTION : Créer l'objet FileClientUploadData
      const uploadData: FileClientUploadData = {
        fichier: selectedFile,
        scaling: productData.scaling,
        description: productData.description,
        materiauId: productData.selectedMaterialId,     // ✅ "materiauId" au lieu de "idMatériau"
        nomPersonnalise: productData.nom,               // ✅ "nomPersonnalise" au lieu de "nom"
        pays: 'France'                  // ✅ Ajout du champ "pays" manquant
      };

      const response = await filesClientService.uploadFileClient(
        uploadData,
        (progress) => {
          // console.log(`📊 Progression: ${progress}%`);
          setUploadProgress(progress);
        }
      );

      if (response.success) {
        // console.log('✅ Upload réussi:', response);
        onUploadSuccess?.(response);
        
        // Reset du formulaire
        setSelectedFile(null);
        setProductData({
          nom: '',
          description: '',
          scaling: 100,
          selectedMaterialId: null,
        });
        setUploadProgress(0);
        
        // Reset de l'input file
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        throw new Error(response.message || 'Erreur lors de l\'upload');
      }
    } catch (error: any) {
      console.error('❌ Erreur upload:', error);
      
      // Gestion spécifique de l'erreur 401
      if (error.message.includes('401') || error.message.includes('Non authentifié')) {
        // console.log('🔄 Erreur 401 - Tentative de rafraîchissement...');
        await refreshAuth();
        onUploadError?.('Session expirée, veuillez vous reconnecter');
      } else {
        onUploadError?.(error.message);
      }
    } finally {
      setIsUploading(false);
    }
  };

  // Affichage pendant le chargement de l'authentification
  if (false) { // authLoading n'existe pas dans useAuth
    return (
      <div className="file-upload-container">
        <div className="loading-auth">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  // Affichage si non authentifié
  if (!isAuthenticated) {
    return (
      <div className="file-upload-container">
        <div className="auth-required">
          <i className="fas fa-lock"></i>
          <h3>Authentification requise</h3>
          <p>Vous devez être connecté pour uploader des fichiers 3D.</p>
          <button 
            onClick={refreshAuth}
            className="btn btn-primary"
          >
            <i className="fas fa-refresh"></i>
            Vérifier la connexion
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="file-upload-container">
      <h2>Upload de modèle 3D</h2>

      {/* Zone de drop */}
      <div 
        className={`file-drop-zone ${isDragging ? 'dragging' : ''} ${selectedFile ? 'has-file' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats.join(',')}
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
        />
        
        {selectedFile ? (
          <div className="selected-file">
            <i className="fas fa-cube"></i>
            <div className="file-info">
              <h4>{selectedFile.name}</h4>
              <p>{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setSelectedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="btn-remove"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        ) : (
          <div className="drop-message">
            <i className="fas fa-cloud-upload-alt"></i>
            <h3>Glissez votre fichier 3D ici</h3>
            <p>ou cliquez pour sélectionner</p>
            <p className="formats">Formats acceptés: {acceptedFormats.join(', ')}</p>
          </div>
        )}
      </div>

      {/* Erreurs de validation */}
      {validationErrors.length > 0 && (
        <div className="validation-errors">
          {validationErrors.map((error, index) => (
            <div key={index} className="error-message">
              <i className="fas fa-exclamation-triangle"></i>
              {error}
            </div>
          ))}
        </div>
      )}

      {/* ✅ CORRECTION : Métadonnées du produit adaptées */}
      {selectedFile && (
        <div className="product-metadata">
          <h3>Informations du produit</h3>
          
          <div className="form-group">
            <label>Nom du produit *</label>
            <input
              type="text"
              value={productData.nom}
              onChange={(e) => handleProductDataChange('nom', e.target.value)}
              placeholder="Nom de votre modèle 3D"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Scaling (%) *</label>
              <input
                type="number"
                min="10"
                max="1000"
                step="1"
                value={productData.scaling}
                onChange={(e) => {
                  const value = e.target.value;
                  handleProductDataChange('scaling', value ? parseInt(value) : 100);
                }}
                placeholder="100"
              />
              <small>Entre 10% et 1000%</small>
            </div>

            <div className="form-group">
              <label>Matériau *</label>
              <select
                value={productData.selectedMaterialId || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  handleProductDataChange('selectedMaterialId', value ? parseInt(value) : null);
                }}
                disabled={materialsLoading}
              >
                <option value="">Sélectionner un matériau</option>
                {materials?.filter(m => m.estDisponible).map((material: Material) => (
                  <option key={material.id} value={material.id}>
                    {material.nom} - {material.prixParGramme}€/g
                  </option>
                ))}
              </select>
              {materialsLoading && <small>Chargement des matériaux...</small>}
            </div>
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              value={productData.description}
              onChange={(e) => handleProductDataChange('description', e.target.value)}
              placeholder="Décrivez votre modèle 3D... (minimum 10 caractères)"
              rows={4}
              minLength={10}
            />
            <small>{productData.description.length}/10 caractères minimum</small>
          </div>

          {/* Aperçu du matériau sélectionné */}
          {productData.selectedMaterialId && (
            <div className="material-preview">
              {(() => {
                const selectedMaterial = materials.find(m => m.id === productData.selectedMaterialId);
                if (!selectedMaterial) return null;
                
                return (
                  <div className="material-info">
                    <h4>📦 {selectedMaterial.nom}</h4>
                    <p>{selectedMaterial.description}</p>
                    <div className="material-cost">
                      <span>Coût: <strong>{selectedMaterial.prixParGramme}€/gramme</strong></span>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* Barre de progression */}
      {isUploading && (
        <div className="upload-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p>Upload en cours... {uploadProgress}%</p>
        </div>
      )}

      {/* Bouton d'upload */}
      {selectedFile && !isUploading && (
        <div className="upload-actions">
          <button 
            onClick={handleUpload}
            className="btn btn-primary btn-upload"
            disabled={validationErrors.length > 0 || !productData.selectedMaterialId}
          >
            <i className="fas fa-upload"></i>
            Uploader le fichier
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductFileUpload;