// src/Routeur.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import RoleProtectedRoute from './routes/RoleProtectedRoute';
import { Accueil } from './Pages/Accueil';
import LoginPage from './Pages/LoginPage';
import ProfilePage from './Pages/ProfilePage';
import ProductDetails from './Pages/ProductDetails';
import CartPage from './Pages/shoppingCart';
import Erreur from './Pages/Erreur';
import Dashboard from './Pages/Dashboard';
import CheckoutPage from './Pages/validationPanier';
import DashboardAdmin from './Pages/DashboardAdmin';
import DashboardImpression from './Pages/DashboardImpression';

import Navbar from './components/Navbar';
import CommandesClient from './Pages/CommandesClient';
import InscriptionPage from './Pages/InscriptionPage';
import CompteSuspendu from './Pages/CompteSuspendu';

export const Routeur = () => (
  <Router>
    <Navbar />
    <main className="main-content">
      <Routes>
        <Route path="/" element={<Accueil />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/compte-suspendu" element={<CompteSuspendu />} />

        {/* accessibles sans auth */}
        <Route path="/produits/ProductDetails/:id" element={<ProductDetails />} />
        <Route path="/shoppingCart" element={<CartPage />} />
        <Route path="/erreur" element={<Erreur />} />
        <Route path="/devenir-imprimeur" element={<InscriptionPage />} />
        {/* Accessible selement si connecter */}
        <Route
          path="/validation/Panier"
          element={
            <RoleProtectedRoute roles={['CLIENT', 'PROPRIETAIRE', 'IMPRIMEUR']}>
              <CheckoutPage />
            </RoleProtectedRoute>
          }
        />

        {/* Dashboard client → rôle USER */}
        <Route
          path="/dashboard/client"
          element={
            <RoleProtectedRoute roles={['CLIENT']}>
              <Dashboard />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/commande"
          element={
            <RoleProtectedRoute roles={['CLIENT']}>
              <CommandesClient />
            </RoleProtectedRoute>
          }
        />

        {/* Profil → rôle USER */}
        <Route
          path="/profil"
          element={
            <RoleProtectedRoute roles={['CLIENT']}>
              <ProfilePage />
            </RoleProtectedRoute>
          }
        />

        {/* Dashboard imprimeur → rôle IMPRIMEUR */}
        <Route
          path="/dashboard/impression"
          element={
            <RoleProtectedRoute roles={['IMPRIMEUR']}>
              <DashboardImpression />
            </RoleProtectedRoute>
          }
        />

        {/* Dashboard admin → rôle ADMIN */}
        <Route
          path="/dashboard/admin"
          element={
            <RoleProtectedRoute roles={['PROPRIETAIRE']}>
              <DashboardAdmin />
            </RoleProtectedRoute>
          }
        />

        {/* catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
  </Router>
);


export default Routeur;
