# 🎓 Waterloo CS Exam Generator

An AI-powered application designed to generate mock Computer Science exams for University of Waterloo courses. It leverages GPT models to create realistic exam questions and answer keys based on specific course curricula.

![Premium Design Mockup](https://raw.githubusercontent.com/s655liu/Exam_Generator/main/screenshot.png) *(Note: Placeholder for actual screenshot)*

## ✨ Features

- **Dynamic Course Selection**: Choose from a wide range of Waterloo CS courses.
- **AI-Generated Content**: High-quality, context-aware exam questions.
- **Answer Key Generation**: Automatically generates detailed solutions for every exam.
- **Modern UI**: A sleek, responsive interface built with HTML, CSS, and Vanilla JavaScript.
- **Express Backend**: Securely handles API requests and data processing.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16.0.0 or higher)
- Qwen API Key

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
   Create a `.env` file in the root directory and add your Qwen API key:
   ```env
   QWEN_API_KEY=your_api_key_here
   ```

4. **Run the application:**
   ```bash
   npm start
   ```
   The server will start, and you can view the application at `http://localhost:3000` (or the port specified in `server.js`).

## 🛠️ Tech Stack

- **Frontend**: HTML5, Vanilla CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **AI Integration**: OpenAI API
- **Data**: JSON-based course information

## 📂 Project Structure

- `index.html`: Main entry point for the frontend.
- `style.css`: Custom styling for a premium look and feel.
- `main.js`: Frontend logic and API interaction.
- `server.js`: Express server and backend routes.
- `course_info.json`: Database of available CS courses.
- `prompts.js`: Optimized AI prompt templates.

## 🚀 Deployment

### Deploying to Vercel

1. **Push to GitHub**: Ensure your latest changes are pushed to your repository.
2. **Import Project**: Go to [Vercel](https://vercel.com), click **Add New > Project**, and import this repository.
3. **Configure Environment Variables**: In the Vercel dashboard, go to your project settings and add:
   - `QWEN_API_KEY`: Your DashScope/Qwen API key.
4. **Deploy**: Click **Deploy**. Vercel will automatically detect the `vercel.json` and set up the serverless functions and static hosting.

---

Built with ❤️ for Waterloo CS Students.
