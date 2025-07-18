// src/services/index.ts
export { authService } from './auth.service';
export { materialsService } from './materials.service';
export { baseService } from './base.service';

// Export des types principaux
export type { AuthUser } from './base.service';

export type { 
  Material,
  CreateMaterialData,
  UpdateMaterialData
} from './materials.service';

export { filesClientService } from './filesClient.service';
export type { FileClientUploadResponse } from './filesClient.service';


export type { ApiResponse } from './base.service';