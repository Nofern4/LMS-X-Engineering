import { StorageService } from './StorageAdapter';
import { LocalStorageAdapter } from './LocalStorageAdapter';
import { S3StorageAdapter } from './S3StorageAdapter';

let storageInstance: StorageService | null = null;

export function getStorageService(): StorageService {
  if (!storageInstance) {
    const storageType = process.env.STORAGE_TYPE || 'local';
    if (storageType === 's3') {
      storageInstance = new S3StorageAdapter();
    } else {
      storageInstance = new LocalStorageAdapter(process.env.STORAGE_LOCAL_DIR || './uploads');
    }
  }
  return storageInstance;
}
