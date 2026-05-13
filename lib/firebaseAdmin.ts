import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

let adminDb: any = null;
let adminStorage: any = null;

// Initialize Firebase Admin SDK (only on server)
if (typeof window === 'undefined') {
  try {
    const apps = getApps();
    let admin;

    if (apps.length === 0) {
      // Only initialize if all required env vars are present
      if (
        process.env.FIREBASE_ADMIN_PROJECT_ID &&
        process.env.FIREBASE_CLIENT_EMAIL &&
        process.env.FIREBASE_PRIVATE_KEY
      ) {
        admin = initializeApp({
          credential: cert({
            projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          }),
          storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        });

        adminDb = getFirestore(admin);
        adminStorage = getStorage(admin);
      }
    } else {
      admin = apps[0];
      adminDb = getFirestore(admin);
      adminStorage = getStorage(admin);
    }
  } catch (error) {
    console.error('[v0] Error initializing Firebase Admin:', error);
  }
}

export { adminDb, adminStorage };
