/* ==========================================================================
   SISTEM STOK & KASIR 3 TOKO PERABOT PLASTIK & KEBUTUHAN KELUARGA
   100% Kompatibel Safari iOS 9 (iPad Mini), Multi-Perangkat, & Vercel Cloud
   ========================================================================== */

var LOCAL_STORAGE_KEY = 'STOK_PERABOT_DB_V1';
var LOCAL_DIRTY_KEY = 'STOK_PERABOT_DIRTY_V1';
var currentTab = 'rekap';
var activeStoreFilter = 'all'; // 'all', 'toko1', 'toko2', 'toko3'
var activeCatalogCategory = 'ALL';
var currentPhotoDataUrl = '';
var isServerOnline = false;
var posCart = [];

var DEFAULT_CATEGORIES = [
  'Ember & Baskom',
  'Kursi & Meja',
  'Lemari & Laci',
  'Kontainer & Box',
  'Rak & Keranjang',
  'Botol & Termos',
  'Peralatan Dapur',
  'Alat Kebersihan',
  'Kebutuhan Keluarga'
];

var KEYWORD_CATEGORY_MAP = [
  { keywords: ['ember', 'baskom', 'gayung', 'bak ', 'timba', 'tong air'], category: 'Ember & Baskom', prefix: 'EMB' },
  { keywords: ['kursi', 'meja', 'bangku', 'stool'], category: 'Kursi & Meja', prefix: 'KRS' },
  { keywords: ['lemari', 'laci', 'kabinet', 'drawer'], category: 'Lemari & Laci', prefix: 'LMR' },
  { keywords: ['box', 'kontainer', 'container', 'kotak', 'thinwall'], category: 'Kontainer & Box', prefix: 'BOX' },
  { keywords: ['rak', 'keranjang', 'wakul', 'tray'], category: 'Rak & Keranjang', prefix: 'RAK' },
  { keywords: ['botol', 'termos', 'tumbler', 'teko', 'jerigen', 'galon'], category: 'Botol & Termos', prefix: 'BTL' },
  { keywords: ['piring', 'gelas', 'mangkok', 'sendok', 'toples', 'tudung', 'rantang', 'dapur', 'cetakan', 'saringan'], category: 'Peralatan Dapur', prefix: 'DPR' },
  { keywords: ['sapu', 'pel', 'pengki', 'sikat', 'sampah', 'wiper', 'kemoceng'], category: 'Alat Kebersihan', prefix: 'KBR' },
  { keywords: ['hanger', 'gantungan', 'jemuran', 'tikar', 'karpet'], category: 'Kebutuhan Keluarga', prefix: 'PRT' }
];

var appDB = {
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
      'Grosir Olymplast'
    ],
    cloudSyncUrl: ''
  },
  products: [],
  sales: [],
  transactions: []
};

/* ---------- UTILITAS FORMAT & DOM ---------- */
function byId(id) {
  return document.getElementById(id);
}

function formatRupiah(num) {
  var n = parseInt(num, 10) || 0;
  var s = Math.abs(n).toString();
  var out = '';
  var count = 0;
  for (var i = s.length - 1; i >= 0; i--) {
    out = s.charAt(i) + out;
    count++;
    if (count % 3 === 0 && i !== 0) {
      out = '.' + out;
    }
  }
  return (n < 0 ? '-Rp ' : 'Rp ') + out;
}

function formatDateId(isoStr) {
  if (!isoStr) return '-';
  try {
    var d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr;
    var pad = function (v) { return v < 10 ? '0' + v : '' + v; };
    return pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + d.getFullYear() + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  } catch (e) {
    return isoStr;
  }
}

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function showToast(msg) {
  var box = byId('toastBox');
  if (!box) return;
  box.innerHTML = escapeHtml(msg);
  box.style.display = 'block';
  if (window._toastTimer) clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(function () {
    box.style.display = 'none';
  }, 2800);
}

function getStoreName(storeId) {
  var stores = (appDB.settings && appDB.settings.stores) ? appDB.settings.stores : [];
  for (var i = 0; i < stores.length; i++) {
    if (stores[i].id === storeId) return stores[i].name;
  }
  if (storeId === 'toko1') return 'Toko 1';
  if (storeId === 'toko2') return 'Toko 2';
  if (storeId === 'toko3') return 'Toko 3';
  return storeId;
}

/* ---------- PENYIMPANAN LOKAL & SINKRONISASI MULTI-PERANGKAT ---------- */
function saveToLocalCache(markOfflineDirty) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(appDB));
    if (markOfflineDirty === true) {
      localStorage.setItem(LOCAL_DIRTY_KEY, '1');
    } else if (markOfflineDirty === false) {
      localStorage.removeItem(LOCAL_DIRTY_KEY);
    }
  } catch (e) {}
}

function isOfflineDirty() {
  try {
    return localStorage.getItem(LOCAL_DIRTY_KEY) === '1';
  } catch (e) {
    return false;
  }
}

function loadFromLocalCache() {
  try {
    var raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      var parsed = JSON.parse(raw);
      if (parsed && parsed.products) {
        if (!parsed.sales) parsed.sales = [];
        if (!parsed.transactions) parsed.transactions = [];
        appDB = parsed;
      }
    }
  } catch (e) {}
}

function apiRequest(method, url, data, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open(method, url, true);
  xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
  xhr.timeout = 8000;
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          var resp = JSON.parse(xhr.responseText);
          callback(null, resp);
        } catch (e) {
          callback(e, null);
        }
      } else {
        callback(new Error('HTTP ' + xhr.status), null);
      }
    }
  };
  xhr.onerror = function () {
    callback(new Error('Network error'), null);
  };
  xhr.ontimeout = function () {
    callback(new Error('Timeout'), null);
  };
  xhr.send(data ? JSON.stringify(data) : null);
}

function updateSyncBadge(online, text) {
  isServerOnline = online;
  var badge = byId('syncStatusBadge');
  if (!badge) return;
  if (online) {
    badge.className = 'sync-badge online';
    badge.innerHTML = '&#9679; ' + (text || 'Terhubung Semua Perangkat');
  } else {
    badge.className = 'sync-badge offline';
    badge.innerHTML = '&#9679; ' + (text || 'Tersimpan di Memori iPad (Offline)');
  }
}

function pushToExternalCloudIfConfigured() {
  var cloudUrl = (appDB.settings && appDB.settings.cloudSyncUrl) ? String(appDB.settings.cloudSyncUrl).replace(/\/+$/, '') : '';
  if (!cloudUrl) return;
  var target = cloudUrl.indexOf('.json') !== -1 ? cloudUrl : (cloudUrl + '/stok_perabot_db.json');
  apiRequest('PUT', target, appDB, function (err) {
    if (!err) {
      updateSyncBadge(true, 'Tersinkron ke Cloud Online');
    }
  });
}

function pullFromExternalCloudIfConfigured(cb) {
  var cloudUrl = (appDB.settings && appDB.settings.cloudSyncUrl) ? String(appDB.settings.cloudSyncUrl).replace(/\/+$/, '') : '';
  if (!cloudUrl) {
    if (cb) cb(false);
    return;
  }
  var target = cloudUrl.indexOf('.json') !== -1 ? cloudUrl : (cloudUrl + '/stok_perabot_db.json');
  apiRequest('GET', target, null, function (err, data) {
    if (!err && data && data.products) {
      if (!data.sales) data.sales = [];
      if (!data.transactions) data.transactions = [];
      appDB = data;
      saveToLocalCache(false);
      apiRequest('POST', '/api/sync', { db: appDB }, function () {});
      renderAll();
      updateSyncBadge(true, 'Tersinkron ke Cloud Online');
      if (cb) cb(true);
    } else {
      if (cb) cb(false);
    }
  });
}

function fetchInitialState(silent) {
  if (!silent) {
    loadFromLocalCache();
    renderAll();
  }

  if (isOfflineDirty()) {
    apiRequest('POST', '/api/sync', { db: appDB }, function (err, res) {
      if (!err && res && res.ok) {
        saveToLocalCache(false);
        updateSyncBadge(true, 'Data iPad Tersinkron ke Server');
        pushToExternalCloudIfConfigured();
      } else {
        updateSyncBadge(false, 'Tersimpan di Memori iPad (Offline)');
      }
    });
    return;
  }

  apiRequest('GET', '/api/state', null, function (err, res) {
    if (!err && res && res.ok && res.db) {
      if (!res.db.sales) res.db.sales = [];
      if (!res.db.transactions) res.db.transactions = [];
      appDB = res.db;
      saveToLocalCache(false);
      updateSyncBadge(true, res.isVercel ? 'Terhubung Vercel Cloud' : 'Terhubung Semua Perangkat');
      if (res.localIPs && res.localIPs.length > 0) {
        var urlBox = byId('ipadUrlDisplay');
        if (urlBox) {
          urlBox.innerHTML = 'http://' + res.localIPs[0] + ':' + (res.port || 3000);
        }
      }
      renderAll();
      pullFromExternalCloudIfConfigured();
    } else {
      updateSyncBadge(false, 'Tersimpan di Memori iPad (Offline)');
      pullFromExternalCloudIfConfigured();
    }
  });
}

function manualSync() {
  showToast('Menyinkronkan data antar perangkat...');
  fetchInitialState(false);
}

/* ---------- NAVIGASI TAB & FILTER TOKO ---------- */
function switchTab(tabName) {
  currentTab = tabName;
  var tabs = ['rekap', 'kasir', 'masuk', 'mutasi', 'katalog', 'riwayat'];
  for (var i = 0; i < tabs.length; i++) {
    var t = tabs[i];
    var btn = byId('tabBtn-' + t);
    var panel = byId('panel-' + t);
    if (btn) btn.className = (t === tabName) ? 'nav-tab active' : 'nav-tab';
    if (panel) panel.className = (t === tabName) ? 'tab-panel active' : 'tab-panel';
  }
  renderAll();
}

