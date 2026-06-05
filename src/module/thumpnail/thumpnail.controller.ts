import { Controller, Post, Put, Query, Req, UploadedFile, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { ThumpnailService } from './thumpnail.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../auth/config/multer.config';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';

@Controller('thumpnail')
export class ThumpnailController {
  constructor(private readonly thumpnailService: ThumpnailService) { }

  @Post('images')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('files', 10, multerConfig))
  async uploadMultipleImages(
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: any,
  ) {
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    const imageUrls = files.map(file => {
      return `${baseUrl}/uploads/${file.filename}`;
    });

    // return await this.thumpnailService.saveImages(imageUrls);
  }


  @Put('images')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
    @Query('id') id: number
  ) {
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    const imageUrls = `${baseUrl}/uploads/${file.filename}`;

    return this.thumpnailService.update(id, imageUrls)
  }
}
