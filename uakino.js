/*
 * UAKino Direct — Test 3: HTML access diagnostics (2026-11-01)
 * Website: uakino.best (as used by CakesTwix Cloudstream UakinoProvider).
 * Purpose: test ONE manually initiated GET per button press via Lampa native/WebView.
 * Does not scrape videos, search, handle accounts, bypass challenges, use proxies,
 * impersonate application authentication, or repeat requests automatically.
 * If access is denied (403/429), both diagnostics are paused for 30 minutes.
 */
(function () {
  'use strict';
  if (window.__UAKinoDirectT3Loaded) return;
  window.__UAKinoDirectT3Loaded = true;

  var TITLE = 'UAKino Direct · Test 3';
  var COMPONENT = 'uakino_direct_t3';
  var URL = 'https://uakino.best/';
  var COOLDOWN_KEY = 'uakino_t3_html_cooldown_until';
  var COOLDOWN_MS = 30 * 60 * 1000;
  var MIN_INTERVAL_MS = 30 * 1000;
  var report = [];
  var busy = false;
  var ready = false;
  var attempts = 0;
  var bootTimer = 0;
  var lastAttempt = 0;
  var cooldownUntil = 0;

  function time() {
    var d = new Date();
    function p(n) {return (n < 10 ? '0' : '') + n;}
    return p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
  }
  function append(message) {
    var text = time() + '  ' + message;
    report.push(text);
    if (report.length > 16) report.shift();
    try {console.log('[' + TITLE + '] ' + message);} catch (e) {}
  }
  function inform(message) {
    try {
      if (window.Lampa && Lampa.Noty && Lampa.Noty.show) {
        Lampa.Noty.show(message);
        return;
      }
    } catch (e) {}
    try {console.log('[' + TITLE + '] ' + message);} catch (e) {}
  }
  function getStoredCooldown() {
    try {
      if (window.Lampa && Lampa.Storage && Lampa.Storage.get) {
        return Math.max(0, Number(Lampa.Storage.get(COOLDOWN_KEY, 0)) || 0);
      }
    } catch (e) {}
    return 0;
  }
  function lockout() {
    cooldownUntil = Date.now() + COOLDOWN_MS;
    try {
      if (Lampa.Storage && Lampa.Storage.set) Lampa.Storage.set(COOLDOWN_KEY, cooldownUntil);
    } catch (e) {}
  }
  function responseCode(a, b) {
    for (var i = 0; i < 2; i++) {
      var x = i ? b : a;
      if (x === null || x === undefined) continue;
      if (typeof x === 'number' && x >= 100 && x <= 599) return x;
      if (typeof x === 'object') {
        var n = Number(x.status || x.statusCode || (x.xhr && x.xhr.status) || 0);
        if (n >= 100 && n <= 599) return n;
      }
      if (typeof x === 'string') {
        var match = x.match(/(?:HTTP\s*)?\b(401|403|404|405|408|429|5\d\d)\b/i);
        if (match) return Number(match[1]);
      }
    }
    return 0;
  }
  function inspectPage(payload) {
    var s = '';
    if (typeof payload === 'string') s = payload;
    else if (payload && typeof payload === 'object') {
      if (typeof payload.responseText === 'string') s = payload.responseText;
      else if (typeof payload.body === 'string') s = payload.body;
      else return 'отримано об’єкт, а не HTML';
    }
    if (!s.trim()) return 'порожня відповідь';
    var isHtml = /<!doctype\s+html|<html\b|<head\b|<body\b/i.test(s.slice(0, 2000));
    var challenge = /cf-chl-|challenge-platform|just a moment|attention required|checking your browser|cloudflare\s+ray\s+id|\bturnstile\b/i.test(s.slice(0, 20000));
    var hasSite = /dle-content|dle_search|dle_login_hash|shortstory|movie-item|movies-grid|\/engine\/|uakino/i.test(s.slice(0, 50000));
    if (challenge) return 'HTML з ознаками сторінки перевірки захисту; обсяг ' + s.length + ' символів';
    if (isHtml && hasSite) return 'HTML сайту ймовірно отримано; обсяг ' + s.length + ' символів (доступ до відео ще не перевірено)';
    if (isHtml) return 'отримано HTML, але належність основній сторінці не підтверджено; обсяг ' + s.length + ' символів';
    return 'отримано дані не схожі на HTML; обсяг ' + s.length + ' символів';
  }
  function verdict(code) {
    if (code === 403) return 'HTTP 403 — доступ відхилено, причина невідома (можливий захист/правила сайту)';
    if (code === 429) return 'HTTP 429 — обмеження запитів';
    if (code === 401) return 'HTTP 401 — потрібна авторизація';
    if (code === 404) return 'HTTP 404 — шлях не знайдено';
    if (code === 405) return 'HTTP 405 — метод запиту не підтримується';
    if (code >= 500) return 'HTTP ' + code + ' — помилка сервера';
    if (code >= 400) return 'HTTP ' + code + ' — відмова сервера';
    if (code >= 200 && code <= 399) return 'HTTP ' + code;
    return 'HTTP-код недоступний (CORS, мережа або збій клієнта — причина невідома)';
  }
  function run(method) {
    if (busy) {inform('Зачекай завершення попередньої перевірки'); return;}
    if (!window.Lampa || !Lampa.Reguest) {inform('Мережевий модуль Lampa недоступний'); return;}
    var until = Math.max(cooldownUntil, getStoredCooldown());
    if (Date.now() < until) {
      inform('Після HTTP 403/429 перевірки призупинені ще на ' + Math.ceil((until - Date.now()) / 60000) + ' хв');
      return;
    }
    if (Date.now() - lastAttempt < MIN_INTERVAL_MS) {
      inform('Між перевірками потрібна пауза щонайменше 30 секунд');
      return;
    }
    var net = new Lampa.Reguest();
    if (typeof net[method] !== 'function') {
      append('[' + method + '] метод не підтримується цим застосунком Lampa');
      inform('На цьому пристрої метод ' + method + ' недоступний');
      return;
    }
    lastAttempt = Date.now();
    busy = true;
    var start = Date.now();
    var finished = false;
    var watchdog = setTimeout(function () {complete(false, 0, null, '15-секундний тайм-аут');}, 15000);
    var methodLabel = method === 'native' ? 'Native' : 'WebView';
    function complete(ok, code, data, errorNote) {
      if (finished) return;
      finished = true;
      busy = false;
      clearTimeout(watchdog);
      if (code === 403 || code === 429) lockout();
      var out = 'UAKino HTML [' + methodLabel + '] — ';
      if (ok) {
        // A successful callback does not always expose an HTTP status.
        out += (code ? verdict(code) + '; ' : 'отримано відповідь; HTTP-код не наданий; ');
        out += inspectPage(data);
      } else {
        out += code ? verdict(code) : (errorNote || verdict(0));
      }
      out += '; ' + Math.max(0, Date.now() - start) + ' мс';
      append(out);
      inform(ok ? 'UAKino: відповідь отримано, подивись звіт' : ('UAKino: ' + (code ? 'HTTP ' + code : 'помилка з’єднання')));
    }
    try {
      if (net.timeout) net.timeout(12000);
      net[method](URL,
        function (data, extra) {complete(true, responseCode(extra, null), data, '');},
        function (a, b) {complete(false, responseCode(a, b), null, 'Немає доступного HTTP-коду (мережа/CORS/тайм-аут)');},
        false,
        {dataType:'text', headers:{'Accept':'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8','Accept-Language':'uk-UA,uk;q=0.9'}}
      );
    } catch (e) {
      complete(false, 0, null, 'Помилка клієнта Lampa: запит не виконано');
    }
  }
  function reportText() {
    return 'UAKino Direct — Test 3 (HTML diagnostics)\n' +
      'Адреса: https://uakino.best/ (основний UAKino, не uakino.ax)\n' +
      'Лише ручні GET; без облікових даних, обходу захисту чи повторів.\n' +
      'HTTP 403/429 зупиняє діагностику на 30 хв.\n\n' +
      (report.length ? report.join('\n') : 'Перевірок ще немає.');
  }
  function viewReport() {
    var text = reportText();
    try {
      if (Lampa.Input && Lampa.Input.edit) {
        Lampa.Input.edit({title:'UAKino Test 3 · Діагностичний звіт', value:text, free:true, nosave:true},function(){});
        return;
      }
    } catch (e) {}
    inform(report.length ? report[report.length - 1] : 'Перевірок ще немає');
  }
  function addButton(key, title, description, action) {
    Lampa.SettingsApi.addParam({
      component:COMPONENT,
      param:{name:'uakino_t3_' + key, type:'button'},
      field:{name:title, description:description},
      onChange:action
    });
  }
  function initialize() {
    if (ready || !window.Lampa || !Lampa.SettingsApi || !Lampa.SettingsApi.addComponent || !Lampa.SettingsApi.addParam) return;
    try {
      Lampa.SettingsApi.addComponent({
        component:COMPONENT,
        name:'UAKino Direct · Test 3',
        icon:'<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="9"/><path d="m10 8 6 4-6 4z"/></svg>'
      });
      addButton('native','1. Перевірити сайт через Native','Один GET до uakino.best; рекомендований перший тест',function(){run('native');});
      addButton('web','2. Порівняти через WebView','Необов’язковий окремий GET; тільки після першого тесту та паузи',function(){run('silent');});
      addButton('report','3. Показати звіт','Результат перевірки для надсилання в чат',viewReport);
      ready = true;
      append('Діагностика завантажена; запитів ще немає.');
    } catch (e) {
      append('Помилка реєстрації налаштувань: ' + String(e && e.message || e));
    }
  }
  if (window.Lampa && Lampa.Listener && Lampa.Listener.follow) {
    try {Lampa.Listener.follow('app',function(e){if(e && e.type==='ready')initialize();});} catch (e) {}
  }
  initialize();
  if (!ready) bootTimer = setInterval(function () {
    initialize();
    if (ready || ++attempts >= 50) clearInterval(bootTimer);
  },300);

  window.__UAKINO_DIRECT_TEST3__ = {
    version:'3.0.0-html-diag',
    report:reportText,
    status:function(){return {ready:ready,busy:busy,cooldownSeconds:Math.max(0,Math.ceil((Math.max(cooldownUntil,getStoredCooldown())-Date.now())/1000))};}
  };
})();
