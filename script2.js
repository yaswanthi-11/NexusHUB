﻿﻿﻿﻿const emergencyKeywords = [
  /chest pain/i,
  /shortness of breath|breathless/i,
  /stroke|slurred speech/i,
  /severe headache/i,
  /unconscious|fainting/i,
  /bleeding/i,
  /difficulty breathing/i,
  /sudden weakness/i,
  /seizure|convulsion/i,
  /poison|swallowed chemicals/i,
  /choking/i,
  /allergic reaction|anaphylaxis|hives|swollen throat/i,
];

const SYMPTOMS_LIBRARY = {
  'cough': 'Cough',
  'cold': 'Cold',
  'fever': 'Fever',
  'headache': 'Headache',
  'nausea': 'Nausea',
  'fatigue': 'Fatigue',
  'sore throat': 'Sore Throat',
  'appetite': 'Loss of Appetite',
  'rash': 'Skin Rash',
  'dizzy': 'Dizziness',
  'abdominal pain': 'Abdominal Pain',
  'muscle aches': 'Muscle Aches',
  'joint pain': 'Joint Pain',
  'back pain': 'Back Pain',
  'insomnia': 'Insomnia',
  'anxiety': 'Anxiety',
  'heartburn': 'Heartburn',
  'bloating': 'Bloating',
  'chest pain': 'Chest Pain',
  'shortness of breath': 'Shortness of Breath',
  'blurred vision': 'Blurred Vision',
  'frequent urination': 'Frequent Urination',
  'persistent thirst': 'Persistent Thirst',
  'night sweats': 'Night Sweats',
  'chills': 'Chills',
  'constipation': 'Constipation',
  'diarrhea': 'Diarrhea',
  'palpitations': 'Palpitations',
  'numbness': 'Numbness',
  'earache': 'Earache',
  'sneezing': 'Sneezing',
  'runny nose': 'Runny Nose',
  'weight loss': 'Weight Loss',
  'drowsiness': 'Drowsiness'
};

const SYMPTOM_CATEGORIES = {
  'cough': 'Respiratory', 'cold': 'Respiratory', 'sore throat': 'Respiratory',
  'shortness of breath': 'Respiratory', 'sneezing': 'Respiratory', 'runny nose': 'Respiratory',
  'fever': 'General', 'fatigue': 'General', 'weight loss': 'General',
  'night sweats': 'General', 'chills': 'General', 'drowsiness': 'General',
  'headache': 'Neurological', 'dizzy': 'Neurological', 'insomnia': 'Neurological',
  'anxiety': 'Neurological', 'numbness': 'Neurological', 'blurred vision': 'Neurological',
  'nausea': 'Digestive', 'appetite': 'Digestive', 'abdominal pain': 'Digestive',
  'heartburn': 'Digestive', 'bloating': 'Digestive', 'constipation': 'Digestive', 'diarrhea': 'Digestive',
  'muscle aches': 'Musculoskeletal', 'joint pain': 'Musculoskeletal', 'back pain': 'Musculoskeletal',
  'chest pain': 'Cardiovascular', 'palpitations': 'Cardiovascular',
  'rash': 'Skin',
  'frequent urination': 'Urinary', 'persistent thirst': 'Urinary',
  'earache': 'ENT'
};

const CATEGORY_ICONS = {
  'Respiratory': '🌬️',
  'General': '🌡️',
  'Neurological': '🧠',
  'Digestive': '🥣',
  'Musculoskeletal': '🦴',
  'Cardiovascular': '🫀',
  'Skin': '🧴',
  'Urinary': '💧',
  'ENT': '👂'
};

// Ensure this matches the address in your Uvicorn terminal exactly
const BACKEND_URL = window.location.hostname === 'localhost' ? 'http://localhost:8000' : 'http://127.0.0.1:8000'; // Dynamic backend URL
const textForm = document.getElementById('text-form');
const userText = document.getElementById('user-text');
const resultOutput = document.getElementById('result-output');
const clearText = document.getElementById('clear-text');
const micButton = document.getElementById('mic-button');
const fileInput = document.getElementById('file-input');
const filePreview = document.getElementById('file-preview');
const themeToggle = document.getElementById('theme-toggle');

