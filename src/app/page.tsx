"use client";

import { useState, useEffect, useRef, useCallback, ChangeEvent, FormEvent } from "react";
import Image from "next/image";
import WelcomeScreen from "@/components/WelcomeScreen";
import dynamic from "next/dynamic";
import { VscBook, VscAccount } from "react-icons/vsc";
import Dock from "@/components/Dock";
import ProfileCard from "@/components/ProfileCard";

const WebThreadsBg = dynamic(() => import("@/components/WebThreads"), { ssr: false });
const SpecularButton = dynamic(() => import("@/components/SpecularButton"), { ssr: false });



const HARI_OPTIONS = ["Senin","Selasa","Rabu","Kamis","Jumat","Sabtu","Minggu"];

interface FormState {
  hariKe: string;
  hari: string;
  tanggal: string;
  jamMasuk: string;
  jamPulang: string;
  kegiatan: string;
}

const INITIAL: FormState = {
  hariKe: "",
  hari: "",
  tanggal: "",
  jamMasuk: "",
  jamPulang: "",
  kegiatan: "",
};

// ── Reusable image upload field ──────────────────────────────────────────────
interface ImageFieldProps {
  id: string;
  label: string;
  icon: string;
  hint: string;
  capture?: "environment" | "user";
  preview: string;
  file: File | null;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

function ImageField({ id, label, icon, hint, capture, preview, file, onChange, onRemove, inputRef }: ImageFieldProps) {
  const labelCls = "block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5";

  return (
    <div>
      <label className={labelCls}>{label}</label>
      {!preview ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full h-28 rounded-2xl border-2 border-dashed border-indigo-500/40
                     bg-white/5 flex flex-col items-center justify-center gap-1.5
                     text-slate-400 transition-all duration-200
                     hover:border-indigo-400 hover:bg-indigo-500/10 active:scale-[0.98]"
        >
          <span className="text-3xl">{icon}</span>
          <span className="text-xs font-medium">{hint}</span>
        </button>
      ) : (
        <div className="relative rounded-2xl overflow-hidden border border-indigo-500/30 shadow-sm">
          <div className="relative w-full h-36 bg-slate-900/60">
            <Image src={preview} alt={label} fill className="object-contain" unoptimized />
          </div>
          <div className="absolute top-2 right-2 flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="bg-slate-800/90 backdrop-blur-sm text-slate-200 text-xs font-semibold
                         px-3 py-1 rounded-full shadow-md hover:bg-slate-700 transition-all"
            >
              Ganti
            </button>
            <button
              type="button"
              onClick={onRemove}
              className="bg-red-500/90 text-white text-xs font-semibold
                         px-3 py-1 rounded-full shadow-md hover:bg-red-600 transition-all"
            >
              Hapus
            </button>
          </div>
          <div className="bg-slate-900/80 px-3 py-1.5 flex items-center gap-2">
            <span className="text-xs text-slate-400 truncate">📎 {file?.name}</span>
            <span className="text-xs text-slate-500 ml-auto flex-shrink-0">
              {file ? (file.size / 1024 / 1024).toFixed(2) + " MB" : ""}
            </span>
          </div>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        {...(capture ? { capture } : {})}
        onChange={onChange}
        className="hidden"
        id={id}
        name={id}
      />
    </div>
  );
}

// ── Real-time Clock Component ────────────────────────────────────────────────
function HeaderClock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!time) return null;

  const witaDate = new Date(time.toLocaleString("en-US", { timeZone: "Asia/Makassar" }));
  const hour = witaDate.getHours();
  let greeting = 'Good Evening';
  if (hour >= 0 && hour < 12) greeting = 'Good Morning';
  else if (hour >= 12 && hour < 18) greeting = 'Good Afternoon';

