import { Router } from 'express';
import multer from 'multer';
import { config } from './config.js';
import { requireAdmin, requireAuth, requireRegularUser, type AuthenticatedRequest } from './middleware/auth.js';
import { Job, type JobDocument } from './models/Job.js';
import { Resume, type ResumeDocument } from './models/Resume.js';

const router = Router();
const memoryJobs: JobDocument[] = [];
const memoryResumes: ResumeDocument[] = [];
const resumeUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_request, file, callback) => callback(null, ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.mimetype)),
});

router.get('/health', (_request, response) => response.json({ status: 'ok', service: 'careerflow-api' }));
router.get('/jobs', requireAuth, async (_request, response) => {
  const jobs = config.mongoUri ? await Job.find().sort({ postedAt: -1 }).lean() : memoryJobs;
  response.json({ jobs });
});
router.post('/admin/jobs', requireAdmin, async (request: AuthenticatedRequest, response) => {
  const body = request.body as Partial<JobDocument>;
  const required = ['role', 'company', 'experience', 'location', 'employmentType', 'description', 'applicationUrl'];
  if (required.some((field) => !String(body[field as keyof JobDocument] ?? '').trim())) {
    response.status(400).json({ error: 'Role, company, experience, location, employment type, description, and application URL are required.' });
    return;
  }
  const job: JobDocument = {
    id: crypto.randomUUID(), role: String(body.role).trim(), company: String(body.company).trim(), experience: String(body.experience).trim(), location: String(body.location).trim(), employmentType: String(body.employmentType).trim(),
    skills: Array.isArray(body.skills) ? body.skills.map(String).map((item) => item.trim()).filter(Boolean) : [], description: String(body.description).trim(), requirements: Array.isArray(body.requirements) ? body.requirements.map(String).map((item) => item.trim()).filter(Boolean) : [], applicationUrl: String(body.applicationUrl).trim(), postedBy: request.userId ?? 'admin', postedAt: new Date().toISOString(),
  };
  if (config.mongoUri) await Job.create(job);
  else memoryJobs.unshift(job);
  response.status(201).json({ job });
});
router.post('/resumes', requireRegularUser, resumeUpload.single('resume'), async (request: AuthenticatedRequest, response) => {
  if (!request.file) {
    response.status(400).json({ error: 'Choose a PDF or DOCX resume up to 5 MB.' });
    return;
  }
  const resume: ResumeDocument = { userId: request.userId ?? '', filename: request.file.originalname, mimeType: request.file.mimetype, size: request.file.size, content: request.file.buffer, uploadedAt: new Date() };
  if (config.mongoUri) {
    await Resume.findOneAndReplace({ userId: resume.userId }, resume, { upsert: true, new: true });
  } else {
    const existingIndex = memoryResumes.findIndex((item) => item.userId === resume.userId);
    if (existingIndex >= 0) memoryResumes[existingIndex] = resume;
    else memoryResumes.push(resume);
  }
  response.status(201).json({ filename: resume.filename, size: resume.size, uploadedAt: resume.uploadedAt });
});
router.get('/applications', requireAuth, async (_request, response) => {
  response.json({ applications: [] });
});
router.post('/applications', requireAuth, async (request, response) => {
  response.status(201).json({ application: { ...request.body, status: 'draft' } });
});

export default router;
