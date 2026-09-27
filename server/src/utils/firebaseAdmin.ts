import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { config } from '../config.js';

let firebaseAdminApp: App | null = null;

export function getFirebaseAdminApp(): App | null {
  if (!config.firebase.projectId || !config.firebase.clientEmail || !config.firebase.privateKey) return null;
  firebaseAdminApp = getApps()[0] ?? firebaseAdminApp ?? initializeApp({
    credential: cert({
      projectId: config.firebase.projectId,
      clientEmail: config.firebase.clientEmail,
      privateKey: config.firebase.privateKey,
    }),
  });
  return firebaseAdminApp;
}

export function getFirebaseAdminAuth(): Auth | null {
  const app = getFirebaseAdminApp();
  return app ? getAuth(app) : null;
}