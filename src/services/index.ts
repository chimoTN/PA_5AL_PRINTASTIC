// src/services/index.ts
export { authService } from './auth.service';
export { filesService } from './files.service';
export { materialsService } from './materials.service';
export { baseService } from './base.service';

// Export des types principaux
export type { AuthResponse, RegisterData } from './auth.service';
export type { 
  FileUploadResponse, 
  UserFile, 
  FilesResponse 
} from './files.service';
export type { 
  Material, 
  MaterialsResponse 
} from './materials.service';
export type { ApiResponse } from './base.service';