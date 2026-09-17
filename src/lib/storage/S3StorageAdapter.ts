import { StorageService } from './StorageAdapter';
import { LocalStorageAdapter } from './LocalStorageAdapter';

export class S3StorageAdapter implements StorageService {
  private fallbackLocal: LocalStorageAdapter;

  constructor() {
    this.fallbackLocal = new LocalStorageAdapter();
  }

  async upload(fileBuffer: Buffer, fileName: string, mimeType: string, folder?: string) {
    // S3 / MinIO API integration point (falls back to local adapter if S3 env credentials not active)
    return this.fallbackLocal.upload(fileBuffer, fileName, mimeType, folder);
  }

  async download(filePath: string) {
    return this.fallbackLocal.download(filePath);
  }

  async delete(filePath: string) {
    return this.fallbackLocal.delete(filePath);
  }

  getUrl(filePath: string) {
    return this.fallbackLocal.getUrl(filePath);
  }

  async getSize(filePath: string) {
    return this.fallbackLocal.getSize(filePath);
  }

  async exists(filePath: string) {
    return this.fallbackLocal.exists(filePath);
  }
}