function setStoreFilter(storeId) {
  activeStoreFilter = storeId;
  var ids = ['all', 'toko1', 'toko2', 'toko3'];
  for (var i = 0; i < ids.length; i++) {
    var el = byId('storeFilter-' + ids[i]);
    if (el) {
      var base = 'store-pill' + (ids[i] !== 'all' ? ' ' + ids[i] : '');
      el.className = (ids[i] === storeId) ? (base + ' active') : base;
    }
  }
  renderRekapTable();
}

function toggleLowStockOnly() {
  var sel = byId('stockAlertFilter');
  if (!sel) return;
  sel.value = (sel.value === 'LOW') ? 'ALL' : 'LOW';
  renderRekapTable();
}

/* ---------- RENDER SEMUA TAMPILAN ---------- */
function renderAll() {
  renderStoreLabels();
  renderCategoryDropdowns();
  renderSupplierDatalist();
  renderSummaryCards();
  renderRekapTable();
  renderPosView();
  renderMutasiSelectors();
  renderCatalogView();
  renderHistoryView();
}

function renderStoreLabels() {
  var s1 = getStoreName('toko1');
  var s2 = getStoreName('toko2');
  var s3 = getStoreName('toko3');
  var bName = (appDB.settings && appDB.settings.businessName) ? appDB.settings.businessName : 'Berkah Plastik & Perabot Keluarga';

  if (byId('headerBusinessName')) byId('headerBusinessName').innerHTML = escapeHtml(bName);
  if (byId('labelPillToko1')) byId('labelPillToko1').innerHTML = escapeHtml(s1);
  if (byId('labelPillToko2')) byId('labelPillToko2').innerHTML = escapeHtml(s2);
  if (byId('labelPillToko3')) byId('labelPillToko3').innerHTML = escapeHtml(s3);

  if (byId('sumTitleStore1')) byId('sumTitleStore1').innerHTML = 'Stok ' + escapeHtml(s1);
  if (byId('sumTitleStore2')) byId('sumTitleStore2').innerHTML = 'Stok ' + escapeHtml(s2);
  if (byId('sumTitleStore3')) byId('sumTitleStore3').innerHTML = 'Stok ' + escapeHtml(s3);

  if (byId('repLabelToko1')) byId('repLabelToko1').innerHTML = 'Omzet ' + escapeHtml(s1);
  if (byId('repLabelToko2')) byId('repLabelToko2').innerHTML = 'Omzet ' + escapeHtml(s2);
  if (byId('repLabelToko3')) byId('repLabelToko3').innerHTML = 'Omzet ' + escapeHtml(s3);

  if (byId('thToko1')) byId('thToko1').innerHTML = escapeHtml(s1);
  if (byId('thToko2')) byId('thToko2').innerHTML = escapeHtml(s2);
  if (byId('thToko3')) byId('thToko3').innerHTML = escapeHtml(s3);

  if (byId('formLabelToko1')) byId('formLabelToko1').innerHTML = 'Masuk ke ' + escapeHtml(s1);
  if (byId('formLabelToko2')) byId('formLabelToko2').innerHTML = 'Masuk ke ' + escapeHtml(s2);
  if (byId('formLabelToko3')) byId('formLabelToko3').innerHTML = 'Masuk ke ' + escapeHtml(s3);

  if (byId('cfgBusinessName') && document.activeElement !== byId('cfgBusinessName')) byId('cfgBusinessName').value = bName;
  if (byId('cfgStore1') && document.activeElement !== byId('cfgStore1')) byId('cfgStore1').value = s1;
  if (byId('cfgStore2') && document.activeElement !== byId('cfgStore2')) byId('cfgStore2').value = s2;
  if (byId('cfgStore3') && document.activeElement !== byId('cfgStore3')) byId('cfgStore3').value = s3;
  if (byId('cfgCloudUrl') && document.activeElement !== byId('cfgCloudUrl')) {
    byId('cfgCloudUrl').value = (appDB.settings && appDB.settings.cloudSyncUrl) ? appDB.settings.cloudSyncUrl : '';
  }

  var storeSelectIds = ['posStoreSelect', 'outStoreSelect', 'tfFromStore', 'tfTargetStore'];
  for (var i = 0; i < storeSelectIds.length; i++) {
    var sel = byId(storeSelectIds[i]);
    if (sel) {
      var curVal = sel.value;
      sel.innerHTML =
        '<option value="toko1">' + escapeHtml(s1) + '</option>' +
        '<option value="toko2">' + escapeHtml(s2) + '</option>' +
        '<option value="toko3">' + escapeHtml(s3) + '</option>';
      if (curVal) sel.value = curVal;
    }
  }
}

function getAllCategories() {
  var map = {};
  var list = [];
  for (var i = 0; i < DEFAULT_CATEGORIES.length; i++) {
    map[DEFAULT_CATEGORIES[i]] = true;
    list.push(DEFAULT_CATEGORIES[i]);
  }
  var prods = appDB.products || [];
  for (var j = 0; j < prods.length; j++) {
    var c = prods[j].category;
    if (c && !map[c]) {
      map[c] = true;
      list.push(c);
    }
  }
  return list;
}

function renderCategoryDropdowns() {
  var cats = getAllCategories();
  var dropdownIds = ['categoryFilter', 'posCategoryFilter'];
  for (var d = 0; d < dropdownIds.length; d++) {
    var filterSel = byId(dropdownIds[d]);
    if (filterSel) {
      var prev = filterSel.value || 'ALL';
      var html = '<option value="ALL">Semua Kategori (' + cats.length + ')</option>';
      for (var i = 0; i < cats.length; i++) {
        html += '<option value="' + escapeHtml(cats[i]) + '">' + escapeHtml(cats[i]) + '</option>';
      }
      filterSel.innerHTML = html;
      filterSel.value = prev;
    }
  }
}

function renderSupplierDatalist() {
  var dl = byId('supplierList');
  if (!dl) return;
  var sups = (appDB.settings && appDB.settings.suppliers) ? appDB.settings.suppliers : [];
  var html = '';
  for (var i = 0; i < sups.length; i++) {
    html += '<option value="' + escapeHtml(sups[i]) + '">';
  }
  dl.innerHTML = html;
}

/* ---------- RINGKASAN & TABEL REKAP 3 TOKO ---------- */
function renderSummaryCards() {
  var prods = appDB.products || [];
  var q1 = 0, q2 = 0, q3 = 0;
  var modal1 = 0, modal2 = 0, modal3 = 0;
  var lowCount = 0;

  for (var i = 0; i < prods.length; i++) {
    var p = prods[i];
    var s1 = (p.stock && p.stock.toko1) ? parseInt(p.stock.toko1, 10) : 0;
    var s2 = (p.stock && p.stock.toko2) ? parseInt(p.stock.toko2, 10) : 0;
    var s3 = (p.stock && p.stock.toko3) ? parseInt(p.stock.toko3, 10) : 0;
    var tot = s1 + s2 + s3;
    var cost = Number(p.costPrice) || 0;

    q1 += s1;
    q2 += s2;
    q3 += s3;
    modal1 += s1 * cost;
    modal2 += s2 * cost;
    modal3 += s3 * cost;

    var minS = (p.minStock !== undefined) ? Number(p.minStock) : 5;
    if (tot <= minS) {
      lowCount++;
    }
  }

  // Hitung omzet & laba dari penjualan kasir
  var sales = appDB.sales || [];
  var sales1 = 0, sales2 = 0, sales3 = 0;
  var prof1 = 0, prof2 = 0, prof3 = 0;
  for (var j = 0; j < sales.length; j++) {
    var sl = sales[j];
    var rev = Number(sl.totalRevenue) || 0;
    var prf = Number(sl.profit) || 0;
    if (sl.store === 'toko1') { sales1 += rev; prof1 += prf; }
    else if (sl.store === 'toko2') { sales2 += rev; prof2 += prf; }
    else if (sl.store === 'toko3') { sales3 += rev; prof3 += prf; }
  }
  var totalSalesAll = sales1 + sales2 + sales3;
  var totalProfitAll = prof1 + prof2 + prof3;

  if (byId('sumQtyToko1')) byId('sumQtyToko1').innerHTML = q1 + ' Unit';
  if (byId('sumAssetToko1')) byId('sumAssetToko1').innerHTML = 'Modal: ' + formatRupiah(modal1);

  if (byId('sumQtyToko2')) byId('sumQtyToko2').innerHTML = q2 + ' Unit';
  if (byId('sumAssetToko2')) byId('sumAssetToko2').innerHTML = 'Modal: ' + formatRupiah(modal2);

  if (byId('sumQtyToko3')) byId('sumQtyToko3').innerHTML = q3 + ' Unit';
  if (byId('sumAssetToko3')) byId('sumAssetToko3').innerHTML = 'Modal: ' + formatRupiah(modal3);

  if (byId('sumTotalSales')) byId('sumTotalSales').innerHTML = formatRupiah(totalSalesAll);
  if (byId('sumTotalProfit')) byId('sumTotalProfit').innerHTML = 'Laba Bersih: ' + formatRupiah(totalProfitAll);

  if (byId('sumLowStockCount')) byId('sumLowStockCount').innerHTML = lowCount + ' Barang';

  // Update kartu di tab Laporan
  if (byId('repSalesToko1')) byId('repSalesToko1').innerHTML = formatRupiah(sales1);
  if (byId('repProfitToko1')) byId('repProfitToko1').innerHTML = 'Laba: ' + formatRupiah(prof1);
  if (byId('repSalesToko2')) byId('repSalesToko2').innerHTML = formatRupiah(sales2);
  if (byId('repProfitToko2')) byId('repProfitToko2').innerHTML = 'Laba: ' + formatRupiah(prof2);
  if (byId('repSalesToko3')) byId('repSalesToko3').innerHTML = formatRupiah(sales3);
  if (byId('repProfitToko3')) byId('repProfitToko3').innerHTML = 'Laba: ' + formatRupiah(prof3);
  if (byId('repSalesTotal')) byId('repSalesTotal').innerHTML = formatRupiah(totalSalesAll);
  if (byId('repProfitTotal')) byId('repProfitTotal').innerHTML = 'Total Laba: ' + formatRupiah(totalProfitAll);
}

