import { Body, Controller, Post, Put, Query, Req, UploadedFile, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { ThumpnailService } from './thumpnail.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../auth/config/multer.config';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { memoryStorage } from 'multer';


@Controller('thumpnail')
export class ThumpnailController {
  constructor(private readonly thumpnailService: ThumpnailService) { }

  @Post('images')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        postId: {
          type: 'number',
          example: 1,
        },
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
      required: ['postId', 'files'],
    },
  })
  @UseInterceptors(FilesInterceptor('files', 10, {storage: memoryStorage()}))
  async uploadMultipleImages(
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: any,
    @Body('postId') postId: string, // ✅ FIX HERE
  ) {
    return await this.thumpnailService.saveImages(Number(postId), files);
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
  @UseInterceptors(FileInterceptor('file', {storage: memoryStorage()}))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
    @Query('id') id: number
  ) {

    return this.thumpnailService.update(id, file)
  }
}
