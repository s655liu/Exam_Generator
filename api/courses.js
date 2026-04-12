import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function handler(req, res) {
    try {
        const courseFiles = [
            { name: 'CS', path: path.join(__dirname, 'data/CS_course_info.json') },
            { name: 'MATH', path: path.join(__dirname, 'data/MATH_course_info.json') },
            { name: 'STAT', path: path.join(__dirname, 'data/STAT_course_info.json') },
            { name: 'CO', path: path.join(__dirname, 'data/CO_course_info.json') },
            { name: 'AMATH', path: path.join(__dirname, 'data/AMATH_course_info.json') },
            { name: 'PMATH', path: path.join(__dirname, 'data/PMATH_course_info.json') }
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
            }
        });

        res.status(200).json({ courses: allCourses });
    } catch (error) {
        console.error('Error loading courses:', error);
        res.status(500).json({ error: 'Failed to read course info' });
    }
}
