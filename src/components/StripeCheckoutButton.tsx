// 📦 Composant React StripeCheckoutButton.tsx
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { useCart } from '../hooks/useSoppingCart';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_xxx');

const StripeCheckoutButton = () => {
  const { cart } = useCart();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:4242/api/checkout/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItems: cart })
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Erreur lors de la création de la session Stripe.');
      }
    } catch (err) {
      console.error('Stripe checkout error:', err);
      alert('Erreur de paiement.');
    }
    setLoading(false);
  };

  return (
    <Button onClick={handleCheckout} disabled={loading} variant="primary">
      {loading ? 'Chargement...' : 'Passer au paiement'}
    </Button>
  );
};

export default StripeCheckoutButton;
