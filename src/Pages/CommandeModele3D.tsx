// src/Pages/CommandeModele3D.tsx
import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// ✅ CORRECTION: Import avec le bon nom de service
import { commandeService } from '../Services/commande.service';
import { filesClientService } from '../services/filesClient.service';
import { useAuth } from '../hooks/useAuth';

// ✅ Import du CSS
import '../assets/styles/CommandeModele3D.css';

// ✅ Import de la clé Stripe
import { REACT_APP_STRIPE_PUBLISHABLE_KEY } from '../config/env';

// ✅ Configuration Stripe
const stripePromise = loadStripe(REACT_APP_STRIPE_PUBLISHABLE_KEY);

// ✅ Options pour Stripe Elements
const stripeElementsOptions = {
  appearance: {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#0570de',
      colorBackground: '#ffffff',
      colorText: '#30313d',
      colorDanger: '#df1b41',
      fontFamily: 'Ideal Sans, system-ui, sans-serif',
      spacingUnit: '2px',
      borderRadius: '4px',
    },
  },
};

// ✅ Options pour CardElement
const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#9e2146',
    },
  },
};

// ✅ Interface pour les données du formulaire
interface FormData {
  telephone: string;
  adresse: string;
  quantite: number;
  instructions: string;
}

// ✅ Composant principal de formulaire de commande
const CommandeModele3DForm: React.FC<{ modele: FileClientData }> = ({ modele }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { user } = useAuth();

  // ✅ États du formulaire
  const [formData, setFormData] = useState<FormData>({
    telephone: '',
    adresse: '',
    quantite: 1,
    instructions: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // ✅ Calcul du prix total
  const prixUnitaire = parseFloat(modele.prix) || 0;
  const prixTotal = prixUnitaire * formData.quantite;

  // ✅ Gestion des changements de formulaire
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantite' ? Math.max(1, parseInt(value) || 1) : value
    }));
  };

  // ✅ Gestion de la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      setError('Stripe n\'est pas prêt');
      return;
    }

    if (!user) {
      setError('Vous devez être connecté pour passer une commande');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // ✅ Étape 1 : Créer PaymentIntent
      console.log('🔄 Création PaymentIntent...');
      const paymentResponse = await commandeService.createPaymentIntent(modele.id);

      if (!paymentResponse.clientSecret) {
        throw new Error('Erreur lors de la création du paiement');
      }

      // ✅ Étape 2 : Confirmer le paiement avec Stripe
      console.log('🔄 Confirmation du paiement...');
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
              name: `${user.prenom} ${user.nom}`,
              email: user.email,
              phone: formData.telephone,
            },
          },
        }
      );

      if (paymentError) {
        throw new Error(paymentError.message || 'Erreur lors du paiement');
      }

      if (paymentIntent.status !== 'succeeded') {
        throw new Error('Le paiement n\'a pas abouti');
      }

      // ✅ Étape 3 : Créer la commande
      console.log('🔄 Création de la commande...');
      const commandeResponse = await commandeService.createCommandeModele3D({
        modele3dClientId: modele.id,
        telephone: formData.telephone,
        adresse: formData.adresse,
        stripePaymentId: paymentIntent.id
      });

      if (commandeResponse.success) {
        setSuccess('Commande créée avec succès !');
        
        // ✅ Redirection après succès
        setTimeout(() => {
          navigate('/commandes');
        }, 2000);
      } else {
        throw new Error(commandeResponse.message || 'Erreur lors de la création de la commande');
      }

    } catch (error: any) {
      console.error('❌ Erreur lors de la commande:', error);
      setError(error.message || 'Erreur lors du traitement de la commande');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container className="commande-modele3d-container">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="commande-card">
            <Card.Header className="commande-card-header">
              <h4 className="commande-title">
                <i className="fas fa-shopping-cart"></i>
                Commande : {modele.nom}
              </h4>
            </Card.Header>
            <Card.Body className="commande-card-body">
              {/* ✅ Section informations modèle */}
              <div className="modele-info-section">
                <h5 className="section-title">Informations du modèle</h5>
                <Row className="modele-info">
                  <Col md={6}>
                    <p><strong>Nom :</strong> {modele.nom}</p>
                    <p><strong>Description :</strong> {modele.description}</p>
                    <p><strong>Matériau :</strong> {modele.materiau?.nom} ({modele.materiau?.couleur})</p>
                  </Col>
                  <Col md={6}>
                    <p><strong>Dimensions :</strong> {modele.longueur}×{modele.largeur}×{modele.hauteur}</p>
                    <p><strong>Volume :</strong> {modele.volume}</p>
                    <p><strong>Prix unitaire :</strong> <span className="prix-unitaire">{prixUnitaire.toFixed(2)} €</span></p>
                  </Col>
                </Row>
              </div>

              {/* ✅ Formulaire de commande */}
              <Form onSubmit={handleSubmit} className="commande-form">
                <div className="form-section">
                  <h5 className="section-title">Informations de livraison</h5>
                  
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Téléphone *</Form.Label>
                        <Form.Control
                          type="tel"
                          name="telephone"
                          value={formData.telephone}
                          onChange={handleInputChange}
                          required
                          placeholder="Ex: 06 12 34 56 78"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Quantité *</Form.Label>
                        <Form.Control
                          type="number"
                          name="quantite"
                          value={formData.quantite}
                          onChange={handleInputChange}
                          min="1"
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Adresse de livraison *</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="adresse"
                      value={formData.adresse}
                      onChange={handleInputChange}
                      required
                      placeholder="Adresse complète de livraison"
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Instructions spéciales</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      name="instructions"
                      value={formData.instructions}
                      onChange={handleInputChange}
                      placeholder="Instructions particulières pour l'impression ou la livraison"
                    />
                  </Form.Group>
                </div>

                {/* ✅ Section paiement */}
                <div className="form-section">
                  <h5 className="section-title">Informations de paiement</h5>
                  <div className="payment-section">
                    <Form.Label>Carte bancaire</Form.Label>
                    <div className="stripe-card-element">
                      <CardElement options={cardElementOptions} />
                    </div>
                  </div>
                </div>

                {/* ✅ Résumé de commande */}
                <div className="order-summary">
                  <h6>Résumé de la commande</h6>
                  <div className="summary-line">
                    <span>Prix unitaire :</span>
                    <span>{prixUnitaire.toFixed(2)} €</span>
                  </div>
                  <div className="summary-line">
                    <span>Quantité :</span>
                    <span>{formData.quantite}</span>
                  </div>
                  <div className="summary-line summary-total">
                    <span>Total :</span>
                    <span>{prixTotal.toFixed(2)} €</span>
                  </div>
                </div>

                {/* ✅ Messages d'état */}
                {error && (
                  <Alert variant="danger" className="mb-3">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {error}
                  </Alert>
                )}

                {success && (
                  <Alert variant="success" className="mb-3">
                    <i className="fas fa-check-circle me-2"></i>
                    {success}
                  </Alert>
                )}

                {/* ✅ Boutons d'action */}
                <div className="actions-container">
                  <button
                    type="button"
                    className="btn-retour"
                    onClick={() => navigate(-1)}
                    disabled={isSubmitting}
                  >
                    <i className="fas fa-arrow-left"></i>
                    Retour
                  </button>
                  
                  <button
                    type="submit"
                    className="btn-payer"
                    disabled={isSubmitting || !stripe || !elements}
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Traitement en cours...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-credit-card"></i>
                        Payer {prixTotal.toFixed(2)} €
                      </>
                    )}
                  </button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

