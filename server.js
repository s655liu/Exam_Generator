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
app.use(express.static('.'));

const client = new OpenAI({
    apiKey: process.env.QWEN_API_KEY,
    baseURL: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1'
});

// Endpoint to get courses
app.get('/api/courses', (req, res) => {
    try {
        const files = [
            path.join(__dirname, 'data/CS_course_info.json'),
            path.join(__dirname, 'data/MATH_course_info.json'),
            path.join(__dirname, 'data/STAT_course_info.json')
        ];
        let allCourses = [];
        
        files.forEach(filePath => {
            if (fs.existsSync(filePath)) {
                const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                if (data.courses) {
                    allCourses = allCourses.concat(data.courses);
                }
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
                { role: "system", content: "You are an expert professor at the University of Waterloo, specializing in Computer Science, Mathematics, and Statistics. Your goal is to generate high-quality, rigorous exams and answer keys tailored to the specific course curriculum. Always separate the Exam and the Answer Key clearly with a unique separator line: '---ANSWER_KEY_START---'." },
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

if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
}

export default app;

