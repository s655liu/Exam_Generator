import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files - works both locally and on Vercel
app.use(express.static(path.join(__dirname)));

const client = new OpenAI({
    apiKey: process.env.QWEN_API_KEY,
    baseURL: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1'
});

// Endpoint to get courses
app.get('/api/courses', (req, res) => {
    try {
        // Define all course JSON files
        const courseFiles = [
            { name: 'CS', path: path.join(__dirname, 'data/CS_course_info.json') },
            { name: 'MATH', path: path.join(__dirname, 'data/MATH_course_info.json') },
            { name: 'STAT', path: path.join(__dirname, 'data/STAT_course_info.json') },
            { name: 'CO', path: path.join(__dirname, 'data/CO_course_info.json') }
        ];

        let allCourses = [];

        courseFiles.forEach(({ name, path: filePath }) => {
            if (fs.existsSync(filePath)) {
                try {
                    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                    if (data.courses) {
                        // Add department identifier to each course
                        const coursesWithDept = data.courses.map(course => ({
                            ...course,
                            department: name
                        }));
                        allCourses = allCourses.concat(coursesWithDept);
                    }
                    console.log(`Loaded ${data.courses?.length || 0} courses from ${name}`);
                } catch (fileError) {
                    console.error(`Error parsing ${name} course file:`, fileError.message);
                }
            } else {
                console.warn(`Course file not found: ${filePath}`);
            }
        });

        console.log(`Total courses loaded: ${allCourses.length}`);
        res.json({ courses: allCourses });
    } catch (error) {
        console.error('Error loading courses:', error);
        res.status(500).json({ error: 'Failed to read course info' });
    }
});

// Endpoint to get courses by department
app.get('/api/courses/:department', (req, res) => {
    const { department } = req.params;
    const departmentUpper = department.toUpperCase();

    try {
        const filePath = path.join(__dirname, `data/${departmentUpper}_course_info.json`);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: `Department ${departmentUpper} not found` });
        }

        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        res.json({ courses: data.courses || [] });
    } catch (error) {
        console.error(`Error loading ${department} courses:`, error);
        res.status(500).json({ error: 'Failed to read course info' });
    }
});

// Endpoint to generate exam
app.post('/api/generate', async (req, res) => {
    const { prompt } = req.body;
    console.log(`Exam generation requested for prompt (length: ${prompt?.length})`);

    if (!process.env.QWEN_API_KEY) {
        console.error('QWEN_API_KEY is missing from environment variables');
        return res.status(500).json({ error: 'Server configuration error: API key missing' });
    }

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    try {
        const completion = await client.chat.completions.create({
            model: "qwen-max",
            messages: [
                { role: "system", content: "You are an expert professor at the University of Waterloo, specializing in Computer Science, Mathematics, Statistics, and Combinatorics & Optimization. Your goal is to generate high-quality, rigorous exams and answer keys tailored to the specific course curriculum. Always separate the Exam and the Answer Key clearly with a unique separator line: '---ANSWER_KEY_START---'." },
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

// Catch-all route to serve index.html for client-side routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Only start server locally (not on Vercel)
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
}

export default app;

