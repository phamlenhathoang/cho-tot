import { Injectable } from '@nestjs/common';
import { getStorage } from 'firebase-admin/storage';
import { firebaseApp } from 'src/module/auth/config/firebase-config';

@Injectable()
export class FirebaseService {
  async uploadImage(file: Express.Multer.File) {
    const bucket = getStorage(firebaseApp).bucket();

    const fileName = `images/${Date.now()}-${file.originalname}`;

    const fileUpload = bucket.file(fileName);

    await fileUpload.save(file.buffer, {
      metadata: {
        contentType: file.mimetype,
      },
    });

    await fileUpload.makePublic();

    return {
      url: fileUpload.publicUrl(),
    };
  }
}