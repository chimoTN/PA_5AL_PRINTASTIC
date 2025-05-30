import React from 'react';
import { useParams } from 'react-router-dom';
import { Container, Button } from 'react-bootstrap';
import figurine from '../assets/images/produits/figurine.png';
import '../assets/styles/productDetail.css'
import { useCart } from '../hooks/useSoppingCart';
import caddie from '../assets/images/caddie.png';

const mockProduct = {
  id: '1',
  name: 'Dragon PLA',
  price: 14.99,
  description: `Cette figurine dragon est imprimée en PLA haute qualité.\nParfaite pour les amateurs de fantasy, jeux de rôle ou décoration.`,
  imageUrl: figurine,
};



const ProductDetails = () => {
  const { id } = useParams();
  const product = mockProduct;

  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: product.imageUrl,
    });
  };

  return (
    <Container style={{ paddingTop: '60px', minHeight: '100vh' }}>
      <div className="product-grid">
        {/* IMAGE à gauche */}
        <div className="product-image">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="img-fluid rounded shadow"
          />
        </div>

        {/* INFOS à droite */}
        <div className="product-info">
          <h1>{product.name}</h1>
          <h3 className="text-primary">{product.price.toFixed(2)} €</h3>
          <p style={{ whiteSpace: 'pre-line' }}>{product.description}</p>

          <Button
              variant="primary"
              onClick={handleAddToCart}
              style={{ padding: '6px 10px' }}
          >
            Ajouter au panier
            <img src={caddie} alt="Caddie" style={{ width: 20, height: 20 }} />
          </Button>

          <br />
          <Button variant="outline-secondary">Voir le modèle 3D</Button>
        </div>
      </div>
    </Container>
  );
};

export default ProductDetails;
