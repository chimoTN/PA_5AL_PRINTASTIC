// src/utils/uploadTest.ts
import { filesClientService } from '../services/filesClient.service';

export const testUpload = async () => {
  console.log('🧪 === TEST UPLOAD FICHIER ===');
  
  try {
    // ✅ 1. Test de connexion au service
    console.log('🔗 Test de connexion au service...');
    const healthCheck = await fetch('https://projet3dback.onrender.com/api/modele3DClient/test/health', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    console.log('🔗 Health check response:', {
      status: healthCheck.status,
      ok: healthCheck.ok
    });
    
    if (!healthCheck.ok) {
      const errorData = await healthCheck.json().catch(() => ({}));
      console.error('❌ Health check failed:', errorData);
      return { success: false, step: 'health_check', error: errorData };
    }
    
    const healthData = await healthCheck.json();
    console.log('✅ Health check success:', healthData);
    
    // ✅ 2. Test de récupération des fichiers
    console.log('📋 Test de récupération des fichiers...');
    const filesResponse = await filesClientService.getFilesClient();
    
    console.log('📋 Files response:', {
      success: filesResponse.success,
      count: filesResponse.data?.length || 0
    });
    
    if (filesResponse.success) {
      console.log('✅ Récupération des fichiers réussie');
    } else {
      console.warn('⚠️ Récupération des fichiers échouée:', filesResponse.message);
    }
    
    // ✅ 3. Test de création d'un fichier factice (sans upload réel)
    console.log('📁 Test de création de fichier factice...');
    
    // Créer un fichier factice pour le test
    const testFile = new File(['test content'], 'test.stl', { type: 'application/octet-stream' });
    
    const uploadData = {
      fichier: testFile,
      materiauId: 1, // ID du premier matériau
      scaling: 100,
      description: 'Test upload automatique',
      pays: 'France',
      nomPersonnalise: 'Test Upload'
    };
    
    console.log('📦 Données de test:', {
      fileName: uploadData.fichier.name,
      fileSize: uploadData.fichier.size,
      materiauId: uploadData.materiauId,
      scaling: uploadData.scaling
    });
    
    // ✅ 4. Test d'upload (sera probablement rejeté mais on teste la connexion)
    console.log('📤 Test d\'upload...');
    const uploadResponse = await filesClientService.uploadFileClient(uploadData);
    
    console.log('📤 Upload response:', {
      success: uploadResponse.success,
      message: uploadResponse.message
    });
    
    if (uploadResponse.success) {
      console.log('✅ Upload réussi !');
    } else {
      console.log('⚠️ Upload échoué (attendu):', uploadResponse.message);
    }
    
    console.log('✅ Test d\'upload terminé');
    return { 
      success: true, 
      healthCheck: healthData,
      filesCount: filesResponse.data?.length || 0,
      uploadTest: uploadResponse
    };
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    return { success: false, step: 'error', error };
  }
};

// ✅ Test automatique au chargement
if (typeof window !== 'undefined') {
  // Seulement côté client
  setTimeout(() => {
    console.log('🧪 Test d\'upload automatique...');
    testUpload();
  }, 2000);
} 