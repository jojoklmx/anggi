const fs = require('fs');
const path = require('path');
const os = require('os');
const https = require('https');

const IS_VERCEL = Boolean(process.env.VERCEL || process.env.NOW_REGION);
const DATA_DIR = IS_VERCEL ? '/tmp' : path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {}
}

const INITIAL_DB = {
  settings: {
    businessName: 'Berkah Plastik & Perabot Keluarga',
    stores: [
      { id: 'toko1', name: 'Toko 1 (Pusat)' },
      { id: 'toko2', name: 'Toko 2 (Cabang Pasar)' },
      { id: 'toko3', name: 'Toko 3 (Cabang Ruko)' }
    ],
    prefixRules: [
      { prefix: 'EMB', category: 'Ember & Baskom' },
      { prefix: 'BSK', category: 'Ember & Baskom' },
      { prefix: 'KRS', category: 'Kursi & Meja' },
      { prefix: 'MJA', category: 'Kursi & Meja' },
      { prefix: 'LMR', category: 'Lemari & Laci' },
      { prefix: 'LCI', category: 'Lemari & Laci' },
      { prefix: 'KTK', category: 'Kontainer & Box' },
      { prefix: 'BOX', category: 'Kontainer & Box' },
      { prefix: 'RAK', category: 'Rak & Keranjang' },
      { prefix: 'KRJ', category: 'Rak & Keranjang' },
      { prefix: 'BTL', category: 'Botol & Termos' },
      { prefix: 'TRM', category: 'Botol & Termos' },
      { prefix: 'DPR', category: 'Peralatan Dapur' },
      { prefix: 'KBR', category: 'Alat Kebersihan' },
      { prefix: 'SPU', category: 'Alat Kebersihan' },
      { prefix: 'PRT', category: 'Kebutuhan Keluarga' }
    ],
    suppliers: [
      'Distributor Lion Star',
      'Distributor Napolly',
      'Agen Shinpo Plastik',
      'Grosir Olymplast',
      'Supplier Perabot Umum'
    ],
    cloudSyncUrl: process.env.CLOUD_SYNC_URL || ''
  },
  products: [
    {
      id: 'p1',
      code: 'EMB-001',
      name: 'Ember Cor Hitam 18 Liter Anti Pecah',
      category: 'Ember & Baskom',
      brand: 'Shinpo',
      unit: 'Pcs',
      costPrice: 12000,
      sellPrice: 18000,
      wholesalePrice: 15500,
      minStock: 15,
      stock: { toko1: 45, toko2: 20, toko3: 8 },
      photo: '',
      updatedAt: '2026-10-27T10:00:00.000Z'
    },
    {
      id: 'p2',
      code: 'EMB-002',
      name: 'Ember Tutup Warna 6 Galon (24L)',
      category: 'Ember & Baskom',
      brand: 'Lion Star',
      unit: 'Pcs',
      costPrice: 38000,
      sellPrice: 52000,
      wholesalePrice: 46000,
      minStock: 10,
      stock: { toko1: 18, toko2: 12, toko3: 14 },
      photo: '',
      updatedAt: '2026-10-27T10:00:00.000Z'
    },
    {
      id: 'p3',
      code: 'KRS-001',
      name: 'Kursi Bakso Plastik Motif Anyaman Rotan',
      category: 'Kursi & Meja',
      brand: 'Napolly',
      unit: 'Pcs',
      costPrice: 32000,
      sellPrice: 45000,
      wholesalePrice: 39000,
      minStock: 12,
      stock: { toko1: 30, toko2: 10, toko3: 6 },
      photo: '',
      updatedAt: '2026-10-27T10:00:00.000Z'
    },
    {
      id: 'p4',
      code: 'LMR-001',
      name: 'Lemari Plastik 4 Susun Kunci + Cermin',
      category: 'Lemari & Laci',
      brand: 'Napolly',
      unit: 'Unit',
      costPrice: 420000,
      sellPrice: 550000,
      wholesalePrice: 495000,
      minStock: 3,
      stock: { toko1: 6, toko2: 2, toko3: 4 },
      photo: '',
      updatedAt: '2026-10-27T10:00:00.000Z'
    },
    {
      id: 'p5',
      code: 'BOX-001',
      name: 'Kontainer Box Roda 60 Liter Transparan',
      category: 'Kontainer & Box',
      brand: 'Shinpo',
      unit: 'Pcs',
      costPrice: 68000,
      sellPrice: 90000,
      wholesalePrice: 80000,
      minStock: 8,
      stock: { toko1: 15, toko2: 5, toko3: 9 },
      photo: '',
      updatedAt: '2026-10-27T10:00:00.000Z'
    },
    {
      id: 'p6',
      code: 'RAK-001',
      name: 'Rak Piring Plastik 3 Susun + Tutup',
      category: 'Rak & Keranjang',
      brand: 'Olymplast',
      unit: 'Pcs',
      costPrice: 85000,
      sellPrice: 115000,
      wholesalePrice: 102000,
      minStock: 5,
      stock: { toko1: 8, toko2: 6, toko3: 3 },
      photo: '',
      updatedAt: '2026-10-27T10:00:00.000Z'
    },
    {
      id: 'p7',
      code: 'KBR-001',
      name: 'Sapu Ijuk & Pel Lantai Putar Set',
      category: 'Alat Kebersihan',
      brand: 'Lion Star',
      unit: 'Set',
      costPrice: 95000,
      sellPrice: 130000,
      wholesalePrice: 115000,
      minStock: 6,
      stock: { toko1: 12, toko2: 4, toko3: 7 },
      photo: '',
      updatedAt: '2026-10-27T10:00:00.000Z'
    }
  ],
  sales: [],
  transactions: [
    {
      id: 'tx1',
      type: 'IN',
      date: '2026-10-27T09:30:00.000Z',
      code: 'EMB-001',
      productName: 'Ember Cor Hitam 18 Liter Anti Pecah',
      category: 'Ember & Baskom',
      supplier: 'Agen Shinpo Plastik',
      invoiceNo: 'SJ-2026-001',
      targetStore: 'toko1',
      qty: 25,
      note: 'Stok awal dari supplier'
    }
  ]
};