const LOADING_TEXT = 'Analyzing safely...';
const DEFAULT_RESULT_TEXT = 'Responses appear here after analysis.'; // Default text for result card

function setLoading(isLoading) {
  if (textForm) {
    const btn = textForm.querySelector('button[type="submit"]');
    if (btn) btn.disabled = isLoading;
  }
  if (clearText) clearText.disabled = isLoading;
  if (fileInput) fileInput.disabled = isLoading;
  if (themeToggle) themeToggle.disabled = isLoading;
  if (isLoading && resultOutput) resultOutput.textContent = LOADING_TEXT;
}

// Function to save analysis results to local storage
function saveToHistory(type, message, detail) {
  const history = JSON.parse(localStorage.getItem('nexus_hub_history') || '[]');
  const entry = {
    timestamp: new Date().toLocaleString(),
    type: type,
    message: message,
    detail: detail || ''
  };
  history.unshift(entry); // Add new entry to the beginning
  localStorage.setItem('nexus_hub_history', JSON.stringify(history.slice(0, 20))); // Keep last 20 items
}

// Function to generate and download a PDF summary
function downloadPDF(message, type) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  // Logo - Blue Square + Text Header
  doc.setFillColor(20, 184, 166); // Primary Teal (for logo background)
  doc.rect(10, 10, 15, 15, 'F');
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(44, 62, 80); // Dark color for PDF header text
  doc.text("Nexus Hub", 30, 21);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(120); // Lighter gray for subtitle
  doc.text("Educational Health Assistant", 30, 26); // Keep this color for subtitle
  
  doc.setFontSize(12);
  doc.setTextColor(50); // Dark color for PDF report type
  doc.text(`Report Type: ${type}`, 10, 40);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 10, 46);
  doc.setDrawColor(200);
  doc.line(10, 52, 200, 52);
  
  doc.setFontSize(11);
  doc.setTextColor(0); // Black for main message content
  const splitText = doc.splitTextToSize(message, 180);
  doc.text(splitText, 10, 60);
  
  doc.setFontSize(9);
  doc.setTextColor(150);
  doc.text("Disclaimer: This summary is for educational purposes only and is not medical advice.", 10, 285);
  doc.save(`NexusHub_Summary_${Date.now()}.pdf`);
}

// Function for Text-to-Speech
function speakText(text) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel(); // Stop any ongoing speech
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  } else {
    alert('Text-to-speech is not supported in this browser.');
  }
}

// Speech Recognition Logic
let recognition = null;
let isListening = false;

function toggleListening() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("Speech recognition is not supported in this browser.");
    return;
  }

  if (isListening) {
    recognition.stop();
    return;
  }

  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  recognition.onstart = () => { isListening = true; micButton.classList.add('listening'); };
  recognition.onend = () => { isListening = false; micButton.classList.remove('listening'); };
  recognition.onerror = (event) => { console.error('Speech recognition error:', event.error); isListening = false; micButton.classList.remove('listening'); };
  recognition.onresult = (event) => {
    let interimTranscript = '';
    let finalTranscript = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      } else {
        interimTranscript += event.results[i][0].transcript;
      }
    }
    userText.value = userText.value + finalTranscript; // Append final transcript
    // Optionally, display interimTranscript somewhere else or update userText dynamically
  };
  recognition.start();
}

/**
 * Generates a consistent color based on a string input for symptom tags.
 */
