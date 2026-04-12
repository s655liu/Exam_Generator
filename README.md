# 🎓 Waterloo Exam Generator (CS, Math, Stat)

An AI-powered application designed to generate mock exams for University of Waterloo courses across Computer Science, Mathematics, and Statistics. It leverages high-performance AI models (Qwen-Max) to create realistic, rigorous exam questions and detailed answer keys.

![Premium Design Mockup](https://raw.githubusercontent.com/s655liu/Exam_Generator/main/screenshot.png) *(Note: Placeholder for actual screenshot)*

## ✨ Features

- **Multi-Department Support**: Support for courses in Computer Science, Mathematics, and Statistics.
- **Dynamic Filtering**: Quickly find courses by subject or code using advanced UI filters.
- **AI-Generated Content**: Context-aware questions that reflect the specific rigor of Waterloo's curriculum.
- **Answer Key Generation**: Detailed solutions provided for every mock exam.
- **Premium UI**: A sleek, high-end interface built with glassmorphism and modern aesthetics.
- **Optimized Prompts**: Tailored instruction sets for different subject areas and course levels.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- Qwen API Key (Alibaba Cloud DashScope)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/s655liu/Exam_Generator.git
   cd Exam_Generator
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env` file in the root directory:
   ```env
   QWEN_API_KEY=your_api_key_here
   ```

4. **Run the application:**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`.

## 🛠️ Tech Stack

- **Frontend**: HTML5, Vanilla CSS3, JavaScript (ES6+), Marked.js (Markdown rendering)
- **Backend**: Node.js, Express.js
- **AI Models**: Qwen-Max (OpenAI compatible API)
- **Data**: JSON-based course catalogs for CS, MATH, and STAT departments.

## 📂 Project Structure

- `data/`: Contains JSON catalogs for CS, MATH, and STAT courses.
- `index.html`: Main frontend application.
- `style.css`: Premium aesthetics and responsive layout.
- `main.js`: Core frontend logic and API orchestration.
- `server.js`: Node.js server handling course merging and AI requests.
- `prompts.js`: Template engine for generating academically precise AI prompts.

---

Built with ❤️ for University of Waterloo Students.

## 🚀 Deployment

### Deploying to Vercel

1. **Push to GitHub**: Ensure your latest changes are pushed to your repository.
2. **Import Project**: Go to [Vercel](https://vercel.com), click **Add New > Project**, and import this repository.
3. **Configure Environment Variables**: In the Vercel dashboard, go to your project settings and add:
   - `QWEN_API_KEY`: Your DashScope/Qwen API key.
4. **Deploy**: Click **Deploy**. Vercel will automatically detect the `vercel.json` and set up the serverless functions and static hosting.

---

Built with ❤️ for Waterloo CS Students.