function getBundledDbPath() {
  const candidates = [
    path.join(process.cwd(), 'data', 'database.json'),
    path.join(__dirname, '..', 'data', 'database.json'),
    path.join(__dirname, 'data', 'database.json')
  ];
  for (let i = 0; i < candidates.length; i++) {
    if (fs.existsSync(candidates[i])) {
      return candidates[i];
    }
  }
  return null;
}

function loadDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const bundledPath = getBundledDbPath();
      if (bundledPath && fs.existsSync(bundledPath)) {
        const bundledRaw = fs.readFileSync(bundledPath, 'utf8');
        try {
          fs.writeFileSync(DB_FILE, bundledRaw, 'utf8');
        } catch (e) {}
        const parsed = JSON.parse(bundledRaw);
        if (!parsed.sales) parsed.sales = [];
        if (!parsed.transactions) parsed.transactions = [];
        return parsed;
      }
      try {
        fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DB, null, 2), 'utf8');
      } catch (e) {}
      return INITIAL_DB;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (!parsed.sales) parsed.sales = [];
    if (!parsed.transactions) parsed.transactions = [];
    return parsed;
  } catch (err) {
    return INITIAL_DB;
  }
}

function saveDB(data) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {}

  // 1. Mirror otomatis ke Firebase / Cloud Realtime Database jika diisi
  const syncUrl = (data && data.settings && data.settings.cloudSyncUrl) || process.env.CLOUD_SYNC_URL;
  if (syncUrl && syncUrl.indexOf('https://') === 0) {
    try {
      const clean = syncUrl.replace(/\/+$/, '');
      const target = clean.indexOf('.json') !== -1 ? clean : (clean + '/stok_perabot_db.json');
      const u = new URL(target);
      const bodyStr = JSON.stringify(data);
      const req = https.request({
        hostname: u.hostname,
        path: u.pathname + u.search,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(bodyStr)
        }
      }, function () {});
      req.on('error', function () {});
      req.write(bodyStr);
      req.end();
    } catch (e) {}
  }

  // 2. Mirror otomatis langsung ke file data/database.json di GitHub Repository (jika GITHUB_TOKEN & GITHUB_REPO diset di Vercel)
  const ghToken = process.env.GITHUB_TOKEN;
  const ghRepo = process.env.GITHUB_REPO; // format: "username/nama-repo"
  const ghBranch = process.env.GITHUB_BRANCH || 'main';
  if (ghToken && ghRepo) {
    saveToGitHubRepo(ghToken, ghRepo, ghBranch, data);
  }
}

