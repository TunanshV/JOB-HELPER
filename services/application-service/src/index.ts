import express from 'express';

const app = express();
const port = Number(process.env.PORT ?? 4103);
app.use(express.json());

app.get('/health', (_request, response) => response.json({ status: 'ok', service: 'application-service' }));
app.get('/applications', (_request, response) => response.json({ applications: [] }));
app.post('/applications', (request, response) => response.status(201).json({ application: { ...request.body, status: 'draft' } }));

app.listen(port, () => console.log(`Application service listening on http://localhost:${port}`));
