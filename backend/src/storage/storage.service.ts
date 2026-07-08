import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  BlobSASPermissions,
  BlobServiceClient,
  ContainerClient,
} from '@azure/storage-blob';
import { randomUUID } from 'crypto';

@Injectable()
export class StorageService {
  private readonly containerClient: ContainerClient;

  constructor(private readonly configService: ConfigService) {
    const connectionString = this.configService.getOrThrow<string>(
      'AZURE_STORAGE_CONNECTION_STRING',
    );
    const containerName = this.configService.getOrThrow<string>(
      'AZURE_STORAGE_CONTAINER',
    );
    const blobServiceClient =
      BlobServiceClient.fromConnectionString(connectionString);
    this.containerClient = blobServiceClient.getContainerClient(containerName);
  }

  async upload(
    buffer: Buffer,
    originalName: string,
    contentType: string,
  ): Promise<string> {
    const extension = originalName.includes('.')
      ? originalName.slice(originalName.lastIndexOf('.'))
      : '';
    const blobName = `${randomUUID()}${extension}`;
    const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(buffer, {
      blobHTTPHeaders: { blobContentType: contentType },
    });

    return blockBlobClient.url;
  }

  async delete(blobName: string): Promise<void> {
    await this.containerClient.getBlockBlobClient(blobName).deleteIfExists();
  }

  getUrl(blobName: string): string {
    return this.containerClient.getBlockBlobClient(blobName).url;
  }

  async getSignedUrl(
    blobName: string,
    expiresInMinutes = 15,
  ): Promise<string> {
    const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
    return blockBlobClient.generateSasUrl({
      permissions: BlobSASPermissions.parse('r'),
      expiresOn: new Date(Date.now() + expiresInMinutes * 60 * 1000),
    });
  }
}
