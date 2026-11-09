/**
 * Kartu "Poin Anda" (I04-02).
 * Kelas DPPL: C12 - HalamanPenukaran (tampilkanSaldo)
 */
type Props = {
  saldoPoin: number;
};

export default function KartuSaldo({ saldoPoin }: Props) {
  return (
    <section aria-label="Saldo poin" className="rounded-2xl bg-emerald-950 p-5 text-white">
      <p className="text-sm">Poin Anda</p>
      <p className="mt-1 text-4xl font-bold text-lime-300">
        {saldoPoin.toLocaleString("id-ID")}
      </p>
    </section>
  );
}