function renderRekapTable() {
  var tbody = byId('rekapTableBody');
  if (!tbody) return;

  var q = (byId('searchInput') ? byId('searchInput').value : '').toLowerCase().replace(/^\s+|\s+$/g, '');
  var cat = byId('categoryFilter') ? byId('categoryFilter').value : 'ALL';
  var alertMode = byId('stockAlertFilter') ? byId('stockAlertFilter').value : 'ALL';

  var heading = byId('rekapTableHeading');
  if (heading) {
    if (activeStoreFilter === 'all') {
      heading.innerHTML = 'Rekap Perbandingan Stok Gabungan: ' + escapeHtml(getStoreName('toko1')) + ', ' + escapeHtml(getStoreName('toko2')) + ', &amp; ' + escapeHtml(getStoreName('toko3'));
    } else {
      heading.innerHTML = 'Fokus Stok ' + escapeHtml(getStoreName(activeStoreFilter)) + ' (beserta perbandingan toko lain)';
    }
  }

  var prods = appDB.products || [];
  var rowsHtml = '';
  var matchCount = 0;

  for (var i = 0; i < prods.length; i++) {
    var p = prods[i];
    var s1 = (p.stock && p.stock.toko1) ? parseInt(p.stock.toko1, 10) : 0;
    var s2 = (p.stock && p.stock.toko2) ? parseInt(p.stock.toko2, 10) : 0;
    var s3 = (p.stock && p.stock.toko3) ? parseInt(p.stock.toko3, 10) : 0;
    var totalStock = s1 + s2 + s3;
    var minS = (p.minStock !== undefined) ? Number(p.minStock) : 5;

    if (q) {
      var hay = ((p.code || '') + ' ' + (p.name || '') + ' ' + (p.brand || '') + ' ' + (p.category || '')).toLowerCase();
      if (hay.indexOf(q) === -1) continue;
    }

    if (cat !== 'ALL' && p.category !== cat) continue;

    var isLow = false;
    if (activeStoreFilter === 'all') {
      isLow = (totalStock <= minS);
    } else {
      var storeVal = (activeStoreFilter === 'toko1') ? s1 : (activeStoreFilter === 'toko2' ? s2 : s3);
      isLow = (storeVal <= Math.ceil(minS / 2));
    }
    if (alertMode === 'LOW' && !isLow) continue;

    matchCount++;

    var thumbHtml = '';
    if (p.photo) {
      thumbHtml = '<img class="prod-thumb" src="' + p.photo + '" alt="foto">';
    } else {
      var shortCode = (p.code || 'BRG').substring(0, 3);
      thumbHtml = '<div class="prod-thumb-placeholder">' + escapeHtml(shortCode) + '</div>';
    }

    var lowBadge = isLow
      ? '<span class="badge badge-low" style="margin-left:6px;">Stok Tipis!</span>'
      : '<span class="badge badge-ok" style="margin-left:6px;">Aman</span>';

    var boxClass1 = (activeStoreFilter === 'toko1') ? 'store-stock-box highlight' : 'store-stock-box';
    var boxClass2 = (activeStoreFilter === 'toko2') ? 'store-stock-box highlight' : 'store-stock-box';
    var boxClass3 = (activeStoreFilter === 'toko3') ? 'store-stock-box highlight' : 'store-stock-box';

    rowsHtml += '<tr>' +
      '<td>' + thumbHtml + '</td>' +
      '<td>' +
        '<div style="font-weight:800; color:#1e40af; font-size:13px;">' + escapeHtml(p.code) + lowBadge + '</div>' +
        '<div style="font-weight:700; color:#0f172a; margin-top:2px;">' + escapeHtml(p.name) + '</div>' +
        '<div style="font-size:12px; color:#64748b;">Merek: ' + escapeHtml(p.brand || '-') + ' &bull; Satuan: ' + escapeHtml(p.unit || 'Pcs') + '</div>' +
      '</td>' +
      '<td><span class="badge">' + escapeHtml(p.category || 'Umum') + '</span></td>' +
      '<td>' +
        '<div style="font-size:12px; color:#64748b;">Modal: ' + formatRupiah(p.costPrice) + '</div>' +
        '<div style="font-weight:700; color:#059669;">Ecer: ' + formatRupiah(p.sellPrice) + '</div>' +
        (p.wholesalePrice ? '<div style="font-size:12px; color:#475569;">Grosir: ' + formatRupiah(p.wholesalePrice) + '</div>' : '') +
      '</td>' +
      '<td style="text-align:center;">' +
        '<div class="' + boxClass1 + '">' +
          '<button type="button" class="qty-btn" onclick="quickAdjustStock(\'' + escapeHtml(p.code) + '\', \'toko1\', -1)">-</button>' +
          '<span class="qty-num">' + s1 + '</span>' +
          '<button type="button" class="qty-btn" onclick="quickAdjustStock(\'' + escapeHtml(p.code) + '\', \'toko1\', 1)">+</button>' +
        '</div>' +
      '</td>' +
      '<td style="text-align:center;">' +
        '<div class="' + boxClass2 + '">' +
          '<button type="button" class="qty-btn" onclick="quickAdjustStock(\'' + escapeHtml(p.code) + '\', \'toko2\', -1)">-</button>' +
          '<span class="qty-num">' + s2 + '</span>' +
          '<button type="button" class="qty-btn" onclick="quickAdjustStock(\'' + escapeHtml(p.code) + '\', \'toko2\', 1)">+</button>' +
        '</div>' +
      '</td>' +
      '<td style="text-align:center;">' +
        '<div class="' + boxClass3 + '">' +
          '<button type="button" class="qty-btn" onclick="quickAdjustStock(\'' + escapeHtml(p.code) + '\', \'toko3\', -1)">-</button>' +
          '<span class="qty-num">' + s3 + '</span>' +
          '<button type="button" class="qty-btn" onclick="quickAdjustStock(\'' + escapeHtml(p.code) + '\', \'toko3\', 1)">+</button>' +
        '</div>' +
      '</td>' +
      '<td style="text-align:center;">' +
        '<div style="font-size:18px; font-weight:800; color:#0f172a;">' + totalStock + '</div>' +
        '<div style="font-size:11px; color:#64748b;">' + escapeHtml(p.unit || 'Pcs') + '</div>' +
      '</td>' +
      '<td style="text-align:center;">' +
        '<button type="button" class="btn btn-success btn-sm" style="margin-bottom:4px;" onclick="quickSellFromTable(\'' + escapeHtml(p.code) + '\')">Jual</button> ' +
        '<button type="button" class="btn btn-outline btn-sm" onclick="prefillStockIn(\'' + escapeHtml(p.code) + '\')">+Stok</button>' +
      '</td>' +
    '</tr>';
  }

  if (matchCount === 0) {
    rowsHtml = '<tr><td colspan="9" style="text-align:center; padding:24px; color:#64748b;">Tidak ada barang yang cocok dengan filter pencarian.</td></tr>';
  }

  tbody.innerHTML = rowsHtml;
}

/* ---------- FITUR KASIR PENJUALAN (POS - OTOMATIS POTONG STOK) ---------- */
function quickSellFromTable(code) {
  if (activeStoreFilter !== 'all' && byId('posStoreSelect')) {
    byId('posStoreSelect').value = activeStoreFilter;
  }
  switchTab('kasir');
  addToPosCart(code);
}

function getPosUnitPrice(product) {
  var mode = byId('posPriceMode') ? byId('posPriceMode').value : 'ECER';
  if (mode === 'GROSIR' && product.wholesalePrice && Number(product.wholesalePrice) > 0) {
    return Number(product.wholesalePrice);
  }
  return Number(product.sellPrice) || 0;
}

function onPosStoreOrModeChanged() {
  var store = byId('posStoreSelect') ? byId('posStoreSelect').value : 'toko1';
  if (byId('posCartStoreLabel')) {
    byId('posCartStoreLabel').innerHTML = escapeHtml(getStoreName(store));
  }
  // Perbarui harga keranjang sesuai mode Ecer / Grosir
  for (var i = 0; i < posCart.length; i++) {
    var p = findProductByCode(posCart[i].code);
    if (p) {
      posCart[i].price = getPosUnitPrice(p);
    }
  }
  renderPosView();
}

function onPosQuickCodeSubmit(evt) {
  if (evt && evt.preventDefault) evt.preventDefault();
  var inp = byId('posQuickCode');
  if (!inp) return;
  var code = inp.value.replace(/^\s+|\s+$/g, '').toUpperCase();
  if (!code) return;
  var p = findProductByCode(code);
  if (!p) {
    alert('Kode barang "' + code + '" tidak ditemukan!');
    return;
  }
  addToPosCart(p.code);
  inp.value = '';
}

