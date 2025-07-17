import React, { useState, useEffect } from 'react';
import { Modal, Form, Button as BootstrapButton, Row, Col, Alert, Card } from 'react-bootstrap';
import { Elements, CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { commandeService } from '../services/commande.service';
import { paiementService } from '../services/paiementService';
import { loadStripe } from '@stripe/stripe-js';
import { REACT_APP_STRIPE_PUBLISHABLE_KEY } from '../config/env';
import { Modele3DClient } from '../services';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';

const stripePromise = loadStripe(REACT_APP_STRIPE_PUBLISHABLE_KEY);

interface CommandeModalProps {
  show: boolean;
  onHide: () => void;
  file: Modele3DClient | null;
  onCommandeSuccess: () => void;
}

// ✅ Composant de formulaire avec features checkout
const CommandeForm: React.FC<{
  file: Modele3DClient;
  onSuccess: () => void;
  onError: (error: string) => void;
  onHide: () => void;
}> = ({ file, onSuccess, onError, onHide }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  
  // ✅ États pour la validation des cartes (comme checkout)
  const [cardNumberComplete, setCardNumberComplete] = useState(false);
  const [cardExpiryComplete, setCardExpiryComplete] = useState(false);
  const [cardCvcComplete, setCardCvcComplete] = useState(false);
  const [isCardComplete, setIsCardComplete] = useState(false);
  
  // ✅ États pour l'adresse avec validation (comme checkout)
  const [address, setAddress] = useState({ 
    fullAddress: '', 
    city: '', 
    zip: '', 
    country: 'France' 
  });
  const [isAddressValid, setIsAddressValid] = useState(false);
  const [validationError, setValidationError] = useState('');
  
  // ✅ États pour la commande
  const [quantite, setQuantite] = useState(1);
  const [telephone, setTelephone] = useState('');
  const [instructions, setInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Calculs de prix
  const prixUnitaire = file?.prix || 0;
  const prixTotal = prixUnitaire * quantite;

  // ✅ Validation de l'adresse (comme checkout)
  const validateAddress = async () => {
    try {
      const data = await paiementService.verifierAdresse(
        `${address.fullAddress} ${address.city} ${address.zip}`
      );
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

  // ✅ Validation du téléphone
  const validateTelephone = (phone: string): boolean => {
    return /^(?:(?:\+33|0)[1-9](?:[0-9]{8}))$/.test(phone.replace(/[\s.-]/g, ''));
  };

  // ✅ Gestion de la soumission (inspirée de checkout)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation finale
    if (!isCardComplete || !isAddressValid || !telephone || !validateTelephone(telephone)) {
      setValidationError('Veuillez compléter tous les champs obligatoires.');
      return;
    }

    setIsSubmitting(true);

    try {
      // ✅ 1. Créer le PaymentIntent
      const { clientSecret } = await paiementService.creerPaymentIntent(
        Math.round(prixTotal * 100)
      );

      // ✅ 2. Confirmer le paiement avec Stripe
      const cardNumberElement = elements?.getElement(CardNumberElement);
      if (!cardNumberElement) {
        throw new Error('Élément de carte non trouvé');
      }

      const result = await stripe?.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardNumberElement,
          billing_details: {
            name: `${user?.prenom || ''} ${user?.nom || ''}`,
            email: user?.email || '',
            phone: telephone,
            address: {
              line1: address.fullAddress,
              city: address.city,
              postal_code: address.zip,
              country: 'FR'
            }
          }
        }
      });

      if (result?.error) {
        throw new Error(result.error.message || "Erreur de paiement.");
      }

      // ✅ 3. Enregistrer la commande (style checkout)
      if (result?.paymentIntent?.status === 'succeeded') {
        const response = await paiementService.enregistrerPaiement({
          prenom: user?.prenom || 'Client',
          nom: user?.nom || 'Anonyme',
          email: user?.email || 'client@example.com',
          telephone: telephone,
          adresse: `${address.fullAddress}, ${address.city} ${address.zip}`,
          prixTotal: prixTotal,
          stripePaymentId: result.paymentIntent.id,
          produits: [{
            id: file.id,
            nom: file.nom,
            quantity: quantite,
            price: prixUnitaire
          }],
          utilisateurId: user?.id || 0,
          typeCommande: 'modele3D', // ✅ Distinction du type
          instructions: instructions
        });

        if (response.status === 201) {
          // ✅ Son de succès (comme checkout)
          const audio = new Audio('/succes_payment.wav');
          audio.play().catch(() => {}); // Ignore les erreurs audio

          // ✅ Toast de succès
          toast.success(
            `🎨 Commande validée ! Modèle "${file.nom}" commandé avec succès.`,
            {
              description: `Quantité: ${quantite} | Total: ${prixTotal.toFixed(2)} €`,
              duration: 4000,
              position: 'top-center'
            }
          );

          onSuccess();
        } else {
          throw new Error('Erreur lors de la création de la commande');
        }
      }

    } catch (error: any) {
      console.error('❌ Erreur lors de la commande:', error);
      onError(error.message || 'Erreur lors du traitement de la commande');
      
      toast.error('Une erreur est survenue lors du paiement.', {
        duration: 3000,
        position: 'top-center'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Effet pour la validation des cartes (comme checkout)
  useEffect(() => {
    setIsCardComplete(cardNumberComplete && cardExpiryComplete && cardCvcComplete);
  }, [cardNumberComplete, cardExpiryComplete, cardCvcComplete]);

  return (
    <Form onSubmit={handleSubmit}>
      {/* ✅ Résumé de la commande */}
      <Card className="mb-4">
        <Card.Body>
          <h6>
            <i className="fas fa-cube me-2"></i>
            {file.nom}
          </h6>
          <Row>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Quantité</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  max="100"
                  value={quantite}
                  onChange={(e) => setQuantite(parseInt(e.target.value) || 1)}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <small className="text-muted">Prix unitaire: </small>
              <strong>{prixUnitaire.toFixed(2)} €</strong>
            </Col>
            <Col md={4}>
              <small className="text-muted">Total: </small>
              <strong className="text-primary">{prixTotal.toFixed(2)} €</strong>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* ✅ Informations de contact */}
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>
              <i className="fas fa-phone me-2"></i>
              Téléphone *
            </Form.Label>
            <Form.Control
              type="tel"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              placeholder="06 12 34 56 78"
              isInvalid={!!(telephone && !validateTelephone(telephone))}
            />
            <Form.Control.Feedback type="invalid">
              Format: 06 12 34 56 78 ou +33 6 12 34 56 78
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      {/* ✅ Adresse avec validation (comme checkout) */}
      <Row className="mb-3">
        <Col md={8}>
          <Form.Group>
            <Form.Label>
              <i className="fas fa-map-marker-alt me-2"></i>
              Adresse *
            </Form.Label>
            <Form.Control
              type="text"
              value={address.fullAddress}
              onChange={(e) => setAddress({ ...address, fullAddress: e.target.value })}
              onBlur={validateAddress}
              placeholder="123 Rue de la Paix"
              isInvalid={!isAddressValid && address.fullAddress.length > 0}
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>Ville *</Form.Label>
            <Form.Control
              type="text"
              value={address.city}
              onChange={(e) => setAddress({ ...address, city: e.target.value })}
              onBlur={validateAddress}
              placeholder="Paris"
            />
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Code postal *</Form.Label>
            <Form.Control
              type="text"
              value={address.zip}
              onChange={(e) => setAddress({ ...address, zip: e.target.value })}
              onBlur={validateAddress}
              placeholder="75001"
              maxLength={5}
            />
          </Form.Group>
        </Col>
      </Row>

      {/* ✅ Instructions */}
      <Form.Group className="mb-3">
        <Form.Label>
          <i className="fas fa-comment me-2"></i>
          Instructions spéciales
        </Form.Label>
        <Form.Control
          as="textarea"
          rows={2}
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="Couleur, matériau, délais..."
          maxLength={500}
        />
      </Form.Group>

      {/* ✅ Paiement (comme checkout) */}
      <div className="mb-4">
        <Form.Label>
          <i className="fas fa-credit-card me-2"></i>
          Informations de paiement
        </Form.Label>
        
        <Row className="mb-3">
          <Col md={12}>
            <div style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '4px' }}>
              <CardNumberElement
                onChange={e => setCardNumberComplete(e.complete)}
              />
            </div>
          </Col>
        </Row>
        
        <Row className="mb-3">
          <Col md={6}>
            <div style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '4px' }}>
              <CardExpiryElement
                onChange={e => setCardExpiryComplete(e.complete)}
              />
            </div>
          </Col>
          <Col md={6}>
            <div style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '4px' }}>
              <CardCvcElement
                onChange={e => setCardCvcComplete(e.complete)}
              />
            </div>
          </Col>
        </Row>
      </div>

      {/* ✅ Messages d'erreur */}
      {validationError && (
        <Alert variant="danger" className="mb-3">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {validationError}
        </Alert>
      )}

      {/* ✅ Boutons */}
      <div className="d-flex justify-content-end gap-2">
        <BootstrapButton 
          variant="secondary" 
          onClick={onHide}
          disabled={isSubmitting}
        >
          <i className="fas fa-times me-2"></i>
          Annuler
        </BootstrapButton>

        <BootstrapButton 
          type="submit" 
          variant="primary"
          disabled={isSubmitting || !stripe || !isCardComplete || !isAddressValid || !telephone}
        >
          {isSubmitting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" />
              Traitement...
            </>
          ) : (
            <>
              <i className="fas fa-shopping-cart me-2"></i>
              Commander ({prixTotal.toFixed(2)} €)
            </>
          )}
        </BootstrapButton>
      </div>
    </Form>
  );
};

// ✅ Composant Modal (inchangé)
const CommandeModal: React.FC<CommandeModalProps> = ({ 
  show, 
  onHide, 
  file, 
  onCommandeSuccess 
}) => {
  const [error, setError] = useState<string>('');

  const handleSuccess = () => {
    setError('');
    onCommandeSuccess();
    onHide();
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleClose = () => {
    setError('');
    onHide();
  };

  if (!file) return null;

  return (
    <Modal 
      show={show} 
      onHide={handleClose}
      size="lg"
      centered
      backdrop="static"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="fas fa-shopping-cart me-2"></i>
          Commander un modèle 3D
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        {error && (
          <Alert variant="danger" dismissible onClose={() => setError('')}>
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error}
          </Alert>
        )}

        <Elements stripe={stripePromise}>
          <CommandeForm 
            file={file}
            onSuccess={handleSuccess}
            onError={handleError}
            onHide={handleClose}
          />
        </Elements>
      </Modal.Body>
    </Modal>
  );
};

export default CommandeModal;