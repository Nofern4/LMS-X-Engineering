export interface StorageService {
  upload(fileBuffer: Buffer, fileName: string, mimeType: string, folder?: string): Promise<{
    filePath: string;
    fileSize: number;
    mimeType: string;
  }>;
  download(filePath: string): Promise<Buffer>;
  delete(filePath: string): Promise<boolean>;
  getUrl(filePath: string): string;
  getSize(filePath: string): Promise<number>;
  exists(filePath: string): Promise<boolean>;
}
