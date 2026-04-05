/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { getDatabase, ref, set, get, child, update, push, onValue, query, orderByChild, equalTo, serverTimestamp } from 'firebase/database';
import { ShieldAlert, LogOut, CheckCircle2, Upload, FileText, Database, CreditCard, Play, Settings, QrCode, Building, Phone, Info } from 'lucide-react';

// ============================================================================
// ⚙️ KONFIGURASI ENVIRONMENT & API (VERCEL SAFE)
// ============================================================================
const ENV = {
  GEMINI_API_KEY: import.meta.env?.VITE_GEMINI_API_KEY || "AIzaSyBZK_ywNsBVLKBs9dejOvmVx9Ib6yfPF-g", 
  WEBHOOK_GAS_URL: import.meta.env?.VITE_WEBHOOK_GAS_URL || "",
  MASTER_DRIVE_LINK: import.meta.env?.VITE_MASTER_DRIVE_LINK || "",
  TEMPLATE_DOC_ID: import.meta.env?.VITE_TEMPLATE_DOC_ID || ""
};

// ============================================================================
// 🔥 PASTE KONFIGURASI FIREBASE ANDA DI BAWAH INI
// ============================================================================
const firebaseConfig = {
  apiKey: "AIzaSyAe-mQ8o9VQUE-bjvH1_zFF4BgJiZZ84B8",
  authDomain: "e-genlap.firebaseapp.com",
  // PASTIKAN URL DI BAWAH INI BENAR SESUAI FIREBASE CONSOLE ANDA:
  databaseURL: "https://e-genlap-default-rtdb.firebaseio.com", 
  projectId: "e-genlap",
  storageBucket: "e-genlap.firebasestorage.app",
  messagingSenderId: "717106227570",
  appId: "1:717106227570:web:40ae5a838eec42efea95eb"
};
// ============================================================================

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app); 
const appId = firebaseConfig.appId.replace(/:/g, '-'); 

const USERS_PATH = `artifacts/${appId}/public/data/users`;
const TRANSACTIONS_PATH = `artifacts/${appId}/public/data/transactions`;
const SETTINGS_PATH = `artifacts/${appId}/public/data/settings/general_config`;

const DEFAULT_SETTINGS = { wa_admin: "6285349450549", bank_nama: "BCA", bank_rekening: "1234567890", bank_pemilik: "M. Zaen Syachrullah", qris_url: "", harga_per_token: 1000 };

