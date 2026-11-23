import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Sub-sites that live in this repo under src/app/<prefix>/* and are served
 * from their own subdomain. Requests for the subdomain are rewritten to the
 * internal /<prefix>/* path.
 */
type SubdomainApp = {
  /** Internal folder prefix, e.g. "/bloggo". */
  prefix: string;
  /** Request header set on rewritten requests, e.g. "x-bloggo-domain". */
  header: string;
  /**
   * Serve files in public/<prefix>/ (any path under the prefix with a file
   * extension) as-is instead of stripping the prefix.
   */
  servePublicAssets?: boolean;
  /** Extra paths served as-is from public/ (checked before any rewrite). */
  publicAssets?: RegExp;
  /**
   * Redirect /<prefix>/* on any other host (e.g. linkedspaces.com) to the
   * subdomain, so the sub-site isn't exposed on the main site.
   */
  canonical?: { prodOrigin: string; devHost: string };
};

const BLOGGO: SubdomainApp = {
  prefix: "/bloggo",
  header: "x-bloggo-domain",
  // Files that exist in public/ at their real paths. Rewriting them under
  // /bloggo would 404. /sitemap.xml is deliberately NOT here — it must fall
  // through to the rewrite so it reaches the generated /bloggo/sitemap.xml.
  publicAssets:
    /^\/(images|icons|gifs|videos)\/|^\/bloggo\/(screenshots\/|og-image\.png)|^\/(robots\.txt|manifest\.json|bloggo-icon\.png|reset-password\.html)$/,
};

const HYODO: SubdomainApp = {
  prefix: "/hyodo",
  header: "x-hyodo-domain",
  servePublicAssets: true,
  canonical: {
    prodOrigin: "https://hyodo.linkedspaces.com",
    devHost: "hyodo.localhost",
  },
};

const SUBDOMAIN_APPS: Record<string, SubdomainApp> = {
  "bloggo.linkedspaces.com": BLOGGO,
  "bloggo.localhost": BLOGGO,
  "hyodo.linkedspaces.com": HYODO,
  "hyodo.localhost": HYODO,
};

/** Matches /prefix and /prefix/..., but not /prefixfoo. */
function hasPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(prefix + "/");
}

function findApp(host: string): SubdomainApp | undefined {
  const hostname = host.split(":")[0].toLowerCase();
  return SUBDOMAIN_APPS[hostname];
}

function handleSubdomainApp(request: NextRequest, app: SubdomainApp) {
  const { pathname } = request.nextUrl;
  const { prefix } = app;

  // Next.js API routes live at /api/*, not under the app folder.
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  if (app.publicAssets?.test(pathname)) {
    return NextResponse.next();
  }

  // Static files from public/<prefix>/ (e.g. /hyodo/AppIcon.png).
  if (
    app.servePublicAssets &&
    hasPrefix(pathname, prefix) &&
    /\.[a-z0-9]+$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  // If the path already starts with the prefix (e.g. from a client-side Link
  // like <Link href="/bloggo/sign-in">), redirect to strip it so the URL stays
  // clean: bloggo.localhost/bloggo/sign-in → bloggo.localhost/sign-in
  //
  // Bloggo historically used startsWith(prefix) (no trailing slash check);
  // keep that exact behavior for it.
  const prefixed =
    app === BLOGGO ? pathname.startsWith(prefix) : hasPrefix(pathname, prefix);
  if (prefixed) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(prefix.length) || "/";
    return NextResponse.redirect(url);
  }

  // Rewrite the clean subdomain URL to the internal /<prefix>/* path.
  // e.g. hyodo.linkedspaces.com/        → /hyodo
  //      hyodo.linkedspaces.com/privacy → /hyodo/privacy
  const url = request.nextUrl.clone();
  url.pathname = `${prefix}${pathname === "/" ? "" : pathname}`;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(app.header, "true");

  return NextResponse.rewrite(url, {
    request: { headers: requestHeaders },
  });
}

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const app = findApp(host);

  if (app) {
    return handleSubdomainApp(request, app);
  }

  // Any other host (linkedspaces.com, *.herokuapp.com, localhost): send
  // /hyodo/* to its own subdomain instead of serving it here.
  const { pathname, search } = request.nextUrl;
  for (const candidate of [HYODO]) {
    if (!candidate.canonical || !hasPrefix(pathname, candidate.prefix)) {
      continue;
    }
    const isAsset = /\.[a-z0-9]+$/i.test(pathname);
    // Keep asset paths as-is (they're served from public/<prefix>/ on the
    // subdomain too); strip the prefix from page paths.
    const target = isAsset
      ? pathname
      : pathname.slice(candidate.prefix.length) || "/";

    const hostname = host.split(":")[0];
    const port = host.split(":")[1];
    const isLocal = hostname === "localhost" || hostname === "127.0.0.1";
    const origin = isLocal
      ? `http://${candidate.canonical.devHost}${port ? `:${port}` : ""}`
      : candidate.canonical.prodOrigin;

    return NextResponse.redirect(`${origin}${target}${search}`);
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
