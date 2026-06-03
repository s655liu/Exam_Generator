# Waterloo Exam Generator — GEMINI.md

## Project Overview

An AI-powered mock exam generator for University of Waterloo courses. Users select a subject department, search for a specific course by code, pick topics, choose a difficulty and exam type, then the app generates a full exam paper and a separate answer key — both rendered in the browser using Markdown and KaTeX.

**Live URL**: Deployed on Vercel  
**Local Dev**: `run.bat` or `npm run dev` → `http://localhost:3000`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML + CSS (Glassmorphism dark theme) |
| Frontend JS | Vanilla ES Modules (`type="module"`) |
| Math Rendering | KaTeX (via CDN, auto-render) |
| Markdown Rendering | Marked.js (via CDN) |
| Charts | Chart.js (via CDN, for STAT course graphs) |
| Backend | Python + FastAPI (Uvicorn local runner) |
| AI | Qwen-Max via Alibaba Cloud DashScope (OpenAI-compatible Python SDK) |
| Deployment | Vercel (serverless function via `api/index.py`) |
| Fonts | Google Fonts: Outfit + Inter |

---

## Project Structure

```
CS Exam Generator/
├── api/
│   ├── index.py                   # FastAPI server + all API routes
│   ├── prompt_builder.py          # Backend prompt building logic
│   ├── skills/                    # Subject-specific prompt customizers
│   │   ├── base.py                # BaseSubjectSkill base class
│   │   ├── registry.py            # get_skill(subject) -> skill instance
│   │   ├── math/                  # Math-related subjects
│   │   │   ├── __init__.py
│   │   │   ├── math.py            # MATH course rules
│   │   │   ├── amath.py           # AMATH course rules
│   │   │   ├── pmath.py           # PMATH course rules
│   │   │   ├── stat.py            # STAT course rules
│   │   │   └── co.py              # CO course rules
│   │   └── cs/                    # CS-related subjects
│   │       ├── __init__.py
│   │       └── cs.py              # CS course rules
│   └── data/
│       ├── CS_course_info.json    # Computer Science courses
│       ├── MATH_course_info.json  # Mathematics courses
│       ├── STAT_course_info.json  # Statistics courses
│       ├── CO_course_info.json    # Combinatorics & Optimization
│       ├── AMATH_course_info.json # Applied Mathematics
│       └── PMATH_course_info.json # Pure Mathematics
├── public/
│   ├── index.html                 # Main dashboard (exam generator)
│   ├── models.html                # AI Models info page
│   ├── help.html                  # Help/FAQ page
│   ├── scripts/
│   │   ├── main.js                # Core frontend logic (ES module)
│   │   ├── prompts.js             # Local prompts (fallback reference)
│   │   └── sidebar.js             # Sidebar active-state & nav
│   ├── styles/
│   │   └── style.css              # All styles (glassmorphism dark theme)
│   └── images/
│       └── uwaterloo-logo.jpg     # UW logo used in sidebar
├── package.json                   # scripts: npm run dev
├── requirements.txt               # pip dependencies (fastapi, uvicorn, openai, python-dotenv)
├── run.bat                        # One-click Windows batch script launcher
├── vercel.json                    # Vercel routing config
├── .env                           # QWEN_API_KEY (never committed)
└── .gitignore
```

---

## API Endpoints

### `GET /api/courses`
Returns all courses from all department JSON files that have `"has_exam": true`.  
Adds a `department` field (e.g. `"CS"`, `"MATH"`) to each course object.

**Response shape:**
```json
{
  "courses": [
    {
      "code": "CS 240",
      "name": "Data Structures and Data Management",
      "department": "CS",
      "has_exam": true,
      "topics": ["Priority Queues: ...", "Sorting: ...", ...],
      "has_coding": true,
      "has_proofs": true,
      "proof_types": ["algorithm_correctness", "complexity_analysis"],
      "question_types": ["multiple_choice", "short_answer", "proof", "coding"],
      "primary_languages": ["C++"],
      "exam_format": ["final", "midterm"]
    }
  ]
}
```

