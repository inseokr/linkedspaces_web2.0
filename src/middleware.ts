import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const BLOGGO_HOSTNAMES = [
  "bloggo.linkedspaces.com",
  // Add local dev variants if needed:
  "bloggo.localhost",
];

function isBloggoHost(hostname: string): boolean {
  return BLOGGO_HOSTNAMES.some(
    (h) => hostname === h || hostname.startsWith(h + ":"),
  );
}

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const { pathname } = request.nextUrl;

  if (isBloggoHost(hostname)) {
    console.log(`[middleware] bloggo host detected: ${hostname}${pathname}`);

    // Next.js API routes live at /api/*, not under /bloggo — avoid rewriting them.
    if (pathname.startsWith("/api")) {
      return NextResponse.next();
    }

    // If the path already starts with /bloggo (e.g. from a client-side Link like
    // <Link href="/bloggo/sign-in">), redirect to strip the prefix so the URL
    // stays clean: bloggo.localhost/bloggo/sign-in → bloggo.localhost/sign-in
    if (pathname.startsWith("/bloggo")) {
      const stripped = pathname.slice("/bloggo".length) || "/";
      console.log(
        `[middleware] stripping /bloggo prefix → redirect to ${stripped}`,
      );
      const url = request.nextUrl.clone();
      url.pathname = stripped;
      return NextResponse.redirect(url);
    }

    // Rewrite the clean subdomain URL to the internal /bloggo/* path.
    // e.g. bloggo.linkedspaces.com/          → /bloggo
    //      bloggo.linkedspaces.com/sign-in   → /bloggo/sign-in
    //      bloggo.linkedspaces.com/profile/x → /bloggo/profile/x
    const rewritten = `/bloggo${pathname === "/" ? "" : pathname}`;
    console.log(`[middleware] rewriting ${pathname} → ${rewritten}`);
    const url = request.nextUrl.clone();
    url.pathname = rewritten;

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-bloggo-domain", "true");

    return NextResponse.rewrite(url, {
      request: { headers: requestHeaders },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static  (static assets)
     * - _next/image   (image optimisation)
     * - favicon.ico
     */
    "/((?!_next/static|_next/image|favicon\\.ico).*)",
  ],
};
