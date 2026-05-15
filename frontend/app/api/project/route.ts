import { NextResponse } from "next/server";
import { resolveInternalBackendBaseUrl, vercelProtectionBypassHeaders } from "@/lib/internalBackend";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const contentType = req.headers.get("content-type");
  if (!contentType?.toLowerCase().includes("multipart/form-data")) {
    return NextResponse.json({ detail: "multipart/form-data attendu" }, { status: 400 });
  }
  const buf = await req.arrayBuffer();
  const res = await fetch(`${resolveInternalBackendBaseUrl()}/api/project`, {
    method: "POST",
    headers: {
      ...vercelProtectionBypassHeaders(),
      "content-type": contentType,
    },
    body: buf,
  });
  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: {
      "content-type": res.headers.get("content-type") || "application/json",
    },
  });
}