function getRandomColor(str) {
  const colors = ['#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#06b6d4'];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

// Function to update the result display with message and download button
function updateResultDisplay(message, type, symptomDetails = [], specialist = "") {
  resultOutput.innerHTML = `<div style="white-space: pre-wrap; font-family: inherit;">${message}</div>`;

  if (specialist) {
    const specBadge = document.createElement('div');
    specBadge.className = 'spec-badge'; // Use class for styling
    specBadge.innerHTML = `🏥 Recommended Consultation: ${specialist}`;
    resultOutput.appendChild(specBadge);
  }
  
  if (symptomDetails.length > 0) {
    const symContainer = document.createElement('div');
    symContainer.style = "display: flex; gap: 12px; flex-wrap: wrap; margin-top: 20px; padding-top: 15px; border-top: 1px dashed var(--border-glass);";
    symptomDetails.forEach(symptomLabel => {
      symContainer.innerHTML += `
        <div style="background: rgba(255,255,255,0.05); border: 1px solid var(--border-glass); padding: 8px 12px; border-radius: 12px; display: flex; align-items: center; gap: 10px; backdrop-filter: blur(4px); box-shadow: 0 2px 8px rgba(0,0,0,0.2);">
          <div style="width: 28px; height: 28px; border-radius: 50%; background-color: ${getRandomColor(symptomLabel)}; color: var(--text-white); display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.7rem; box-shadow: 0 0 8px rgba(20, 184, 166, 0.3);"> ${symptomLabel.charAt(0)}</div>
          <span style="font-weight: 700; font-size: 0.8rem; color: var(--text-white); text-transform: uppercase;">${symptomLabel}</span> <!-- Text color updated -->
        </div>`;
    });
    if (resultOutput) resultOutput.appendChild(symContainer);
  }
  
  const actionGroup = document.createElement('div');
  actionGroup.style = "display: flex; gap: 10px; margin-top: 15px;";

  const speakBtn = document.createElement('button');
  speakBtn.className = 'btn-secondary';
  speakBtn.innerHTML = '<span class="nav-icon">🔊</span> Listen';
  speakBtn.onclick = () => speakText(message);

  const btn = document.createElement('button');
  btn.className = 'btn-download';
  btn.innerHTML = '<span>📄</span> Download PDF';
  btn.onclick = () => downloadPDF(message, type);

  actionGroup.appendChild(speakBtn);
  actionGroup.appendChild(btn);
  if (resultOutput) resultOutput.appendChild(actionGroup);
}

function detectEmergency(text) {
  return emergencyKeywords.some((pattern) => pattern.test(text));
}

// Function to detect language for simulated responses
function detectLanguage(text) {
  if (/[^\u0000-\u007F]/.test(text) && /[\u0C00-\u0C7F]/.test(text)) {
    return 'Telugu';
  }
  if (/[^\u0000-\u007F]/.test(text) && /[\u0900-\u097F]/.test(text)) {
    return 'Hindi';
  }
  return 'English';
}

// Function to send text analysis request to the backend
async function analyzeTextWithBackend(text) {
  console.log('analyzeTextWithBackend called with:', text); // Debug log
  const language = detectLanguage(text);
  setLoading(true);
  
  // Simulate a short delay to mimic processing
  setTimeout(() => {
    try { // Add try-catch block for better debugging
      const response = simulateAIResponse(text, language);
      console.log('simulateAIResponse returned:', response); // Debug log
      let finalMessage = response.message;
      updateResultDisplay(finalMessage, 'Local Analysis', response.symptomDetails, response.specialist);
      saveToHistory('Local Analysis', finalMessage);
    } catch (error) {
      console.error('Error during AI response simulation or display:', error); // Log any errors
      if (resultOutput) resultOutput.textContent = 'An error occurred during analysis.';
    } finally {
      setLoading(false);
    }
  }, 800);
}

function extractSymptomsFromText(text) {
  const symptoms = [];
  const lowerText = text.toLowerCase();
  const negationRegex = /\b(no|not|none|denies|denied|without|negative for)\b/i;

  for (const [keyword, label] of Object.entries(SYMPTOMS_LIBRARY)) {
    const keywordRegex = new RegExp(`\\b${keyword}\\b`, 'i');
    const match = lowerText.match(keywordRegex);

    if (match) {
      // Inspect the text immediately preceding the symptom match (approx 30 chars)
      const prefix = lowerText.substring(Math.max(0, match.index - 30), match.index);
      if (!negationRegex.test(prefix)) {
        symptoms.push(label);
      }
    }
  }
  return symptoms;
}

function simulateAIResponse(text, language) { // Modified to return an object
  console.log('simulateAIResponse called with text:', text, 'and language:', language); // Debug log
  const detectedSymptoms = extractSymptomsFromText(text);
  const symptomsLower = detectedSymptoms.map(s => s.toLowerCase()); // Now 's' is already the label string
  
  let educationalInsight = "";
  let specialist = "General Physician";
  
  // Specific result logic with statistical educational insights
  if (symptomsLower.includes('cough') && symptomsLower.includes('cold')) {
    educationalInsight = "Based on the combination of a Cough and Cold, there is an estimated 75% probability of an associated Fever or viral upper respiratory infection. Early management with hydration is key.";
    specialist = "General Physician";
  } else if (symptomsLower.includes('frequent urination') && symptomsLower.includes('persistent thirst')) {
    educationalInsight = "The occurrence of Frequent Urination alongside Persistent Thirst shows a 70% correlation with elevated blood glucose levels. This pattern warrants professional screening for metabolic concerns.";
    specialist = "Endocrinologist";
  } else if (symptomsLower.includes('weight loss') && symptomsLower.includes('night sweats')) {
    educationalInsight = "Unexplained Weight Loss paired with Night Sweats indicates a 55% chance of an underlying systemic infection or inflammatory process. A thorough clinical evaluation is strongly recommended.";
    specialist = "Internal Medicine / Oncologist";
  } else if (symptomsLower.includes('sore throat') && symptomsLower.includes('earache')) {
    educationalInsight = "A Sore Throat occurring with an Earache suggests a 60% likelihood of a localized ENT infection, such as pharyngitis or secondary otitis. Saltwater gargles are a common supportive measure.";
    specialist = "ENT Specialist";
  } else if (symptomsLower.includes('numbness') && symptomsLower.includes('blurred vision')) {
    educationalInsight = "Experiencing Numbness and Blurred Vision together carries a 40% probability of neurological or migraine-related triggers. These symptoms require careful monitoring of duration and intensity.";
    specialist = "Neurologist";
  } else if (symptomsLower.includes('heartburn') && symptomsLower.includes('bloating')) {
    educationalInsight = "Heartburn and Bloating are 65% more likely to be related to Gastroesophageal Reflux (GERD) or dietary sensitivities. Tracking meal triggers can be helpful for your consultant.";
    specialist = "Gastroenterologist";
  } else if (symptomsLower.includes('fever') && symptomsLower.includes('fatigue')) {
    educationalInsight = "The combination of Fever and Fatigue suggests a 65% chance of a common Viral Infection. Rest is highly recommended.";
    specialist = "Internal Medicine";
  } else if (symptomsLower.includes('abdominal pain') && symptomsLower.includes('nausea')) {
    educationalInsight = "Abdominal Pain paired with Nausea often indicates a 60% chance of Gastritis or digestive upset.";
    specialist = "Gastroenterologist";
  } else if (symptomsLower.includes('headache') || symptomsLower.includes('dizzy')) {
    educationalInsight = "Headache or Dizziness can suggest a 50% chance of Dehydration or tension-type triggers. Ensure consistent fluid intake.";
    specialist = "General Physician";
  } else if (symptomsLower.includes('runny nose') || symptomsLower.includes('sneezing')) {
    educationalInsight = "A Runny Nose or Sneezing (60% chance of allergies or a minor viral cold) often responds well to rest and avoiding environmental irritants like dust or pollen.";
    specialist = "General Physician / ENT";
  } else if (symptomsLower.includes('sore throat')) {
    educationalInsight = "A Sore Throat is commonly associated with viral pharyngitis (45% likelihood). Warm salt water gargles are a standard educational home-care step.";
    specialist = "ENT Specialist";
  } else if (symptomsLower.includes('rash')) {
    educationalInsight = "A Skin Rash (40% chance of irritation or allergy) should be monitored for spreading. Avoid using harsh soaps on the affected area.";
    specialist = "Dermatologist";
  } else if (symptomsLower.includes('back pain') || symptomsLower.includes('muscle aches')) {
    educationalInsight = "Muscle or Back Pain often relates to physical strain or posture. Gentle stretching and heat therapy may provide relief.";
    specialist = "Orthopedist / Physiotherapist";
  } else if (symptomsLower.includes('insomnia') || symptomsLower.includes('anxiety')) {
    educationalInsight = "Difficulty sleeping or feelings of anxiety are common. Consider reducing caffeine intake and practicing mindfulness.";
    specialist = "Psychiatrist / Counselor";
  } else if (symptomsLower.includes('heartburn') || symptomsLower.includes('bloating')) {
    educationalInsight = "Digestive discomfort like heartburn is often dietary. Smaller meals and avoiding lying down after eating can help.";
    specialist = "Gastroenterologist";
  } else if (symptomsLower.includes('chest pain')) {
    specialist = "Cardiologist (Urgent)";
  } else if (symptomsLower.includes('joint pain')) {
    educationalInsight = "Joint Pain (45% chance of minor inflammation or strain) can be managed with rest. Seek professional advice if you notice redness or swelling.";
  } else if (symptomsLower.includes('fatigue')) {
    educationalInsight = "Generalized Fatigue is a non-specific symptom often signaling the body needs recovery. Track your sleep patterns to share with a provider.";
  } else if (symptomsLower.includes('nausea')) {
    educationalInsight = "Nausea (55% chance of gastric irritation) requires monitoring for dehydration. Focus on small, frequent sips of clear fluids.";
  } else if (symptomsLower.includes('fever')) {
    educationalInsight = "A Fever indicates your body is fighting an infection. Rest and monitor your temperature frequently.";
  } else if (detectedSymptoms.length > 0) {
    educationalInsight = `You reported: ${detectedSymptoms.join(', ')}. Statistically, these symptoms often resolve with rest, but professional medical evaluation is necessary for an accurate diagnosis.`;
  } else {
    educationalInsight = "Your query describes general health concerns. Tracking any changes and consulting a professional is recommended.";
  }

  const englishAnswer = `Educational Summary:\n${educationalInsight}\n\n` +
    `Note: You wrote: "${text.trim()}". Please seek evaluation from a licensed healthcare professional. Do not rely on this assistant for diagnosis. ` +
    `Share your symptoms, duration, and red flags with your provider.`;

  const hindiAnswer = `शैक्षिक संक्षेप:\n${educationalInsight}\n\n` +
    `यह एक सुरक्षित शैक्षिक संक्षेप है। उपयोगकर्ता ने वर्णित किया: ${text.trim()}` +
    `\n\nअनुशंसित क्रियाएँ:\n- लाइसेंस प्राप्त स्वास्थ्य सेवा प्रदाता से मूल्यांकन प्राप्त करें।` +
    `\n- आत्म-निदान से बचें और स्थानीय आपातकालीन निर्देशों का पालन करें।` +
    `\n- अपने डॉक्टर को लक्षण, अवधि और कोई भी रेड-फ्लैग साझा करें।`;

  const teluguAnswer = `విద్యా సారాంశం:\n${educationalInsight}\n\n` +
    `ఇది ఒక సురక్షిత విద్యా సారాంశం. వినియోగదారు వివరిస్తున్నారు: ${text.trim()}` +
    `\n\nసిఫార్సులు:\n- లైసెన్సు పొందిన వైద్య సేవా అందించే వ్యక్తి నుండి మూల్యాంకనం పొందండి.` +
    `\n- స్వయంగా రోగనిర్ణయం చేయకుండా ఉండండి మరియు స్థానిక అత్యవసర మార్గదర్శకాలను అనుసరించండి.` +
    `\n- మీ లక్షణాలు, వ్యవధి, మరియు ఏమైనా రెడ్-ఫ్లాగ్‌లను మీ డాక్ట‌ర్ల‌కు పంచుకోండి.`;
  let message = englishAnswer;
  if (language === 'Hindi') message = hindiAnswer;
  else if (language === 'Telugu') message = teluguAnswer;
  
  return { message, symptomDetails: detectedSymptoms, specialist };
}

// Function to display emergency card
function showEmergencyCard(text) {
  resultOutput.innerHTML = '';
  const card = document.createElement('div');
  card.className = 'emergency-card';
  card.innerHTML = `
    <strong>Emergency red flag detected:</strong>
    <p style="margin: 10px 0; color: var(--text-white);">"${text.trim()}" suggests an urgent medical situation.</p>
    <ul style="text-align: left; margin: 10px 0; font-size: 0.9rem; color: var(--emergency-red);">
      <li>• Call emergency services (911/108) immediately.</li>
      <li>• Do not attempt to drive yourself to the hospital.</li>
      <li>• Stay on the line with the dispatcher.</li>
    </ul>
    <button id="find-hospital" type="button" class="btn-primary" style="background: var(--emergency-red); box-shadow: 0 10px 15px -3px rgba(239, 68, 68, 0.2);">Find nearest hospitals</button>
  `;
  resultOutput.appendChild(card);

  document.getElementById('find-hospital').addEventListener('click', () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        window.open(`https://www.google.com/maps/search/hospitals/@${latitude},${longitude},12z`, '_blank');
      },
      () => {
        alert('Unable to access location. Please enable location services.');
      }
    );
  });
}

