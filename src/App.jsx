import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Clock, Users, Gift, Settings, UserPlus, Trophy, CheckCircle2, AlertCircle, MonitorPlay, LogOut, Plus, CalendarDays, ChevronLeft, Download, FileSpreadsheet, LayoutDashboard, Search, ChevronRight, Sparkles, Ticket, Pencil, Trash2, X, UserCircle2, MessageCircle, Tag, Camera, Image as ImageIcon } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, onSnapshot, addDoc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';

// --- CHAVES DO SEU FIREBASE (MJNPApp) ---
const firebaseConfig = {
  apiKey: "AIzaSyA4CwO1zUWBLavGHC15S1iOnw0ZB-0Hrvo",
  authDomain: "mjnpapp.firebaseapp.com",
  projectId: "mjnpapp",
  storageBucket: "mjnpapp.firebasestorage.app",
  messagingSenderId: "355853156332",
  appId: "1:355853156332:web:4b7f94637487f1122d0ac9",
  measurementId: "G-7BYNJ8785H"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'checkin-mjnpapp-v11'; 

export default function App() {
  const [user, setUser] = useState(null);
  const [isAppReady, setIsAppReady] = useState(false);
  const [receptionistName, setReceptionistName] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginInput, setLoginInput] = useState('');
  const [viewMode, setViewMode] = useState('events_dashboard');
  const [currentEvent, setCurrentEvent] = useState(null);

  const [toast, setToast] = useState({ visible: false, message: '', type: 'error' });
  const showToast = (message, type = 'error') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: '', type: 'error' }), 3500);
  };

  useEffect(() => {
    const initAuth = async () => {
      try { await signInAnonymously(auth); } catch (error) { console.error("Erro auth:", error); }
    };
    initAuth();
    
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAppReady(true);
    });

    const savedName = localStorage.getItem('checkin_v11_receptionist');
    if (savedName) {
      setReceptionistName(savedName);
      setIsLoggedIn(true);
    }
    return () => unsubscribe();
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!loginInput.trim()) return;
    setReceptionistName(loginInput.trim());
    localStorage.setItem('checkin_v11_receptionist', loginInput.trim());
    setIsLoggedIn(true);
    setViewMode('events_dashboard');
    showToast(`Bem-vindo(a), ${loginInput.trim()}!`, 'success');
  };

  const handleLogout = () => {
    localStorage.removeItem('checkin_v11_receptionist');
    setReceptionistName('');
    setIsLoggedIn(false);
    setCurrentEvent(null);
  };

  if (!isAppReady) return <LoadingScreen />;
  if (!isLoggedIn) return <LoginScreen loginInput={loginInput} setLoginInput={setLoginInput} handleLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-200 selection:text-blue-900 flex flex-col relative overflow-x-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-blue-400/15 rounded-full blur-[100px] mix-blend-multiply"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-yellow-400/15 rounded-full blur-[100px] mix-blend-multiply"></div>
      </div>

      {toast.visible && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[999] animate-in slide-in-from-top-4 fade-in duration-300">
          <div className={`flex items-center gap-3 px-6 py-3.5 rounded-full shadow-2xl font-extrabold text-sm border-2 backdrop-blur-xl ${
            toast.type === 'error' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'
          }`}>
            {toast.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
            {toast.message}
          </div>
        </div>
      )}

      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/50 sticky top-0 z-40 h-[76px] flex items-center shrink-0 shadow-sm">
        <div className="max-w-6xl w-full mx-auto px-4 md:px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {viewMode === 'workspace' && (
              <button onClick={() => { setViewMode('events_dashboard'); setCurrentEvent(null); }} className="text-slate-400 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 shadow-sm p-2 rounded-full transition-all active:scale-95">
                <ChevronLeft size={20} />
              </button>
            )}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-blue-500 rounded-[14px] flex items-center justify-center text-white shadow-lg shadow-blue-500/30 transform -rotate-3 border border-white/20">
                <Ticket size={20} className="transform rotate-3" />
              </div>
              <div className="flex flex-col justify-center">
                <h1 className="text-xl font-extrabold text-slate-800 leading-none tracking-tight">
                  {viewMode === 'workspace' && currentEvent ? currentEvent.name : 'Nuvem'}
                </h1>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>
                  <p className="text-slate-500 text-[10px] font-extrabold uppercase tracking-widest leading-none">Conectado</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2.5 px-4 py-2 bg-white border border-slate-200 shadow-sm rounded-full text-sm font-bold text-slate-600">
              <span className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-100 to-yellow-100 text-blue-700 flex items-center justify-center text-xs font-black shadow-inner">{receptionistName.charAt(0).toUpperCase()}</span>
              {receptionistName}
            </div>
            <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 bg-white border border-slate-200 shadow-sm hover:bg-red-50 hover:border-red-200 p-2.5 rounded-full transition-all active:scale-95"><LogOut size={18} /></button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col w-full h-full relative z-10">
        {viewMode === 'events_dashboard' ? <EventsDashboard user={user} db={db} appId={appId} onOpenEvent={(evt) => { setCurrentEvent(evt); setViewMode('workspace'); }} showToast={showToast} /> : <EventWorkspace user={user} db={db} appId={appId} event={currentEvent} receptionistName={receptionistName} showToast={showToast} />}
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-5">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-blue-600 font-black tracking-widest text-xs uppercase animate-pulse">Conectando Nuvem...</p>
      </div>
    </div>
  );
}

