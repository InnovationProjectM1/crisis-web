import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Define public paths that don't require authentication
  const isPublicPath = path === "/signin";

  // Get the session token
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Redirect unauthenticated users to sign-in page
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  // Redirect authenticated users away from sign-in page
  if (token && isPublicPath) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

// Configure which routes to apply the middleware to
export const config = {
  matcher: [
    "/",
    "/signin",
    "/tweet-analysis",
    "/resource-map",
    "/trends",
    "/alerts",
    "/settings",
  ],
};