async function analyzeFile(file) {
  setLoading(true);
  
  // Mock file analysis since OCR requires a backend
  setTimeout(() => {
    const mockMessage = `This is a simulated analysis for the file: "${file.name}".\n\n` +
      `In a production environment, this file would be processed by Gemini Vision to extract vitals like Blood Pressure, Heart Rate, and clinical impressions.\n\n` +
      `Educational Note: Always review medical reports with a certified doctor to understand specific laboratory ranges and findings.`;

    // Extract symptoms from the generated message so the UI isn't empty
    const detected = extractSymptomsFromText(mockMessage);
    updateResultDisplay(mockMessage, `File: ${file.name}`, detected, "General Physician");
    saveToHistory(`File Analysis`, mockMessage, `File: ${file.name}`); // Pass mockMessage as detail
    setLoading(false);
  }, 1200);
}

function clearResult() {
  // Reset result output to default text
  if (resultOutput) resultOutput.textContent = DEFAULT_RESULT_TEXT;
  if (userText) userText.value = ''; // Clear user text input as well

}

if (textForm) {
  textForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const text = userText.value.trim();
    if (!text) {
      if (resultOutput) resultOutput.textContent = 'Please enter symptom details or health concerns to analyze.';
      return;
    }

    if (detectEmergency(text)) {
      showEmergencyCard(text);
      return;
    }

    analyzeTextWithBackend(text);
  });
}

