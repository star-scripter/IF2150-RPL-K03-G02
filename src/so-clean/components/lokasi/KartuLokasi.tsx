import Link from "next/link";
import { Badge, Card, kelasButton } from "@/components/ui";
import { formatDilaporkan, formatJarakLokasi, LABEL_SAMPAH_LOKASI, type LokasiBerjarak } from "@/lib/lokasi";
import { ROUTE } from "@/lib/nav";

function Ikon({ nama }: { nama: "lokasi" | "sampah" | "waktu" | "panah" }) {
  return <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-[18px] shrink-0 text-dark-teal">
    {nama === "lokasi" && <><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>}
    {nama === "sampah" && <><path d="M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15" /></>}
    {nama === "waktu" && <><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>}
    {nama === "panah" && <path d="m9 5 7 7-7 7" />}
  </svg>;
}

export function KartuLokasi({ lokasi, sekarang }: { lokasi: LokasiBerjarak; sekarang: number }) {
  return <Card className="gap-3! p-4! min-[400px]:p-5!">
    <div className="flex items-start justify-between gap-3">
      <h2 className="min-w-0 text-h3 break-words text-dark-teal">{lokasi.nama}</h2>
      <Badge className="text-xs! min-[400px]:text-sm!">+{lokasi.poin.toLocaleString("id-ID")} poin</Badge>
    </div>
    <div className="space-y-1.5 text-sm leading-5 text-text-secondary">
      <p className="flex items-start gap-2"><Ikon nama="lokasi" /><span className="min-w-0 break-words">
        {lokasi.jarakKm !== null && <><span>{formatJarakLokasi(lokasi.jarakKm)}</span><span aria-hidden> · </span></>}
        <span aria-label="Koordinat lokasi">{lokasi.latitude.toFixed(4)}, {lokasi.longitude.toFixed(4)}</span>
      </span></p>
      <p className="flex items-start gap-2"><Ikon nama="sampah" /><span>{LABEL_SAMPAH_LOKASI[lokasi.jenisSampah]}</span></p>
      <p className="flex items-start gap-2"><Ikon nama="waktu" /><span>Dilaporkan <time dateTime={lokasi.dilaporkanAt}>{formatDilaporkan(lokasi.dilaporkanAt, sekarang)}</time></span></p>
    </div>
    <Link href={`${ROUTE.lokasi}/${lokasi.idLokasi}`} prefetch={false} aria-label={`Lihat detail ${lokasi.nama}`} className={kelasButton({ lebarPenuh: true })}>
      Lihat Detail<Ikon nama="panah" />
    </Link>
  </Card>;
}
