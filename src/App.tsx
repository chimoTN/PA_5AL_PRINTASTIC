// src/App.tsx ou équivalent
import { AuthProvider } from './hooks/useAuth';
import { CartProvider } from './hooks/useSoppingCart';
import { Routeur } from './Routeur';
import StripeErrorHandler from './components/StripeErrorHandler';
import './assets/styles/App.css'
import './assets/styles/global.css';
import './assets/styles/custom.scss';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Toaster } from 'sonner';

function App() {
  return (
    <>
      <StripeErrorHandler />
      <AuthProvider>
        <CartProvider>
          <Routeur />
        </CartProvider>
        <Toaster richColors />
      </AuthProvider>
    </>
  );
}
export default App;


