// src/pages/CartPage.tsx
import { useCart } from '../hooks/useSoppingCart';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import poubelle from '../assets/images/poubelle.png'

const CartPage = () => {
  const { cart, removeFromCart, clearCart } = useCart();

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (

    <Card style={{ padding: "2em",  background: "aliceblue", width: "50%", marginLeft: "25%", marginTop: "70px"}}>
        <Container>
        <h2 className="mb-4">Votre panier</h2>

        {cart.length === 0 ? (
            <p>Le panier est vide.</p>
        ) : (
            <>
            {cart.map(item => (
                <><hr />
                    <Row key={item.id} className="align-items-center mb-3" style={{alignItems: "center", display: "flex"}}>
                        <Col xs={3}>
                            <img src={item.imageUrl} alt={item.name} className="img-fluid rounded" />
                        </Col>
                        <Col xs={5}>
                            <h5>{item.name}</h5>
                            <p>{item.price.toFixed(2)} € x {item.quantity}</p>
                        </Col>
                        <Col xs={4} className="text-end">
                            <Button variant="danger" onClick={() => removeFromCart(item.id)}>
                                <img src={poubelle} alt="remove" style={{ width: 20, height: 20 }} />
                            </Button>
                        </Col>
                    </Row>
                </>
            ))}

            <hr />
            <h4>Total : {total.toFixed(2)} €</h4>
            <Button variant="secondary" onClick={clearCart} className="mt-3">
                Vider le panier
            </Button>
            </>
        )}
        </Container>
    </Card>
  );
};

export default CartPage;
