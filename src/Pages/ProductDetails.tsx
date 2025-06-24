import React, { useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Container, Button } from 'react-bootstrap';
import '../assets/styles/productDetail.css';
import { useCart } from '../hooks/useSoppingCart';
import ModelViewerModal from '../components/ModelViewerModal';

const ProductDetails: React.FC = () => {

  const { id } = useParams();
  const location = useLocation();
  const product = location.state;

  if (!product) return <p>Produit non trouvé.</p>;

  const { name, price, description, imageUrl, modelUrl } = product;
  const { addToCart } = useCart();

  const [showModal, setShowModal] = useState(false);

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
    <>
      <Container style={{ paddingTop: '60px', minHeight: '100vh' }}>
        <div className="product-grid">
          {/* IMAGE à gauche */}
          <div className="product-image">
            <img
              src={imageUrl}
              alt={name}
              className="img-fluid rounded shadow"
            />
          </div>

          {/* INFOS à droite */}
          <div className="product-info">
            <h1>{name}</h1>
            <h3 className="text-primary">{price} €</h3>
            <p style={{ whiteSpace: 'pre-line' }}>{description}</p>

            <Button
              variant="primary"
              onClick={handleAddToCart}
            >
              Ajouter au panier
            </Button>


            <br />
          
            <Button
              variant="outline-secondary"
              onClick={() => setShowModal(true)}
            >
              Voir le modèle 3D
            </Button>

            <ModelViewerModal
              show={showModal}
              onHide={() => setShowModal(false)}
              modelUrl={modelUrl}
            />

          </div>
        </div>
      </Container>

      <Container style={{ paddingBottom: '60px' }}>
        <h4 className="mb-3 mt-5">Description produit</h4>
        <hr />

        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Matricule</th>
              <th>Nom</th>
              <th>Matériaux</th>
              <th>Taille</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>PRT-{id}</td>
              <td>{name}</td>
              <td>Résine PLA</td>
              <td>8 cm x 5 cm</td>
            </tr>
          </tbody>
        </table>

        <p className="mt-4">
          Ceci est une description factice en attendant les données réelles en base.
          Ce produit est idéal pour les collectionneurs de figurines imprimées en 3D
          avec une finition de haute qualité.
        </p>
      </Container>

    </>
  );
};

export default ProductDetails;
