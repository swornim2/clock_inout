import { NextRequest, NextResponse } from "next/server";

// Set ALLOWED_CLOCK_PREFIX to the first 4 groups of your shop's IPv6 address
// e.g. "2001:8003:b10d:b900" — this is your /64 prefix which stays stable
// even when the full address rotates. Leave blank to disable.
const ALLOWED_PREFIX = process.env.ALLOWED_CLOCK_PREFIX?.trim().toLowerCase();
const IS_PROD = process.env.NODE_ENV === "production";

function getCandidateIps(req: NextRequest): string[] {
  const ips: string[] = [];
  const nfIp = req.headers.get("x-nf-client-connection-ip");
  if (nfIp) ips.push(nfIp.trim().toLowerCase());
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded)
    forwarded.split(",").forEach((ip) => ips.push(ip.trim().toLowerCase()));
  const realIp = req.headers.get("x-real-ip");
  if (realIp) ips.push(realIp.trim().toLowerCase());
  if (req.ip) ips.push(req.ip.toLowerCase());
  return ips;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isClock = pathname === "/clock" || pathname.startsWith("/clock/");
  if (!isClock) return NextResponse.next();

  // Only enforce in production and when a prefix is configured
  if (!IS_PROD || !ALLOWED_PREFIX) return NextResponse.next();

  // Allow if ANY candidate IP matches the prefix
  const allowed = getCandidateIps(req).some((ip) =>
    ip.startsWith(ALLOWED_PREFIX),
  );

  if (!allowed) {
    const blocked = req.nextUrl.clone();
    blocked.pathname = "/clock-blocked";
    const res = NextResponse.redirect(blocked);
    res.headers.set("Cache-Control", "no-store");
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/clock", "/clock/:path*"],
};
