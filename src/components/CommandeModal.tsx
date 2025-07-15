import React, { useState } from 'react';
import { Modal, Form, Button as BootstrapButton, Row, Col, Alert } from 'react-bootstrap';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { commandeService } from '../Services/commande.service';
import { loadStripe } from '@stripe/stripe-js';
import { REACT_APP_STRIPE_PUBLISHABLE_KEY } from '../config/env';
import { Modele3DClient } from '../services';

const stripePromise = loadStripe(REACT_APP_STRIPE_PUBLISHABLE_KEY);



interface CommandeModalProps {
  show: boolean;
  onHide: () => void;
  file: Modele3DClient | null;
  onCommandeSuccess: () => void;
}

// ✅ Options pour CardElement
const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      fontFamily: 'Arial, sans-serif',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#9e2146',
    },
  },
};

// ✅ Composant de formulaire avec Stripe
const CommandeForm: React.FC<{
  file: Modele3DClient;
  onSuccess: () => void;
  onError: (error: string) => void;
}> = ({ file, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  
  const [formData, setFormData] = useState({
    telephone: '',
    adresse: '',
    ville: '',
    codePostal: '',
    quantite: 1,
    instructions: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ✅ Validation du formulaire
  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.telephone.trim()) {
      newErrors.telephone = 'Le téléphone est requis';
    } else if (!/^[0-9+\-\s()]{10,}$/.test(formData.telephone)) {
      newErrors.telephone = 'Format de téléphone invalide';
    }
    
    if (!formData.adresse.trim()) {
      newErrors.adresse = 'L\'adresse est requise';
    }
    
    if (!formData.ville.trim()) {
      newErrors.ville = 'La ville est requise';
    }
    
    if (!formData.codePostal.trim()) {
      newErrors.codePostal = 'Le code postal est requis';
    } else if (!/^[0-9]{5}$/.test(formData.codePostal)) {
      newErrors.codePostal = 'Code postal invalide (5 chiffres)';
    }
    
    if (formData.quantite < 1 || formData.quantite > 100) {
      newErrors.quantite = 'Quantité invalide (1-100)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Gestion des changements
  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Effacer l'erreur du champ modifié
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // ✅ Calcul du prix total
  const prixUnitaire = parseFloat(file.prix?.toString() || '0');
  const prixTotal = prixUnitaire * formData.quantite;

  // ✅ Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    if (!stripe || !elements) {
      onError('Stripe n\'est pas prêt');
      return;
    }

    setIsSubmitting(true);

    try {
      // ✅ Créer l'intention de paiement
      const paymentResponse = await commandeService.createPaymentIntent(file.id);

      if (!paymentResponse.clientSecret) {
        throw new Error('Erreur lors de la création du paiement');
      }

      // ✅ Confirmer le paiement
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Élément de carte non trouvé');
      }

      const { error: paymentError, paymentIntent } = await stripe.confirmCardPayment(
        paymentResponse.clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: `${formData.telephone}`,
              phone: formData.telephone,
              address: {
                line1: formData.adresse,
                city: formData.ville,
                postal_code: formData.codePostal,
                country: 'FR'
              }
            }
          }
        }
      );

      if (paymentError) {
        throw new Error(paymentError.message || 'Erreur lors du paiement');
      }

      if (paymentIntent.status !== 'succeeded') {
        throw new Error('Le paiement n\'a pas abouti');
      }

      // ✅ Créer la commande
      const commandeResponse = await commandeService.createCommandeModele3D({
        modele3dClientId: file.id,
        telephone: formData.telephone,
        adresse: `${formData.adresse}, ${formData.ville} ${formData.codePostal}`,
        stripePaymentId: paymentIntent.id
      });

      if (commandeResponse.success) {
        onSuccess();
      } else {
        throw new Error(commandeResponse.message || 'Erreur lors de la création de la commande');
      }

    } catch (error: any) {
      console.error('❌ Erreur lors de la commande:', error);
      onError(error.message || 'Erreur lors du traitement de la commande');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      {/* ✅ Informations du produit */}
      <div className="mb-4 p-3 bg-light rounded">
        <h6 className="mb-2">
          <i className="fas fa-cube me-2"></i>
          {file.nom}
        </h6>
        <Row>
          <Col md={6}>
            <small className="text-muted">Prix unitaire: </small>
            <strong>{prixUnitaire.toFixed(2)} €</strong>
          </Col>
          <Col md={6}>
            <small className="text-muted">Total: </small>
            <strong className="text-primary">{prixTotal.toFixed(2)} €</strong>
          </Col>
        </Row>
      </div>

      {/* ✅ Quantité */}
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>
              <i className="fas fa-calculator me-2"></i>
              Quantité
            </Form.Label>
            <Form.Control
              type="number"
              min="1"
              max="100"
              value={formData.quantite}
              onChange={(e) => handleChange('quantite', parseInt(e.target.value) || 1)}
              isInvalid={!!errors.quantite}
            />
            <Form.Control.Feedback type="invalid">
              {errors.quantite}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

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
              value={formData.telephone}
              onChange={(e) => handleChange('telephone', e.target.value)}
              placeholder="06 12 34 56 78"
              isInvalid={!!errors.telephone}
            />
            <Form.Control.Feedback type="invalid">
              {errors.telephone}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      {/* ✅ Adresse de livraison */}
      <Row className="mb-3">
        <Col md={12}>
          <Form.Group>
            <Form.Label>
              <i className="fas fa-map-marker-alt me-2"></i>
              Adresse de livraison *
            </Form.Label>
            <Form.Control
              type="text"
              value={formData.adresse}
              onChange={(e) => handleChange('adresse', e.target.value)}
              placeholder="123 Rue de la Paix"
              isInvalid={!!errors.adresse}
            />
            <Form.Control.Feedback type="invalid">
              {errors.adresse}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={8}>
          <Form.Group>
            <Form.Label>
              <i className="fas fa-city me-2"></i>
              Ville *
            </Form.Label>
            <Form.Control
              type="text"
              value={formData.ville}
              onChange={(e) => handleChange('ville', e.target.value)}
              placeholder="Paris"
              isInvalid={!!errors.ville}
            />
            <Form.Control.Feedback type="invalid">
              {errors.ville}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label>
              <i className="fas fa-mail-bulk me-2"></i>
              Code postal *
            </Form.Label>
            <Form.Control
              type="text"
              value={formData.codePostal}
              onChange={(e) => handleChange('codePostal', e.target.value)}
              placeholder="75001"
              maxLength={5}
              isInvalid={!!errors.codePostal}
            />
            <Form.Control.Feedback type="invalid">
              {errors.codePostal}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      {/* ✅ Instructions spéciales */}
      <Row className="mb-3">
        <Col md={12}>
          <Form.Group>
            <Form.Label>
              <i className="fas fa-comment me-2"></i>
              Instructions spéciales (optionnel)
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={formData.instructions}
              onChange={(e) => handleChange('instructions', e.target.value)}
              placeholder="Couleur souhaitée, délais particuliers..."
              maxLength={500}
            />
            <Form.Text className="text-muted">
              {formData.instructions.length}/500 caractères
            </Form.Text>
          </Form.Group>
        </Col>
      </Row>

      {/* ✅ Informations de paiement */}
      <div className="mb-4">
        <Form.Label>
          <i className="fas fa-credit-card me-2"></i>
          Informations de paiement
        </Form.Label>
        <div className="p-3 border rounded bg-white">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      {/* ✅ Boutons */}
      <div className="d-flex justify-content-end gap-2">
        <BootstrapButton 
            variant="secondary" 
            onClick={() => window.location.reload()}
            disabled={isSubmitting}
            >
            <i className="fas fa-times me-2"></i>
            Annuler
            </BootstrapButton>

            <BootstrapButton 
            type="submit" 
            variant="primary"
            disabled={isSubmitting || !stripe}
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

// ✅ Composant modal principal
const CommandeModal: React.FC<CommandeModalProps> = ({ 
  show, 
  onHide, 
  file, 
  onCommandeSuccess 
}) => {
  const [success, setSuccess] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSuccess = () => {
    setSuccess('Commande créée avec succès !');
    setTimeout(() => {
      onCommandeSuccess();
      onHide();
      setSuccess('');
    }, 2000);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleClose = () => {
    setError('');
    setSuccess('');
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
        
        {success && (
          <Alert variant="success">
            <i className="fas fa-check-circle me-2"></i>
            {success}
          </Alert>
        )}

        {!success && (
          <Elements stripe={stripePromise}>
            <CommandeForm 
              file={file}
              onSuccess={handleSuccess}
              onError={handleError}
            />
          </Elements>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default CommandeModal;