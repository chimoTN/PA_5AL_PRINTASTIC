// src/components/FileClientUpload.tsx
import React, { useRef, useState, useCallback } from 'react';
import { useFilesClient } from '../hooks/useFilesClient';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/auth.service';
import MaterialSelector from './MaterialSelector';
import { Material } from '../services/materials.service';

interface FileClientUploadProps {
  onUploadSuccess?: (response: any) => void;
  onUploadError?: (error: string) => void;
  disabled?: boolean;
  acceptedFormats?: string[];
  maxSizeMB?: number;
}

export interface FileClientUploadData {
  file: File;
  scaling: number;
  description: string;
  idMatériau: number;
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
  
  const { isAuthenticated, authLoading } = useAuth();

  // États pour les champs
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [scaling, setScaling] = useState<number>(100);
  const [description, setDescription] = useState<string>('');
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    file?: string;
    scaling?: string;
    description?: string;
    material?: string;
  }>({});

  // ✅ Validation du formulaire avec useCallback
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

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [selectedFile, scaling, description, selectedMaterial]);

  // ✅ handleFileSelect avec useCallback
  const handleFileSelect = useCallback(async (file: File) => {
    // Vérification d'authentification renforcée
    if (!isAuthenticated) {
      const errorMsg = 'Vous devez être connecté pour uploader un fichier';
      setValidationErrors(prev => ({ ...prev, file: errorMsg }));
      onUploadError?.(errorMsg);
      return;
    }

    // Vérification de session serveur
    try {
      await authService.ensureAuthenticated();
    } catch (error: any) {
      const errorMsg = error.message || 'Session expirée - veuillez vous reconnecter';
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
    setValidationErrors(prev => ({ ...prev, file: undefined }));
    console.log('✅ Fichier sélectionné:', {
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      type: file.type || 'Fichier 3D'
    });
  }, [isAuthenticated, isValid3DFile, acceptedFormats, maxSizeMB, onUploadError]);

  // ✅ handleUpload avec useCallback
  const handleUpload = useCallback(async () => {
    if (!validateForm() || !selectedFile || !selectedMaterial) {
      console.warn('❌ Validation du formulaire échouée');
      return;
    }

    try {
      console.log('🔍 Vérification de l\'authentification avant upload...');
      
      // Vérification de session avant l'upload
      await authService.ensureAuthenticated();
      console.log('✅ Session validée, début de l\'upload');

      // Créer les données d'upload avec tous les champs requis
      const uploadData: FileClientUploadData = {
        file: selectedFile,
        scaling: scaling,
        description: description.trim(),
        idMatériau: selectedMaterial.id
      };

      console.log('🔄 Données d\'upload préparées:', {
        fileName: uploadData.file.name,
        fileSize: uploadData.file.size,
        scaling: uploadData.scaling,
        description: uploadData.description,
        materialId: uploadData.idMatériau
      });

      const result = await uploadFile(uploadData, (progressValue) => {
        console.log(`Upload progression: ${progressValue}%`);
      });
      
      if (result && result.success) {
        console.log('✅ Upload réussi:', result);
        // Réinitialiser le formulaire
        handleReset();
        onUploadSuccess?.(result);
      } else {
        throw new Error(result?.message || 'Upload échoué');
      }
    } catch (err: any) {
      console.error('❌ Erreur upload:', err);
      
      let errorMsg = err.message || 'Erreur lors de l\'upload';
      
      // Gestion des erreurs spécifiques
      if (err.message?.includes('session') || err.message?.includes('authentifié') || err.message?.includes('401')) {
        errorMsg = 'Votre session a expiré. Veuillez vous reconnecter.';
      } else if (err.message?.includes('réseau') || err.message?.includes('connexion')) {
        errorMsg = 'Erreur de connexion. Vérifiez votre connexion internet et réessayez.';
      } else if (err.message?.includes('taille') || err.message?.includes('size')) {
        errorMsg = 'Fichier trop volumineux ou corrompu.';
      }
      
      setValidationErrors(prev => ({ ...prev, file: errorMsg }));
      onUploadError?.(errorMsg);
    }
  }, [validateForm, selectedFile, selectedMaterial, scaling, description, uploadFile, onUploadSuccess, onUploadError]);

  // ✅ handleReset avec useCallback
  const handleReset = useCallback(() => {
    setSelectedFile(null);
    setScaling(100);
    setDescription('');
    setSelectedMaterial(null);
    setValidationErrors({});
    reset();
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    console.log('🔄 Formulaire réinitialisé');
  }, [reset]);

  // ✅ handleFileInputChange avec useCallback
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  // ✅ handleDragOver avec useCallback
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !uploading && isAuthenticated) {
      setDragOver(true);
    }
  }, [disabled, uploading, isAuthenticated]);

  // ✅ handleDragLeave avec useCallback
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  // ✅ handleDrop avec useCallback
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    if (disabled || uploading || !isAuthenticated) return;
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [disabled, uploading, isAuthenticated, handleFileSelect]);

  // ✅ openFileDialog avec useCallback
  const openFileDialog = useCallback(() => {
    if (!disabled && !uploading && isAuthenticated && !selectedFile) {
      fileInputRef.current?.click();
    }
  }, [disabled, uploading, isAuthenticated, selectedFile]);

  // ✅ clearFileError avec useCallback
  const clearFileError = useCallback(() => {
    setValidationErrors(prev => ({ ...prev, file: undefined }));
  }, []);

  // ✅ handleScalingChange avec useCallback
  const handleScalingChange = useCallback((value: number) => {
    setScaling(value);
  }, []);

  // ✅ handleDescriptionChange avec useCallback
  const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
  }, []);

  // ✅ handleMaterialSelect avec useCallback
  const handleMaterialSelect = useCallback((material: Material | null) => {
    setSelectedMaterial(material);
  }, []);

  // ✅ clearSelectedFile avec useCallback
  const clearSelectedFile = useCallback(() => {
    setSelectedFile(null);
  }, []);

  // Affichage pendant le chargement de l'authentification
  if (authLoading) {
    return (
      <div className="file-client-upload">
        <div className="upload-area disabled" style={{
          border: '2px dashed #ccc',
          borderRadius: '8px',
          padding: '40px',
          textAlign: 'center',
          backgroundColor: '#f8f9fa'
        }}>
          <div className="upload-prompt">
            <div className="upload-icon">
              <i className="fas fa-spinner fa-spin fa-3x" style={{ color: '#6c757d', marginBottom: '15px' }}></i>
            </div>
            <h3>Vérification de l'authentification...</h3>
          </div>
        </div>
      </div>
    );
  }

  // Affichage si pas authentifié
  if (!isAuthenticated) {
    return (
      <div className="file-client-upload">
        <div className="upload-area disabled" style={{
          border: '2px dashed #dc3545',
          borderRadius: '8px',
          padding: '40px',
          textAlign: 'center',
          backgroundColor: '#f8f9fa'
        }}>
          <div className="upload-prompt">
            <div className="upload-icon">
              <i className="fas fa-lock fa-3x" style={{ color: '#dc3545', marginBottom: '15px' }}></i>
            </div>
            <h3>Connexion requise</h3>
            <p className="upload-description" style={{ color: '#6c757d', margin: '10px 0' }}>
              Vous devez être connecté pour uploader vos fichiers 3D
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="file-client-upload" style={{ 
      maxWidth: '700px', 
      margin: '20px auto',
      padding: '20px',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }}>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats.join(',')}
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
        disabled={disabled || uploading}
      />

      {/* Zone de sélection de fichier avec gestion d'erreurs */}
      {!selectedFile && (
        <div>
          <div
            className={`upload-area ${dragOver ? 'drag-over' : ''} ${uploading ? 'uploading' : ''} ${disabled ? 'disabled' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={openFileDialog}
            style={{ 
              cursor: (disabled || uploading) ? 'not-allowed' : 'pointer',
              border: validationErrors.file 
                ? '2px dashed #e74c3c' 
                : dragOver 
                  ? '2px dashed #007bff' 
                  : '2px dashed #ccc',
              backgroundColor: dragOver ? '#f8f9fa' : 'white',
              padding: '40px',
              borderRadius: '8px',
              textAlign: 'center',
              minHeight: '200px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              marginBottom: '20px'
            }}
          >
            <div className="upload-prompt">
              <div className="upload-icon" style={{ marginBottom: '20px' }}>
                <i className="fas fa-cube fa-4x" style={{ 
                  color: validationErrors.file 
                    ? '#e74c3c' 
                    : dragOver 
                      ? '#007bff' 
                      : '#28a745',
                  transition: 'color 0.3s ease'
                }}></i>
              </div>
              
              <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>
                {dragOver ? 'Relâchez pour sélectionner' : 'Télécharger votre modèle 3D'}
              </h3>
              
              <p className="upload-description" style={{ 
                margin: '10px 0 20px 0',
                color: '#6c757d',
                fontSize: '16px'
              }}>
                {dragOver 
                  ? 'Déposez votre fichier ici' 
                  : 'Cliquez ici ou glissez-déposez votre fichier 3D personnel'
                }
              </p>
              
              <div className="upload-info" style={{ 
                marginTop: '20px', 
                fontSize: '13px', 
                color: '#6c757d',
                textAlign: 'left',
                maxWidth: '400px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <i className="fas fa-check-circle" style={{ color: '#28a745', marginRight: '8px' }}></i>
                  <span><strong>Formats:</strong> {acceptedFormats.join(', ')}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <i className="fas fa-weight-hanging" style={{ color: '#007bff', marginRight: '8px' }}></i>
                  <span><strong>Taille max:</strong> {maxSizeMB}MB</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <i className="fas fa-shield-alt" style={{ color: '#ffc107', marginRight: '8px' }}></i>
                  <span><strong>Privé:</strong> Visible uniquement par vous et les imprimeurs</span>
                </div>
              </div>
            </div>
          </div>

          {/* Affichage des erreurs de fichier */}
          {validationErrors.file && (
            <div style={{
              marginBottom: '20px',
              padding: '15px',
              backgroundColor: '#f8d7da',
              color: '#721c24',
              borderRadius: '5px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              border: '1px solid #f5c6cb'
            }}>
              <i className="fas fa-exclamation-triangle" style={{ fontSize: '18px' }}></i>
              <span style={{ flex: 1 }}>{validationErrors.file}</span>
              <button 
                onClick={clearFileError}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Informations sur le fichier sélectionné + Formulaire */}
      {selectedFile && !uploading && (
        <div>
          {/* Fichier sélectionné */}
          <div style={{
            marginBottom: '30px',
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #e1e8ed'
          }}>
            <h4 style={{
              margin: '0 0 15px 0',
              color: '#2c3e50',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <i className="fas fa-file-alt"></i>
              Fichier sélectionné
            </h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '15px',
              fontSize: '14px'
            }}>
              <div>
                <strong>Nom:</strong> {selectedFile.name}
              </div>
              <div>
                <strong>Taille:</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </div>
              <div>
                <strong>Type:</strong> {selectedFile.type || 'Fichier 3D'}
              </div>
            </div>
            <button
              onClick={clearSelectedFile}
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

          {/* Formulaire de configuration */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{
              margin: '0 0 20px 0',
              color: '#2c3e50',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <i className="fas fa-cogs"></i>
              Configuration du modèle
            </h4>

            {/* Scaling */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#2c3e50'
              }}>
                <i className="fas fa-expand-arrows-alt" style={{ marginRight: '8px', color: '#3498db' }}></i>
                Scaling (10-1000) <span style={{ color: '#e74c3c' }}>*</span>
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <input
                  type="range"
                  min="10"
                  max="1000"
                  value={scaling}
                  onChange={(e) => handleScalingChange(Number(e.target.value))}
                  style={{
                    flex: 1,
                    height: '6px',
                    borderRadius: '3px',
                    background: '#e1e8ed',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                />
                <input
                  type="number"
                  min="10"
                  max="1000"
                  value={scaling}
                  onChange={(e) => handleScalingChange(Number(e.target.value))}
                  style={{
                    width: '80px',
                    padding: '8px 12px',
                    border: validationErrors.scaling ? '2px solid #e74c3c' : '2px solid #e1e8ed',
                    borderRadius: '6px',
                    fontSize: '14px',
                    textAlign: 'center'
                  }}
                />
              </div>
              {validationErrors.scaling && (
                <div style={{
                  marginTop: '5px',
                  color: '#e74c3c',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  <i className="fas fa-exclamation-triangle"></i>
                  {validationErrors.scaling}
                </div>
              )}
              <div style={{
                marginTop: '5px',
                fontSize: '12px',
                color: '#7f8c8d'
              }}>
                Ce facteur sera utilisé pour définir les dimensions finales
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#2c3e50'
              }}>
                <i className="fas fa-align-left" style={{ marginRight: '8px', color: '#3498db' }}></i>
                Description <span style={{ color: '#e74c3c' }}>*</span>
              </label>
              <textarea
                value={description}
                onChange={handleDescriptionChange}
                placeholder="Décrivez votre modèle 3D (minimum 5 caractères)..."
                rows={4}
                maxLength={500}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: validationErrors.description ? '2px solid #e74c3c' : '2px solid #e1e8ed',
                  borderRadius: '6px',
                  fontSize: '14px',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box'
                }}
              />
              {validationErrors.description && (
                <div style={{
                  marginTop: '5px',
                  color: '#e74c3c',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  <i className="fas fa-exclamation-triangle"></i>
                  {validationErrors.description}
                </div>
              )}
              <div style={{
                marginTop: '5px',
                fontSize: '12px',
                color: '#7f8c8d'
              }}>
                {description.length}/500 caractères
              </div>
            </div>

            {/* Sélection de matériau */}
            <div style={{ marginBottom: '20px' }}>
              <MaterialSelector
                selectedMaterialId={selectedMaterial?.id || null}
                onMaterialSelect={handleMaterialSelect}
                label="Matériau d'impression"
                placeholder="Choisissez le matériau pour l'impression"
                required={true}
                showPrice={true}
                showDescription={true}
              />
              {validationErrors.material && (
                <div style={{
                  marginTop: '5px',
                  color: '#e74c3c',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  <i className="fas fa-exclamation-triangle"></i>
                  {validationErrors.material}
                </div>
              )}
            </div>
          </div>

          {/* Boutons d'action */}
          <div style={{
            display: 'flex',
            gap: '15px',
            justifyContent: 'flex-end'
          }}>
            <button
              onClick={handleReset}
              style={{
                padding: '12px 24px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              <i className="fas fa-undo"></i> Annuler
            </button>
            
            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              style={{
                padding: '12px 24px',
                backgroundColor: (!selectedFile || uploading) ? '#6c757d' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: (!selectedFile || uploading) ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                opacity: (!selectedFile || uploading) ? 0.6 : 1
              }}
            >
              <i className="fas fa-cloud-upload-alt"></i> Télécharger le modèle
            </button>
          </div>
        </div>
      )}

      {/* Progression d'upload */}
      {uploading && (
        <div className="upload-progress" style={{ width: '100%', textAlign: 'center' }}>
          <div className="upload-icon" style={{ marginBottom: '20px' }}>
            <i className="fas fa-cloud-upload-alt fa-3x" style={{ color: '#28a745' }}></i>
          </div>
          
          <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>Upload en cours...</h3>
          
          <div style={{
            width: '100%',
            height: '20px',
            backgroundColor: '#e0e0e0',
            borderRadius: '10px',
            overflow: 'hidden',
            margin: '15px 0',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)'
          }}>
            <div 
              style={{
                width: `${progress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #28a745, #20c997)',
                transition: 'width 0.3s ease',
                borderRadius: '10px'
              }}
            ></div>
          </div>
          
          <p className="progress-text" style={{ 
            margin: '10px 0 20px 0', 
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#28a745'
          }}>
            {progress}% - Fichier: {selectedFile?.name}
          </p>
          
          <button 
            type="button" 
            onClick={handleReset}
            style={{
              padding: '10px 20px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            <i className="fas fa-times"></i> Annuler
          </button>
        </div>
      )}

      {/* Messages d'erreur globaux */}
      {error && !validationErrors.file && (
        <div style={{
          marginTop: '15px',
          padding: '15px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          borderRadius: '5px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          border: '1px solid #f5c6cb'
        }}>
          <i className="fas fa-exclamation-triangle" style={{ fontSize: '18px' }}></i>
          <span style={{ flex: 1 }}>{error}</span>
          <button 
            onClick={reset}
            style={{
              padding: '6px 12px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            <i className="fas fa-redo"></i> Réessayer
          </button>
        </div>
      )}
    </div>
  );
};

export default FileClientUpload;