  const timeString = time.toLocaleTimeString('id-ID', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    timeZone: 'Asia/Makassar'
  }).replace(/\./g, ':');

  return (
    <div className="hidden md:flex flex-col items-end justify-center">
      <span className="text-sm font-bold text-indigo-200 tracking-wide">{greeting}</span>
      <span className="text-[0.7rem] font-mono font-medium text-slate-400 tracking-widest mt-0.5">{timeString} WITA</span>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function Home() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const academicYear = currentMonth >= 6 
    ? `${currentYear}/${currentYear + 1}` 
    : `${currentYear - 1}/${currentYear}`;

  const [showApp, setShowApp] = useState(false);
  const [currentView, setCurrentView] = useState<'logbook' | 'profile'>('logbook');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [peekState, setPeekState] = useState(0); // 0: hidden, 1: peeking, 2: done
  const [form, setForm]   = useState<FormState>(INITIAL);

  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");
  const [success, setSuccess] = useState(false);

  // Foto dokumentasi (1 – 3 foto)
  const MAX_DOK = 3;
  const [imgsDok, setImgsDok]   = useState<(File | null)[]>([null, null, null]);
  const [prevsDok, setPrevsDok] = useState<string[]>(["" , "", ""]);
  const refsDok = [
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
  ];

  // TTD Mahasiswa
  const [imgTtdMhs, setImgTtdMhs]   = useState<File | null>(null);
  const [prevTtdMhs, setPrevTtdMhs] = useState("");
  const refTtdMhs                   = useRef<HTMLInputElement | null>(null);

  // TTD Instansi
  const [imgTtdIns, setImgTtdIns]   = useState<File | null>(null);
  const [prevTtdIns, setPrevTtdIns] = useState("");
  const refTtdIns                   = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (showApp) {
      const t1 = setTimeout(() => setPeekState(1), 500);
      const t2 = setTimeout(() => setPeekState(2), 3200); // let full animation finish
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [showApp]);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setForm((prev) => ({ ...prev, [name]: value }));
      setError(""); setSuccess(false);
    }, []
  );

  const makeImageHandler = useCallback(
    (
      setFile: (f: File) => void,
      setPreview: (s: string) => void
    ) => (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) { setError("File harus berupa gambar."); return; }
      if (file.size > 10 * 1024 * 1024)  { setError("Ukuran gambar maks 10 MB."); return; }
      setFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
      setError(""); setSuccess(false);
    }, []
  );

  // Indexed handler for dokumentasi slots
  const handleDokChange = useCallback(
    (idx: number) => (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) { setError("File harus berupa gambar."); return; }
      if (file.size > 10 * 1024 * 1024)  { setError("Ukuran gambar maks 10 MB."); return; }
      setImgsDok(prev => { const n = [...prev]; n[idx] = file; return n; });
      const reader = new FileReader();
      reader.onload = (ev) => setPrevsDok(prev => { const n = [...prev]; n[idx] = ev.target?.result as string; return n; });
      reader.readAsDataURL(file);
      setError(""); setSuccess(false);
    }, []
  );

  const handleDokRemove = useCallback(
    (idx: number) => () => {
      setImgsDok(prev => { const n = [...prev]; n[idx] = null; return n; });
      setPrevsDok(prev => { const n = [...prev]; n[idx] = ""; return n; });
      if (refsDok[idx].current) refsDok[idx].current!.value = "";
    }, []
  );

  const makeRemoveHandler = useCallback(
    (
      setFile: (f: null) => void,
      setPreview: (s: string) => void,
      ref: React.RefObject<HTMLInputElement | null>
    ) => () => {
      setFile(null); setPreview("");
      if (ref.current) ref.current.value = "";
    }, []
  );

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError(""); setSuccess(false);

      const { hariKe, hari, tanggal, jamMasuk, jamPulang, kegiatan } = form;
      if (!hariKe || !hari || !tanggal || !jamMasuk || !jamPulang || !kegiatan) {
        setError("Semua field teks wajib diisi."); return;
      }
      const filledDok = imgsDok.filter(Boolean) as File[];
      if (filledDok.length === 0) { setError("Minimal 1 foto dokumentasi wajib diupload."); return; }
      if (!imgTtdMhs) { setError("TTD mahasiswa wajib diupload."); return; }
      if (!imgTtdIns) { setError("TTD instansi wajib diupload."); return; }

      setLoading(true);
      try {
        const fd = new FormData();
        fd.append("hariKe",    hariKe);
        fd.append("hari",      hari);
        fd.append("tanggal",   tanggal);
        fd.append("jamMasuk",  jamMasuk);
        fd.append("jamPulang", jamPulang);
        fd.append("kegiatan",  kegiatan);
        const filledDok2 = imgsDok.filter(Boolean) as File[];
        filledDok2.forEach((f, i) => fd.append(`dokumentasi_${i}`, f));
        fd.append("ttdMahasiswa", imgTtdMhs!);
        fd.append("ttdInstansi",  imgTtdIns!);

        const res = await fetch("/api/generate-pdf", { method: "POST", body: fd });
        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          throw new Error(json.error || "Gagal generate PDF.");
        }

        const blob = await res.blob();
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement("a");
        a.href = url;
        a.download = `Logbook-Hari-${hariKe}-${tanggal}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setSuccess(true);
        setForm(INITIAL);
        // Reset images
        setImgsDok([null, null, null]); setPrevsDok(["", "", ""]);
        refsDok.forEach(r => { if (r.current) r.current.value = ""; });
        setImgTtdMhs(null); setPrevTtdMhs("");
        setImgTtdIns(null); setPrevTtdIns("");
        [refTtdMhs, refTtdIns].forEach(r => { if (r.current) r.current.value = ""; });
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
      } finally {
        setLoading(false);
      }
    },
    [form, imgsDok, imgTtdMhs, imgTtdIns]
  );

  const inputCls =
    "w-full rounded-xl border border-indigo-500/30 bg-white/5 px-4 py-3 text-sm text-slate-100 " +
    "transition-all duration-200 focus:border-indigo-400 focus:bg-white/10 " +
    "placeholder:text-slate-500";
  const labelCls = "block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5";

  return (
    <>
      <style>{`
        @keyframes waveHello {
          0%   { transform: translateX(-80px) rotate(0deg);  opacity: 0; }
          15%  { transform: translateX(12px)  rotate(5deg);  opacity: 1; }
          28%  { transform: translateX(-4px)  rotate(-3deg); opacity: 1; }
          40%  { transform: translateX(6px)   rotate(2deg);  opacity: 1; }
          52%  { transform: translateX(-2px)  rotate(-1deg); opacity: 1; }
          63%  { transform: translateX(0)     rotate(0deg);  opacity: 1; }
          78%  { transform: translateX(0)     rotate(0deg);  opacity: 1; }
          100% { transform: translateX(-80px) rotate(0deg);  opacity: 0; }
        }
        @media (min-width: 768px) {
          .md-animate-wave-hello {
            transform-origin: left center;
            animation: waveHello 2.7s ease-in-out forwards;
          }
        }
      `}</style>
      {!showApp && <WelcomeScreen onEnter={() => setShowApp(true)} />}

      {/* ── WebThreads fullscreen background ── */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          background: "#050810",
        }}
      >
        <WebThreadsBg
          color1="#0039ff"
          color2="#1b00ff"
          color3="#00ddff"
          speed={0.25}
          threadCount={9}
          frequency={6}
          spread={0.17}
          taper={1}
          position={0.58}
          fanMode="left"
          glow={0.013}
          falloff={0.6}
          thickness={1.1}
          brightness={0.6}
          opacity={1}
          mirror={false}
          shimmer={false}
          grain={false}
          grainIntensity={0.03}
          mouseInteraction={false}
          mouseStrength={0.53}
        />
      </div>

      {showApp && (
        <header className="fixed top-0 left-0 right-0 z-40 bg-slate-900/60 backdrop-blur-md border-b border-indigo-500/20 px-4 sm:px-8 py-3.5 flex items-center justify-between fade-in-up shadow-lg">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="inline-flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-indigo-500/20 border border-indigo-500/30 shadow-inner flex-shrink-0">
              <span className="text-lg sm:text-xl">📋</span>
            </div>
            <div>
              <h1 className="text-xs sm:text-base font-bold text-slate-100 leading-tight tracking-wide">Generator Logbook PKL</h1>
              <p className="text-indigo-300/80 text-[0.65rem] sm:text-xs font-medium uppercase tracking-wider mt-0.5">Teknik Informatika · UMKT · {academicYear}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <HeaderClock />
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-10 h-10 flex flex-shrink-0 items-center justify-center rounded-xl bg-slate-800/80 border border-indigo-500/30 text-indigo-300 hover:text-white transition-colors"
            >
              {mobileMenuOpen ? "✕" : "☰"}
            </button>
          </div>
        </header>
      )}

      <main className="relative z-10 min-h-svh px-4 sm:px-8 pt-28 pb-10 flex flex-col">
        {currentView === 'logbook' ? (
          <>


      {/* ── Header removed from here ── */}

      {/* ── Card ── */}
      <div className="max-w-4xl mx-auto card-glass rounded-3xl shadow-2xl overflow-hidden fade-in-up"
           style={{ animationDelay: "0.1s" }}>
        <div className="h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-amber-400" />

        <form onSubmit={handleSubmit} className="p-5 sm:p-7">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-6">
            <div className="space-y-5">
              {/* ── Hari Ke + Hari ── */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="hariKe" className={labelCls}>Hari Ke</label>
              <input id="hariKe" name="hariKe" type="number" min={1} max={180}
                placeholder="1" value={form.hariKe} onChange={handleChange}
                className={inputCls} required />
            </div>
            <div>
              <label htmlFor="hari" className={labelCls}>Hari</label>
              <select id="hari" name="hari" value={form.hari} onChange={handleChange}
                className={inputCls} required>
                <option value="">Pilih...</option>
                {HARI_OPTIONS.map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
          </div>

          {/* ── Tanggal ── */}
          <div>
            <label htmlFor="tanggal" className={labelCls}>Tanggal</label>
            <input id="tanggal" name="tanggal" type="date" value={form.tanggal}
              onChange={handleChange} className={inputCls} required />
          </div>

          {/* ── Jam ── */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="jamMasuk" className={labelCls}>Jam Masuk</label>
              <input id="jamMasuk" name="jamMasuk" type="time" value={form.jamMasuk}
                onChange={handleChange} className={inputCls} required />
            </div>
            <div>
              <label htmlFor="jamPulang" className={labelCls}>Jam Pulang</label>
              <input id="jamPulang" name="jamPulang" type="time" value={form.jamPulang}
                onChange={handleChange} className={inputCls} required />
            </div>
          </div>

          {/* ── Kegiatan ── */}
          <div>
            <label htmlFor="kegiatan" className={labelCls}>Kegiatan Harian</label>
            <textarea id="kegiatan" name="kegiatan" rows={5}
              placeholder={"Contoh:\nMembantu input data pelanggan\nMengikuti briefing pagi bersama tim"}
              value={form.kegiatan} onChange={handleChange}
              className={`${inputCls} resize-none leading-relaxed`} required />
            <p className="text-xs text-slate-400 mt-1">Tulis tiap kegiatan di baris terpisah (Enter)</p>
          </div>

            </div>

            <div className="space-y-5">
              {/* ── Divider ── */}
              <div className="border-t border-indigo-500/20 md:border-t-0 md:pt-0 pt-1">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Upload Gambar</p>
              </div>

              {/* ── Foto Dokumentasi (multi, max 3) ── */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
              📷 Foto Dokumentasi
              <span className="ml-2 text-indigo-400 normal-case font-normal">
                ({imgsDok.filter(Boolean).length}/{MAX_DOK} foto)
              </span>
            </p>

            {Array.from({ length: MAX_DOK }).map((_, idx) => {
              // Only show slot if it's slot 0, or the previous slot is filled
              const visible = idx === 0 || imgsDok[idx - 1] !== null;
              if (!visible) return null;
              return (
                <ImageField
                  key={idx}
                  id={`dokumentasi_${idx}`}
                  label={`Foto ${idx + 1}${idx === 0 ? " (wajib)" : " (opsional)"}`}
                  icon="📷"
                  hint={idx === 0 ? "Upload foto dokumentasi" : "Tambah foto dokumentasi"}
                  preview={prevsDok[idx]}
                  file={imgsDok[idx]}
                  onChange={handleDokChange(idx)}
                  onRemove={handleDokRemove(idx)}
                  inputRef={refsDok[idx]}
                />
              );
            })}
          </div>

          {/* ── TTD Mahasiswa ── */}
          <ImageField
            id="ttdMahasiswa"
            label="✍️ Tanda Tangan Mahasiswa"
            icon="✍️"
            hint="Upload foto / scan TTD mahasiswa"
            preview={prevTtdMhs}
            file={imgTtdMhs}
            onChange={makeImageHandler(setImgTtdMhs, setPrevTtdMhs)}
            onRemove={makeRemoveHandler(setImgTtdMhs, setPrevTtdMhs, refTtdMhs)}
            inputRef={refTtdMhs}
          />

          {/* ── TTD Instansi ── */}
          <ImageField
            id="ttdInstansi"
            label="🏢 Tanda Tangan Pembimbing Lapangan"
            icon="🏢"
            hint="Upload foto / scan TTD instansi"
            preview={prevTtdIns}
            file={imgTtdIns}
            onChange={makeImageHandler(setImgTtdIns, setPrevTtdIns)}
            onRemove={makeRemoveHandler(setImgTtdIns, setPrevTtdIns, refTtdIns)}
            inputRef={refTtdIns}
          />
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700
                            text-sm rounded-xl px-4 py-3 fade-in-up mt-5">
              <span className="text-lg flex-shrink-0">⚠️</span>
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700
                            text-sm rounded-xl px-4 py-3 fade-in-up mt-5">
              <span className="text-lg flex-shrink-0">✅</span>
              <span>PDF berhasil dibuat dan sedang diunduh!</span>
            </div>
          )}

          {/* ── Submit ── */}
          <div className="w-full flex justify-center">
            <SpecularButton
              type="submit"
              disabled={loading}
              size="lg"
              radius={24}
              tint="#e40202"
              tintOpacity={0}
              blur={0}
              textColor="#f5f5f5"
              lineColor="#0082f2"
              baseColor="#f5f5f5"
              intensity={1.55}
              shineSize={34}
              shineFade={40}
              thickness={2.7}
              speed={0.35}
              followMouse
              proximity={250}
              autoAnimate={false}
              className="w-full"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="w-5 h-5 animate-spin-fast" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8v4l3-3-3-3V4a10 10 0 100 20v-4l-3 3 3 3v-4a8 8 0 01-8-8z"/>
                  </svg>
                  Sedang Generate PDF...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>📄</span> Generate &amp; Download PDF
                </span>
              )}
            </SpecularButton>
          </div>

        </form>

        <div className="px-6 pb-5 text-center text-xs text-slate-400">
          PDF akan otomatis terunduh ke perangkat Anda
        </div>
      </div>

          </>
        ) : (
          <div className="flex-1 flex flex-col lg:flex-row items-center lg:items-stretch justify-center gap-8 w-full max-w-5xl mx-auto fade-in-up">
            <ProfileCard
              avatarUrl="/profile.png"
              miniAvatarUrl="/mini-profile.png"
              onContactClick={() => window.open("https://wa.me/6285350607184", "_blank")}
            />
            <div className="card-glass rounded-3xl p-6 sm:p-8 flex flex-col justify-center text-left w-full lg:w-[450px]">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 border-b border-indigo-500/20 pb-3">tentang Elkunyuk's</h2>
              
              <div className="space-y-5 text-sm">
                <div>
                  <h3 className="text-indigo-300 font-semibold mb-1">Sistem Operasi & Server</h3>
                  <p className="text-slate-300 leading-relaxed">Pengalaman praktis dengan Kali Linux, pengujian Bazzite OS vs Windows untuk perangkat handheld, konfigurasi server Nginx, dan manajemen kontainer menggunakan Docker.</p>
                </div>
                <div>
                  <h3 className="text-indigo-300 font-semibold mb-1">Pengembangan Backend</h3>
                  <p className="text-slate-300 leading-relaxed">Studi perbandingan performa dan arsitektur framework seperti FastAPI vs gRPC.</p>
                </div>
                <div>
                  <h3 className="text-indigo-300 font-semibold mb-1">Internet of Things (IoT)</h3>
                  <p className="text-slate-300 leading-relaxed">Minat tinggi dalam mengeksplorasi dan mengimplementasikan topik-topik IoT untuk proyek teknis maupun riset.</p>
                </div>
                <div>
                  <h3 className="text-indigo-300 font-semibold mb-1">Sistem Informasi Geografis (SIG)</h3>
                  <p className="text-slate-300 leading-relaxed">Penggunaan perangkat lunak analisis spasial seperti QGIS.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <p className="text-center text-blue-300/50 text-xs mt-8 pb-4">
          Elkunyuk © {currentYear}
        </p>
      </main>

      {/* ── Sidebar Dock ── */}
      {showApp && (
        <>
          {/* Mobile Backdrop */}
          <div 
            className={`md:hidden fixed inset-0 bg-black/50 backdrop-blur-[2px] z-30 transition-opacity duration-300 ${mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Desktop Hover Trigger Area */}
          <div className="hidden md:block fixed top-0 bottom-0 left-0 w-6 z-40 peer" />

          {/* Desktop Edge Glow Indicator */}
          <div className="hidden md:block fixed top-1/2 left-0 -translate-y-1/2 w-1.5 h-24 bg-gradient-to-b from-transparent via-indigo-400/90 to-transparent rounded-r-full shadow-[0_0_20px_rgba(129,140,248,0.8)] transition-all duration-300 z-30 peer-hover:opacity-0 peer-hover:-translate-x-full animate-[pulse_3s_ease-in-out_infinite]" />

          <div className={`fixed top-0 bottom-0 left-0 z-50 flex items-center transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]
            ${mobileMenuOpen ? "translate-x-0 opacity-100 pointer-events-auto" : "-translate-x-8 opacity-0 pointer-events-none"}
            ${peekState === 1 ? "md:translate-x-0 md:opacity-100 md:pointer-events-auto md-animate-wave-hello" : "md:-translate-x-8 md:opacity-0 md:pointer-events-none"}
            md:peer-hover:translate-x-0 md:peer-hover:opacity-100 md:peer-hover:pointer-events-auto
            md:hover:translate-x-0 md:hover:opacity-100 md:hover:pointer-events-auto
          `}>
            <div className="pl-4 py-4 pr-8">
              <Dock
                direction="vertical"
                items={[
                  { icon: <VscBook size={22} />, label: 'Logbook', onClick: () => { setCurrentView('logbook'); setMobileMenuOpen(false); } },
                  { icon: <VscAccount size={22} />, label: 'Profile', onClick: () => { setCurrentView('profile'); setMobileMenuOpen(false); } }
                ]}
                panelHeight={60}
                baseItemSize={44}
                magnification={60}
              />
            </div>
          </div>
        </>
      )}
    </>
  );
}
