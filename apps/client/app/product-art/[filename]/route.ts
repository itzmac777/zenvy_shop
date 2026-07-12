import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const allowedFiles = new Set([
  "product-chatgpt-plus.png",
  "product-chatgpt-pro.png",
  "product-netflix-standard.png",
  "product-netflix-premium.png",
  "product-youtube-premium.png",
]);

export async function GET(_: Request, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;

  if (!allowedFiles.has(filename)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const filePath = path.join(process.cwd(), "product-art", filename);
  const file = await readFile(filePath);

  return new NextResponse(file, {
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Type": "image/png",
    },
  });
}
