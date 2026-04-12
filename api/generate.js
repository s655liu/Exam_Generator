import { OpenAI } from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const client = new OpenAI({
    apiKey: process.env.QWEN_API_KEY,
    baseURL: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1'
});

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { prompt } = req.body;

    if (!process.env.QWEN_API_KEY) {
        return res.status(500).json({ error: 'Server configuration error: API key missing' });
    }

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    try {
        const completion = await client.chat.completions.create({
            model: "qwen-max",
            messages: [
                { role: "system", content: "You are an expert professor at the University of Waterloo, specializing in Computer Science, Mathematics (Pure and Applied), Statistics, and Combinatorics & Optimization. Your goal is to generate high-quality, rigorous exams and answer keys tailored to the specific course curriculum. Always separate the Exam and the Answer Key clearly with a unique separator line: '---ANSWER_KEY_START---'." },
                { role: "user", content: prompt }
            ],
            temperature: 0.7,
        });

        res.status(200).json({ content: completion.choices[0].message.content });
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: 'Failed to generate exam', details: error.message });
    }
}
