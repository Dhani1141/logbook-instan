export interface LogbookData {
  hariKe: number;
  hari: string;
  tanggal: string;     // format YYYY-MM-DD
  jamMasuk: string;    // format HH:mm
  jamPulang: string;   // format HH:mm
  kegiatan: string;
  dokumentasiBase64: string;   // foto kegiatan — full data URI
  ttdMahasiswaBase64: string;  // TTD mahasiswa — full data URI
  ttdInstansiBase64: string;   // TTD pembimbing lapangan — full data URI
  mimeType: string;
}