### `POST /api/generate`
Sends a prompt configuration to Qwen-Max and returns the generated content.
Allows both raw prompt submissions or structured configs routed through the backend prompt builder.

**Body (Config-based - Recommended):**
```json
{
  "config": {
    "courseCode": "MATH 135",
    "topics": ["Proof techniques: ..."],
    "isFinal": false,
    "difficulty": "medium",
    "primaryLanguages": [],
    "hasProofs": true,
    "hasCoding": false
  },
  "mode": "exam"
}
```
*Note: Set `mode: "key"` and pass `config: { "examContent": "..." }` to generate the answer key.*

**Body (Raw prompt fallback):**
```json
{
  "prompt": "Raw prompt string..."
}
```

**Response:**
```json
{
  "content": "Generated markdown text..."
}
```

### `GET /api/health`
Returns `{ "status": "ok", "timestamp": "..." }`.

---

## Course Data Schema (`api/data/*.json`)

Each JSON file follows this structure:

```json
{
  "university": "University of Waterloo",
  "calendar_year": "2023-2024",
  "department": "David R. Cheriton School of Computer Science",
  "courses": [
    {
      "code": "CS 135",
      "name": "Designing Functional Programs",
      "has_exam": true,
      "exam_format": ["final", "midterm"],
      "topics": [
        "Functional Programming: referential transparency, ...",
        "Design Recipes: data definitions, ..."
      ],
      "has_coding": true,
      "has_proofs": true,
      "proof_types": ["structural_induction", "program_correctness"],
      "question_types": ["multiple_choice", "short_answer", "proof", "coding"],
      "primary_languages": ["Racket"]
    }
  ]
}
```

**Key fields for prompt generation:**
- `topics`: Full detailed strings with sub-topics after the colon. Display shows only the part **before** the `:` (e.g., `"Functional Programming"`) but the full string is passed to the LLM.
- `has_coding` / `has_proofs`: Drive whether coding/proof question sections appear in the prompt.
- `primary_languages`: Determines which language to use in coding questions (defaults to `"Python"` if absent).
- `has_exam: false`: Courses filtered out entirely (e.g., CS 136L which is lab-only).

---

## Backend Architecture & Skills

To support high-fidelity and subject-oriented generation, the backend employs a **Subject Skill Registry** located in `api/skills/`.

*   **`BaseSubjectSkill`** (`base.py`): The base interface.
*   **`registry.py`**: Resolves the correct skill based on the course code subject prefix (e.g. `MATH` -> `MathSkill`).
*   **Subject Skills**: Custom prompt parameters and rules:
    *   `math.py`: Formulates rigorous proof requirements and variables.
    *   `amath.py`: Emphasizes mathematical modeling, physical constants, and boundary values.
    *   `pmath.py`: Enforces abstract definitions (groups, manifolds) and counterexamples.
    *   `stat.py`: Demands probability distribution modeling and forces the model to output **Chart.js** JSON config inside ` ```chart ` code blocks for visual questions.
    *   `co.py`: Directs focus to graph/optimization algorithms and combinatorial arguments.
    *   `cs.py`: Directs language matching (e.g., C++ for CS 240/246) and complexity constraints.

---

## Frontend Architecture (`public/scripts/`)

### `main.js` (ES Module)

The main controller. Responsibilities:
1. **`init()`** — fetches `/api/courses`, filters to `has_exam: true`, calls `applyFilters()`.
2. **`applyFilters(shouldShow)`** — filters `allCourses` by `currentSubject` (department) + search term, calls `renderCourseList()`.
3. **`selectCourse(course)`** — locks in the selected course, calls `renderTopics()`, enables generate button.
4. **`renderTopics(topics)`** — creates checkboxes; displays only the category part (before `:`), but stores full detailed topic as the checkbox `value`.
5. **Generate flow** (on button click):
   - Reads selected topics, `examType`, `difficulty`, and course metadata.
   - Triggers `POST /api/generate` with `{ config, mode: 'exam' }`.
   - Renders exam with `marked.parse()` → calls `renderMathContent()` + `renderCharts()`.
   - Shows results section, then fires a **second** `POST /api/generate` with `{ config: { examContent }, mode: 'key' }` for the answer key.
6. **`renderMathContent(container)`** — calls `renderMathInElement()` (KaTeX auto-render) with `$...$` and `$$...$$` delimiters.
7. **`renderCharts(container)`** — looks for ` ```chart ` code blocks, parses JSON config, creates `Chart.js` canvas elements.

