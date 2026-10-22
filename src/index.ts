import { join, normalize, extname } from "node:path";

const NAME = "Violeta";
const MIN_PORT = 3000;
const MAX_PORT = 3600;
const PUBLIC_DIR = normalize(join(import.meta.dir, "..", "public"));

const TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

async function serveFile(path: string): Promise<Response | null> {
  const file = Bun.file(path);
  if (!(await file.exists())) return null;
  return new Response(file, {
    headers: {
      "Content-Type": TYPES[extname(path).toLowerCase()] ?? "application/octet-stream",
      // Pas d'étape de build : on sert toujours la dernière version des modules.
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  if (url.pathname === "/api/health") {
    return Response.json({ ok: true, app: NAME, date: new Date().toISOString() });
  }
  if (req.method !== "GET" && req.method !== "HEAD") {
    return new Response("Méthode non autorisée", { status: 405 });
  }

  let pathname: string;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    return new Response("Requête invalide", { status: 400 });
  }
  if (pathname.endsWith("/")) pathname += "index.html";
  const target = normalize(join(PUBLIC_DIR, pathname));
  if (!target.startsWith(PUBLIC_DIR)) return new Response("Interdit", { status: 403 });

  const direct = await serveFile(target);
  if (direct) return direct;

  // Application monopage : toute route inconnue renvoie la coquille HTML.
  const shell = await serveFile(join(PUBLIC_DIR, "index.html"));
  if (shell) return new Response(shell.body, { status: 200, headers: shell.headers });
  return new Response("Application indisponible", { status: 500 });
}

function findAvailablePort(start: number, end: number) {
  for (let port = start; port <= end; port++) {
    try {
      return Bun.serve({ port, fetch: handler, development: true });
    } catch {
      console.log(`  port ${port} occupé — essai de ${port + 1}…`);
    }
  }
  return null;
}

const server = findAvailablePort(MIN_PORT, MAX_PORT);
if (!server) {
  console.error(`Aucun port libre entre ${MIN_PORT} et ${MAX_PORT} — arrêt.`);
  process.exit(1);
}
console.log(`🟣 ${NAME} — espagnol pour francophones`);
console.log(`   http://localhost:${server.port}`);
