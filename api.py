﻿﻿﻿import os
import io
import re
import json
import logging
import sqlite3
from datetime import datetime
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Annotated, Optional, List
import google.generativeai as genai
try:
    from openai import OpenAI
except ImportError:
    OpenAI = None
from dotenv import load_dotenv
from passlib.context import CryptContext

# Manage different environments
APP_ENV = os.getenv("APP_ENV", "development")
env_file = f".env.{APP_ENV}"
if os.path.exists(env_file):
    load_dotenv(env_file)
load_dotenv()  # Fallback to standard .env if specific env file doesn't exist

app = FastAPI(title='NexusHUB API')
logger = logging.getLogger(__name__)

# SQLite Setup
DB_PATH = "healthmate_history.db"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def init_db():
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT,
                type TEXT,
                message TEXT,
                detail TEXT
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE,
                password_hash TEXT
            )
        """)
        conn.commit()
init_db()

if not os.environ.get('GEMINI_API_KEY') and not os.environ.get('OPENAI_API_KEY'):
    logging.warning(f"No API keys found in {APP_ENV} environment.")

logging.basicConfig(level=logging.INFO)

app.add_middleware(
    CORSMiddleware,
    # If allow_credentials is True, allow_origins cannot be ['*'].
    # For local development, specify the exact origins where your frontend runs.
    # Common origins for local development servers:
    # - http://127.0.0.1:5500 (VS Code Live Server)
    # - http://localhost:5500 (VS Code Live Server)
    # - http://localhost:8000 (If frontend is served by Uvicorn itself, which is not the case here)
    allow_origins=[
        "http://127.0.0.1:5500", # Common for VS Code Live Server
        "http://localhost:5500",
        "http://localhost:5173", # Default Vite Port
        "http://127.0.0.1:5173", # Default Vite Port
    ],
    allow_credentials=False, 
    allow_methods=['*'],
    allow_headers=['*'],
)

EMERGENCY_PATTERNS = [
    re.compile(rf'\b{re.escape(keyword)}\b', re.IGNORECASE)
    for keyword in [
        'chest pain',
        'shortness of breath',
        'breathless',
        'stroke',
        'slurred speech',
        'severe headache',
        'unconscious',
        'fainting',
        'bleeding',
        'difficulty breathing',
        'sudden weakness',
        'seizure',
        'poison',
        'choking',
        'allergic reaction',
    ]
]

MODEL_NAME = 'gpt-4o-mini'
MAX_OUTPUT_TOKENS = 450
SYSTEM_PROMPT = (
    'You are an educational medical assistant. Do not diagnose, do not prescribe, and do not provide a final medical opinion. '
    'Provide a structured educational summary with general conclusions based on symptoms. Always include a referral to a doctor. '
    'Tone: Professional, empathetic, and cautious. If a report is uploaded, explain the vitals and findings clearly.'
)

class AuthRequest(BaseModel):
    username: str
    password: str

class ResetRequest(BaseModel):
    username: str
    new_password: str

class TextRequest(BaseModel):
    text: str
    language: str = "English"

class AnalysisResponse(BaseModel):
    emergency: bool
    message: str
    detail: str | None = None
    symptoms: Optional[List[str]] = None
    specialist: Optional[str] = None # Added specialist field

@app.post('/register')
async def register(request: AuthRequest):
    try:
        with sqlite3.connect(DB_PATH) as conn:
            hashed = pwd_context.hash(request.password)
            conn.execute(
                "INSERT INTO users (username, password_hash) VALUES (?, ?)", 
                (request.username, hashed)
            )
            conn.commit()
        return {"username": request.username}
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Username already exists")

@app.post('/login')
async def login(request: AuthRequest):
    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.execute("SELECT * FROM users WHERE username = ?", (request.username,))
        user = cursor.fetchone()
        if user and pwd_context.verify(request.password, user['password_hash']):
            return {"username": user['username']}
    raise HTTPException(status_code=401, detail="Invalid username or password")

@app.post('/reset-password') # Changed to ResetRequest
async def reset_password(request: ResetRequest):
    try:
        with sqlite3.connect(DB_PATH) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.execute("SELECT * FROM users WHERE username = ?", (request.username,))
            user = cursor.fetchone()
            if not user:
                raise HTTPException(status_code=404, detail="User not found")
            
            hashed = pwd_context.hash(request.new_password) # Use new_password from ResetRequest
            conn.execute("UPDATE users SET password_hash = ? WHERE username = ?", (hashed, request.username))
            conn.commit()
        return {"message": "Password updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def detects_emergency(text: str) -> bool:
    return any(pattern.search(text) for pattern in EMERGENCY_PATTERNS)

SYMPTOMS_LIBRARY = {
    'cough': 'Cough', 'cold': 'Cold', 'fever': 'Fever', 'headache': 'Headache',
    'nausea': 'Nausea', 'fatigue': 'Fatigue', 'sore throat': 'Sore Throat',
    'appetite': 'Loss of Appetite', 'rash': 'Skin Rash', 'dizzy': 'Dizziness',
    'abdominal pain': 'Abdominal Pain', 'muscle aches': 'Muscle Aches',
    'joint pain': 'Joint Pain', 'back pain': 'Back Pain', 'insomnia': 'Insomnia',
    'anxiety': 'Anxiety', 'heartburn': 'Heartburn', 'bloating': 'Bloating',
    'chest pain': 'Chest Pain', 'shortness of breath': 'Shortness of Breath',
    'blurred vision': 'Blurred Vision', 'frequent urination': 'Frequent Urination',
    'persistent thirst': 'Persistent Thirst', 'night sweats': 'Night Sweats',
    'chills': 'Chills', 'constipation': 'Constipation', 'diarrhea': 'Diarrhea',
    'palpitations': 'Palpitations', 'numbness': 'Numbness', 'earache': 'Earache',
    'sneezing': 'Sneezing', 'runny nose': 'Runny Nose',
    'weight loss': 'Weight Loss',
    'drowsiness': 'Drowsiness'
}

def extract_symptoms_from_text(text: str) -> list[str]:
    symptoms = []
    lower_text = text.lower()
    # Pattern to detect negation words occurring within ~30 chars before the keyword
    negation_pattern = re.compile(r'\b(no|not|none|denies|denied|without|negative for)\b')
    
    for keyword, label in SYMPTOMS_LIBRARY.items():
        # Use regex to find the keyword as a whole word
        keyword_match = re.search(rf'\b{re.escape(keyword)}\b', lower_text)
        if keyword_match:
            # Check the prefix (up to 30 characters) for negation terms
            start_idx = keyword_match.start()
            prefix = lower_text[max(0, start_idx - 30):start_idx]
            if not negation_pattern.search(prefix):
                symptoms.append(label)
    return symptoms


def extract_field(text: str, labels: list[str]) -> str | None:
    pattern = re.compile(rf'^(?:{"|".join(re.escape(label) for label in labels)})\s*[:\-]\s*(.+)$', re.IGNORECASE | re.MULTILINE)
    match = pattern.search(text)
    return match.group(1).strip() if match else None


def extract_vitals(text: str) -> list[str]:
    keys = [
        'blood pressure',
        'heart rate',
        'temperature',
        'respiratory rate',
        'glucose',
        'cholesterol',
        'hemoglobin',
        'white blood cell count',
    ]
    vitals = []
    for key in keys:
        pattern = re.compile(rf'({re.escape(key)})\s*[:\-]?\s*([^\n\r]+)', re.IGNORECASE)
        match = pattern.search(text)
        if match:
            vitals.append(f'{match.group(1).strip().title()}: {match.group(2).strip()}')
    return vitals


def summarize_text_report(text: str) -> str:
    patient_name = extract_field(text, ['Patient Name', 'Name'])
    patient_id = extract_field(text, ['Patient ID', 'ID'])
    impression = extract_field(text, ['Impression', 'Diagnosis', 'Assessment'])
    recommendation = extract_field(text, ['Recommended Action', 'Recommendations', 'Plan'])
    vitals = extract_vitals(text)

    lines = [
        'This educational assistant summary is based on the uploaded report content.',
    ]
    if patient_name:
        lines.append(f'Patient: {patient_name}')
    if patient_id:
        lines.append(f'Patient ID: {patient_id}')
    if vitals:
        lines.append('Key values: ' + '; '.join(vitals[:5]))
    if impression:
        lines.append(f'Report impression: {impression}')
    if recommendation:
        lines.append(f'Suggested action: {recommendation}')

    lines.append(
        'This is not medical advice. Share the report with a licensed healthcare professional for an official evaluation.'
    )
    return '\n'.join(lines)

def clean_ai_json(text: str) -> str:
    """Removes markdown formatting from AI responses to ensure valid JSON parsing."""
    text = text.strip()
    if text.startswith("```"):
        # Remove opening block like ```json
        text = re.sub(r'^```[a-z]*\n?', '', text)
        # Remove closing block ```
        text = re.sub(r'\n?```$', '', text)
    return text.strip()

def call_ai_model(user_text: str, language: str = "English") -> dict:
    openai_key = os.environ.get('OPENAI_API_KEY') # Ensure this is correctly fetched
    gemini_key = os.environ.get('GEMINI_API_KEY') # Ensure this is correctly fetched

    # Construct the prompt to explicitly ask for JSON output
    full_prompt = (
        f"{SYSTEM_PROMPT}\n\n"
        f"User query: {user_text}\n\n"
        f"Respond in {language}. Your response MUST be a JSON object with the following structure:\n"
        "{\n"
        '  "message": "Your educational summary here.",\n'
        '  "symptoms": ["Symptom 1", "Symptom 2"],\n'
        '  "specialist": "Recommended Specialist (e.g., General Physician, Cardiologist)"\n'
        "}"
    )

    ai_response_text = ""
    if openai_key and OpenAI: # Prioritize OpenAI if key is available
        try:
            logger.info("Using OpenAI API for text analysis.")
            detected_symptoms = extract_symptoms_from_text(user_text)
            client = OpenAI(api_key=openai_key)
            response = client.chat.completions.create(
                model="gpt-4o-mini", # Use a compatible OpenAI model
                messages=[
                    {'role': 'system', 'content': SYSTEM_PROMPT},
                    {'role': 'user', 'content': user_text},
                ],
                max_tokens=MAX_OUTPUT_TOKENS,
                response_format={"type": "json_object"} # Request JSON output
            )
            ai_response_text = response.choices[0].message.content.strip()
        except Exception as exc:
            logger.error(f"OpenAI call failed: {exc}")
            # Fallback to Gemini if OpenAI fails

    if not ai_response_text and gemini_key: # Use Gemini if OpenAI didn't provide a response or failed
        try:
            logger.info("Using Gemini API for text analysis.")
            genai.configure(api_key=gemini_key)
            model = genai.GenerativeModel('gemini-1.5-flash')
            # For Gemini, we might need to instruct it to output JSON more explicitly in the prompt
            gemini_prompt = (
                f"{SYSTEM_PROMPT}\n\n"
                f"User query: {user_text}\n\n"
                f"Respond in {language}. Your response MUST be a JSON object with 'message', 'symptoms', and 'specialist' fields."
            )
            response = model.generate_content(gemini_prompt)
            ai_response_text = response.text.strip()
        except Exception as exc:
            logger.error(f"Gemini text call failed: {exc}")

    # Attempt to parse the AI response as JSON
    try:
        cleaned_text = clean_ai_json(ai_response_text)
        parsed_response = json.loads(cleaned_text)
        message = parsed_response.get("message", "Could not generate a detailed educational summary.")
        symptoms = parsed_response.get("symptoms", [])
        specialist = parsed_response.get("specialist", "General Physician")
    except json.JSONDecodeError:
        # Fallback if AI doesn't return valid JSON
        logger.warning(f"AI response was not valid JSON. Raw response: {ai_response_text}")
        message = ai_response_text if ai_response_text else "The AI was unable to generate a structured response. Please try again or rephrase your query."
        symptoms = extract_symptoms_from_text(user_text) # Basic symptom extraction
        specialist = "General Physician" # Default specialist

    return {"message": message, "symptoms": symptoms, "specialist": specialist}


def call_gemini_vision(image_bytes: bytes, mime_type: str) -> str:
    """Uses Gemini 1.5 Flash to extract text and vitals from image data."""
    api_key = os.environ.get('GEMINI_API_KEY')
    if not api_key:
        return 'Gemini API key not found. Please set GEMINI_API_KEY in your environment.'

    try:
        from PIL import Image

        genai.configure(api_key=api_key)
        # Use gemini-1.5-flash for fast, multimodal vision processing
        model = genai.GenerativeModel('gemini-1.5-flash')

        prompt = (
            f"{SYSTEM_PROMPT}\n\n"
            "Analyze this medical document carefully. "
            "1. Extract the Patient Name if visible.\n"
            "2. Identify and list all Vitals (e.g., Blood Pressure, Heart Rate, Temperature, Glucose).\n"
            "3. Summarize the clinical Impression or Assessment section.\n"
            "Provide the summary in a clear, educational, and professional tone."
        )

        # Handle multimodal content based on mime type, more robustly
        if mime_type.startswith('image/'):
            try:
                content = Image.open(io.BytesIO(image_bytes))
            except Exception as e:
                logger.error(f"PIL failed to open image: {e}")
                content = {'mime_type': mime_type, 'data': image_bytes}
        elif mime_type == 'application/pdf':
            # Gemini 1.5 Flash can directly process PDF bytes
            content = {'mime_type': mime_type, 'data': image_bytes}
        else:
            # Fallback for other unsupported types
            logger.warning(f"Unsupported MIME type passed to Gemini Vision: {mime_type}")
            content = {'mime_type': mime_type, 'data': image_bytes}

        response = model.generate_content([prompt, content])
        
        if response.candidates and response.candidates[0].content.parts:
            return response.text.strip()
        return "The AI was unable to generate a summary. This can happen if the document content is unclear or triggers safety filters."
    except Exception as exc:
        return f"Gemini Vision analysis failed: {exc}"

def save_to_db(msg_type: str, message: str, detail: str = ""):
    try:
        with sqlite3.connect(DB_PATH) as conn:
            conn.execute(
                "INSERT INTO history (timestamp, type, message, detail) VALUES (?, ?, ?, ?)",
                (datetime.now().strftime("%Y-%m-%d %H:%M:%S"), msg_type, message, detail)
            )
            conn.commit()
    except Exception as e:
        logger.error(f"DB Error: {e}")

@app.post('/analyze-text', response_model=AnalysisResponse)
async def analyze_text(request: TextRequest): # Changed to TextRequest
    if detects_emergency(request.text):
        save_to_db("Emergency", "Emergency red flag detected.", request.text)
        return AnalysisResponse(
            emergency=True,
            message='Emergency red flag detected. Seek immediate medical care.',
            detail='This text contains urgent symptoms and should bypass the AI summary.',
            symptoms=extract_symptoms_from_text(request.text),
            specialist="Emergency Services"
        )

    ai_response = call_ai_model(request.text, request.language)
    analysis = ai_response["message"]
    symptoms = ai_response["symptoms"]
    specialist = ai_response["specialist"]
    save_to_db("Text Analysis", analysis, request.text)
    return AnalysisResponse(emergency=False, message=analysis, symptoms=symptoms, specialist=specialist)


@app.post('/analyze-file', response_model=AnalysisResponse)
async def analyze_file(file: UploadFile = File(...)):
    filename = file.filename or 'uploaded file'
    content_type = file.content_type or ''
    lower_name = filename.lower()

    symptoms = []
    specialist = "General Physician"
    if 'pdf' in content_type or lower_name.endswith('.pdf'):
        pdf_data = await file.read()
        message = call_gemini_vision(pdf_data, 'application/pdf')
        symptoms = extract_symptoms_from_text(message)
        detail = f'PDF "{filename}" processed via Gemini Vision. Multimodal analysis applied to document content.'
    elif content_type.startswith('image/') or lower_name.endswith(('.jpg', '.jpeg', '.png', '.bmp', '.gif')):
        image_data = await file.read()
        mime = content_type if content_type.startswith('image/') else 'image/jpeg'
        message = call_gemini_vision(image_data, mime)
        symptoms = extract_symptoms_from_text(message)
        detail = f'Image "{filename}" processed via Gemini Vision. Vitals and impressions extracted for educational review.'
    elif 'text' in content_type or lower_name.endswith('.txt'):
        raw = await file.read()
        try:
            content = raw.decode('utf-8')
        except UnicodeDecodeError:
            content = raw.decode('latin-1', errors='replace')
        message = summarize_text_report(content)
        symptoms = extract_symptoms_from_text(content)
        detail = 'Text report parsed and summarized. This is educational only and not a substitute for a doctor.'
    else:
        raise HTTPException(status_code=400, detail='Unsupported file type. Please upload an image, PDF, or text report.')

    save_to_db(f"File: {filename}", message, detail)
    return AnalysisResponse(emergency=False, message=message, detail=detail, symptoms=symptoms, specialist=specialist)

@app.get('/history')
async def get_history():
    try:
        with sqlite3.connect(DB_PATH) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.execute("SELECT * FROM history ORDER BY id DESC LIMIT 20")
            rows = cursor.fetchall()
            return [dict(row) for row in rows]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get('/')
async def root():
    return {
        'message': 'NexusHUB API is running.',
        'routes': ['/analyze-text', '/analyze-file', '/health', '/register', '/login'],
    }


@app.get('/health')
async def health_check():
    return {'status': 'ok', 'mode': 'safe-backend'}
