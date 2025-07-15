// src/services/commande.service.ts
import { baseService, ApiResponse } from '../Services/base.service';

// ✅ Interfaces TypeScript pour la commande
export interface DetailCommande {
  id: number;
  reference: string;
  quantite: number;
  prixUnitaire: string | number;
  statut: string;
  commandeId: number;
  produitId: number | null;
  modele3dClientId: number | null;
  produit?: {
    id: number;
    nom: string;
    description?: string;
    prix: string | number;
  } | null;
  modele3DClient?: {
    id: number;
    nom: string;
    description?: string;
    prix: string | number;
    fichier3D?: {
      nomFichier: string;
      tailleFichier: number;
    };
    materiau?: {
      nom: string;
      couleur?: string;
    };
  } | null;
}

export interface Paiement {
  id: number;
  stripePaymentId: string;
  montant: string | number;
  methodePaiement: string;
  statutPaiementId: number;
  commandeId: number;
  dateCreation: string;
}

export interface Commande {
  id: number;
  reference: string;
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  adresse: string;
  prixTotal: string | number;
  statut: string;
  utilisateurId: number;
  dateCreation: string;
  dateModification: string;
  detailCommandes: DetailCommande[];
  paiements: Paiement[];
}

export interface CommandeResponse extends ApiResponse {
  commandes?: Commande[];
  commande?: Commande;
}

export interface CreateCommandeModele3DData {
  modele3dClientId: number;
  telephone: string;
  adresse: string;
  stripePaymentId: string;
}

export interface CreateCommandeResponse extends ApiResponse {
  commande?: Commande;
  commandeReference?: string;
}

class CommandeService {
  private endpoint = '/commandes';

  /**
   * 🛒 Récupère toutes les commandes de l'utilisateur connecté
   */
  async getMesCommandes(): Promise<CommandeResponse> {
    try {
      console.log('🛒 [SERVICE] Récupération des commandes...');
      
      const response = await baseService.get<CommandeResponse>(`${this.endpoint}/mes-commandes`);
      
      console.log('✅ [SERVICE] Commandes récupérées:', {
        success: response.success,
        nbCommandes: response.commandes?.length || 0,
        commandes: response.commandes?.map(c => ({
          id: c.id,
          reference: c.reference,
          statut: c.statut,
          prixTotal: c.prixTotal,
          nbDetails: c.detailCommandes?.length || 0
        }))
      });
      
      return response;
    } catch (error: any) {
      console.error('❌ [SERVICE] Erreur lors de la récupération des commandes:', error);
      throw new Error(error.message || 'Impossible de récupérer vos commandes');
    }
  }

  /**
   * 📋 Récupère une commande par son ID
   */
  async getCommandeById(id: number): Promise<CommandeResponse> {
    try {
      console.log('📋 [SERVICE] Récupération commande ID:', id);
      
      const response = await baseService.get<CommandeResponse>(`${this.endpoint}/${id}`);
      
      console.log('✅ [SERVICE] Commande récupérée:', {
        id: response.commande?.id,
        reference: response.commande?.reference,
        statut: response.commande?.statut,
        nbDetails: response.commande?.detailCommandes?.length || 0
      });
      
      return response;
    } catch (error: any) {
      console.error(`❌ [SERVICE] Erreur lors de la récupération de la commande ${id}:`, error);
      throw new Error(error.message || 'La commande n\'a pas pu être récupérée');
    }
  }

  /**
   * 🔄 Change le statut d'un détail de commande
   */
  async changerStatutDetailCommande(idDetailCommande: number, statut: string): Promise<ApiResponse> {
    try {
      console.log('🔄 [SERVICE] Changement statut détail commande:', {
        idDetailCommande,
        nouveauStatut: statut
      });
      
      const response = await baseService.put<ApiResponse>(
        `${this.endpoint}/detail/${idDetailCommande}/statut`,
        { statut }
      );
      
      console.log('✅ [SERVICE] Statut mis à jour:', response);
      
      return response;
    } catch (error: any) {
      console.error(`❌ [SERVICE] Erreur lors de la mise à jour du statut du détail ${idDetailCommande}:`, error);
      throw new Error(error.message || 'Impossible de mettre à jour le statut');
    }
  }

  /**
   * 🛍️ Crée une commande pour un modèle 3D client
   */
  async createCommandeModele3D(data: CreateCommandeModele3DData): Promise<CreateCommandeResponse> {
    try {
      console.log('🛍️ [SERVICE] Création commande modèle 3D:', data);
      
      const response = await baseService.post<CreateCommandeResponse>(
        '/auth/commande-modele3d',
        data
      );
      
      console.log('✅ [SERVICE] Commande modèle 3D créée:', {
        success: response.success,
        reference: response.commandeReference,
        commandeId: response.commande?.id
      });
      
      return response;
    } catch (error: any) {
      console.error('❌ [SERVICE] Erreur lors de la création de la commande modèle 3D:', error);
      throw new Error(error.message || 'Impossible de créer la commande');
    }
  }

