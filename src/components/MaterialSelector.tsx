// src/components/MaterialSelector.tsx
import React from 'react';
import { Material } from '../services/materials.service';
import useMaterials from '../hooks/useMateriaux';

interface MaterialSelectorProps {
  selectedMaterialId: number | null;
  onMaterialSelect: (material: Material) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  showPrice?: boolean;
  showDescription?: boolean;
}

const MaterialSelector: React.FC<MaterialSelectorProps> = ({
  selectedMaterialId,
  onMaterialSelect,
  label = "Matériau",
  placeholder = "Sélectionnez un matériau",
  required = false,
  disabled = false,
  showPrice = false,
  showDescription = false
}) => {
  const { materials, loading, error, formatPrice } = useMaterials();

  const selectedMaterial = materials.find(m => m.id === selectedMaterialId);

  if (loading) {
    return (
      <div className="material-selector-container">
        <label className="material-selector-label">
          {label} {required && <span className="required">*</span>} :
        </label>
        <div style={{
          padding: '12px',
          border: '2px solid #e1e8ed',
          borderRadius: '6px',
          backgroundColor: '#f8f9fa',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#6c757d'
        }}>
          <i className="fas fa-spinner fa-spin"></i>
          Chargement des matériaux...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="material-selector-container">
        <label className="material-selector-label">
          {label} {required && <span className="required">*</span>} :
        </label>
        <div style={{
          padding: '12px',
          border: '2px solid #dc3545',
          borderRadius: '6px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <i className="fas fa-exclamation-triangle"></i>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="material-selector-container">
      <label 
        htmlFor="material-select"
        style={{
          display: 'block',
          marginBottom: '8px',
          fontWeight: '500',
          color: '#2c3e50'
        }}
      >
        <i className="fas fa-layer-group" style={{ marginRight: '8px', color: '#3498db' }}></i>
        {label} {required && <span style={{ color: '#e74c3c' }}>*</span>} :
      </label>
      
      <select
        id="material-select"
        value={selectedMaterialId || ''}
        onChange={(e) => {
          const materialId = Number(e.target.value);
          const material = materials.find(m => m.id === materialId);
          if (material) {
            onMaterialSelect(material);
          }
        }}
        disabled={disabled}
        required={required}
        style={{
          width: '100%',
          padding: '12px',
          border: '2px solid #e1e8ed',
          borderRadius: '6px',
          fontSize: '14px',
          backgroundColor: disabled ? '#f8f9fa' : 'white',
          cursor: disabled ? 'not-allowed' : 'pointer'
        }}
      >
        <option value="">{placeholder}</option>
        {materials.map((material) => (
          <option key={material.id} value={material.id}>
            {material.nom}
            {showPrice && ` - ${formatPrice(material.coutParGramme)}/g`}
            {!material.estDisponible && ' (Indisponible)'}
          </option>
        ))}
      </select>
      
      {/* Informations détaillées du matériau sélectionné */}
      {selectedMaterial && (
        <div style={{
          marginTop: '15px',
          padding: '15px',
          border: '1px solid #e1e8ed',
          borderRadius: '8px',
          backgroundColor: '#f8f9fa'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '10px'
          }}>
            <h4 style={{
              margin: '0',
              color: '#2c3e50',
              fontSize: '16px'
            }}>
              {selectedMaterial.nom}
            </h4>
            <span style={{
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '500',
              backgroundColor: selectedMaterial.estDisponible ? '#d4edda' : '#f8d7da',
              color: selectedMaterial.estDisponible ? '#155724' : '#721c24'
            }}>
              <i className={`fas ${selectedMaterial.estDisponible ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
              {selectedMaterial.estDisponible ? 'Disponible' : 'Indisponible'}
            </span>
          </div>
          
          {showDescription && selectedMaterial.description && (
            <div style={{ marginBottom: '12px' }}>
              <p style={{
                margin: '0',
                color: '#6c757d',
                fontSize: '14px',
                lineHeight: '1.4'
              }}>
                {selectedMaterial.description}
              </p>
            </div>
          )}
          
          {showPrice && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{
                fontSize: '14px',
                color: '#6c757d'
              }}>
                Prix du matériau :
              </span>
              <span style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#28a745'
              }}>
                {formatPrice(selectedMaterial.coutParGramme)}/gramme
              </span>
            </div>
          )}
        </div>
      )}

      {/* Nombre de matériaux disponibles */}
      <div style={{
        marginTop: '8px',
        fontSize: '12px',
        color: '#6c757d',
        display: 'flex',
        alignItems: 'center',
        gap: '5px'
      }}>
        <i className="fas fa-info-circle"></i>
        {materials.length} matériau{materials.length > 1 ? 'x' : ''} disponible{materials.length > 1 ? 's' : ''}
      </div>
    </div>
  );
};

export default MaterialSelector;
