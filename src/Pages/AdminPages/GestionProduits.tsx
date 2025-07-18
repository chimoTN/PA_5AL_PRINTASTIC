// GestionProduits.tsx
import React, { useEffect, useState } from 'react';
import { produitService } from '../../services/produit.service';
import '@/assets/styles/gestionProduits.css'

const GestionProduits: React.FC = () => {
  const [produits, setProduits] = useState<any[]>([]);
  const [filtre, setFiltre] = useState('');
  const [recherche, setRecherche] = useState('');

  const [nouveauProduit, setNouveauProduit] = useState<any>({
    nom: '',
    description: '',
    prix: '',
    categorie: '',
    popularite: '',
    image: null,
    fichier3D: null,
  });

  const fetchProduits = async () => {
    try {
      const data = await produitService.getAll();
      setProduits(data);
    } catch (error) {
      console.error('Erreur chargement produits:', error);
    }
  };

  useEffect(() => {
    fetchProduits();
  }, []);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setNouveauProduit((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleFileDrop = (e: any) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    setNouveauProduit((prev: any) => ({ ...prev, fichier3D: file }));
  };

  const handleImageDrop = (e: any) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    setNouveauProduit((prev: any) => ({ ...prev, image: file }));
  };

  const isFormValid = Object.entries(nouveauProduit).every(([k, v]) => (k === 'fichier3D' || k === 'image') ? true : v);

  const handleAjouter = async () => {
    
    if (!isFormValid) return alert('Tous les champs sont requis');

    const formData = new FormData();
    for (const key in nouveauProduit) {
      if (nouveauProduit[key]) {
        formData.append(key, nouveauProduit[key]);
      }
    }

    try {
      await produitService.create(formData);
      setNouveauProduit({ nom: '', description: '', prix: '', categorie: '', popularite: '', image: null, fichier3D: null });
      fetchProduits();
    } catch (err) {
      console.error('Erreur création produit :', err);
    }
  };

  const handleSupprimer = async (id: number) => {
    try {
      await produitService.delete(id);
      fetchProduits();
    } catch (error) {
      console.error('Erreur suppression :', error);
    }
  };

  
  const handleModifier = async (id: number) => {
    try {
      await produitService.update(id, {});
      fetchProduits();
    } catch (error) {
      console.error('Erreur suppression :', error);
    }
  };

  const produitsFiltres = produits
    .filter(p => !filtre || p.nom.toLowerCase().includes(filtre.toLowerCase()))
    .filter(p => p.nom.toLowerCase().includes(recherche.toLowerCase()));

  return (
    <div className="produits-container">
      <h2>Gestion des produits</h2>

      <table className="produits-table">
        <thead>
          <tr>
            <th>Nom<input value={filtre} onChange={(e) => setFiltre(e.target.value)} /></th>
            <th>Prix</th>
            <th>Catégorie</th>
            <th>Popularité</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {produitsFiltres.map(p => (
            <tr key={p.id}>
              <td>{p.nom}</td>
              <td>{p.prix} €</td>
              <td>{p.categorie}</td>
              <td>{p.popularite}</td>
              <td>
                <button onClick={() => handleSupprimer(p.id)}>Supprimer</button>
                <button onClick={() => handleModifier(p.id)}>Modifier</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="form-ajout">
        <h3>Ajouter un produit ou Modifier Un produits</h3>

        <input name="nom" placeholder="Nom" value={nouveauProduit.nom} onChange={handleChange} />
        <input name="description" placeholder="Description" value={nouveauProduit.description} onChange={handleChange} />
        <input name="prix" placeholder="Prix" type="number" value={nouveauProduit.prix} onChange={handleChange} />
        <input name="categorie" placeholder="Catégorie" value={nouveauProduit.categorie} onChange={handleChange} />
        <input name="popularite" placeholder="Popularité" type="number" value={nouveauProduit.popularite} onChange={handleChange} />

        <div className="dropzone" onDrop={handleImageDrop} onDragOver={e => e.preventDefault()}>
          {nouveauProduit.image ? `Image : ${nouveauProduit.image.name}` : 'Déposez une image ici'}
        </div>
        <div className="dropzone" onDrop={handleFileDrop} onDragOver={e => e.preventDefault()}>
          {nouveauProduit.fichier3D ? `Fichier 3D : ${nouveauProduit.fichier3D.name}` : 'Déposez un fichier 3D ici'}
        </div>

        <button disabled={!isFormValid} onClick={handleAjouter}>Ajouter</button>
      </div>
    </div>
  );
};

export default GestionProduits;
