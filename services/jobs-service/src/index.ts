import 'dotenv/config';
import dns from 'node:dns';
import express from 'express';
import mongoose, { Schema } from 'mongoose';

const app = express();
const port = Number(process.env.PORT ?? 4101);
const mongoUri = process.env.MONGODB_URI ?? '';
app.use(express.json());

type Job = { id: string; role: string; company: string; experience: string; location: string; employmentType: string; skills: string[]; description: string; requirements: string[]; applicationUrl: string; postedBy: string; postedAt: string };
const jobs: Job[] = [];
const jobSchema = new Schema<Job>({ id: { type: String, required: true, unique: true }, role: { type: String, required: true }, company: { type: String, required: true }, experience: { type: String, required: true }, location: { type: String, required: true }, employmentType: { type: String, required: true }, skills: [String], description: { type: String, required: true }, requirements: [String], applicationUrl: { type: String, required: true }, postedBy: { type: String, required: true }, postedAt: { type: String, required: true } });
const JobModel = mongoose.model<Job>('Job', jobSchema);

app.get('/health', (_request, response) => response.json({ status: 'ok', service: 'jobs-service' }));
app.get('/jobs', async (_request, response) => response.json({ jobs: mongoUri ? await JobModel.find().sort({ postedAt: -1 }).lean() : jobs }));
app.post('/admin/jobs', async (request, response) => {
  const body = request.body as Partial<Job>;
  const required = ['role', 'company', 'experience', 'location', 'employmentType', 'description', 'applicationUrl'];
  if (required.some((field) => !String(body[field as keyof Job] ?? '').trim())) {
    response.status(400).json({ error: 'Role, company, experience, location, employment type, description, and application URL are required.' });
    return;
  }
  const job: Job = { id: crypto.randomUUID(), role: String(body.role).trim(), company: String(body.company).trim(), experience: String(body.experience).trim(), location: String(body.location).trim(), employmentType: String(body.employmentType).trim(), skills: Array.isArray(body.skills) ? body.skills.map(String).map((skill) => skill.trim()).filter(Boolean) : [], description: String(body.description).trim(), requirements: Array.isArray(body.requirements) ? body.requirements.map(String).map((item) => item.trim()).filter(Boolean) : [], applicationUrl: String(body.applicationUrl).trim(), postedBy: request.header('x-admin-user-id') ?? 'admin', postedAt: new Date().toISOString() };
  if (mongoUri) await JobModel.create(job);
  else jobs.unshift(job);
  response.status(201).json({ job });
});

async function start() {
  if (mongoUri) {
    const dnsServers = process.env.MONGODB_DNS_SERVERS?.split(',').map((server) => server.trim()).filter(Boolean);
    if (dnsServers?.length) dns.setServers(dnsServers);
    await mongoose.connect(mongoUri);
    console.log('Jobs service connected to MongoDB Atlas.');
  } else {
    console.warn('MONGODB_URI is not configured; admin jobs use in-memory storage.');
  }
  app.listen(port, () => console.log(`Jobs service listening on http://localhost:${port}`));
}

start().catch((error: unknown) => { console.error('Jobs service startup failed.', error); process.exit(1); });
