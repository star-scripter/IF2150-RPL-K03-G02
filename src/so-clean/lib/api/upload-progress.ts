/** Transport opsional FE-11. Parsing kontrak, sesi habis, dan kesiapan MSW tetap di client.ts. */
export type ProgresUnggah = { loaded: number; total: number | null };

export function requestDenganProgres(
  url: string,
  opsi: { method: string; headers: Record<string, string>; body?: BodyInit; signal?: AbortSignal; onUploadProgress: (progres: ProgresUnggah) => void },
): Promise<Response> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    let selesai = false;
    function tutup(aksi: () => void) {
      if (selesai) return;
      selesai = true;
      opsi.signal?.removeEventListener("abort", batalkan);
      xhr.upload.onprogress = null;
      xhr.onload = xhr.onerror = xhr.ontimeout = xhr.onabort = null;
      aksi();
    }
    function batalkan() {
      tutup(() => { xhr.abort(); reject(new DOMException("Unggahan dibatalkan", "AbortError")); });
    }
    if (opsi.signal?.aborted) { batalkan(); return; }
    // Dipasang sebelum open/send untuk kompatibilitas event upload di browser.
    xhr.upload.onprogress = (event) => {
      if (!selesai) opsi.onUploadProgress({ loaded: event.loaded, total: event.lengthComputable && event.total > 0 ? event.total : null });
    };
    xhr.onload = () => tutup(() => {
      if (xhr.status === 0) { reject(new TypeError("Koneksi unggah gagal")); return; }
      const headers = new Headers();
      for (const baris of xhr.getAllResponseHeaders().trim().split(/[\r\n]+/)) {
        const titikDua = baris.indexOf(":");
        if (titikDua > 0) headers.append(baris.slice(0, titikDua).trim(), baris.slice(titikDua + 1).trim());
      }
      resolve(new Response(xhr.responseText || null, { status: xhr.status, statusText: xhr.statusText, headers }));
    });
    xhr.onerror = xhr.ontimeout = () => tutup(() => reject(new TypeError("Koneksi unggah gagal")));
    xhr.onabort = () => tutup(() => reject(new DOMException("Unggahan dibatalkan", "AbortError")));
    opsi.signal?.addEventListener("abort", batalkan, { once: true });
    try {
      xhr.open(opsi.method, url, true);
      // Cookie same-origin tetap dikirim; tidak mengaktifkan kredensial lintas origin.
      xhr.withCredentials = false;
      xhr.timeout = 120_000;
      for (const [nama, nilai] of Object.entries(opsi.headers)) xhr.setRequestHeader(nama, nilai);
      xhr.send(opsi.body as XMLHttpRequestBodyInit | null | undefined);
    } catch (error) {
      tutup(() => reject(error));
    }
  });
}
