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
  onlyAvailable?: boolean;
}

const MaterialSelector: React.FC<MaterialSelectorProps> = ({
  selectedMaterialId,
  onMaterialSelect,
  label = "Matériau",
  placeholder = "Sélectionnez un matériau",
  required = false,
  disabled = false,
  showPrice = false,
  showDescription = false,
  onlyAvailable = true
}) => {
  const { 
    materials, 
    loading, 
    error, 
    formatPrice,
    getPrixParGramme,
    getDensite,
    getAvailableMaterials
  } = useMaterials();

  // ✅ Matériaux à afficher selon le paramètre onlyAvailable
  const displayMaterials = onlyAvailable ? getAvailableMaterials() : materials;
  
  const selectedMaterial = materials.find(m => m.id === selectedMaterialId);

  // ✅ Fonction pour obtenir le badge de difficulté
  const getDifficultyBadge = (difficulty: string) => {
    const badges = {
      'facile': { bg: '#d4edda', color: '#155724', icon: 'fa-smile' },
      'moyen': { bg: '#fff3cd', color: '#856404', icon: 'fa-meh' },
      'difficile': { bg: '#f8d7da', color: '#721c24', icon: 'fa-frown' }
    };
    
    return badges[difficulty as keyof typeof badges] || badges.moyen;
  };

  // ✅ Fonction pour obtenir l'icône du type de matériau
  const getTypeIcon = (type: string) => {
    const icons = {
      'PLA': 'fa-leaf',
      'ABS': 'fa-cogs',
      'PETG': 'fa-shield-alt',
      'TPU': 'fa-compress-arrows-alt',
      'WOOD': 'fa-tree',
      'CARBON': 'fa-atom',
      'METAL': 'fa-bolt',
      'RESIN': 'fa-flask'
    };
    
    return icons[type as keyof typeof icons] || 'fa-cube';
  };

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
        {displayMaterials.map((material) => (
          <option 
            key={material.id} 
            value={material.id}
            disabled={!material.estDisponible}
          >
            <i className={`fas ${getTypeIcon(material.type)}`}></i>
            {material.nom} ({material.type})
            {material.couleur && ` - ${material.couleur}`}
            {showPrice && ` - ${formatPrice(getPrixParGramme(material))}/g`}
            {!material.estDisponible && ' (Indisponible)'}
          </option>
        ))}
      </select>
      
      {/* ✅ INFORMATIONS DÉTAILLÉES DU MATÉRIAU SÉLECTIONNÉ */}
      {selectedMaterial && (
        <div style={{
          marginTop: '15px',
          padding: '15px',
          border: '1px solid #e1e8ed',
          borderRadius: '8px',
          backgroundColor: '#f8f9fa'
        }}>
          {/* En-tête avec nom et statut */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '12px'
          }}>
            <h4 style={{
              margin: '0',
              color: '#2c3e50',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <i className={`fas ${getTypeIcon(selectedMaterial.type)}`} style={{ color: '#3498db' }}></i>
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

          {/* ✅ BADGES TYPE, COULEUR ET DIFFICULTÉ */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '12px',
            flexWrap: 'wrap'
          }}>
            <span style={{
              backgroundColor: '#007bff',
              color: 'white',
              padding: '4px 10px',
              borderRadius: '15px',
              fontSize: '11px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <i className={`fas ${getTypeIcon(selectedMaterial.type)}`}></i>
              {selectedMaterial.type}
            </span>
            
            {selectedMaterial.couleur && (
              <span style={{
                backgroundColor: '#6c757d',
                color: 'white',
                padding: '4px 10px',
                borderRadius: '15px',
                fontSize: '11px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <i className="fas fa-palette"></i>
                {selectedMaterial.couleur}
              </span>
            )}

            {selectedMaterial.difficulteImpression && (
              <span style={{
                padding: '4px 10px',
                borderRadius: '15px',
                fontSize: '11px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                ...getDifficultyBadge(selectedMaterial.difficulteImpression)
              }}>
                <i className={`fas ${getDifficultyBadge(selectedMaterial.difficulteImpression).icon}`}></i>
                {selectedMaterial.difficulteImpression}
              </span>
            )}
          </div>
          
          {/* ✅ DESCRIPTION */}
          {showDescription && selectedMaterial.description && (
            <div style={{ marginBottom: '12px' }}>
              <p style={{
                margin: '0',
                color: '#6c757d',
                fontSize: '14px',
                lineHeight: '1.4',
                fontStyle: 'italic'
              }}>
                <i className="fas fa-quote-left" style={{ marginRight: '6px' }}></i>
                {selectedMaterial.description}
              </p>
            </div>
          )}

          {/* ✅ INFORMATIONS TECHNIQUES */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '8px',
            marginBottom: '12px',
            fontSize: '13px'
          }}>
            <div style={{ color: '#6c757d', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <i className="fas fa-weight-hanging" style={{ color: '#17a2b8' }}></i>
              <strong>Densité:</strong> {getDensite(selectedMaterial)} g/cm³
            </div>
            
            <div style={{ color: '#6c757d', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <i className="fas fa-fill-drip" style={{ color: '#ffc107' }}></i>
              <strong>Remplissage:</strong> {selectedMaterial.tauxRemplissageRecommande || selectedMaterial.facteurRemplissageDefaut}%
            </div>
            
            <div style={{ color: '#6c757d', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <i className="fas fa-thermometer-half" style={{ color: '#dc3545' }}></i>
              <strong>Temp. buse:</strong> {selectedMaterial.temperatureImpression}°C
            </div>
            
            <div style={{ color: '#6c757d', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <i className="fas fa-bed" style={{ color: '#28a745' }}></i>
              <strong>Temp. plateau:</strong> {selectedMaterial.temperatureLit ? `${selectedMaterial.temperatureLit}°C` : 'Non requis'}
            </div>
            
            <div style={{ color: '#6c757d', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <i className="fas fa-hands-helping" style={{ color: '#6f42c1' }}></i>
              <strong>Supports:</strong> {selectedMaterial.necessiteSupports ? 'Requis' : 'Non requis'}
            </div>
            
            <div style={{ color: '#6c757d', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <i className="fas fa-chart-line" style={{ color: '#fd7e14' }}></i>
              <strong>Perte matériau:</strong> {selectedMaterial.perteMateriau}
            </div>
          </div>
          
          {/* ✅ PRIX */}
          {showPrice && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid #e1e8ed',
              paddingTop: '12px',
              marginTop: '12px'
            }}>
              <span style={{
                fontSize: '14px',
                color: '#6c757d',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <i className="fas fa-euro-sign" style={{ color: '#28a745' }}></i>
                Prix du matériau :
              </span>
              <span style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#28a745',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <i className="fas fa-tag"></i>
                {formatPrice(getPrixParGramme(selectedMaterial))}/gramme
              </span>
            </div>
          )}

          {/* ✅ NOTES */}
          {selectedMaterial.notes && (
            <div style={{
              marginTop: '12px',
              padding: '10px',
              backgroundColor: '#fff3cd',
              border: '1px solid #ffeaa7',
              borderRadius: '6px',
              borderLeft: '4px solid #f39c12'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px'
              }}>
                <i className="fas fa-sticky-note" style={{ color: '#f39c12', marginTop: '2px' }}></i>
                <div>
                  <strong style={{ color: '#856404', fontSize: '12px' }}>NOTES :</strong>
                  <p style={{
                    margin: '4px 0 0 0',
                    fontSize: '13px',
                    color: '#856404',
                    lineHeight: '1.4'
                  }}>
                    {selectedMaterial.notes}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ✅ STATISTIQUES EN BAS */}
      <div style={{
        marginTop: '10px',
        fontSize: '12px',
        color: '#6c757d',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <i className="fas fa-info-circle" style={{ color: '#17a2b8' }}></i>
          <span>
            <strong>{materials.filter(m => m.estDisponible).length}</strong> disponible{materials.filter(m => m.estDisponible).length > 1 ? 's' : ''}
          </span>
          {materials.filter(m => !m.estDisponible).length > 0 && (
            <span>
              • <strong>{materials.filter(m => !m.estDisponible).length}</strong> indisponible{materials.filter(m => !m.estDisponible).length > 1 ? 's' : ''}
            </span>
          )}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <i className="fas fa-layer-group" style={{ color: '#6c757d' }}></i>
          <span>Total : <strong>{materials.length}</strong> matériau{materials.length > 1 ? 'x' : ''}</span>
        </div>
      </div>
    </div>
  );
};

export default MaterialSelector;
