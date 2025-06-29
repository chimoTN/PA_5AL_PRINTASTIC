// ✅ CheckoutPage.tsx – version propre avec appel au service central
import { useCart } from '../hooks/useSoppingCart';
import { useEffect, useState } from 'react';
import { Button, Container, Row, Col, Form, Alert, Card } from 'react-bootstrap';
import { useStripe, useElements, Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { CardNumberElement, CardExpiryElement, CardCvcElement } from "@stripe/react-stripe-js";
import { paiementService } from '../services/paiementService';

const stripePromise = loadStripe('pk_test_51RbQFLIPwrA3cz1VnsMIcmzz0oxAzJ78wR0Qh18WLVdfXDTTNeYaFS87PFVSRyo8lTvyxgs0vOyqQuWzgdRdehhS00W1CoJzoq');

const CheckoutForm = () => {
  const { cart, clearCart } = useCart();
  const stripe = useStripe();
  const elements = useElements();
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const [address, setAddress] = useState({ fullAddress: '', city: '', zip: '', country: 'France' });
  const [validationError, setValidationError] = useState('');
  const [isCardComplete, setIsCardComplete] = useState(false);
  const [isAddressValid, setIsAddressValid] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const validateAddress = async () => {
    try {
      const data = await paiementService.verifierAdresse(`${address.fullAddress} ${address.city} ${address.zip}`);
      const match = data?.features?.[0];
      if (!match) throw new Error("Adresse invalide.");
      setAddress({
        ...address,
        fullAddress: match.properties.name,
        city: match.properties.city,
        zip: match.properties.postcode,
      });
      setIsAddressValid(true);
    } catch (e) {
      setValidationError('Adresse introuvable.');
      setIsAddressValid(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!stripe || !elements) return;
    if (!isAddressValid) return setValidationError("Adresse invalide.");
    const card = elements.getElement(CardNumberElement);
    if (!card) return setValidationError("Champ carte manquant.");

    try {
      const { clientSecret } = await paiementService.creerPaymentIntent(Math.round(total * 100));
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card,
          billing_details: {
            name: "Nom Client",
            email: "client@example.com",
            address: {
              line1: address.fullAddress,
              postal_code: address.zip,
              city: address.city,
              country: 'FR',
            },
          },
        },
      });

      if (result.error) {
        setValidationError(result.error.message || "Erreur de paiement.");
      } else {
        setPaymentSuccess(true);
        await paiementService.enregistrerPaiement({
          montant: total,
          produits: cart,
          adresse: address,
          stripePaymentId: result.paymentIntent?.id || '',
        });
        clearCart();
      }
    } catch (err: any) {
      setValidationError(err.message);
    }
  };

  if (paymentSuccess) {
    return (
      <Container className="mt-5 text-center">
        <h2>Paiement réussi !</h2>
        <p>Merci pour votre commande.</p>
      </Container>
    );
  }

  return (
    <Container style={{ paddingTop: '70px', paddingBottom: '50px' }}>
      <h2 className="mb-4">Livraison & Paiement</h2>
      <Row className="mb-4">
        <Col md={4}>
          <Card body>
            <h4>Panier</h4>
            {cart.map(item => (
              <div key={item.id}><strong>{item.name}</strong> - {item.quantity} x {item.price} €</div>
            ))}
            <hr />
            <strong>Total : {total.toFixed(2)} €</strong>
          </Card>
        </Col>

        <Col md={4}>
          <Card body>
            <h4>Adresse</h4>
            <Form>
              <Form.Group className="mb-2">
                <Form.Label>Adresse</Form.Label>
                <Form.Control type="text" value={address.fullAddress} onChange={(e) => setAddress({ ...address, fullAddress: e.target.value })} onBlur={validateAddress} />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Ville</Form.Label>
                <Form.Control type="text" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} onBlur={validateAddress} />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Code postal</Form.Label>
                <Form.Control type="text" value={address.zip} onChange={(e) => setAddress({ ...address, zip: e.target.value })} onBlur={validateAddress} />
              </Form.Group>
            </Form>
          </Card>
        </Col>

        <Col md={4}>
          <Card body>
            <h4>Paiement</h4>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Carte bancaire</Form.Label>
                <div style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '4px' }}>
                  <CardNumberElement onChange={e => setIsCardComplete(e.complete)} />
                </div>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Expiration</Form.Label>
                <div style={{ border: '1px solid #ccc', padding: '10px' }}>
                  <CardExpiryElement />
                </div>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>CVC</Form.Label>
                <div style={{ border: '1px solid #ccc', padding: '10px' }}>
                  <CardCvcElement />
                </div>
              </Form.Group>
              {validationError && <Alert variant="danger">{validationError}</Alert>}
              <Button type="submit" disabled={!isCardComplete || !isAddressValid}>Payer</Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

const CheckoutPage = () => (
  <Elements stripe={stripePromise}>
    <CheckoutForm />
  </Elements>
);

export default CheckoutPage;
