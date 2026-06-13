import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useFrame, Canvas } from '@react-three/fiber';
import { 
  LayoutDashboard, 
  AlertTriangle, 
  History, 
  Info, 
  FileText, 
  BookOpen,
  Volume2, 
  Upload, 
  X, 
  ShieldCheck,
  Settings,
  Menu,
  Mic,
  Heart,
  Activity,
  User,
  LogOut,
  Sun,
  Loader2
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { motion, AnimatePresence } from 'framer-motion';
import { Float, RoundedBox, Html, ContactShadows, Sphere, Cylinder, Cone, Environment } from '@react-three/drei';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart, 
  Bar, 
  Cell 
} from 'recharts';

const BACKEND_URL = 'http://127.0.0.1:8000';

// A very short, silent WAV file as a data URI for placeholder sounds
const SILENT_WAV = 'data:audio/wav;base64,UklGRlQAAABXQVZFZm10IBAAAAABAAEARKwAAABAAABAAABAAABhYXRhAAAAAA==';

const playClickSound = () => {
  try {
    const audio = new Audio(SILENT_WAV); // Replace with actual sound file path like '/sounds/click.mp3'
    audio.volume = 0.1; // Adjust volume as needed
    audio.play().catch(e => console.log("Audio play prevented:", e));
  } catch (e) {
    console.error("Error playing sound:", e);
  }
};

const playHoverSound = () => {
  try {
    const audio = new Audio(SILENT_WAV); // Replace with actual sound file path like '/sounds/hover.mp3'
    audio.volume = 0.05; // Adjust volume as needed
    audio.play().catch(e => console.log("Audio play prevented:", e));
  } catch (e) {
    console.error("Error playing sound:", e);
  }
};

const FloatingLogo = () => {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef();

  return (
    <div className="w-24 h-24 cursor-pointer">
      <Canvas camera={{ position: [0, 0, 4.5], fov: 35 }}>
        <ambientLight intensity={2} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <Float 
          speed={hovered ? 10 : 3} 
          rotationIntensity={hovered ? 5 : 1.5} 
          floatIntensity={hovered ? 2 : 1.5}
        >
          <group 
            onPointerOver={() => setHovered(true)} 
            onPointerOut={() => setHovered(false)}
            ref={meshRef}
          >
            <RoundedBox args={[1.2, 0.4, 0.4]} radius={0.1} smoothness={4}>
              <meshStandardMaterial color="#e11d48" metalness={0.8} roughness={0.2} />
            </RoundedBox>
            <RoundedBox args={[0.4, 1.2, 0.4]} radius={0.1} smoothness={4}>
              <meshStandardMaterial color="#e11d48" metalness={0.8} roughness={0.2} />
            </RoundedBox>
          </group>
        <Html transform position={[0, 0, 0.21]} distanceFactor={4}>
          <ShieldCheck className="text-white w-8 h-8" />
        </Html>
      </Float>
      <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={10} blur={2} far={4} />
    </Canvas>
    </div>
  );
};

const HologramBody = () => {
  const RotatingModel = () => {
    const meshRef = useRef();
    // Subtle rotation logic
    useFrame((state) => {
      if (meshRef.current) {
        meshRef.current.rotation.y += 0.005;
      }
    });

    return (
      <group ref={meshRef}>
        {/* Holographic Head - Wireframe Sphere */}
        <mesh position={[0, 1.2, 0]}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial color="#14B8A6" wireframe transparent opacity={0.6} />
        </mesh>
        {/* Holographic Torso - Wireframe Cylinder */}
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.4, 0.2, 1.5, 32]} />
          <meshStandardMaterial color="#2563EB" wireframe transparent opacity={0.4} />
        </mesh>
        {/* Glowing Data Ring - Horizontal Scanner */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
          <torusGeometry args={[1, 0.015, 16, 100]} />
          <meshStandardMaterial color="#14B8A6" emissive="#14B8A6" emissiveIntensity={3} transparent opacity={0.5} />
        </mesh>
      </group>
    );
  };

  return (
    <div className="w-80 h-80 absolute -top-10 -right-10 opacity-40 pointer-events-none hidden lg:block">
      <Canvas camera={{ position: [0, 0, 5], fov: 40 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} color="#14B8A6" intensity={2} />
        <RotatingModel />
      </Canvas>
    </div>
  );
};

