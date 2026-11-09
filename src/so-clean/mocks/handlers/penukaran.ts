/** Mock poin, reward, dan penukaran (BE-18–BE-22, UC07–UC09). */
import { delay, http } from "msw";
import type { Penukaran, Reward, TukarPoinResponse } from "../../types/api";
import { db, waktuSekarang } from "../db";
import {
  API,
  GagalMock,
  bacaAngka,
  bacaJson,
  paginasi,
  sukses,
  suksesList,
  tanganiError,
  wajibLogin,
} from "../utils";

/** Huruf besar dan angka tanpa karakter yang mirip (0, O, 1, I). */
const KARAKTER_VOUCHER = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

function acak(panjang: number): string {
  let hasil = "";
  for (let i = 0; i < panjang; i++) {
    hasil += KARAKTER_VOUCHER[Math.floor(Math.random() * KARAKTER_VOUCHER.length)];
  }
  return hasil;
}

/** Format K5: SC-XXXX-XXXX, dibuat ulang jika bentrok. */
function kodeVoucher(): string {
  let kode: string;
  do {
    kode = `SC-${acak(4)}-${acak(4)}`;
  } while (db.penukaran.some((p) => p.kodeVoucher === kode));
  return kode;
}

/** Urutan N3: stok > 0 dulu, lalu harga naik. */
function urutkanReward(a: Reward, b: Reward): number {
  const habisA = a.stok > 0 ? 0 : 1;
  const habisB = b.stok > 0 ? 0 : 1;
  return habisA - habisB || a.hargaPoin - b.hargaPoin;
}

export const penukaranHandlers = [
  http.get(
    `${API}/poin/saldo`,
    tanganiError(async () => {
      await delay();
      const p = wajibLogin(["MASYARAKAT"]);
      return sukses({ saldoPoin: p.saldoPoin });
    }),
  ),

  http.get(
    `${API}/reward`,
    tanganiError(async () => {
      await delay();
      wajibLogin();
      return sukses([...db.reward].sort(urutkanReward));
    }),
  ),

  http.post(
    `${API}/penukaran`,
    tanganiError(async ({ request }) => {
      await delay();
      const pengguna = wajibLogin(["MASYARAKAT"]);
      const { idReward } = await bacaJson(request);
      if (typeof idReward !== "number" || !Number.isInteger(idReward)) {
        throw new GagalMock("FORMAT_TIDAK_VALID", { idReward: "idReward harus berupa angka." });
      }
      const reward = db.reward.find((r) => r.idReward === idReward);
      if (!reward) throw new GagalMock("NOT_FOUND");
      if (reward.stok <= 0) throw new GagalMock("STOK_HABIS");
      if (pengguna.saldoPoin < reward.hargaPoin) throw new GagalMock("POIN_TIDAK_CUKUP");

      reward.stok -= 1;
      pengguna.saldoPoin -= reward.hargaPoin;
      const penukaran: Penukaran = {
        idPenukaran: crypto.randomUUID(),
        namaReward: reward.nama,
        kodeVoucher: kodeVoucher(),
        poinDipakai: reward.hargaPoin,
        waktuPenukaran: waktuSekarang(),
      };
      db.penukaran.push({ ...penukaran, idPengguna: pengguna.id });

      const respons: TukarPoinResponse = { ...penukaran, sisaPoin: pengguna.saldoPoin };
      return sukses(respons);
    }),
  ),

  http.get(
    `${API}/penukaran`,
    tanganiError(async ({ request }) => {
      await delay();
      const pengguna = wajibLogin(["MASYARAKAT"]);
      const url = new URL(request.url);
      const page = bacaAngka(url.searchParams.get("page"), 1);
      const limit = bacaAngka(url.searchParams.get("limit"), 10);
      const riwayat: Penukaran[] = db.penukaran
        .filter((p) => p.idPengguna === pengguna.id)
        .sort((a, b) => Date.parse(b.waktuPenukaran) - Date.parse(a.waktuPenukaran))
        .map(({ idPenukaran, namaReward, kodeVoucher, poinDipakai, waktuPenukaran }) => ({
          idPenukaran,
          namaReward,
          kodeVoucher,
          poinDipakai,
          waktuPenukaran,
        }));
      const { data, meta } = paginasi(riwayat, page, limit);
      return suksesList(data, meta);
    }),
  ),
];
