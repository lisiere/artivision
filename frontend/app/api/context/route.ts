import { NextResponse } from "next/server";
import { resolveInternalBackendBaseUrl, vercelProtectionBypassHeaders } from "@/lib/internalBackend";

export const dynamic = "force-dynamic";

export async function GET() {
  const res = await fetch(`${resolveInternalBackendBaseUrl()}/api/context`, {
    cache: "no-store",
    headers: { ...vercelProtectionBypassHeaders() },
  });
  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: {
      "content-type": res.headers.get("content-type") || "application/json",
    },
  });
}
