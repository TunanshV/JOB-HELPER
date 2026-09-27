import express from 'express';
import multer from 'multer';

const app = express();
const port = Number(process.env.PORT ?? 4102);
const upload = multer({ limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (_request, file, callback) => callback(null, ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.mimetype)) });
app.use(express.json());

app.get('/health', (_request, response) => response.json({ status: 'ok', service: 'profile-service' }));
app.post('/resumes', upload.single('resume'), (request, response) => {
  if (!request.file) return response.status(400).json({ error: 'A PDF or DOCX resume is required.' });
  return response.status(201).json({ message: 'Resume received for review.', filename: request.file.originalname, size: request.file.size });
});

app.listen(port, () => console.log(`Profile service listening on http://localhost:${port}`));