function saveToGitHubRepo(token, repo, branch, data) {
  const apiPath = '/repos/' + repo + '/contents/data/database.json';
  const getReq = https.request({
    hostname: 'api.github.com',
    path: apiPath + '?ref=' + encodeURIComponent(branch),
    method: 'GET',
    headers: {
      'User-Agent': 'Stok-Perabot-App',
      'Authorization': 'Bearer ' + token,
      'Accept': 'application/vnd.github+json'
    }
  }, function (res) {
    let raw = '';
    res.on('data', function (c) { raw += c; });
    res.on('end', function () {
      let sha = undefined;
      try {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.sha) sha = parsed.sha;
      } catch (e) {}

      const contentBase64 = Buffer.from(JSON.stringify(data, null, 2), 'utf8').toString('base64');
      const putPayload = JSON.stringify({
        message: 'Update data stok & penjualan otomatis',
        content: contentBase64,
        branch: branch,
        sha: sha
      });

      const putReq = https.request({
        hostname: 'api.github.com',
        path: apiPath,
        method: 'PUT',
        headers: {
          'User-Agent': 'Stok-Perabot-App',
          'Authorization': 'Bearer ' + token,
          'Accept': 'application/vnd.github+json',
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(putPayload)
        }
      }, function () {});
      putReq.on('error', function () {});
      putReq.write(putPayload);
      putReq.end();
    });
  });
  getReq.on('error', function () {});
  getReq.end();
}

function getLocalIPs() {
  const interfaces = os.networkInterfaces();
  const ips = [];
  Object.keys(interfaces).forEach(function (ifname) {
    (interfaces[ifname] || []).forEach(function (iface) {
      if (iface.family === 'IPv4' && !iface.internal) {
        ips.push(iface.address);
      }
    });
  });
  return ips;
}

function sendJSON(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(body);
}

function parseBody(req, callback) {
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'object') {
      return callback(null, req.body);
    }
    if (typeof req.body === 'string') {
      try {
        return callback(null, JSON.parse(req.body));
      } catch (e) {
        return callback(e);
      }
    }
  }

  // Jika stream sudah selesai atau sudah dibaca sebelumnya di lingkungan Vercel
  if (req.complete || req.readableEnded) {
    return callback(null, {});
  }

  let body = '';
  let finished = false;

  req.on('data', function (chunk) {
    body += chunk.toString();
    if (body.length > 10 * 1024 * 1024) {
      if (req.destroy) req.destroy();
      else if (req.connection && req.connection.destroy) req.connection.destroy();
    }
  });

  req.on('end', function () {
    if (finished) return;
    finished = true;
    try {
      const parsed = body ? JSON.parse(body) : {};
      callback(null, parsed);
    } catch (e) {
      callback(e);
    }
  });

  req.on('error', function (err) {
    if (finished) return;
    finished = true;
    callback(err);
  });
}