function addToPosCart(code) {
  var p = findProductByCode(code);
  if (!p) return;

  var store = byId('posStoreSelect') ? byId('posStoreSelect').value : 'toko1';
  var avail = (p.stock && p.stock[store]) ? parseInt(p.stock[store], 10) : 0;

  var existingItem = null;
  for (var i = 0; i < posCart.length; i++) {
    if (posCart[i].code === p.code) {
      existingItem = posCart[i];
      break;
    }
  }

  var currentInCart = existingItem ? existingItem.qty : 0;
  if (currentInCart + 1 > avail) {
    showToast('Peringatan: Stok ' + p.code + ' di ' + getStoreName(store) + ' sisa ' + avail + '!');
  }

  if (existingItem) {
    existingItem.qty += 1;
  } else {
    posCart.push({
      code: p.code,
      name: p.name,
      unit: p.unit || 'Pcs',
      qty: 1,
      price: getPosUnitPrice(p),
      costPrice: Number(p.costPrice) || 0
    });
  }

  renderPosCart();
  showToast('+1 ' + p.name + ' masuk keranjang');
}

function changePosCartQty(code, delta) {
  for (var i = 0; i < posCart.length; i++) {
    if (posCart[i].code === code) {
      posCart[i].qty += delta;
      if (posCart[i].qty <= 0) {
        posCart.splice(i, 1);
      }
      break;
    }
  }
  renderPosCart();
}

function removePosCartItem(code) {
  for (var i = 0; i < posCart.length; i++) {
    if (posCart[i].code === code) {
      posCart.splice(i, 1);
      break;
    }
  }
  renderPosCart();
}

function clearPosCart() {
  posCart = [];
  if (byId('posPaymentInput')) byId('posPaymentInput').value = '';
  renderPosCart();
}

function getPosGrandTotal() {
  var total = 0;
  for (var i = 0; i < posCart.length; i++) {
    total += (Number(posCart[i].price) || 0) * (parseInt(posCart[i].qty, 10) || 0);
  }
  return total;
}

function setExactPosPayment() {
  if (byId('posPaymentInput')) {
    byId('posPaymentInput').value = getPosGrandTotal();
    updatePosChangeDisplay();
  }
}

function setPosPayment(amount) {
  if (byId('posPaymentInput')) {
    byId('posPaymentInput').value = amount;
    updatePosChangeDisplay();
  }
}

function updatePosChangeDisplay() {
  var total = getPosGrandTotal();
  var pay = Number(byId('posPaymentInput') ? byId('posPaymentInput').value : 0) || 0;
  var changeEl = byId('posChangeDisplay');
  if (!changeEl) return;

  if (pay === 0) {
    changeEl.style.color = '#1e40af';
    changeEl.innerHTML = 'Rp 0';
  } else if (pay < total) {
    changeEl.style.color = '#dc2626';
    changeEl.innerHTML = 'Kurang ' + formatRupiah(total - pay);
  } else {
    changeEl.style.color = '#059669';
    changeEl.innerHTML = formatRupiah(pay - total);
  }
}

function renderPosView() {
  var store = byId('posStoreSelect') ? byId('posStoreSelect').value : 'toko1';
  if (byId('posCartStoreLabel')) {
    byId('posCartStoreLabel').innerHTML = escapeHtml(getStoreName(store));
  }
  renderPosProductGrid();
  renderPosCart();
}

function renderPosProductGrid() {
  var grid = byId('posProductGrid');
  if (!grid) return;

  var store = byId('posStoreSelect') ? byId('posStoreSelect').value : 'toko1';
  var q = (byId('posSearchInput') ? byId('posSearchInput').value : '').toLowerCase().replace(/^\s+|\s+$/g, '');
  var cat = byId('posCategoryFilter') ? byId('posCategoryFilter').value : 'ALL';
  var prods = appDB.products || [];

  var html = '';
  for (var i = 0; i < prods.length; i++) {
    var p = prods[i];
    if (cat !== 'ALL' && p.category !== cat) continue;
    if (q) {
      var hay = ((p.code || '') + ' ' + (p.name || '') + ' ' + (p.brand || '')).toLowerCase();
      if (hay.indexOf(q) === -1) continue;
    }

    var avail = (p.stock && p.stock[store]) ? parseInt(p.stock[store], 10) : 0;
    var price = getPosUnitPrice(p);
    var cardClass = avail > 0 ? 'pos-item-card' : 'pos-item-card out-of-stock';

    html += '<div class="pos-item-wrap">' +
      '<div class="' + cardClass + '" onclick="addToPosCart(\'' + escapeHtml(p.code) + '\')">' +
        '<div style="display:flex; justify-content:space-between; align-items:center;">' +
          '<strong style="font-size:12px; color:#1e40af;">' + escapeHtml(p.code) + '</strong>' +
          '<span class="badge ' + (avail > 0 ? 'badge-ok' : 'badge-low') + '">Stok: ' + avail + '</span>' +
        '</div>' +
        '<div style="font-weight:700; font-size:14px; color:#0f172a; margin:5px 0;">' + escapeHtml(p.name) + '</div>' +
        '<div style="font-weight:800; font-size:15px; color:#059669;">' + formatRupiah(price) + ' <span style="font-size:11px; color:#64748b; font-weight:normal;">/ ' + escapeHtml(p.unit || 'Pcs') + '</span></div>' +
      '</div>' +
    '</div>';
  }

  if (!html) {
    html = '<div style="padding:20px; color:#64748b;">Barang tidak ditemukan.</div>';
  }
  grid.innerHTML = html;
}

function renderPosCart() {
  var listEl = byId('posCartList');
  if (!listEl) return;

  if (posCart.length === 0) {
    listEl.innerHTML = '<div style="padding:24px; text-align:center; color:#64748b;">Keranjang kasir masih kosong.<br>Ketuk barang di sebelah kiri untuk menjual.</div>';
    if (byId('posGrandTotal')) byId('posGrandTotal').innerHTML = 'Rp 0';
    updatePosChangeDisplay();
    return;
  }

  var html = '';
  for (var i = 0; i < posCart.length; i++) {
    var item = posCart[i];
    var sub = (Number(item.price) || 0) * (parseInt(item.qty, 10) || 0);
    html += '<div class="cart-row">' +
      '<div style="flex:1; padding-right:6px;">' +
        '<div style="font-weight:700; font-size:14px; color:#0f172a;">' + escapeHtml(item.name) + '</div>' +
        '<div style="font-size:12px; color:#475569;">' + escapeHtml(item.code) + ' &bull; ' + formatRupiah(item.price) + ' x ' + item.qty + ' ' + escapeHtml(item.unit) + '</div>' +
        '<div style="font-weight:800; color:#059669; font-size:13px;">' + formatRupiah(sub) + '</div>' +
      '</div>' +
      '<div style="white-space:nowrap;">' +
        '<button type="button" class="qty-btn" onclick="changePosCartQty(\'' + escapeHtml(item.code) + '\', -1)">-</button>' +
        '<span class="qty-num">' + item.qty + '</span>' +
        '<button type="button" class="qty-btn" onclick="changePosCartQty(\'' + escapeHtml(item.code) + '\', 1)">+</button>' +
        '<button type="button" class="qty-btn" style="margin-left:4px; color:#dc2626; border-color:#fca5a5;" onclick="removePosCartItem(\'' + escapeHtml(item.code) + '\')">&times;</button>' +
      '</div>' +
    '</div>';
  }

  listEl.innerHTML = html;
  if (byId('posGrandTotal')) {
    byId('posGrandTotal').innerHTML = formatRupiah(getPosGrandTotal());
  }
  updatePosChangeDisplay();
}

function submitPosCheckout() {
  if (posCart.length === 0) {
    alert('Keranjang kasir masih kosong! Pilih barang terlebih dahulu.');
    return;
  }

  var store = byId('posStoreSelect') ? byId('posStoreSelect').value : 'toko1';
  var priceMode = byId('posPriceMode') ? byId('posPriceMode').value : 'ECER';
  var customerName = (byId('posCustomerName') && byId('posCustomerName').value) ? byId('posCustomerName').value : 'Pelanggan Umum';
  var grandTotal = getPosGrandTotal();
  var paymentAmount = Number(byId('posPaymentInput') ? byId('posPaymentInput').value : 0) || grandTotal;

  if (paymentAmount < grandTotal) {
    alert('Uang bayar pelanggan kurang dari Total Belanja!');
    return;
  }

  var now = new Date().toISOString();
  var receiptNo = 'INV-' + Date.now().toString().slice(-6);
  var totalCost = 0;
  var itemsCopy = [];

  // Potong stok secara otomatis di toko yang dipilih
  for (var i = 0; i < posCart.length; i++) {
    var cItem = posCart[i];
    var p = findProductByCode(cItem.code);
    var qty = parseInt(cItem.qty, 10) || 0;
    var price = Number(cItem.price) || 0;
    var cost = p ? (Number(p.costPrice) || 0) : 0;

    if (p) {
      var curStock = (p.stock && p.stock[store]) ? parseInt(p.stock[store], 10) : 0;
      p.stock[store] = Math.max(0, curStock - qty);
      p.updatedAt = now;
    }

    totalCost += cost * qty;
    itemsCopy.push({
      code: cItem.code,
      name: cItem.name,
      unit: cItem.unit,
      qty: qty,
      price: price,
      costPrice: cost,
      subtotal: price * qty
    });

    appDB.transactions.unshift({
      id: 'tx_' + Date.now() + '_' + i,
      type: 'SALE',
      date: now,
      code: cItem.code,
      productName: cItem.name,
      category: p ? p.category : 'Umum',
      fromStore: store,
      qty: qty,
      price: price,
      subtotal: price * qty,
      invoiceNo: receiptNo,
      note: 'Penjualan ' + priceMode + ' (' + customerName + ')'
    });
  }

  var saleRecord = {
    id: 'sale_' + Date.now(),
    receiptNo: receiptNo,
    date: now,
    store: store,
    priceMode: priceMode,
    customerName: customerName,
    items: itemsCopy,
    totalRevenue: grandTotal,
    totalCost: totalCost,
    profit: grandTotal - totalCost,
    paymentAmount: paymentAmount,
    changeAmount: Math.max(0, paymentAmount - grandTotal)
  };

  if (!appDB.sales) appDB.sales = [];
  appDB.sales.unshift(saleRecord);

  // Tampilkan struk penjualan
  renderLastReceipt(saleRecord);

  // Bersihkan keranjang
  posCart = [];
  if (byId('posCustomerName')) byId('posCustomerName').value = '';
  if (byId('posPaymentInput')) byId('posPaymentInput').value = '';

  saveToLocalCache(true);
  renderAll();
  showToast('Penjualan ' + receiptNo + ' berhasil! Stok ' + getStoreName(store) + ' otomatis berkurang.');

  // Kirim ke Server & Cloud agar semua perangkat langsung terupdate
  apiRequest('POST', '/api/sale', {
    receiptNo: receiptNo,
    store: store,
    priceMode: priceMode,
    customerName: customerName,
    paymentAmount: paymentAmount,
    items: itemsCopy
  }, function (err, res) {
    if (!err && res && res.db) {
      appDB = res.db;
      saveToLocalCache(false);
      updateSyncBadge(true, 'Tersimpan di Semua Perangkat');
      renderAll();
      pushToExternalCloudIfConfigured();
    } else {
      updateSyncBadge(false, 'Tersimpan di Memori iPad (Offline)');
      pushToExternalCloudIfConfigured();
    }
  });
}

