// src/Pages/Accueil.tsx
import ProductCard from "./ProductCard";
import figurine from '../assets/images/produits/figurine.png';

export const ProductList = () => {

  const products = [
      { id: '1', name: 'Dragon PLA', price: 14.99, imageUrl: figurine },
      { id: '2', name: 'Space Helmet', price: 24.99, imageUrl: figurine },
      { id: '3', name: 'Warrior Bust', price: 19.99, imageUrl: figurine },
      { id: '4', name: 'Alien Egg', price: 29.99, imageUrl: figurine },
  ];


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
        {products.map((prod) => (
          <div key={prod.id} style={{ width: "250px" }}>
            <ProductCard
              id={prod.id}
              name={prod.name}
              price={prod.price}
              imageUrl={prod.imageUrl}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
