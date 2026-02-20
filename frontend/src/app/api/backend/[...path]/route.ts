import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { serverEnv } from "@/lib/env";

const BACKEND_API_URL = serverEnv.BACKEND_API_URL;

const MAX_BODY_SIZE = serverEnv.MAX_BODY_SIZE || 50 * 1024 * 1024; // 50MB (파일 업로드 포함)

const ALLOWED_CONTENT_TYPES = [
  "application/json",
  "application/x-www-form-urlencoded",
  "multipart/form-data",
];

function sanitizePath(pathname: string): string | null {
  const backendPath = pathname.replace(/^\/api\/backend/, "");

  if (
    backendPath.includes("..") ||
    backendPath.includes("//") ||
    backendPath.includes("\\")
  ) {
    return null;
  }

  const normalized = "/" + backendPath.replace(/^\/+/, "");

  try {
    const testUrl = new URL(normalized, "http://localhost");
    if (testUrl.pathname !== normalized) {
      return null;
    }
  } catch {
    return null;
  }

  return normalized;
}

function isAllowedContentType(contentType: string | null): boolean {
  if (!contentType) return true;
  return ALLOWED_CONTENT_TYPES.some((allowed) =>
    contentType.toLowerCase().startsWith(allowed)
  );
}

async function proxyRequest(req: NextRequest) {
  const session = await auth();

  console.log("[api-proxy] Incoming Request to:", req.url);
  console.log("[api-proxy] Session exists:", !!session);
  console.log("[api-proxy] Session contains accessToken:", !!session?.accessToken);

  if (!session?.accessToken) {
    const allCookies = req.cookies.getAll().map(c => c.name);
    console.error(`[api-proxy] Unauthorized: No access token found in session. All cookies: ${allCookies.join(", ")}`);
    return NextResponse.json(
      {
        success: false,
        message: "Authentication required (No Token)",
        debug: { hasSession: !!session, cookies: allCookies }
      },
      { status: 401 }
    );
  }

  const url = new URL(req.url);
  const backendPath = sanitizePath(url.pathname);
  if (backendPath === null) {
    return NextResponse.json(
      { success: false, message: "Invalid request path" },
      { status: 400 }
    );
  }

  const clientContentType = req.headers.get("content-type");
  if (!isAllowedContentType(clientContentType)) {
    return NextResponse.json(
      { success: false, message: "Unsupported content type" },
      { status: 415 }
    );
  }

  // Read body as binary (supports both JSON and file uploads)
  let body: ArrayBuffer | undefined;
  if (req.method !== "GET" && req.method !== "HEAD") {
    const contentLength = req.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > MAX_BODY_SIZE) {
      return NextResponse.json(
        { success: false, message: "Request body too large" },
        { status: 413 }
      );
    }
    body = await req.arrayBuffer();
    if (body.byteLength > MAX_BODY_SIZE) {
      return NextResponse.json(
        { success: false, message: "Request body too large" },
        { status: 413 }
      );
    }
  }

  const backendUrl = `${BACKEND_API_URL}${backendPath}${url.search}`;

  // Content-Type을 그대로 전달 (multipart boundary 포함)
  const headers: Record<string, string> = {
    Authorization: `Bearer ${session.accessToken}`,
  };
  if (clientContentType) {
    headers["Content-Type"] = clientContentType;
  } else if (req.method !== "GET" && req.method !== "HEAD") {
    headers["Content-Type"] = "application/json";
  }

  try {
    const backendRes = await fetch(backendUrl, {
      method: req.method,
      headers,
      body: body ? Buffer.from(body) : undefined,
    });

    if (backendRes.status === 401) {
      console.error(`[api-proxy] Backend returned 401 for ${backendUrl}. Token may be invalid or expired.`);
      return NextResponse.json(
        { success: false, message: "Unauthorized: Backend token rejected or expired" },
        { status: 401 }
      );
    }

    const resBody = await backendRes.arrayBuffer();

    return new NextResponse(resBody, {
      status: backendRes.status,
      headers: {
        "Content-Type":
          backendRes.headers.get("content-type") ?? "application/json",
      },
    });
  } catch (error) {
    console.error("[api-proxy] Backend request failed:", error);
    return NextResponse.json(
      { success: false, message: "Backend service unavailable" },
      { status: 502 }
    );
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
