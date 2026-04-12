import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Global Error Handlers to prevent silent crashes
process.on('uncaughtException', (err) => {
    console.error('❌ UNCAUGHT EXCEPTION:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ UNHANDLED REJECTION at:', promise, 'reason:', reason);
});

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Only serve static files in local development (not on Vercel)
if (!process.env.VERCEL) {
    app.use(express.static(path.join(__dirname, '..', 'public')));
}

// Initialize OpenAI client for Qwen-Max
const client = new OpenAI({
    apiKey: process.env.QWEN_API_KEY,
    baseURL: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1'
});

// ==================== API ENDPOINTS ====================

// Endpoint to get all courses
app.get('/api/courses', (req, res) => {
    try {
        const courseFiles = [
            { name: 'CS', path: path.join(__dirname, 'data', 'CS_course_info.json') },
            { name: 'MATH', path: path.join(__dirname, 'data', 'MATH_course_info.json') },
            { name: 'STAT', path: path.join(__dirname, 'data', 'STAT_course_info.json') },
            { name: 'CO', path: path.join(__dirname, 'data', 'CO_course_info.json') },
            { name: 'AMATH', path: path.join(__dirname, 'data', 'AMATH_course_info.json') },
            { name: 'PMATH', path: path.join(__dirname, 'data', 'PMATH_course_info.json') }
        ];

        let allCourses = [];

        courseFiles.forEach(({ name, path: filePath }) => {
            if (fs.existsSync(filePath)) {
                try {
                    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                    if (data.courses) {
                        const coursesWithDept = data.courses.map(course => ({
                            ...course,
                            department: name
                        }));
                        allCourses = allCourses.concat(coursesWithDept);
                    }
                } catch (fileError) {
                    console.error(`Error parsing ${name} course file:`, fileError.message);
                }
            } else {
                console.warn(`Course file not found: ${filePath}`);
            }
        });

        res.json({ courses: allCourses });
    } catch (error) {
        console.error('Error loading courses:', error);
        res.status(500).json({ error: 'Failed to read course info' });
    }
});

// Endpoint to generate exam
app.post('/api/generate', async (req, res) => {
    const { prompt } = req.body;

    // Check for API key
    if (!process.env.QWEN_API_KEY) {
        console.error('QWEN_API_KEY is missing');
        return res.status(500).json({ error: 'Server configuration error: API key missing' });
    }

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    try {
        const completion = await client.chat.completions.create({
            model: "qwen-max",
            messages: [
                {
                    role: "system",
                    content: "You are an expert professor at the University of Waterloo, specializing in Computer Science, Mathematics (Pure and Applied), Statistics, and Combinatorics & Optimization. Your goal is to generate high-quality, rigorous exams and answer keys tailored to the specific course curriculum. Always separate the Exam and the Answer Key clearly with a unique separator line: '---ANSWER_KEY_START---'."
                },
                { role: "user", content: prompt }
            ],
            temperature: 0.7,
        });

        res.json({ content: completion.choices[0].message.content });
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: 'Failed to generate exam', details: error.message });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ==================== STATIC FILE SERVING ====================
// Only for local development - Vercel handles this automatically
if (!process.env.VERCEL) {
    // Catch-all route to handle clean navigation for multi-page refactor
    app.get(/.*/, (req, res) => {
        const url = req.url.toLowerCase();
        if (url.includes('models')) {
            res.sendFile(path.join(__dirname, '..', 'public', 'models.html'));
        } else if (url.includes('help')) {
            res.sendFile(path.join(__dirname, '..', 'public', 'help.html'));
        } else {
            res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
        }
    });

    // Start server
    const server = app.listen(port, () => {
        console.log(`✅ Server running at http://localhost:${port}`);
        console.log(`📝 API endpoint: http://localhost:${port}/api`);
    });

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error(`❌ Port ${port} is already in use. Please kill the process or use a different port.`);
        } else {
            console.error('❌ Server startup error:', err);
        }
        process.exit(1);
    });
}

// Export for Vercel serverless function
export default app;