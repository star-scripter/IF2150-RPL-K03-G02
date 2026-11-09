import { beforeEach, describe, expect, it, vi } from "vitest";

beforeEach(() => {
  vi.resetModules();
  vi.unstubAllEnvs();
  vi.stubEnv("S3_ENDPOINT", "http://rustfs:9000");
  vi.stubEnv("S3_PUBLIC_ENDPOINT", "http://localhost:9000");
  vi.stubEnv("S3_REGION", "us-east-1");
  vi.stubEnv("S3_BUCKET", "soclean-media");
  vi.stubEnv("S3_ACCESS_KEY_ID", "kunci-uji");
  vi.stubEnv("S3_SECRET_ACCESS_KEY", "rahasia-uji");
  vi.stubEnv("S3_FORCE_PATH_STYLE", "true");
});

describe("getUrl (presigned URL media)", () => {
  it("menandatangani URL dengan S3_PUBLIC_ENDPOINT dan masa berlaku 1 jam", async () => {
    const { getUrl } = await import("@/server/storage/s3");
    const url = new URL(await getUrl("seed/lap-1.png"));

    expect(url.origin).toBe("http://localhost:9000");
    expect(url.pathname).toBe("/soclean-media/seed/lap-1.png");
    expect(url.searchParams.get("X-Amz-Expires")).toBe("3600");
    expect(url.searchParams.get("X-Amz-Signature")).toMatch(/^[0-9a-f]{64}$/);
    expect(url.search).not.toContain("rahasia-uji");
  });

  it("melempar error jika env storage belum dikonfigurasi", async () => {
    vi.stubEnv("S3_PUBLIC_ENDPOINT", "");
    const { getUrl } = await import("@/server/storage/s3");
    await expect(getUrl("seed/lap-1.png")).rejects.toThrow("S3_PUBLIC_ENDPOINT");
  });
});
