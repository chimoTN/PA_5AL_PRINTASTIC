import React, { useState } from 'react';

const GestionProduits: React.FC = () => {
  const [produits, setProduits] = useState([
    { id: 1, nom: 'Figurine Dragon', prix: 29.99, ventes: 52, categorie: 'Fantasy', popularite: 95, imageUrl: '' },
    { id: 2, nom: 'Figurine Chat', prix: 24.99, ventes: 78, categorie: 'Animaux', popularite: 87, imageUrl: '' },
    { id: 3, nom: 'Casque VR', prix: 99.99, ventes: 10, categorie: 'Technologie', popularite: 40, imageUrl: '' },
  ]);

  const [filtre, setFiltre] = useState('');
  const [recherche, setRecherche] = useState('');

  const [nouveauProduit, setNouveauProduit] = useState({
    nom: '',
    description: '',
    prix: '',
    categorie: '',
    popularite: '',
    ventes: '',
    fichier3D: null,
    image: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNouveauProduit(prev => ({ ...prev, [name]: value }));
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    setNouveauProduit(prev => ({ ...prev, fichier3D: file }));
  };

  const handleImageDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    setNouveauProduit(prev => ({ ...prev, image: file }));
  };

  const isFormValid = Object.values(nouveauProduit).every(val => val !== '' && val !== null);

  const handleAjouter = () => {
    if (!isFormValid) return alert("Tous les champs sont requis");

    const newProd = {
      id: produits.length + 1,
      nom: nouveauProduit.nom,
      prix: parseFloat(nouveauProduit.prix),
      ventes: parseInt(nouveauProduit.ventes || '0'),
      categorie: nouveauProduit.categorie,
      popularite: parseInt(nouveauProduit.popularite || '0'),
      imageUrl: URL.createObjectURL(nouveauProduit.image),
      fichier3dPath: `/3dmodels/${Date.now()}-${nouveauProduit.fichier3D.name}`
    };

    setProduits(prev => [...prev, newProd]);
    setNouveauProduit({ nom: '', description: '', prix: '', categorie: '', popularite: '', ventes: '', fichier3D: null, image: null });
  };

  const produitsFiltres = produits
    .filter(p => !filtre || p.nom.toLowerCase().includes(filtre.toLowerCase()))
    .filter(p => p.nom.toLowerCase().includes(recherche.toLowerCase()));

  const totalVentes = produits.reduce((sum, p) => sum + p.ventes, 0);
  const revenuTotal = produits.reduce((sum, p) => sum + (p.ventes * p.prix), 0);
  const produitTop = [...produits].sort((a, b) => b.ventes - a.ventes)[0];

  return (
    <div className="dashboard-page" style={{ padding: '20px', background: '#f0f4f8', minHeight: '100vh' }}>
      <h2 style={{ marginBottom: '20px' }}>📦 Gestion des produits</h2>

      {/* Filtres */}
      <div style={{ marginBottom: '10px' }}>
        <input
          type="text"
          placeholder="🔍 Rechercher un produit"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          style={{ padding: '8px', width: '300px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', overflow: 'hidden' }}>
        <thead style={{ background: '#ddd' }}>
          <tr>
            <th style={thStyle}>Nom<br /><input type="text" value={filtre} onChange={(e) => setFiltre(e.target.value)} style={filterInput} /></th>
            <th style={thStyle}>Prix (€)</th>
            <th style={thStyle}>Catégorie</th>
            <th style={thStyle}>Popularité</th>
            <th style={thStyle}>Ventes</th>
          </tr>
        </thead>
        <tbody>
          {produitsFiltres.map(p => (
            <tr key={p.id}>
              <td style={tdStyle}>{p.nom}</td>
              <td style={tdStyle}>{p.prix.toFixed(2)}</td>
              <td style={tdStyle}>{p.categorie}</td>
              <td style={tdStyle}>{p.popularite}</td>
              <td style={tdStyle}>{p.ventes}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Formulaire d'ajout */}
      <div style={{ marginTop: '30px', ...cardStyle }}>
        <h3>➕ Ajouter un produit</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          <input name="nom" value={nouveauProduit.nom} onChange={handleChange} placeholder="Nom" style={inputStyle} />
          <input name="description" value={nouveauProduit.description} onChange={handleChange} placeholder="Description" style={inputStyle} />
          <input name="prix" value={nouveauProduit.prix} onChange={handleChange} placeholder="Prix" type="number" style={inputStyle} />
          <input name="categorie" value={nouveauProduit.categorie} onChange={handleChange} placeholder="Catégorie" style={inputStyle} />
          <input name="popularite" value={nouveauProduit.popularite} onChange={handleChange} placeholder="Popularité" type="number" style={inputStyle} />
          <input name="ventes" value={nouveauProduit.ventes} onChange={handleChange} placeholder="Ventes" type="number" style={inputStyle} />

          {/* Zone drag-and-drop pour image */}
          <div
            onDrop={handleImageDrop}
            onDragOver={(e) => e.preventDefault()}
            style={{ border: '2px dashed #007bff', padding: '20px', borderRadius: '8px', textAlign: 'center', flex: '1 1 300px', background: '#f8faff' }}
          >
            {nouveauProduit.image ? `Image : ${nouveauProduit.image.name}` : 'Déposez une image ici'}
          </div>

          {/* Zone drag-and-drop pour fichier 3D */}
          <div
            onDrop={handleFileDrop}
            onDragOver={(e) => e.preventDefault()}
            style={{ border: '2px dashed #28a745', padding: '20px', borderRadius: '8px', textAlign: 'center', flex: '1 1 300px', background: '#f9fff9' }}
          >
            {nouveauProduit.fichier3D ? `Fichier 3D : ${nouveauProduit.fichier3D.name}` : 'Déposez un fichier 3D ici'}
          </div>

          <button
            onClick={handleAjouter}
            disabled={!isFormValid}
            style={{ padding: '10px 20px', background: isFormValid ? '#007bff' : '#aaa', color: '#fff', border: 'none', borderRadius: '4px' }}
          >
            Ajouter
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div style={{ marginTop: '30px', ...cardStyle }}>
        <h3>📊 Statistiques</h3>
        <p>Total ventes : {totalVentes}</p>
        <p>Revenu total estimé : {revenuTotal.toFixed(2)} €</p>
        <p>Top produit : {produitTop?.nom} ({produitTop?.ventes} ventes)</p>
      </div>
    </div>
  );
};

export default GestionProduits;

const thStyle: React.CSSProperties = {
  padding: '10px',
  textAlign: 'left'
};

const tdStyle: React.CSSProperties = {
  padding: '10px',
  borderBottom: '1px solid #eee'
};

const filterInput: React.CSSProperties = {
  width: '100%',
  padding: '4px',
  border: '1px solid #ccc',
  borderRadius: '4px'
};

const inputStyle: React.CSSProperties = {
  padding: '8px',
  borderRadius: '4px',
  border: '1px solid #ccc',
  flex: '1 1 200px'
};

const cardStyle: React.CSSProperties = {
  border: '1px solid #ccc',
  borderRadius: '8px',
  padding: '20px',
  background: '#fff',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
};