function LoginScreen({ loginInput, setLoginInput, handleLogin }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-yellow-400/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="bg-white/80 backdrop-blur-2xl p-8 md:p-12 rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-white w-full max-w-md text-center relative z-10">
        <div className="w-24 h-24 bg-gradient-to-tr from-blue-600 to-blue-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-blue-500/30 transform -rotate-12 border border-white/20">
          <Ticket size={40} className="text-white transform rotate-12" />
        </div>
        <h1 className="text-3xl font-black text-slate-800 mb-3 tracking-tight">Check-in <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-yellow-600">Inteligente</span></h1>
        <p className="text-slate-500 text-sm mb-10 font-medium">Identifique-se para acessar o painel de programações.</p>
        
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="text-left">
            <input type="text" value={loginInput} onChange={(e) => setLoginInput(e.target.value)} placeholder="Ex: Recepção, Nome" className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300 bg-slate-50 focus:bg-white text-center text-lg" required />
          </div>
          <button type="submit" className="w-full bg-slate-900 hover:bg-blue-600 text-white font-black py-4 px-4 rounded-2xl transition-all active:scale-[0.98] shadow-xl shadow-slate-900/10 hover:shadow-blue-600/30 text-lg flex items-center justify-center gap-2">Acessar Sistema <ChevronRight size={20} /></button>
        </form>
      </div>
    </div>
  );
}

