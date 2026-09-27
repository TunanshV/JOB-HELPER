# CareerFlow

CareerFlow is a focused job board: administrators publish roles and authenticated users browse them and follow the original application link. The web app uses Next.js with one Express API and MongoDB Atlas.

## Responsible integration boundary

This project does not scrape LinkedIn, run an opportunity agent, or auto-submit applications. Administrators manually publish verified job listings. The application workflow is designed to prepare answers and require an explicit user confirmation before submission.

## Quick start

1. Install Node.js 20+.
2. Copy `client/.env.example` to `client/.env.local` and add Firebase web-app values.
3. Copy `server/.env.example` to `server/.env` and add a MongoDB Atlas URI plus Firebase Admin credentials. Never commit these files.
4. Run `npm run install:all`.
5. Run `npm run dev`.
6. Open `http://localhost:3000` in your browser.

The dashboard works with mock data before credentials are configured. Once Firebase is configured, the client can send ID tokens to the API. MongoDB credentials can be assigned per service as data ownership is implemented.

## Firebase Google sign-in

In Firebase Console, create a Web App, enable Google under Authentication providers, and add `localhost` under authorized domains. Copy the web configuration values into `client/.env.local` using the `NEXT_PUBLIC_FIREBASE_*` names. For server verification, create a Firebase service account and place its project ID, client email, and private key in `server/.env`. Restart the dev server after changing environment files.

## Admin job posting

Add the administrator's email to `ADMIN_EMAILS` in `server/.env` and `NEXT_PUBLIC_ADMIN_EMAILS` in `client/.env.local`. After signing in with that Firebase Google account, the user sees the Admin panel. The form publishes role, company, experience, location, employment type, skills, requirements, description, and application URL through `POST /api/admin/jobs`. Published jobs are returned by `GET /api/jobs` to signed-in users.

## Project structure

- `client`: Next.js App Router frontend, Firebase client adapter.
- `server`: Express API, Firebase authorization, admin job posting, and MongoDB persistence.
- `.env.example` files: configuration templates without secrets.

## Local ports

- Next.js web: `3000`
- Express API: `4000`

## Next implementation steps

1. Add Firebase Authentication providers in the Firebase console and set `ADMIN_EMAILS` for administrator accounts.
2. Persist admin-posted jobs in MongoDB instead of the current service-local store.
3. Add job edit, archive, and delete controls for administrators.
4. Add a review screen that maps saved answers to provider-specific application questions.
5. Add rate limits, audit logs, encrypted secret handling, deletion controls, and tests before production use.
