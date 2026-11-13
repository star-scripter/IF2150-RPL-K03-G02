import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  clients: [] as Array<{ config: Record<string, unknown> }>,
  commands: [] as Array<{ kind: string; input: Record<string, unknown> }>,
  send: vi.fn(),
  getSignedUrl: vi.fn(),
}));

vi.mock("@aws-sdk/client-s3", () => {
  class MockS3Client {
    config: Record<string, unknown>;

    constructor(config: Record<string, unknown>) {
      this.config = config;
      mocks.clients.push(this);
    }

    send(command: unknown) {
      return mocks.send(command);
    }
  }

  class MockPutObjectCommand {
    constructor(readonly input: Record<string, unknown>) {
      mocks.commands.push({ kind: "put", input });
    }
  }

  class MockGetObjectCommand {
    constructor(readonly input: Record<string, unknown>) {
      mocks.commands.push({ kind: "get", input });
    }
  }

  return {
    S3Client: MockS3Client,
    PutObjectCommand: MockPutObjectCommand,
    GetObjectCommand: MockGetObjectCommand,
  };
});

vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: mocks.getSignedUrl,
}));

import {
  createS3StorageAdapter,
  PRESIGNED_READ_URL_TTL_SECONDS,
  readS3StorageConfig,
} from "../server/storage/s3";

const config = {
  endpoint: "http://rustfs:9000",
  publicEndpoint: "http://localhost:9000",
  region: "us-east-1",
  bucket: "soclean-media",
  accessKeyId: "test-access-key",
  secretAccessKey: "test-secret-key",
  forcePathStyle: true,
};

const envConfig = {
  S3_ENDPOINT: config.endpoint,
  S3_PUBLIC_ENDPOINT: config.publicEndpoint,
  S3_REGION: config.region,
  S3_BUCKET: config.bucket,
  S3_ACCESS_KEY_ID: config.accessKeyId,
  S3_SECRET_ACCESS_KEY: config.secretAccessKey,
  S3_FORCE_PATH_STYLE: "true",
};

beforeEach(() => {
  mocks.clients.length = 0;
  mocks.commands.length = 0;
  mocks.send.mockReset().mockResolvedValue({});
  mocks.getSignedUrl.mockReset().mockResolvedValue("http://localhost:9000/soclean-media/media/test");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("S3-compatible storage adapter", () => {
  it("reads all server and public endpoint settings from S3_* environment variables", () => {
    expect(readS3StorageConfig(envConfig)).toEqual(config);
  });

  it("uploads the object through S3_ENDPOINT and returns a generated storage key", async () => {
    const adapter = createS3StorageAdapter(config);
    const file = new File(["test image bytes"], "before.png", { type: "image/png" });

    const key = await adapter.upload(file);

    expect(key).toMatch(/^media\/[0-9a-f-]{36}$/);
    expect(mocks.clients[0]?.config.endpoint).toBe(config.endpoint);
    expect(mocks.commands).toContainEqual({
      kind: "put",
      input: expect.objectContaining({
        Bucket: config.bucket,
        Key: key,
        ContentType: "image/png",
        Body: Buffer.from("test image bytes"),
      }),
    });
    expect(mocks.send).toHaveBeenCalledOnce();
  });

  it("creates presigned read URLs using S3_PUBLIC_ENDPOINT and the configured lifetime", async () => {
    const adapter = createS3StorageAdapter(config);

    await expect(adapter.getUrl("media/test-key")).resolves.toBe(
      "http://localhost:9000/soclean-media/media/test",
    );
    expect(mocks.clients[1]?.config.endpoint).toBe(config.publicEndpoint);
    expect(mocks.commands).toContainEqual({
      kind: "get",
      input: { Bucket: config.bucket, Key: "media/test-key" },
    });
    expect(mocks.getSignedUrl).toHaveBeenCalledWith(
      mocks.clients[1],
      expect.any(Object),
      { expiresIn: PRESIGNED_READ_URL_TTL_SECONDS },
    );
  });

  it("reuses one client when the private and public endpoints are identical", async () => {
    const adapter = createS3StorageAdapter({ ...config, publicEndpoint: config.endpoint });
    await adapter.getUrl("media/test-key");

    expect(mocks.clients).toHaveLength(1);
    expect(mocks.getSignedUrl).toHaveBeenCalledWith(
      mocks.clients[0],
      expect.any(Object),
      { expiresIn: PRESIGNED_READ_URL_TTL_SECONDS },
    );
  });

  it("rejects missing or malformed storage configuration without revealing values", () => {
    expect(() => readS3StorageConfig({})).toThrow("S3_ENDPOINT");
    expect(() => readS3StorageConfig({ ...envConfig, S3_FORCE_PATH_STYLE: "sometimes" })).toThrow(
      "S3_FORCE_PATH_STYLE",
    );
  });

  it("rejects an empty object key before signing", async () => {
    const adapter = createS3StorageAdapter(config);
    await expect(adapter.getUrl(" ")).rejects.toThrow("Storage key tidak boleh kosong.");
    expect(mocks.getSignedUrl).not.toHaveBeenCalled();
  });
});