function renderLastReceipt(sale) {
  var box = byId('posLastReceiptBox');
  if (!box || !sale) return;

  var lines = '';
  for (var i = 0; i < sale.items.length; i++) {
    var it = sale.items[i];
    lines += '<div style="display:flex; justify-content:space-between; margin:3px 0;">' +
      '<span>' + escapeHtml(it.name) + ' (' + it.qty + 'x)</span>' +
      '<strong>' + formatRupiah(it.subtotal) + '</strong>' +
    '</div>';
  }

  box.innerHTML =
    '<div style="text-align:center; font-weight:bold; border-bottom:1px dashed #94a3b8; padding-bottom:6px; margin-bottom:6px;">' +
      'STRUK PENJUALAN - ' + escapeHtml(getStoreName(sale.store)) + '<br>' +
      '<span style="font-size:11px; font-weight:normal;">No: ' + escapeHtml(sale.receiptNo) + ' &bull; ' + escapeHtml(formatDateId(sale.date)) + '</span>' +
    '</div>' +
    '<div style="font-size:12px; margin-bottom:6px;">Pembeli: ' + escapeHtml(sale.customerName) + ' (' + escapeHtml(sale.priceMode) + ')</div>' +
    lines +
    '<div style="border-top:1px dashed #94a3b8; margin-top:6px; padding-top:6px;">' +
      '<div style="display:flex; justify-content:space-between; font-weight:bold;"><span>TOTAL:</span><span>' + formatRupiah(sale.totalRevenue) + '</span></div>' +
      '<div style="display:flex; justify-content:space-between;"><span>BAYAR:</span><span>' + formatRupiah(sale.paymentAmount) + '</span></div>' +
      '<div style="display:flex; justify-content:space-between;"><span>KEMBALI:</span><span>' + formatRupiah(sale.changeAmount) + '</span></div>' +
    '</div>' +
    '<div style="margin-top:8px; text-align:center;">' +
      '<button type="button" class="btn btn-outline btn-sm" onclick="window.print()">Cetak Struk</button>' +
    '</div>';

  box.style.display = 'block';
}

/* ---------- KONTROL CEPAT (+ / -) LANGSUNG DARI TABEL ---------- */
function quickAdjustStock(code, store, delta) {
  var target = findProductByCode(code);
  if (!target) return;

  var cur = (target.stock && target.stock[store]) ? parseInt(target.stock[store], 10) : 0;
  var nextVal = Math.max(0, cur + delta);
  if (nextVal === cur) return;

  target.stock[store] = nextVal;
  target.updatedAt = new Date().toISOString();

  appDB.transactions.unshift({
    id: 'tx_' + Date.now(),
    type: delta > 0 ? 'IN' : 'OUT',
    date: target.updatedAt,
    code: target.code,
    productName: target.name,
    category: target.category,
    fromStore: delta < 0 ? store : undefined,
    targetStore: delta > 0 ? store : undefined,
    qty: Math.abs(delta),
    note: delta > 0 ? 'Tambah cepat (+1) di tabel' : 'Kurang cepat (-1) di tabel'
  });

  saveToLocalCache(true);
  renderSummaryCards();
  renderRekapTable();

  apiRequest('POST', '/api/stock-move', {
    type: 'QUICK_DELTA',
    code: code,
    store: store,
    delta: delta
  }, function (err, res) {
    if (!err && res && res.db) {
      appDB = res.db;
      saveToLocalCache(false);
      updateSyncBadge(true, 'Tersimpan di Semua Perangkat');
      pushToExternalCloudIfConfigured();
    } else {
      updateSyncBadge(false, 'Tersimpan di Memori iPad (Offline)');
    }
  });
}

/* ---------- ALUR 4, 5, 7: BARANG MASUK DARI SUPPLIER & DETEKSI OTOMATIS ---------- */
function findProductByCode(code) {
  var clean = String(code || '').replace(/^\s+|\s+$/g, '').toUpperCase();
  if (!clean) return null;
  var prods = appDB.products || [];
  for (var i = 0; i < prods.length; i++) {
    if (String(prods[i].code).toUpperCase() === clean) {
      return prods[i];
    }
  }
  return null;
}

function detectCategoryByCodeOrName(code, name) {
  var cleanCode = String(code || '').replace(/^\s+|\s+$/g, '').toUpperCase();
  var rules = (appDB.settings && appDB.settings.prefixRules) ? appDB.settings.prefixRules : [];
  for (var i = 0; i < rules.length; i++) {
    var pref = String(rules[i].prefix || '').toUpperCase();
    if (pref && cleanCode.indexOf(pref) === 0) {
      return rules[i].category;
    }
  }

  var lowerName = String(name || '').toLowerCase();
  if (lowerName) {
    for (var j = 0; j < KEYWORD_CATEGORY_MAP.length; j++) {
      var kwList = KEYWORD_CATEGORY_MAP[j].keywords;
      for (var k = 0; k < kwList.length; k++) {
        if (lowerName.indexOf(kwList[k]) !== -1) {
          return KEYWORD_CATEGORY_MAP[j].category;
        }
      }
    }
  }
  return null;
}

function generateAutoCodeFromPrefix(prefix) {
  var prods = appDB.products || [];
  var maxNum = 0;
  var upperPref = prefix.toUpperCase() + '-';
  for (var i = 0; i < prods.length; i++) {
    var c = String(prods[i].code || '').toUpperCase();
    if (c.indexOf(upperPref) === 0) {
      var numPart = parseInt(c.substring(upperPref.length), 10);
      if (!isNaN(numPart) && numPart > maxNum) {
        maxNum = numPart;
      }
    }
  }
  var next = maxNum + 1;
  var pad = next < 10 ? '00' + next : (next < 100 ? '0' + next : '' + next);
  return upperPref + pad;
}

function onCodeInputChanged() {
  var codeEl = byId('inCode');
  var hintEl = byId('codeAutoHint');
  if (!codeEl) return;

  var code = codeEl.value.replace(/^\s+|\s+$/g, '').toUpperCase();
  var existing = findProductByCode(code);

  if (existing) {
    if (byId('inName')) byId('inName').value = existing.name || '';
    if (byId('inCategory')) byId('inCategory').value = existing.category || 'Kebutuhan Keluarga';
    if (byId('inBrand')) byId('inBrand').value = existing.brand || '';
    if (byId('inUnit')) byId('inUnit').value = existing.unit || 'Pcs';
    if (byId('inCostPrice')) byId('inCostPrice').value = existing.costPrice || 0;
    if (byId('inSellPrice')) byId('inSellPrice').value = existing.sellPrice || 0;
    if (byId('inWholesalePrice')) byId('inWholesalePrice').value = existing.wholesalePrice || 0;
    if (byId('inMinStock')) byId('inMinStock').value = existing.minStock || 5;

    if (byId('curStockToko1')) byId('curStockToko1').innerHTML = (existing.stock && existing.stock.toko1) || 0;
    if (byId('curStockToko2')) byId('curStockToko2').innerHTML = (existing.stock && existing.stock.toko2) || 0;
    if (byId('curStockToko3')) byId('curStockToko3').innerHTML = (existing.stock && existing.stock.toko3) || 0;

    if (existing.photo) {
      currentPhotoDataUrl = existing.photo;
      if (byId('inPhotoPreview')) {
        byId('inPhotoPreview').src = existing.photo;
        byId('inPhotoPreview').style.display = 'block';
      }
      if (byId('clearPhotoBtn')) byId('clearPhotoBtn').style.display = 'inline-block';
    }

    if (hintEl) {
      hintEl.style.color = '#059669';
      hintEl.innerHTML = '&#10004; Barang terdaftar! Data, Kategori (' + escapeHtml(existing.category) + '), &amp; Foto dimuat otomatis.';
    }
  } else {
    if (byId('curStockToko1')) byId('curStockToko1').innerHTML = '0 (Baru)';
    if (byId('curStockToko2')) byId('curStockToko2').innerHTML = '0 (Baru)';
    if (byId('curStockToko3')) byId('curStockToko3').innerHTML = '0 (Baru)';

    var detectedCat = detectCategoryByCodeOrName(code, byId('inName') ? byId('inName').value : '');
    if (detectedCat && byId('inCategory')) {
      byId('inCategory').value = detectedCat;
      if (hintEl) {
        hintEl.style.color = '#2563eb';
        hintEl.innerHTML = '&#9733; Kode Baru &rarr; Otomatis masuk kategori: ' + escapeHtml(detectedCat);
      }
    } else if (hintEl) {
      hintEl.style.color = '#64748b';
      hintEl.innerHTML = code ? 'Kode barang baru.' : '';
    }
  }
}

