import { NextRequest, NextResponse } from "next/server";

const ALLOWED_IP = process.env.ALLOWED_CLOCK_IP?.trim();

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return req.ip ?? "";
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isClock =
    pathname === "/clock" || pathname.startsWith("/clock/");

  if (!isClock) return NextResponse.next();

  // If no IP is configured, restriction is disabled (dev mode)
  if (!ALLOWED_IP) return NextResponse.next();

  const clientIp = getClientIp(req);

  if (clientIp !== ALLOWED_IP) {
    const blocked = req.nextUrl.clone();
    blocked.pathname = "/clock-blocked";
    return NextResponse.redirect(blocked);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/clock", "/clock/:path*"],
};
