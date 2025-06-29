import { useCart } from '../hooks/useSoppingCart';
import { Container, Row, Col, Button, Card, Form } from 'react-bootstrap';
import poubelle from '../assets/images/poubelle.png';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

const CartPage = () => {

  const [isDisabled, setIsDisabled] = useState(true);

  const { cart, removeFromCart, clearCart, updateQuantity } = useCart();
  const navigate = useNavigate();

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  useEffect(() => {
    setIsDisabled(cart.length === 0);
  }, [cart]);

  return (
    <Container style={{ paddingTop: '70px', minHeight: '100vh' }}>
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>

        {/* Carte PRODUITS */}
        <Card style={{ width: '800px', padding: '2em', background: 'aliceblue',border: 'none', }}>
          <h2 className="mb-4">Votre panier</h2>
          {cart.length === 0 ? (
            <p>Le panier est vide.</p>
          ) : (
            <>
              {cart.map((item) => (
                <div key={item.id} style={{ borderBottom: '1px solid #ccc', paddingBottom: '1rem', marginBottom: '1rem' }}>
                  <Row className="align-items-center">
                    <Col xs={3}>
                      <img
                        style={{ maxWidth: '120px', maxHeight: '120px' }}
                        src={item.imageUrl}
                        alt={item.name}
                        className="img-fluid rounded"
                      />
                    </Col>
                    <Col xs={6}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        {item.name}
                        <strong style={{ color: 'red', fontSize: '1.1rem' }}>{item.price} €</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start',fontSize: '0.5rem' }}>
                        <h5
                          style={{ marginTop:'25px',cursor: 'pointer', textDecoration: 'underline' }}
                          onClick={() => navigate(`/produits/ProductDetails/${item.id}`)}
                        >
                          Voir les détail du produit
                        </h5>
                      </div>
                      
                      <div style={{ marginTop: '0.5rem' }}>
                        <Form.Select
                          style={{ width: '100px' }}
                          value={item.quantity}
                          onChange={(e) => {
                            const newQuantity = parseInt(e.target.value);
                            updateQuantity(item.id, newQuantity);
                          }}
                        >

                          {[...Array(10).keys()].map((n) => (
                            <option key={n + 1} value={n + 1}>
                              {n + 1}
                            </option>
                          ))}
                        </Form.Select>
                      </div>
                    </Col>
                    <Col xs={3} className="text-end">
                      <Button variant="danger" onClick={() => removeFromCart(item.id)}>
                        <img src={poubelle} alt="remove" style={{ width: 20, height: 20 }} />
                      </Button>
                    </Col>
                  </Row>
                </div>
              ))}
              <Button variant="secondary" onClick={clearCart} className="mt-3">
                Vider le panier
              </Button>
            </>
          )}
        </Card>

        {/* Carte TOTAL */}
        <Card
          style={{
            width: '400px',
            padding: '2em',
            background: 'aliceblue',
            height: 'fit-content',
            border: 'none',
          }}
        >
          <h3>Prix total</h3>
          <p style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{total.toFixed(2)} €</p>
          <Button 
            variant="primary" 
            className="mt-3"
            onClick={() => navigate(`/validation/panier`)}
            disabled={isDisabled}
          >
            Passer commande
          </Button>
        </Card>
      </div>
    </Container>
  );
};

export default CartPage;
