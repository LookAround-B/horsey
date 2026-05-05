import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MediaService } from './media.service';

@Controller('media')
@UseGuards(JwtAuthGuard)
export class MediaController {
  constructor(private mediaService: MediaService) {}

  @Post('presign')
  getPresignedUrl(
    @Body() body: { contentType: string; contentLength: number; folder: string },
  ) {
    return this.mediaService.getPresignedUploadUrl(body);
  }
}
