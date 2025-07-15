import React, { useState } from 'react';

interface Signalement {
  id: number;
  type: string;
  date: string;
  produit: string;
  reference: string;
  quantite: number;
  statut: string;
  imprimeurId: number | null;
}

interface Props {
  donnees: Signalement[];
}

const TableauSignalements: React.FC<Props> = ({ donnees }) => {
  const [triAsc, setTriAsc] = useState(true);
  const [colonneTriee, setColonneTriee] = useState<'date' | 'type' | null>(null);
  const [selectionId, setSelectionId] = useState<number | null>(null);

  const trier = (col: 'date' | 'type') => {
    setColonneTriee(col);
    setTriAsc(prev => (colonneTriee === col ? !prev : true));
  };

  const donneesTriees = [...donnees].sort((a, b) => {
    if (!colonneTriee) return 0;
    const valA = a[colonneTriee].toLowerCase();
    const valB = b[colonneTriee].toLowerCase();
    if (valA < valB) return triAsc ? -1 : 1;
    if (valA > valB) return triAsc ? 1 : -1;
    return 0;
  });

  return (
    <div style={{ background: '#fff', padding: '20px', borderRadius: '8px' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ background: '#f1f1f1' }}>
          <tr>
            <th style={thStyle}>ID</th>
            <th style={thStyle}>
              Type{' '}
              <button onClick={() => trier('type')} style={sortBtnStyle}>
                {colonneTriee === 'type' ? (triAsc ? '⬆️' : '⬇️') : '⇅'}
              </button>
            </th>
            <th style={thStyle}>
              Date{' '}
              <button onClick={() => trier('date')} style={sortBtnStyle}>
                {colonneTriee === 'date' ? (triAsc ? '⬆️' : '⬇️') : '⇅'}
              </button>
            </th>
            <th style={thStyle}>Produit</th>
          </tr>
        </thead>
        <tbody>
          {donneesTriees.map(sig => (
            <React.Fragment key={sig.id}>
              <tr
                style={{ cursor: 'pointer', background: selectionId === sig.id ? '#e6f7ff' : 'transparent' }}
                onClick={() => setSelectionId(selectionId === sig.id ? null : sig.id)}
              >
                <td style={tdStyle}>{sig.id}</td>
                <td style={tdStyle}>{sig.type}</td>
                <td style={tdStyle}>{sig.date}</td>
                <td style={tdStyle}>{sig.produit}</td>
              </tr>
              {selectionId === sig.id && (
                <tr>
                  <td colSpan={4} style={{ padding: 0 }}>
                    <div style={{ 
                        padding: '20px', 
                        background: '#fafafa', 
                        borderTop: '1px solid #ccc', 
                        animation: 'fadeIn 0.3s ease-in-out',
                        border: '1px solid rgb(204, 204, 204)',
                        borderBottomLeftRadius: '20px',
                        borderBottomRightRadius: '20px',
                         /*background: rgb(231 231 231);*/
                    }}>
                      <h4>🛠 Gestion du signalement #{sig.id}</h4>
                      <p><strong>Type :</strong> {sig.type}</p>
                      <p><strong>Date :</strong> {sig.date}</p>
                      <p><strong>Produit :</strong> {sig.produit}</p>
                      <button
                        onClick={() => setSelectionId(null)}
                        style={{ marginTop: '10px', padding: '8px 16px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px' }}
                      >
                        Fermer
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableauSignalements;

const thStyle: React.CSSProperties = {
  padding: '10px',
  textAlign: 'left'
};

const tdStyle: React.CSSProperties = {
  padding: '10px',
  borderBottom: '1px solid #eee'
};

const sortBtnStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  fontSize: '1em'
};