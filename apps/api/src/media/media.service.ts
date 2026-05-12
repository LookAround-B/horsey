import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuid } from 'uuid';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime'];
const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_VIDEO_BYTES = 200 * 1024 * 1024; // 200 MB

@Injectable()
export class MediaService {
  private s3: S3Client;
  private bucket: string;
  private publicBaseUrl: string;

  constructor(private config: ConfigService) {
    this.bucket = this.config.get('R2_BUCKET', 'horsey-media');
    this.publicBaseUrl = this.config.get('R2_PUBLIC_URL', 'https://media.horsey.in');

    this.s3 = new S3Client({
      region: 'auto',
      endpoint: this.config.get('R2_ENDPOINT', 'https://r2.example.com'),
      credentials: {
        accessKeyId: this.config.get('R2_ACCESS_KEY_ID', 'dev'),
        secretAccessKey: this.config.get('R2_SECRET_ACCESS_KEY', 'dev'),
      },
    });
  }

  async getPresignedUploadUrl(params: {
    contentType: string;
    contentLength: number;
    folder: string; // 'listings' | 'kyc' | 'reviews'
  }) {
    const isImage = ALLOWED_IMAGE_TYPES.includes(params.contentType);
    const isVideo = ALLOWED_VIDEO_TYPES.includes(params.contentType);

    if (!isImage && !isVideo) {
      throw new BadRequestException('Unsupported file type');
    }

    const maxBytes = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
    if (params.contentLength > maxBytes) {
      throw new BadRequestException(
        `File too large. Max ${isVideo ? '200MB' : '10MB'}.`,
      );
    }

    const ext = params.contentType.split('/')[1].replace('quicktime', 'mov');
    const key = `${params.folder}/${uuid()}.${ext}`;
    const mediaType = isImage ? 'IMAGE' : 'VIDEO';

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: params.contentType,
      ContentLength: params.contentLength,
    });

    const presignedUrl = await getSignedUrl(this.s3, command, { expiresIn: 3600 });
    const publicUrl = `${this.publicBaseUrl}/${key}`;

    return { presignedUrl, publicUrl, key, mediaType };
  }
}