**State variables:**
- `allCourses` — full list from API
- `currentCourse` — selected course object
- `currentSubject` — department filter (`'all'` | `'CS'` | `'MATH'` etc.)
- `lastSelectedCode` — used to detect when user is typing vs has selected

---

## Styling (`public/styles/style.css`)

Dark glassmorphism theme with sharp corners (`border-radius` styled between `4px` and `8px` for a premium rectangular dashboard). Key design tokens:
- `--primary: #00a3ff` (bright blue)
- `--accent: #7b2fff` (purple)
- `--bg-dark: #0a0e1a` (near-black)
- `--glass: rgba(255,255,255,0.05)` + `backdrop-filter: blur()`
- Font: `Outfit` (headings/UI) + `Inter` (body)

---

## Deployment (Vercel)

`vercel.json` rewrites:
- `/api/*` → `api/index.py` (Vercel serverless function using Python runtime)
- `/*` (non-API) → `public/$1` (static assets)

Vercel handles static routing directly. Dependencies in `requirements.txt` are installed automatically during Vercel's build stage.

---

## Environment Variables

| Variable | Where set | Description |
|---|---|---|
| `QWEN_API_KEY` | `.env` (local) / Vercel env | DashScope API key for Qwen-Max |
| `PORT` | optional | Defaults to `3000` locally |

---

## Common Development Tasks

### Add a new department
1. Create `api/data/DEPT_course_info.json` following the course schema above.
2. Add `{"name": "DEPT", "filename": "DEPT_course_info.json"}` to the `course_files` array in `api/index.py`.
3. Add `<option value="DEPT">Department Name (DEPT)</option>` to the `#subject-select` dropdown in `public/index.html`.

### Add a new course
Add a new entry to the relevant `api/data/*.json` file following the course schema. Set `has_exam: true` and provide `topics`, `has_coding`, `has_proofs`, `question_types`.

### Modify exam prompt structure
Edit `api/prompt_builder.py` → `build_backend_exam_prompt()`.

### Change AI model or parameters
In `api/index.py` → `client.chat.completions.create()`, change `model` or `temperature`.

---

## Known Patterns & Gotchas

- **Python Runtime**: Backend is built entirely in Python using FastAPI. Local development launcher `run.bat` ensures `pip install` runs automatically.
- **Two-step generation**: The exam and answer key are generated in two separate API calls. The answer key call fires *after* the exam is displayed (users can see the exam while the key is loading).
- **Topic display vs value**: Topics show only `topic.split(':')[0]` in the UI, but the full `topic` string (including detail after `:`) is sent to the LLM for richer context.
- **`has_exam: false` courses**: Filtered out in `init()` — they won't appear in the search dropdown.
- **KaTeX auto-render timing**: `renderMathContent()` must be called *after* `marked.parse()` injects HTML into the DOM, not before.
- **Chart.js blocks**: The LLM is prompted to use ` ```chart ``` ` code blocks with a valid Chart.js config JSON. `renderCharts()` in `main.js` parses and instantiates them.
- **Enriched/Advanced courses**: The prompt builder instructs the LLM to reflect increased theoretical depth for courses labelled "Enriched" or "Advanced Level".
- **Vercel static routing**: The catch-all rewrite `/((?!api/).*)` → `/public/$1` means all static assets must live under `public/`. Do not serve static files from the root.
