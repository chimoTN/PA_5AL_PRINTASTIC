// CommandeClient.tsx – Adaptation pour modèle 3D
import { useState, useEffect } from 'react';
import { Button, Container, Row, Col, Form, Alert, Card } from 'react-bootstrap';
import { useStripe, useElements, Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { CardNumberElement, CardExpiryElement, CardCvcElement } from "@stripe/react-stripe-js";
import { paiementService } from '../services/paiementService';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';
import { useNavigate, useLocation } from 'react-router-dom';

const stripePromise = loadStripe('pk_test_51RbQFLIPwrA3cz1VnsMIcmzz0oxAzJ78wR0Qh18WLVdfXDTTNeYaFS87PFVSRyo8lTvyxgs0vOyqQuWzgdRdehhS00W1CoJzoq');

interface Modele3D {
  id: number;
  nom: string;
  prix: number;
  description?: string;
  // autres propriétés selon votre modèle
}

const CommandeForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // 🎯 Récupérer les données du modèle 3D depuis la navigation
  const modele3D: Modele3D = location.state?.modele3D || null;

  const [address, setAddress] = useState({ 
    fullAddress: '', 
    city: '', 
    zip: '', 
    country: 'France' 
  });
  const [validationError, setValidationError] = useState('');
  const [isCardComplete, setIsCardComplete] = useState(false);
  const [isAddressValid, setIsAddressValid] = useState(false);
  const [cardNumberComplete, setCardNumberComplete] = useState(false);
  const [cardExpiryComplete, setCardExpiryComplete] = useState(false);
  const [cardCvcComplete, setCardCvcComplete] = useState(false);

  // 🚨 Redirection si pas de modèle
  useEffect(() => {
    if (!modele3D) {
      toast.error('Aucun modèle sélectionné');
      navigate('/dashboard/client');
    }
  }, [modele3D, navigate]);

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
      setValidationError('');
    } catch (e) {
      setValidationError('Adresse introuvable.');
      setIsAddressValid(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!modele3D) {
      toast.error('Erreur: modèle non trouvé');
      return;
    }

    try {
      // 🎯 Adapter le payload pour un modèle 3D unique
      const response = await paiementService.enregistrerPaiement({
        prenom: user?.prenom || 'Client',
        nom: user?.nom || 'Anonyme',
        email: user?.email || 'client@example.com',
        telephone: user?.telephone || '01',
        adresse: `${address.fullAddress}, ${address.city} ${address.zip}`,
        prixTotal: modele3D.prix,
        stripePaymentId: new Date().getTime().toString(), // ID temporaire
        
        // 🎯 ADAPTATION: Un seul "produit" = le modèle 3D
        produits: [{
          id: modele3D.id,
          name: modele3D.nom,
          quantity: 1, // Toujours 1 pour un modèle 3D
          price: modele3D.prix
        }],
        utilisateurId: user?.id || 1,
        
        // 🎯 NOUVEAU: Identifier que c'est un modèle 3D
        typeCommande: 'modele3D',
        modele3DId: modele3D.id
      });

      if (response.status === 201) {
        // Son de succès
        const audio = new Audio('/succes_payment.wav');
        audio.play();

        toast.success('Commande de modèle 3D validée ! Redirection...', {
          duration: 3000,
          position: 'top-center'
        });

        setTimeout(() => {
          navigate('/dashboard/client/mes-commandes'); // ou autre page
        }, 3000);
      }

    } catch (err) {
      console.error('Erreur commande modèle 3D:', err);
      toast.error('Une erreur est survenue lors de la commande.', {
        duration: 3000,
        position: 'top-center'
      });
    }
  };

  useEffect(() => {
    setIsCardComplete(cardNumberComplete && cardExpiryComplete && cardCvcComplete);
  }, [cardNumberComplete, cardExpiryComplete, cardCvcComplete]);

  if (!modele3D) return null;

  return (
    <Container style={{ paddingTop: '70px', paddingBottom: '50px' }}>
      <h2 className="mb-4">🎨 Commande Modèle 3D</h2>
      
      <Row className="mb-4">
        {/* 🎯 SECTION MODÈLE 3D */}
        <Col md={4}>
          <Card body>
            <h4>Modèle sélectionné</h4>
            <div className="mb-3">
              <strong>{modele3D.nom}</strong>
              {modele3D.description && (
                <p className="text-muted small mt-1">{modele3D.description}</p>
              )}
            </div>
            <div className="mb-2">
              <span className="badge bg-info">Modèle 3D unique</span>
            </div>
            <hr />
            <strong>Total : {modele3D.prix.toFixed(2)} €</strong>
          </Card>
        </Col>

        {/* 🎯 SECTION ADRESSE (identique) */}
        <Col md={4}>
          <Card body>
            <h4>Adresse de livraison</h4>
            <Form>
              <Form.Group className="mb-2">
                <Form.Label>Adresse complète</Form.Label>
                <Form.Control 
                  type="text" 
                  value={address.fullAddress} 
                  onChange={(e) => setAddress({ ...address, fullAddress: e.target.value })} 
                  onBlur={validateAddress}
                  placeholder="123 rue de la Paix"
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Ville</Form.Label>
                <Form.Control 
                  type="text" 
                  value={address.city} 
                  onChange={(e) => setAddress({ ...address, city: e.target.value })} 
                  onBlur={validateAddress}
                  placeholder="Paris"
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Code postal</Form.Label>
                <Form.Control 
                  type="text" 
                  value={address.zip} 
                  onChange={(e) => setAddress({ ...address, zip: e.target.value })} 
                  onBlur={validateAddress}
                  placeholder="75001"
                />
              </Form.Group>
              {isAddressValid && (
                <Alert variant="success" className="mt-2">
                  ✅ Adresse validée
                </Alert>
              )}
            </Form>
          </Card>
        </Col>

        {/* 🎯 SECTION PAIEMENT (identique) */}
        <Col md={4}>
          <Card body>
            <h4>Paiement sécurisé</h4>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Numéro de carte</Form.Label>
                <div style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '4px' }}>
                  <CardNumberElement
                    onChange={e => setCardNumberComplete(e.complete)}
                  />
                </div>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Date d'expiration</Form.Label>
                <div style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '4px' }}>
                  <CardExpiryElement
                    onChange={e => setCardExpiryComplete(e.complete)}
                  />
                </div>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Code CVC</Form.Label>
                <div style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '4px' }}>
                  <CardCvcElement
                    onChange={e => setCardCvcComplete(e.complete)}
                  />
                </div>
              </Form.Group>
              
              {validationError && (
                <Alert variant="danger">{validationError}</Alert>
              )}
              
              <Button 
                type="submit"
                disabled={!isCardComplete || !isAddressValid}
                variant="primary"
                className="w-100"
                size="lg"
              >
                🎨 Commander le modèle 3D ({modele3D.prix.toFixed(2)} €)
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

const CommandeClient = () => (
  <Elements stripe={stripePromise}>
    <CommandeForm />
  </Elements>
);

export default CommandeClient;