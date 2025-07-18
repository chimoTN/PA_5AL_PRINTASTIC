// src/Pages/InscriptionImprimeurPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Modal } from 'react-bootstrap'; 
import { userService } from '../services/user.service';
import '../assets/styles/LoginPage.css';

export default function InscriptionPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    companyName: '',
    siret: '',
    address: '',
    phone: '',
    requesterEmail: '',
    requesterName: '',
    sampleFile: 'coucou',      // on stockera ici la dataURL
    accepte: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [showCGUModal, setShowCGUModal] = useState(false);
  const [acceptCGU, setAcceptCGU] = useState(false);

  // Mise à jour des champs texte
  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Conversion du fichier image en base64
  const handleFileChange = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm(f => ({ ...f, sampleFile: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    setError('');
    const {
      companyName,
      siret,
      address,
      phone,
      requesterEmail,
      sampleFile,
      accepte
    } = form;

    if (
      !companyName ||
      !siret ||
      !address ||
      !phone ||
      !requesterEmail ||
      !sampleFile ||
      !accepte
    ) {
      setError('Veuillez remplir tous les champs et accepter les conditions');
      return;
    }

    setLoading(true);
    try {
      // Appel JSON, on envoie la base64 dans sampleFile
      const res = await userService.inscriptionImprimeur({
        companyName,
        siret,
        address,
        phone,
        requesterEmail,
        requesterName: form.requesterName,
        sampleFile
      });
      setSent(true);
      toast.success('Demande envoyée avec succès !');
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de l’envoi du formulaire');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center mt-5">
        <h2>🎉 Merci pour votre demande</h2>
        <p>Nous avons bien reçu votre formulaire. Vous serez notifié par email.</p>
        <button type="button" className="btn btn-outline-dark" onClick={() => navigate('/')}>
          Retour à l'accueil
        </button>
      </div>
    );
  }

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card p-5 shadow rounded-4" style={{ maxWidth: 600 }}>
        <h1 className="text-center mb-4">Devenir Imprimeur</h1>
        {error && <div className="text-danger text-center mb-3">{error}</div>}

        <input
          name="companyName"
          className="form-input mb-3"
          placeholder="Nom de l’entreprise"
          value={form.companyName}
          onChange={handleChange}
        />

        <input
          name="siret"
          className="form-input mb-3"
          placeholder="SIRET"
          value={form.siret}
          onChange={handleChange}
        />

        <input
          name="address"
          className="form-input mb-3"
          placeholder="Adresse de l’atelier"
          value={form.address}
          onChange={handleChange}
        />

        <input
          name="phone"
          className="form-input mb-3"
          placeholder="Téléphone"
          value={form.phone}
          onChange={handleChange}
        />

        <input
          name="requesterEmail"
          type="email"
          className="form-input mb-3"
          placeholder="Votre email"
          value={form.requesterEmail}
          onChange={handleChange}
        />

        <input
          name="requesterName"
          className="form-input mb-3"
          placeholder="Votre nom (facultatif)"
          value={form.requesterName}
          onChange={handleChange}
        />

        <div className="form-group mb-4">
          <label>Photo de la carte d’identité</label>
          <input type="file" className="form-input" /*onChange={handleFileChange}*/ />
        </div>

        <div className="form-check mb-4">
          <input
            type="checkbox"
            checked={form.accepte}
            onChange={handleChange}
            name="accepte"
          />
          <label style={{ marginLeft: 8 }}>
              J’accepte les <span className="cgu-link" onClick={() => setShowCGUModal(true)}>conditions d’utilisation</span>
            </label>
        </div>

        <button
          className="login-page-button w-100"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Envoi...' : 'Faire la demande'}
        </button>

        <div className="text-center mt-2">
          <button type="button" className="btn btn-link" onClick={() => navigate('/login')}>
            ← Retour
          </button>
        </div>
      </div>

      <Modal show={showCGUModal} onHide={() => setShowCGUModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Conditions d’utilisation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>En utilisant Printastic, vous acceptez de respecter nos règles générales d’usage et de sécurité. Le service vise à mettre en relation les clients et les imprimeurs 3D...</p>
          <p>✅ Vous devez fournir des informations exactes<br />
            ✅ Vos impressions doivent être légales<br />
            ❌ Aucune vente d’objets interdits<br />
            ✅ Respectez les délais une fois une commande acceptée</p>
        </Modal.Body>
        <Modal.Footer>
          <button type="button" className="btn btn-secondary" onClick={() => setShowCGUModal(false)}>Fermer</button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
