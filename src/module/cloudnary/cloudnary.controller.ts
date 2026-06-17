import { Controller, Post, UploadedFile, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { CloudnaryService } from './cloudnary.service';
import { ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';

@Controller('cloudnary')
export class CloudnaryController {
  constructor(private readonly cloudnaryService: CloudnaryService) { }

  @Post()
  @ApiOperation({ summary: 'Upload image to cloudinary' })
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
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.cloudnaryService.uploadImage(file);
  }

  @Post()
  @ApiOperation({ summary: 'Upload images to Cloudinary' })
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
  @UseInterceptors(FilesInterceptor('files'))
  uploadImages(
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.cloudnaryService.uploadImages(files);
  }
}