function EventsDashboard({ user, db, appId, onOpenEvent, showToast }) {
  const [events, setEvents] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [deletingEvent, setDeletingEvent] = useState(null);
  const [formName, setFormName] = useState('');
  const [formDate, setFormDate] = useState('');

  useEffect(() => {
    if (!user) return;
    const q = collection(db, 'artifacts', appId, 'public', 'data', 'events');
    const unsub = onSnapshot(q, (snap) => {
      const evts = []; snap.forEach(d => evts.push({ id: d.id, ...d.data() })); setEvents(evts.sort((a, b) => b.createdAt - a.createdAt));
    });
    return () => unsub();
  }, [user]);

  const openCreateModal = () => { setFormName(''); setFormDate(new Date().toISOString().split('T')[0]); setIsCreating(true); };
  const openEditModal = (evt, e) => { e.stopPropagation(); setFormName(evt.name); setFormDate(evt.date); setEditingEvent(evt); };
  const openDeleteModal = (evt, e) => { e.stopPropagation(); setDeletingEvent(evt); };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingEvent) {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'events', editingEvent.id), { name: formName.trim(), date: formDate });
      setEditingEvent(null); showToast('Programação atualizada com sucesso!', 'success');
    } else {
      const newEvent = { name: formName.trim(), date: formDate, createdAt: Date.now(), createdBy: user.uid, status: 'active' };
      const docRef = await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'events'), newEvent);
      // Incluído o novo parâmetro: enablePhoto
      const defaultSettings = { rule1Time: '09:10', rule1Weight: 2, rule2Time: '09:30', rule2Weight: 1, requireWhatsApp: false, enableClassification: false, enablePhoto: false };
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'configs', `config_${docRef.id}`), defaultSettings);
      setIsCreating(false); showToast('Programação criada com sucesso!', 'success'); onOpenEvent({ id: docRef.id, ...newEvent, isNew: true });
    }
  };

  const confirmDelete = async () => {
    if(!deletingEvent) return;
    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'events', deletingEvent.id));
    setDeletingEvent(null); showToast('Programação removida.', 'success');
  };

  return (
    <div className="flex-1 p-6 md:p-10 max-w-6xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div><h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Painel de Eventos</h2><p className="text-slate-500 font-medium">Selecione uma sala para iniciar o check-in ou crie uma nova.</p></div>
        <button onClick={openCreateModal} className="bg-slate-900 hover:bg-blue-600 text-white font-extrabold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-slate-900/10 hover:shadow-blue-600/30 active:scale-[0.98]"><Plus size={20} /> Nova Programação</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map(evt => (
          <div key={evt.id} className="relative group flex flex-col bg-white/80 backdrop-blur-xl border-2 border-slate-100 hover:border-blue-300 shadow-xl shadow-slate-200/30 hover:shadow-2xl hover:shadow-blue-500/15 rounded-[2.5rem] transition-all duration-300 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-400/10 to-transparent rounded-bl-full -z-10 group-hover:scale-125 transition-transform duration-500"></div>
            <div className="absolute top-5 right-5 flex items-center gap-2 z-20 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
               <button onClick={(e) => openEditModal(evt, e)} className="bg-white/90 border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 p-2 rounded-xl shadow-sm transition-colors"><Pencil size={16} /></button>
               <button onClick={(e) => openDeleteModal(evt, e)} className="bg-white/90 border border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-200 p-2 rounded-xl shadow-sm transition-colors"><Trash2 size={16} /></button>
            </div>
            <div onClick={() => onOpenEvent(evt)} className="p-7 flex-1 flex flex-col cursor-pointer active:scale-[0.98] transition-transform">
              <div className="flex items-start justify-between w-full mb-5"><div className="bg-slate-50 text-slate-400 p-3.5 rounded-[1.25rem] group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors shadow-sm"><CalendarDays size={24} /></div></div>
              <h3 className="font-black text-xl text-slate-800 leading-tight mb-8 line-clamp-2 group-hover:text-blue-700 transition-colors pr-12">{evt.name}</h3>
              <div className="mt-auto w-full flex justify-between items-center bg-slate-50 border border-slate-100 px-5 py-3.5 rounded-2xl group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
                <span className="text-xs font-extrabold text-slate-500 flex items-center gap-2 group-hover:text-blue-600 transition-colors uppercase tracking-wider"><Clock size={14} /> {evt.date.split('-').reverse().join('/')}</span>
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-slate-300 group-hover:text-blue-600 transition-colors"><ChevronRight size={16} /></div>
              </div>
            </div>
          </div>
        ))}
        {events.length === 0 && !isCreating && !editingEvent && (
          <div className="col-span-full py-24 text-center border-2 border-dashed border-slate-200 rounded-[3rem] bg-slate-50/50 backdrop-blur-sm"><div className="w-20 h-20 bg-white shadow-sm rounded-full flex items-center justify-center mx-auto mb-5"><LayoutDashboard size={32} className="text-slate-300" /></div><p className="text-slate-700 font-black text-xl">Nenhuma programação encontrada.</p><p className="text-slate-500 font-medium mt-2">Clique em "Nova Programação" para começar.</p></div>
        )}
      </div>

      {(isCreating || editingEvent) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-white rounded-[3rem] p-8 md:p-10 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 border border-white">
            <h3 className="text-2xl font-black text-slate-800 mb-6 tracking-tight flex items-center gap-2"><Sparkles className="text-blue-500" /> {editingEvent ? 'Editar Programação' : 'Criar Programação'}</h3>
            <form onSubmit={handleSaveEvent} className="space-y-5">
              <div><label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Nome do Evento</label><input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Ex: Culto de Domingo" className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-800 font-bold bg-slate-50 focus:bg-white" required autoFocus /></div>
              <div><label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Data</label><input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-800 font-bold bg-slate-50 focus:bg-white" required /></div>
              <div className="flex gap-3 pt-5">
                <button type="button" onClick={() => { setIsCreating(false); setEditingEvent(null); }} className="flex-1 px-4 py-4 bg-slate-100 text-slate-500 font-black rounded-2xl hover:bg-slate-200 transition-colors active:scale-95">Cancelar</button>
                <button type="submit" className="flex-[2] px-4 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30 active:scale-95">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deletingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-white rounded-[3rem] p-8 md:p-10 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 text-center">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6"><AlertCircle size={40} /></div>
            <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">Excluir Evento?</h3>
            <p className="text-slate-500 font-medium mb-8">Esta ação removerá "{deletingEvent.name}" do painel.</p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setDeletingEvent(null)} className="flex-1 px-4 py-4 bg-slate-100 text-slate-500 font-black rounded-2xl hover:bg-slate-200 transition-colors active:scale-95">Cancelar</button>
              <button type="button" onClick={confirmDelete} className="flex-1 px-4 py-4 bg-red-500 text-white font-black rounded-2xl hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30 active:scale-95">Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EventWorkspace({ user, db, appId, event, receptionistName, showToast }) {
  const [activeTab, setActiveTab] = useState(event.isNew ? 'settings' : 'checkin');
  const [visitors, setVisitors] = useState([]);
  const [winners, setWinners] = useState([]);
  // Adicionado enablePhoto no state padrão
  const [config, setConfig] = useState({ rule1Time: '09:10', rule1Weight: 2, rule2Time: '09:30', rule2Weight: 1, requireWhatsApp: false, enableClassification: false, enablePhoto: false });
  const [drawState, setDrawState] = useState({ isDrawing: false, winner: null, drawType: null });

  const [newName, setNewName] = useState('');
  const [newTime, setNewTime] = useState('');
  const [isAutoTime, setIsAutoTime] = useState(true);
  const [isVisitor, setIsVisitor] = useState(false);
  const [whatsapp, setWhatsapp] = useState('');
  const [classification, setClassification] = useState('');
  
  // NOVO: Estado para armazenar a foto capturada
  const [photoBase64, setPhotoBase64] = useState(null);

  useEffect(() => {
    if (!user || !event) return;
    const colVis = collection(db, 'artifacts', appId, 'public', 'data', `visitors_${event.id}`);
    const colWin = collection(db, 'artifacts', appId, 'public', 'data', `winners_${event.id}`);
    const docConf = doc(db, 'artifacts', appId, 'public', 'data', 'configs', `config_${event.id}`);
    const docDraw = doc(db, 'artifacts', appId, 'public', 'data', 'engines', `engine_${event.id}`);

    const unsubVis = onSnapshot(colVis, snap => { const d=[]; snap.forEach(x=>d.push({id:x.id,...x.data()})); setVisitors(d.sort((a,b)=>new Date(b.timestamp)-new Date(a.timestamp)));});
    const unsubWin = onSnapshot(colWin, snap => { const d=[]; snap.forEach(x=>d.push({id:x.id,...x.data()})); setWinners(d.sort((a,b)=>new Date(b.timestamp)-new Date(a.timestamp)));});
    const unsubConf = onSnapshot(docConf, snap => { if(snap.exists()) setConfig(snap.data());});
    const unsubDraw = onSnapshot(docDraw, snap => { if(snap.exists()) setDrawState(snap.data());});

    return () => { unsubVis(); unsubWin(); unsubConf(); unsubDraw(); };
  }, [user, event.id]);

  useEffect(() => {
    if (!isAutoTime) return;
    const updateTime = () => {
      const now = new Date();
      setNewTime(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, [isAutoTime]);

  const timeToMinutes = (t) => { if(!t)return 0; const [h,m]=t.split(':').map(Number); return h*60+m; };

  // --- ENGINE DE COMPRESSÃO DE FOTO ---
  const handlePhotoCapture = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Redimensiona a foto para 250px de largura para ficar MUITO LEVE no banco de dados
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 250;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Converte para JPEG otimizado
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        setPhotoBase64(compressedBase64);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleAddVisitor = async (e) => {
    e.preventDefault();
    if (!newName.trim() || !user) return;

    const needsWhatsapp = config.requireWhatsApp || isVisitor;
    if (needsWhatsapp && !whatsapp.trim()) {
       showToast("Por favor, preencha o número de WhatsApp.", "error");
       return;
    }

    let finalTime = isAutoTime ? `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}` : newTime;
    const arr = timeToMinutes(finalTime);
    let weight = 0;
    
    if (arr <= timeToMinutes(config.rule1Time)) weight = config.rule1Weight;
    else if (arr <= timeToMinutes(config.rule2Time)) weight = config.rule2Weight;

    const newVisitor = {
      name: newName.trim(), arrivalTime: finalTime, weight: weight, hasWon: false,
      timestamp: new Date().toISOString(), registeredBy: receptionistName, registeredById: user.uid,
      isVisitor: isVisitor, whatsapp: needsWhatsapp ? whatsapp.trim() : '', classification: config.enableClassification ? classification : '',
      photo: photoBase64 // Salva a foto se houver
    };

    setNewName(''); setIsVisitor(false); setWhatsapp(''); setClassification(''); setPhotoBase64(null);
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', `visitors_${event.id}`), newVisitor);
    showToast(`Registrado: ${newVisitor.name}`, 'success');
  };

  const updateConfig = async (key, value) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'configs', `config_${event.id}`), newConfig);
  };

  const runDraw = async (type) => {
    let pool = [];
    visitors.forEach(v => {
      if (!v.hasWon) {
        if (type === 'punctual' && v.weight > 0) { for (let i = 0; i < v.weight; i++) pool.push(v); } 
        else if (type === 'general') { pool.push(v); }
      }
    });

    if (pool.length === 0) {
      if (type === 'punctual') showToast("Não há ninguém elegível para pontualidade! (Todos chegaram após a tolerância ou já ganharam)", "error");
      else showToast("A sala não tem participantes disponíveis para o sorteio.", "error");
      return; 
    }

    const winner = pool[Math.floor(Math.random() * pool.length)];
    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'engines', `engine_${event.id}`), {
      isDrawing: true, winner: winner, drawType: type, initiator: user.uid, timestamp: Date.now()
    });
  };

  const exportToCSV = () => {
    if (visitors.length === 0) { showToast("Ainda não há dados para exportar.", "error"); return; }
    let csvContent = "Nome Completo,Horario Chegada,Chances no Sorteio,Ganhou?,Registrado Por,Visitante?,WhatsApp,Classificacao\n";
    visitors.forEach(v => {
      csvContent += `"${v.name}","${v.arrivalTime}",${v.weight},${v.hasWon ? "Sim" : "Nao"},"${v.registeredBy || 'Sistema'}","${v.isVisitor ? 'Sim' : 'Nao'}","${v.whatsapp || ''}","${v.classification || ''}"\n`;
    });
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Relatorio_${event.name.replace(/\s+/g, '_')}.csv`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Download iniciado!", "success");
  };

  const resetAllData = async () => {
    if(!confirm("Atenção! Todos os dados desta sala serão apagados. Deseja continuar?")) return;
    visitors.forEach(v => deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', `visitors_${event.id}`, v.id)));
    winners.forEach(w => deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', `winners_${event.id}`, w.id)));
    showToast("Dados da sala excluídos.", "success");
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {drawState.isDrawing && drawState.winner && (
        <VIPCardCarouselAnimation drawState={drawState} visitors={visitors} user={user} db={db} appId={appId} eventId={event.id} />
      )}

      <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-32 md:pb-8">
        <div className="max-w-5xl mx-auto w-full">
          <div className="hidden md:flex justify-center mb-10">
            <div className="bg-white/80 backdrop-blur-md p-2 rounded-full shadow-lg shadow-slate-200/40 border border-slate-100 flex gap-2">
              {[{ id: 'checkin', icon: UserPlus, label: 'Entrada' }, { id: 'draw', icon: Gift, label: 'Sorteios' }, { id: 'settings', icon: Settings, label: 'Configurações' }].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-black uppercase tracking-widest transition-all duration-300 ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}>
                  <tab.icon size={18} /> {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
            {/* ================================================== */}
            {/* ABA 1: CHECK-IN */}
            {/* ================================================== */}
            {activeTab === 'checkin' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-white/90 backdrop-blur-md p-8 md:p-10 rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-white">
                    <h2 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-4"><div className="bg-blue-100 text-blue-600 p-3.5 rounded-2xl shadow-inner"><UserPlus size={24} /></div>Novo Registro</h2>
                    <form onSubmit={handleAddVisitor} className="space-y-6">
                      
                      {/* FOTO E NOME */}
                      <div className="flex items-center gap-4">
                        {config.enablePhoto && (
                          <div className="relative shrink-0">
                            {photoBase64 ? (
                              <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden border-2 border-blue-500 shadow-md group">
                                <img src={photoBase64} alt="Foto" className="w-full h-full object-cover" />
                                <button type="button" onClick={() => setPhotoBase64(null)} className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <X size={24} className="text-white" />
                                </button>
                              </div>
                            ) : (
                              <label className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-blue-50 border-2 border-dashed border-blue-200 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-100 hover:border-blue-300 transition-all text-blue-500">
                                <Camera size={24} />
                                <input type="file" accept="image/*" capture="environment" onChange={handlePhotoCapture} className="hidden" />
                              </label>
                            )}
                          </div>
                        )}
                        <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full flex-1 px-6 py-5 rounded-3xl border-2 border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none text-slate-800 font-bold placeholder:text-slate-300 transition-all bg-slate-50 focus:bg-white text-xl" placeholder="Nome completo..." required />
                      </div>

                      <div className="flex flex-col gap-4">
                        {config.enableClassification && (
                          <div className="relative animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none"><Tag size={20} className="text-slate-400" /></div>
                            <select value={classification} onChange={(e) => setClassification(e.target.value)} className="w-full pl-14 pr-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 outline-none font-bold text-slate-700 bg-slate-50 focus:bg-white appearance-none cursor-pointer">
                              <option value="" disabled>Classificação de Público (Opcional)</option>
                              <option value="Jovem">Jovem</option>
                              <option value="Adolescente">Adolescente</option>
                              <option value="Outra Igreja/Denominação">Outra Igreja/Denominação</option>
                              <option value="Em Aberto">Em Aberto</option>
                            </select>
                          </div>
                        )}
                        <div className="flex items-center">
                          <button type="button" onClick={() => setIsVisitor(!isVisitor)} className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl font-black text-sm transition-all duration-300 w-full sm:w-auto justify-center ${isVisitor ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-500 shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                             {isVisitor ? <CheckCircle2 size={18}/> : <div className="w-4 h-4 rounded-full border-2 border-slate-400"/>} Sou Visitante
                          </button>
                        </div>
                        {(config.requireWhatsApp || isVisitor) && (
                          <div className="animate-in fade-in slide-in-from-top-2 duration-300 relative">
                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none"><MessageCircle size={20} className={isVisitor ? "text-yellow-600" : "text-emerald-500"} /></div>
                            <input type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className={`w-full pl-14 pr-6 py-4 rounded-2xl border-2 focus:ring-4 outline-none font-bold text-slate-800 transition-all ${isVisitor ? 'border-yellow-100 focus:border-yellow-500 focus:ring-yellow-500/10 bg-yellow-50 focus:bg-white placeholder:text-yellow-300' : 'border-slate-100 focus:border-emerald-500 focus:ring-emerald-500/10 bg-slate-50 focus:bg-white placeholder:text-slate-300'}`} placeholder="WhatsApp (DDD + Número)" required={config.requireWhatsApp || isVisitor} />
                          </div>
                        )}
                      </div>
                      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-center gap-5">
                        <div className="flex-1 flex items-center gap-4"><Clock size={28} className="text-slate-300" /><input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} disabled={isAutoTime} className={`w-full bg-transparent outline-none font-mono text-3xl font-black tracking-tighter ${isAutoTime ? 'text-slate-300 cursor-not-allowed' : 'text-blue-600'}`} required /></div>
                        <div className="h-12 w-[2px] bg-slate-200 rounded-full"></div>
                        <div className="flex flex-col items-center"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Auto</span><button type="button" onClick={() => setIsAutoTime(!isAutoTime)} className={`${isAutoTime ? 'bg-emerald-500' : 'bg-slate-300'} relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out shadow-inner`}><span className={`${isAutoTime ? 'translate-x-7' : 'translate-x-1'} inline-block h-6 w-6 mt-1 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out`} /></button></div>
                      </div>
                      <button type="submit" className="w-full bg-slate-900 hover:bg-blue-600 text-white font-black py-5 rounded-3xl transition-all active:scale-[0.98] flex justify-center items-center gap-3 shadow-xl shadow-slate-900/10 hover:shadow-blue-600/30 text-xl mt-4"><CheckCircle2 size={24} /> Salvar Presença</button>
                    </form>
                  </div>
                </div>

                <div className="bg-white/90 backdrop-blur-md p-6 md:p-8 rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-white flex flex-col h-full max-h-[75vh]">
                  <div className="flex items-center justify-between mb-6 shrink-0 px-2"><h3 className="text-xl font-black text-slate-800 flex items-center gap-3">Listagem</h3><div className="flex items-center gap-2"><span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total</span><span className="bg-slate-100 text-slate-800 font-black py-1.5 px-4 rounded-full text-sm border border-slate-200">{visitors.length}</span></div></div>
                  {visitors.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-10"><div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-5 border-2 border-dashed border-slate-200"><Users size={32} className="text-slate-300" /></div><p className="font-bold text-lg text-slate-500">A sala está vazia.</p></div>
                  ) : (
                    <div className="overflow-y-auto pr-2 custom-scrollbar flex-1 space-y-3">
                      {visitors.map(v => (
                        <div key={v.id} className={`flex items-center justify-between p-4 rounded-3xl border-2 transition-all hover:scale-[1.01] ${v.hasWon ? 'bg-emerald-50/50 border-emerald-100' : 'bg-white border-slate-50 hover:border-slate-100 hover:shadow-sm'}`}>
                          <div className="flex items-center gap-4">
                            {/* Renderiza foto ou inicial */}
                            {v.photo ? (
                              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-sm overflow-hidden border-2 ${v.hasWon ? 'border-emerald-300' : 'border-slate-200'}`}>
                                <img src={v.photo} alt={v.name} className="w-full h-full object-cover" />
                              </div>
                            ) : (
                              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-sm ${v.hasWon ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                {v.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="flex flex-col">
                              <span className="font-black text-slate-800 text-base flex items-center gap-2">{v.name} {v.hasWon && <Trophy size={16} className="text-emerald-500" />}</span>
                              <span className="text-xs text-slate-500 font-bold flex items-center gap-1.5 mt-1 uppercase tracking-wider"><Clock size={12} className="text-slate-300" /> {v.arrivalTime} <span className="text-slate-300">•</span> {v.registeredBy || 'Sis'}</span>
                              {(v.isVisitor || v.classification || v.whatsapp) && (
                                <div className="flex flex-wrap gap-1.5 mt-2.5">
                                  {v.isVisitor && <span className="text-[9px] bg-yellow-100 text-yellow-700 px-2.5 py-0.5 rounded-lg font-black uppercase tracking-widest border border-yellow-200">Visitante</span>}
                                  {v.classification && <span className="text-[9px] bg-blue-100 text-blue-600 px-2.5 py-0.5 rounded-lg font-black uppercase tracking-widest border border-blue-200">{v.classification}</span>}
                                  {v.whatsapp && <span className="text-[9px] bg-emerald-100 text-emerald-600 px-2.5 py-0.5 rounded-lg font-black uppercase tracking-widest flex items-center gap-1 border border-emerald-200"><MessageCircle size={10}/> WP</span>}
                                </div>
                              )}
                            </div>
                          </div>
                          <div>
                            {v.hasWon ? <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-full shadow-sm">Ganhou</span> : 
                             v.weight > 0 ? <span className="text-[10px] font-black uppercase tracking-widest text-blue-700 bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-full shadow-sm">{v.weight}x</span> : 
                             <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-full shadow-sm">Geral</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ================================================== */}
            {/* ABA 2: SORTEIOS */}
            {/* ================================================== */}
            {activeTab === 'draw' && (
              <div className="space-y-8 max-w-4xl mx-auto">
                <div className="bg-gradient-to-r from-blue-100 to-yellow-100 border border-white rounded-[2rem] p-6 flex flex-col md:flex-row items-center gap-5 shadow-xl shadow-blue-500/10">
                  <div className="bg-white text-blue-600 p-4 rounded-2xl shadow-md shrink-0"><MonitorPlay size={28} /></div>
                  <div className="text-center md:text-left"><h4 className="font-black text-blue-900 text-lg">Transmissão Ao Vivo Ativa</h4><p className="text-sm text-blue-800/80 font-bold mt-1">Inicie o sorteio abaixo. Todos os celulares e telões conectados verão a animação simultaneamente.</p></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-white flex flex-col items-center text-center group hover:scale-[1.02] transition-all duration-300">
                    <div className="w-28 h-28 bg-gradient-to-tr from-blue-600 to-yellow-600 rounded-[2rem] flex items-center justify-center mb-8 shadow-xl shadow-blue-500/30 transform group-hover:rotate-6 transition-transform border border-white/20"><Trophy size={48} className="text-white" /></div>
                    <h2 className="text-3xl font-black text-slate-800 mb-3 tracking-tight">Pontualidade</h2>
                    <p className="text-slate-500 font-medium mb-10 text-sm px-4">Utiliza as regras de peso. Quem chegou cedo tem mais cartões na roleta.</p>
                    <button onClick={() => runDraw('punctual')} className="w-full bg-slate-900 hover:bg-blue-600 text-white font-black py-5 rounded-2xl transition-all shadow-xl active:scale-95 text-lg flex items-center justify-center gap-2">Sortear Agora <Sparkles size={20} /></button>
                  </div>
                  <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-white flex flex-col items-center text-center group hover:scale-[1.02] transition-all duration-300">
                    <div className="w-28 h-28 bg-gradient-to-tr from-emerald-400 to-blue-600 rounded-[2rem] flex items-center justify-center mb-8 shadow-xl shadow-emerald-500/30 transform group-hover:-rotate-6 transition-transform border border-white/20"><Gift size={48} className="text-white" /></div>
                    <h2 className="text-3xl font-black text-slate-800 mb-3 tracking-tight">Sorteio Geral</h2>
                    <p className="text-slate-500 font-medium mb-10 text-sm px-4">Ignora horários. Todos que não ganharam têm 1x chance igualitária.</p>
                    <button onClick={() => runDraw('general')} className="w-full bg-slate-900 hover:bg-emerald-500 text-white font-black py-5 rounded-2xl transition-all shadow-xl active:scale-95 text-lg flex items-center justify-center gap-2">Sortear Geral <Gift size={20} /></button>
                  </div>
                </div>
                <div className="bg-white/90 backdrop-blur-xl rounded-[3rem] p-8 md:p-10 shadow-2xl shadow-slate-200/50 border border-white mt-10">
                  <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-4 tracking-tight"><div className="bg-yellow-100 text-yellow-600 p-3.5 rounded-2xl shadow-inner"><Trophy size={24} /></div>Hall de Ganhadores</h3>
                  {winners.length === 0 ? <div className="text-center py-10 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200"><p className="text-slate-400 font-bold text-lg">O pódio está vazio.</p></div> : (
                    <div className="space-y-4">
                      {winners.map((w, index) => (
                        <div key={w.id} className="flex items-center gap-5 p-5 rounded-3xl bg-white border-2 border-slate-100 hover:border-yellow-300 transition-colors shadow-sm">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-yellow-400 to-blue-300 text-blue-900 font-black text-2xl flex items-center justify-center shadow-lg shadow-yellow-400/20 border border-white/50 overflow-hidden">
                             {w.photo ? <img src={w.photo} alt="Winner" className="w-full h-full object-cover" /> : `#${winners.length - index}`}
                          </div>
                          <div className="flex-1"><h4 className="font-black text-xl text-slate-800">{w.name}</h4><p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-2"><span className="bg-slate-100 px-2 py-0.5 rounded text-slate-500">{w.drawType === 'punctual' ? 'Pontualidade' : 'Geral'}</span><Clock size={12} /> {w.wonAt}</p></div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ================================================== */}
            {/* ABA 3: AJUSTES E RELATÓRIOS */}
            {/* ================================================== */}
            {activeTab === 'settings' && (
              <div className="space-y-8 max-w-3xl mx-auto">
                <div className="bg-white/90 backdrop-blur-xl p-8 md:p-10 rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-white">
                  <h3 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-4 tracking-tight"><div className="bg-slate-100 text-slate-600 p-3.5 rounded-2xl shadow-inner"><Settings size={24} /></div>Regras & Parametrização</h3>
                  <div className="grid sm:grid-cols-2 gap-8">
                    <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 shadow-sm">
                      <div className="font-black text-slate-800 mb-6 flex items-center gap-3 text-lg"><span className="w-4 h-4 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.6)] animate-pulse"></span> Super Pontual</div>
                      <div className="space-y-6">
                        <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2.5">Horário Limite</label><input type="time" value={config.rule1Time} onChange={(e) => updateConfig('rule1Time', e.target.value)} className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 focus:border-blue-500 outline-none font-mono font-bold text-slate-700 bg-white text-xl" /></div>
                        <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2.5">Chances no Sorteio</label><select value={config.rule1Weight} onChange={(e) => updateConfig('rule1Weight', Number(e.target.value))} className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 focus:border-blue-500 outline-none bg-white font-black text-slate-700 text-lg"><option value={1}>1x Chance</option><option value={2}>2x Chances</option><option value={3}>3x Chances</option><option value={5}>5x Chances</option></select></div>
                      </div>
                    </div>
                    <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 shadow-sm">
                      <div className="font-black text-slate-800 mb-6 flex items-center gap-3 text-lg"><span className="w-4 h-4 rounded-full bg-slate-400 shadow-sm"></span> Tolerância</div>
                      <div className="space-y-6">
                        <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2.5">Horário Limite</label><input type="time" value={config.rule2Time} onChange={(e) => updateConfig('rule2Time', e.target.value)} className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 focus:border-blue-500 outline-none font-mono font-bold text-slate-700 bg-white text-xl" /></div>
                        <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2.5">Chances no Sorteio</label><select value={config.rule2Weight} onChange={(e) => updateConfig('rule2Weight', Number(e.target.value))} className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 focus:border-blue-500 outline-none bg-white font-black text-slate-700 text-lg"><option value={1}>1x Chance</option><option value={2}>2x Chances</option></select></div>
                      </div>
                    </div>
                    <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 shadow-sm sm:col-span-2">
                      <div className="font-black text-slate-800 mb-6 flex items-center gap-3 text-lg"><span className="w-4 h-4 rounded-full bg-emerald-400 shadow-sm"></span> Campos e Formulário</div>
                      <div className="grid sm:grid-cols-2 gap-6">
                        {/* NOVO: Habilitar Foto */}
                        <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-100 shadow-sm sm:col-span-2">
                          <div className="flex items-center gap-3">
                            <div className="bg-blue-50 text-blue-500 p-2 rounded-xl"><ImageIcon size={20} /></div>
                            <div><p className="font-black text-slate-800 text-sm">Capturar Foto do Visitante</p><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Exibe a foto no momento do sorteio no telão</p></div>
                          </div>
                          <button type="button" onClick={() => updateConfig('enablePhoto', !config.enablePhoto)} className={`${config.enablePhoto ? 'bg-blue-500' : 'bg-slate-300'} relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out shadow-inner`}><span className={`${config.enablePhoto ? 'translate-x-7' : 'translate-x-1'} inline-block h-6 w-6 mt-1 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out`} /></button>
                        </div>
                        <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                          <div><p className="font-black text-slate-800 text-sm">Exigir WhatsApp</p><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Para todos os registros</p></div>
                          <button type="button" onClick={() => updateConfig('requireWhatsApp', !config.requireWhatsApp)} className={`${config.requireWhatsApp ? 'bg-emerald-500' : 'bg-slate-300'} relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out shadow-inner`}><span className={`${config.requireWhatsApp ? 'translate-x-7' : 'translate-x-1'} inline-block h-6 w-6 mt-1 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out`} /></button>
                        </div>
                        <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                          <div><p className="font-black text-slate-800 text-sm">Classificação</p><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Jovem, Adolescente, etc</p></div>
                          <button type="button" onClick={() => updateConfig('enableClassification', !config.enableClassification)} className={`${config.enableClassification ? 'bg-blue-500' : 'bg-slate-300'} relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out shadow-inner`}><span className={`${config.enableClassification ? 'translate-x-7' : 'translate-x-1'} inline-block h-6 w-6 mt-1 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out`} /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                  {event.isNew && <div className="mt-10"><button onClick={() => setActiveTab('checkin')} className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-blue-600 transition-all text-lg active:scale-95">Salvar Regras e Iniciar 🚀</button></div>}
                </div>

                <div className="bg-white/90 backdrop-blur-xl p-8 md:p-10 rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-white">
                  <h3 className="text-2xl font-black text-slate-800 mb-8 flex items-center gap-4 tracking-tight"><div className="bg-emerald-100 text-emerald-600 p-3.5 rounded-2xl shadow-inner"><FileSpreadsheet size={24} /></div>Extração de Dados</h3>
                  <div className="bg-emerald-50 border border-emerald-100 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
                    <div className="text-center md:text-left"><h4 className="font-black text-slate-800 text-xl">Download (Excel/CSV)</h4><p className="text-sm font-bold text-slate-500 mt-2 leading-relaxed">Gere a planilha da sala contendo: Nome, Horário, Chances e quem efetuou o registro.</p></div>
                    <button onClick={exportToCSV} className="w-full md:w-auto shrink-0 bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 px-8 rounded-2xl flex items-center justify-center gap-3 transition-colors shadow-xl shadow-emerald-500/30 active:scale-95 text-lg"><Download size={24} /> Exportar Planilha</button>
                  </div>
                  {!event.isNew && <div className="mt-10 pt-8 border-t border-slate-100 flex justify-center"><button onClick={resetAllData} className="text-red-500 hover:text-red-700 bg-white hover:bg-red-50 font-black py-3 px-8 rounded-full transition-colors text-sm border-2 border-transparent hover:border-red-100">Zerar dados do evento (Cuidado)</button></div>}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <div className="md:hidden fixed bottom-6 left-4 right-4 z-50">
        <div className="bg-white/90 backdrop-blur-2xl rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.15)] p-2 flex justify-between border border-white/50">
          {[{ id: 'checkin', icon: UserPlus, label: 'Entrada' }, { id: 'draw', icon: Gift, label: 'Sorteio' }, { id: 'settings', icon: Settings, label: 'Ajustes' }].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-[1.5rem] w-full transition-all duration-300 ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-lg scale-100' : 'text-slate-400 hover:text-slate-800 scale-95'}`}><tab.icon size={22} className="mb-1" /><span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span></button>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- CARROSSEL VIP COM FOTO ---
function VIPCardCarouselAnimation({ drawState, visitors, user, db, appId, eventId }) {
  const [spinPhase, setSpinPhase] = useState('spinning');
  const trackRef = useRef(null);
  
  const slotCount = 45; 
  
  // Agora o slotItems armazena o Objeto Inteiro (para termos nome e foto)
  const slotItems = useMemo(() => {
    let items = [];
    const pool = visitors.length > 0 ? visitors : [{ name: 'Sorteado', photo: null }];
    for(let i=0; i < slotCount - 1; i++) {
      items.push(pool[Math.floor(Math.random() * pool.length)]);
    }
    // O último item é o vencedor de fato (com a foto dele do BD)
    items.push(drawState.winner || { name: 'Visitante', photo: null }); 
    return items;
  }, [drawState.winner, visitors]);

  useEffect(() => {
    const timerStop = setTimeout(() => {
      setSpinPhase('stopped');
      createConfetti();
      const timerEnd = setTimeout(() => { if (drawState.initiator === user?.uid) finalizeDrawData(); }, 5000); 
      return () => clearTimeout(timerEnd);
    }, 5500); 

    if (trackRef.current && spinPhase === 'spinning') {
      trackRef.current.style.transition = 'none';
      trackRef.current.style.transform = 'translate3d(0, 0, 0)';
      void trackRef.current.offsetWidth; 
      trackRef.current.style.transition = 'transform 5.5s cubic-bezier(0.1, 0.8, 0.1, 1)';
      const offset = (slotCount - 1) * 18; 
      trackRef.current.style.transform = `translate3d(-${offset}rem, 0, 0)`;
    }
    return () => clearTimeout(timerStop);
  }, []); 

  const finalizeDrawData = async () => {
    if(!drawState.winner?.id) return;
    const { winner, drawType } = drawState;
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', `winners_${eventId}`), { ...winner, drawType, wonAt: new Date().toLocaleTimeString(), timestamp: new Date().toISOString() });
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', `visitors_${eventId}`, winner.id), { hasWon: true });
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'engines', `engine_${eventId}`), { isDrawing: false });
  };

  const createConfetti = () => {
    const canvas = document.getElementById('confetti-canvas-vip');
    if(!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    const colors = ['#003b91', '#0050c7', '#0ea5e9', '#ca8a04', '#1d4ed8', '#ffffff'];
    const pieces = Array.from({length: 250}).map(() => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height - canvas.height,
      vx: (Math.random() - 0.5) * 15, vy: (Math.random() + 1) * 8,
      size: Math.random() * 14 + 8, color: colors[Math.floor(Math.random() * colors.length)], rot: Math.random() * 360
    }));

    const render = () => {
      ctx.clearRect(0,0, canvas.width, canvas.height);
      let active = false;
      pieces.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.2; p.rot += p.vx;
        if(p.y < canvas.height) active = true;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot * Math.PI / 180);
        ctx.fillStyle = p.color; ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size); ctx.restore();
      });
      if(active) requestAnimationFrame(render);
    };
    render();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-2xl flex flex-col items-center justify-center overflow-hidden">
      <canvas id="confetti-canvas-vip" className="absolute inset-0 pointer-events-none z-[101]" />
      <div className="absolute top-12 left-0 right-0 text-center z-[102] animate-in slide-in-from-top-10 duration-700">
        <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 text-white rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md border border-white/20 mb-6 shadow-xl"><Sparkles size={16} className="text-yellow-400" />{drawState.drawType === 'punctual' ? 'Sorteio Pontualidade' : 'Sorteio Geral'}</div>
        <h2 className={`text-5xl md:text-7xl font-black text-white tracking-tight drop-shadow-2xl transition-all duration-700 ${spinPhase === 'stopped' ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-500 scale-110' : ''}`}>{spinPhase === 'spinning' ? 'SORTEANDO...' : 'VENCEDOR!'}</h2>
      </div>
      <div className="relative w-full h-[500px] flex items-center z-[102] overflow-hidden mt-16">
        <div className="absolute top-0 bottom-0 left-1/2 transform -translate-x-1/2 w-[18rem] bg-white/5 border-x-4 border-white/20 z-20 pointer-events-none rounded-[3rem] shadow-[0_0_100px_rgba(255,255,255,0.1)] flex flex-col justify-between py-6">
           <div className="w-20 h-1.5 bg-white/50 mx-auto rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]"></div>
           <div className="w-20 h-1.5 bg-white/50 mx-auto rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]"></div>
        </div>
        <div className="absolute left-1/2 z-10 w-full">
          <div ref={trackRef} className="flex items-center will-change-transform" style={{ marginLeft: '-9rem' }}>
            {slotItems.map((person, i) => (
              <div key={i} className="w-64 h-[22rem] flex-shrink-0 relative transition-all duration-500 transform" style={{ marginRight: '2rem' }}>
                <div className={`w-full h-full rounded-[2.5rem] p-1.5 transition-all duration-700 ${i === slotCount - 1 && spinPhase === 'stopped' ? 'bg-gradient-to-tr from-yellow-300 via-amber-400 to-yellow-500 shadow-[0_0_120px_rgba(251,191,36,0.5)] scale-110 z-50' : 'bg-white/10 border border-white/10 backdrop-blur-md opacity-40 scale-90'}`}>
                  <div className={`w-full h-full rounded-[2.2rem] flex flex-col items-center justify-center p-6 text-center shadow-inner ${i === slotCount - 1 && spinPhase === 'stopped' ? 'bg-white' : 'bg-transparent'}`}>
                    
                    {/* Renderiza a Foto ou Ícone */}
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-inner overflow-hidden border-4 ${i === slotCount - 1 && spinPhase === 'stopped' ? 'border-yellow-400 bg-amber-100 text-amber-600' : 'border-white/20 bg-white/10 text-white/50'}`}>
                      {person.photo ? (
                        <img src={person.photo} alt="Membro" className="w-full h-full object-cover" />
                      ) : (
                        <UserCircle2 size={40} />
                      )}
                    </div>
                    
                    <h3 className={`font-black leading-tight break-words w-full ${i === slotCount - 1 && spinPhase === 'stopped' ? 'text-slate-900 text-3xl md:text-4xl' : 'text-white text-2xl'}`}>{person.name}</h3>
                    <div className="mt-auto pt-6 border-t-[3px] w-full border-dashed border-slate-300/30"><p className={`text-[10px] font-black uppercase tracking-widest ${i === slotCount - 1 && spinPhase === 'stopped' ? 'text-yellow-500' : 'text-white/30'}`}>TICKET VIP EXCLUSIVO</p></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-slate-950 to-transparent z-[101] pointer-events-none"></div>
      <div className="absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-slate-950 to-transparent z-[101] pointer-events-none"></div>
      {spinPhase === 'stopped' && (
        <div className="absolute bottom-12 z-[102] animate-in slide-in-from-bottom-12 fade-in duration-700">
          <div className="bg-white text-slate-900 px-8 py-5 rounded-full font-black text-xl shadow-[0_30px_60px_rgba(0,0,0,0.4)] flex items-center gap-4"><CheckCircle2 size={28} className="text-emerald-500" /> Sorteio Realizado!</div>
        </div>
      )}
    </div>
  );
}
