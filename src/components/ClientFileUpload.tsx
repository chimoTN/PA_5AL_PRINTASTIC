// src/components/ClientFileUpload.tsx
import React, { useState, useRef, DragEvent, ChangeEvent, useEffect } from 'react';
import { filesService, materialsService, FileUploadResponse, Material } from '../services';
import '../assets/styles/FileUpload.css';

interface ClientFileUploadProps {
  onUploadSuccess?: (response: FileUploadResponse) => void;
  onUploadError?: (error: string) => void;
}

const ClientFileUpload: React.FC<ClientFileUploadProps> = ({ onUploadSuccess, onUploadError }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState<number | null>(null);
  const [taille, setTaille] = useState<number>(100);
  const [description, setDescription] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Formats de fichiers 3D acceptés
  const allowedExtensions = ['stl', 'obj', 'ply', '3mf', 'amf'];
  const maxSize = 100 * 1024 * 1024; // 100 MB

  // Charger les matériaux disponibles
  useEffect(() => {
    const loadMaterials = async () => {
      try {
        const response = await materialsService.getAvailableMaterials();
        if (response.success && response.data) {
          setMaterials(response.data);
          // Sélectionner le premier matériau par défaut
          if (response.data.length > 0) {
            setSelectedMaterialId(response.data[0].id);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des matériaux:', error);
      }
    };

    loadMaterials();
  }, []);

  const validateFile = (file: File): { isValid: boolean; error?: string } => {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      return {
        isValid: false,
        error: `Format non autorisé. Formats acceptés: ${allowedExtensions.join(', ').toUpperCase()}`
      };
    }
    
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'Le fichier est trop volumineux. Taille maximale: 100 MB'
      };
    }
    
    return { isValid: true };
  };

  const validateForm = (): { isValid: boolean; error?: string } => {
    if (!selectedFile) {
      return { isValid: false, error: 'Veuillez sélectionner un fichier' };
    }

    if (!selectedMaterialId) {
      return { isValid: false, error: 'Veuillez sélectionner un matériau' };
    }

    if (taille < 10 || taille > 1000) {
      return { isValid: false, error: 'La taille doit être entre 10% et 1000%' };
    }

    return { isValid: true };
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileSelection = (file: File) => {
    const validation = validateFile(file);
    
    if (!validation.isValid) {
      setUploadMessage({ type: 'error', text: validation.error! });
      setSelectedFile(null);
      return;
    }
    
    setSelectedFile(file);
    setUploadMessage(null);
  };

  const handleUpload = async () => {
    const formValidation = validateForm();
    if (!formValidation.isValid) {
      setUploadMessage({ type: 'error', text: formValidation.error! });
      return;
    }

    if (!selectedFile || !selectedMaterialId) return;
    
    setIsUploading(true);
    setUploadMessage(null);
    
    try {
      const formData = new FormData();
      formData.append('file3d', selectedFile);
      formData.append('materiauId', selectedMaterialId.toString());
      formData.append('taille', taille.toString());
      if (description.trim()) {
        formData.append('description', description.trim());
      }
      
      // Upload de modèle client (pas produit)
      const response = await filesService.uploadClientModel(formData);
      
      if (response.success) {
        setUploadMessage({ type: 'success', text: response.message || 'Modèle 3D uploadé avec succès!' });
        
        // Reset du formulaire
        setSelectedFile(null);
        setTaille(100);
        setDescription('');
        if (materials.length > 0) {
          setSelectedMaterialId(materials[0].id);
        }
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        // Callback de succès
        onUploadSuccess?.(response);
      } else {
        throw new Error(response.message || 'Erreur lors de l\'upload');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Erreur lors de l\'upload du fichier';
      setUploadMessage({ type: 'error', text: errorMessage });
      onUploadError?.(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setUploadMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const selectedMaterial = materials.find(m => m.id === selectedMaterialId);

  return (
    <div className="file-upload-container client-upload">
      <h2>
        <i className="fas fa-upload"></i>
        Upload de votre modèle 3D
      </h2>
      
      {/* Zone de drop pour le fichier */}
      <div
        className={`file-drop-zone ${isDragging ? 'dragging' : ''} ${selectedFile ? 'has-file' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".stl,.obj,.ply,.3mf,.amf"
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
        />
        
        {!selectedFile ? (
          <>
            <i className="fas fa-cloud-upload-alt"></i>
            <h3>Glissez votre fichier 3D ici</h3>
            <p>ou cliquez pour sélectionner</p>
            <small>Formats acceptés: {allowedExtensions.join(', ').toUpperCase()} - Taille max: 100 MB</small>
          </>
        ) : (
          <div className="selected-file">
            <div className="file-info">
              <i className="fas fa-cube"></i>
              <div>
                <h4>{selectedFile.name}</h4>
                <p>{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>
            <button
              type="button"
              className="clear-file-button"
              onClick={(e) => {
                e.stopPropagation();
                clearSelection();
              }}
              title="Supprimer la sélection"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        )}
      </div>

      {/* Configuration d'impression */}
      {selectedFile && (
        <div className="upload-configuration">
          <h3>Configuration d'impression</h3>
          
          <div className="config-row">
            <div className="config-field">
              <label htmlFor="material">Matériau *</label>
              <select
                id="material"
                value={selectedMaterialId || ''}
                onChange={(e) => setSelectedMaterialId(Number(e.target.value))}
                required
              >
                <option value="">Sélectionner un matériau</option>
                {materials.map(material => (
                  <option key={material.id} value={material.id}>
                    {material.nom} - {material.couleur} ({material.prixParGramme}€/g)
                  </option>
                ))}
              </select>
              {selectedMaterial && (
                <small className="material-info">
                  <i className="fas fa-info-circle"></i>
                  {selectedMaterial.description}
                </small>
              )}
            </div>

            <div className="config-field">
              <label htmlFor="taille">
                Taille d'impression: {taille}%
              </label>
              <input
                id="taille"
                type="range"
                min="10"
                max="1000"
                step="5"
                value={taille}
                onChange={(e) => setTaille(Number(e.target.value))}
              />
              <div className="range-labels">
                <span>10%</span>
                <span>100%</span>
                <span>1000%</span>
              </div>
            </div>
          </div>

          <div className="config-field">
            <label htmlFor="description">Description (optionnel)</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ajoutez des informations sur votre modèle ou des instructions spéciales..."
              maxLength={500}
              rows={3}
            />
            <small>{description.length}/500 caractères</small>
          </div>
        </div>
      )}

      {/* Bouton d'upload */}
      {selectedFile && (
        <button
          className="upload-button"
          onClick={handleUpload}
          disabled={isUploading || !selectedMaterialId}
        >
          {isUploading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i>
              Upload en cours...
            </>
          ) : (
            <>
              <i className="fas fa-print"></i>
              Envoyer pour impression
            </>
          )}
        </button>
      )}

      {/* Message de statut */}
      {uploadMessage && (
        <div className={`upload-message ${uploadMessage.type}`}>
          <i className={`fas ${uploadMessage.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
          {uploadMessage.text}
        </div>
      )}
    </div>
  );
};

export default ClientFileUpload;