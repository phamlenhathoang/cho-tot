import { Module } from '@nestjs/common';
import { CloudnaryService } from './cloudnary.service';
import { CloudnaryController } from './cloudnary.controller';
import { CloudinaryConfig } from '../auth/config/cloudinary-config';

@Module({
  controllers: [CloudnaryController],
  providers: [CloudnaryService, CloudinaryConfig],
  exports: [CloudnaryService]
})
export class CloudnaryModule {}