function onNameInputChanged() {
  var nameVal = byId('inName') ? byId('inName').value : '';
  var codeEl = byId('inCode');
  var curCode = codeEl ? codeEl.value.replace(/^\s+|\s+$/g, '') : '';

  var lowerName = nameVal.toLowerCase();
  for (var i = 0; i < KEYWORD_CATEGORY_MAP.length; i++) {
    var entry = KEYWORD_CATEGORY_MAP[i];
    for (var k = 0; k < entry.keywords.length; k++) {
      if (lowerName.indexOf(entry.keywords[k]) !== -1) {
        if (byId('inCategory')) byId('inCategory').value = entry.category;
        if (!curCode && codeEl) {
          codeEl.value = generateAutoCodeFromPrefix(entry.prefix);
          onCodeInputChanged();
        } else if (byId('codeAutoHint') && !findProductByCode(curCode)) {
          byId('codeAutoHint').style.color = '#2563eb';
          byId('codeAutoHint').innerHTML = '&#9733; Kategori otomatis terdeteksi: ' + escapeHtml(entry.category);
        }
        return;
      }
    }
  }
}

function addInputQty(inputId, delta) {
  var el = byId(inputId);
  if (!el) return;
  var cur = parseInt(el.value, 10) || 0;
  el.value = Math.max(0, cur + delta);
}

function setInputQty(inputId, val) {
  var el = byId(inputId);
  if (!el) return;
  el.value = val;
}

