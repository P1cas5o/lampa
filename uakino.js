/*
 * UAKino Direct — Test 2: API Access Diagnostics (2026-11-01)
 * Source of endpoint names: user-provided uakino_1.15.apk (static inspection).
 * This diagnostic does NOT establish that api.uakino.app is an official/public API.
 * No account, bypass, stream extraction, playback or proxy is implemented.
 * One request only per explicit button press, no automatic polling or retries.
 * This is a separate plugin; disable UAKino Direct Test 1 when testing.
 */
(function () {
  'use strict';
  if (window.__uakinoDirectT2Loaded) return;
  window.__uakinoDirectT2Loaded = true;

  var LABEL = 'UAKino Direct Test 2';
  var HOST = 'https://api.uakino.app';
  var PATHS = {
    api: '/',
    catalog: '/api/v1/filter'
  };
  var report = [];
  var busy = false;
  var booted = false;
  var slowDownUntil = 0;
  var lastAction = {};
  var initTries = 0;
  var initTimer = 0;
  var names = {api: 'API · базовий шлях', catalog: 'API · каталог /filter'};

  function notify(s) {
    try { if (Lampa.Noty && Lampa.Noty.show) { Lampa.Noty.show(s); return; } } catch (e) {}
    try { console.log('[' + LABEL + '] ' + s); } catch (e) {}
  }
  function now() { return Date.now(); }
  function stamp() {
    var d = new Date();
    return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2) + ':' + ('0' + d.getSeconds()).slice(-2);
  }
  function record(line) {
    report.push(stamp() + '  ' + String(line));
    if (report.length > 15) report.shift();
    try { console.log('[' + LABEL + '] ' + line); } catch (e) {}
  }
  function reportText() {
    return 'UAKino Direct — Test 2 (API diagnostics)\n' +
      'Джерело адрес: наданий APK UAKino 1.15; належність API не перевірена.\n' +
      'Запити запускаються лише натисканням кнопки. Авторизація не використовується.\n' +
      (report.length ? report.join('\n') : 'Тести ще не запускалися.');
  }
  function describeHttp(code, kind) {
    var c = Number(code) || 0;
    if (c === 429) return 'HTTP 429 — обмеження частоти запитів; тести призупинено';
    if (c === 403) return 'HTTP 403 — доступ заборонений; причина (Cloudflare/авторизація) не визначена';
    if (c === 401) return 'HTTP 401 — потрібна авторизація';
    if (c === 404) return 'HTTP 404 — шлях не знайдений (це не доказ блокування API)';
    if (c === 405) return 'HTTP 405 — неправильний метод GET; маршрут відповідає';
    if (c >= 500) return 'HTTP ' + c + ' — серверна помилка';
    if (c >= 400) return 'HTTP ' + c + ' — запит відхилений';
    if (c >= 200 && c < 300 && kind === 'json') return 'HTTP ' + c + ' — отримано JSON';
    if (c >= 200 && c < 300 && kind === 'html') return 'HTTP ' + c + ' — отримано HTML, а не JSON';
    if (c >= 200 && c < 300) return 'HTTP ' + c + ' — сервер відповів (' + kind + ')';
    return 'Немає доступного HTTP-коду (мережа/CORS/тайм-аут, не можна визначити причину)';
  }
  function statusCode(a, b) {
    for (var i = 0; i < 2; i++) {
      var x = i ? b : a;
      if (x === null || x === undefined) continue;
      if (typeof x === 'number' && x >= 100 && x <= 599) return x;
      if (typeof x === 'object') {
        var n = Number(x.status || x.statusCode || (x.xhr && x.xhr.status) || 0);
        if (n >= 100 && n <= 599) return n;
      }
      if (typeof x === 'string') {
        var m = x.match(/(?:HTTP\s*)?\b(401|403|404|405|429|5\d\d)\b/i);
        if (m) return Number(m[1]);
      }
    }
    return 0;
  }
  function inspectResponse(body) {
    if (body && typeof body === 'object') {
      return {kind: 'json', detail: Object.keys(body).slice(0, 6).join(', ') || '(порожній об’єкт)'};
    }
    var s = String(body === null || body === undefined ? '' : body).trim();
    if (!s) return {kind: 'empty', detail: 'порожня відповідь'};
    if (s[0] === '{' || s[0] === '[') {
      try {
        var parsed = JSON.parse(s);
        return {kind: 'json', detail: parsed && typeof parsed === 'object' ? Object.keys(parsed).slice(0, 6).join(', ') : 'значення JSON'};
      } catch (e) {}
    }
    if (/<(?:!doctype\s+html|html|head|body)\b/i.test(s.slice(0, 700))) {
      return {kind: 'html', detail: /challenge|cloudflare|cf-chl|just a moment/i.test(s.slice(0, 2500)) ? 'HTML із ознаками перевірки захисту' : 'сторінка HTML'};
    }
    return {kind: 'text', detail: 'текстова відповідь'};
  }
  function run(which, via) {
    if (busy) { notify('UAKino Test 2: попередній запит ще триває'); return; }
    if (now() < slowDownUntil) {
      notify('UAKino Test 2: після 403/429 запити тимчасово призупинені');
      return;
    }
    if (now() - (lastAction[which + ':' + via] || 0) < 30000) {
      notify('UAKino Test 2: між однаковими тестами потрібна пауза 30 с');
      return;
    }
    if (!window.Lampa || !Lampa.Reguest) {
      notify('UAKino Test 2: Lampa.Reguest недоступний');
      return;
    }
    var r = new Lampa.Reguest();
    if (typeof r[via] !== 'function') {
      notify('UAKino Test 2: метод Lampa.Reguest.' + via + ' недоступний');
      return;
    }
    // GET only; do not send or request credentials, cookies, video, or protected data.
    var url = HOST + PATHS[which];
    busy = true;
    lastAction[which + ':' + via] = now();
    var done = false;
    var begin = now();
    var guard = setTimeout(function () { finish(false, 0, null); }, 15000);
    function finish(ok, code, payload) {
      if (done) return;
      done = true;
      busy = false;
      clearTimeout(guard);
      if (code === 403 || code === 429) slowDownUntil = now() + 30 * 60 * 1000;
      var rinfo = ok ? inspectResponse(payload) : {kind: 'error', detail: ''};
      var verdict = describeHttp(code || (ok ? 200 : 0), rinfo.kind);
      var label = names[which] + ' [' + (via === 'native' ? 'native' : 'WebView') + ']';
      var note = label + ' — ' + verdict;
      if (ok && rinfo.detail) note += '; ' + rinfo.detail;
      note += '; ' + Math.max(0, now() - begin) + ' мс';
      record(note);
      notify('UAKino Test 2: ' + verdict);
    }
    try {
      if (r.timeout) r.timeout(10000);
      r[via](url,
        function (data) { finish(true, 200, data); },
        function (a, b) { finish(false, statusCode(a, b), null); },
        false,
        {dataType: 'text', headers: {'Accept': 'application/json'}}
      );
    } catch (e) {
      finish(false, 0, null);
    }
  }
  function showReport() {
    var s = reportText();
    try {
      if (Lampa.Input && Lampa.Input.edit) {
        Lampa.Input.edit({title:'UAKino Direct Test 2 · Звіт',value:s,free:true,nosave:true}, function () {});
        return;
      }
    } catch (e) {}
    notify(report.length ? report[report.length - 1] : 'Тестів ще немає');
  }
  function addAction(id, title, desc, fn) {
    Lampa.SettingsApi.addParam({
      component: 'uakino_direct_t2',
      param: {name:'uakino_t2_' + id, type:'button'},
      field: {name:title,description:desc},
      onChange: fn
    });
  }
  function init() {
    if (booted || !window.Lampa || !Lampa.SettingsApi || !Lampa.SettingsApi.addComponent || !Lampa.SettingsApi.addParam) return;
    booted = true;
    try {
      Lampa.SettingsApi.addComponent({
        component:'uakino_direct_t2',
        name:'UAKino Direct · Test 2',
        icon:'<svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="m10 8 6 4-6 4z"/></svg>'
      });
      addAction('api', '1. Перевірити відповідь API', 'Один GET до api.uakino.app/ через WebView; 404 тут можливий', function () {run('api','silent');});
      addAction('catalog', '2. Перевірити маршрут каталогу', 'Один GET /api/v1/filter через WebView; 405/400 можуть означати, що потрібен інший метод або параметри', function () {run('catalog','silent');});
      addAction('native', '3. Перевірити через Android-застосунок Lampa', 'Один GET /api/v1/filter через native (лише якщо підтримується); запуск вручну', function () {run('catalog','native');});
      addAction('report', '4. Переглянути діагностичний звіт', 'Результати HTTP без токенів, cookie, ідентифікаторів і вмісту відповідей', showReport);
      record('Діагностика завантажена. Запитів ще не надсилали.');
    } catch (e) {
      booted = false;
      record('Не вдалося створити налаштування: ' + String(e && e.message || e));
    }
  }
  if (window.Lampa && Lampa.Listener && Lampa.Listener.follow) {
    try { Lampa.Listener.follow('app', function (e) { if (e && e.type === 'ready') init(); }); } catch (e) {}
  }
  init();
  if (!booted) initTimer = setInterval(function () {
    init();
    if (booted || ++initTries > 50) clearInterval(initTimer);
  }, 300);

  window.__UAKINO_DIRECT_TEST2__ = {
    version: '2.0.0-diagnostic',
    report: reportText,
    status: function () { return {booted:booted,busy:busy,cooldown:Math.max(0,Math.ceil((slowDownUntil-now())/1000)),results:report.length}; },
    // Deliberately no play(), proxy() or credential APIs.
  };
})();
