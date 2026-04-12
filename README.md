# 🎓 Waterloo Exam Generator

An AI-powered application designed to generate mock exams for University of Waterloo courses across **Computer Science**, **Mathematics** (Pure and Applied), **Statistics**, and **Combinatorics & Optimization**.

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18 or higher)
- A DashScope API Key (Qwen-Max)

### 2. Installation
```bash
git clone https://github.com/s655liu/Exam_Generator.git
cd "Exam_Generator"
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory:
```env
QWEN_API_KEY=your_api_key_here
```

### 4. Running Locally
```bash
npm run dev
```
The application will be available at `http://localhost:3000`.

## 📂 Project Structure

- `public/`: The frontend distribution directory.
  - `index.html`, `models.html`, `help.html`: Modular page views.
  - `scripts/`: Frontend logic (`main.js`, `sidebar.js`, `prompts.js`).
  - `styles/`: UI styling (`style.css`).
  - `images/`: High-quality assets (logos, background).
- `api/`: The backend server architecture.
  - `index.js`: Consolidated Express backend.
  - `data/`: Course information JSON databases (CS, MATH, AMATH, PMATH, STAT, CO).
- `package.json`: Project dependencies and scripts.
- `vercel.json`: Deployment configuration.

## 🛠️ Technology Stack
- **Frontend**: Vanilla HTML/JS + CSS (Glassmorphism).
- **Backend**: Node.js + Express (deployed as a Vercel Function).
- **AI**: Qwen-Max (Alibaba Cloud DashScope).

## 📝 Usage
1. Select your **Subject** (CS, Math, etc.) from the dropdown.
2. Search for your **Course Code** in the searchable input.
3. Select the **Topics** you want to test.
4. Choose the **Exam Type** (Midterm/Final).
5. Click **Generate Exam**!
6. Use **Print to PDF** to save your exam and answer key.
