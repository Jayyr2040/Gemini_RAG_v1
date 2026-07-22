import app from "../server";

export default function handler(req: any, res: any) {
  let url = req.url || "/";

  if (req.query && req.query.path) {
    const subpath = Array.isArray(req.query.path) ? req.query.path.join("/") : req.query.path;
    url = `/api/${subpath.replace(/^\/+/, "")}`;
  } else if (req.headers && req.headers["x-matched-path"]) {
    url = String(req.headers["x-matched-path"]);
  } else if (req.headers && req.headers["x-invoke-path"]) {
    url = String(req.headers["x-invoke-path"]);
  }

  if (!url.startsWith("/api")) {
    url = `/api${url.startsWith("/") ? "" : "/"}${url}`;
  }

  req.url = url;
  req.originalUrl = url;

  return app(req, res);
}

