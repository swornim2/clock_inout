import { NextRequest, NextResponse } from "next/server";

// Set ALLOWED_CLOCK_PREFIX to the first 4 groups of your shop's IPv6 address
// e.g. "2001:8003:b10d:b900" — this is your /64 prefix which stays stable
// even when the full address rotates. Leave blank to disable.
const ALLOWED_PREFIX = process.env.ALLOWED_CLOCK_PREFIX?.trim().toLowerCase();
const IS_PROD = process.env.NODE_ENV === "production";

function getClientIp(req: NextRequest): string {
  // Netlify's reliable true-client IP header
  const nfIp = req.headers.get("x-nf-client-connection-ip");
  if (nfIp) return nfIp.trim().toLowerCase();
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim().toLowerCase();
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim().toLowerCase();
  return (req.ip ?? "").toLowerCase();
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isClock = pathname === "/clock" || pathname.startsWith("/clock/");
  if (!isClock) return NextResponse.next();

  // Only enforce in production and when a prefix is configured
  if (!IS_PROD || !ALLOWED_PREFIX) return NextResponse.next();

  const clientIp = getClientIp(req);

  // Match on prefix — works even when the last 4 groups of the IPv6 rotate
  if (!clientIp.startsWith(ALLOWED_PREFIX)) {
    const blocked = req.nextUrl.clone();
    blocked.pathname = "/clock-blocked";
    return NextResponse.redirect(blocked);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/clock", "/clock/:path*"],
};
