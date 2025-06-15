const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");

const PORT = 3000;
const mapDataPath = path.join(__dirname, "map", "mapData.json");
const mimeTypes = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
};

function serveStaticFile(filePath, res) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, {
      "Content-Type": mimeTypes[ext] || "application/octet-stream",
    });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  // API: GET wall data
  if (req.method === "GET" && parsedUrl.pathname === "/map/wallData") {
    fs.readFile(mapDataPath, "utf8", (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end("Error reading wall data");
        return;
      }
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(data);
    });
    return;
  }
  // API: POST wall data
  if (req.method === "POST" && parsedUrl.pathname === "/map/wallData") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      try {
        fs.writeFile(
          mapDataPath,
          JSON.stringify(JSON.parse(body), null, 2),
          (err) => {
            if (err) {
              res.writeHead(500);
              res.end("Error saving wall data");
              return;
            }
            res.writeHead(200);
            res.end("OK");
          },
        );
      } catch (e) {
        res.writeHead(400);
        res.end("Invalid JSON");
      }
    });
    return;
  }
  // Serve static files
  let safePath = path
    .normalize(decodeURIComponent(parsedUrl.pathname))
    .replace(/^(\.\.[\/\\])+/, "");
  let filePath = path.join(__dirname, safePath);
  // If root, serve index.html
  if (
    fs.statSync(__dirname).isDirectory() &&
    (parsedUrl.pathname === "/" || parsedUrl.pathname === "")
  ) {
    filePath = path.join(__dirname, "index.html");
  }
  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isFile()) {
      serveStaticFile(filePath, res);
    } else {
      res.writeHead(404);
      res.end("Not found");
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
