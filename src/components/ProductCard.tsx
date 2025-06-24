import React from 'react';
import { useNavigate } from 'react-router-dom';
import caddie from '../assets/images/caddie.png';
import { Button } from 'react-bootstrap';
import { useCart } from '../hooks/useSoppingCart';

type ProductCardProps = {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  description: string;
  modelUrl: string;
};

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  price,
  imageUrl,
  description,
  modelUrl,
}) => {

    const { addToCart } = useCart();
    const navigate = useNavigate();

    const goToProductPage = () => {
    navigate(`/produits/ProductDetails/${id}`, {
        state: { id, name, price, imageUrl, description, modelUrl }
    });
    };


    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation();
        addToCart({ id, name, price, quantity: 1, imageUrl });
    };


    return (
        <div
        onClick={goToProductPage}
        className="product-card"
        style={{
            background: '#f7f7f7',
            color: 'black',
            padding: '20px',
            cursor: 'pointer',
            transition: 'transform 0.2s ease-in-out',
        }}
        >

        <img
            src={imageUrl}
            alt={name}
            style={{
                width: '100%',
                height: '200px',
                objectFit: 'cover',
                marginBottom: '12px',
            }}
        />


        <div
            style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                alignItems: 'center',
                marginBottom: '-10px',
            }}
        >
            <h5 style={{ margin: 0 }}>{name}</h5>
            <Button
                variant="primary"
                onClick={handleAddToCart}
                style={{ padding: '6px 10px' }}
            >
                <img src={caddie} alt="Caddie" style={{ width: 20, height: 20 }} />
            </Button>
        </div>

        <p style={{ margin: 0, color: '#333' }}>{price} €</p>
        </div>
    );
};

export default ProductCard;
