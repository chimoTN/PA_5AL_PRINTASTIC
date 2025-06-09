// frontend/src/components/MaterialSelector.tsx
import React from 'react';
import { useMateriaux } from '../hooks/useMateriaux';
import { Material } from '../services/materials.service';

interface MaterialSelectorProps {
  selectedMaterialId?: number;
  onMaterialSelect: (material: Material) => void;
  disabled?: boolean;
}

const MaterialSelector: React.FC<MaterialSelectorProps> = ({
  selectedMaterialId,
  onMaterialSelect,
  disabled = false
}) => {
  const { materiaux, loading, error } = useMateriaux();

  if (loading) {
    return (
      <div className="material-selector">
        <label>Matériau :</label>
        <div className="loading">
          <i className="fas fa-spinner fa-spin"></i>
          Chargement des matériaux...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="material-selector">
        <label>Matériau :</label>
        <div className="error">
          <i className="fas fa-exclamation-triangle"></i>
          {error}
        </div>
      </div>
    );
  }

  if (materiaux.length === 0) {
    return (
      <div className="material-selector">
        <label>Matériau :</label>
        <div className="no-materials">
          Aucun matériau disponible
        </div>
      </div>
    );
  }

  return (
    <div className="material-selector">
      <label htmlFor="material-select">Matériau * :</label>
      <select
        id="material-select"
        value={selectedMaterialId || ''}
        onChange={(e) => {
          const materialId = Number(e.target.value);
          const material = materiaux.find(m => m.id === materialId);
          if (material) {
            onMaterialSelect(material);
          }
        }}
        disabled={disabled}
        required
      >
        <option value="">Sélectionnez un matériau</option>
        {materiaux.map((material) => (
          <option key={material.id} value={material.id}>
            {material.nom} - {material.couleur} 
            ({materialsService.formatPrice(material.prixParGramme)}/g)
          </option>
        ))}
      </select>
      
      {selectedMaterialId && (
        <div className="material-info">
          {(() => {
            const selectedMaterial = materiaux.find(m => m.id === selectedMaterialId);
            return selectedMaterial ? (
              <div className="selected-material-details">
                <p><strong>Couleur :</strong> {selectedMaterial.couleur}</p>
                <p><strong>Prix :</strong> {materialsService.formatPrice(selectedMaterial.prixParGramme)}/gramme</p>
                {selectedMaterial.description && (
                  <p><strong>Description :</strong> {selectedMaterial.description}</p>
                )}
              </div>
            ) : null;
          })()}
        </div>
      )}
    </div>
  );
};

export default MaterialSelector;