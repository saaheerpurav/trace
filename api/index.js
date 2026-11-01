import app from "../server/index.js";

export default function handler(request, response) {
  const route = Array.isArray(request.query.path)
    ? request.query.path.join("/")
    : String(request.query.path || "");
  request.url = `/api/${route}`;
  return app(request, response);
}
