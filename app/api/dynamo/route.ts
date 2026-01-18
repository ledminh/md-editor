import { NextResponse } from "next/server";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";

export const runtime = "nodejs";

const tableName = process.env.DDB_TABLE_NAME;
const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION;

const getClient = () => {
  if (!tableName || !region) {
    throw new Error("Missing DynamoDB configuration.");
  }
  const client = new DynamoDBClient({ region });
  return {
    client: DynamoDBDocumentClient.from(client),
    table: tableName,
  };
};

const sanitizeKey = (key: string) => {
  const trimmed = key.trim().replace(/^\/+/, "").replace(/\.\./g, "");
  return trimmed.endsWith(".md") ? trimmed : `${trimmed}.md`;
};

export async function GET(request: Request) {
  try {
    const { client, table } = getClient();
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
        new GetCommand({
          TableName: table,
          Key: { key },
        })
      );
      if (!response.Item) {
        return NextResponse.json(
          { error: "File not found." },
          { status: 404 }
        );
      }
      return NextResponse.json({
        key: response.Item.key,
        content: response.Item.content ?? "",
      });
    }

    const response = await client.send(
      new ScanCommand({
        TableName: table,
      })
    );
    const files = (response.Items ?? [])
      .map((item) => ({
        key: item.key as string,
        size: (item.size as number) ?? 0,
        lastModified: (item.updatedAt as string) ?? null,
      }))
      .filter((item) => item.key.endsWith(".md"))
      .sort((a, b) =>
        (b.lastModified ?? "").localeCompare(a.lastModified ?? "")
      );

    return NextResponse.json({ files });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to list files.";
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

    const { client, table } = getClient();
    const key = sanitizeKey(body.key);
    if (!key || key === ".md") {
      return NextResponse.json(
        { error: "Invalid file name." },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    await client.send(
      new PutCommand({
        TableName: table,
        Item: {
          key,
          content: body.content,
          size: Buffer.byteLength(body.content, "utf-8"),
          updatedAt: now,
        },
      })
    );

    return NextResponse.json({ ok: true, key });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to save file.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
