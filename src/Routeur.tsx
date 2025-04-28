// src/Routeur.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Accueil } from './Pages/Accueil';
import LoginPage from './Pages/LoginPage';
import ProfilePage from './Pages/ProfilePage';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

export const Routeur = () => {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main className="main-content">
          <Routes>
            {/* Route d'accueil publique - doit être configurée explicitement */}
            <Route path="/" element={<Accueil />} />
            
            {/* Routes d'authentification */}
            <Route path="/login" element={<LoginPage />} />
            
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