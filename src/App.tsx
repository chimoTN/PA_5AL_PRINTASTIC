// src/App.tsx ou équivalent
import { AuthProvider } from './hooks/useAuth';
import Routeur from './Routeur';
import './assets/styles/App.css'
import './assets/styles/global.css';
// autres imports...


function App() {
  return (
    <AuthProvider>
      <Routeur />
    </AuthProvider>
  );
}
export default App;