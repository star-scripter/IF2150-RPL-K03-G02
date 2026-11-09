/**
 * Contoh pemakaian komponen UI dasar (FE-02) di halaman `/design`.
 * Semua data di sini fiktif dan hanya untuk peragaan; tidak memanggil API.
 */
"use client";

import { useState, type ReactNode } from "react";
import {
  Badge,
  BottomSheet,
  Button,
  Card,
  Dropdown,
  Modal,
  Pagination,
  ProgressBar,
  ProgressLangkah,
  Textarea,
  Textbox,
  notify,
} from "@/components/ui";

const PILIHAN_SUMBER = [
  { nilai: "PENGAMATAN_PRIBADI", label: "Pengamatan pribadi" },
  { nilai: "INFO_WARGA", label: "Info warga" },
  { nilai: "MEDIA_SOSIAL", label: "Media sosial" },
  { nilai: "LAINNYA", label: "Lainnya" },
];

const PILIHAN_POIN = [
  { nilai: 50, label: "50 poin" },
  { nilai: 100, label: "100 poin" },
  { nilai: 200, label: "200 poin" },
];

const LANGKAH = ["Informasi Dasar", "Bukti Media", "Tinjau & Kirim"];

function Bagian({ judul, catatan, children }: { judul: string; catatan?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-h2 text-dark-teal">{judul}</h2>
        {catatan && <p className="text-sm text-text-secondary">{catatan}</p>}
      </div>
      {children}
    </section>
  );
}

function BarisRingkasan({ label, nilai, tebal }: { label: string; nilai: string; tebal?: boolean }) {
  return (
    <div className={`flex justify-between text-[15px] ${tebal ? "font-bold" : ""}`}>
      <span>{label}</span>
      <span className={tebal ? "text-[22px] text-dark-teal" : "font-semibold"}>{nilai}</span>
    </div>
  );
}

