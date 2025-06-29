// src/Routeur.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Accueil } from './Pages/Accueil';
import LoginPage from './Pages/LoginPage';
import ProfilePage from './Pages/ProfilePage';
import Navbar from './components/Navbar';
import ProtectedRoute from './routes/ProtectedRoute';
import ProductDetails from './Pages/ProductDetails';
import CartPage from './Pages/shoppingCart';
import Erreur from './Pages/Erreur';
import Dashboard from './Pages/Dashboard';
import CheckoutPage from './Pages/validationPanier';

export const Routeur = () => {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/erreur" element={<Erreur />} />
            <Route path="/" element={<Accueil />} />
            
            {/* Routes d'authentification */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/produits/ProductDetails/:id" element={<ProductDetails />} />
            <Route path="/shoppingCart" element={<CartPage />} />
            <Route path="/validation/Panier" element={<CheckoutPage />} />
            {/* Routes protégées */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profil" 
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />
            
            {/* Route par défaut - redirection vers l'accueil */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default Routeur;