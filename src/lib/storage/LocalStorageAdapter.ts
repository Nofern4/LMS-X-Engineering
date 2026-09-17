import fs from 'fs';
import path from 'path';
import { StorageService } from './StorageAdapter';

export class LocalStorageAdapter implements StorageService {
  private baseDir: string;

  constructor(baseDir: string = './uploads') {
    this.baseDir = path.resolve(baseDir);
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  async upload(fileBuffer: Buffer, fileName: string, mimeType: string, folder: string = 'materials'): Promise<{
    filePath: string;
    fileSize: number;
    mimeType: string;
  }> {
    const targetFolder = path.join(this.baseDir, folder);
    if (!fs.existsSync(targetFolder)) {
      fs.mkdirSync(targetFolder, { recursive: true });
    }

    const uniqueFileName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const fullPath = path.join(targetFolder, uniqueFileName);

    await fs.promises.writeFile(fullPath, fileBuffer);
    const relativePath = path.join(folder, uniqueFileName).replace(/\\/g, '/');

    return {
      filePath: relativePath,
      fileSize: fileBuffer.length,
      mimeType,
    };
  }

  async download(filePath: string): Promise<Buffer> {
    const fullPath = path.join(this.baseDir, filePath);
    return await fs.promises.readFile(fullPath);
  }

  async delete(filePath: string): Promise<boolean> {
    try {
      const fullPath = path.join(this.baseDir, filePath);
      if (fs.existsSync(fullPath)) {
        await fs.promises.unlink(fullPath);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Failed to delete file:', e);
      return false;
    }
  }

  getUrl(filePath: string): string {
    return `/api/materials/file?path=${encodeURIComponent(filePath)}`;
  }

  async getSize(filePath: string): Promise<number> {
    const fullPath = path.join(this.baseDir, filePath);
    const stats = await fs.promises.stat(fullPath);
    return stats.size;
  }

  async exists(filePath: string): Promise<boolean> {
    const fullPath = path.join(this.baseDir, filePath);
    return fs.existsSync(fullPath);
  }
}
