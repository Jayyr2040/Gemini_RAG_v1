import app from "../server";

export default function handler(req: any, res: any) {
  // Normalize Vercel rewrite URL path if present
  if (req.query && req.query.__path) {
    const rawPath = Array.isArray(req.query.__path) ? req.query.__path.join("/") : req.query.__path;
    req.url = `/api/${rawPath.replace(/^\/+/, "")}`;
  } else if (req.headers && req.headers["x-matched-path"]) {
    const matchedPath = String(req.headers["x-matched-path"]);
    if (matchedPath.startsWith("/api/")) {
      req.url = matchedPath;
    }
  }

  return app(req, res);
}
