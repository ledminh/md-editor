import { NextResponse } from "next/server";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  DeleteCommand,
  GetCommand,
  PutCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { Readable } from "stream";

export const runtime = "nodejs";

const bucketName = process.env.S3_BUCKET_NAME;
const tableName = process.env.DDB_TABLE_NAME;
const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION;
const s3Prefix = process.env.S3_PREFIX || "posts/";

const getClients = () => {
  if (!bucketName || !tableName || !region) {
    throw new Error("Missing S3 or DynamoDB configuration.");
  }
  return {
    s3: new S3Client({ region }),
    dynamo: DynamoDBDocumentClient.from(new DynamoDBClient({ region })),
    bucket: bucketName,
    table: tableName,
  };
};

const sanitizeKey = (key: string) => {
  const trimmed = key.trim().replace(/^\/+/, "").replace(/\.\./g, "");
  return trimmed.endsWith(".md") ? trimmed : `${trimmed}.md`;
};

const normalizeTags = (tags: unknown) => {
  if (!Array.isArray(tags)) {
    return [];
  }
  return Array.from(
    new Set(
      tags
        .filter((tag) => typeof tag === "string")
        .map((tag) => tag.trim())
        .filter(Boolean),
    ),
  );
};

const buildS3Key = (key: string) => {
  const prefix = s3Prefix.endsWith("/") ? s3Prefix : `${s3Prefix}/`;
  return `${prefix}${key}`;
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
    const { s3, dynamo, bucket, table } = getClients();
    const { searchParams } = new URL(request.url);
    const keyParam = searchParams.get("key");
    const tagParam = searchParams.get("tag");

    if (keyParam) {
      const key = sanitizeKey(keyParam);
      if (!key || key === ".md") {
        return NextResponse.json(
          { error: "Invalid file name." },
          { status: 400 },
        );
      }

      const metaResponse = await dynamo.send(
        new GetCommand({
          TableName: table,
          Key: { key },
        }),
      );

      if (!metaResponse.Item) {
        return NextResponse.json({ error: "Post not found." }, { status: 404 });
      }

      const s3Key = metaResponse.Item.s3Key as string;
      const s3Response = await s3.send(
        new GetObjectCommand({
          Bucket: bucket,
          Key: s3Key,
        }),
      );
      if (!s3Response.Body || !(s3Response.Body instanceof Readable)) {
        return NextResponse.json(
          { error: "Unable to read post content." },
          { status: 500 },
        );
      }

      const content = await streamToString(s3Response.Body);
      return NextResponse.json({
        key,
        title: (metaResponse.Item.title as string) ?? "Untitled post",
        content,
        tags: (metaResponse.Item.tags as string[]) ?? [],
      });
    }

    const response = await dynamo.send(
      new ScanCommand({
        TableName: table,
      }),
    );
    const posts = (response.Items ?? [])
      .map((item) => ({
        key: item.key as string,
        title: (item.title as string) ?? "Untitled post",
        size: (item.size as number) ?? 0,
        lastModified: (item.updatedAt as string) ?? null,
        tags: (item.tags as string[]) ?? [],
      }))
      .filter((item) => item.key.endsWith(".md"))
      .filter((item) =>
        tagParam
          ? item.tags.some(
              (tag) => tag.toLowerCase() === tagParam.toLowerCase(),
            )
          : true,
      )
      .sort((a, b) =>
        (b.lastModified ?? "").localeCompare(a.lastModified ?? ""),
      );

    return NextResponse.json({ posts });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to list posts.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { s3, dynamo, bucket, table } = getClients();
    const body = (await request.json()) as {
      key?: string;
      title?: string;
      content?: string;
      tags?: string[];
    };

    if (!body?.key || typeof body.key !== "string") {
      return NextResponse.json(
        { error: "A file name is required." },
        { status: 400 },
      );
    }

    if (typeof body.content !== "string") {
      return NextResponse.json(
        { error: "Markdown content is required." },
        { status: 400 },
      );
    }

    if (!body.title || typeof body.title !== "string") {
      return NextResponse.json(
        { error: "A title is required." },
        { status: 400 },
      );
    }

    const key = sanitizeKey(body.key);
    if (!key || key === ".md") {
      return NextResponse.json(
        { error: "Invalid file name." },
        { status: 400 },
      );
    }

    const tags = normalizeTags(body.tags);
    const title = body.title.trim() || "Untitled post";
    const s3Key = buildS3Key(key);
    const size = Buffer.byteLength(body.content, "utf-8");
    const now = new Date().toISOString();

    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: s3Key,
        Body: body.content,
        ContentType: "text/markdown; charset=utf-8",
      }),
    );

    const existing = await dynamo.send(
      new GetCommand({
        TableName: table,
        Key: { key },
      }),
    );
    const createdAt = (existing.Item?.createdAt as string) ?? now;

    await dynamo.send(
      new PutCommand({
        TableName: table,
        Item: {
          key,
          title,
          s3Key,
          tags,
          size,
          createdAt,
          updatedAt: now,
        },
      }),
    );

    return NextResponse.json({ ok: true, key });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to save post.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { s3, dynamo, bucket, table } = getClients();
    const { searchParams } = new URL(request.url);
    const keyParam = searchParams.get("key");
    if (!keyParam) {
      return NextResponse.json(
        { error: "A file name is required." },
        { status: 400 },
      );
    }
    const key = sanitizeKey(keyParam);
    if (!key || key === ".md") {
      return NextResponse.json(
        { error: "Invalid file name." },
        { status: 400 },
      );
    }

    const metaResponse = await dynamo.send(
      new GetCommand({
        TableName: table,
        Key: { key },
      }),
    );
    if (!metaResponse.Item) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    const s3Key = metaResponse.Item.s3Key as string;
    await s3.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: s3Key,
      }),
    );

    await dynamo.send(
      new DeleteCommand({
        TableName: table,
        Key: { key },
      }),
    );

    return NextResponse.json({ ok: true, key });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to delete post.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