const AwarenessRibbon = () => {
  return (
    <div className="w-full h-48 mb-4">
      <Canvas camera={{ position: [0, 0, 3], fov: 40 }}>
        <ambientLight intensity={1.5} />
        <pointLight position={[10, 10, 10]} />
        <Float speed={4} rotationIntensity={2} floatIntensity={2}>
          <mesh rotation={[0, 0, Math.PI / 4]}>
            <torusKnotGeometry args={[0.6, 0.15, 100, 16, 1, 2]} />
            <meshStandardMaterial color="#ff69b4" roughness={0.3} metalness={0.8} />
          </mesh>
          <Html position={[0, -1.2, 0]} center>
            <div className="text-pink-600 font-black whitespace-nowrap text-xl tracking-tighter uppercase italic">
              Early Detection Saves Lives
            </div>
          </Html>
        </Float>
        <ContactShadows position={[0, -1.5, 0]} opacity={0.3} scale={10} blur={2.5} far={4} />
      </Canvas>
    </div>
  );
};

const HealthVault3D = () => {
  return (
    <div className="w-full h-80 mb-10 bg-gradient-to-br from-rose-50/50 to-indigo-50/30 rounded-[3.5rem] border border-slate-200/50 overflow-hidden shadow-sm relative group">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(225,29,72,0.1),transparent)]" />
      <Canvas camera={{ position: [0, 0, 5], fov: 35 }}>
        <ambientLight intensity={1} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} />
        <pointLight position={[-10, -10, -10]} color="#f43f5e" intensity={1} />
        <Float speed={3} rotationIntensity={1} floatIntensity={2}>
          <group rotation={[0.5, 0.5, 0]}>
            <RoundedBox args={[1.6, 0.6, 0.6]} radius={0.15} smoothness={4}>
              <meshStandardMaterial color="#e11d48" roughness={0.1} metalness={0.8} />
            </RoundedBox>
            <RoundedBox args={[0.6, 1.6, 0.6]} radius={0.15} smoothness={4}>
              <meshStandardMaterial color="#e11d48" roughness={0.1} metalness={0.8} />
            </RoundedBox>
          </group>
        </Float>
        <ContactShadows position={[0, -2.2, 0]} opacity={0.3} scale={8} blur={3} far={4} />
      </Canvas>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-[0.3em] text-rose-300 opacity-50 group-hover:opacity-100 transition-opacity">Nexus Engine 3D v2.0</div>
    </div>
  );
};

