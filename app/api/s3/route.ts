import { NextResponse } from "next/server";
import {
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { Readable } from "stream";

export const runtime = "nodejs";

const bucketName = process.env.S3_BUCKET_NAME;
const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION;

const getClient = () => {
  if (!bucketName || !region) {
    throw new Error("Missing S3 configuration.");
  }
  return {
    client: new S3Client({ region }),
    bucket: bucketName,
  };
};

const sanitizeKey = (key: string) => {
  const trimmed = key.trim().replace(/^\/+/, "").replace(/\.\./g, "");
  return trimmed.endsWith(".md") ? trimmed : `${trimmed}.md`;
};

const streamToString = async (stream: Readable) => {
  const chunks: Uint8Array[] = [];
  for await (const chunk of stream) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks).toString("utf-8");
};

export async function GET(request: Request) {
  try {
    const { client, bucket } = getClient();
    const { searchParams } = new URL(request.url);
    const keyParam = searchParams.get("key");
    if (keyParam) {
      const key = sanitizeKey(keyParam);
      if (!key || key === ".md") {
        return NextResponse.json(
          { error: "Invalid file name." },
          { status: 400 }
        );
      }
      const response = await client.send(
        new GetObjectCommand({
          Bucket: bucket,
          Key: key,
        })
      );
      if (!response.Body || !(response.Body instanceof Readable)) {
        return NextResponse.json(
          { error: "Unable to read file content." },
          { status: 500 }
        );
      }
      const content = await streamToString(response.Body);
      return NextResponse.json({ key, content });
    }
    const response = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
      })
    );
    const files = (response.Contents ?? [])
      .filter((item) => item.Key)
      .map((item) => ({
        key: item.Key as string,
        size: item.Size ?? 0,
        lastModified: item.LastModified
          ? item.LastModified.toISOString()
          : null,
      }))
      .filter((item) => item.key.endsWith(".md"))
      .sort((a, b) =>
        (b.lastModified ?? "").localeCompare(a.lastModified ?? "")
      );

    return NextResponse.json({ files });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to list S3 files.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      key?: string;
      content?: string;
    };

    if (!body?.key || typeof body.key !== "string") {
      return NextResponse.json(
        { error: "A file name is required." },
        { status: 400 }
      );
    }

    if (typeof body.content !== "string") {
      return NextResponse.json(
        { error: "Markdown content is required." },
        { status: 400 }
      );
    }

    const { client, bucket } = getClient();
    const key = sanitizeKey(body.key);
    if (!key || key === ".md") {
      return NextResponse.json(
        { error: "Invalid file name." },
        { status: 400 }
      );
    }

    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body.content,
        ContentType: "text/markdown; charset=utf-8",
      })
    );

    return NextResponse.json({ ok: true, key });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to save file.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