export function ContohKomponen() {
  const [memuat, setMemuat] = useState(false);
  const [email, setEmail] = useState("");
  const [sumber, setSumber] = useState("");
  const [poin, setPoin] = useState(50);
  const [modalTerbuka, setModalTerbuka] = useState(false);
  const [sheetTerbuka, setSheetTerbuka] = useState(false);
  const [halaman, setHalaman] = useState(1);
  const [langkah, setLangkah] = useState(0);
  const [upload, setUpload] = useState(45);

  const errorEmail = email && !email.includes("@") ? "Format email tidak valid." : undefined;

  function simulasiKirim() {
    setMemuat(true);
    setTimeout(() => {
      setMemuat(false);
      notify.sukses("Data berhasil dikirim.");
    }, 1500);
  }

  return (
    <div className="flex flex-col gap-10">
      <Bagian judul="Button" catatan="Varian primer, sekunder, bahaya, teks; ukuran md/lg; disabled dan memuat.">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primer</Button>
          <Button varian="sekunder">Sekunder</Button>
          <Button varian="bahaya">Tolak</Button>
          <Button varian="teks">Batalkan</Button>
          <Button disabled>Disabled</Button>
          <Button memuat={memuat} onClick={simulasiKirim}>
            {memuat ? "Mengirim…" : "Klik (memuat)"}
          </Button>
        </div>
        <Button ukuran="lg" lebarPenuh className="sm:max-w-[370px]">
          Masuk
        </Button>
      </Bagian>

      <Bagian judul="Card" catatan="Varian gelap, garis, lembut; kartu yang bisa diklik dan terpilih.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card varian="gelap">
            <h3 className="text-h2">Poin Anda</h3>
            <p className="font-heading text-h1 text-light-green">67</p>
          </Card>
          <Card>
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-h3 text-ink">Muara Sungai Cikapundung</h3>
              <Badge>+50 poin</Badge>
            </div>
            <p className="text-sm text-text-secondary">Dilaporkan 2 jam lalu</p>
          </Card>
          <Card varian="lembut">
            <p className="text-sm text-text-secondary">Lokasi</p>
            <p className="text-body text-dark-teal">Jl. Contoh No. 1, Bandung</p>
          </Card>
          <Card onClick={() => notify.info("Kartu diklik: buka detail laporan.")} terpilih>
            <p className="text-xs text-text-secondary">RPT-0248</p>
            <p className="text-h3 font-heading text-dark-teal">Kartu bisa diklik (terpilih)</p>
          </Card>
        </div>
      </Bagian>

      <Bagian judul="Badge" catatan="Untuk poin, jumlah, dan status laporan/lokasi/reward.">
        <div className="flex flex-wrap gap-2">
          <Badge>+100 poin</Badge>
          <Badge varian="peringatan" titik>
            12 menunggu validasi
          </Badge>
          <Badge varian="sukses">VALID</Badge>
          <Badge varian="bahaya">TIDAK VALID</Badge>
          <Badge varian="bahaya">Habis</Badge>
          <Badge varian="netral">Pelapor = Relawan</Badge>
        </div>
      </Bagian>

      <Bagian judul="Textbox dan Dropdown" catatan="Label besar (form Login) dan ringkas (form laporan), dengan pesan error.">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-4">
            <Textbox
              label="Email"
              type="email"
              placeholder="nama@contoh.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errorEmail}
              petunjuk="Ketik teks tanpa @ untuk melihat pesan error."
            />
            <Textbox
              label="Password"
              type="password"
              placeholder="Minimal 8 karakter"
              labelKanan={<span className="text-text-secondary">8–72 karakter</span>}
            />
            <Textbox label="Nonaktif" disabled value="Tidak bisa diubah" readOnly />
          </div>
          <div className="flex flex-col gap-4">
            <Dropdown
              label="Sumber Laporan"
              ukuranLabel="ringkas"
              wajib
              placeholder="Pilih sumber laporan"
              pilihan={PILIHAN_SUMBER}
              value={sumber}
              onChange={(e) => setSumber(e.target.value)}
            />
            <Dropdown
              label="Poin untuk lokasi ini"
              ukuranLabel="ringkas"
              pilihan={PILIHAN_POIN}
              value={poin}
              onChange={(e) => setPoin(Number(e.target.value))}
            />
            <Textbox
              label="Judul"
              ukuranLabel="ringkas"
              wajib
              maxLength={80}
              placeholder="Contoh: Sampah plastik di muara"
              error="Judul wajib diisi."
            />
            <Textarea label="Alasan penolakan" ukuranLabel="ringkas" wajib placeholder="Tulis alasan…" />
          </div>
        </div>
      </Bagian>

      <Bagian judul="Modal dan Bottom Sheet" catatan="Tutup dengan tombol, Escape, atau klik latar.">
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => setModalTerbuka(true)}>Buka Modal</Button>
          <Button varian="sekunder" onClick={() => setSheetTerbuka(true)}>
            Buka Bottom Sheet
          </Button>
        </div>

        <Modal
          terbuka={modalTerbuka}
          onTutup={() => setModalTerbuka(false)}
          label="RPT-0248"
          judul="Sampah plastik di Sungai Cikapundung"
          aksi={
            <>
              <Button onClick={() => setModalTerbuka(false)}>Setujui</Button>
              <Button varian="bahaya" onClick={() => setModalTerbuka(false)}>
                Tolak
              </Button>
            </>
          }
        >
          <h3 className="text-body font-heading font-semibold text-dark-teal">Detail Laporan</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <Card varian="lembut">
              <p className="text-sm text-text-secondary">Lokasi</p>
              <p className="text-dark-teal">Jl. Contoh No. 1, Bandung</p>
            </Card>
            <Card varian="lembut">
              <p className="text-sm text-text-secondary">Waktu</p>
              <p className="text-dark-teal">14 Oktober 2026, 10.45 WIB</p>
            </Card>
          </div>
          <Dropdown label="Poin" ukuranLabel="ringkas" pilihan={PILIHAN_POIN} defaultValue={50} />
        </Modal>

        <BottomSheet
          terbuka={sheetTerbuka}
          onTutup={() => setSheetTerbuka(false)}
          judul="Konfirmasi penukaran"
          aksi={
            <>
              <Button varian="sekunder" onClick={() => setSheetTerbuka(false)}>
                Batal
              </Button>
              <Button
                onClick={() => {
                  setSheetTerbuka(false);
                  notify.sukses("Penukaran berhasil (contoh).");
                }}
              >
                Tukarkan
              </Button>
            </>
          }
        >
          <div className="rounded-button bg-sky-blue px-4 py-3">
            <p className="text-xs">Voucher · Stok 24</p>
            <p className="font-heading text-lg font-bold">Voucher Pulsa Rp10.000</p>
          </div>
          <div className="flex flex-col gap-2.5">
            <BarisRingkasan label="Poin Anda" nilai="67" />
            <BarisRingkasan label="Harga reward" nilai="−60" />
            <hr className="border-border" />
            <BarisRingkasan label="Sisa poin" nilai="7" tebal />
          </div>
          <p className="text-[13px] text-text-secondary">Poin yang sudah ditukarkan tidak dapat dikembalikan.</p>
        </BottomSheet>
      </Bagian>

      <Bagian judul="Toast (notify)" catatan="Panggil notify(...) dari mana saja; Toaster dipasang di layout.">
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => notify.sukses("Laporan berhasil dikirim.")}>Sukses</Button>
          <Button varian="bahaya" onClick={() => notify.gagal("Gagal mengunggah media.")}>
            Gagal
          </Button>
          <Button varian="sekunder" onClick={() => notify.info("Anda sedang offline. Isian disimpan sebagai draf.")}>
            Info
          </Button>
        </div>
      </Bagian>

      <Bagian judul="Pagination" catatan="Memakai meta { page, limit, total } dari respons list.">
        <Pagination meta={{ page: halaman, limit: 6, total: 12 }} onUbah={setHalaman} satuan="laporan" />
        <Pagination meta={{ page: 5, limit: 6, total: 60 }} onUbah={() => undefined} satuan="laporan" />
        <Pagination meta={{ page: 1, limit: 6, total: 0 }} onUbah={() => undefined} satuan="laporan" />
      </Bagian>

      <Bagian judul="Progress Indicator" catatan="Langkah form laporan dan bilah kemajuan upload.">
        <Card className="gap-4">
          <ProgressLangkah langkah={LANGKAH} aktif={langkah} />
          <div className="flex gap-3">
            <Button varian="sekunder" disabled={langkah === 0} onClick={() => setLangkah(langkah - 1)}>
              Kembali
            </Button>
            <Button disabled={langkah === LANGKAH.length - 1} onClick={() => setLangkah(langkah + 1)}>
              Lanjut
            </Button>
          </div>
        </Card>
        <ProgressBar nilai={upload} label="Mengunggah foto" tampilkanPersen />
        <div className="flex gap-3">
          <Button varian="sekunder" onClick={() => setUpload(Math.max(0, upload - 15))}>
            −15%
          </Button>
          <Button varian="sekunder" onClick={() => setUpload(Math.min(100, upload + 15))}>
            +15%
          </Button>
        </div>
      </Bagian>
    </div>
  );
}
