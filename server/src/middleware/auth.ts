import type { NextFunction, Request, Response } from 'express';
import { firebaseAuth } from '../firebase.js';
import { config } from '../config.js';

export type AuthenticatedRequest = Request & { userId?: string; userEmail?: string; isAdmin?: boolean };

export async function requireAuth(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  const auth = firebaseAuth();
  if (!auth) {
    response.status(503).json({ error: 'Server Firebase authentication is not configured. Add Firebase Admin SDK credentials to server/.env.' });
    return;
  }
  const header = request.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    response.status(401).json({ error: 'Missing Firebase ID token.' });
    return;
  }
  try {
    const token = await auth.verifyIdToken(header.slice(7));
    request.userId = token.uid;
    request.userEmail = token.email;
    request.isAdmin = token.admin === true || Boolean(token.email && config.adminEmails.includes(token.email.toLowerCase()));
    next();
  } catch {
    response.status(401).json({ error: 'Invalid Firebase ID token.' });
  }
}

export async function requireAdmin(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  await requireAuth(request, response, () => {
    if (!request.isAdmin) {
      response.status(403).json({ error: 'Administrator access is required.' });
      return;
    }
    next();
  });
}

export async function requireRegularUser(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  await requireAuth(request, response, () => {
    if (request.isAdmin) {
      response.status(403).json({ error: 'Resume features are available only to job seekers.' });
      return;
    }
    next();
  });
}
