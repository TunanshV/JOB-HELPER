# CareerFlow

CareerFlow is a focused job board with two roles:

- Job seekers sign in with Google, browse admin-published roles, upload their resume, and follow original application links.
- The owner signs in through the Administrator login with Firebase Email/Password authentication and publishes job opportunities.

The web app uses Next.js, the API uses Express and TypeScript, authentication uses Firebase, and job/resume data is stored in MongoDB Atlas.

## Responsible integration boundary

This project does not scrape LinkedIn, run an opportunity agent, or auto-submit applications. Administrators manually publish verified job listings. The application workflow is designed to prepare answers and require an explicit user confirmation before submission.

## Quick start

1. Install Node.js 20+.
2. Copy `client/.env.example` to `client/.env` and add Firebase Web App values.
3. Copy `server/.env.example` to `server/.env` and add MongoDB Atlas and Firebase Admin values. Never commit these files.
4. Run `npm run install:all`.
5. Run `npm run dev`.
6. Open `http://localhost:3000` in your browser.

The client and server run as two processes. Firebase and MongoDB must be configured for real authentication, job posting, job listing, and resume persistence.

## Firebase authentication

In Firebase Console, create a Web App, enable Google and Email/Password under Authentication providers, and add `localhost` under authorized domains. Copy the Web App config into `client/.env` using the `NEXT_PUBLIC_FIREBASE_*` names. For server token verification, create a Firebase Admin service account and place its project ID, client email, and private key in `server/.env`. Restart the dev server after changing environment files.

The login screen has two paths: job seekers select **Job seeker** and use Google; the owner selects **Administrator** and uses the Firebase Email/Password account. Create the owner account in Firebase Authentication and set its email in `ADMIN_EMAILS` and `NEXT_PUBLIC_ADMIN_EMAILS`. The password is verified by Firebase and is never stored in this repository.

The default owner email in the environment templates is `tunanshvatsa@gmail.com`. Change it if you use another administrator account.

## Admin job posting

Add the administrator's email to `ADMIN_EMAILS` in `server/.env` and `NEXT_PUBLIC_ADMIN_EMAILS` in `client/.env`. After signing in through the Administrator login, the owner sees the Admin panel. The form publishes role, company, experience, location, employment type, skills, requirements, description, and application URL through `POST /api/admin/jobs`. Published jobs are returned by `GET /api/jobs` to signed-in users.

Jobs are stored in MongoDB when `MONGODB_URI` is configured. Without it, the server uses temporary in-memory storage and jobs disappear when the server restarts.

## Resume upload

Signed-in job seekers can use **Update resume** to select a PDF or DOCX file up to 5 MB. The latest resume is stored per user in MongoDB through `POST /api/resumes`. The upload is authenticated with the user's Firebase ID token. Administrator accounts are explicitly blocked from this endpoint, and administrators cannot view or manage user resumes.

## Environment files

Client values belong in `client/.env`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
NEXT_PUBLIC_ADMIN_EMAILS=tunanshvatsa@gmail.com
```

Server values belong in `server/.env`:

```env
PORT=4000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/<database>
MONGODB_DNS_SERVERS=192.168.1.1
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
CLIENT_ORIGIN=http://localhost:3000
ADMIN_EMAILS=tunanshvatsa@gmail.com
```

`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY` come from a Firebase Admin SDK service-account key. Do not put those values in the client. These server credentials are required for the API to verify every signed-in Firebase user, including regular users uploading resumes.

## Project structure

- `client`: Next.js App Router frontend, Firebase client adapter.
- `server`: Express API, Firebase authorization, admin job posting, resume upload, and MongoDB persistence.
- `.env.example` files: configuration templates without secrets.

## Local ports

- Next.js web: `3000`
- Express API: `4000`

## Useful commands

```powershell
npm run install:all
npm run dev
npm run typecheck
npm run build
```

## MongoDB troubleshooting

If Node reports `querySrv ECONNREFUSED _mongodb._tcp...`, the Atlas credentials may be valid while the local DNS resolver is refusing SRV lookups. Set `MONGODB_DNS_SERVERS` to a DNS server that works on your network, verify MongoDB Atlas Network Access allows your IP, and restart the API. The server logs `Connected to MongoDB Atlas.` when the connection succeeds.

## Before pushing to GitHub

The repository ignores local environment files and generated content. Before pushing, verify that these files are not staged:

```powershell
git status --short
git check-ignore -v client/.env server/.env client/node_modules client/.next
```

Safe files to commit include source code, `README.md`, `package.json`, lockfiles, and `.env.example` templates. Never commit `client/.env`, `server/.env`, Firebase service-account JSON files, private keys, passwords, MongoDB credentials, or uploaded resume files.

If a secret was accidentally staged, remove it from Git's index before pushing:

```powershell
git rm --cached client/.env server/.env
```

If a real secret was already pushed, rotate it in Firebase, MongoDB Atlas, or the relevant provider immediately. Adding it to `.gitignore` does not remove it from Git history.

## Current limitations

- Admin job edit, archive, and delete controls are not implemented yet.
- Applications currently open the original external URL; the app does not auto-submit forms.
- Resume files are stored as binary data in MongoDB. Object storage such as Firebase Storage is a future production improvement.
- Add rate limits, audit logs, deletion controls, and automated tests before production use.
