import { initializeApp, cert, getApps } from 'firebase-admin/app';
import * as path from 'path';

const serviceAccount = require(
  path.join(process.cwd(), 'src/common/serviceAccountKey.json'),
);

export const firebaseApp =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp({
        credential: cert(serviceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      });