/* ---------- KOMPRESI FOTO KAMERA IPAD MINI ---------- */
function handlePhotoSelected(evt) {
  var files = evt.target.files;
  if (!files || !files[0]) return;
  var file = files[0];

  if (file.name && byId('inName') && !byId('inName').value) {
    var cleanFileName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    if (cleanFileName.toLowerCase().indexOf('image') === -1 && cleanFileName.toLowerCase().indexOf('img') === -1) {
      byId('inName').value = cleanFileName;
      onNameInputChanged();
    }
  }

  var reader = new FileReader();
  reader.onload = function (e) {
    var img = new Image();
    img.onload = function () {
      var canvas = document.createElement('canvas');
      var maxDim = 320;
      var w = img.width;
      var h = img.height;
      if (w > h) {
        if (w > maxDim) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        }
      } else {
        if (h > maxDim) {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
      }
      canvas.width = w;
      canvas.height = h;
      var ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);

      var compressedDataUrl = canvas.toDataURL('image/jpeg', 0.72);
      currentPhotoDataUrl = compressedDataUrl;

      if (byId('inPhotoPreview')) {
        byId('inPhotoPreview').src = compressedDataUrl;
        byId('inPhotoPreview').style.display = 'block';
      }
      if (byId('clearPhotoBtn')) {
        byId('clearPhotoBtn').style.display = 'inline-block';
      }

      onCodeInputChanged();
      var catNow = byId('inCategory') ? byId('inCategory').value : 'Kebutuhan Keluarga';
      showToast('Foto siap! Otomatis masuk kategori: ' + catNow);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function clearPhotoPreview() {
  currentPhotoDataUrl = '';
  if (byId('inPhotoPreview')) {
    byId('inPhotoPreview').src = '';
    byId('inPhotoPreview').style.display = 'none';
  }
  if (byId('inPhotoFile')) byId('inPhotoFile').value = '';
  if (byId('clearPhotoBtn')) byId('clearPhotoBtn').style.display = 'none';
}

function resetStockInForm() {
  if (byId('stockInForm')) byId('stockInForm').reset();
  if (byId('inQtyToko1')) byId('inQtyToko1').value = 0;
  if (byId('inQtyToko2')) byId('inQtyToko2').value = 0;
  if (byId('inQtyToko3')) byId('inQtyToko3').value = 0;
  if (byId('curStockToko1')) byId('curStockToko1').innerHTML = '0';
  if (byId('curStockToko2')) byId('curStockToko2').innerHTML = '0';
  if (byId('curStockToko3')) byId('curStockToko3').innerHTML = '0';
  if (byId('codeAutoHint')) byId('codeAutoHint').innerHTML = '';
  clearPhotoPreview();
}

function prefillStockIn(code) {
  switchTab('masuk');
  if (byId('inCode')) {
    byId('inCode').value = code;
    onCodeInputChanged();
  }
  window.scrollTo(0, 0);
}

function submitStockIn(evt) {
  if (evt && evt.preventDefault) evt.preventDefault();

  var code = byId('inCode') ? byId('inCode').value.replace(/^\s+|\s+$/g, '').toUpperCase() : '';
  var name = byId('inName') ? byId('inName').value.replace(/^\s+|\s+$/g, '') : '';
  var category = byId('inCategory') ? byId('inCategory').value : 'Kebutuhan Keluarga';
  var supplier = byId('inSupplier') ? byId('inSupplier').value.replace(/^\s+|\s+$/g, '') : 'Supplier Umum';
  var invoiceNo = byId('inInvoice') ? byId('inInvoice').value.replace(/^\s+|\s+$/g, '') : '-';
  var brand = byId('inBrand') ? byId('inBrand').value.replace(/^\s+|\s+$/g, '') : '-';
  var unit = byId('inUnit') ? byId('inUnit').value : 'Pcs';
  var costPrice = Number(byId('inCostPrice') ? byId('inCostPrice').value : 0) || 0;
  var sellPrice = Number(byId('inSellPrice') ? byId('inSellPrice').value : 0) || 0;
  var wholesalePrice = Number(byId('inWholesalePrice') ? byId('inWholesalePrice').value : 0) || 0;
  var minStock = Number(byId('inMinStock') ? byId('inMinStock').value : 5) || 5;

  var q1 = parseInt(byId('inQtyToko1') ? byId('inQtyToko1').value : 0, 10) || 0;
  var q2 = parseInt(byId('inQtyToko2') ? byId('inQtyToko2').value : 0, 10) || 0;
  var q3 = parseInt(byId('inQtyToko3') ? byId('inQtyToko3').value : 0, 10) || 0;
  var note = byId('inNote') ? byId('inNote').value : '';

  if (!code || !name) {
    alert('Kode Barang dan Nama Barang wajib diisi!');
    return;
  }

  var existing = findProductByCode(code);
  if ((q1 + q2 + q3) <= 0 && !existing) {
    alert('Masukkan jumlah barang masuk minimal ke salah satu toko (Toko 1, Toko 2, atau Toko 3)!');
    return;
  }

  var payload = {
    code: code,
    name: name,
    category: category,
    supplier: supplier,
    invoiceNo: invoiceNo,
    brand: brand,
    unit: unit,
    costPrice: costPrice,
    sellPrice: sellPrice,
    wholesalePrice: wholesalePrice,
    minStock: minStock,
    qtyToko1: q1,
    qtyToko2: q2,
    qtyToko3: q3,
    photo: currentPhotoDataUrl,
    note: note,
    allowZeroQty: Boolean(existing)
  };

  var now = new Date().toISOString();
  if (!existing) {
    existing = {
      id: 'p_' + Date.now(),
      code: code,
      name: name,
      category: category,
      brand: brand,
      unit: unit,
      costPrice: costPrice,
      sellPrice: sellPrice,
      wholesalePrice: wholesalePrice,
      minStock: minStock,
      stock: { toko1: 0, toko2: 0, toko3: 0 },
      photo: currentPhotoDataUrl || '',
      updatedAt: now
    };
    appDB.products.unshift(existing);
  } else {
    existing.name = name;
    existing.category = category;
    existing.brand = brand;
    existing.unit = unit;
    existing.costPrice = costPrice;
    existing.sellPrice = sellPrice;
    existing.wholesalePrice = wholesalePrice;
    existing.minStock = minStock;
    if (currentPhotoDataUrl) existing.photo = currentPhotoDataUrl;
    existing.updatedAt = now;
  }

  existing.stock.toko1 = (existing.stock.toko1 || 0) + q1;
  existing.stock.toko2 = (existing.stock.toko2 || 0) + q2;
  existing.stock.toko3 = (existing.stock.toko3 || 0) + q3;

  var storesAdded = [
    { id: 'toko1', qty: q1 },
    { id: 'toko2', qty: q2 },
    { id: 'toko3', qty: q3 }
  ];
  for (var s = 0; s < storesAdded.length; s++) {
    if (storesAdded[s].qty > 0) {
      appDB.transactions.unshift({
        id: 'tx_' + Date.now() + '_' + s,
        type: 'IN',
        date: now,
        code: code,
        productName: name,
        category: category,
        supplier: supplier,
        invoiceNo: invoiceNo,
        targetStore: storesAdded[s].id,
        qty: storesAdded[s].qty,
        note: note || 'Barang masuk dari supplier'
      });
    }
  }

  saveToLocalCache(true);
  resetStockInForm();
  showToast('Stok ' + code + ' berhasil disimpan & masuk kategori ' + category + '!');
  switchTab('rekap');

  apiRequest('POST', '/api/stock-in', payload, function (err, res) {
    if (!err && res && res.db) {
      appDB = res.db;
      saveToLocalCache(false);
      updateSyncBadge(true, 'Tersimpan di Semua Perangkat');
      renderAll();
      pushToExternalCloudIfConfigured();
    } else {
      updateSyncBadge(false, 'Tersimpan di Memori iPad (Offline)');
      pushToExternalCloudIfConfigured();
    }
  });
}

/* ---------- BARANG KELUAR & PINDAH/MUTASI ANTAR TOKO ---------- */
function renderMutasiSelectors() {
  var prods = appDB.products || [];
  var html = '';
  for (var i = 0; i < prods.length; i++) {
    var p = prods[i];
    var s1 = (p.stock && p.stock.toko1) || 0;
    var s2 = (p.stock && p.stock.toko2) || 0;
    var s3 = (p.stock && p.stock.toko3) || 0;
    html += '<option value="' + escapeHtml(p.code) + '">' +
      escapeHtml(p.code) + ' - ' + escapeHtml(p.name) +
      ' (T1:' + s1 + ' | T2:' + s2 + ' | T3:' + s3 + ')' +
    '</option>';
  }

  var outSel = byId('outProductSelect');
  var tfSel = byId('tfProductSelect');
  if (outSel) {
    var prevOut = outSel.value;
    outSel.innerHTML = html;
    if (prevOut) outSel.value = prevOut;
  }
  if (tfSel) {
    var prevTf = tfSel.value;
    tfSel.innerHTML = html;
    if (prevTf) tfSel.value = prevTf;
  }
  updateOutStockInfo();
  updateTfStockInfo();
}

function updateOutStockInfo() {
  var code = byId('outProductSelect') ? byId('outProductSelect').value : '';
  var store = byId('outStoreSelect') ? byId('outStoreSelect').value : 'toko1';
  var hint = byId('outStockHint');
  var p = findProductByCode(code);
  if (p && hint) {
    var avail = (p.stock && p.stock[store]) || 0;
    hint.innerHTML = 'Stok tersedia di <strong>' + escapeHtml(getStoreName(store)) + '</strong>: <strong>' + avail + ' ' + escapeHtml(p.unit || 'Pcs') + '</strong>';
  }
}

function updateTfStockInfo() {
  var code = byId('tfProductSelect') ? byId('tfProductSelect').value : '';
  var store = byId('tfFromStore') ? byId('tfFromStore').value : 'toko1';
  var hint = byId('tfStockHint');
  var p = findProductByCode(code);
  if (p && hint) {
    var avail = (p.stock && p.stock[store]) || 0;
    hint.innerHTML = 'Stok di toko asal (<strong>' + escapeHtml(getStoreName(store)) + '</strong>): <strong>' + avail + ' ' + escapeHtml(p.unit || 'Pcs') + '</strong>';
  }
}

function submitStockOut(evt) {
  if (evt && evt.preventDefault) evt.preventDefault();
  var code = byId('outProductSelect') ? byId('outProductSelect').value : '';
  var store = byId('outStoreSelect') ? byId('outStoreSelect').value : 'toko1';
  var qty = parseInt(byId('outQty') ? byId('outQty').value : 0, 10) || 0;
  var note = byId('outNote') ? byId('outNote').value : 'Barang Rusak / Keluar';

  var p = findProductByCode(code);
  if (!p || qty <= 0) return;

  p.stock[store] = Math.max(0, (p.stock[store] || 0) - qty);
  p.updatedAt = new Date().toISOString();
  appDB.transactions.unshift({
    id: 'tx_' + Date.now(),
    type: 'OUT',
    date: p.updatedAt,
    code: p.code,
    productName: p.name,
    category: p.category,
    fromStore: store,
    qty: qty,
    note: note
  });

  saveToLocalCache(true);
  renderAll();
  showToast('Stok ' + code + ' di ' + getStoreName(store) + ' dikurangi ' + qty);

  apiRequest('POST', '/api/stock-move', {
    type: 'OUT',
    code: code,
    fromStore: store,
    qty: qty,
    note: note
  }, function (err, res) {
    if (!err && res && res.db) {
      appDB = res.db;
      saveToLocalCache(false);
      updateSyncBadge(true, 'Tersimpan di Semua Perangkat');
      renderAll();
      pushToExternalCloudIfConfigured();
    } else {
      updateSyncBadge(false, 'Tersimpan di Memori iPad (Offline)');
    }
  });
}

function submitStockTransfer(evt) {
  if (evt && evt.preventDefault) evt.preventDefault();
  var code = byId('tfProductSelect') ? byId('tfProductSelect').value : '';
  var fromStore = byId('tfFromStore') ? byId('tfFromStore').value : 'toko1';
  var targetStore = byId('tfTargetStore') ? byId('tfTargetStore').value : 'toko2';
  var qty = parseInt(byId('tfQty') ? byId('tfQty').value : 0, 10) || 0;
  var note = byId('tfNote') ? byId('tfNote').value : 'Pindah stok antar toko';

  if (fromStore === targetStore) {
    alert('Toko Asal dan Toko Tujuan tidak boleh sama!');
    return;
  }

  var p = findProductByCode(code);
  if (!p || qty <= 0) return;

  var avail = (p.stock && p.stock[fromStore]) || 0;
  if (avail < qty) {
    alert('Stok di ' + getStoreName(fromStore) + ' hanya ada ' + avail + ', tidak cukup untuk dipindahkan ' + qty + '!');
    return;
  }

  p.stock[fromStore] = avail - qty;
  p.stock[targetStore] = ((p.stock && p.stock[targetStore]) || 0) + qty;
  p.updatedAt = new Date().toISOString();

  appDB.transactions.unshift({
    id: 'tx_' + Date.now(),
    type: 'TRANSFER',
    date: p.updatedAt,
    code: p.code,
    productName: p.name,
    category: p.category,
    fromStore: fromStore,
    targetStore: targetStore,
    qty: qty,
    note: note
  });

  saveToLocalCache(true);
  renderAll();
  showToast('Berhasil pindah ' + qty + ' ' + p.code + ' dari ' + getStoreName(fromStore) + ' ke ' + getStoreName(targetStore));

  apiRequest('POST', '/api/stock-move', {
    type: 'TRANSFER',
    code: code,
    fromStore: fromStore,
    targetStore: targetStore,
    qty: qty,
    note: note
  }, function (err, res) {
    if (!err && res && res.db) {
      appDB = res.db;
      saveToLocalCache(false);
      updateSyncBadge(true, 'Tersimpan di Semua Perangkat');
      renderAll();
      pushToExternalCloudIfConfigured();
    } else {
      updateSyncBadge(false, 'Tersimpan di Memori iPad (Offline)');
    }
  });
}

/* ---------- KATALOG FOTO & KATEGORI PRODUK OTOMATIS ---------- */
function setCatalogCategory(cat) {
  activeCatalogCategory = cat;
  renderCatalogView();
}

function renderCatalogView() {
  var pillsBox = byId('catalogCategoryPills');
  var gridBox = byId('catalogGridContainer');
  if (!pillsBox || !gridBox) return;

  var cats = getAllCategories();
  var prods = appDB.products || [];

  var pillsHtml = '<button type="button" class="cat-pill' + (activeCatalogCategory === 'ALL' ? ' active' : '') + '" onclick="setCatalogCategory(\'ALL\')">Semua Kategori (' + prods.length + ')</button>';

  for (var i = 0; i < cats.length; i++) {
    var cName = cats[i];
    var cnt = 0;
    for (var j = 0; j < prods.length; j++) {
      if (prods[j].category === cName) cnt++;
    }
    if (cnt > 0 || activeCatalogCategory === cName) {
      pillsHtml += '<button type="button" class="cat-pill' + (activeCatalogCategory === cName ? ' active' : '') + '" onclick="setCatalogCategory(\'' + escapeHtml(cName) + '\')">' +
        escapeHtml(cName) + ' (' + cnt + ')' +
      '</button>';
    }
  }
  pillsBox.innerHTML = pillsHtml;

  var cardsHtml = '';
  for (var k = 0; k < prods.length; k++) {
    var p = prods[k];
    if (activeCatalogCategory !== 'ALL' && p.category !== activeCatalogCategory) continue;

    var s1 = (p.stock && p.stock.toko1) || 0;
    var s2 = (p.stock && p.stock.toko2) || 0;
    var s3 = (p.stock && p.stock.toko3) || 0;
    var tot = s1 + s2 + s3;

    var imgPart = p.photo
      ? '<img src="' + p.photo + '" alt="foto" style="width:100%; height:150px; object-fit:cover; border-radius:8px; border:1px solid #cbd5e1; margin-bottom:8px;">'
      : '<div style="width:100%; height:150px; border-radius:8px; background:#eff6ff; color:#1d4ed8; text-align:center; line-height:150px; font-size:28px; font-weight:800; border:1px solid #bfdbfe; margin-bottom:8px;">' + escapeHtml(p.code) + '</div>';

    cardsHtml += '<div class="catalog-item">' +
      '<div class="catalog-card">' +
        imgPart +
        '<div style="display:flex; justify-content:space-between; align-items:center;">' +
          '<span class="badge">' + escapeHtml(p.category) + '</span>' +
          '<strong style="font-size:13px; color:#1e40af;">' + escapeHtml(p.code) + '</strong>' +
        '</div>' +
        '<div style="font-weight:800; font-size:15px; margin:6px 0 4px 0; color:#0f172a;">' + escapeHtml(p.name) + '</div>' +
        '<div style="font-size:13px; color:#059669; font-weight:700; margin-bottom:8px;">Ecer: ' + formatRupiah(p.sellPrice) + ' / ' + escapeHtml(p.unit || 'Pcs') + '</div>' +
        '<div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:6px; font-size:12px; margin-bottom:8px;">' +
          '<div>' + escapeHtml(getStoreName('toko1')) + ': <strong>' + s1 + '</strong></div>' +
          '<div>' + escapeHtml(getStoreName('toko2')) + ': <strong>' + s2 + '</strong></div>' +
          '<div>' + escapeHtml(getStoreName('toko3')) + ': <strong>' + s3 + '</strong></div>' +
          '<div style="border-top:1px solid #cbd5e1; margin-top:4px; padding-top:4px; font-weight:800;">Total 3 Toko: ' + tot + ' ' + escapeHtml(p.unit || 'Pcs') + '</div>' +
        '</div>' +
        '<div style="display:flex;">' +
          '<button type="button" class="btn btn-success btn-sm" style="flex:1; margin-right:4px;" onclick="quickSellFromTable(\'' + escapeHtml(p.code) + '\')">Jual</button>' +
          '<button type="button" class="btn btn-outline btn-sm" style="flex:1;" onclick="prefillStockIn(\'' + escapeHtml(p.code) + '\')">+Stok/Foto</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  if (!cardsHtml) {
    cardsHtml = '<div style="padding:20px; color:#64748b;">Belum ada produk di kategori ini.</div>';
  }
  gridBox.innerHTML = cardsHtml;
}

/* ---------- RIWAYAT TRANSAKSI, PENGATURAN TOKO, & BACKUP ---------- */
function renderHistoryView() {
  var tbody = byId('historyTableBody');
  if (!tbody) return;
  var txs = appDB.transactions || [];
  var html = '';

  for (var i = 0; i < Math.min(txs.length, 120); i++) {
    var tx = txs[i];
    var badgeType = '';
    var routeInfo = '';
    var noteInfo = '';

    if (tx.type === 'SALE') {
      badgeType = '<span class="badge" style="background:#dcfce7; color:#15803d; border:1px solid #86efac;">PENJUALAN KASIR</span>';
      routeInfo = 'Terjual di <strong>' + escapeHtml(getStoreName(tx.fromStore)) + '</strong>';
      noteInfo = (tx.subtotal ? '<strong>' + formatRupiah(tx.subtotal) + '</strong> &bull; ' : '') +
        (tx.invoiceNo ? 'No: ' + escapeHtml(tx.invoiceNo) + ' &bull; ' : '') + escapeHtml(tx.note || '');
    } else if (tx.type === 'IN') {
      badgeType = '<span class="badge" style="background:#dbeafe; color:#1e40af;">BARANG MASUK</span>';
      routeInfo = 'Supplier: <strong>' + escapeHtml(tx.supplier || 'Umum') + '</strong> &rarr; <strong>' + escapeHtml(getStoreName(tx.targetStore)) + '</strong>';
      noteInfo = (tx.invoiceNo && tx.invoiceNo !== '-' ? 'Nota: ' + escapeHtml(tx.invoiceNo) + ' &bull; ' : '') + escapeHtml(tx.note || '-');
    } else if (tx.type === 'TRANSFER') {
      badgeType = '<span class="badge" style="background:#ede9fe; color:#6d28d9;">PINDAH TOKO</span>';
      routeInfo = 'Dari <strong>' + escapeHtml(getStoreName(tx.fromStore)) + '</strong> &rarr; Ke <strong>' + escapeHtml(getStoreName(tx.targetStore)) + '</strong>';
      noteInfo = escapeHtml(tx.note || '-');
    } else {
      badgeType = '<span class="badge badge-low">BARANG KELUAR</span>';
      routeInfo = 'Keluar dari <strong>' + escapeHtml(getStoreName(tx.fromStore)) + '</strong>';
      noteInfo = escapeHtml(tx.note || '-');
    }

    html += '<tr>' +
      '<td style="font-size:12px; color:#475569;">' + escapeHtml(formatDateId(tx.date)) + '</td>' +
      '<td>' + badgeType + '</td>' +
      '<td><strong>' + escapeHtml(tx.code) + '</strong> - ' + escapeHtml(tx.productName) + '</td>' +
      '<td>' + routeInfo + '</td>' +
      '<td style="font-weight:800;">' + escapeHtml(tx.qty) + '</td>' +
      '<td style="font-size:12px; color:#475569;">' + noteInfo + '</td>' +
    '</tr>';
  }

  if (!html) {
    html = '<tr><td colspan="6" style="text-align:center; padding:20px; color:#64748b;">Belum ada riwayat transaksi.</td></tr>';
  }
  tbody.innerHTML = html;
}

function saveStoreNames() {
  var bName = byId('cfgBusinessName') ? byId('cfgBusinessName').value : 'Berkah Plastik';
  var s1 = byId('cfgStore1') ? byId('cfgStore1').value : 'Toko 1';
  var s2 = byId('cfgStore2') ? byId('cfgStore2').value : 'Toko 2';
  var s3 = byId('cfgStore3') ? byId('cfgStore3').value : 'Toko 3';

  appDB.settings.businessName = bName;
  appDB.settings.stores = [
    { id: 'toko1', name: s1 },
    { id: 'toko2', name: s2 },
    { id: 'toko3', name: s3 }
  ];

  saveToLocalCache(true);
  renderAll();
  showToast('Nama Usaha & Toko 1, 2, 3 berhasil diperbarui!');

  apiRequest('POST', '/api/settings', {
    businessName: bName,
    stores: appDB.settings.stores
  }, function () {
    saveToLocalCache(false);
    pushToExternalCloudIfConfigured();
  });
}

function saveCloudConfig() {
  var url = byId('cfgCloudUrl') ? byId('cfgCloudUrl').value.replace(/^\s+|\s+$/g, '') : '';
  appDB.settings.cloudSyncUrl = url;
  saveToLocalCache(false);

  apiRequest('POST', '/api/settings', { cloudSyncUrl: url }, function () {});

  if (!url) {
    showToast('URL Cloud dikosongkan (menggunakan server lokal).');
    return;
  }

  showToast('Menghubungkan & menyinkronkan ke Cloud...');
  pullFromExternalCloudIfConfigured(function (pulled) {
    if (!pulled) {
      pushToExternalCloudIfConfigured();
      showToast('Data stok berhasil diunggah ke Cloud Online!');
    } else {
      showToast('Data berhasil disinkronkan dari Cloud Online!');
    }
  });
}

function exportBackupJSON() {
  var dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(appDB, null, 2));
  var a = document.createElement('a');
  a.setAttribute('href', dataStr);
  a.setAttribute('download', 'backup-stok-3toko-' + new Date().toISOString().slice(0, 10) + '.json');
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function exportBackupCSV() {
  var prods = appDB.products || [];
  var lines = ['Kode,Nama Barang,Kategori,Merek,Satuan,Harga Modal,Harga Jual Ecer,Harga Grosir,Stok Toko 1,Stok Toko 2,Stok Toko 3,Total Stok'];
  for (var i = 0; i < prods.length; i++) {
    var p = prods[i];
    var s1 = (p.stock && p.stock.toko1) || 0;
    var s2 = (p.stock && p.stock.toko2) || 0;
    var s3 = (p.stock && p.stock.toko3) || 0;
    var row = [
      '"' + String(p.code || '').replace(/"/g, '""') + '"',
      '"' + String(p.name || '').replace(/"/g, '""') + '"',
      '"' + String(p.category || '').replace(/"/g, '""') + '"',
      '"' + String(p.brand || '').replace(/"/g, '""') + '"',
      '"' + String(p.unit || 'Pcs').replace(/"/g, '""') + '"',
      p.costPrice || 0,
      p.sellPrice || 0,
      p.wholesalePrice || 0,
      s1,
      s2,
      s3,
      (s1 + s2 + s3)
    ];
    lines.push(row.join(','));
  }
  var csvStr = 'data:text/csv;charset=utf-8,' + encodeURIComponent(lines.join('\r\n'));
  var a = document.createElement('a');
  a.setAttribute('href', csvStr);
  a.setAttribute('download', 'rekap-stok-3toko-' + new Date().toISOString().slice(0, 10) + '.csv');
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function importBackupJSON(evt) {
  var files = evt.target.files;
  if (!files || !files[0]) return;
  var reader = new FileReader();
  reader.onload = function (e) {
    try {
      var parsed = JSON.parse(e.target.result);
      if (parsed && parsed.products) {
        if (!parsed.sales) parsed.sales = [];
        if (!parsed.transactions) parsed.transactions = [];
        appDB = parsed;
        saveToLocalCache(false);
        renderAll();
        apiRequest('POST', '/api/sync', { db: appDB }, function () {});
        pushToExternalCloudIfConfigured();
        showToast('Data backup berhasil dipulihkan!');
      } else {
        alert('File JSON tidak sesuai format backup.');
      }
    } catch (err) {
      alert('Gagal membaca file backup JSON.');
    }
  };
  reader.readAsText(files[0]);
}

/* ---------- INISIALISASI & AUTO-SYNC ANTAR PERANGKAT ---------- */
window.onload = function () {
  fetchInitialState(false);

  // Sinkronisasi otomatis setiap 6 detik agar penjualan / perubahan stok
  // dari perangkat lain langsung tampil di layar perangkat ini
  setInterval(function () {
    var activeTag = document.activeElement ? document.activeElement.tagName : '';
    if (activeTag === 'INPUT' || activeTag === 'TEXTAREA' || activeTag === 'SELECT') {
      return; // Jangan ganggu saat user sedang mengetik
    }
    fetchInitialState(true);
  }, 6000);
};
