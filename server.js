import express from 'express';
import cors from 'cors';
import coursesHandler from './api/courses.js';
import generateHandler from './api/generate.js';
import healthHandler from './api/health.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Local routes mapping to API handlers
app.get('/api/courses', coursesHandler);
app.post('/api/generate', generateHandler);
app.get('/api/health', healthHandler);

// Catch-all to serve index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`Local dev server running at http://localhost:${port}`);
});
