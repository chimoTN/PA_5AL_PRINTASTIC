// src/pages/ProductDetails.tsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import figurine from '../assets/images/produits/figurine.png';

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

  return (
    <Container style={{ paddingTop: '60px', minHeight: '100vh' }}>
      <Row className="align-items-start">
        {/* IMAGE à gauche */}
        <Col xs={12} md={6}>
          <img
            src={product.imageUrl}
            alt={product.name}
            className="img-fluid rounded shadow"
            style={{ maxHeight: 500, objectFit: 'cover', width: '50%' }}
          />
        </Col>

        {/* INFO à droite */}
        <Col xs={12} md={6}>
          <div className="d-flex flex-column h-100 justify-content-start p-3">
            <h1 style={{ fontSize: '3rem', fontWeight: 'bold' }}>
              {product.name}
            </h1>
            <h3 className="text-primary mb-3">
              {product.price.toFixed(2)} €
            </h3>
            <p style={{ fontSize: '1.1rem', whiteSpace: 'pre-line' }}>
              {product.description}
            </p>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ProductDetails;