function handleApiRequest(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    return res.end();
  }

  const urlParts = (req.url || '').split('?');
  let pathname = urlParts[0] || '/';
  if (!pathname.startsWith('/')) {
    pathname = '/' + pathname;
  }
  // Normalisasi: jika dipanggil langsung sebagai /state atau /sale oleh Vercel
  if (!pathname.startsWith('/api')) {
    pathname = '/api' + (pathname === '/' ? '' : pathname);
  }
  if (pathname.length > 4 && pathname.endsWith('/')) {
    pathname = pathname.slice(0, -1);
  }

  // Root API status
  if (pathname === '/api') {
    return sendJSON(res, 200, {
      ok: true,
      service: 'Stok Perabot Plastik 3 Toko API',
      status: 'online',
      isVercel: IS_VERCEL,
      time: new Date().toISOString()
    });
  }

  if (pathname === '/api/state' && req.method === 'GET') {
    const db = loadDB();
    return sendJSON(res, 200, {
      ok: true,
      serverTime: new Date().toISOString(),
      isVercel: IS_VERCEL,
      localIPs: getLocalIPs(),
      port: process.env.PORT || 3000,
      db: db
    });
  }

  if (pathname === '/api/sync' && req.method === 'POST') {
    return parseBody(req, function (err, body) {
      if (err || !body || !body.db) {
        return sendJSON(res, 400, { ok: false, error: 'Data tidak valid' });
      }
      saveDB(body.db);
      return sendJSON(res, 200, { ok: true, db: body.db });
    });
  }

  // FITUR PENJUALAN / KASIR (Otomatis Mengurangi Stok Toko 1 / 2 / 3)
  if (pathname === '/api/sale' && req.method === 'POST') {
    return parseBody(req, function (err, body) {
      if (err || !body || !Array.isArray(body.items) || body.items.length === 0) {
        return sendJSON(res, 400, { ok: false, error: 'Keranjang penjualan kosong' });
      }
      const db = loadDB();
      const store = body.store || 'toko1';
      const priceMode = body.priceMode || 'ECER'; // 'ECER' atau 'GROSIR'
      const customerName = body.customerName || 'Pelanggan Umum';
      const paymentAmount = Number(body.paymentAmount) || 0;
      const now = new Date().toISOString();
      const receiptNo = body.receiptNo || ('INV-' + Date.now().toString().slice(-6));

      let totalRevenue = 0;
      let totalCost = 0;
      const processedItems = [];

      for (let i = 0; i < body.items.length; i++) {
        const item = body.items[i];
        const code = String(item.code || '').trim().toUpperCase();
        const qty = parseInt(item.qty, 10) || 0;
        if (!code || qty <= 0) continue;

        let product = null;
        for (let j = 0; j < db.products.length; j++) {
          if (db.products[j].code.toUpperCase() === code) {
            product = db.products[j];
            break;
          }
        }
        if (!product) continue;

        // Kurangi stok otomatis dari toko yang dipilih
        const currentStoreStock = (product.stock && product.stock[store]) ? parseInt(product.stock[store], 10) : 0;
        product.stock[store] = Math.max(0, currentStoreStock - qty);
        product.updatedAt = now;

        const sellPrice = Number(item.price !== undefined ? item.price : product.sellPrice) || 0;
        const costPrice = Number(product.costPrice) || 0;
        const subtotal = sellPrice * qty;
        const subCost = costPrice * qty;

        totalRevenue += subtotal;
        totalCost += subCost;

        processedItems.push({
          code: product.code,
          name: product.name,
          unit: product.unit || 'Pcs',
          qty: qty,
          price: sellPrice,
          costPrice: costPrice,
          subtotal: subtotal
        });

        db.transactions.unshift({
          id: 'tx_' + Date.now() + '_' + i,
          type: 'SALE',
          date: now,
          code: product.code,
          productName: product.name,
          category: product.category,
          fromStore: store,
          qty: qty,
          price: sellPrice,
          subtotal: subtotal,
          invoiceNo: receiptNo,
          note: 'Penjualan ' + priceMode + ' (' + customerName + ')'
        });
      }

      const saleRecord = {
        id: 'sale_' + Date.now(),
        receiptNo: receiptNo,
        date: now,
        store: store,
        priceMode: priceMode,
        customerName: customerName,
        items: processedItems,
        totalRevenue: totalRevenue,
        totalCost: totalCost,
        profit: totalRevenue - totalCost,
        paymentAmount: paymentAmount,
        changeAmount: Math.max(0, paymentAmount - totalRevenue)
      };

      if (!db.sales) db.sales = [];
      db.sales.unshift(saleRecord);

      saveDB(db);
      return sendJSON(res, 200, { ok: true, sale: saleRecord, db: db });
    });
  }

  // Barang Masuk dari Supplier (Alur 4, 5, 7)
  if (pathname === '/api/stock-in' && req.method === 'POST') {
    return parseBody(req, function (err, body) {
      if (err) return sendJSON(res, 400, { ok: false, error: 'Format JSON salah' });
      const db = loadDB();
      const code = String(body.code || '').trim().toUpperCase();
      if (!code) return sendJSON(res, 400, { ok: false, error: 'Kode barang wajib diisi' });

      const q1 = parseInt(body.qtyToko1, 10) || 0;
      const q2 = parseInt(body.qtyToko2, 10) || 0;
      const q3 = parseInt(body.qtyToko3, 10) || 0;
      const totalIn = q1 + q2 + q3;

      if (totalIn <= 0 && !body.allowZeroQty) {
        return sendJSON(res, 400, { ok: false, error: 'Jumlah barang masuk ke Toko 1/2/3 harus lebih dari 0' });
      }

      let product = null;
      for (let i = 0; i < db.products.length; i++) {
        if (db.products[i].code.toUpperCase() === code) {
          product = db.products[i];
          break;
        }
      }

      const now = new Date().toISOString();
      if (!product) {
        product = {
          id: 'p_' + Date.now(),
          code: code,
          name: body.name || ('Produk ' + code),
          category: body.category || 'Kebutuhan Keluarga',
          brand: body.brand || '-',
          unit: body.unit || 'Pcs',
          costPrice: Number(body.costPrice) || 0,
          sellPrice: Number(body.sellPrice) || 0,
          wholesalePrice: Number(body.wholesalePrice) || 0,
          minStock: Number(body.minStock) || 5,
          stock: { toko1: 0, toko2: 0, toko3: 0 },
          photo: body.photo || '',
          updatedAt: now
        };
        db.products.unshift(product);
      } else {
        if (body.name) product.name = body.name;
        if (body.category) product.category = body.category;
        if (body.brand) product.brand = body.brand;
        if (body.unit) product.unit = body.unit;
        if (body.costPrice !== undefined && body.costPrice !== '') product.costPrice = Number(body.costPrice);
        if (body.sellPrice !== undefined && body.sellPrice !== '') product.sellPrice = Number(body.sellPrice);
        if (body.wholesalePrice !== undefined && body.wholesalePrice !== '') product.wholesalePrice = Number(body.wholesalePrice);
        if (body.minStock !== undefined && body.minStock !== '') product.minStock = Number(body.minStock);
        if (body.photo) product.photo = body.photo;
        product.updatedAt = now;
      }

      product.stock.toko1 = (product.stock.toko1 || 0) + q1;
      product.stock.toko2 = (product.stock.toko2 || 0) + q2;
      product.stock.toko3 = (product.stock.toko3 || 0) + q3;

      if (body.supplier && db.settings.suppliers.indexOf(body.supplier) === -1) {
        db.settings.suppliers.push(body.supplier);
      }

      const storeBreakdown = [];
      if (q1 > 0) storeBreakdown.push({ store: 'toko1', qty: q1 });
      if (q2 > 0) storeBreakdown.push({ store: 'toko2', qty: q2 });
      if (q3 > 0) storeBreakdown.push({ store: 'toko3', qty: q3 });

      for (let j = 0; j < storeBreakdown.length; j++) {
        db.transactions.unshift({
          id: 'tx_' + Date.now() + '_' + j,
          type: 'IN',
          date: now,
          code: product.code,
          productName: product.name,
          category: product.category,
          supplier: body.supplier || 'Supplier Umum',
          invoiceNo: body.invoiceNo || '-',
          targetStore: storeBreakdown[j].store,
          qty: storeBreakdown[j].qty,
          note: body.note || 'Barang masuk dari supplier'
        });
      }

      saveDB(db);
      return sendJSON(res, 200, { ok: true, product: product, db: db });
    });
  }

  // Barang Keluar / Pindah Antar Toko / Tombol Cepat (+ / -)
  if (pathname === '/api/stock-move' && req.method === 'POST') {
    return parseBody(req, function (err, body) {
      if (err) return sendJSON(res, 400, { ok: false, error: 'Format JSON salah' });
      const db = loadDB();
      const code = String(body.code || '').trim().toUpperCase();
      let product = null;
      for (let i = 0; i < db.products.length; i++) {
        if (db.products[i].code.toUpperCase() === code) {
          product = db.products[i];
          break;
        }
      }
      if (!product) return sendJSON(res, 404, { ok: false, error: 'Barang tidak ditemukan' });

      const type = body.type;
      const qty = parseInt(body.qty, 10) || 0;
      const now = new Date().toISOString();

      if (type === 'OUT') {
        const store = body.fromStore || 'toko1';
        if (qty <= 0) return sendJSON(res, 400, { ok: false, error: 'Jumlah keluar harus > 0' });
        product.stock[store] = Math.max(0, (product.stock[store] || 0) - qty);
        product.updatedAt = now;
        db.transactions.unshift({
          id: 'tx_' + Date.now(),
          type: 'OUT',
          date: now,
          code: product.code,
          productName: product.name,
          category: product.category,
          fromStore: store,
          qty: qty,
          note: body.note || 'Barang Keluar / Rusak'
        });
      } else if (type === 'TRANSFER') {
        const fromStore = body.fromStore || 'toko1';
        const targetStore = body.targetStore || 'toko2';
        if (fromStore === targetStore) {
          return sendJSON(res, 400, { ok: false, error: 'Toko asal dan tujuan tidak boleh sama' });
        }
        if (qty <= 0) return sendJSON(res, 400, { ok: false, error: 'Jumlah mutasi harus > 0' });
        if ((product.stock[fromStore] || 0) < qty) {
          return sendJSON(res, 400, { ok: false, error: 'Stok di toko asal tidak mencukupi' });
        }
        product.stock[fromStore] -= qty;
        product.stock[targetStore] = (product.stock[targetStore] || 0) + qty;
        product.updatedAt = now;
        db.transactions.unshift({
          id: 'tx_' + Date.now(),
          type: 'TRANSFER',
          date: now,
          code: product.code,
          productName: product.name,
          category: product.category,
          fromStore: fromStore,
          targetStore: targetStore,
          qty: qty,
          note: body.note || 'Pindah stok antar toko'
        });
      } else if (type === 'QUICK_DELTA') {
        const store = body.store || 'toko1';
        const delta = parseInt(body.delta, 10) || 0;
        const nextVal = Math.max(0, (product.stock[store] || 0) + delta);
        const actualDelta = nextVal - (product.stock[store] || 0);
        product.stock[store] = nextVal;
        product.updatedAt = now;
        if (actualDelta !== 0) {
          db.transactions.unshift({
            id: 'tx_' + Date.now(),
            type: actualDelta > 0 ? 'IN' : 'OUT',
            date: now,
            code: product.code,
            productName: product.name,
            category: product.category,
            fromStore: actualDelta < 0 ? store : undefined,
            targetStore: actualDelta > 0 ? store : undefined,
            qty: Math.abs(actualDelta),
            note: body.note || (actualDelta > 0 ? 'Koreksi tambah cepat (+1)' : 'Koreksi kurang / terjual cepat (-1)')
          });
        }
      }

      saveDB(db);
      return sendJSON(res, 200, { ok: true, product: product, db: db });
    });
  }

  if (pathname === '/api/product-delete' && req.method === 'POST') {
    return parseBody(req, function (err, body) {
      if (err || !body.code) return sendJSON(res, 400, { ok: false, error: 'Kode tidak valid' });
      const db = loadDB();
      db.products = db.products.filter(function (p) {
        return p.code.toUpperCase() !== String(body.code).toUpperCase();
      });
      saveDB(db);
      return sendJSON(res, 200, { ok: true, db: db });
    });
  }

  if (pathname === '/api/settings' && req.method === 'POST') {
    return parseBody(req, function (err, body) {
      if (err) return sendJSON(res, 400, { ok: false, error: 'Format salah' });
      const db = loadDB();
      if (body.businessName) db.settings.businessName = body.businessName;
      if (body.stores) db.settings.stores = body.stores;
      if (body.prefixRules) db.settings.prefixRules = body.prefixRules;
      if (body.cloudSyncUrl !== undefined) db.settings.cloudSyncUrl = body.cloudSyncUrl;
      saveDB(db);
      return sendJSON(res, 200, { ok: true, db: db });
    });
  }

  return false;
}

// Export untuk Vercel Serverless Function sekaligus modul untuk server.js lokal
module.exports = function (req, res) {
  const handled = handleApiRequest(req, res);
  if (handled === false) {
    sendJSON(res, 404, { ok: false, error: 'Endpoint API tidak ditemukan: ' + (req.url || '') });
  }
};
module.exports.handleApiRequest = handleApiRequest;
module.exports.getLocalIPs = getLocalIPs;