const Stethoscope3D = ({ strength }) => {
  const RotatingModel = () => {
    const meshRef = useRef();
    useFrame((state) => {
      if (meshRef.current) {
        // Smooth continuous 360-degree rotation
        meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.8;
      }
    });

    const tubeColor = strength === 'strong' ? '#10b981' : '#334155';
    const metalColor = strength === 'strong' ? '#d1fae5' : '#cbd5e1';

    return (
      <group ref={meshRef} scale={0.8}>
        {/* Stethoscope Head - Chestpiece */}
        <group position={[0, 0.7, 0]}>
          {/* Diaphragm side (Metal) */}
          <Cylinder args={[0.45, 0.45, 0.05, 32]} rotation={[Math.PI / 2, 0, 0]}>
            <meshStandardMaterial color={metalColor} metalness={1} roughness={0.1} />
          </Cylinder>
          {/* Diaphragm Rim */}
          <Cylinder args={[0.48, 0.48, 0.08, 32]} rotation={[Math.PI / 2, 0, 0]}>
            <meshStandardMaterial color={strength === 'strong' ? '#34d399' : '#94a3b8'} metalness={1} roughness={0.05} />
          </Cylinder>
          {/* Bell side */}
          <Cone args={[0.25, 0.3, 32]} position={[0, 0, -0.2]} rotation={[Math.PI / 2, 0, 0]}>
            <meshStandardMaterial color={metalColor} metalness={1} roughness={0.1} />
          </Cone>
        </group>

        {/* Stethoscope Tubing (Matte Rubber) */}
        <group position={[0, -0.2, 0]}>
          <Cylinder args={[0.1, 0.1, 0.5, 16]} position={[0, 0.4, 0]}>
            <meshStandardMaterial color={tubeColor} metalness={0.1} roughness={0.8} />
          </Cylinder>
          <Sphere args={[0.15, 16, 16]} position={[0, 0.15, 0]}>
            <meshStandardMaterial color={tubeColor} metalness={0.1} roughness={0.8} />
          </Sphere>
          <Cylinder args={[0.1, 0.1, 0.8, 16]} position={[0.3, -0.1, 0]} rotation={[0, 0, Math.PI / 4]}>
            <meshStandardMaterial color={tubeColor} metalness={0.1} roughness={0.8} />
          </Cylinder>
          <Cylinder args={[0.1, 0.1, 0.8, 16]} position={[-0.3, -0.1, 0]} rotation={[0, 0, -Math.PI / 4]}>
            <meshStandardMaterial color={tubeColor} metalness={0.1} roughness={0.8} />
          </Cylinder>
        </group>

        {/* Ear Pieces (Metal + Silicone) */}
        <group position={[0, -1.2, 0]}>
          <group position={[-0.7, 0, 0]}>
            <Cylinder args={[0.05, 0.05, 0.6, 16]} position={[0.1, 0.2, 0]} rotation={[0, 0, Math.PI / 6]}>
              <meshStandardMaterial color={strength === 'strong' ? '#34d399' : '#94a3b8'} metalness={1} roughness={0.1} />
            </Cylinder>
            <Sphere args={[0.08, 16, 16]} position={[0.4, -0.15, 0]}>
              <meshStandardMaterial color={strength === 'strong' ? '#064e3b' : '#1e293b'} roughness={1} />
            </Sphere>
          </group>
          <group position={[0.7, 0, 0]}>
            <Cylinder args={[0.05, 0.05, 0.6, 16]} position={[-0.1, 0.2, 0]} rotation={[0, 0, -Math.PI / 6]}>
              <meshStandardMaterial color={strength === 'strong' ? '#34d399' : '#94a3b8'} metalness={1} roughness={0.1} />
            </Cylinder>
            <Sphere args={[0.08, 16, 16]} position={[-0.4, -0.15, 0]}>
              <meshStandardMaterial color={strength === 'strong' ? '#064e3b' : '#1e293b'} roughness={1} />
            </Sphere>
          </group>
        </group>
      </group>
    );
  };

  return (
    <div className="w-40 h-40 absolute -top-20 left-1/2 -translate-x-1/2 z-0 opacity-70 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.8} />
        <pointLight position={[5, 5, 5]} intensity={1} />
        <Suspense fallback={null}>
          <Environment preset="city" />
          <RotatingModel />
        </Suspense>
        <Float speed={2} rotationIntensity={1} floatIntensity={0.5}>
          {/* Model is inside RotatingModel */}
        </Float>
      </Canvas>
    </div>
  );
};

