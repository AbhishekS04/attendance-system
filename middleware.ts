import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get("attendance_session")?.value
  const { pathname } = request.nextUrl

  console.log(`Middleware: Processing request for ${pathname}`);
  console.log(`Middleware: Session token present: ${!!sessionToken}`);

  // Public routes that don't require authentication
  const publicRoutes = ["/"]

  // API routes that don't require authentication
  const publicApiRoutes = ["/api/auth/login", "/api/auth/register", "/api/students/save", "/api/attendance/student-stats"]

  // Check if it's a public route
  if (publicRoutes.includes(pathname) || publicApiRoutes.includes(pathname)) {
    console.log(`Middleware: Allowing public route: ${pathname}`);
    return NextResponse.next()
  }

  console.log(`Middleware: Checking protected route: ${pathname}`);

  // Check if user has session for protected routes
  if (
    !sessionToken &&
    (pathname.startsWith("/admin") ||
      pathname.startsWith("/cr") ||
      pathname.startsWith("/teacher") ||
      pathname.startsWith("/student"))
  ) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // Check if user has session for API routes
  if (!sessionToken && pathname.startsWith("/api") && !publicApiRoutes.includes(pathname)) {
    console.log(`Middleware: Unauthorized API access: ${pathname}`);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