  /**
   * 💳 Crée une intention de paiement Stripe pour un modèle 3D
   */
  async createPaymentIntent(modele3dClientId: number): Promise<{
    clientSecret: string;
    amount: number;
    modele3D: any;
  }> {
    try {
      console.log('💳 [SERVICE] Création intention paiement pour modèle 3D:', modele3dClientId);
      
      const response = await baseService.post<{
        success: boolean;
        clientSecret: string;
        amount: number;
        modele3D: any;
      }>('/auth/create-payment-intent-modele3d', {
        modele3dClientId
      });
      
      if (!response.success) {
        throw new Error('Échec de la création de l\'intention de paiement');
      }
      
      console.log('✅ [SERVICE] Intention de paiement créée:', {
        amount: response.amount,
        modele3D: response.modele3D?.nom
      });
      
      return {
        clientSecret: response.clientSecret,
        amount: response.amount,
        modele3D: response.modele3D
      };
    } catch (error: any) {
      console.error('❌ [SERVICE] Erreur lors de la création de l\'intention de paiement:', error);
      throw new Error(error.message || 'Impossible de créer l\'intention de paiement');
    }
  }

  /**
   * 📊 Récupère les statistiques des commandes (pour admins)
   */
  async getStatistiquesCommandes(): Promise<{
    totalCommandes: number;
    commandesEnAttente: number;
    commandesTerminees: number;
    chiffreAffaires: number;
  }> {
    try {
      console.log('📊 [SERVICE] Récupération statistiques commandes...');
      
      const response = await baseService.get<{
        success: boolean;
        stats: {
          totalCommandes: number;
          commandesEnAttente: number;
          commandesTerminees: number;
          chiffreAffaires: number;
        };
      }>(`${this.endpoint}/statistiques`);
      
      console.log('✅ [SERVICE] Statistiques récupérées:', response.stats);
      
      return response.stats;
    } catch (error: any) {
      console.error('❌ [SERVICE] Erreur lors de la récupération des statistiques:', error);
      throw new Error(error.message || 'Impossible de récupérer les statistiques');
    }
  }

  /**
   * 🔍 Recherche des commandes avec filtres
   */
  async rechercherCommandes(filters: {
    statut?: string;
    dateDebut?: string;
    dateFin?: string;
    recherche?: string;
    page?: number;
    limite?: number;
  }): Promise<{
    commandes: Commande[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      console.log('🔍 [SERVICE] Recherche commandes avec filtres:', filters);
      
      // Construction des paramètres de requête
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
      
      const queryString = params.toString();
      const url = `${this.endpoint}/rechercher${queryString ? `?${queryString}` : ''}`;
      
      const response = await baseService.get<{
        success: boolean;
        commandes: Commande[];
        total: number;
        page: number;
        totalPages: number;
      }>(url);
      
      console.log('✅ [SERVICE] Recherche terminée:', {
        nbCommandes: response.commandes?.length || 0,
        total: response.total,
        page: response.page
      });
      
      return {
        commandes: response.commandes || [],
        total: response.total || 0,
        page: response.page || 1,
        totalPages: response.totalPages || 1
      };
    } catch (error: any) {
      console.error('❌ [SERVICE] Erreur lors de la recherche des commandes:', error);
      throw new Error(error.message || 'Impossible de rechercher les commandes');
    }
  }

  /**
   * 🎨 Formatte le prix pour l'affichage
   */
  formatPrice(price: string | number | null | undefined): string {
    if (!price) return '0,00 €';
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return isNaN(numPrice) ? '0,00 €' : `${numPrice.toFixed(2).replace('.', ',')} €`;
  }

  /**
   * 🎨 Formatte la date pour l'affichage
   */
  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  }

  /**
   * 🎨 Récupère la configuration du statut
   */
  getStatutConfig(statut: string): {
    color: string;
    bgColor: string;
    icon: string;
    text: string;
  } {
    const statusConfig = {
      'en_attente': {
        color: '#ffc107',
        bgColor: '#fff3cd',
        icon: 'fa-clock',
        text: 'En attente'
      },
      'en_cours': {
        color: '#17a2b8',
        bgColor: '#d1ecf1',
        icon: 'fa-cog',
        text: 'En cours'
      },
      'impression': {
        color: '#fd7e14',
        bgColor: '#ffeaa7',
        icon: 'fa-print',
        text: 'En impression'
      },
      'expedie': {
        color: '#20c997',
        bgColor: '#c3e6cb',
        icon: 'fa-shipping-fast',
        text: 'Expédié'
      },
      'termine': {
        color: '#28a745',
        bgColor: '#d4edda',
        icon: 'fa-check-circle',
        text: 'Terminé'
      },
      'annule': {
        color: '#dc3545',
        bgColor: '#f8d7da',
        icon: 'fa-times-circle',
        text: 'Annulé'
      }
    };
    
    return statusConfig[statut as keyof typeof statusConfig] || statusConfig.en_attente;
  }
}

export const commandeService = new CommandeService();