export default function EGenLapApp() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [appSettings, setAppSettings] = useState(DEFAULT_SETTINGS);
  const [view, setView] = useState('login'); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchUserData(currentUser.uid);
      } else {
        setUserData(null);
        setView('login');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const snapshot = await get(child(ref(db), SETTINGS_PATH));
        if (snapshot.exists()) setAppSettings(snapshot.val());
      } catch (err) { console.error("Error fetch settings:", err); }
    };
    fetchSettings();
  }, []);

  const fetchUserData = async (uid) => {
    try {
      const snapshot = await get(child(ref(db), `${USERS_PATH}/${uid}`));
      if (snapshot.exists()) {
        const data = snapshot.val();
        setUserData(data);
        setView(data.role === 'admin' ? 'admin' : 'dashboard');
      }
    } catch (err) { console.error("Error fetch user data:", err); }
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-[#0f1115]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a3e635]"></div></div>;

  return (
    <div className="min-h-screen bg-[#0f1115] text-gray-200 font-sans selection:bg-[#a3e635] selection:text-black">
      {user && userData && (
        <nav className="bg-[#161b22] border-b border-gray-800 text-white shadow-md px-4 md:px-8 py-4 flex justify-between items-center sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <Database size={24} className="text-[#a3e635]" />
            <h1 className="text-xl font-black tracking-wider uppercase">E-GenLap <span className="text-[#a3e635]">PRO</span></h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden md:inline font-medium text-sm text-gray-400">Halo, {userData.nama}</span>
            {userData.role === 'user' && (
              <span className="bg-[#21262d] border border-[#a3e635]/30 text-[#a3e635] px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-2">
                <CreditCard size={16} /> {userData.token_balance} Token
              </span>
            )}
            <button onClick={() => signOut(auth)} className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white p-2 rounded-lg transition-colors" title="Logout">
              <LogOut size={20} />
            </button>
          </div>
        </nav>
      )}

      <main className="max-w-6xl mx-auto p-4 md:p-8">
        {!user ? (
          <AuthView />
        ) : (
          <div className="animate-fadeIn">
            {view === 'dashboard' && <UserDashboard userData={userData} setView={setView} />}
            {view === 'admin' && <AdminDashboard appSettings={appSettings} setAppSettings={setAppSettings} />}
            {view === 'topup' && <TopUpView userData={userData} setView={setView} appSettings={appSettings} />}
          </div>
        )}
      </main>
    </div>
  );
}

// ============================================================================
// KOMPONEN AUTENTIKASI (DENGAN DETEKTOR ERROR)
// ============================================================================
function AuthView() {
  const [isLogin, setIsLogin] = useState(false); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nama, setNama] = useState('');
  const [nip, setNip] = useState('');
  const [jabatan, setJabatan] = useState('KATIM KABKOT');
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Coba simpan ke Realtime Database
        await set(ref(db, `${USERS_PATH}/${userCredential.user.uid}`), {
          uid: userCredential.user.uid,
          nama: nama,
          nip: nip,
          jabatan: jabatan,
          email: email,
          drive_folder_id: '', 
          role: 'user', 
          token_balance: 2, 
          createdAt: serverTimestamp()
        });
      }
    } catch (err) {
      console.error("FULL ERROR DETAIL:", err); 
      // TAMPILKAN ERROR ASLI KE LAYAR AGAR KITA TAHU PENYAKITNYA
      let errorMsg = `GAGAL SISTEM: [${err.code}] ${err.message}`;
      if(err.code === 'auth/invalid-credential') errorMsg = "Email atau Password salah!";
      if(err.code === 'auth/email-already-in-use') errorMsg = "Email ini sudah terdaftar! Silakan Login.";
      if(err.code === 'auth/weak-password') errorMsg = "Password terlalu lemah, minimal 6 karakter!";
      setError(errorMsg);
    } finally {
      setIsLoading(false); 
    }
  };

  return (
    <div className="flex items-center justify-center mt-8 md:mt-12">
      <div className="bg-[#161b22] border border-gray-800 p-8 md:p-10 rounded-2xl shadow-2xl w-full max-w-xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-white tracking-tight">{isLogin ? 'Login Sistem' : 'Registrasi Sistem'}</h2>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl text-sm mb-6 font-mono text-xs">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <input type="text" required value={nama} onChange={(e) => setNama(e.target.value)} className="w-full bg-[#0d1117] border border-gray-700 text-gray-200 rounded-xl p-4 focus:border-[#a3e635] outline-none" placeholder="Nama Lengkap" />
              <input type="text" required value={nip} onChange={(e) => setNip(e.target.value)} className="w-full bg-[#0d1117] border border-gray-700 text-gray-200 rounded-xl p-4 focus:border-[#a3e635] outline-none" placeholder="NIP/NIK" />
              <select value={jabatan} onChange={(e) => setJabatan(e.target.value)} className="w-full bg-[#0d1117] border border-gray-700 text-gray-200 rounded-xl p-4 focus:border-[#a3e635] outline-none font-bold">
                <option value="KATIM KABKOT">KATIM KABKOT</option>
                <option value="PENDAMPING SOSIAL">PENDAMPING SOSIAL</option>
              </select>
            </>
          )}
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-[#0d1117] border border-gray-700 text-gray-200 rounded-xl p-4 focus:border-[#a3e635] outline-none" placeholder="Email Akun" />
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-[#0d1117] border border-gray-700 text-gray-200 rounded-xl p-4 focus:border-[#a3e635] outline-none" placeholder="Password (Min 6 Karakter)" />
          
          <button type="submit" disabled={isLoading} className="w-full bg-[#a3e635] text-black font-black text-lg py-4 rounded-xl hover:bg-[#84cc16] transition flex justify-center items-center mt-4">
            {isLoading ? <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black"></div> : (isLogin ? 'Masuk' : 'Daftar Sekarang')}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 font-medium">
            <button onClick={() => setIsLogin(!isLogin)} className="text-[#a3e635] font-bold hover:underline">
              {isLogin ? 'Belum punya akun? Daftar' : 'Sudah punya akun? Login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// KOMPONEN DASHBOARD USER
// ============================================================================
function UserDashboard({ userData, setView }) {
  const [driveLink, setDriveLink] = useState(userData.drive_folder_id || '');
  const [savingLink, setSavingLink] = useState(false);
  const [formData, setFormData] = useState({ tanggal: '', kegiatan: '', status: 'Selesai', keterangan: '' });
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState('');

  const handleSaveDriveLink = async () => {
    setSavingLink(true);
    try {
      await update(ref(db, `${USERS_PATH}/${userData.uid}`), { drive_folder_id: driveLink });
      alert("✅ Link Folder Drive Berhasil Disimpan!");
    } catch (err) {
      alert("❌ Gagal menyimpan link. Coba lagi.");
    }
    setSavingLink(false);
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!driveLink) return alert("⚠️ Mohon isi dan simpan Link Folder Google Drive Anda terlebih dahulu di panel sebelah kiri!");
    if (userData.token_balance <= 0) return alert("⛔ Saldo Token Habis! Silahkan isi ulang untuk melanjutkan.");

    setIsGenerating(true);
    setMessage('🤖 Gemini AI Menyusun Laporan...');

    try {
      const prompt = `Buatlah 2-3 paragraf laporan narasi profesional untuk kegiatan. 
      Data: 
      - Nama: ${userData.nama}
      - Jabatan: ${userData.jabatan}
      - Tanggal: ${formData.tanggal}
      - Nama Kegiatan: ${formData.kegiatan}
      - Status: ${formData.status}
      - Detail: ${formData.keterangan}
      
      Aturan: Gunakan bahasa Indonesia baku, formal, objektif.`;
      
      const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${ENV.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const aiData = await aiResponse.json();
      const narasiText = aiData.candidates?.[0]?.content?.parts?.[0]?.text || "Laporan kegiatan terlaksana dengan baik dan lancar.";

      setMessage('📄 Membuat PDF & Menyimpan ke Drive...');

      await fetch(ENV.WEBHOOK_GAS_URL, {
        method: 'POST',
        mode: 'no-cors', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: "generate_pdf",
          nama: userData.nama,
          tanggal: formData.tanggal,
          kegiatan: formData.kegiatan,
          narasi: narasiText,
          folder_id: driveLink,
          template_id: ENV.TEMPLATE_DOC_ID
        })
      });

      await update(ref(db, `${USERS_PATH}/${userData.uid}`), {
        token_balance: userData.token_balance - 1
      });

      alert("🎉 Laporan Berhasil Dibuat! PDF sudah masuk ke Google Drive Anda.");
      setFormData({ tanggal: '', kegiatan: '', status: 'Selesai', keterangan: '' });
      window.location.reload(); 

    } catch (error) {
      alert("❌ Terjadi kesalahan saat memproses laporan. Pastikan API Key benar.");
      console.error(error);
    }
    setIsGenerating(false);
    setMessage('');
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
      <div className="space-y-6">
        <div className="bg-[#161b22] border border-gray-800 p-6 rounded-2xl shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold flex items-center gap-2 text-gray-300"><CreditCard size={20}/> Saldo Token</h3>
          </div>
          <div className="text-5xl font-black tracking-tight mb-2 flex items-end gap-2 text-white">
            {userData.token_balance} <span className="text-lg font-normal text-gray-500 mb-1">Token</span>
          </div>
          <p className="text-sm text-gray-500 mb-6">1 Token = 1 Generate PDF AI</p>
          
          <button onClick={() => setView('topup')} className="w-full bg-[#21262d] border border-gray-700 hover:bg-[#a3e635] hover:text-black hover:border-[#a3e635] text-white font-bold py-3 rounded-xl transition shadow-md flex items-center justify-center gap-2">
            Isi Ulang Token
          </button>
        </div>

        <div className="bg-[#161b22] border border-gray-800 p-6 rounded-2xl shadow-lg">
          <h3 className="font-bold text-white mb-3 flex items-center gap-2"><Database size={18} className="text-[#a3e635]"/> Target Google Drive</h3>
          <p className="text-sm text-gray-400 mb-4 leading-relaxed">
            Masukkan <b>ID Folder</b> Drive tujuan. Pastikan folder disetting Editor publik.
          </p>
          <div className="space-y-3">
            <input 
              type="text" 
              value={driveLink} 
              onChange={(e) => setDriveLink(e.target.value)}
              placeholder="Contoh: 1ky6sbBxgpmZ..." 
              className="w-full bg-[#0d1117] border border-gray-700 text-gray-200 rounded-xl p-3 text-sm focus:border-[#a3e635] outline-none"
            />
            <button onClick={handleSaveDriveLink} disabled={savingLink} className="w-full bg-[#a3e635] text-black font-bold py-3 rounded-xl hover:bg-[#84cc16] transition flex justify-center">
              {savingLink ? 'Menyimpan...' : 'Simpan Link Folder'}
            </button>
          </div>
        </div>
      </div>

      <div className="lg:col-span-2 bg-[#161b22] border border-gray-800 p-6 md:p-8 rounded-2xl shadow-lg relative overflow-hidden">
        <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-2">
          <Upload className="text-[#a3e635]"/> Buat Laporan Harian
        </h2>
        
        <form onSubmit={handleGenerate} className="space-y-5 relative z-10">
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-1.5">Tanggal Kegiatan</label>
              <input type="date" required value={formData.tanggal} onChange={(e) => setFormData({...formData, tanggal: e.target.value})} className="w-full bg-[#0d1117] border border-gray-700 text-white rounded-xl p-3 focus:border-[#a3e635] outline-none [color-scheme:dark]" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-400 mb-1.5">Status Kegiatan</label>
              <select required value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full bg-[#0d1117] border border-gray-700 text-white rounded-xl p-3 focus:border-[#a3e635] outline-none font-medium">
                <option value="Selesai">✅ Selesai</option>
                <option value="Dalam Proses">⏳ Dalam Proses</option>
                <option value="Tertunda">❌ Tertunda</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-400 mb-1.5">Judul / Jenis Kegiatan</label>
            <input type="text" required value={formData.kegiatan} onChange={(e) => setFormData({...formData, kegiatan: e.target.value})} placeholder="Contoh: Pendampingan KPM Penyaluran PKH Tahap 2" className="w-full bg-[#0d1117] border border-gray-700 text-white rounded-xl p-3 focus:border-[#a3e635] outline-none" />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-400 mb-1.5">Detail & Temuan Lapangan</label>
            <textarea required value={formData.keterangan} onChange={(e) => setFormData({...formData, keterangan: e.target.value})} rows="4" placeholder="Tuliskan catatan, kendala, atau hasil yang dicapai secara singkat..." className="w-full bg-[#0d1117] border border-gray-700 text-white rounded-xl p-3 focus:border-[#a3e635] outline-none resize-none"></textarea>
          </div>

          <div className="pt-6 border-t border-gray-800">
             <button type="submit" disabled={isGenerating} className={`w-full font-black py-4 rounded-xl text-lg flex justify-center items-center gap-3 transition-all ${isGenerating ? 'bg-[#21262d] text-gray-500 cursor-not-allowed border border-gray-700' : 'bg-[#a3e635] text-black hover:bg-[#84cc16] shadow-lg'}`}>
                {isGenerating ? (
                  <><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div> <span>{message}</span></>
                ) : (
                  <><Play fill="currentColor" size={20} /> GENERATE LAPORAN & SIMPAN KE DRIVE</>
                )}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// KOMPONEN TOPUP
// ============================================================================
function TopUpView({ userData, setView, appSettings }) {
  const [paket, setPaket] = useState(10);
  const [buktiUrl, setBuktiUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAjukan = async () => {
    if(!buktiUrl) return alert("Mohon cantumkan link bukti transfer Anda!");
    setLoading(true);
    try {
      await push(ref(db, TRANSACTIONS_PATH), {
        userId: userData.uid,
        nama: userData.nama,
        email: userData.email,
        jumlah_token: paket,
        total_harga: paket * appSettings.harga_per_token,
        bukti_url: buktiUrl,
        status: 'pending',
        tanggal: serverTimestamp()
      });
      alert(`✅ Berhasil! Silahkan konfirmasi ke WhatsApp Admin: ${appSettings.wa_admin}`);
      setView('dashboard');
    } catch (e) {
      alert("❌ Gagal mengirim permintaan.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => setView('dashboard')} className="text-sm text-gray-400 hover:text-white font-medium mb-6 flex items-center transition">
        ← Kembali ke Dashboard
      </button>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-[#161b22] border border-gray-800 p-8 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-black text-white mb-2">Isi Ulang Token</h2>
          <div className="space-y-4 mb-8 mt-4">
            {[10, 30, 50, 100].map(jml => (
              <label key={jml} className={`block p-4 border rounded-xl cursor-pointer transition-all ${paket === jml ? 'border-[#a3e635] bg-[#a3e635]/10 shadow-md' : 'border-gray-700 hover:border-gray-600 bg-[#0d1117]'}`}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-white text-lg">{jml} Laporan</span>
                  </div>
                  <span className="font-black text-[#a3e635] text-lg">Rp {(jml * appSettings.harga_per_token).toLocaleString('id-ID')}</span>
                </div>
              </label>
            ))}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-400 mb-2">Link Foto Bukti Transfer</label>
            <input type="text" value={buktiUrl} onChange={(e) => setBuktiUrl(e.target.value)} placeholder="Contoh: https://drive.google.com/file/d/..." className="w-full bg-[#0d1117] border border-gray-700 text-white rounded-xl p-3 focus:border-[#a3e635] outline-none text-sm" />
          </div>

          <button onClick={handleAjukan} disabled={loading} className="w-full bg-[#a3e635] text-black font-black py-4 rounded-xl hover:bg-[#84cc16] transition shadow-lg">
            {loading ? 'Memproses Sistem...' : 'Konfirmasi Pembayaran'}
          </button>
        </div>

        <div className="bg-[#161b22] border border-gray-800 p-8 rounded-2xl shadow-lg">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white"><Building className="text-[#a3e635]" size={20}/> Informasi Pembayaran</h3>
          
          <div className="bg-[#0d1117] p-5 rounded-xl border border-gray-700 mb-6">
            <p className="text-sm text-gray-400 mb-1 font-medium">Transfer Bank</p>
            <p className="text-2xl font-black tracking-widest text-[#a3e635] mb-1">{appSettings.bank_rekening}</p>
            <p className="font-bold text-lg text-white mb-1">{appSettings.bank_nama}</p>
            <p className="text-sm text-gray-400 uppercase">a.n {appSettings.bank_pemilik}</p>
          </div>

          {appSettings.qris_url && (
             <div className="bg-[#0d1117] p-4 rounded-xl text-center border border-gray-700">
               <p className="text-gray-300 font-bold mb-3 text-sm flex items-center justify-center gap-1"><QrCode size={16}/> Scan QRIS</p>
               <img src={appSettings.qris_url} alt="QRIS" className="w-full max-w-[200px] mx-auto rounded-lg" />
             </div>
          )}

          <div className="mt-6 flex items-center gap-3 text-sm text-gray-300 bg-[#0d1117] p-4 rounded-xl border border-gray-700">
            <Phone size={18} className="text-[#a3e635]"/>
            <div>
              <p className="font-bold text-white">Butuh Bantuan?</p>
              <p>Hubungi Admin: +{appSettings.wa_admin}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// KOMPONEN ADMIN
// ============================================================================
function AdminDashboard({ appSettings, setAppSettings }) {
  const [activeTab, setActiveTab] = useState('transaksi'); 
  const [transactions, setTransactions] = useState([]);
  const [formSettings, setFormSettings] = useState(appSettings);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  useEffect(() => {
    const dbRef = ref(db, TRANSACTIONS_PATH);
    const pendingQuery = query(dbRef, orderByChild('status'), equalTo('pending'));
    
    const unsubscribe = onValue(pendingQuery, (snapshot) => {
      const data = [];
      snapshot.forEach(childSnapshot => {
        data.push({ id: childSnapshot.key, ...childSnapshot.val() });
      });
      setTransactions(data);
    });
    
    return () => unsubscribe(); 
  }, []);

  const handleApprove = async (trx) => {
    if(window.confirm(`Yakin menyetujui penambahan ${trx.jumlah_token} Token untuk ${trx.nama}?`)) {
      try {
        const userRef = ref(db, `${USERS_PATH}/${trx.userId}`);
        const userSnap = await get(userRef);
        const currentToken = userSnap.val().token_balance || 0;

        await update(userRef, { token_balance: currentToken + trx.jumlah_token });
        await update(ref(db, `${TRANSACTIONS_PATH}/${trx.id}`), { status: 'approved' });
        
        alert("Pembayaran disetujui, token otomatis masuk!");
      } catch (error) {
        alert("Terjadi kesalahan sistem.");
      }
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      await set(ref(db, SETTINGS_PATH), formSettings);
      setAppSettings(formSettings);
      alert("✅ Pengaturan Sistem Berhasil Diperbarui!");
    } catch (err) {
      alert("❌ Gagal menyimpan pengaturan.");
    }
    setIsSavingSettings(false);
  };

  return (
    <div className="bg-[#161b22] rounded-2xl shadow-lg border border-gray-800 overflow-hidden">
      <div className="bg-[#0d1117] text-white p-6 md:p-8 border-b border-gray-800">
        <h2 className="text-2xl font-black flex items-center gap-3">
          <ShieldAlert className="text-red-500" size={28} /> Control Panel Admin
        </h2>
      </div>

      <div className="flex border-b border-gray-800 bg-[#0d1117]">
        <button onClick={() => setActiveTab('transaksi')} className={`flex-1 py-4 font-bold text-sm transition ${activeTab === 'transaksi' ? 'bg-[#161b22] text-[#a3e635] border-b-2 border-[#a3e635]' : 'text-gray-500 hover:text-gray-300'}`}>
          Menunggu Konfirmasi ({transactions.length})
        </button>
        <button onClick={() => setActiveTab('pengaturan')} className={`flex-1 py-4 font-bold text-sm flex items-center justify-center gap-2 transition ${activeTab === 'pengaturan' ? 'bg-[#161b22] text-[#a3e635] border-b-2 border-[#a3e635]' : 'text-gray-500 hover:text-gray-300'}`}>
          <Settings size={18}/> Pengaturan Sistem
        </button>
      </div>

      <div className="p-6 md:p-8">
        {activeTab === 'transaksi' && (
          <div>
            {transactions.length === 0 ? (
              <div className="text-center py-16 bg-[#0d1117] rounded-xl text-gray-500 border border-dashed border-gray-700">
                <CheckCircle2 size={48} className="text-gray-600 mx-auto mb-3"/>
                <p className="font-medium text-lg">Semua transaksi sudah diproses.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-gray-800">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="bg-[#0d1117] text-gray-400 text-sm">
                      <th className="p-4 font-bold">Pemohon</th>
                      <th className="p-4 font-bold">Pesanan</th>
                      <th className="p-4 font-bold">Nominal</th>
                      <th className="p-4 font-bold text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map(trx => (
                      <tr key={trx.id} className="border-b border-gray-800 hover:bg-[#0d1117] transition">
                        <td className="p-4">
                          <p className="font-bold text-white">{trx.nama}</p>
                          <p className="text-xs text-gray-500">{trx.email}</p>
                        </td>
                        <td className="p-4 text-[#a3e635] font-black">+{trx.jumlah_token} Laporan</td>
                        <td className="p-4 font-bold text-white">Rp {trx.total_harga?.toLocaleString('id-ID')}</td>
                        <td className="p-4 text-right flex gap-2 justify-end">
                          <a href={trx.bukti_url} target="_blank" rel="noreferrer" className="bg-[#21262d] text-[#a3e635] px-3 py-2 rounded-lg text-xs font-bold hover:bg-[#30363d] transition">
                            Cek Bukti
                          </a>
                          <button onClick={() => handleApprove(trx)} className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg shadow-sm text-sm font-bold transition">
                            Approve
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'pengaturan' && (
          <form onSubmit={handleSaveSettings} className="max-w-2xl bg-[#0d1117] p-6 md:p-8 rounded-xl border border-gray-800">
            <div className="space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-1">WhatsApp Admin</label>
                  <input type="text" required value={formSettings.wa_admin} onChange={(e) => setFormSettings({...formSettings, wa_admin: e.target.value})} className="w-full bg-[#161b22] border border-gray-700 text-white rounded-lg p-2.5 focus:border-[#a3e635] outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-1">Harga 1 Token (Rp)</label>
                  <input type="number" required value={formSettings.harga_per_token} onChange={(e) => setFormSettings({...formSettings, harga_per_token: Number(e.target.value)})} className="w-full bg-[#161b22] border border-gray-700 text-[#a3e635] font-bold rounded-lg p-2.5 focus:border-[#a3e635] outline-none" />
                </div>
              </div>

              <div className="bg-[#161b22] p-5 rounded-lg border border-gray-700 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Nama Bank</label>
                    <input type="text" required value={formSettings.bank_nama} onChange={(e) => setFormSettings({...formSettings, bank_nama: e.target.value})} className="w-full bg-[#0d1117] border border-gray-700 text-white rounded-lg p-2 text-sm focus:border-[#a3e635] outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Nomor Rekening</label>
                    <input type="text" required value={formSettings.bank_rekening} onChange={(e) => setFormSettings({...formSettings, bank_rekening: e.target.value})} className="w-full bg-[#0d1117] border border-gray-700 text-white rounded-lg p-2 text-sm focus:border-[#a3e635] outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Atas Nama (Pemilik)</label>
                  <input type="text" required value={formSettings.bank_pemilik} onChange={(e) => setFormSettings({...formSettings, bank_pemilik: e.target.value})} className="w-full bg-[#0d1117] border border-gray-700 text-white rounded-lg p-2 text-sm focus:border-[#a3e635] outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-400 mb-1 flex items-center gap-2">URL Foto QRIS (Opsional)</label>
                <input type="text" value={formSettings.qris_url} onChange={(e) => setFormSettings({...formSettings, qris_url: e.target.value})} className="w-full bg-[#161b22] border border-gray-700 text-white rounded-lg p-2.5 focus:border-[#a3e635] outline-none" />
              </div>

              <button type="submit" disabled={isSavingSettings} className="w-full bg-[#a3e635] text-black font-black py-3.5 rounded-xl hover:bg-[#84cc16] transition shadow-md mt-4">
                {isSavingSettings ? 'Menyimpan...' : 'Simpan Pengaturan'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
