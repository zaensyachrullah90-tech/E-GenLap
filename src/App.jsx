import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, getDocs, updateDoc, serverTimestamp } from 'firebase/firestore';

// =========================================================================
// ⚙️ KONFIGURASI API GEMINI (Tetap di kode demi keamanan agar tidak bocor)
// =========================================================================
const GEMINI_API_KEYS = [
  "MASUKKAN_API_KEY_GEMINI_1_ANDA",
  "MASUKKAN_API_KEY_GEMINI_2_ANDA"
];

// =========================================================================
// FIREBASE CONFIG 
// =========================================================================
const firebaseConfig = {
  apiKey: "AIzaSyAe-mQ8o9VQUE-bjvH1_zFF4BgJiZZ84B8",
  authDomain: "e-genlap.firebaseapp.com",
  databaseURL: "https://e-genlap-default-rtdb.firebaseio.com",
  projectId: "e-genlap",
  storageBucket: "e-genlap.firebasestorage.app",
  messagingSenderId: "717106227570",
  appId: "1:717106227570:web:40ae5a838eec42efea95eb"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const currentAppId = "egenlap-app";

// ==========================================
// PENGATURAN DEFAULT SISTEM
// ==========================================
const defaultSettings = {
  webhookUrl: "",
  templateId: "1xaw6bcjPr6mpcFfSvV2sd3ZVJHgtKLZ6UEO1PsgXU8A",
  masterDriveLink: "https://drive.google.com/drive/folders/1ky6sbBxgpmZ2uNEBqpLAFdYfdL7XTbOE",
  noWa: "6285349450549",
  rekBca: "1234 5678 90",
  rekDana: "0812 3456 7890",
  namaRek: "Administrator E-GenLap",
  qrisUrl: "https://drive.google.com/thumbnail?id=1DenWfIyBEbCrK1zaFHe_Xa9cHqfZXYCf&sz=w800"
};

// ==========================================
// MASTER DATA RHK 1-9
// ==========================================
const DATA_JABATAN = {
  "KATIM PROV": {
    "1. Penyaluran Bansos": [{ nama: "Melaksanakan supervisi Kebijakan Bantuan Sosial Kepada ASN PPPK", target: "12 laporan" }, { nama: "Melakukan edukasi dan sosialisasi pencairan tunai & non tunai", target: "1 laporan setiap bulan" }, { nama: "Melaksanakan Supervisi Permasalahan Bantuan Sosial", target: "Sesuai Kasus" }, { nama: "Melaksanakan Monitoring Penyaluran", target: "12 laporan" }, { nama: "Melaksanakan Penelitian penyaluran bantuan sosial", target: "12 laporan" }],
    "2. Pemutakhiran Data": [{ nama: "Melaksanakan Supervisi Pemutakhiran data KPM", target: "12 laporan" }, { nama: "Melaksanakan koordinasi Pemutakhiran data KPM", target: "12 laporan" }],
    "3. Verifikasi Komitmen": [{ nama: "Melakukan supervisi Pelaksanaan verifikasi komitmen KPM", target: "12 laporan" }],
    "4. P2K2 / FDS": [{ nama: "Melaksanakan supervisi kegiatan P2K2", target: "12 laporan" }],
    "5. Pertemuan Awal & Validasi": [{ nama: "Melaksanakan Supervisi kegiatan Pertemuan Awal", target: "12 laporan" }],
    "6. Kasus Adaptif": [{ nama: "Melaksanakan Respon Kasus/Pengaduan/kebencanaan/Kerentanan", target: "1 Laporan (Sesuai Kejadian)" }],
    "7. Penugasan Direktif": [{ nama: "Melaksanakan Tindak Lanjut Hasil Pemeriksaan (TLHP)", target: "24 laporan" }, { nama: "Melakukan sosialisasi kebijakan dan bisnis proses PKH", target: "26 laporan" }, { nama: "Mengikuti Rapat Koordinasi, Sosialisasi Kebijakan", target: "Sesuai Penugasan" }, { nama: "Tugas Lainnya (Penugasan lainnya program Kementrian Sosial)", target: "Sesuai Direktif" }],
    "8. Laporan Kinerja": [{ nama: "Melakukan Evaluasi Kinerja dan Menyusun Pelaporan ASN PPPK", target: "12 laporan" }, { nama: "Membuat laporan bulanan pelaksanaan PKH", target: "12 laporan" }],
    "9. Penyebaran Berita Baik": [{ nama: "Berperan aktif menyebarkan Media Sosial program Kemensos", target: "1 laporan per bulan" }]
  },
  "KATIM KABKOT": {
    "1. Penyaluran Bansos": [{ nama: "Melaksanakan supervisi Kebijakan Bantuan Sosial", target: "12 laporan" }, { nama: "Melakukan edukasi dan sosialisasi pencairan", target: "1 laporan setiap bulan" }, { nama: "Melaksanakan Supervisi Permasalahan Bantuan Sosial", target: "Sesuai Kasus" }],
    "2. Pemutakhiran Data": [{ nama: "Melaksanakan Supervisi Pemutakhiran data KPM", target: "12 laporan" }],
    "3. Verifikasi Komitmen": [{ nama: "Melakukan supervisi Pelaksanaan verifikasi komitmen KPM", target: "12 laporan" }],
    "4. P2K2 / FDS": [{ nama: "Melaksanakan supervisi kegiatan P2K2", target: "12 laporan" }],
    "5. Pertemuan Awal & Validasi": [{ nama: "Melaksanakan Supervisi kegiatan Pertemuan Awal", target: "12 laporan" }],
    "6. Kasus Adaptif": [{ nama: "Melaksanakan Respon Kasus/Pengaduan/kebencanaan", target: "1 Laporan" }],
    "7. Penugasan Direktif": [{ nama: "Melaksanakan Tindak Lanjut Hasil Pemeriksaan (TLHP)", target: "24 laporan" }, { nama: "Melakukan sosialisasi kebijakan dan bisnis proses", target: "26 laporan" }, { nama: "Tugas Lainnya (Penugasan lainnya)", target: "Sesuai Direktif" }],
    "8. Laporan Kinerja": [{ nama: "Melakukan Evaluasi Kinerja ASN PPPK", target: "12 laporan" }, { nama: "Membuat laporan bulanan pelaksanaan PKH", target: "12 laporan" }],
    "9. Penyebaran Berita Baik": [{ nama: "Berperan aktif menyebarkan Media Sosial program Kemensos", target: "12 laporan" }]
  },
  "OPERATOR LAYANAN OP-SMA2": {
    "1. Penyaluran Bansos": [{ nama: "Melakukan edukasi dan sosialisasi pencairan", target: "12 laporan" }, { nama: "Melaksanakan Supervisi Permasalahan Bantuan Sosial", target: "Sesuai Kasus" }, { nama: "Melaksanakan Monitoring Penyaluran", target: "12 laporan" }],
    "2. Pemutakhiran Data": [{ nama: "Melaksanakan proses bisnis PKH (verifikasi validasi)", target: "36 laporan" }],
    "3. Verifikasi Komitmen": [{ nama: "Memastikan proses verifikasi komitmen KPM berjalan lancar", target: "12 laporan" }],
    "4. P2K2 / FDS": [{ nama: "Mendampingi Pertemuan Peningkatan Kemampuan Keluarga (P2K2)", target: "12 laporan" }],
    "5. Validasi & Pendataan": [{ nama: "Melaksanakan Validasi Data KPM Baru", target: "Sesuai Kuota" }],
    "6. Kasus Adaptif": [{ nama: "Melaksanakan Respon Pengaduan Lapangan", target: "1 Laporan" }],
    "7. Penugasan Direktif": [{ nama: "Melaksanakan Tindak Lanjut Hasil Pemeriksaan (TLHP)", target: "24 laporan" }, { nama: "Melakukan sosialisasi kebijakan dan bisnis proses", target: "Sesuai Penugasan" }, { nama: "Tugas Lainnya", target: "Sesuai Direktif" }],
    "8. Laporan Kinerja": [{ nama: "Menyusun dan menyampaikan Laporan Kinerja Operator", target: "12 laporan" }],
    "9. Penyebaran Berita Baik": [{ nama: "Berperan aktif menyebarkan Media Sosial program Kemensos", target: "1 laporan per bulan" }]
  },
  "PENGELOLA LAYANAN OP-DIII": {
    "1. Penyaluran Bansos": [{ nama: "Melakukan edukasi dan sosialisasi pencairan", target: "12 laporan" }, { nama: "Melaksanakan Monitoring Penyaluran", target: "12 laporan" }],
    "2. Pemutakhiran Data": [{ nama: "Melaksanakan proses bisnis PKH (verifikasi validasi)", target: "36 laporan" }],
    "3. Verifikasi Komitmen": [{ nama: "Verifikasi komitmen pendampingan", target: "12 laporan" }],
    "4. P2K2 / FDS": [{ nama: "Pertemuan kelompok rutin KPM", target: "12 laporan" }],
    "5. Validasi & Pendataan": [{ nama: "Validasi calon KPM baru", target: "Sesuai Kuota" }],
    "6. Kasus Adaptif": [{ nama: "Melaksanakan Respon Kasus/Pengaduan/kebencanaan", target: "1 Laporan" }],
    "7. Laporan Bulanan": [{ nama: "Olah Laporan Bulanan", target: "12 laporan" }],
    "8. Tugas Direktif": [{ nama: "Tugas Direktif", target: "24 laporan" }],
    "9. Berita Baik": [{ nama: "Konten Berita Baik", target: "12 laporan" }]
  },
  "PENATA LAYANAN OPERASIONAL": {
    "1. Penyaluran Bansos": [{ nama: "Melakukan edukasi dan sosialisasi pencairan", target: "12 laporan" }, { nama: "Melaksanakan Supervisi Permasalahan", target: "Sesuai Kasus" }],
    "2. Pemutakhiran Data": [{ nama: "Pemutakhiran dan pengolahan data KPM", target: "36 laporan" }],
    "3. Verifikasi Komitmen": [{ nama: "Pelaksanaan verifikasi komitmen KPM", target: "12 laporan" }],
    "4. P2K2 / FDS": [{ nama: "Mendampingi Pertemuan P2K2", target: "12 laporan" }],
    "5. Validasi & Pendataan": [{ nama: "Validasi dan verifikasi data", target: "Sesuai Kuota" }],
    "6. Kasus Adaptif": [{ nama: "Melaksanakan Respon Kasus/Pengaduan/kebencanaan", target: "1 Laporan" }],
    "7. Penugasan Direktif": [{ nama: "Melaksanakan Tindak Lanjut Hasil Pemeriksaan (TLHP)", target: "24 laporan" }, { nama: "Mengikuti Rapat Koordinasi", target: "Sesuai Penugasan" }, { nama: "Tugas Lainnya", target: "Sesuai Direktif" }],
    "8. Laporan Kinerja": [{ nama: "Membuat laporan bulanan pelaksanaan PKH", target: "12 laporan" }],
    "9. Penyebaran Berita Baik": [{ nama: "Berperan aktif menyebarkan Media Sosial program Kemensos", target: "1 laporan per bulan" }]
  }
};

// ==========================================
// MAIN COMPONENT APP
// ==========================================
export default function App() {
  const [activeTab, setActiveTab] = useState('login'); 
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [appSettings, setAppSettings] = useState(defaultSettings);
  const [adminSettingsForm, setAdminSettingsForm] = useState(defaultSettings);
  
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '', type: '' });
  const [showReview, setShowReview] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [riwayat, setRiwayat] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  const [tokenInput, setTokenInput] = useState('');
  const [regData, setRegData] = useState({ nama: '', nip: '', jabatan: '', email: '', linkDrive: '' });
  const [formData, setFormData] = useState({
    dasarSurat: '', perihalSurat: '',
    tanggal: '', waktu: '', jamMulai: '',
    namaPetugas: '', nip: '', jabatan: '', emailTarget: '',
    kabupaten: 'Tapin', lokasi: '',
    rhk: '', kegiatan: '', target: '',
    uraian: '', sasaranUmum: '', hasilKegiatan: '', catatanUmum: '',
    aiResult: '', 
    formatPDF: true, formatDOCX: false
  });

  const [arrSurat, setArrSurat] = useState([]); 
  const [arrGraduasi, setArrGraduasi] = useState([]);
  const [arrP2K2, setArrP2K2] = useState([]);
  const [dynamicExtra, setDynamicExtra] = useState({});

  const [fotoBase64, setFotoBase64] = useState([]);
  const [lampiranBase64, setLampiranBase64] = useState([]);
  const [ttdBase64, setTtdBase64] = useState("");

  const [rhkOptions, setRhkOptions] = useState([]);
  const [kegiatanOptions, setKegiatanOptions] = useState([]);

  // INJEKSI CSS & FONTAWESOME (TEMA LIME DARK ASLI)
  useEffect(() => {
    if (!document.getElementById('tailwind-css')) {
      const script = document.createElement('script');
      script.id = 'tailwind-css';
      script.src = 'https://cdn.tailwindcss.com';
      document.head.appendChild(script);
    }
    if (!document.getElementById('font-awesome')) {
      const link = document.createElement('link');
      link.id = 'font-awesome';
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
      document.head.appendChild(link);
    }

    const style = document.createElement('style');
    style.innerHTML = `
      body { background-color: #09090b; color: #f3f4f6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; overflow-x: hidden; -webkit-tap-highlight-color: transparent; }
      .app-bg { background: linear-gradient(180deg, #09090b 0%, #18181b 100%); min-height: 100vh; }
      .glossy-monster { background: linear-gradient(135deg, rgba(24, 24, 27, 0.9) 0%, rgba(9, 9, 11, 0.95) 100%); box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.6); backdrop-filter: blur(12px); border: 1px solid rgba(132, 204, 22, 0.15); color: white; }
      .glossy-input { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(132, 204, 22, 0.2); color: white; backdrop-filter: blur(5px); transition: all 0.3s ease; }
      .glossy-input:focus { background: rgba(255, 255, 255, 0.1); border-color: #a3e635; outline: none; box-shadow: 0 0 15px rgba(132, 204, 22, 0.3); }
      .glossy-input option { background: #09090b; color: #a3e635; }
      .fab-button { box-shadow: 0 0 20px rgba(132, 204, 22, 0.6); animation: pulse-glow 2s infinite; }
      @keyframes pulse-glow { 0%, 100% { transform: translateY(-50%) scale(1); box-shadow: 0 0 15px rgba(132, 204, 22, 0.4); } 50% { transform: translateY(-50%) scale(1.05); box-shadow: 0 0 30px rgba(132, 204, 22, 0.9); } }
      .custom-scrollbar::-webkit-scrollbar { height: 6px; width: 4px; }
      .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.02); border-radius: 4px; }
      .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(132, 204, 22, 0.5); border-radius: 4px; }
      .floating-toast { position: fixed; top: 20px; left: 50%; transform: translateX(-50%); z-index: 99999; padding: 14px 28px; border-radius: 50px; font-weight: 700; font-size: 0.875rem; display: flex; align-items: center; gap: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(16px); animation: slideDown 0.4s ease forwards; }
      @keyframes slideDown { from { top: -60px; opacity: 0; } to { top: 20px; opacity: 1; } }
      .bottom-nav { position: fixed; bottom: 0; left: 0; right: 0; height: 64px; background: rgba(9, 9, 11, 0.95); backdrop-filter: blur(20px); border-top: 1px solid rgba(132,204,22,0.4); display: flex; justify-content: space-between; align-items: center; z-index: 1000; max-width: 28rem; margin: 0 auto; border-top-left-radius: 1.5rem; border-top-right-radius: 1.5rem; box-shadow: 0 -10px 20px rgba(0,0,0,0.8); padding: 0 10px; }
      .nav-btn { display: flex; flex-direction: column; align-items: center; justify-content: center; color: #71717a; font-size: 0.65rem; width: 20%; cursor: pointer; transition: all 0.3s ease; font-weight: 700; text-transform: uppercase; }
      .nav-btn.active { color: #a3e635; }
      .nav-btn i { font-size: 1.2rem; margin-bottom: 4px; }
    `;
    document.head.appendChild(style);

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    const initAuth = async () => {
      try { await signInAnonymously(auth); } catch (e) {}
    };
    initAuth();
    const unsub = onAuthStateChanged(auth, (user) => setFirebaseUser(user));
    
    return () => { clearInterval(timer); unsub(); };
  }, []);

  // MENGAMBIL PENGATURAN DARI FIREBASE SAAT APLIKASI DIMUAT
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'artifacts', currentAppId, 'public', 'data', 'app_settings', 'config');
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setAppSettings(snap.data());
          setAdminSettingsForm(snap.data());
        } else {
          await setDoc(docRef, defaultSettings);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    if (userProfile && DATA_JABATAN[userProfile.jabatan]) {
      setRhkOptions(Object.keys(DATA_JABATAN[userProfile.jabatan]));
      setFormData(prev => ({
        ...prev,
        namaPetugas: userProfile.nama || "",
        nip: userProfile.nip || "",
        jabatan: userProfile.jabatan || "",
        emailTarget: userProfile.email || ""
      }));
    }
  }, [userProfile]);

  useEffect(() => {
    if (userProfile && formData.rhk && DATA_JABATAN[userProfile.jabatan]?.[formData.rhk]) {
      setKegiatanOptions(DATA_JABATAN[userProfile.jabatan][formData.rhk]);
    }
  }, [formData.rhk, userProfile]);

  const handleKegiatanChange = (e) => {
    const val = e.target.value;
    const selectedItem = kegiatanOptions.find(k => k.nama === val);
    setFormData(prev => ({ 
      ...prev, kegiatan: val, target: selectedItem ? selectedItem.target : '' 
    }));
  };

  useEffect(() => {
    if (firebaseUser && userProfile) {
      if (activeTab === 'report' || activeTab === 'dashboard') loadRiwayat();
      if (userProfile.role === 'admin') loadAllUsers();
    }
  }, [activeTab, userProfile]);

  // ------------------------------------------
  // HELPER FUNCTIONS
  // ------------------------------------------
  const showToastMsg = (msg, type) => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type: '' }), 3000);
  };
  const nav = (tab) => { 
    setActiveTab(tab); 
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };
  const copyToClipboard = (text) => {
    try {
      navigator.clipboard.writeText(text);
      showToastMsg("Tautan disalin!", "success");
    } catch(e) {
      showToastMsg("Gagal menyalin tautan", "error");
    }
  };

  const formatWITA = (dateObj) => {
    try {
      const optionsTime = { timeZone: 'Asia/Makassar', hour: '2-digit', minute: '2-digit', second:'2-digit', hour12: false };
      return new Intl.DateTimeFormat('id-ID', optionsTime).format(dateObj).replace(/\./g, ':');
    } catch(e) { return dateObj.toLocaleTimeString(); }
  };
  const formatDateIndo = (dateObj) => {
    try {
      const optionsDate = { timeZone: 'Asia/Makassar', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      return new Intl.DateTimeFormat('id-ID', optionsDate).format(dateObj);
    } catch(e) { return dateObj.toLocaleDateString(); }
  };

  // ------------------------------------------
  // AUTHENTIKASI & USER LOGIC
  // ------------------------------------------
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const generateToken = 'SDM-' + Math.floor(1000 + Math.random() * 9000);
      const userRef = doc(db, 'artifacts', currentAppId, 'public', 'data', 'data_pekerja', generateToken);
      const payload = {
        token: generateToken, nama: regData.nama, nip: regData.nip, jabatan: regData.jabatan, 
        email: regData.email, linkDrive: regData.linkDrive || appSettings.masterDriveLink,
        role: 'user', sisaToken: 1, status: 'Trial', createdAt: serverTimestamp() 
      };
      await setDoc(userRef, payload);
      showToastMsg(`Berhasil! Token Anda: ${generateToken}`, 'success');
      setTokenInput(generateToken);
      nav('login');
    } catch (err) { showToastMsg('Gagal mendaftar ke database.', 'error'); }
    setLoading(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = tokenInput.trim().toUpperCase();
      if (token === 'ADMIN-MASTER') {
        setUserProfile({ token: 'ADMIN-MASTER', nama: 'Administrator Utama', role: 'admin', sisaToken: 9999, status: 'aktif', jabatan: 'PENATA LAYANAN OPERASIONAL', email: 'admin@kemensos.go.id' });
        nav('dashboard');
      } else {
        const userRef = doc(db, 'artifacts', currentAppId, 'public', 'data', 'data_pekerja', token);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          setUserProfile(snap.data());
          nav('dashboard');
        } else { showToastMsg('Token tidak terdaftar / salah!', 'error'); }
      }
    } catch (err) { showToastMsg('Gagal terhubung ke sistem login.', 'error'); }
    setLoading(false);
  };

  const handleLogout = () => {
    setUserProfile(null); setTokenInput('');
    nav('login');
  };

  // ------------------------------------------
  // DATA FETCHING & SYNC
  // ------------------------------------------
  const loadRiwayat = async () => {
    try {
      const snap = await getDocs(collection(db, 'artifacts', currentAppId, 'public', 'data', 'laporan_harian'));
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const sorted = all.sort((a,b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
      setRiwayat(userProfile.role === 'admin' ? sorted : sorted.filter(r => r.profil?.token === userProfile.token));
    } catch (err) { console.error("Error load riwayat:", err); }
  };

  const loadAllUsers = async () => {
    try {
      const snap = await getDocs(collection(db, 'artifacts', currentAppId, 'public', 'data', 'data_pekerja'));
      setAllUsers(snap.docs.map(d => d.data()).filter(u => u.token !== 'ADMIN-MASTER'));
    } catch(e) {}
  };

  const handleUpdateUserAdmin = async (userId, field, value) => {
    try {
      const userRef = doc(db, 'artifacts', currentAppId, 'public', 'data', 'data_pekerja', userId);
      await updateDoc(userRef, { [field]: value });
      showToastMsg('Data akun diperbarui', 'success');
      loadAllUsers(); 
    } catch (err) { showToastMsg('Gagal menyimpan perubahan', 'error'); }
  };

  const handleTopUpToken = async (userId, currentToken) => {
    const input = prompt("Masukkan jumlah tambahan Token Laporan (Misal: 30):");
    if (!input) return;
    const amount = parseInt(input);
    if (isNaN(amount) || amount <= 0) return showToastMsg("Format tidak valid", "error");
    try {
      const newTotal = currentToken + amount;
      const userRef = doc(db, 'artifacts', currentAppId, 'public', 'data', 'data_pekerja', userId);
      await updateDoc(userRef, { sisaToken: newTotal, status: 'aktif' });
      showToastMsg(`Top-Up Sukses!`, 'success');
      loadAllUsers();
    } catch (err) { showToastMsg('Gagal Top-Up', 'error'); }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, 'artifacts', currentAppId, 'public', 'data', 'app_settings', 'config');
      await setDoc(docRef, adminSettingsForm);
      setAppSettings(adminSettingsForm);
      showToastMsg("Pengaturan berhasil disimpan", "success");
    } catch(e) {
      showToastMsg("Gagal menyimpan pengaturan", "error");
    }
    setLoading(false);
  };

  // ------------------------------------------
  // FORM & FILE HANDLING
  // ------------------------------------------
  const resizeImage = (file, maxWidth, maxHeight, callback) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width; let h = img.height;
        if (w > h) { if (w > maxWidth) { h *= maxWidth / w; w = maxWidth; } } 
        else { if (h > maxHeight) { w *= maxHeight / h; h = maxHeight; } }
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        callback(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleFile = (e, type) => {
    const files = Array.from(e.target.files);
    if(files.length === 0) return;

    if(type === 'ttd') {
      resizeImage(files[0], 400, 400, (base64) => setTtdBase64(base64));
    } else if(type === 'foto') {
      if(fotoBase64.length >= 10) return showToastMsg("Maks 10 Foto", 'error');
      files.forEach(f => resizeImage(f, 800, 800, (base64) => setFotoBase64(prev => [...prev, base64])));
    } else if(type === 'lampiran') {
      if(lampiranBase64.length >= 3) return showToastMsg("Maks 3 Lampiran", 'error');
      files.forEach(f => resizeImage(f, 1200, 1200, (base64) => setLampiranBase64(prev => [...prev, base64])));
    }
  };

  const addSurat = () => setArrSurat([...arrSurat, { noSurat: '', perihal: '' }]);
  const updateSurat = (idx, field, val) => {
    const newArr = [...arrSurat]; newArr[idx][field] = val; setArrSurat(newArr);
  };
  const removeSurat = (idx) => setArrSurat(arrSurat.filter((_, i) => i !== idx));

  const addGraduasi = () => setArrGraduasi([...arrGraduasi, { NIK: '', Nama: '', Desa: '', Kec: '', Ket: '' }]);
  const updateGraduasi = (idx, field, val) => { const newArr = [...arrGraduasi]; newArr[idx][field] = val; setArrGraduasi(newArr); };
  
  const addP2K2 = () => setArrP2K2([...arrP2K2, { Kelompok: '', Hadir: '', Absen: '' }]);
  const updateP2K2 = (idx, field, val) => { const newArr = [...arrP2K2]; newArr[idx][field] = val; setArrP2K2(newArr); };

  // AI GENERATOR
  const generateAILogic = async () => {
    if (!formData.uraian || !formData.kegiatan) return showToastMsg('Pilih RHK & Isi Rincian Lapangan Dulu!', 'error');
    if (GEMINI_API_KEYS.length === 0 || !GEMINI_API_KEYS[0] || GEMINI_API_KEYS[0].includes("MASUKKAN_API_KEY")) {
       return showToastMsg('Error: API Key belum diatur!', 'error');
    }

    setLoading(true);
    const prompt = `Anda asisten pelaporan ASN Kemensos. Jabatan: ${userProfile.jabatan}. Judul: ${formData.kegiatan}. Catatan: ${formData.uraian}. Buat satu paragraf narasi formal baku.`;
    
    let success = false;
    for (const key of GEMINI_API_KEYS) {
      if (!key) continue;
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        const data = await res.json();
        if (data.candidates) {
          setFormData({ ...formData, aiResult: data.candidates[0].content.parts[0].text });
          success = true; break;
        }
      } catch (e) {}
    }
    if (!success) showToastMsg('AI Sedang Sibuk / Limit. Coba lagi!', 'error');
    setLoading(false);
  };

  // SUBMIT REVIEW
  const openReviewModal = (e) => {
    e.preventDefault();
    if(userProfile.role !== 'admin' && userProfile.sisaToken <= 0) return showToastMsg('Token Habis!', 'error');
    if(!formData.formatPDF && !formData.formatDOCX) return showToastMsg('Pilih Format Ekspor!', 'error');
    setShowReview(true);
  };

  const executeSubmit = async () => {
    setShowReview(false);
    setLoading(true);
    try {
      let dynamicData = { ...dynamicExtra };
      if (formData.kegiatan.toUpperCase().includes('GRADUASI')) dynamicData.Data_Graduasi = arrGraduasi;
      if (formData.kegiatan.toUpperCase().includes('P2K2')) dynamicData.Data_P2K2 = arrP2K2;

      let formatOutput = [];
      if(formData.formatPDF) formatOutput.push("PDF");
      if(formData.formatDOCX) formatOutput.push("DOCX");

      const payload = {
        currentUserEmail: userProfile.email,
        currentUserRole: userProfile.role,
        tanggalLaporan: formData.tanggal,
        jamMulai: formData.jamMulai,
        dasarSurat: arrSurat.map(s => `${s.noSurat}`).join(' | ') || formData.dasarSurat,
        perihalSurat: arrSurat.map(s => `${s.perihal}`).join(' | ') || formData.perihalSurat,
        namaPetugas: formData.namaPetugas,
        jabatan: formData.jabatan,
        nip: formData.nip,
        emailTarget: formData.emailTarget,
        ttdData: ttdBase64,
        kabupaten: formData.kabupaten,
        waktu: formData.waktu,
        lokasi: formData.lokasi,
        kegiatan: formData.kegiatan,
        formatOutput: formatOutput,
        dynamicData: dynamicData,
        koleksiFoto: fotoBase64,
        lampiranPendukung: lampiranBase64,
        profil: userProfile, laporan: { ...formData, aiResult: formData.aiResult }, timestamp: serverTimestamp(), templateId: appSettings.templateId, linkDrive: userProfile.linkDrive || appSettings.masterDriveLink
      };

      const docRef = await addDoc(collection(db, 'artifacts', currentAppId, 'public', 'data', 'laporan_harian'), payload);
      
      if (userProfile.role !== 'admin') {
        const userRef = doc(db, 'artifacts', currentAppId, 'public', 'data', 'data_pekerja', userProfile.token);
        await updateDoc(userRef, { sisaToken: userProfile.sisaToken - 1 });
        setUserProfile({ ...userProfile, sisaToken: userProfile.sisaToken - 1 });
      }

      if (appSettings.webhookUrl && !appSettings.webhookUrl.includes("MASUKKAN_URL")) {
        fetch(appSettings.webhookUrl, { method: 'POST', mode: 'no-cors', body: JSON.stringify({...payload, docId: docRef.id}) });
      }

      showToastMsg('Laporan Terkirim! (AI Mengeksekusi)', 'success');
      setFormData({ ...formData, uraian: '', aiResult: '' });
      setFotoBase64([]); setLampiranBase64([]); setTtdBase64(""); setArrSurat([]); setArrGraduasi([]); setArrP2K2([]);
      
      nav('riwayat');
    } catch (e) { showToastMsg('Gagal mengirim ke server.', 'error'); }
    setLoading(false);
  };


  // ==========================================
  // UI RENDERERS (SAMA PERSIS DENGAN HTML ASLI)
  // ==========================================

  const renderToast = () => {
    if (!toast.show) return null;
    return (
      <div className={`floating-toast ${toast.type === 'success' ? 'toast-success border-lime-500/50 bg-lime-900/90 text-lime-400' : 'toast-error border-red-500/50 bg-red-900/90 text-red-400'} z-[9999]`}>
        <i className={`fas ${toast.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'} text-xl`}></i>
        <span>{toast.msg}</span>
      </div>
    );
  };

  const renderHeader = () => (
    <header className="glossy-monster p-4 rounded-b-3xl shadow-lg flex-shrink-0 z-10 border-b border-lime-500/30 sticky top-0">
      <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-lime-300 to-lime-500"><i className="fas fa-bolt mr-1 text-lime-400"></i> E-GenLap</h1>
          <div className="flex items-center gap-3">
              <div className="text-right text-sm">
                <div className="font-mono font-bold text-lime-400">{formatWITA(currentTime)}</div>
                <div className="text-[10px] text-zinc-400 uppercase tracking-wide">{formatDateIndo(currentTime)}</div>
              </div>
              
              {userProfile?.role === 'admin' && (
                <div className="flex items-center gap-2 border-l border-zinc-700 pl-2">
                    <button onClick={() => nav('admin_panel')} className="bg-blue-500/10 text-blue-500 w-8 h-8 rounded-full border border-blue-500/30 flex items-center justify-center hover:bg-blue-500/30 transition-all shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                      <i className="fas fa-user-shield text-sm"></i>
                    </button>
                </div>
              )}
              {userProfile && (
                <button onClick={handleLogout} className="bg-red-500/10 text-red-500 w-8 h-8 rounded-full border border-red-500/30 flex items-center justify-center hover:bg-red-500/30 transition-all shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                    <i className="fas fa-power-off text-sm"></i>
                </button>
              )}
          </div>
      </div>
    </header>
  );

  const renderLogin = () => (
    <main className="p-5 flex-grow">
      <section className="glossy-monster p-5 rounded-2xl mb-6">
        <div className="text-center mb-6">
            <i className="fas fa-user-circle text-5xl text-lime-400 mb-2"></i>
            <h2 className="text-xl font-bold text-white">Selamat Datang</h2>
            <p className="text-xs text-zinc-400">Silakan masuk atau daftar untuk menggunakan E-GenLap.</p>
        </div>

        <div className="mt-2 mb-4 bg-lime-900/20 border border-lime-500/40 p-4 rounded-xl shadow-inner">
             <p className="text-lime-400 font-extrabold text-xs mb-2 animate-pulse"><i className="fas fa-gift mr-1 text-yellow-400"></i> DAFTAR SEKARANG, DAPATKAN 1 TOKEN GRATIS!</p>
            <ul className="text-[10px] text-zinc-300 text-left space-y-2">
                <li><i className="fas fa-check-circle text-lime-500 mr-1"></i> Generate Laporan Otomatis via AI</li>
                <li><i className="fas fa-check-circle text-lime-500 mr-1"></i> Analisis Dasar Hukum & Aturan Kemensos</li>
                <li><i className="fas fa-check-circle text-lime-500 mr-1"></i> Unduh Otomatis Format PDF/DOC</li>
             </ul>
        </div>

        <form onSubmit={handleLogin}>
            <input type="text" value={tokenInput} onChange={e=>setTokenInput(e.target.value)} className="w-full p-3 text-sm rounded-xl glossy-input mb-3 font-bold text-center tracking-widest uppercase" placeholder="Contoh: SDM-9481" required/>
            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-lime-500 to-lime-400 text-black font-extrabold py-3 rounded-xl transition-all text-sm mb-3 shadow-[0_0_15px_rgba(132,204,22,0.3)] hover:shadow-[0_0_20px_rgba(132,204,22,0.6)]">
              {loading ? <i className="fas fa-spinner fa-spin"></i> : <><i className="fas fa-sign-in-alt mr-2"></i> Akses Masuk</>}
            </button>
            <p className="text-center text-xs text-zinc-400 mt-2">Pegawai Baru? <span onClick={() => setActiveTab('register')} className="text-lime-400 cursor-pointer font-bold underline">Pendaftaran Akun</span></p>
        </form>
      </section>
      <div className="text-center py-4 text-[10px] text-zinc-600 font-medium">copyright 8-3-2026<br/>Fullstack Developer By @M.ZaenSyachrullah</div>
    </main>
  );

  const renderRegister = () => (
    <main className="p-5 flex-grow">
      <section className="glossy-monster p-5 rounded-2xl mb-6">
        <div className="text-center mb-6">
            <i className="fas fa-user-plus text-5xl text-lime-400 mb-2"></i>
            <h2 className="text-xl font-bold text-white">Registrasi Sistem</h2>
        </div>
        <form onSubmit={handleRegister}>
            <input type="text" value={regData.nama} onChange={e=>setRegData({...regData, nama:e.target.value})} className="w-full p-3 text-sm rounded-xl glossy-input mb-3" placeholder="Nama Lengkap" required/>
            <input type="text" value={regData.nip} onChange={e=>setRegData({...regData, nip:e.target.value})} className="w-full p-3 text-sm rounded-xl glossy-input mb-3" placeholder="NIP (Kosongkan jika tidak ada)"/>
            <select value={regData.jabatan} onChange={e=>setRegData({...regData, jabatan:e.target.value})} className="w-full p-3 text-sm rounded-xl glossy-input mb-3 font-bold" required>
               <option value="">-- Pilih Jabatan Anda --</option>
               {Object.keys(DATA_JABATAN).map(j => <option key={j} value={j}>{j}</option>)}
            </select>
            <input type="email" value={regData.email} onChange={e=>setRegData({...regData, email:e.target.value})} className="w-full p-3 text-sm rounded-xl glossy-input mb-3" placeholder="Email Valid" required/>
            <input type="text" placeholder="URL Drive Folder Anda (Opsional)" value={regData.linkDrive} onChange={e=>setRegData({...regData, linkDrive:e.target.value})} className="w-full p-3 text-sm rounded-xl glossy-input mb-3" />
            
            <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-lime-500 to-lime-400 text-black font-extrabold py-3 rounded-xl transition-all text-sm mb-3">
              {loading ? <i className="fas fa-spinner fa-spin"></i> : <><i className="fas fa-check mr-2"></i> Daftar Akun (Dapat 1 Token)</>}
            </button>
            <p className="text-center text-xs text-zinc-400 mt-2">Sudah punya akun? <span onClick={() => setActiveTab('login')} className="text-lime-400 cursor-pointer font-bold underline">Kembali Login</span></p>
        </form>
      </section>
    </main>
  );

  const renderDashboard = () => {
    let sukses = riwayat.filter(r => r.laporan?.kegiatan).length; 
    let gagal = 0;
    return (
    <main className="p-5 flex-grow pb-24">
      <section className="glossy-monster p-5 rounded-2xl mb-6">
        <div className="flex justify-between items-center mb-4">
            <div>
                <h2 className="text-lg font-bold text-lime-400">Halo, {userProfile.nama.split(' ')[0]}</h2>
                <p className="text-[10px] text-zinc-400">Role: {userProfile.role === 'admin' ? 'Administrator (Melihat Semua)' : userProfile.jabatan}</p>
            </div>
            <div className="bg-lime-900/30 border border-lime-500/50 px-3 py-1.5 rounded-xl text-center shadow-inner">
                <p className="text-[9px] text-lime-200">{userProfile.role === 'admin' ? 'STATUS SYSTEM' : 'SISA TOKEN'}</p>
                <p className="text-2xl font-black text-lime-400">{userProfile.role === 'admin' ? 'ADMIN' : userProfile.sisaToken}</p>
            </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-5">
          <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 p-5 rounded-xl text-center border border-lime-500/30 shadow-lg flex flex-col justify-center items-center">
            <h3 className="text-4xl font-black text-lime-400 drop-shadow-md">{sukses}</h3>
            <p className="text-xs font-bold text-zinc-400 mt-2 tracking-wide uppercase bg-lime-500/10 px-2 py-1 rounded">Sukses</p>
          </div>
          <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 p-5 rounded-xl text-center border border-red-500/30 shadow-lg flex flex-col justify-center items-center">
            <h3 className="text-4xl font-black text-red-500 drop-shadow-md">{gagal}</h3>
            <p className="text-xs font-bold text-zinc-400 mt-2 tracking-wide uppercase bg-red-500/10 px-2 py-1 rounded">Gagal</p>
          </div>
        </div>
        
        <div className="mt-5 bg-zinc-800/50 p-4 rounded-xl border border-lime-500/20 shadow-md">
           <h3 className="text-sm font-bold text-lime-400 mb-3 border-b border-zinc-700 pb-2"><i className="fas fa-tasks mr-2"></i> Ringkasan Kegiatan</h3>
           <div className="rounded-lg border border-zinc-700 w-full overflow-hidden">
               <table className="w-full text-left text-[10px] text-zinc-300">
                 <thead className="bg-zinc-900/80 text-lime-400">
                    <tr><th className="p-2">Nama Kegiatan</th><th className="p-2 text-center">Jumlah</th></tr>
                 </thead>
                 <tbody className="divide-y divide-zinc-800/50">
                    {riwayat.length === 0 ? 
                      <tr><td colSpan="2" className="text-center italic text-zinc-500 py-3">Memuat data... / Kosong</td></tr> 
                      : 
                      <tr><td className="p-2">Total Laporan Terkirim</td><td className="p-2 text-center text-lime-400 font-bold">{riwayat.length}</td></tr>
                    }
                 </tbody>
               </table>
           </div>
        </div>
      </section>
      <div className="text-center py-4 text-[10px] text-zinc-600 font-medium">copyright 8-3-2026<br/>Fullstack Developer By @M.ZaenSyachrullah</div>
    </main>
  )};

  const renderForm = () => {
    const isGraduasi = formData.kegiatan.toUpperCase().includes("GRADUASI");
    const isP2K2 = formData.kegiatan.toUpperCase().includes("P2K2");
    const isVerkom = formData.kegiatan.toUpperCase().includes("VERIFIKASI KOMITMEN") || formData.kegiatan.toUpperCase().includes("VERKOM");
    const isSupervisi = formData.kegiatan.toUpperCase().includes("SUPERVISI");

    return (
    <main className="p-5 flex-grow pb-28">
      <section className="glossy-monster p-5 rounded-2xl mb-6">
        <div className="flex justify-between items-center border-b border-zinc-700 pb-2 mb-4">
             <h2 className="text-lg font-bold text-lime-400"><i className="fas fa-magic mr-2"></i> Form Laporan</h2>
             <span className="text-xs bg-lime-900/50 text-lime-300 px-2 py-1 rounded border border-lime-500/30">Token: <b>{userProfile.sisaToken}</b></span>
        </div>
      
        <form onSubmit={openReviewModal}>
          {/* DATA SURAT (OPSIONAL) */}
          <div className="bg-black/30 p-3 rounded-xl border border-zinc-700/50 mb-4">
            <p className="text-[10px] text-lime-400 font-bold mb-2 uppercase tracking-wider"><i className="fas fa-envelope-open-text mr-1"></i> Data Surat (Opsional)</p>
            {/* Input Default Pertama */}
            <div className="grid grid-cols-2 gap-3 mb-2">
                <div><label className="block text-[10px] font-bold text-zinc-300 mb-1">Dasar Surat / No. Surat</label><input type="text" value={formData.dasarSurat} onChange={e=>setFormData({...formData, dasarSurat:e.target.value})} className="w-full p-2 text-xs rounded-lg glossy-input" placeholder="Contoh: ST-123/2026"/></div>
                <div><label className="block text-[10px] font-bold text-zinc-300 mb-1">Perihal Kegiatan</label><input type="text" value={formData.perihalSurat} onChange={e=>setFormData({...formData, perihalSurat:e.target.value})} className="w-full p-2 text-xs rounded-lg glossy-input" placeholder="Contoh: Undangan Rakor"/></div>
            </div>
            {/* Array Surat Tambahan */}
            {arrSurat.map((s, i) => (
              <div key={i} className="grid grid-cols-2 gap-3 mb-2 relative pt-4 border-t border-zinc-700/50 mt-2">
                <button type="button" onClick={()=>removeSurat(i)} className="absolute top-1 right-0 text-red-500 text-[10px] font-bold"><i className="fas fa-times"></i> Hapus</button>
                <div><input type="text" value={s.noSurat} onChange={e=>updateSurat(i, 'noSurat', e.target.value)} className="w-full p-2 text-xs rounded-lg glossy-input" placeholder="Dasar Surat Tambahan"/></div>
                <div><input type="text" value={s.perihal} onChange={e=>updateSurat(i, 'perihal', e.target.value)} className="w-full p-2 text-xs rounded-lg glossy-input" placeholder="Perihal Tambahan"/></div>
              </div>
            ))}
            <button type="button" onClick={addSurat} className="text-[10px] text-lime-400 hover:text-lime-300 mt-2 font-bold flex items-center gap-1"><i className="fas fa-plus-circle"></i> Tambah Surat</button>
          </div>

          {/* WAKTU & IDENTITAS */}
          <div className="grid grid-cols-2 gap-3 mb-4">
             <div><label className="block text-xs font-bold text-lime-300 mb-1">Tanggal</label><input type="date" value={formData.tanggal} onChange={e=>setFormData({...formData, tanggal:e.target.value})} className="w-full p-3 text-sm rounded-xl glossy-input" required style={{colorScheme:'dark'}}/></div>
             <div><label className="block text-xs font-bold text-lime-300 mb-1">Waktu Pelaksanaan</label><input type="date" value={formData.waktu} onChange={e=>setFormData({...formData, waktu:e.target.value})} className="w-full p-3 text-sm rounded-xl glossy-input" style={{colorScheme:'dark'}}/></div>
          </div>
          <div className="mb-4">
              <label className="block text-xs font-bold text-lime-300 mb-1">Jam Mulai Kegiatan (Riwayat Agenda)</label>
              <input type="time" value={formData.jamMulai} onChange={e=>setFormData({...formData, jamMulai:e.target.value})} className="w-full p-3 text-sm rounded-xl glossy-input" required style={{colorScheme:'dark'}}/>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
             <div><label className="block text-xs font-bold text-lime-300 mb-1">Nama Petugas</label><input type="text" value={formData.namaPetugas} onChange={e=>setFormData({...formData, namaPetugas:e.target.value})} className={`w-full p-3 text-sm rounded-xl glossy-input ${userProfile.role !== 'admin' ? 'opacity-70 bg-zinc-900/50' : ''}`} readOnly={userProfile.role !== 'admin'} required/></div>
             <div><label className="block text-xs font-bold text-lime-300 mb-1">NIP (Opsional)</label><input type="text" value={formData.nip} onChange={e=>setFormData({...formData, nip:e.target.value})} className={`w-full p-3 text-sm rounded-xl glossy-input ${userProfile.role !== 'admin' ? 'opacity-70 bg-zinc-900/50' : ''}`} readOnly={userProfile.role !== 'admin'}/></div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
             <div><label className="block text-xs font-bold text-lime-300 mb-1">Jabatan</label><input type="text" value={formData.jabatan} onChange={e=>setFormData({...formData, jabatan:e.target.value})} className={`w-full p-3 text-sm rounded-xl glossy-input ${userProfile.role !== 'admin' ? 'opacity-70 bg-zinc-900/50' : ''}`} readOnly={userProfile.role !== 'admin'} required/></div>
             <div><label className="block text-xs font-bold text-lime-300 mb-1">Email (Akun Sistem)</label><input type="email" value={formData.emailTarget} onChange={e=>setFormData({...formData, emailTarget:e.target.value})} className={`w-full p-3 text-sm rounded-xl glossy-input ${userProfile.role !== 'admin' ? 'opacity-70 bg-zinc-900/50' : ''}`} readOnly={userProfile.role !== 'admin'} required/></div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div><label className="block text-xs font-bold text-lime-300 mb-1">Kabupaten/Kota</label><input type="text" value={formData.kabupaten} onChange={e=>setFormData({...formData, kabupaten:e.target.value})} className="w-full p-3 text-sm rounded-xl glossy-input" required/></div>
             <div><label className="block text-xs font-bold text-lime-300 mb-1">Lokasi Kegiatan</label><input type="text" value={formData.lokasi} onChange={e=>setFormData({...formData, lokasi:e.target.value})} className="w-full p-3 text-sm rounded-xl glossy-input" placeholder="Kantor Desa..." required/></div>
          </div>

          {/* UPLOAD TTD MURNI FILE */}
          <div className="mb-4">
            <label className="block text-xs font-bold text-lime-300 mb-1">Upload TTD (Format PNG Transparan)</label>
            <input type="file" accept="image/png, image/jpeg" onChange={e=>handleFile(e, 'ttd')} className="w-full text-sm rounded-xl glossy-input text-zinc-400 file:mr-3 file:py-2 file:px-4 file:rounded-l-xl file:border-0 file:text-xs file:font-bold file:bg-lime-500 file:text-black hover:file:bg-lime-400 cursor-pointer bg-black/50" />
            {ttdBase64 && (
              <div className="mt-3 relative w-[100px] h-[50px] bg-white rounded-lg p-1 border border-lime-500/50 shadow-md">
                 <img src={ttdBase64} className="w-full h-full object-contain" />
                 <div onClick={() => setTtdBase64("")} className="absolute -top-2 -right-2 bg-red-600 text-white w-5 h-5 flex items-center justify-center rounded-full cursor-pointer shadow-lg hover:bg-red-500 text-[10px] z-10 active:scale-90"><i className="fas fa-times"></i></div>
              </div>
            )}
          </div>

          {/* LAMPIRAN PENDUKUNG */}
          <div className="mb-4">
            <label className="block text-xs font-bold text-lime-300 mb-2">Lampiran Pendukung (Maks 3, 1 Kertas 1 Lampiran)</label>
             <div className="bg-black/40 border border-lime-500/20 p-3 rounded-xl min-h-[80px] shadow-inner mb-2 flex flex-wrap gap-3 items-center">
                 {lampiranBase64.map((base64, i) => (
                    <div key={i} className="relative w-[60px] h-[60px]">
                      <img src={base64} className="w-full h-full object-cover rounded-lg border border-lime-500/40 shadow-md"/>
                      <div onClick={()=>setLampiranBase64(lampiranBase64.filter((_, idx)=>idx!==i))} className="absolute -top-2 -right-2 bg-red-600 text-white w-5 h-5 flex items-center justify-center rounded-full cursor-pointer shadow-lg text-[10px] z-10"><i className="fas fa-times"></i></div>
                    </div>
                 ))}
                 <label className="w-14 h-14 bg-lime-500/10 border border-dashed border-lime-500/50 flex flex-col items-center justify-center rounded-xl cursor-pointer hover:bg-lime-500/20 text-lime-400">
                    <input type="file" accept="image/*" multiple onChange={e=>handleFile(e, 'lampiran')} className="hidden" />
                    <i className="fas fa-paperclip text-lg"></i><span className="text-[8px] font-bold mt-1">Upload</span>
                 </label>
            </div>
            <div className="flex justify-between items-center"><p className="text-[10px] font-bold text-zinc-500 bg-zinc-800 px-2 py-1 rounded-md">{lampiranBase64.length} / 3 File</p></div>
          </div>

          {/* CARI & PILIH KEGIATAN */}
          <div className="mb-4 bg-lime-900/10 p-3 rounded-xl border border-lime-500/30">
            <label className="block text-xs font-bold text-lime-300 mb-2"><i className="fas fa-search mr-1"></i> Cari & Pilih Kegiatan (RHK)</label>
             <select value={formData.rhk} onChange={e=>setFormData({...formData, rhk:e.target.value, kegiatan:'', target:''})} required className="w-full p-3 text-sm rounded-xl glossy-input font-medium mb-3">
                <option value="">-- Pilih Kategori RHK --</option>
                {rhkOptions.map(r => <option key={r} value={r}>{r}</option>)}
             </select>
             <select value={formData.kegiatan} onChange={handleKegiatanChange} required disabled={!formData.rhk} className="w-full p-3 text-sm rounded-xl glossy-input font-medium">
                <option value="">-- Pilih Kegiatan Prioritas --</option>
                {kegiatanOptions.map((k, i) => <option key={i} value={k.nama}>{k.nama}</option>)}
             </select>
          </div>

          {/* DYNAMIC FORM AREA (REPLICA HTML ASLI) */}
          <div className="space-y-4 mb-4 transition-all duration-300">
            {formData.kegiatan && (
              <>
                {isGraduasi && (
                  <div className="bg-lime-900/10 border border-lime-500/30 p-4 rounded-xl mb-3 shadow-inner">
                    <h3 className="text-xs font-bold text-lime-400 mb-3"><i className="fas fa-user-graduate mr-2"></i>Data Graduasi KPM</h3>
                    {arrGraduasi.map((g, i) => (
                      <div key={i} className="border-b border-zinc-700/50 pb-3 mb-3 relative pt-4 mt-2">
                        <button type="button" onClick={()=>setArrGraduasi(arrGraduasi.filter((_, idx)=>idx!==i))} className="absolute top-1 right-0 text-red-500 text-[10px] font-bold"><i className="fas fa-times"></i> Hapus</button>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <div><label className="block text-xs font-bold text-lime-300 mb-1">No</label><input type="number" value={i+1} readOnly className="w-full p-2 text-sm rounded-lg glossy-input bg-zinc-900/50"/></div>
                            <div><label className="block text-xs font-bold text-lime-300 mb-1">NIK</label><input type="number" value={g.NIK} onChange={e=>updateGraduasi(i,'NIK',e.target.value)} className="w-full p-2 text-sm rounded-lg glossy-input"/></div>
                        </div>
                        <div className="mb-3"><label className="block text-xs font-bold text-lime-300 mb-1">Nama</label><input type="text" value={g.Nama} onChange={e=>updateGraduasi(i,'Nama',e.target.value)} className="w-full p-2 text-sm rounded-lg glossy-input"/></div>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <div><label className="block text-xs font-bold text-lime-300 mb-1">Desa</label><input type="text" value={g.Desa} onChange={e=>updateGraduasi(i,'Desa',e.target.value)} className="w-full p-2 text-sm rounded-lg glossy-input"/></div>
                            <div><label className="block text-xs font-bold text-lime-300 mb-1">Kec</label><input type="text" value={g.Kec} onChange={e=>updateGraduasi(i,'Kec',e.target.value)} className="w-full p-2 text-sm rounded-lg glossy-input"/></div>
                        </div>
                        <div><label className="block text-xs font-bold text-lime-300 mb-1">Ket</label><input type="text" value={g.Ket} onChange={e=>updateGraduasi(i,'Ket',e.target.value)} className="w-full p-2 text-sm rounded-lg glossy-input"/></div>
                      </div>
                    ))}
                    <button type="button" onClick={addGraduasi} className="text-xs font-bold text-lime-400 hover:text-lime-300 mt-1"><i className="fas fa-plus-circle"></i> Tambah KPM</button>
                  </div>
                )}
                
                {isP2K2 && (
                  <div className="bg-lime-900/10 border border-lime-500/30 p-4 rounded-xl mb-3 shadow-inner">
                    <h3 className="text-xs font-bold text-lime-400 mb-3"><i className="fas fa-users mr-2"></i>Data P2K2</h3>
                    {arrP2K2.map((p, i) => (
                      <div key={i} className="border-b border-zinc-700/50 pb-3 mb-3 relative pt-4 mt-2">
                        <button type="button" onClick={()=>setArrP2K2(arrP2K2.filter((_, idx)=>idx!==i))} className="absolute top-1 right-0 text-red-500 text-[10px] font-bold"><i className="fas fa-times"></i> Hapus</button>
                        <div className="mb-3"><label className="block text-xs font-bold text-lime-300 mb-1">Nama Kelompok</label><input type="text" value={p.Kelompok} onChange={e=>updateP2K2(i,'Kelompok',e.target.value)} className="w-full p-3 text-sm rounded-lg glossy-input"/></div>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <div><label className="block text-xs font-bold text-lime-300 mb-1">Jml Hadir</label><input type="number" value={p.Hadir} onChange={e=>updateP2K2(i,'Hadir',e.target.value)} className="w-full p-3 text-sm rounded-lg glossy-input"/></div>
                            <div><label className="block text-xs font-bold text-lime-300 mb-1">Jml Absen</label><input type="number" value={p.Absen} onChange={e=>updateP2K2(i,'Absen',e.target.value)} className="w-full p-3 text-sm rounded-lg glossy-input"/></div>
                        </div>
                      </div>
                    ))}
                    <button type="button" onClick={addP2K2} className="text-xs font-bold text-lime-400 hover:text-lime-300 mt-1"><i className="fas fa-plus-circle"></i> Tambah Kelompok</button>
                  </div>
                )}

                {isVerkom && <div className="mb-3"><label className="block text-xs font-bold text-lime-300 mb-1">Nama Sekolah/Puskesmas</label><input type="text" value={dynamicExtra.verkomLokasi||''} onChange={e=>setDynamicExtra({...dynamicExtra, verkomLokasi:e.target.value})} className="w-full p-3 text-sm rounded-xl glossy-input"/></div>}
                {isSupervisi && <div className="mb-3"><label className="block text-xs font-bold text-lime-300 mb-1">Nama Yang Disupervisi</label><input type="text" value={dynamicExtra.supervisiNama||''} onChange={e=>setDynamicExtra({...dynamicExtra, supervisiNama:e.target.value})} className="w-full p-3 text-sm rounded-xl glossy-input"/></div>}
                {(!isGraduasi && !isP2K2 && !isVerkom && !isSupervisi) && <div className="mb-3"><label className="block text-xs font-bold text-lime-300 mb-1">Sasaran/Target Kegiatan</label><input type="text" value={formData.sasaranUmum} onChange={e=>setFormData({...formData, sasaranUmum:e.target.value})} className="w-full p-3 text-sm rounded-xl glossy-input"/></div>}

                <div className="mb-3"><label className="block text-xs font-bold text-lime-300 mb-1">Rincian / Hasil (Umum)</label><textarea value={formData.hasilKegiatan} onChange={e=>setFormData({...formData, hasilKegiatan:e.target.value})} className="w-full p-3 text-sm rounded-xl glossy-input" rows="3"></textarea></div>
                <div className="mb-3"><label className="block text-xs font-bold text-lime-300 mb-1">Catatan Tambahan (Bahan Analisa AI)</label><textarea value={formData.uraian} onChange={e=>setFormData({...formData, uraian:e.target.value})} required className="w-full p-3 text-sm rounded-xl glossy-input" rows="2"></textarea></div>
              </>
            )}
          </div>

          {/* FOTO DOKUMENTASI (CAMERA & GALLERY SIMPLIFIED TO FILE UPLOAD) */}
          <div className="mb-5">
            <label className="block text-xs font-bold text-lime-300 mb-2">Foto Dokumentasi (Maks 10 Foto, 3 Foto/Halaman)</label>
            <div className="bg-black/40 border border-lime-500/20 p-3 rounded-xl min-h-[80px] shadow-inner">
                  <div className="flex flex-wrap gap-3 items-center">
                    {fotoBase64.map((base64, i) => (
                      <div key={i} className="relative w-[60px] h-[60px]">
                        <img src={base64} className="w-full h-full object-cover rounded-lg border border-lime-500/40 shadow-md"/>
                        <div onClick={()=>setFotoBase64(fotoBase64.filter((_, idx)=>idx!==i))} className="absolute -top-2 -right-2 bg-red-600 text-white w-5 h-5 flex items-center justify-center rounded-full cursor-pointer shadow-lg text-[10px] z-10"><i className="fas fa-times"></i></div>
                      </div>
                    ))}
                    <div className="flex gap-2">
                        <label className="w-14 h-14 bg-lime-500/10 border border-dashed border-lime-500/50 flex flex-col items-center justify-center rounded-xl cursor-pointer text-lime-400 hover:bg-lime-500/20 transition-all">
                          <input type="file" accept="image/*" capture="environment" onChange={e=>handleFile(e, 'foto')} className="hidden" />
                          <i className="fas fa-camera text-lg"></i><span className="text-[8px] font-bold mt-1">Kamera</span>
                        </label>
                        <label className="w-14 h-14 bg-lime-500/10 border border-dashed border-lime-500/50 flex flex-col items-center justify-center rounded-xl cursor-pointer text-lime-400 hover:bg-lime-500/20 transition-all">
                          <input type="file" accept="image/*" multiple onChange={e=>handleFile(e, 'foto')} className="hidden" />
                          <i className="fas fa-image text-lg"></i><span className="text-[8px] font-bold mt-1">Galeri</span>
                        </label>
                    </div>
                  </div>
            </div>
            <div className="flex justify-between items-center mt-2"><p className="text-[10px] font-bold text-zinc-500 bg-zinc-800 px-2 py-1 rounded-md">{fotoBase64.length} / 10 Foto</p></div>
          </div>

          {/* FORMAT EKSPOR */}
          <div className="mb-4 bg-lime-900/10 p-3 rounded-xl border border-lime-500/30">
            <label className="block text-xs font-bold text-lime-300 mb-2"><i className="fas fa-file-export mr-1"></i> Format Ekspor (Bisa Pilih Keduanya)</label>
            <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm text-white cursor-pointer"><input type="checkbox" checked={formData.formatPDF} onChange={e=>setFormData({...formData, formatPDF:e.target.checked})} className="accent-lime-500 w-4 h-4"/> PDF</label>
                <label className="flex items-center gap-2 text-sm text-white cursor-pointer"><input type="checkbox" checked={formData.formatDOCX} onChange={e=>setFormData({...formData, formatDOCX:e.target.checked})} className="accent-lime-500 w-4 h-4"/> DOC (Word)</label>
            </div>
          </div>

          <button type="submit" className="w-full bg-gradient-to-r from-lime-500 to-lime-400 text-black font-extrabold py-4 px-4 rounded-xl shadow-[0_5px_20px_rgba(132,204,22,0.4)] hover:shadow-[0_5px_25px_rgba(132,204,22,0.6)] transform transition-all text-sm tracking-wide">
              <span><i className="fas fa-paper-plane mr-2"></i> Eksekusi AI (1 Token)</span>
          </button>
        </form>

        {/* MODAL REVIEW */}
        {showReview && (
          <div className="fixed inset-0 bg-[#09090b]/90 backdrop-blur-sm z-[700] flex flex-col items-center justify-center p-4">
              <div className="glossy-monster w-full max-w-sm rounded-2xl p-4 border border-lime-500/30 shadow-2xl relative">
                  <div className="border-b border-zinc-700 pb-2 mb-3">
                      <h3 className="text-lg font-bold text-lime-400"><i className="fas fa-clipboard-check mr-2"></i> Review Laporan</h3>
                      <p className="text-[10px] text-zinc-400">Pastikan seluruh data yang Anda isi sudah benar</p>
                  </div>
                  <div className="max-h-[60vh] overflow-y-auto custom-scrollbar pr-2 mb-4 text-xs text-zinc-300 space-y-3">
                      <div className="bg-zinc-800/50 p-3 rounded border border-lime-500/30">
                          <h4 className="text-lime-400 font-bold border-b border-zinc-700 pb-1 mb-2">Identitas & Waktu</h4>
                          <div className="grid grid-cols-2 gap-2">
                              <p><b>Tanggal:</b><br/>{formData.tanggal || '-'}</p>
                              <p><b>Waktu/Jam Mulai:</b><br/>{formData.waktu || '-'} ({formData.jamMulai || '-'})</p>
                              <p><b>Petugas:</b><br/>{formData.namaPetugas || '-'}</p>
                              <p><b>NIP:</b><br/>{formData.nip || '-'}</p>
                              <p className="col-span-2"><b>Jabatan:</b><br/>{formData.jabatan || '-'}</p>
                              <p><b>Kabupaten:</b><br/>{formData.kabupaten || '-'}</p>
                              <p className="col-span-2"><b>Lokasi:</b><br/>{formData.lokasi || '-'}</p>
                              <p className="col-span-2"><b>Email Akun:</b><br/>{formData.emailTarget || '-'}</p>
                              <p className="col-span-2"><b>Format Ekspor:</b><br/><span className="text-yellow-400 font-bold bg-yellow-900/40 px-2 py-0.5 rounded">{formData.formatPDF ? 'PDF ' : ''}{formData.formatDOCX ? '& DOCX' : ''}</span></p>
                          </div>
                      </div>
                      <div className="bg-zinc-800/50 p-3 rounded border border-lime-500/30">
                          <h4 className="text-lime-400 font-bold border-b border-zinc-700 pb-1 mb-2">Data Kegiatan & Surat</h4>
                          <p className="mb-2"><b>RHK:</b> {formData.kegiatan || '-'}</p>
                          <p className="mb-1"><b>Dasar Surat:</b><br/>{arrSurat.map(s => s.noSurat).join(' | ') || formData.dasarSurat || 'Tidak ada'}</p>
                          <p className="mb-2"><b>Perihal:</b><br/>{arrSurat.map(s => s.perihal).join(' | ') || formData.perihalSurat || 'Tidak ada'}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center text-[10px] mt-2">
                          <div className="bg-black/30 p-2 rounded border border-zinc-700">TTD:<br/>{ttdBase64 ? <span className='text-lime-400 font-bold'>✓ Masuk</span> : <span className='text-red-400 font-bold'>✗ Kosong</span>}</div>
                          <div className="bg-black/30 p-2 rounded border border-zinc-700">Foto:<br/><b className="text-lime-400">{fotoBase64.length}</b></div>
                          <div className="bg-black/30 p-2 rounded border border-zinc-700">Lampiran:<br/><b className="text-lime-400">{lampiranBase64.length}</b></div>
                      </div>
                  </div>
                  <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-xl text-[10px] text-zinc-300 mb-4">
                      <i className="fas fa-exclamation-triangle text-red-500 mr-1"></i> Jika lanjut, AI mengeksekusi Laporan Anda (1 Token Terpotong). Jika gagal terunduh karena koneksi terputus, Token HANGUS.
                  </div>
                  <div className="flex gap-3">
                      <button onClick={()=>setShowReview(false)} className="w-1/2 p-3 rounded-xl bg-zinc-800 text-zinc-300 text-sm font-bold border border-zinc-600 hover:bg-zinc-700 transition-all">Batal / Edit</button>
                      <button onClick={executeSubmit} className="w-1/2 p-3 rounded-xl bg-gradient-to-r from-lime-500 to-lime-400 text-black text-sm font-extrabold shadow-[0_0_15px_rgba(132,204,22,0.4)] hover:shadow-[0_0_20px_rgba(132,204,22,0.6)] transition-all">
                        {loading ? <i className="fas fa-spinner fa-spin"></i> : 'Generate'}
                      </button>
                  </div>
              </div>
          </div>
        )}

      </section>
    </main>
  )};

  const renderRiwayat = () => (
    <main className="p-5 flex-grow pb-28">
      <section className="glossy-monster p-5 rounded-2xl mb-6">
        <div className="flex justify-between items-center mb-4 border-b border-zinc-700 pb-2">
            <h2 className="text-lg font-bold text-lime-400"><i className="fas fa-history mr-2"></i> {userProfile.role === 'admin' ? 'Riwayat Global' : 'Riwayat Anda'}</h2>
        </div>

        <div className="overflow-x-auto overflow-y-auto custom-scrollbar rounded-lg border border-zinc-700 pb-2 relative w-full">
           <table className="min-w-full text-left text-[10px] text-zinc-300">
            <thead className="bg-zinc-900/80 text-lime-400 border-b border-lime-500/20 sticky top-0 z-10 backdrop-blur-md">
              <tr>
                {userProfile.role === 'admin' && <th className="p-3 whitespace-nowrap">Nama</th>}
                <th className="p-3 whitespace-nowrap">Tanggal & Jam</th>
                <th className="p-3 whitespace-nowrap">Kegiatan</th>
                <th className="p-3 whitespace-nowrap">Status</th>
                <th className="p-3 whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {riwayat.length === 0 ? 
                <tr><td colSpan={userProfile.role==='admin'?5:4} className="text-center p-6 text-zinc-500">Belum ada riwayat</td></tr> 
              : riwayat.map((r, i) => (
                <tr key={i} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                  {userProfile.role === 'admin' && <td className="p-2 whitespace-nowrap leading-tight">{r.profil?.nama}<br/><span className="text-[8px] text-lime-300"><i className="fas fa-coins"></i> Token: {r.profil?.token}</span></td>}
                  <td className="p-2 text-[9px] whitespace-nowrap">{r.laporan?.tanggal}<br/><span className="text-lime-300 font-bold bg-lime-900/30 px-1 py-0.5 rounded border border-lime-500/30 inline-block mt-1"><i className="far fa-clock"></i> {r.laporan?.jamMulai || "-"}</span></td>
                  <td className="p-2 text-[9px] whitespace-nowrap" title={r.laporan?.kegiatan}>{r.laporan?.kegiatan}</td>
                  <td className="p-2 text-[9px] text-lime-400 font-bold whitespace-nowrap">Sukses</td>
                  <td className="p-2 text-[9px] whitespace-nowrap">
                    <button onClick={()=>copyToClipboard(r.pdfLink)} className="bg-lime-500/20 text-lime-400 border border-lime-500/50 p-1.5 rounded hover:bg-lime-500/40"><i className="fas fa-copy"></i> Link Drive</button>
                  </td>
                </tr>
              ))}
            </tbody>
           </table>
        </div>
      </section>
    </main>
  );

  const renderBeliToken = () => (
    <main className="p-5 flex-grow pb-28">
      <section className="glossy-monster p-5 rounded-2xl mb-6">
        <h2 className="text-lg font-bold text-lime-400 border-b border-zinc-700 pb-2"><i className="fas fa-coins mr-2"></i> Beli Token AI</h2>
        <div className="mt-4 bg-zinc-900/50 p-3 rounded-xl border border-lime-500/20 text-xs text-zinc-300 mb-4">
             <p className="font-bold text-lime-400 mb-1"><i className="fas fa-info-circle"></i> Fasilitas Premium:</p>
            <ul className="list-disc pl-4 space-y-1">
                <li>Unduh Otomatis Format PDF/DOC</li>
                <li>Analisis Aturan Dasar Hukum Otomatis</li>
                <li>Tanda Tangan digital tersimpan otomatis</li>
             </ul>
        </div>
        
        {[
          { nama: 'Paket Basic', token: 6, harga: 'Rp 10.000', icon: '' },
          { nama: 'Paket Pro', token: 20, harga: 'Rp 30.000', icon: '<i class="fas fa-star text-yellow-400 text-[10px] ml-1"></i>' },
          { nama: 'Paket Ultra', token: 35, harga: 'Rp 50.000', icon: '<i class="fas fa-crown text-yellow-400 text-[10px] ml-1"></i>' }
        ].map((p, i) => (
          <div key={i} className="mb-3 bg-lime-900/20 border border-lime-500/30 p-4 rounded-xl flex justify-between items-center transition-all hover:bg-lime-900/40">
            <div>
                <h3 className="font-bold text-white text-md flex items-center" dangerouslySetInnerHTML={{__html: p.nama + p.icon}}></h3>
                <p className="text-xs text-zinc-300">{p.token} Token Laporan</p>
            </div>
            <div className="text-right">
                <p className="text-lg font-black text-lime-400 mb-1">{p.harga}</p>
                <button onClick={() => window.open(`https://wa.me/${appSettings.noWa}?text=Halo Admin, saya ingin beli ${p.nama} (${p.token} Token) untuk Token ID: ${userProfile.token}`, '_blank')} className="bg-green-600 text-white font-bold py-1.5 px-3 rounded-lg hover:bg-green-500 text-xs shadow-lg"><i className="fab fa-whatsapp"></i> Beli</button>
            </div>
          </div>
        ))}

        <div className="border-t border-zinc-700 pt-4 mt-4">
          <div className="border-b border-white/5 pb-4">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-2"><i className="fas fa-university text-lime-400"></i> Bank BCA</p>
            <h3 className="text-2xl font-black text-white tracking-widest mb-1">{appSettings.rekBca}</h3>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">a.n {appSettings.namaRek}</p>
          </div>
          <div className="pt-4">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-2"><i className="fas fa-qrcode text-lime-400"></i> DANA / QRIS</p>
            <h3 className="text-2xl font-black text-lime-400 tracking-widest mb-1">{appSettings.rekDana}</h3>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">a.n {appSettings.namaRek}</p>
          </div>
        </div>

        <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-xl mb-2 mt-4">
          <label className="flex items-start gap-2">
            <input type="checkbox" checked readOnly className="mt-1 w-4 h-4 accent-lime-500 shrink-0"/>
            <span className="text-[10px] text-zinc-300 leading-tight"><b>PERSETUJUAN (MUTLAK):</b> Saya menyetujui bahwa <b>uang/token tidak dapat di-refund atau dikembalikan dengan alasan APAPUN</b>. Saya sepenuhnya bertanggung jawab atas kebenaran isian formulir. Jika laporan gagal diunduh dikarenakan koneksi terputus, token yang terpotong <b>HANGUS</b>.</span>
          </label>
        </div>
      </section>

      <section className="glossy-monster p-5 rounded-2xl mb-6">
         <h2 className="text-lg font-bold text-lime-400 border-b border-zinc-700 pb-2"><i className="fas fa-book mr-2"></i> Panduan & Aturan Sistem</h2>
         <div className="mt-4 mb-6 bg-lime-900/20 p-4 rounded-xl border border-lime-500/30 text-center flex flex-col items-center">
             <p className="text-xs text-lime-300 mb-2 font-bold uppercase tracking-wider">Scan QRIS Untuk Top-up Token:</p>
             <div className="w-full max-w-[200px] h-48 bg-white rounded-xl flex items-center justify-center border-2 border-lime-500/50 shadow-[0_0_15px_rgba(132,204,22,0.3)] overflow-hidden">
                {appSettings.qrisUrl ? <img src={appSettings.qrisUrl} alt="QRIS" className="w-full h-full object-contain" /> : <i className="fas fa-qrcode text-6xl text-black"></i>}
             </div>
             <p className="text-[9px] text-zinc-400 mt-2">*Simpan struk & kirim ke WhatsApp Admin</p>
         </div>
      </section>
    </main>
  );

  const renderAdminPanel = () => (
    <main className="p-5 flex-grow pb-28">
      <section className="glossy-monster p-5 rounded-2xl mb-6">
        <h2 className="text-lg font-bold text-lime-400 border-b border-zinc-700 pb-2"><i className="fas fa-cogs mr-2"></i> Panel Super Admin</h2>
        
        {/* PENGATURAN SISTEM GLOBAL (BARU) */}
        <h3 className="text-sm font-bold text-white mt-4 mb-3 border-b border-zinc-700 pb-2"><i className="fas fa-sliders-h mr-2"></i> Pengaturan Sistem Global</h3>
        <div className="space-y-4 mb-8">
            <div><label className="block text-[10px] font-bold text-zinc-400 mb-1">Webhook GAS URL (Pembuat PDF)</label><input type="text" value={adminSettingsForm.webhookUrl} onChange={e=>setAdminSettingsForm({...adminSettingsForm, webhookUrl:e.target.value})} className="w-full p-2 text-xs rounded-lg glossy-input"/></div>
            <div><label className="block text-[10px] font-bold text-zinc-400 mb-1">ID Template Google Docs</label><input type="text" value={adminSettingsForm.templateId} onChange={e=>setAdminSettingsForm({...adminSettingsForm, templateId:e.target.value})} className="w-full p-2 text-xs rounded-lg glossy-input"/></div>
            <div><label className="block text-[10px] font-bold text-zinc-400 mb-1">Link Drive Master Folder</label><input type="text" value={adminSettingsForm.masterDriveLink} onChange={e=>setAdminSettingsForm({...adminSettingsForm, masterDriveLink:e.target.value})} className="w-full p-2 text-xs rounded-lg glossy-input"/></div>
            <div><label className="block text-[10px] font-bold text-zinc-400 mb-1">Nomor WA Admin (Awalan 62)</label><input type="text" value={adminSettingsForm.noWa} onChange={e=>setAdminSettingsForm({...adminSettingsForm, noWa:e.target.value})} className="w-full p-2 text-xs rounded-lg glossy-input"/></div>
            <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-[10px] font-bold text-zinc-400 mb-1">Rekening BCA</label><input type="text" value={adminSettingsForm.rekBca} onChange={e=>setAdminSettingsForm({...adminSettingsForm, rekBca:e.target.value})} className="w-full p-2 text-xs rounded-lg glossy-input"/></div>
                <div><label className="block text-[10px] font-bold text-zinc-400 mb-1">Rekening DANA/QRIS</label><input type="text" value={adminSettingsForm.rekDana} onChange={e=>setAdminSettingsForm({...adminSettingsForm, rekDana:e.target.value})} className="w-full p-2 text-xs rounded-lg glossy-input"/></div>
            </div>
            <div><label className="block text-[10px] font-bold text-zinc-400 mb-1">Nama Pemilik Rekening</label><input type="text" value={adminSettingsForm.namaRek} onChange={e=>setAdminSettingsForm({...adminSettingsForm, namaRek:e.target.value})} className="w-full p-2 text-xs rounded-lg glossy-input"/></div>
            <div><label className="block text-[10px] font-bold text-zinc-400 mb-1">URL Gambar QRIS (Drive/Imgur)</label><input type="text" value={adminSettingsForm.qrisUrl} onChange={e=>setAdminSettingsForm({...adminSettingsForm, qrisUrl:e.target.value})} className="w-full p-2 text-xs rounded-lg glossy-input"/></div>
            <button onClick={handleSaveSettings} disabled={loading} className="w-full bg-lime-600 text-black px-3 py-3 rounded-lg text-xs font-bold hover:bg-lime-500 shadow-md transition-all active:scale-95">
                {loading ? <i className="fas fa-spinner fa-spin"></i> : <><i className="fas fa-save mr-2"></i> Simpan Pengaturan</>}
            </button>
        </div>

        <h3 className="text-sm font-bold text-white mt-6 mb-2 border-b border-zinc-700 pb-2"><i className="fas fa-users mr-2"></i> Manajemen User & Token</h3>
        <div className="overflow-x-auto rounded-lg border border-zinc-700">
            <table className="min-w-full text-left text-[10px] text-zinc-300">
             <thead className="bg-zinc-900/80 text-lime-400 border-b border-lime-500/20">
                <tr><th className="p-2 whitespace-nowrap">Email/Nama</th><th className="p-2 whitespace-nowrap">Token</th><th className="p-2 whitespace-nowrap">Aksi</th></tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
               {allUsers.length === 0 ? <tr><td colSpan="3" className="text-center p-4">Tidak ada data</td></tr> :
                 allUsers.map((u, i) => (
                   <tr key={i} className="border-b border-zinc-800/50">
                        <td className="p-2 whitespace-nowrap">{u.nama}<br/><span className="text-[8px] text-zinc-500">{u.email}</span></td>
                        <td className="p-2 font-bold text-lime-400 whitespace-nowrap">{u.token} <br/><span className="text-white text-[8px]">Sisa: {u.sisaToken}</span></td>
                        <td className="p-2 whitespace-nowrap">
                           <button onClick={()=>handleTopUpToken(u.token, u.sisaToken)} className="bg-green-600 text-white px-3 py-1 rounded text-[9px] hover:bg-green-500 shadow-md transition-all active:scale-95 whitespace-nowrap">Top Up / Aktifkan</button>
                        </td>
                    </tr>
                 ))
               }
            </tbody>
           </table>
        </div>
      </section>
    </main>
  );

  return (
    <div className="app-bg min-h-screen font-sans antialiased text-gray-100 selection:bg-lime-500 selection:text-black">
      {renderToast()}
      {activeTab === 'login' && renderLogin()}
      {activeTab === 'register' && renderRegister()}
      {userProfile && activeTab !== 'login' && activeTab !== 'register' && (
        <>
          {renderHeader()}
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'form' && renderForm()}
          {activeTab === 'riwayat' && renderRiwayat()}
          {activeTab === 'beliToken' && renderBeliToken()}
          {activeTab === 'admin_panel' && userProfile.role === 'admin' && renderAdminPanel()}
          
          {/* NAVIGASI BAWAH 100% PERSIS HTML ASLI */}
          <nav className="bottom-nav">
             <div className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => nav('dashboard')}><i className="fas fa-home text-lg"></i><span className="text-[9px] font-bold mt-1">Beranda</span></div>
             <div className={`nav-btn ${activeTab === 'riwayat' ? 'active' : ''}`} onClick={() => nav('riwayat')}><i className="fas fa-history text-lg"></i><span className="text-[9px] font-bold mt-1">Riwayat</span></div>
             <div className="relative w-[20%] flex justify-center">
                <div className="absolute top-0 transform -translate-y-[60%] bg-gradient-to-tr from-lime-500 to-lime-300 text-black w-14 h-14 rounded-full border-4 border-[#09090b] flex items-center justify-center fab-button z-50 transition-transform active:scale-90 shadow-[0_0_15px_rgba(132,204,22,0.6)] cursor-pointer" onClick={() => nav('form')}>
                  <i className="fas fa-plus text-xl drop-shadow-md"></i>
                </div>
             </div>
             <div className={`nav-btn ${activeTab === 'beliToken' ? 'active' : ''}`} onClick={() => nav('beliToken')}><i className="fas fa-coins text-lg"></i><span className="text-[9px] font-bold mt-1">Token</span></div>
             <div className={`nav-btn ${activeTab === 'panduan' ? 'active' : ''}`} onClick={() => { if(userProfile.role === 'admin') nav('admin_panel'); else showToastMsg('Menu Panduan segera hadir', 'success'); }}><i className="fas fa-book text-lg"></i><span className="text-[9px] font-bold mt-1">Panduan</span></div>
          </nav>
        </>
      )}
    </div>
  );
}
