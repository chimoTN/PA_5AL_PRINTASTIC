import { useCart } from '../hooks/useSoppingCart';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import poubelle from '../assets/images/poubelle.png';

const CartPage = () => {
  const { cart, removeFromCart, clearCart } = useCart();

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <Container style={{ paddingTop: "70px", minHeight: "100vh" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "2rem",
          flexWrap: "wrap",
        }}
      >
        {/* Carte PRODUITS */}
        <Card
          style={{
            width: "500px",
            padding: "2em",
            background: "aliceblue",
          }}
        >
          <h2 className="mb-4">Votre panier</h2>
          {cart.length === 0 ? (
            <p>Le panier est vide.</p>
          ) : (
            <>
                {cart.map(item => (
                    <><hr />
                        <Row key={item.id} className="align-items-center mb-3" style={{alignItems: "center", display: "flex"}}>
                            <Col xs={3}>
                                <img style={{maxWidth: "120px", "maxHeight": "120px"}} src={item.imageUrl} alt={item.name} className="img-fluid rounded" />
                            </Col>
                            <Col xs={5} style={{marginLeft: "60px"}}>
                                <h5>{item.name}</h5>
                                <p>{item.price.toFixed(2)} € x {item.quantity}</p>
                                <p> Retouner voir le produits</p>
                            </Col>
                            <Col xs={4} className="text-end" style={{marginLeft: "60px"}}>
                                <Button variant="danger" onClick={() => removeFromCart(item.id)}>
                                    <img src={poubelle} alt="remove" style={{ width: 20, height: 20 }} />
                                </Button>
                            </Col>
                        </Row>
                    </>
                ))}
              <hr />
              <Button variant="secondary" onClick={clearCart} className="mt-3">
                Vider le panier
              </Button>
            </>
          )}
        </Card>

        {/* Carte TOTAL */}
        <Card
          style={{
            width: "300px",
            padding: "2em",
            background: "aliceblue",
            height: "fit-content",
          }}
        >
          <h3>Prix total</h3>
          <p>{total.toFixed(2)} €</p>
          <Button variant="primary" className="mt-3">
            Passer commande
          </Button>
        </Card>
      </div>
    </Container>
  );
};

export default CartPage;
