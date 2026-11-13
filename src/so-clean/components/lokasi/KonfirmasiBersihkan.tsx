"use client";

import Link from "next/link";
import { Badge, Button, Card, Modal, kelasButton } from "@/components/ui";
import { urlFormCleanIt } from "@/lib/detail-lokasi";
import type { LokasiDetail } from "@/types/api";

export function KonfirmasiBersihkan({ lokasi, terbuka, onTutup }: { lokasi: LokasiDetail; terbuka: boolean; onTutup: () => void }) {
  return <Modal terbuka={terbuka && lokasi.status === "TERCEMAR"} onTutup={onTutup} judul="Bersihkan lokasi ini?" label="Konfirmasi CleanIt" className="max-w-lg!"
    aksi={<div className="flex w-full flex-col-reverse gap-3 sm:flex-row sm:justify-end">
      <Button varian="sekunder" autoFocus onClick={onTutup}>Batal</Button>
      <Link href={urlFormCleanIt(lokasi.idLokasi)} prefetch={false} onClick={onTutup} className={kelasButton({ className: "text-sm!" })}>Lanjut ke Form CleanIt</Link>
    </div>}>
    <Card varian="lembut">
      <p className="break-words font-heading text-h3 text-dark-teal">{lokasi.nama}</p>
      <p className="break-words text-sm text-text-secondary">{lokasi.alamat}</p>
      <Badge className="self-start">+{lokasi.poin.toLocaleString("id-ID")} poin</Badge>
    </Card>
    <p className="text-sm leading-relaxed text-text-secondary">Anda akan memperoleh {lokasi.poin.toLocaleString("id-ID")} poin setelah bukti pembersihan dinyatakan valid oleh Operator.</p>
    <p className="text-sm leading-relaxed text-text-secondary">Lanjutkan ke form CleanIt untuk mengirim bukti pembersihan lokasi ini.</p>
  </Modal>;
}
