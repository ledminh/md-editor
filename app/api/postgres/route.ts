import { NextResponse } from "next/server";
import { Pool } from "pg";

export const runtime = "nodejs";

const connectionString =
  process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!connectionString) {
  throw new Error("Missing Postgres configuration.");
}

const useSsl = process.env.POSTGRES_SSL === "true";
const pool = new Pool({
  connectionString,
  ssl: useSsl ? { rejectUnauthorized: false } : undefined,
  connectionTimeoutMillis: 5000,
});
let tableReady = false;

const ensureTable = async () => {
  if (tableReady) {
    return;
  }
  await pool.query(`
    CREATE TABLE IF NOT EXISTS markdown_files (
      key TEXT PRIMARY KEY,
      content TEXT NOT NULL,
      size INTEGER NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL
    );
  `);
  tableReady = true;
};

const sanitizeKey = (key: string) => {
  const trimmed = key.trim().replace(/^\/+/, "").replace(/\.\./g, "");
  return trimmed.endsWith(".md") ? trimmed : `${trimmed}.md`;
};

export async function GET(request: Request) {
  try {
    await ensureTable();
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
      const response = await pool.query(
        "SELECT key, content FROM markdown_files WHERE key = $1",
        [key]
      );
      const row = response.rows[0];
      if (!row) {
        return NextResponse.json({ error: "File not found." }, { status: 404 });
      }
      return NextResponse.json({ key: row.key, content: row.content });
    }

    const response = await pool.query(
      "SELECT key, size, updated_at FROM markdown_files ORDER BY updated_at DESC"
    );
    const files = response.rows.map((row) => ({
      key: row.key,
      size: row.size,
      lastModified: row.updated_at ? new Date(row.updated_at).toISOString() : null,
    }));
    return NextResponse.json({ files });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to list files.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureTable();
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

    const key = sanitizeKey(body.key);
    if (!key || key === ".md") {
      return NextResponse.json(
        { error: "Invalid file name." },
        { status: 400 }
      );
    }

    const size = Buffer.byteLength(body.content, "utf-8");
    const now = new Date().toISOString();
    await pool.query(
      `
      INSERT INTO markdown_files (key, content, size, updated_at)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (key)
      DO UPDATE SET content = EXCLUDED.content, size = EXCLUDED.size, updated_at = EXCLUDED.updated_at
    `,
      [key, body.content, size, now]
    );

    return NextResponse.json({ ok: true, key });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to save file.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
