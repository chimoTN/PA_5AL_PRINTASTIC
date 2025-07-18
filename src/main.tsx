import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './assets/styles/index.css'
import '@/assets/styles/Navbar.css';
import '@/assets/styles/LoginPage.css';
import '@/assets/styles/App.css';
import '@/assets/styles/CommandeModele3D.css';
import '@/assets/styles/custom.scss';
import '@/assets/styles/Dashboard.css';
import '@/assets/styles/FileUpload.css';
import '@/assets/styles/gestionProduits.css';
import '@/assets/styles/global.css';
import '@/assets/styles/productDetail.css';
import '@/assets/styles/UserFiles.css';

import App from './App.tsx'



createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <App />
  </StrictMode>,
)

