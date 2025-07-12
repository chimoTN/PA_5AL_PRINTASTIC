// src/components/FileClientUpload.tsx
import React, { useRef, useState, useCallback } from 'react';
import { useFilesClient } from '../hooks/useFilesClient';
import { useAuth } from '../hooks/useAuth';
import MaterialSelector from './MaterialSelector';
import { Material } from '../services/materials.service';
import { FileClientUploadData } from '../services/filesClient.service';

interface FileClientUploadProps {
  onUploadSuccess?: (response: any) => void;
  onUploadError?: (error: string) => void;
  disabled?: boolean;
  acceptedFormats?: string[];
  maxSizeMB?: number;
}

const FileClientUpload: React.FC<FileClientUploadProps> = ({
  onUploadSuccess,
  onUploadError,
  disabled = false,
  acceptedFormats = ['.stl', '.obj', '.ply', '.3mf', '.amf'],
  maxSizeMB = 50
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { 
    uploadFile,
    uploading, 
    progress, 
    error, 
    reset, 
    isValid3DFile 
  } = useFilesClient();
  
  const { isAuthenticated, isLoading } = useAuth();

  // ✅ États pour les champs (avec nouvelles fonctionnalités)
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [scaling, setScaling] = useState<number>(100);
  const [description, setDescription] = useState<string>('');
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [customName, setCustomName] = useState<string>(''); // ✅ Nom personnalisé
  const [country] = useState<string>('FR'); // ✅ Pays (France par défaut)
  const [dragOver, setDragOver] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    file?: string;
    scaling?: string;
    description?: string;
    material?: string;
    customName?: string;
  }>({});

  // ✅ Fonction pour obtenir le nom d'affichage
  const getDisplayName = useCallback((file: File | null, custom: string): string => {
    if (!file) return '';
    const trimmedCustom = custom.trim();
    return trimmedCustom || file.name;
  }, []);

  // ✅ Validation du formulaire
  const validateForm = useCallback((): boolean => {
    const errors: typeof validationErrors = {};

    if (!selectedFile) {
      errors.file = 'Veuillez sélectionner un fichier';
    }

    if (scaling < 10 || scaling > 1000) {
      errors.scaling = 'Le scaling doit être entre 10 et 1000';
    }

    if (description.trim().length < 5) {
      errors.description = 'La description doit contenir au moins 5 caractères';
    }

    if (!selectedMaterial) {
      errors.material = 'Veuillez sélectionner un matériau';
    }

    // ✅ Validation du nom personnalisé (optionnel mais si présent, doit être valide)
    if (customName.trim() && customName.trim().length < 2) {
      errors.customName = 'Le nom personnalisé doit contenir au moins 2 caractères';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [selectedFile, scaling, description, selectedMaterial, customName]);

  // ✅ Gestion sélection fichier
  const handleFileSelect = useCallback(async (file: File) => {
    if (!isAuthenticated) {
      const errorMsg = 'Vous devez être connecté pour uploader un fichier';
      setValidationErrors(prev => ({ ...prev, file: errorMsg }));
      onUploadError?.(errorMsg);
      return;
    }

    // Validation du fichier
    if (!isValid3DFile(file.name)) {
      const errorMsg = `Format non supporté. Formats acceptés: ${acceptedFormats.join(', ')}`;
      setValidationErrors(prev => ({ ...prev, file: errorMsg }));
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      const errorMsg = `Fichier trop volumineux (${(file.size / 1024 / 1024).toFixed(2)}MB). Maximum: ${maxSizeMB}MB`;
      setValidationErrors(prev => ({ ...prev, file: errorMsg }));
      return;
    }

    setSelectedFile(file);
    // ✅ Remplir automatiquement le nom personnalisé avec le nom du fichier (sans extension)
    if (!customName.trim()) {
      const nameWithoutExtension = file.name.replace(/\.[^/.]+$/, '');
      setCustomName(nameWithoutExtension);
    }
    
    setValidationErrors(prev => ({ ...prev, file: undefined }));
    console.log('✅ Fichier sélectionné:', file.name);
  }, [isAuthenticated, isValid3DFile, acceptedFormats, maxSizeMB, onUploadError, customName]);

  // ✅ CORRECTION : Gestion upload avec les bons noms de propriétés
  const handleUpload = useCallback(async () => {
    if (!validateForm() || !selectedFile || !selectedMaterial) {
      console.warn('❌ Validation du formulaire échouée');
      return;
    }

    try {
      console.log('🔄 Début de l\'upload...');
      
      // ✅ CORRECTION : Utiliser les bons noms de propriétés
      const uploadData: FileClientUploadData = {
        fichier: selectedFile,                     // ✅ CORRECTION : "fichier" au lieu de "file"
        scaling: scaling,                          // ✅ OK
        description: description.trim(),           // ✅ OK
        materiauId: selectedMaterial.id,           // ✅ CORRECTION : "materiauId" au lieu de "idMatériau"
        nomPersonnalise: customName.trim() || undefined, // ✅ CORRECTION : "nomPersonnalise" au lieu de "nom"
        pays: country                              // ✅ OK
      };

      console.log('📦 Données d\'upload:', {
        fileName: uploadData.fichier.name,
        customName: uploadData.nomPersonnalise,
        displayName: getDisplayName(selectedFile, customName),
        fileSize: `${(uploadData.fichier.size / 1024 / 1024).toFixed(2)}MB`,
        scaling: uploadData.scaling,
        description: uploadData.description,
        materiauId: uploadData.materiauId,
        pays: uploadData.pays
      });

      const result = await uploadFile(uploadData, (progressValue) => {
        console.log(`📊 Progression: ${progressValue}%`);
      });
      
      console.log('🔍 Résultat upload:', result);
      
      if (result && result.success) {
        console.log('✅ Upload réussi:', result);
        handleReset();
        onUploadSuccess?.(result);
      } else {
        throw new Error(result?.message || 'Upload échoué');
      }
    } catch (err: any) {
      console.error('❌ Erreur upload:', err);
      
      let errorMsg = err.message || 'Erreur lors de l\'upload';
      
      if (err.message?.includes('session') || err.message?.includes('401')) {
        errorMsg = 'Votre session a expiré. Veuillez vous reconnecter.';
      } else if (err.message?.includes('422')) {
        errorMsg = 'Données invalides. Vérifiez vos paramètres.';
      } else if (err.message?.includes('413')) {
        errorMsg = 'Fichier trop volumineux.';
      } else if (err.message?.includes('415')) {
        errorMsg = 'Format de fichier non supporté.';
      }
      
      setValidationErrors(prev => ({ ...prev, file: errorMsg }));
      onUploadError?.(errorMsg);
    }
  }, [validateForm, selectedFile, selectedMaterial, scaling, description, customName, country, uploadFile, onUploadSuccess, onUploadError, getDisplayName]);

  // ✅ Reset du formulaire
  const handleReset = useCallback(() => {
    setSelectedFile(null);
    setScaling(100);
    setDescription('');
    setSelectedMaterial(null);
    setCustomName('');
    setValidationErrors({});
    reset();
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [reset]);

  // ✅ Handlers pour les événements
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !uploading && isAuthenticated) {
      setDragOver(true);
    }
  }, [disabled, uploading, isAuthenticated]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    if (disabled || uploading || !isAuthenticated) return;
    
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  }, [disabled, uploading, isAuthenticated, handleFileSelect]);

  const openFileDialog = useCallback(() => {
    if (!disabled && !uploading && isAuthenticated) {
      fileInputRef.current?.click();
    }
  }, [disabled, uploading, isAuthenticated]);

  // ✅ Affichage pendant le chargement
  if (isLoading) {
    return (
      <div className="file-upload-container" style={{ 
        maxWidth: '700px', 
        margin: '20px auto',
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: '#6c757d'
        }}>
          <i className="fas fa-spinner fa-spin fa-2x" style={{ marginBottom: '15px' }}></i>
          <p>Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  // ✅ Affichage si pas authentifié
  if (!isAuthenticated) {
    return (
      <div className="file-upload-container" style={{ 
        maxWidth: '700px', 
        margin: '20px auto',
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: '#dc3545'
        }}>
          <i className="fas fa-lock fa-3x" style={{ marginBottom: '15px' }}></i>
          <h3>Connexion requise</h3>
          <p>Vous devez être connecté pour uploader vos fichiers 3D</p>
        </div>
      </div>
    );
  }

  return (
    <div className="file-upload-container" style={{ 
      maxWidth: '700px', 
      margin: '20px auto',
      padding: '20px',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats.join(',')}
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
        disabled={disabled || uploading}
      />

      {/* ✅ Zone de sélection fichier */}
      {!selectedFile && (
        <div>
          <div
            onClick={openFileDialog}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{ 
              cursor: (disabled || uploading) ? 'not-allowed' : 'pointer',
              border: validationErrors.file 
                ? '2px dashed #dc3545' 
                : dragOver 
                  ? '2px dashed #007bff' 
                  : '2px dashed #dee2e6',
              backgroundColor: dragOver ? '#f8f9fa' : 'white',
              padding: '40px',
              borderRadius: '8px',
              textAlign: 'center',
              minHeight: '150px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              marginBottom: '20px'
            }}
          >
            <div>
              <i className="fas fa-cloud-upload-alt fa-3x" style={{ 
                color: validationErrors.file ? '#dc3545' : '#6c757d',
                marginBottom: '15px'
              }}></i>
              <h4 style={{ margin: '0 0 10px 0', color: '#495057' }}>
                {dragOver ? 'Relâchez pour sélectionner' : 'Sélectionnez votre fichier 3D'}
              </h4>
              <p style={{ color: '#6c757d', margin: '10px 0' }}>
                Cliquez ici ou glissez-déposez votre fichier
              </p>
              <small style={{ color: '#6c757d' }}>
                Formats: {acceptedFormats.join(', ')} • Max: {maxSizeMB}MB
              </small>
            </div>
          </div>

          {validationErrors.file && (
            <div style={{
              marginBottom: '20px',
              padding: '10px',
              backgroundColor: '#f8d7da',
              color: '#721c24',
              borderRadius: '4px',
              fontSize: '14px'
            }}>
              <i className="fas fa-exclamation-triangle" style={{ marginRight: '8px' }}></i>
              {validationErrors.file}
            </div>
          )}
        </div>
      )}

      {/* ✅ Section fichier sélectionné */}
      {selectedFile && !uploading && (
        <div>
          {/* ✅ Informations fichier */}
          <div style={{
            padding: '15px',
            backgroundColor: '#f8f9fa',
            borderRadius: '6px',
            marginBottom: '20px',
            border: '1px solid #dee2e6'
          }}>
            <h5 style={{ 
              margin: '0 0 10px 0', 
              color: '#495057',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <i className="fas fa-file-alt"></i>
              Fichier sélectionné
            </h5>
            
            <div style={{ fontSize: '14px', color: '#6c757d' }}>
              <div><strong>Nom du fichier:</strong> {selectedFile.name}</div>
              <div><strong>Nom d'affichage:</strong> {getDisplayName(selectedFile, customName)}</div>
              <div><strong>Taille:</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</div>
              <div><strong>Type:</strong> Fichier 3D</div>
              <div><strong>Pays:</strong> 🇫🇷 France</div>
            </div>
            
            <button
              onClick={() => {
                setSelectedFile(null);
                setCustomName('');
              }}
              style={{
                marginTop: '10px',
                padding: '6px 12px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              <i className="fas fa-times"></i> Changer de fichier
            </button>
          </div>

          {/* ✅ Configuration du modèle */}
          <div style={{ marginBottom: '20px' }}>
            <h5 style={{ 
              margin: '0 0 15px 0', 
              color: '#495057',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <i className="fas fa-cogs"></i>
              Configuration du modèle
            </h5>

            {/* ✅ Nom personnalisé */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#495057'
              }}>
                <i className="fas fa-tag" style={{ marginRight: '8px' }}></i>
                Nom personnalisé
              </label>
              
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder={`Nom par défaut: ${selectedFile.name}`}
                maxLength={100}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: validationErrors.customName ? '1px solid #dc3545' : '1px solid #ced4da',
                  borderRadius: '4px',
                  fontSize: '14px',
                  backgroundColor: '#f8f9fa',
                  color: '#495057',
                  boxSizing: 'border-box'
                }}
              />
              
              {validationErrors.customName && (
                <small style={{ color: '#dc3545', display: 'block', marginTop: '5px' }}>
                  {validationErrors.customName}
                </small>
              )}
              
              <small style={{ color: '#6c757d', display: 'block', marginTop: '5px' }}>
                Ce nom vous aidera à identifier votre modèle sur votre tableau de bord.
                {customName.length > 0 && ` (${customName.length}/100 caractères)`}
              </small>
            </div>

            {/* ✅ Scaling */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#495057'
              }}>
                <i className="fas fa-expand-arrows-alt" style={{ marginRight: '8px' }}></i>
                Scaling (10-1000) <span style={{ color: '#dc3545' }}>*</span>
              </label>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <input
                  type="range"
                  min="10"
                  max="1000"
                  value={scaling}
                  onChange={(e) => setScaling(Number(e.target.value))}
                  style={{ flex: 1 }}
                />
                <input
                  type="number"
                  min="10"
                  max="1000"
                  value={scaling}
                  onChange={(e) => setScaling(Number(e.target.value))}
                  style={{
                    width: '80px',
                    padding: '8px',
                    border: validationErrors.scaling ? '1px solid #dc3545' : '1px solid #ced4da',
                    borderRadius: '4px',
                    textAlign: 'center',
                    backgroundColor: '#f8f9fa',
                    color: '#495057'
                  }}
                />
              </div>
              
              {validationErrors.scaling && (
                <small style={{ color: '#dc3545' }}>
                  {validationErrors.scaling}
                </small>
              )}
              
              <small style={{ color: '#6c757d', display: 'block', marginTop: '5px' }}>
                Ce facteur sera utilisé pour définir les dimensions finales
              </small>
            </div>

            {/* ✅ Description */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#495057'
              }}>
                <i className="fas fa-align-left" style={{ marginRight: '8px' }}></i>
                Description <span style={{ color: '#dc3545' }}>*</span>
              </label>
              
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Décrivez votre modèle 3D (minimum 5 caractères)..."
                rows={4}
                maxLength={500}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: validationErrors.description ? '1px solid #dc3545' : '1px solid #ced4da',
                  borderRadius: '4px',
                  fontSize: '14px',
                  resize: 'vertical',
                  backgroundColor: '#f8f9fa',
                  color: '#495057',
                  boxSizing: 'border-box'
                }}
              />
              
              {validationErrors.description && (
                <small style={{ color: '#dc3545' }}>
                  {validationErrors.description}
                </small>
              )}
              
              <small style={{ color: '#6c757d', display: 'block', marginTop: '5px' }}>
                {description.length}/500 caractères
              </small>
            </div>

            {/* ✅ Matériau */}
            <div style={{ marginBottom: '20px' }}>
              <MaterialSelector
                selectedMaterialId={selectedMaterial?.id || null}
                onMaterialSelect={(material) => setSelectedMaterial(material)}
                label="Matériau d'impression"
                placeholder="Choisissez le matériau pour l'impression"
                required={true}
                showPrice={true}
                showDescription={false}
              />
              
              {validationErrors.material && (
                <small style={{ color: '#dc3545' }}>
                  {validationErrors.material}
                </small>
              )}
            </div>
          </div>

          {/* ✅ Boutons d'action */}
          <div style={{
            display: 'flex',
            gap: '10px',
            justifyContent: 'flex-end'
          }}>
            <button
              onClick={handleReset}
              style={{
                padding: '10px 20px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              <i className="fas fa-times"></i> Annuler
            </button>
            
            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              style={{
                padding: '10px 20px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                opacity: (!selectedFile || uploading) ? 0.6 : 1
              }}
            >
              <i className="fas fa-upload"></i> Télécharger le modèle
            </button>
          </div>
        </div>
      )}

      {/* ✅ Progression d'upload */}
      {uploading && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <i className="fas fa-spinner fa-spin fa-2x" style={{ color: '#28a745', marginBottom: '15px' }}></i>
          <h4>Upload en cours...</h4>
          <p style={{ color: '#6c757d', marginBottom: '15px' }}>
            Envoi de "{getDisplayName(selectedFile, customName)}"
          </p>
          
          <div style={{
            width: '100%',
            height: '8px',
            backgroundColor: '#e9ecef',
            borderRadius: '4px',
            overflow: 'hidden',
            margin: '15px 0'
          }}>
            <div style={{
              width: `${progress}%`,
              height: '100%',
              backgroundColor: '#28a745',
              transition: 'width 0.3s ease'
            }}></div>
          </div>
          
          <p style={{ color: '#28a745', fontWeight: 'bold' }}>
            {progress}%
          </p>
          
          <button 
            onClick={handleReset}
            style={{
              padding: '8px 16px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Annuler
          </button>
        </div>
      )}

      {/* ✅ Messages d'erreur */}
      {error && (
        <div style={{
          marginTop: '15px',
          padding: '10px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          borderRadius: '4px'
        }}>
          <i className="fas fa-exclamation-triangle" style={{ marginRight: '8px' }}></i>
          {error}
        </div>
      )}
    </div>
  );
};

export default FileClientUpload;
