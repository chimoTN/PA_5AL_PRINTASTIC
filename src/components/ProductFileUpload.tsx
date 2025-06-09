// src/components/ProductFileUpload.tsx
import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { filesService, FileUploadResponse } from '../services';
import { useMateriaux } from '../hooks/useMateriaux';
import { Material } from '../services/materials.service';
import '../assets/styles/FileUpload.css';

interface ProductFileUploadProps {
  onUploadSuccess?: (response: FileUploadResponse) => void;
  onUploadError?: (error: string) => void;
}

const ProductFileUpload: React.FC<ProductFileUploadProps> = ({ onUploadSuccess, onUploadError }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Champs spécifiques aux produits
  const [nomProduit, setNomProduit] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [licence, setLicence] = useState<string>('CC BY 4.0');
  const [tags, setTags] = useState<string>('');
  const [prix, setPrix] = useState<number>(0);
  const [estGratuit, setEstGratuit] = useState<boolean>(true);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

  // Hook pour récupérer les matériaux
  const { materiaux, loading: materialsLoading, error: materialsError } = useMateriaux();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedExtensions = ['stl', 'obj', 'ply', '3mf', 'amf'];
  const maxSize = 100 * 1024 * 1024; // 100 MB

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

    if (!nomProduit.trim()) {
      return { isValid: false, error: 'Le nom du produit est requis' };
    }

    if (!description.trim()) {
      return { isValid: false, error: 'La description est requise' };
    }

    if (!selectedMaterial) {
      return { isValid: false, error: 'Veuillez sélectionner un matériau' };
    }

    if (!estGratuit && prix <= 0) {
      return { isValid: false, error: 'Le prix doit être supérieur à 0 pour un produit payant' };
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
    
    // Auto-remplir le nom si pas déjà défini
    if (!nomProduit.trim()) {
      const fileName = file.name.split('.')[0];
      setNomProduit(fileName);
    }
  };

  const handleUpload = async () => {
    const formValidation = validateForm();
    if (!formValidation.isValid) {
      setUploadMessage({ type: 'error', text: formValidation.error! });
      return;
    }

    if (!selectedFile || !selectedMaterial) return;
    
    setIsUploading(true);
    setUploadMessage(null);
    
    try {
      const formData = new FormData();
      formData.append('file3d', selectedFile);
      formData.append('nom', nomProduit.trim());
      formData.append('description', description.trim());
      formData.append('licence', licence);
      formData.append('prix', (estGratuit ? 0 : prix).toString());
      formData.append('estGratuit', estGratuit.toString());
      formData.append('materiauId', selectedMaterial.id.toString());
      
      if (tags.trim()) {
        formData.append('tags', tags.trim());
      }
      
      // Upload de produit (pas modèle client)
      const response = await filesService.uploadProduct(formData);
      
      if (response.success) {
        setUploadMessage({ type: 'success', text: response.message || 'Produit créé avec succès!' });
        
        // Reset du formulaire
        setSelectedFile(null);
        setNomProduit('');
        setDescription('');
        setTags('');
        setPrix(0);
        setEstGratuit(true);
        setLicence('CC BY 4.0');
        setSelectedMaterial(null);
        
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        onUploadSuccess?.(response);
      } else {
        throw new Error(response.message || 'Erreur lors de l\'upload');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Erreur lors de l\'upload du produit';
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

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setUploadMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="file-upload-container product-upload">
      <h2>
        <i className="fas fa-box"></i>
        Ajouter un nouveau produit
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
            <h3>Glissez le fichier 3D du produit ici</h3>
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

      {/* Informations du produit */}
      {selectedFile && (
        <div className="product-information">
          <h3>Informations du produit</h3>
          
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="nom">Nom du produit *</label>
              <input
                id="nom"
                type="text"
                value={nomProduit}
                onChange={(e) => setNomProduit(e.target.value)}
                placeholder="Ex: Figurine Dragon, Vase moderne..."
                maxLength={100}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="licence">Licence</label>
              <select
                id="licence"
                value={licence}
                onChange={(e) => setLicence(e.target.value)}
              >
                <option value="CC BY 4.0">Creative Commons BY 4.0</option>
                <option value="CC BY-SA 4.0">Creative Commons BY-SA 4.0</option>
                <option value="CC BY-NC 4.0">Creative Commons BY-NC 4.0</option>
                <option value="CC BY-NC-SA 4.0">Creative Commons BY-NC-SA 4.0</option>
                <option value="Propriétaire">Licence propriétaire</option>
              </select>
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez votre produit, ses caractéristiques, conseils d'impression..."
              maxLength={1000}
              rows={4}
              required
            />
            <small>{description.length}/1000 caractères</small>
          </div>

          {/* Sélecteur de matériau */}
          <div className="form-field">
            <label htmlFor="materiau">Matériau recommandé *</label>
            {materialsLoading ? (
              <div className="material-loading">
                <i className="fas fa-spinner fa-spin"></i>
                Chargement des matériaux...
              </div>
            ) : materialsError ? (
              <div className="material-error">
                <i className="fas fa-exclamation-triangle"></i>
                {materialsError}
              </div>
            ) : materiaux.length === 0 ? (
              <div className="no-materials">
                Aucun matériau disponible
              </div>
            ) : (
              <>
                <select
                  id="materiau"
                  value={selectedMaterial?.id || ''}
                  onChange={(e) => {
                    const materialId = Number(e.target.value);
                    const material = materiaux.find(m => m.id === materialId);
                    setSelectedMaterial(material || null);
                  }}
                  required
                >
                  <option value="">Sélectionnez un matériau</option>
                  {materiaux.map((material) => (
                    <option key={material.id} value={material.id}>
                      {material.nom} - {material.couleur} ({formatPrice(material.prixParGramme)}/g)
                    </option>
                  ))}
                </select>
                
                {selectedMaterial && (
                  <div className="selected-material-info">
                    <p><strong>Couleur :</strong> {selectedMaterial.couleur}</p>
                    <p><strong>Prix :</strong> {formatPrice(selectedMaterial.prixParGramme)}/gramme</p>
                    {selectedMaterial.description && (
                      <p><strong>Description :</strong> {selectedMaterial.description}</p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="tags">Tags (optionnel)</label>
            <input
              id="tags"
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="figurine, décoration, utilitaire... (séparés par des virgules)"
              maxLength={200}
            />
            <small>Ajoutez des mots-clés pour faciliter la recherche</small>
          </div>

          <div className="pricing-section">
            <div className="form-field checkbox-field">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={estGratuit}
                  onChange={(e) => setEstGratuit(e.target.checked)}
                />
                <span className="checkmark"></span>
                Produit gratuit
              </label>
            </div>

            {!estGratuit && (
              <div className="form-field price-field">
                <label htmlFor="prix">Prix (€)</label>
                <input
                  id="prix"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={prix}
                  onChange={(e) => setPrix(Number(e.target.value))}
                  placeholder="0.00"
                />
                <small>Prix de téléchargement du modèle 3D</small>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bouton d'upload */}
      {selectedFile && (
        <button
          className="upload-button product-button"
          onClick={handleUpload}
          disabled={isUploading || !nomProduit.trim() || !description.trim() || !selectedMaterial}
        >
          {isUploading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i>
              Création en cours...
            </>
          ) : (
            <>
              <i className="fas fa-plus"></i>
              Créer le produit
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

export default ProductFileUpload;