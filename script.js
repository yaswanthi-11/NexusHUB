/* This file is no longer actively used. All logic has been moved to script2.js */
const emergencyKeywords = [
  /chest pain/i,
  /shortness of breath|breathless/i,
  /stroke|slurred speech/i,
  /severe headache/i,
  /unconscious|fainting/i,
  /bleeding/i,
  /difficulty breathing/i,
  /sudden weakness/i,
];

// const textForm = document.getElementById('text-form');
// const userText = document.getElementById('user-text');
// const resultOutput = document.getElementById('result-output');
// const clearText = document.getElementById('clear-text');
// const fileInput = document.getElementById('file-input');
// const filePreview = document.getElementById('file-preview');
// const themeToggle = document.getElementById('theme-toggle');

const LOADING_TEXT = 'Analyzing safely...';
const DEFAULT_RESULT_TEXT = 'Responses appear here after analysis.';

function setLoading(isLoading) {
  const submitButton = textForm.querySelector('button[type="submit"]');
  if (submitButton) submitButton.disabled = isLoading;
  clearText.disabled = isLoading;
  fileInput.disabled = isLoading;
  themeToggle.disabled = isLoading;
  if (isLoading) {
    resultOutput.textContent = LOADING_TEXT;
  }
}

// function detectEmergency(text) {
//   return emergencyKeywords.some((pattern) => pattern.test(text));
// }

function detectLanguage(text) {
  if (/[^\u0000-\u007F]/.test(text) && /[\u0900-\u097F]/.test(text)) {
    return 'Hindi';
  }
  if (/[^\u0000-\u007F]/.test(text) && /[\u0C00-\u0C7F]/.test(text)) {
    return 'Telugu';
  }
  if (/[\u0900-\u097F]/.test(text)) {
    return 'Hindi';
  }
  if (/[\u0C00-\u0C7F]/.test(text)) {
    return 'Telugu';
  }
  return 'English';
}

// function createTextNode(tag, text, className) {
//   const element = document.createElement(tag);
//   element.textContent = text;
//   if (className) element.className = className;
//   return element;
// }

