/**
 * Kartu "Poin Anda" (I04-02).
 * Kelas DPPL: C12 - HalamanPenukaran (tampilkanSaldo)
 */
type Props = {
  saldoPoin: number;
};

export default function KartuSaldo({ saldoPoin }: Props) {
  return (
    <section aria-label="Saldo poin" className="rounded-card bg-dark-teal p-5 text-white">
      <p className="text-body">Poin Anda</p>
      <p className="mt-1 font-heading text-h1 text-light-green">
        {saldoPoin.toLocaleString("id-ID")}
      </p>
    </section>
  );
}
