import { NextResponse } from "next/server";
/** Minimal admin guard: send header x-admin-password. Replace with NextAuth/Clerk before launch. */
export function requireAdmin(req: Request) {
  if (req.headers.get("x-admin-password") !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return null;
}
