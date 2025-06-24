export interface Produit {
  id: number;
  nom: string;
  description: string;
  categorie: string;
  prix: number;
  popularite: number;
  utilisateurId: number;
  fichier3dId: number | null;
  imageUrl: string;
  modelUrl: string;
  dateCreation: string;
}
