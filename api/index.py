import os
import sys
import json
from datetime import datetime
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from openai import OpenAI
from dotenv import load_dotenv

# Ensure local imports are resolved correctly
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import prompt builder
from prompt_builder import build_backend_exam_prompt, build_backend_answer_key_prompt

# Load environment variables
load_dotenv()

app = FastAPI(title="Waterloo Exam Generator API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize OpenAI client
api_key = os.getenv("QWEN_API_KEY")
client = None
if api_key:
    client = OpenAI(
        api_key=api_key,
        base_url="https://dashscope-intl.aliyuncs.com/compatible-mode/v1"
    )

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(CURRENT_DIR, "data")

@app.get("/api/courses")
async def get_courses():
    try:
        course_files = [
            {"name": "CS", "filename": "CS_course_info.json"},
            {"name": "MATH", "filename": "MATH_course_info.json"},
            {"name": "STAT", "filename": "STAT_course_info.json"},
            {"name": "CO", "filename": "CO_course_info.json"},
            {"name": "AMATH", "filename": "AMATH_course_info.json"},
            {"name": "PMATH", "filename": "PMATH_course_info.json"}
        ]
        
        all_courses = []
        for file_info in course_files:
            file_path = os.path.join(DATA_DIR, file_info["filename"])
            if os.path.exists(file_path):
                try:
                    with open(file_path, "r", encoding="utf-8") as f:
                        data = json.load(f)
                        if "courses" in data:
                            for course in data["courses"]:
                                course["department"] = file_info["name"]
                                all_courses.append(course)
                except Exception as file_error:
                    print(f"Error parsing {file_info['name']} course file: {file_error}")
            else:
                print(f"Course file not found: {file_path}")
                
        return {"courses": all_courses}
    except Exception as error:
        print(f"Error loading courses: {error}")
        raise HTTPException(status_code=500, detail="Failed to read course info")

@app.post("/api/generate")
async def generate_exam(request: Request):
    global client
    current_key = os.getenv("QWEN_API_KEY")
    if not current_key:
        raise HTTPException(status_code=500, detail="Server configuration error: API key missing")
        
    if client is None:
        client = OpenAI(
            api_key=current_key,
            base_url="https://dashscope-intl.aliyuncs.com/compatible-mode/v1"
        )
        
    try:
        body = await request.json()
        prompt = body.get("prompt")
        config = body.get("config")
        mode = body.get("mode")
        
        final_prompt = prompt
        if config:
            if mode == "key":
                final_prompt = build_backend_answer_key_prompt(config.get("examContent", ""))
            else:
                final_prompt = build_backend_exam_prompt(config)
                
        if not final_prompt:
            raise HTTPException(status_code=400, detail="Prompt or config is required")
            
        completion = client.chat.completions.create(
            model="qwen-max",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert professor at the University of Waterloo. You are operating in a multi-step academic production workflow. Generate ONLY the specific content requested in the prompt. Do NOT add extra sections, answer keys, or separators like '---ANSWER_KEY_START---' unless explicitly told to in the user's prompt."
                },
                {"role": "user", "content": final_prompt}
            ],
            temperature=0.7
        )
        
        return {"content": completion.choices[0].message.content}
    except Exception as error:
        print(f"API Error: {error}")
        raise HTTPException(status_code=500, detail=f"Failed to generate exam: {str(error)}")

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}

# Serve static files locally (fallback)
# Vercel handles static routing directly using vercel.json rewrites, so this is only for local dev.
PUBLIC_DIR = os.path.join(os.path.dirname(CURRENT_DIR), "public")
if os.path.exists(PUBLIC_DIR) and not os.environ.get("VERCEL"):
    app.mount("/", StaticFiles(directory=PUBLIC_DIR, html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 3000))
    print(f"Starting server on http://localhost:{port}")
    uvicorn.run("index:app", host="0.0.0.0", port=port, reload=True)
