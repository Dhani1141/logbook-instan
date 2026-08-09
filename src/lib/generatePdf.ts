import fs from "fs";
import path from "path";
import { LogbookData } from "@/types/logbook";

function formatTanggal(dateStr: string): string {
  const months = [
    "Januari","Februari","Maret","April","Mei","Juni",
    "Juli","Agustus","September","Oktober","November","Desember",
  ];
  const [year, month, day] = dateStr.split("-");
  return `${parseInt(day)} ${months[parseInt(month) - 1]} ${year}`;
}

function imageToBase64(filename: string): string {
  const abs = path.join(process.cwd(), "public", filename);
  const buffer = fs.readFileSync(abs);
  const ext = path.extname(filename).slice(1).toLowerCase();
  const mime =
    ext === "jpg" || ext === "jpeg" ? "image/jpeg"
    : ext === "png" ? "image/png"
    : `image/${ext}`;
  return `data:${mime};base64,${buffer.toString("base64")}`;
}

export function buildLogbookHtml(data: LogbookData): string {
  // Logo baca dari public/ — gambar asli UMKT (PNG dari user)
  const logoBase64 = imageToBase64("logo-umkt.png");

  // TTD datang dari upload form sebagai base64 data URI
  const ttdMahasiswaBase64 = data.ttdMahasiswaBase64;
  const ttdInstansiBase64  = data.ttdInstansiBase64;

  const kegiatanLines = data.kegiatan
    .split("\n")
    .filter((l) => l.trim())
    .map((l) => `<li>${l.trim()}</li>`)
    .join("");

  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8"/>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body {
    font-family: "Times New Roman", Times, serif;
    font-size: 11pt;
    background: #fff;
    color: #000;
  }
  .page {
    width: 210mm;
    min-height: 297mm;
    padding: 12mm 15mm 10mm 20mm;
  }

  /* ── Kampus Header ── */
  .kampus-header {
    text-align: center;
    padding-bottom: 6px;
    border-bottom: 3px double #000;
  }
  .kampus-header .prodi    { font-weight:bold; font-size:12pt; letter-spacing:.5px; }
  .kampus-header .fakultas { font-weight:bold; font-size:11pt; }
  .kampus-header .univ     { font-size:11pt; }
  .kampus-header .tahun    { font-size:10pt; }

  /* ── Main outer box ── */
  .outer-box { border: 1.5px solid #000; }

  /* ── Logbook title row ── */
  .title-row {
    display: flex;
    align-items: stretch;
    border-bottom: 1.5px solid #000;
  }
  .logo-cell {
    width: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 6px;
    border-right: 1px solid #000;
    flex-shrink: 0;
  }
  .logo-cell img { width:68px; height:68px; object-fit:contain; }

  .title-center {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 6px 10px;
    text-align: center;
  }
  .title-center .lb  { font-size:16pt; font-weight:bold; letter-spacing:3px; }
  .title-center .pkl { font-size:11pt; font-weight:bold; }
  .title-center .un  { font-size:10pt; font-weight:bold; line-height:1.3; }

  .info-cell {
    border-left: 1px solid #000;
    padding: 5px 8px;
    font-size: 9.5pt;
    flex-shrink: 0;
    min-width: 135px;
  }
  .info-cell table { border-collapse: collapse; width:100%; }
  .info-cell td { padding: 1.5px 3px; white-space: nowrap; }
  .info-cell td.val { border-bottom: 1px solid #000; width:80px; }

  /* ── Section ── */
  .section { border-top: 1.5px solid #000; }
  .section-label {
    padding: 4px 10px;
    font-weight: bold;
    font-size: 11.5pt;
    text-decoration: underline;
  }
  .section-body {
    min-height: 140px;
    padding: 8px 20px 12px;
  }
  .section-body ul { list-style-type: disc; padding-left:20px; line-height:1.9; }

  /* ── Dokumentasi ── */
  .doc-body {
    min-height: 230px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px;
    border-top: 1.5px solid #000;
  }
  .doc-body img { max-width:260px; max-height:210px; object-fit:contain; }

  /* ── Pengesahan ── */
  .pengesahan { border-top: 1.5px solid #000; }
  .pengesahan-label {
    padding: 4px 10px;
    font-weight: bold;
    font-size: 11.5pt;
    text-decoration: underline;
  }
  .pengesahan-cols {
    display: flex;
    border-top: 1.5px solid #000;
    min-height: 130px;
  }
  .p-col {
    flex: 1;
    padding: 8px 14px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .p-col:not(:last-child) { border-right: 1.5px solid #000; }
  .p-col .role {
    font-weight: bold;
    font-size: 10pt;
    text-decoration: underline;
    margin-bottom: 4px;
  }
  .p-col .role.mhs   { color: #c0392b; }
  .p-col .role.mitra { color: #1a5276; }
  .p-col .ttd-img {
    width: 140px;
    height: 75px;
    object-fit: contain;
    margin: 6px auto 0;
  }
</style>
</head>
<body>
<div class="page">

  <div class="kampus-header">
    <div class="prodi">PROGRAM STUDI TEKNIK INFORMATIKA</div>
    <div class="fakultas">FAKULTAS SAINS DAN TEKNOLOGI</div>
    <div class="univ">UNIVERSITAS MUHAMMADIYAH KALIMANTAN TIMUR</div>
    <div class="tahun">TAHUN AKADEMIK 2026/2027</div>
  </div>

  <div class="outer-box">

    <!-- Title row -->
    <div class="title-row">
      <div class="logo-cell">
        <img src="${logoBase64}" alt="Logo UMKT"/>
      </div>
      <div class="title-center">
        <div class="lb">LOG BOOK</div>
        <div class="pkl">PRAKTEK KERJA LAPANGAN</div>
        <div class="un">UNIVERSITAS MUHAMMADIYAH<br/>KALIMANTAN TIMUR</div>
      </div>
      <div class="info-cell">
        <table>
          <tr><td>Hari Ke</td><td class="val">: ${data.hariKe}</td></tr>
          <tr><td>Hari</td><td class="val">: ${data.hari}</td></tr>
          <tr><td>Tanggal</td><td class="val">: ${formatTanggal(data.tanggal)}</td></tr>
          <tr><td>Jam Masuk</td><td class="val">: ${data.jamMasuk}</td></tr>
          <tr><td>Jam Pulang</td><td class="val">: ${data.jamPulang}</td></tr>
        </table>
      </div>
    </div>

    <!-- A. Kegiatan -->
    <div class="section">
      <div class="section-label">A. Kegiatan</div>
      <div class="section-body">
        <ul>${kegiatanLines || "<li>&nbsp;</li>"}</ul>
      </div>
    </div>

    <!-- B. Dokumentasi -->
    <div class="section">
      <div class="section-label">B. Dokumentasi</div>
      <div class="doc-body">
        <img src="${data.dokumentasiBase64}" alt="Foto Dokumentasi"/>
      </div>
    </div>

    <!-- C. Pengesahan -->
    <div class="pengesahan">
      <div class="pengesahan-label">C. Pengesahan</div>
      <div class="pengesahan-cols">
        <div class="p-col">
          <div class="role mhs">Mahasiswa</div>
          <img src="${ttdMahasiswaBase64}" class="ttd-img" alt="TTD Mahasiswa"/>
        </div>
        <div class="p-col">
          <div class="role mitra">Pembimbing Lapangan (Mitra)</div>
          <img src="${ttdInstansiBase64}" class="ttd-img" alt="TTD Instansi"/>
        </div>
      </div>
    </div>

  </div>
</div>
</body>
</html>`;
}
