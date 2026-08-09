import { NextRequest, NextResponse } from "next/server";
import { buildLogbookHtml } from "@/lib/generatePdf";
import { LogbookData } from "@/types/logbook";

export const runtime = "nodejs";
export const maxDuration = 60;

async function fileToBase64DataUri(file: File): Promise<string> {
  const buf  = await file.arrayBuffer();
  const b64  = Buffer.from(buf).toString("base64");
  const mime = file.type || "image/jpeg";
  return `data:${mime};base64,${b64}`;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    // ── Ambil field teks ──
    const hariKe    = Number(formData.get("hariKe"));
    const hari      = String(formData.get("hari")      ?? "");
    const tanggal   = String(formData.get("tanggal")   ?? "");
    const jamMasuk  = String(formData.get("jamMasuk")  ?? "");
    const jamPulang = String(formData.get("jamPulang") ?? "");
    const kegiatan  = String(formData.get("kegiatan")  ?? "");

    // ── Validasi field teks ──
    if (!hariKe || !hari || !tanggal || !jamMasuk || !jamPulang || !kegiatan) {
      return NextResponse.json(
        { error: "Semua field wajib diisi." },
        { status: 400 }
      );
    }

    // ── Ambil & validasi file gambar dokumentasi (1–3 foto) ──
    const dokFiles: File[] = [];
    for (let i = 0; i < 3; i++) {
      const f = formData.get(`dokumentasi_${i}`) as File | null;
      if (f && f.size > 0) dokFiles.push(f);
    }
    if (dokFiles.length === 0)
      return NextResponse.json({ error: "Minimal 1 foto dokumentasi wajib diupload." }, { status: 400 });

    const fileTtdMhs = formData.get("ttdMahasiswa") as File | null;
    const fileTtdIns = formData.get("ttdInstansi")  as File | null;

    if (!fileTtdMhs || fileTtdMhs.size === 0)
      return NextResponse.json({ error: "TTD mahasiswa wajib diupload." }, { status: 400 });
    if (!fileTtdIns || fileTtdIns.size === 0)
      return NextResponse.json({ error: "TTD instansi wajib diupload." }, { status: 400 });

    // ── Konversi ke base64 secara paralel ──
    const [dokumentasiBase64Array, ttdMahasiswaBase64, ttdInstansiBase64] = await Promise.all([
      Promise.all(dokFiles.map(fileToBase64DataUri)),
      fileToBase64DataUri(fileTtdMhs),
      fileToBase64DataUri(fileTtdIns),
    ]);

    const logbookData: LogbookData = {
      hariKe, hari, tanggal, jamMasuk, jamPulang, kegiatan,
      dokumentasiBase64: dokumentasiBase64Array,
      ttdMahasiswaBase64,
      ttdInstansiBase64,
      mimeType: dokFiles[0].type || "image/jpeg",
    };

    // ── Build HTML template ──
    const html = buildLogbookHtml(logbookData);

    // ── Launch Puppeteer (dev vs production) ──
    let browser;
    if (process.env.NODE_ENV === "production") {
      // Vercel serverless — gunakan @sparticuz/chromium-min
      const chromium = (await import("@sparticuz/chromium-min")).default;
      const puppeteer = await import("puppeteer-core");
      browser = await puppeteer.default.launch({
        args: chromium.args,
        defaultViewport: null,
        executablePath: await chromium.executablePath(
          "https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar"
        ),
        headless: true,
      });
    } else {
      // Local development — gunakan full puppeteer
      const puppeteer = await import("puppeteer");
      browser = await (puppeteer.default as typeof import("puppeteer").default).launch({
        headless: true,
        defaultViewport: null,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
    }

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });

    await browser.close();

    // ── Kirim PDF sebagai response download ──
    const fileName = `Logbook-Hari-${hariKe}-${tanggal}.pdf`;
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (err) {
    console.error("[generate-pdf] Error:", err);
    return NextResponse.json(
      { error: "Gagal membuat PDF. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
