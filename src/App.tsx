// src/App.tsx ou équivalent
import { AuthProvider } from './hooks/useAuth';
import { CartProvider } from './hooks/useSoppingCart';
import Routeur from './Routeur';
import './assets/styles/App.css'
import './assets/styles/global.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Routeur />
      </CartProvider>
    </AuthProvider>
  );
}
export default App;


