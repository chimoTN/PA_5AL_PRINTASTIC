// src/Pages/Accueil.tsx
import ProductCard from "./ProductCard";
import type { Produit } from "../types/Produit";
import { useEffect, useState } from "react";
import { produitService } from "../Services/produit.service";
import { Spinner } from 'react-bootstrap';

export const ProductList = () => {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduits = async () => {
      try {
        const data = await produitService.getAll();
        console.log('Fetched produits:', data); 
        setProduits(data);
      } catch (err) {
        console.error('Erreur de chargement des produits :', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduits();
  }, []);



  return (
    <div
      style={{
        minHeight: "100vh",
        paddingTop: "60px",
        paddingInline: "2rem",
        background: "rgba(10, 25, 47, 0.9)",
        backdropFilter: "blur(100px)",
        color: "white"
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "2rem" }}>Liste de Produits</h2>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "2rem",
        }}
      >
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', margin: '4rem' }}>
            <Spinner animation="border" variant="light" />
          </div>
        ) : produits && produits.length > 0 ? (
            produits.map((produit) => (
              <div key={produit.id} style={{ width: "250px" }}>
                <ProductCard
                  id={produit.id}
                  name={produit.nom}
                  price={produit.prix}
                  imageUrl={produit.imageUrl}
                  description={produit.description}
                  modelUrl={produit.modelUrl}
                />
              </div>
            ))
          ) : (
            <p style={{ color: "#ccc", fontSize: "1.2rem", textAlign: "center", marginTop: "3rem" }}>
              Aucun produit disponible pour le moment.
            </p>
          )}

      </div>
    </div>
  );
};