// Clear button event listener
if (clearText) {
  clearText.addEventListener('click', clearResult);
}

if (micButton) {
  micButton.addEventListener('click', () => {
    toggleListening();
  });
}

// Event listener for file input changes
if (fileInput) {
  fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) {
      if (filePreview) filePreview.textContent = 'No file selected.';
      return;
    }

    const supportedImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf';

    if (filePreview) filePreview.innerHTML = `<strong>Selected file:</strong> ${file.name}`;
    
    if (supportedImage) {
      const reader = new FileReader();
      reader.onload = () => {
        const img = document.createElement('img');
        img.src = reader.result;
        img.alt = file.name;
        img.style.maxWidth = '100%'; // Ensure image fits preview area
        if (filePreview) {
          filePreview.appendChild(img);
          filePreview.insertAdjacentHTML('beforeend', '<p>Image uploaded. The file is sent to the backend for safe report analysis.</p>');
        }
      };
      reader.readAsDataURL(file);
      analyzeFile(file);
      return;
    }

    if (isPdf) {
      if (filePreview) filePreview.insertAdjacentHTML('beforeend', '<p>PDF uploaded. The file is sent to the backend for safe report analysis. Gemini Vision can process PDFs directly.</p>');
      analyzeFile(file);
      return;
    }

    if (filePreview) filePreview.insertAdjacentHTML('beforeend', '<p>Unsupported file type. Please upload a PDF or image.</p>');
  });
}