const AuthPage = ({ onLogin }) => {
  const [authMode, setAuthMode] = useState('login'); // 'login', 'register', 'forgot'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); 
    setMessage('');
    setLoading(true);
    
    const endpoint = authMode === 'register' ? '/register' : authMode === 'login' ? '/login' : '/reset-password';
    const payload = authMode === 'forgot' ? { username, new_password: password } : { username, password };

    try {
      const res = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        if (authMode === 'forgot') {
          setMessage('Password updated successfully! Please log in.');
          setAuthMode('login');
        } else {
          playClickSound(); // Play sound on successful login/registration
          onLogin(data.username || username);
        }
      } else {
        setError(data.detail || 'Authentication failed');
      }
    } catch (err) {
      setError('Server unreachable');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordStrength(checkPasswordStrength(newPassword));
  };

  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length > 7) strength++; // Length
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++; // Uppercase and lowercase
    if (password.match(/\d/)) strength++; // Numbers
    if (password.match(/[^a-zA-Z0-9]/)) strength++; // Special characters

    if (password.length === 0) return '';
    if (strength <= 2) return 'weak';
    if (strength === 3) return 'medium';
    return 'strong';
  };

  const getStrengthColor = (strength) => {
    if (strength === 'weak') return 'bg-red-500'; if (strength === 'medium') return 'bg-yellow-500'; if (strength === 'strong') return 'bg-green-500'; return 'bg-gray-300';
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-rose-50 p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-10 w-full max-w-md shadow-2xl border border-slate-100 relative overflow-visible"
      >
        <Stethoscope3D strength={passwordStrength} /> {/* Render the 3D stethoscope here */}
        <div className="bg-rose-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3 shadow-lg shadow-rose-200">
          <ShieldCheck className="text-white w-10 h-10" />
        </div>
        <h2 className="text-3xl font-extrabold mb-2 text-center text-slate-800">
          {authMode === 'register' ? 'Join HealthMate' : authMode === 'login' ? 'Welcome Back' : 'Reset Password'}
        </h2>
        <p className="text-slate-500 text-center mb-8 text-sm">Your intelligent health companion.</p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <input type="text" placeholder="Username" required className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-rose-500 transition-all" value={username} onChange={(e) => setUsername(e.target.value)} />
          <input type="password" placeholder={authMode === 'forgot' ? "New Password" : "Password"} required className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-rose-500 transition-all" value={password} onChange={handlePasswordChange} />
          {authMode === 'register' && password.length > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div className={`h-2.5 rounded-full transition-all duration-300 ${getStrengthColor(passwordStrength)}`} style={{ width: `${passwordStrength === 'weak' ? '33%' : passwordStrength === 'medium' ? '66%' : passwordStrength === 'strong' ? '100%' : '0%'}` }}></div>
              <p className={`text-xs mt-1 text-right ${passwordStrength === 'weak' ? 'text-red-500' : passwordStrength === 'medium' ? 'text-yellow-500' : 'text-green-500'}`}>
                {passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}
              </p>
            </div>
          )}
          {error && <p className="text-rose-600 text-sm text-center font-medium">{error}</p>}
          {message && <p className="text-emerald-600 text-sm text-center font-medium">{message}</p>}
          <button 
            type="submit" 
            disabled={loading}
            onClick={playClickSound} 
            className="bg-rose-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-rose-700 disabled:bg-rose-400 transition-all w-full shadow-lg shadow-rose-200 active:scale-95 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            {authMode === 'register' ? 'Create Account' : authMode === 'login' ? 'Sign In' : 'Update Password'}
          </button>
        </form>

        {authMode === 'login' && (
          <div className="text-center mt-4">
            <button onClick={() => { setAuthMode('forgot'); setError(''); }} className="text-xs text-slate-400 hover:text-rose-600 transition-colors">
              Forgot Password? 
            </button>
          </div>
        )}

        <p className="mt-8 text-center text-sm text-slate-500">
          {authMode === 'register' ? (
            <>Already have an account? <button onClick={() => { setAuthMode('login'); playClickSound(); }} className="text-rose-600 font-bold ml-2 hover:underline">Sign In</button></>
          ) : authMode === 'login' ? (
            <>New to HealthMate? <button onClick={() => { setAuthMode('register'); playClickSound(); }} className="text-rose-600 font-bold ml-2 hover:underline">Get Started</button></>
          ) : (
            <button onClick={() => setAuthMode('login')} className="text-rose-600 font-bold hover:underline">Back to Login</button>
          )}
        </p>
      </motion.div>
    </div>
  );
};

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showBanner, setShowBanner] = useState(true);
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [text, setText] = useState('');
  const [history, setHistory] = useState([]);
  const [vitals, setVitals] = useState(JSON.parse(localStorage.getItem('mg_vitals') || '[]'));
  const [newVital, setNewVital] = useState({ hr: '', bp: '' });
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(localStorage.getItem('mg_user'));
  const [metrics, setMetrics] = useState(localStorage.getItem('mg_metrics') || 'Metric');
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    localStorage.setItem('mg_metrics', metrics);
    localStorage.setItem('mg_vitals', JSON.stringify(vitals));
  }, [metrics, vitals]);

  useEffect(() => {
    if (user && activeTab === 'dashboard') {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
          const data = await res.json();
          setWeather(data.current_weather);
        } catch (e) { console.error("Weather fetch failed:", e); }
      });
    }
  }, [user, activeTab]);

  const getHealthAdvice = (temp) => {
    if (temp < 10) return { risk: "High (Cold)", advice: "Risk of hypothermia. Keep warm.", color: "text-blue-600", bg: "bg-blue-50" };
    if (temp > 35) return { risk: "High (Heat)", advice: "Risk of heatstroke. Stay hydrated.", color: "text-rose-600", bg: "bg-rose-50" };
    if (temp > 30) return { risk: "Moderate (Warm)", advice: "Risk of dehydration. Drink water.", color: "text-amber-600", bg: "bg-amber-50" };
    return { risk: "Low", advice: "Conditions are stable for outdoor activity.", color: "text-emerald-600", bg: "bg-emerald-50" };
  };

  useEffect(() => { // Fetch history only if user is logged in
    if (user) fetchHistory();
  }, [user]);

  const handleLogin = (username) => {
    setUser(username);
    localStorage.setItem('mg_user', username);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('mg_user');
    setAnalysis(''); // Clear analysis on logout
  };

  const getChartData = () => {
    const counts = history.reduce((acc, item) => {
      let category = 'Other';
      if (item.type === 'Text Analysis') category = 'Text';
      else if (item.type === 'Emergency') category = 'Emergency';
      else if (item.type.startsWith('File:')) category = 'File';
      
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(counts).map(name => ({ name, value: counts[name] }));
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/history`);
      const data = await res.json();
      setHistory(data);
    } catch (e) { console.error("Failed to fetch history:", e); }
  };

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/analyze-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      const data = await res.json();
      setAnalysis(data.message);
      fetchHistory(); // Refresh history after new analysis
    } catch (e) { setAnalysis("Failed to reach server."); }
    setLoading(false);
  };

  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      window._recognition?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
      }
      if (finalTranscript) setText(prev => prev + (prev ? ' ' : '') + finalTranscript);
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.start();
    window._recognition = recognition;
    setIsListening(true);
  };

  const handleLogVitals = () => {
    if (!newVital.hr || !newVital.bp) return;
    const entry = {
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      hr: parseInt(newVital.hr),
      sys: parseInt(newVital.bp.split('/')[0]) || 0
    };
    setVitals([...vitals, entry].slice(-7));
    setNewVital({ hr: '', bp: '' });
  };

  const findNearbyHospitals = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        window.open(`https://www.google.com/maps/search/hospitals/@${latitude},${longitude},15z`, '_blank');
      },
      () => {
        alert("Please enable location services to find the nearest emergency care centers.");
      }
    );
  };

  const speak = (content) => {
    const utternance = new SpeechSynthesisUtterance(content);
    window.speechSynthesis.speak(utternance);
  };

  // Function to generate and download a PDF summary
  const downloadPDF = (message, type) => {
    const doc = new jsPDF();
    
    // Logo - Blue Square + Text Header
    doc.setFillColor(52, 152, 219);
    doc.rect(10, 10, 15, 15, 'F');
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(44, 62, 80);
    doc.text("HealthMate", 30, 21);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text("Educational Health Assistant", 30, 26);
    
    doc.setFontSize(12);
    doc.setTextColor(50);
    doc.text(`Report Type: ${type}`, 10, 40);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 10, 46);
    doc.setDrawColor(200);
    doc.line(10, 52, 200, 52);
    
    doc.setFontSize(11);
    doc.setTextColor(0);
    const splitText = doc.splitTextToSize(message, 180);
    doc.text(splitText, 10, 60);
    
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text("Disclaimer: This summary is for educational purposes only and is not medical advice.", 10, 285);
    doc.save(`HealthMate_Summary_${Date.now()}.pdf`);
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {!user ? (
        <AuthPage onLogin={handleLogin} />
      ) : (
        <>
          <AnimatePresence>
            {showBanner && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4"
              >
                <motion.div 
                  initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                  className="bg-white rounded-[2.5rem] p-10 max-w-xl shadow-2xl border border-rose-100 text-center"
                >
                  <AwarenessRibbon />
                  <h2 className="text-4xl font-black mb-3 text-slate-900 text-center tracking-tight uppercase">Cancer Awareness Month</h2>
                  <p className="text-slate-500 mb-8 leading-relaxed text-lg">
                    Welcome, <strong>{user}</strong>. HealthMate is committed to supporting your journey. 
                    Remember: regular screenings and awareness of early symptoms are the most powerful tools in healthcare.
                  </p>
                  <button onClick={() => setShowBanner(false)} className="bg-pink-600 text-white px-10 py-5 rounded-2xl font-black text-xl hover:bg-pink-700 transition-all w-full shadow-xl shadow-pink-200 active:scale-95 uppercase">
                    Join the Fight & Explore 
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

      {/* Sidebar */}
      <nav className={`bg-slate-900 text-white h-full transition-all duration-500 ease-in-out ${isSidebarOpen ? 'w-72' : 'w-24'} flex flex-col shadow-[10px_0_30px_rgba(0,0,0,0.1)] z-40 relative`}>
        <div className="p-8 flex items-center gap-4 border-b border-white/5 mb-4">
          <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-rose-900/20 shrink-0">
            <ShieldCheck className="text-white w-6 h-6" />
          </div>
          {isSidebarOpen && <span className="font-bold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">HealthMate</span>}
        </div>

        <div className="flex-1 space-y-2 px-4">
          <div className={`text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 px-4 ${!isSidebarOpen && 'text-center'}`}>
            {isSidebarOpen ? 'Menu' : '•••'}
          </div>
          <SidebarItem icon={<LayoutDashboard />} label="Overview" active={activeTab === 'dashboard'} onClick={() => { setActiveTab('dashboard'); playClickSound(); }} open={isSidebarOpen} />
          <SidebarItem icon={<AlertTriangle />} label="Emergency" active={activeTab === 'emergency'} onClick={() => { setActiveTab('emergency'); playClickSound(); }} open={isSidebarOpen} />
          <SidebarItem icon={<BookOpen />} label="Library" active={activeTab === 'library'} onClick={() => { setActiveTab('library'); playClickSound(); }} open={isSidebarOpen} />
          <SidebarItem icon={<History />} label="Records" active={activeTab === 'history'} onClick={() => { setActiveTab('history'); playClickSound(); }} open={isSidebarOpen} />
          <SidebarItem icon={<Info />} label="About" active={activeTab === 'about'} onClick={() => { setActiveTab('about'); playClickSound(); }} open={isSidebarOpen} />
          <SidebarItem icon={<Settings />} label="Settings" active={activeTab === 'settings'} onClick={() => { setActiveTab('settings'); playClickSound(); }} open={isSidebarOpen} />
        </div> {/* Sidebar navigation items */}

        {isSidebarOpen && user && (
          <div className="px-6 py-6 border-t border-white/5">
            <div className="flex items-center gap-3 mb-4 p-2 rounded-xl bg-white/5">
              <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center text-xs font-bold uppercase ring-2 ring-rose-500/20">{user[0]}</div>
              <div className="text-sm font-medium truncate opacity-80">{user}</div>
            </div>
            <button onClick={() => { handleLogout(); playClickSound(); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-400 hover:text-white transition-all group">
              <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform" /> Sign Out
            </button>
          </div>
        )} {/* Logout button */}
        
        <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="absolute -right-3 top-20 w-6 h-6 bg-rose-600 rounded-full flex items-center justify-center shadow-lg border-2 border-slate-900 text-white hover:scale-110 transition-transform">
          <Menu className="w-3 h-3" />
        </button>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 relative">
        {activeTab === 'dashboard' && (
          <div className="max-w-4xl ml-0 relative">
            <HologramBody />
            <header className="flex items-start mb-10">
              <div>
                <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">Health Overview</h1>
                <p className="text-slate-500 mt-2">Describe symptoms or ask a health query for intelligent analysis.</p>
              </div>
              {/* Real 3D Logo component */}
              <FloatingLogo />
            </header>

            <HealthVault3D />

            {weather && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-50 rounded-2xl">
                    <Sun className="text-amber-500 w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Local Weather</p>
                    <p className="text-2xl font-black text-slate-800">{weather.temperature}°C</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Health Risk Assessment</p>
                  <p className={`text-lg font-bold ${getHealthAdvice(weather.temperature).color}`}>{getHealthAdvice(weather.temperature).risk}</p>
                  <p className="text-xs text-slate-500">{getHealthAdvice(weather.temperature).advice}</p>
                </div>
              </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <label className="block text-sm font-semibold mb-2">Clinical Symptoms</label>
                <div className="relative">
                  <textarea 
                    value={text} onChange={(e) => setText(e.target.value)}
                    className="w-full h-40 p-4 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-rose-500 outline-none resize-none"
                    placeholder="Explain how you feel..."
                  />
                  <button 
                    onClick={() => { toggleListening(); playClickSound(); }}
                    className={`absolute bottom-4 right-4 p-3 rounded-full transition-all ${isListening ? 'bg-rose-600 text-white animate-pulse' : 'bg-slate-200 text-slate-500 hover:bg-slate-300'}`}
                  >
                    <Mic className="w-5 h-5" />
                  </button>
                </div>
                <div className="mt-4 flex gap-3">
                  <button 
                    onClick={() => { handleAnalyze(); playClickSound(); }} disabled={loading}
                    className="flex-1 bg-rose-600 text-white font-bold py-3 rounded-xl hover:bg-rose-700 transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? "Processing..." : <>Analyze Now <ShieldCheck className="w-5 h-5"/></>}
                  </button>
                </div>
              </div> {/* Text analysis card */}

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
                <label className="block text-sm font-semibold mb-2">Analysis Results</label>
                <div className="flex-1 bg-slate-50 rounded-xl p-4 overflow-y-auto min-h-[160px]">
                  {analysis || <span className="text-slate-400 italic">Analysis summary will appear here.</span>}
                </div>
                {analysis && (
                  <div className="mt-4 flex gap-2">
                    <button onClick={() => { speak(analysis); playClickSound(); }} className="p-3 bg-slate-100 rounded-xl hover:bg-slate-200 text-rose-600">
                      <Volume2 className="w-5 h-5" />
                    </button>
                    <button onClick={() => { downloadPDF(analysis, 'AI Analysis'); playClickSound(); }} className="flex-1 bg-slate-800 text-white rounded-xl font-semibold flex items-center justify-center gap-2">
                      <FileText className="w-4 h-4" /> Export PDF
                    </button>
                  </div>
                )}
              </div> {/* Analysis results card */}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Heart className="text-rose-600 w-5 h-5" /> Log Vitals
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Heart Rate (BPM)</label>
                    <input 
                      type="number" value={newVital.hr} onChange={(e) => setNewVital({...newVital, hr: e.target.value})}
                      className="w-full p-3 rounded-xl bg-slate-50 border-none mt-1 focus:ring-2 focus:ring-rose-500" placeholder="e.g. 72"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Blood Pressure (S/D)</label>
                    <input 
                      type="text" value={newVital.bp} onChange={(e) => setNewVital({...newVital, bp: e.target.value})}
                      className="w-full p-3 rounded-xl bg-slate-50 border-none mt-1 focus:ring-2 focus:ring-rose-500" placeholder="e.g. 120/80"
                    />
                  </div>
                </div>
                <button 
                  onClick={() => { handleLogVitals(); playClickSound(); }}
                  className="w-full mt-4 bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-black transition-all"
                >
                  Log Current Vitals
                </button>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Activity className="text-indigo-600 w-5 h-5" /> Vitals Trends
                </h3>
                <div className="h-40 w-full">
                  {vitals.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={vitals}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="timestamp" hide />
                        <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                        <Line type="monotone" dataKey="hr" stroke="#e11d48" strokeWidth={3} dot={{ r: 4, fill: '#e11d48' }} name="Heart Rate" />
                        <Line type="monotone" dataKey="sys" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, fill: '#4f46e5' }} name="Systolic BP" />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 italic text-sm">Log vitals to see trends</div>
                  )}
                </div>
              </div>
            </div>

            {(history.length > 0 || vitals.length > 0) && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 bg-white p-8 rounded-3xl shadow-sm border border-slate-200"
              >
                <h3 className="text-xl font-bold mb-6 text-slate-800">Activity Analytics</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getChartData()}>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                      <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dx={-10} />
                      <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                        {getChartData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.name === 'Emergency' ? '#e11d48' : '#4f46e5'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {activeTab === 'emergency' && (
          <div className="max-w-4xl mx-auto pt-10 px-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] p-12 shadow-2xl border border-rose-100 text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-3 bg-rose-600"></div>
              <div className="bg-rose-100 w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-10 animate-pulse shadow-inner">
                <AlertTriangle className="text-rose-600 w-14 h-14" />
              </div>
              <h1 className="text-5xl font-black text-slate-900 mb-6 tracking-tighter uppercase italic">Emergency Protocol</h1>
              <div className="text-left bg-rose-50 p-8 rounded-3xl mb-12 max-w-2xl mx-auto">
                <h3 className="font-bold text-rose-800 mb-4 text-xl italic">Critical Symptoms List:</h3>
                <ul className="grid grid-cols-2 gap-3 text-rose-700 font-semibold">
                  <li>• Sudden Chest Pain</li>
                  <li>• Uncontrolled Bleeding</li>
                  <li>• Severe Allergic Reaction</li>
                  <li>• Difficulty Breathing</li>
                  <li>• Loss of Consciousness</li>
                  <li>• Sudden Confusion</li>
                </ul>
              </div>
              <p className="text-slate-500 text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
                HealthMate AI is for education only. In a life-threatening situation, every second counts.
              </p>
              
              <button 
                onClick={() => { findNearbyHospitals(); playClickSound(); }}
                className="w-full md:w-auto bg-rose-600 text-white px-16 py-8 rounded-3xl font-black text-3xl hover:bg-rose-700 transition-all shadow-2xl shadow-rose-200 active:scale-95 flex items-center justify-center gap-6 mx-auto group"
              >
                Find Nearby Hospitals
                <ShieldCheck className="w-10 h-10 group-hover:rotate-12 transition-transform" />
              </button>
            </motion.div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-slate-800 tracking-tight">User Settings</h1>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-rose-600" />
                Profile Preferences
              </h3>
              
              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Medical Measurement System</label>
                  <div className="flex gap-4">
                    {['Metric', 'Imperial'].map((sys) => (
                      <button
                        key={sys}
                        onClick={() => { setMetrics(sys); playClickSound(); }}
                        className={`flex-1 py-4 px-6 rounded-2xl font-bold transition-all border-2 ${
                          metrics === sys 
                            ? 'bg-rose-50 border-rose-600 text-rose-600 shadow-sm' 
                            : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                        }`}
                      >
                        {sys === 'Metric' ? 'Metric (kg, cm)' : 'Imperial (lb, in)'}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 mt-3 px-1 italic">
                    Your selection determines how vitals and medical report summaries are formatted.
                  </p>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <h4 className="font-bold text-slate-700 mb-2 text-sm uppercase">Account Information</h4>
                  <div className="bg-slate-50 p-4 rounded-xl flex justify-between items-center border border-slate-100">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">Active User</p>
                      <p className="font-semibold text-slate-800">{user}</p>
                    </div>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full uppercase">Active Session</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="max-w-4xl mx-auto pt-10 px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <header className="text-center mb-12">
                <h1 className="text-5xl font-black text-slate-800 tracking-tighter">About HealthMate</h1>
                <p className="text-slate-500 text-xl mt-4">Safety-first medical intelligence at your fingertips.</p>
              </header>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                  <ShieldCheck className="text-rose-600 w-12 h-12 mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Safety First</h3>
                  <p className="text-slate-600 leading-relaxed">HealthMate prioritizes emergency detection, ensuring high-risk symptoms bypass AI processing for immediate referral to professional care.</p>
                </div>
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                  <FileText className="text-indigo-600 w-12 h-12 mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Deep Insights</h3>
                  <p className="text-slate-600 leading-relaxed">Utilizes Gemini 1.5 Flash to parse complex clinical reports, extracting vitals and impressions for easy-to-understand educational summaries.</p>
                </div>
              </div>

              <div className="bg-slate-900 text-white p-10 rounded-[2.5rem] shadow-xl text-center">
                <h2 className="text-3xl font-bold mb-4">Educational Purpose Only</h2>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto italic opacity-80">
                  This platform is a prototype designed for education. It does not provide medical diagnoses, prescriptions, or final medical opinions. Always consult a licensed healthcare professional.
                </p>
              </div>
            </motion.div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Patient Records</h1>
            <div className="space-y-4">
              {history.map((item) => (
                <motion.div key={item.id} layout className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-rose-600 uppercase tracking-widest">{item.type}</span>
                    <span className="text-xs text-slate-400">{item.timestamp}</span>
                  </div>
                  <p className="text-sm line-clamp-3">{item.message}</p>
                </motion.div>
              ))} {/* History items */}
            </div>
          </div>
        )}

        {/* Quick Privacy Notice */}
        <div className="absolute bottom-8 right-8 text-[10px] text-slate-400 flex items-center gap-1 uppercase tracking-tighter">
          <ShieldCheck className="w-3 h-3" /> Secure Data Processing • No Permanent Storage
        </div>
      </main> {/* Main content area */}
    </div>
  );
};

const SidebarItem = ({ icon, label, active, onClick, open }) => (
  <button 
    onClick={() => { onClick(); playClickSound(); }}
    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 group ${
      active ? 'bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-lg shadow-rose-900/30' : 'hover:bg-white/5 text-slate-400 hover:text-white'
    }`}
  >
    <div className="w-6 h-6">{icon}</div>
    {open && <span className="font-semibold text-sm">{label}</span>}
  </button>
);

export default App;