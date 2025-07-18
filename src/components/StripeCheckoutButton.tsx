// 📦 Composant React StripeCheckoutButton.tsx
import { useState } from 'react';
import { useCart } from '../hooks/useSoppingCart';

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
    <button type="button" className="btn btn-primary" onClick={handleCheckout} disabled={!!loading}>
      {loading ? 'Chargement...' : 'Passer au paiement'}
    </button>
  );
};

export default StripeCheckoutButton;
