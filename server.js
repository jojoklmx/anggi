const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const apiHandler = require('./api/index');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.appcache': 'text/cache-manifest; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function requestHandler(req, res) {
  const urlParts = (req.url || '/').split('?');
  const pathname = urlParts[0] || '/';

  // 1. Rute API
  if (pathname.startsWith('/api')) {
    return apiHandler(req, res);
  }

  // 2. Preflight CORS
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    return res.end();
  }

  // 3. Static Files: Cek di folder public/, lalu fallback ke root proyek
  const relPath = (pathname === '/' || pathname === '') ? 'index.html' : pathname.replace(/^\/+/, '');
  let filePath = path.join(PUBLIC_DIR, relPath);

  // Hindari serve file sensitif / backend
  const baseName = path.basename(filePath);
  if (baseName === 'server.js' || baseName === 'package.json' || baseName === 'vercel.json' || baseName === '.gitignore') {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('403 Forbidden');
  }

  if (!fs.existsSync(filePath)) {
    filePath = path.join(__dirname, relPath);
  }

  fs.stat(filePath, function (err, stats) {
    if (err || !stats.isFile()) {
      // Fallback ke index.html jika bukan file static tertentu
      const indexPath = fs.existsSync(path.join(PUBLIC_DIR, 'index.html'))
        ? path.join(PUBLIC_DIR, 'index.html')
        : path.join(__dirname, 'index.html');

      if (fs.existsSync(indexPath)) {
        res.writeHead(200, {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Access-Control-Allow-Origin': '*'
        });
        return fs.createReadStream(indexPath).pipe(res);
      }

      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('404 Not Found');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // Header khusus offline cache Safari iOS 9
    const headers = {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*'
    };

    if (ext === '.appcache') {
      headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
      headers['Content-Type'] = 'text/cache-manifest; charset=utf-8';
    } else if (ext === '.html') {
      headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    } else {
      headers['Cache-Control'] = 'public, max-age=3600';
    }

    res.writeHead(200, headers);
    fs.createReadStream(filePath).pipe(res);
  });
}

function startServer() {
  const server = http.createServer(requestHandler);
  server.listen(PORT, '0.0.0.0', function () {
    const ips = apiHandler.getLocalIPs();
    console.log('================================================================');
    console.log('  SISTEM STOK & KASIR 3 TOKO (PERABOT PLASTIK) - BERJALAN');
    console.log('  Kompatibel Safari iOS 9 (iPad Mini) & Vercel / GitHub Ready');
    console.log('================================================================');
    console.log('  [Lokal di Laptop/PC]:  http://localhost:' + PORT);
    if (ips.length > 0) {
      console.log('  [Akses dari iPad Mini (Wi-Fi)]:');
      ips.forEach(function (ip) {
        console.log('   -> http://' + ip + ':' + PORT);
      });
    }
    console.log('----------------------------------------------------------------');
    console.log('  Petunjuk iPad Mini iOS 9:');
    console.log('  1. Hubungkan iPad Mini ke Wi-Fi yang sama dengan PC.');
    console.log('  2. Buka Safari di iPad dan ketik salah satu alamat IP di atas.');
    console.log('  3. Tekan tombol Share di Safari -> "Add to Home Screen"');
    console.log('     agar aplikasi menjadi fullscreen seperti aplikasi kasir asli.');
    console.log('================================================================\n');
  });
  return server;
}

if (require.main === module) {
  startServer();
}

module.exports = requestHandler;