// Theme toggle logic
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const isCurrentlyDark = document.body.classList.contains('dark');
    const newTheme = isCurrentlyDark ? 'light' : 'dark';
    localStorage.setItem('nexus_hub_theme', newTheme);
    applyTheme();
  });
}

// Function to apply theme from local storage
function applyTheme() {
  let theme = localStorage.getItem('nexus_hub_theme');
  if (!theme) {
    theme = 'dark'; // Default for the contest feel
    localStorage.setItem('nexus_hub_theme', 'dark');
  }
  const isDark = theme === 'dark';
  document.body.classList.toggle('dark', isDark);
  if (themeToggle) {
    themeToggle.title = isDark ? 'Toggle Light Mode' : 'Toggle Dark Mode';
  }
}

function initChatbot() {
    const chatbotInput = document.getElementById('chatbot-input');
    const chatbotMessages = document.getElementById('chatbot-messages');

    if (chatbotInput && chatbotMessages) {
        chatbotInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter' && chatbotInput.value.trim() !== '') {
                const userMessage = chatbotInput.value.trim();
                chatbotMessages.innerHTML += `<div style="background: rgba(37, 99, 235, 0.1); padding: 12px; border-radius: 12px; font-size: 0.85rem; color: var(--text-white); margin-bottom: 10px; text-align: right; border: 1px solid var(--border-glass);"><strong>You:</strong><br>${userMessage}</div>`;
                chatbotInput.value = '';

                setTimeout(() => {
                    const aiResponse = getChatbotResponse(userMessage);
                    chatbotMessages.innerHTML += `<div style="background: rgba(255,255,255,0.03); padding: 12px; border-radius: 12px; font-size: 0.85rem; color: var(--text-gray); margin-bottom: 10px; border: 1px solid var(--border-glass);"><strong>Nexus AI:</strong><br>${aiResponse}</div>`;
                    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
                }, 1000);
            }
        });
    }
}

