import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export function GET(req: NextRequest) {
  return NextResponse.json({
    ip: req.ip,
    "x-forwarded-for": req.headers.get("x-forwarded-for"),
    "x-real-ip": req.headers.get("x-real-ip"),
    "x-nf-client-connection-ip": req.headers.get("x-nf-client-connection-ip"),
    "cf-connecting-ip": req.headers.get("cf-connecting-ip"),
  });
}