// ✅ Composant principal
const CommandeModele3D: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [modele, setModele] = useState<FileClientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // ✅ Vérification de l'authentification
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
  }, [user, navigate]);

  // ✅ Chargement du modèle 3D
  useEffect(() => {
    const fetchModele = async () => {
      if (!id) {
        setError('ID du modèle manquant');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('🔄 Récupération du modèle ID:', id);
        
        // ✅ CORRECTION: Utiliser le bon service
        const modeleData = await filesClientService.getFileClientById(parseInt(id));
        
        if (modeleData) {
          console.log('✅ Modèle récupéré:', modeleData);
          setModele(modeleData);
        } else {
          setError('Modèle non trouvé');
        }
      } catch (error: any) {
        console.error('❌ Erreur récupération modèle:', error);
        setError(error.message || 'Erreur lors du chargement du modèle');
      } finally {
        setLoading(false);
      }
    };

    fetchModele();
  }, [id]);

  // ✅ Affichage du loading
  if (loading) {
    return (
      <Container className="loading-container">
        <Spinner animation="border" variant="primary" className="loading-spinner" />
        <p className="mt-3">Chargement du modèle...</p>
      </Container>
    );
  }

  // ✅ Affichage d'erreur
  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Erreur</Alert.Heading>
          <p>{error}</p>
          <hr />
          <div className="d-flex justify-content-end">
            <button
              className="btn btn-outline-danger"
              onClick={() => navigate('/mes-fichiers')}
            >
              Retour à mes fichiers
            </button>
          </div>
        </Alert>
      </Container>
    );
  }

  // ✅ Affichage principal avec Stripe Elements
  if (!modele) {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          <Alert.Heading>Modèle non trouvé</Alert.Heading>
          <p>Le modèle demandé n'existe pas ou n'est plus disponible.</p>
          <hr />
          <div className="d-flex justify-content-end">
            <button
              className="btn btn-outline-warning"
              onClick={() => navigate('/mes-fichiers')}
            >
              Retour à mes fichiers
            </button>
          </div>
        </Alert>
      </Container>
    );
  }

  return (
    <Elements stripe={stripePromise} options={stripeElementsOptions}>
      <CommandeModele3DForm modele={modele} />
    </Elements>
  );
};

export default CommandeModele3D;
