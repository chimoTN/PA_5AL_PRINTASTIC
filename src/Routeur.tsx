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

export const Routeur = () => {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/erreur" element={<Erreur />} />
            <Route path="/" element={<Accueil />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/produits/ProductDetails/:id" element={<ProductDetails />} />
            <Route path="/shoppingCart" element={<CartPage />} />

            {/* Routes protégées */}
            <Route 
              path="/profile" 
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