function generateSparklineData() {
    const container = document.querySelector('.sparkline-container');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < 10; i++) {
        const bar = document.createElement('div');
        bar.className = 'sparkline-bar';
        // Height as percentage for the CSS variable
        bar.style.setProperty('--height', `${Math.floor(Math.random() * 70 + 20)}%`);
        bar.style.animationDelay = `${i * 0.1}s`;
        container.appendChild(bar);
    }
}

function getChatbotResponse(userMessage) {
  const lowerMessage = userMessage.toLowerCase();

  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return "Hello there! How can I assist you with your health today? Remember, I provide educational information, not medical advice.";
  } else if (lowerMessage.includes('symptoms') || lowerMessage.includes('sick') || lowerMessage.includes('feel unwell')) {
    return "I can help you understand common symptoms. Please describe what you're experiencing, and I'll provide some educational insights. Always consult a doctor for diagnosis.";
  } else if (lowerMessage.includes('doctor') || lowerMessage.includes('specialist') || lowerMessage.includes('appointment')) {
    return "I can help you find information about different specialists or general physicians. Would you like to browse our symptoms library for common conditions?";
  } else if (lowerMessage.includes('emergency') || lowerMessage.includes('urgent') || lowerMessage.includes('help')) {
    return "If you are experiencing a medical emergency, please call your local emergency services immediately. I cannot provide emergency medical assistance.";
  } else if (lowerMessage.includes('thank you') || lowerMessage.includes('thanks')) {
    return "You're welcome! Is there anything else I can help you with?";
  } else if (lowerMessage.includes('what can you do') || lowerMessage.includes('your purpose')) {
    return "I'm an AI assistant designed to provide educational health information and analyze medical reports. I can help you understand symptoms and health data, but I cannot diagnose or offer medical advice.";
  }
  
  return "I'm an AI assistant designed to provide educational health information. For any medical concerns, please consult a healthcare professional.";
}


// Function to check for pending symptom from library and auto-analyze
function checkPendingSymptom() {
  const pending = localStorage.getItem('nexus_hub_pending_symptom');
  if (pending && userText) {
    userText.value = `I am experiencing ${pending}. Please provide an educational summary.`;
    localStorage.removeItem('nexus_hub_pending_symptom'); // Clear after use
    analyzeTextWithBackend(userText.value); // Auto-trigger analysis
  }
}

// Function to check backend health and update status indicator
async function checkBackendHealth() {
  const statusContainer = document.getElementById('backend-status');
  const statusText = document.getElementById('status-text');
  if (!statusContainer) return; // Exit if status indicator not found

  try {
    console.log(`Checking backend health at: ${BACKEND_URL}/health`);
    const res = await fetch(`${BACKEND_URL}/health`, { mode: 'cors' });
    statusContainer.className = res.ok ? 'status-indicator status-online' : 'status-indicator status-offline';
    statusText.textContent = res.ok ? 'SECURE CONNECTION' : 'OFFLINE MODE';
    if (res.ok) console.log("Backend connection established successfully.");
  } catch (e) {
    statusContainer.className = 'status-indicator status-offline';
    statusText.textContent = 'OFFLINE MODE';
    console.error("Backend health check failed. Ensure the Python server is running on port 8000.", e);
  }
}

