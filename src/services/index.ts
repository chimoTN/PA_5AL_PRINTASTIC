// src/services/index.ts
export { authService } from './auth.service';
export { materialsService } from './materials.service';
export { baseService } from './base.service';

// Export des types principaux
export type { AuthResponse, RegisterData } from './auth.service';

export type { 
  Material, 
  MaterialsResponse 
} from './materials.service';

export type {
  Modele3DClient,
  FileClientUploadResponse, // ✅ Type principal pour l'upload
  Modele3DClientListResponse,
  SingleModele3DClientResponse,
  FileClientActionResponse,
  UpdateFileClientVerificationData
} from './filesClient.service';



export type { ApiResponse } from './base.service';