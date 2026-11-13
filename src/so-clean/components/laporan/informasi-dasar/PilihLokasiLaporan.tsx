"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Button, Dropdown, Modal, Textbox } from "@/components/ui";
import { WILAYAH } from "@/lib/wilayah";
import { bacaKoordinat, diLuarWilayah, pesanKegagalanGps, rapikanKoordinat, wilayahTitik, type KoordinatLaporan } from "@/lib/informasi-dasar";
import { PetaLaporan } from "./PetaLaporan";

type Props = { nilai: KoordinatLaporan | null; onPilih: (nilai: KoordinatLaporan) => void; error?: string };
const PUSAT_AWAL = { latitude: -6.885514, longitude: 107.6069045 };

export function PilihLokasiLaporan({ nilai, onPilih, error }: Props) {
  const [terbuka, setTerbuka] = useState(false);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [pusat, setPusat] = useState(PUSAT_AWAL);
  const [memuatGps, setMemuatGps] = useState(false);
  const [errorGps, setErrorGps] = useState("");
  const [errorKoordinat, setErrorKoordinat] = useState("");
  const permintaan = useRef(0);
  const draf = bacaKoordinat(latitude, longitude);
  useEffect(() => () => { permintaan.current += 1; }, []);

  function pilihDraf(point: KoordinatLaporan) {
    permintaan.current += 1;
    setMemuatGps(false);
    setErrorGps(""); setErrorKoordinat("");
    setLatitude(String(point.latitude)); setLongitude(String(point.longitude)); setPusat(point);
  }
  function tutup() { permintaan.current += 1; setMemuatGps(false); setTerbuka(false); }
  function ambilGps() {
    const id = ++permintaan.current;
    setErrorGps("");
    if (!window.isSecureContext) { setErrorGps("GPS memerlukan HTTPS atau localhost. Anda dapat memilih titik melalui peta."); return; }
    if (!navigator.geolocation) { setErrorGps("Perangkat ini tidak mendukung GPS. Pilih titik di peta atau isi koordinat."); return; }
    setMemuatGps(true);
    try {
      navigator.geolocation.getCurrentPosition((posisi) => {
        if (id !== permintaan.current) return;
        const point = bacaKoordinat(String(posisi.coords.latitude), String(posisi.coords.longitude));
        if (!point) { setMemuatGps(false); setErrorGps("Koordinat GPS tidak valid. Pilih titik melalui peta."); return; }
        pilihDraf(rapikanKoordinat(point.latitude, point.longitude));
      }, (gagal) => {
        if (id !== permintaan.current) return;
        setMemuatGps(false); setErrorGps(pesanKegagalanGps(gagal.code));
      }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
    } catch {
      if (id === permintaan.current) { setMemuatGps(false); setErrorGps(pesanKegagalanGps(0)); }
    }
  }
  function buka(denganGps = false) {
    permintaan.current += 1;
    setLatitude(nilai ? String(nilai.latitude) : ""); setLongitude(nilai ? String(nilai.longitude) : "");
    setPusat(nilai ?? PUSAT_AWAL); setErrorGps(""); setErrorKoordinat(""); setMemuatGps(false); setTerbuka(true);
    if (denganGps) ambilGps();
  }
  function konfirmasi() {
    if (!draf) { setErrorKoordinat("Isi latitude −90–90 dan longitude −180–180, atau pilih titik di peta."); return; }
    onPilih(draf); tutup();
  }
  function ubahAngka(value: string, field: "latitude" | "longitude") {
    permintaan.current += 1; setMemuatGps(false); setErrorGps(""); setErrorKoordinat("");
    if (field === "latitude") setLatitude(value); else setLongitude(value);
  }
  function enter(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") { event.preventDefault(); event.stopPropagation(); konfirmasi(); }
  }
  const wilayah = nilai ? wilayahTitik(nilai) : null;
  return (
    <div className="flex flex-col gap-2">
      <div className="relative h-44 rounded-button border border-border md:h-60">
        <PetaLaporan koordinat={nilai} />
        <Button id="laporan-koordinat" varian="sekunder" onClick={() => buka()} aria-invalid={Boolean(error)} aria-describedby={error ? "error-titik-lokasi" : "status-titik-lokasi"} className="absolute right-3 bottom-8 min-h-9! px-3! py-2! text-xs!">Pilih di peta</Button>
      </div>
      <Button varian="sekunder" onClick={() => buka(true)} className="text-sm!">Gunakan GPS perangkat</Button>
      <p id="status-titik-lokasi" aria-live="polite" className="text-xs leading-relaxed text-text-secondary">
        {nilai ? `${nilai.latitude.toFixed(6)}, ${nilai.longitude.toFixed(6)}` : "Belum ada titik dipilih. Gunakan peta atau GPS."}
      </p>
      {error && <p id="error-titik-lokasi" role="alert" className="text-sm text-danger-text">{error}</p>}
      {wilayah && <p className="text-xs text-dark-teal">Wilayah: {wilayah.nama}</p>}
      {diLuarWilayah(nilai) && <p role="status" className="rounded-button bg-warning-bg p-3 text-xs leading-relaxed text-warning-text">Titik berada di luar wilayah kerja sama SoClean. Pilih lokasi di Cikapundung, Ancol, atau Pangandaran.</p>}
      <Modal terbuka={terbuka} onTutup={tutup} judul="Pilih lokasi pencemaran" label="Lokasi laporan" aksi={<>
        <Button varian="sekunder" onClick={tutup}>Batal</Button>
        <Button onClick={konfirmasi} disabled={memuatGps}>Gunakan lokasi ini</Button>
      </>}>
        <p className="text-sm text-text-secondary">Klik peta atau geser penanda. Dengan keyboard, gunakan tombol panah lalu Enter untuk memilih titik tengah peta.</p>
        <Dropdown label="Pergi ke wilayah kerja sama" ukuranLabel="ringkas" placeholder="Pilih wilayah untuk melihat peta" pilihan={WILAYAH.map((w) => ({ nilai: w.kode, label: w.nama }))} onChange={(event) => {
          const w = WILAYAH.find((item) => item.kode === event.target.value);
          if (!w) return;
          permintaan.current += 1; setMemuatGps(false); setErrorGps(""); setErrorKoordinat(""); setLatitude(""); setLongitude("");
          setPusat({ latitude: (w.latMin + w.latMax) / 2, longitude: (w.lngMin + w.lngMax) / 2 });
        }} />
        <div className="h-64 rounded-button border border-border sm:h-80"><PetaLaporan koordinat={draf} pusat={pusat} interaktif onPilih={pilihDraf} /></div>
        <Button varian="sekunder" onClick={ambilGps} memuat={memuatGps}>{memuatGps ? "Mencari lokasi perangkat…" : "Gunakan GPS"}</Button>
        {errorGps && <p role="alert" className="text-sm text-danger-text">{errorGps}</p>}
        <div className="grid gap-3 sm:grid-cols-2">
          <Textbox id="pilih-latitude" label="Latitude" ukuranLabel="ringkas" type="number" step="any" min={-90} max={90} value={latitude} placeholder="Contoh: -6.885" onChange={(event) => ubahAngka(event.target.value, "latitude")} onKeyDown={enter} onBlur={() => { if (draf) setPusat(draf); }} />
          <Textbox id="pilih-longitude" label="Longitude" ukuranLabel="ringkas" type="number" step="any" min={-180} max={180} value={longitude} placeholder="Contoh: 107.607" onChange={(event) => ubahAngka(event.target.value, "longitude")} onKeyDown={enter} onBlur={() => { if (draf) setPusat(draf); }} />
        </div>
        {errorKoordinat && <p role="alert" className="text-sm text-danger-text">{errorKoordinat}</p>}
        {diLuarWilayah(draf) && <p role="status" className="rounded-button bg-warning-bg p-3 text-sm text-warning-text">Titik pilihan berada di luar wilayah kerja sama SoClean.</p>}
      </Modal>
    </div>
  );
}