function showEmergencyCard(text) {
  resultOutput.innerHTML = '';
  const card = document.createElement('div');
  card.className = 'emergency-card';

  card.appendChild(createTextNode('strong', 'Emergency red flag detected:'));
  card.appendChild(createTextNode('p', `"${text.trim()}" contains potentially urgent symptoms.`));
  card.appendChild(createTextNode('p', 'Please seek emergency care immediately instead of relying on an AI summary.'));

  const button = document.createElement('button');
  button.type = 'button';
  button.id = 'find-hospital';
  button.textContent = 'Find nearest hospitals';
  card.appendChild(button);
  resultOutput.appendChild(card);

  button.addEventListener('click', () => {
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

function simulateAIResponse(text, language) {
  const trimmed = text.trim();

  const englishAnswer = `This is a safe educational summary. The user described: ${trimmed}` +
    '\n\nRecommendations:\n- Seek prompt evaluation from a licensed medical provider.' +
    '\n- Avoid self-diagnosis and follow local emergency care guidelines.' +
    '\n- Share symptoms, duration, and any red flags with your doctor.';

  const hindiAnswer = `यह एक सुरक्षित शैक्षिक संक्षेप है। उपयोगकर्ता ने वर्णित किया: ${trimmed}` +
    '\n\nअनुशंसित क्रियाएँ:\n- लाइसेंस प्राप्त स्वास्थ्य सेवा प्रदाता से शीघ्र मूल्यांकन प्राप्त करें।' +
    '\n- आत्म-निदान से बचें और स्थानीय आपातकालीन निर्देशों का पालन करें।' +
    '\n- अपने डॉक्टर को लक्षण, अवधि और कोई भी रेड-फ्लैग साझा करें।';

  const teluguAnswer = `ఇది ఒక సురక్షిత విద్యా సారాంశం. వినియోగదారు వివరిస్తున్నారు: ${trimmed}` +
    '\n\nసిఫార్సులు:\n- లైసెన్సు పొందిన వైద్య సేవా అందించే వ్యక్తి నుండి తక్షణం మూల్యాంకనం పొందండి.' +
    '\n- స్వయంగా రోగనిర్ణయం చేయకుండా ఉండండి మరియు స్థానిక అత్యవసర మార్గదర్శకాలను అనుసరించండి.' +
    '\n- మీ లక్షణాలు, వ్యవధి, మరియు ఏమైనా రెడ్-ఫ్లాగ్‌లను మీ డాక్ట‌ర్ల‌కు పంచుకోండి.';

  if (language === 'Hindi') return hindiAnswer;
  if (language === 'Telugu') return teluguAnswer;
  return englishAnswer;
}

async function analyzeTextWithBackend(text) {
  setLoading(true);
  const payload = { text };

  try {
    const response = await fetch(`${BACKEND_URL}/analyze-text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP ${response.status}`);
    }

    const data = await response.json();
    if (data.emergency) {
      showEmergencyCard(text);
      return;
    }

    resultOutput.textContent = data.message;
    if (data.detail) {
      resultOutput.textContent += `\n\n${data.detail}`;
    }
  } catch (error) {
    const language = detectLanguage(text);
    resultOutput.textContent = `Backend request failed: ${error.message}.\n\nFalling back to local safe simulation.`;
    resultOutput.textContent += `\n\n${simulateAIResponse(text, language)}`;
  } finally {
    setLoading(false);
  }
}

async function analyzeFile(file) {
  setLoading(true);
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${BACKEND_URL}/analyze-file`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP ${response.status}`);
    }

    const data = await response.json();
    resultOutput.textContent = data.message;
    if (data.detail) {
      resultOutput.textContent += `\n\n${data.detail}`;
    }
  } catch (error) {
    resultOutput.textContent = `File upload failed: ${error.message}.`;
  } finally {
    setLoading(false);
  }
}

// function updateFilePreview(message) {
//   filePreview.innerHTML = '';
//   filePreview.appendChild(createTextNode('p', message));
// }

function clearResult() {
  resultOutput.textContent = DEFAULT_RESULT_TEXT;
}

textForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const text = userText.value.trim();
  if (!text) {
    resultOutput.textContent = 'Please enter symptom details or health concerns to analyze.';
    return;
  }

  if (detectEmergency(text)) {
    showEmergencyCard(text);
    return;
  }

  analyzeTextWithBackend(text);
});

clearText.addEventListener('click', () => {
  userText.value = '';
  clearResult();
});

fileInput.addEventListener('change', (event) => {
  const file = event.target.files?.[0];
  if (!file) {
    updateFilePreview('No file selected.');
    return;
  }

  updateFilePreview(`Selected file: ${file.name}`);
  const supportedImage = file.type.startsWith('image/');
  const isPdf = file.type === 'application/pdf';

  if (supportedImage) {
    const reader = new FileReader();
    reader.onload = () => {
      const img = document.createElement('img');
      img.src = reader.result;
      img.alt = file.name;
      filePreview.appendChild(img);
      filePreview.appendChild(createTextNode('p', 'Image uploaded. The file is sent to the backend for safe report analysis.'));
    };
    reader.readAsDataURL(file);
    analyzeFile(file);
    return;
  }

  if (isPdf) {
    filePreview.appendChild(createTextNode('p', 'PDF uploaded. The file is sent to the backend for safe report analysis. Convert pages to images for better Vision-style extraction with Gemini.'));
    analyzeFile(file);
    return;
  }

  filePreview.appendChild(createTextNode('p', 'Unsupported file type. Please upload a PDF or image.'));
});

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  themeToggle.textContent = document.body.classList.contains('dark') ? 'Light Mode' : 'Dark Mode';
});

clearResult();
