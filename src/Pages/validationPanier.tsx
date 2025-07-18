// ✅ CheckoutPage.tsx – version propre avec appel au service central
import { useCart } from '../hooks/useSoppingCart';
import { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Alert, Card } from 'react-bootstrap';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { CardNumberElement, CardExpiryElement, CardCvcElement } from "@stripe/react-stripe-js";
import { paiementService } from '../services/paiementService';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { REACT_APP_STRIPE_PUBLISHABLE_KEY } from '../config/env';

const stripePromise = loadStripe(REACT_APP_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = () => {

  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const [address, setAddress] = useState({ fullAddress: '', city: '', zip: '', country: 'France' });
  const [validationError, setValidationError] = useState('');
  const [isCardComplete, setIsCardComplete] = useState(false);
  const [isAddressValid, setIsAddressValid] = useState(false);
  const [cardNumberComplete, setCardNumberComplete] = useState(false);
  const [cardExpiryComplete, setCardExpiryComplete] = useState(false);
  const [cardCvcComplete, setCardCvcComplete] = useState(false);

  //const [paymentSuccess, setPaymentSuccess] = useState(false);

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
    
    console.log("ON EST DANS LE PAYLENT EUUUU")
    // 1. validation adresse + carte…

    // 2. créer et confirmer le PaymentIntent
    /*
    const { clientSecret } = await paiementService.creerPaymentIntent(Math.round(total * 100));  // :contentReference[oaicite:1]{index=1}
    const result = await stripe.confirmCardPayment(clientSecret, { /*…billing_details…*/ /*});
 /*
    if (result.error) {
      setValidationError(result.error.message || "Erreur de paiement.");
      return;
    }
 */
    // 3. en cas de succès, on prépare les données à envoyer au back
    //if (result.paymentIntent?.status === 'succeeded') {
   
    try {
      // Construire le payload attendu par le back
      const response = await paiementService.enregistrerPaiement({
        prenom: user?.prenom || 'chaima',                           // du contexte auth
        nom:   user?.nom || 'Ouertani',
        email: user?.email || 'mail@gmail.com' ,
        telephone: '01',            // à ajouter dans ton state adresse
        adresse: `${address.fullAddress}, ${address.city} ${address.zip}`,
        prixTotal: total,
        stripePaymentId: '1',
        produits: cart.map(item => ({
          id: item.id,
          nom: item.name,
          quantity: item.quantity,
          price: item.price
        })), 
        utilisateurId: user?.id || 5
      });  
      
       if (response.status === 201) {
        // Son
        const audio = new Audio('/succes_payment.wav');
        audio.play();

        toast.success('Commande validée ! Redirection dans un instant...', {
          duration: 3000,
          position: 'top-center'
        });

        clearCart();
        setTimeout(() => {
          navigate('/dashboard/client');
        }, 5000);
      }

      // 4. redirection vers la page de confirmation  
      //clearCart();
      //setPaymentSuccess(true);
    //}

    } catch (err) {
     toast.error('Une erreur est survenue lors du paiement.', {
        duration: 3000,
        position: 'top-center' 
      });
    };
  };

  useEffect(() => {
    if (cart.length === 0) {
      navigate('/');
    }
  }, []);

  useEffect(() => {
    setIsCardComplete(cardNumberComplete && cardExpiryComplete && cardCvcComplete);
  }, [cardNumberComplete, cardExpiryComplete, cardCvcComplete]);

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
                  <CardNumberElement
                    onChange={e => setCardNumberComplete(e.complete)}
                  />
                </div>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Expiration</Form.Label>
                <div style={{ border: '1px solid #ccc', padding: '10px' }}>
                  <CardExpiryElement
                    onChange={e => setCardExpiryComplete(e.complete)}
                  />
                </div>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>CVC</Form.Label>
                <div style={{ border: '1px solid #ccc', padding: '10px' }}>
                  <CardCvcElement
                    onChange={e => setCardCvcComplete(e.complete)}
                  />
                </div>
              </Form.Group>
              {validationError && <Alert variant="danger">{validationError}</Alert>}
              
              <button 
                type="submit"
                disabled={!isCardComplete || !isAddressValid}
                className="btn btn-primary w-100"
              >
                Payer
              </button>
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
