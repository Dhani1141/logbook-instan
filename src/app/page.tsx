"use client";

import { useState, useRef, useCallback, ChangeEvent, FormEvent } from "react";
import Image from "next/image";
import WelcomeScreen from "@/components/WelcomeScreen";


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
  const labelCls = "block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5";

  return (
    <div>
      <label className={labelCls}>{label}</label>
      {!preview ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full h-28 rounded-2xl border-2 border-dashed border-slate-300
                     bg-slate-50/60 flex flex-col items-center justify-center gap-1.5
                     text-slate-400 transition-all duration-200
                     hover:border-blue-400 hover:bg-blue-50/40 active:scale-[0.98]"
        >
          <span className="text-3xl">{icon}</span>
          <span className="text-xs font-medium">{hint}</span>
        </button>
      ) : (
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
          <div className="relative w-full h-36 bg-slate-100">
            <Image src={preview} alt={label} fill className="object-contain" unoptimized />
          </div>
          <div className="absolute top-2 right-2 flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="bg-white/90 backdrop-blur-sm text-slate-700 text-xs font-semibold
                         px-3 py-1 rounded-full shadow-md hover:bg-white transition-all"
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
          <div className="bg-white/90 px-3 py-1.5 flex items-center gap-2">
            <span className="text-xs text-slate-500 truncate">📎 {file?.name}</span>
            <span className="text-xs text-slate-400 ml-auto flex-shrink-0">
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

// ── Main Page ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [showApp, setShowApp] = useState(false);
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
    "w-full rounded-xl border border-slate-200 bg-white/70 px-4 py-3 text-sm " +
    "transition-all duration-200 focus:border-blue-400 focus:bg-white " +
    "placeholder:text-slate-400";
  const labelCls = "block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5";

  return (
    <>
      {!showApp && <WelcomeScreen onEnter={() => setShowApp(true)} />}
      <main className="min-h-svh bg-gradient-to-br from-[#0f2044] via-[#1e3a5f] to-[#0c3547] px-4 py-8 sm:py-12">


      {/* ── Header ── */}
      <header className="text-center mb-8 fade-in-up">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 mb-4 shadow-lg">
          <span className="text-3xl">📋</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
          Generator Logbook PKL
        </h1>
        <p className="text-blue-200 text-sm sm:text-base">
          Teknik Informatika · UMKT · 2026/2027
        </p>
      </header>

      {/* ── Card ── */}
      <div className="max-w-xl mx-auto card-glass rounded-3xl shadow-2xl overflow-hidden fade-in-up"
           style={{ animationDelay: "0.1s" }}>
        <div className="h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-amber-400" />

        <form onSubmit={handleSubmit} className="p-5 sm:p-7 space-y-5">

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

          {/* ── Divider ── */}
          <div className="border-t border-slate-200 pt-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Upload Gambar</p>
          </div>

          {/* ── Foto Dokumentasi (multi, max 3) ── */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              📷 Foto Dokumentasi
              <span className="ml-2 text-blue-400 normal-case font-normal">
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

          {/* ── Error / Success ── */}
          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700
                            text-sm rounded-xl px-4 py-3 fade-in-up">
              <span className="text-lg flex-shrink-0">⚠️</span>
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700
                            text-sm rounded-xl px-4 py-3 fade-in-up">
              <span className="text-lg flex-shrink-0">✅</span>
              <span>PDF berhasil dibuat dan sedang diunduh!</span>
            </div>
          )}

          {/* ── Submit ── */}
          <button type="submit" disabled={loading}
            className="btn-ripple w-full py-4 rounded-2xl font-bold text-white text-base
                       bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600
                       shadow-lg shadow-blue-500/30
                       transition-all duration-200
                       hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5
                       active:translate-y-0 active:shadow-md
                       disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0
                       pulse-glow"
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
          </button>

        </form>

        <div className="px-6 pb-5 text-center text-xs text-slate-400">
          PDF akan otomatis terunduh ke perangkat Anda
        </div>
      </div>

      <p className="text-center text-blue-300/50 text-xs mt-8">
        Universitas Muhammadiyah Kalimantan Timur © 2026
      </p>
    </main>
    </>
  );
}