// Function to filter sidebar menu items based on search input
function initSidebarSearch() {
  const searchInput = document.querySelector('.sidebar .search-input');
  const navLinks = document.querySelectorAll('.main-nav a');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase();
      navLinks.forEach(link => {
        const isMatch = link.textContent.toLowerCase().includes(term);
        link.style.display = isMatch ? '' : 'none';
      });
    });
  }
}

// Helper function to update navigation link titles for tooltips
function updateNavLinkTitles(isCollapsed) {
  const navLinks = document.querySelectorAll('.main-nav a');
  navLinks.forEach(link => {
    const textSpan = link.querySelector('span:not(.nav-icon)');
    if (textSpan) {
      if (isCollapsed) {
        link.title = textSpan.textContent.trim(); // Set title from text content
      } else {
        link.removeAttribute('title'); // Remove title when expanded
      }
    }
  });
}

// Function to handle sidebar collapse
function initSidebarCollapse() {
  const sidebar = document.querySelector('.sidebar');
  const toggleBtn = document.getElementById('sidebar-collapse');

  if (!sidebar || !toggleBtn) return;

  // Apply saved state
  const isCollapsed = localStorage.getItem('nexus_hub_sidebar_collapsed') === 'true';
  if (isCollapsed) sidebar.classList.add('collapsed');
  updateNavLinkTitles(isCollapsed); // Apply titles based on initial state

  toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    localStorage.setItem(
      'nexus_hub_sidebar_collapsed', 
      sidebar.classList.contains('collapsed')
    );
    updateNavLinkTitles(sidebar.classList.contains('collapsed')); // Update titles after toggle
  });
}

// Function to show the Cancer Awareness Banner on load
function showAwarenessBanner() {
  const bannerOverlay = document.createElement('div');
  bannerOverlay.id = 'awareness-overlay';
  bannerOverlay.style = `
    position: fixed; inset: 0; z-index: 9999; 
    background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(8px);
    display: flex; align-items: center; justify-content: center; p: 20px;
  `;

  bannerOverlay.innerHTML = `
    <div style="background: white; padding: 40px; border-radius: 30px; max-width: 500px; text-align: center; border: 4px solid #ff69b4; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);">
      <div style="font-size: 50px; margin-bottom: 20px;">🎗️</div>
      <h2 style="color: var(--text-white); font-size: 28px; font-weight: 800; margin-bottom: 10px; text-transform: uppercase;">Health Awareness</h2>
      <p style="color: var(--text-gray); font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
        Early detection is your most powerful tool. Regular screenings save lives. 
        HealthMate stands with you in promoting proactive health checks.
      </p>
      <button id="close-awareness" style="background: linear-gradient(135deg, var(--primary-teal), var(--secondary-blue)); color: var(--text-white); border: none; padding: 15px 40px; border-radius: 15px; font-weight: bold; cursor: pointer; width: 100%; font-size: 18px; transition: transform 0.2s; box-shadow: 0 10px 15px -3px rgba(20, 184, 166, 0.2);">
        Start Exploration
      </button>
    </div>
  `;

  document.body.appendChild(bannerOverlay);

  document.getElementById('close-awareness').addEventListener('click', () => {
    bannerOverlay.style.opacity = '0';
    setTimeout(() => bannerOverlay.remove(), 300);
  });
  
  document.getElementById('close-awareness').addEventListener('mousedown', (e) => {
    e.target.style.transform = 'scale(0.95)';
  });
}

// Initial calls on page load
clearResult();
applyTheme(); // Apply theme on load
checkPendingSymptom(); // Check for pending symptom
checkBackendHealth(); // Initial health check
initSidebarSearch(); // Initialize sidebar menu search
initSidebarCollapse(); // Initialize collapsible sidebar logic
initChatbot(); // Initialize AI Chatbot
generateSparklineData(); // Generate initial trends

// Only show the awareness banner if not on the library page and not yet shown in this session
const bannerShownInSession = sessionStorage.getItem('nexus_hub_banner_shown');
if (!window.location.pathname.includes('symptoms-library.html') && !bannerShownInSession) {
    showAwarenessBanner();
    // Set flag so it doesn't show again this session
    sessionStorage.setItem('nexus_hub_banner_shown', 'true');
}

setInterval(checkBackendHealth, 10000); // Check every 10 seconds
