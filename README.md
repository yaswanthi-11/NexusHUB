# NexusHUB

A static prototype built inside the `AI/` folder to demonstrate a safety-first medical assistant interface.

## What it includes

- Emergency keyword detection before any AI-style analysis.
- Permanent disclaimer and referral-first output tone.
- Multilingual answer adaptation for English, Hindi, and Telugu.
- File upload preview for medical report images and PDF guidance.
- Dark mode toggle and polished UI.
- A simulated AI response pipeline with clear extension points for Gemini API integration.

## How to use

1. Open `index.html` in your browser.
2. Enter symptom text and click **Analyze with Guardrails**.
2. Enter symptom text and click **Analyze Safely**.
3. Upload a medical report image or PDF summary to preview file handling.
4. If emergency terms are detected, an emergency card appears with a "Find nearest hospitals" button.

## Integration notes

- The frontend now uses `script2.js` and talks to a local backend API at `http://127.0.0.1:8000`.
- Replace the backend stub in `api.py` with your Gemini or OpenAI model calls.
- Use the backend to keep model API keys secure and keep emergency detection in front of AI requests.
- Use the browser's File API to upload images and send them to a vision endpoint for report extraction.

## Run the backend

1. Install dependencies:
   ```bash
   cd AI
   pip install -r requirements.txt
   ```
2. Start the server from the `AI` directory:
   ```bash
   cd AI
   python -m uvicorn api:app --reload --port 8000
   ```

   If you have multiple Python versions, use:
   ```bash
   cd AI
   py -3 -m uvicorn api:app --reload --port 8000
   ```

   Or from the project root, run:
   ```bash
   python -m uvicorn AI.api:app --reload --port 8000
   ```
3. Open `AI/index.html` in a browser and test the text and file analysis flows.

> The `ERROR: Could not import module "api"` happens when you run the command from the wrong working directory. Make sure the current directory contains `api.py`, or use `AI.api:app` from the repository root.

## Recommended improvements

- Add a backend endpoint with FastAPI/Flask to securely call the Gemini API.
- Implement true OCR/vision processing for PDF report extraction.
- Add persistent logs of user interactions and safety events for evaluation.
