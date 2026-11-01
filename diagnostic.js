/*
 * Lampa TG Sync Diagnostic v1.0.0 Test 1
 * Read-only network observation. No network requests, backup changes or storage writes.
 * Intended for the supplied kinohub.uk TG Cloud Sync plugin using $.ajax.
 */
(function () {
  'use strict';

  var FLAG = '__lexi_tg_sync_diagnostic_test1_loaded';
  if (window[FLAG]) return;
  window[FLAG] = true;

  var COMPONENT = 'lexi_tg_sync_diagnostic_test1';
  var LIMIT = 15;
  var records = [];
  var nextId = 0;
  var hooked = false;
  var settingsAdded = false;
  var attempts = 0;
  var lastError = '';

  function asText(value) { return String(value == null ? '' : value); }

  function safeCode(value) {
    var x = asText(value);
    // Never expose server messages, body, account IDs or tokens.
    return /^[a-z][a-z0-9_-]{0,63}$/i.test(x) ? x : '—';
  }

  function num(value) {
    if (value == null || value === '') return null;
    var n = Number(value);
    return isFinite(n) && n >= 0 ? n : null;
  }

  function fmtBytes(bytes) {
    if (bytes == null) return 'невідомо';
    if (bytes >= 1048576) return (bytes / 1048576).toFixed(2) + ' МіБ';
    if (bytes >= 1024) return (bytes / 1024).toFixed(1) + ' КіБ';
    return bytes + ' Б';
  }

  function requestBytes(str) {
    str = asText(str);
    try { if (typeof TextEncoder !== 'undefined') return (new TextEncoder()).encode(str).length; } catch (e) {}
    try { if (typeof Blob !== 'undefined') return (new Blob([str])).size; } catch (e2) {}
    // Accurate UTF-8 byte count for valid JS Unicode strings.
    try { return unescape(encodeURIComponent(str)).length; } catch (e3) {}
    return null;
  }

  function classify(url, method) {
    // A hostname/path allowlist: never capture other requests or URL parameters.
    var path = asText(url).split('?')[0].split('#')[0];
    if (!/^https?:\/\/kinohub\.uk(?::443)?\/lite\/tgcloudsync\/(?:save|status)\/?$/i.test(path)) return null;
    var step = /\/save\/?$/i.test(path) ? 'save' : 'status';
    if (step === 'save' && asText(method || 'GET').toUpperCase() !== 'POST') return null;
    if (step === 'status' && asText(method || 'GET').toUpperCase() !== 'GET') return null;
    return step;
  }

  function getRequestMeta(options) {
    var data = options && options.data;
    var info = { bytes: typeof data === 'string' ? requestBytes(data) : null, keys: null, baseRevision: null };
    // We only extract counts and revision; the original payload is never retained.
    if (typeof data === 'string' && data.length < 5000000) {
      try {
        var obj = JSON.parse(data);
        if (obj && obj.storage && typeof obj.storage === 'object' && !Array.isArray(obj.storage)) {
          info.keys = Object.keys(obj.storage).length;
        }
        info.baseRevision = num(obj && obj.baseRevision);
      } catch (e) { /* No original data in logs. */ }
    }
    return info;
  }

  function clock() {
    try { return new Date().toLocaleTimeString('uk-UA', { hour12: false }); }
    catch (e) { return new Date().toTimeString().slice(0, 8); }
  }

  function notify(text) {
    try { if (window.Lampa && Lampa.Noty && typeof Lampa.Noty.show === 'function') Lampa.Noty.show(text); }
    catch (e) {}
  }

  function addRecord(step, options) {
    var meta = step === 'save' ? getRequestMeta(options) : { bytes: null, keys: null, baseRevision: null };
    var record = {
      id: ++nextId,
      at: clock(),
      step: step,
      http: null,
      state: 'pending',
      code: '—',
      bytes: meta.bytes,
      keys: meta.keys,
      baseRevision: meta.baseRevision,
      serverRevision: null,
      serverKeys: null,
      serverBytes: null
    };
    records.unshift(record);
    if (records.length > LIMIT) records.length = LIMIT;
    return record;
  }

  function completed(record, success, xhr, payload) {
    if (record.state !== 'pending') return;
    record.http = num(xhr && xhr.status);
    if (record.http == null) record.http = 0;
    if (success) {
      if (payload && typeof payload === 'object' && payload.ok === true) record.state = 'ok';
      else if (payload && typeof payload === 'object' && payload.ok === false) record.state = 'api_false';
      else record.state = 'unknown_response';
      record.code = safeCode(payload && payload.code);
      record.serverRevision = num(payload && payload.revision);
      record.serverKeys = num(payload && payload.keyCount);
      record.serverBytes = num(payload && payload.plainBytes);
    } else {
      record.state = record.http === 0 ? 'network_error' : 'http_error';
      record.code = safeCode(xhr && xhr.responseJSON && xhr.responseJSON.code);
    }
    if (record.step === 'save') {
      notify('TG Diagnostic: ' + statusLine(record));
    } else if (record.state !== 'ok') {
      notify('TG Diagnostic (status): ' + statusLine(record));
    }
  }

  function statusLine(record) {
    var http = record.http == null ? '…' : String(record.http);
    var state;
    if (record.state === 'ok') state = 'API OK';
    else if (record.state === 'api_false') state = 'API ok:false';
    else if (record.state === 'network_error') state = 'мережна/CORS помилка';
    else if (record.state === 'http_error') state = 'HTTP-помилка';
    else if (record.state === 'pending') state = 'очікування';
    else state = 'невідома відповідь';
    return record.step.toUpperCase() + ' HTTP ' + http + ' · ' + state + (record.code !== '—' ? ' · ' + record.code : '');
  }

  function installOn(lib) {
    if (!lib || typeof lib.ajax !== 'function') return false;
    if (lib.ajax.__lexiTgDiagnosticTest1 === true) return true;
    var original = lib.ajax;
    var wrapper = function (urlOrOptions, maybeOptions) {
      var options = typeof urlOrOptions === 'string' ? (maybeOptions || {}) : (urlOrOptions || {});
      var url = typeof urlOrOptions === 'string' ? urlOrOptions : options.url;
      var method = options.type || options.method || 'GET';
      var step = classify(url, method);
      var record = step ? addRecord(step, options) : null;
      var result;
      try {
        result = original.apply(this, arguments);
      } catch (e) {
        if (record) {
          record.state = 'exception';
          record.http = 0;
          lastError = 'Виняток під час виклику оригінального $.ajax (вміст приховано)';
        }
        throw e;
      }
      if (record) {
        try {
          if (result && typeof result.done === 'function' && typeof result.fail === 'function') {
            result.done(function (payload, textStatus, jqXHR) { completed(record, true, jqXHR || result, payload); });
            result.fail(function (jqXHR) { completed(record, false, jqXHR || result, null); });
          } else {
            record.state = 'no_jquery_promise';
            lastError = '$.ajax повернув об’єкт без .done/.fail';
          }
        } catch (e2) {
          record.state = 'monitor_error';
          lastError = 'Не вдалося підписатися на результат (вміст приховано)';
        }
      }
      return result;
    };
    wrapper.__lexiTgDiagnosticTest1 = true;
    wrapper.__lexiTgDiagnosticOriginal = original;
    // Some jQuery extensions attach extra enumerable static fields to ajax.
    try {
      Object.keys(original).forEach(function (key) { if (!(key in wrapper)) wrapper[key] = original[key]; });
    } catch (e3) {}
    lib.ajax = wrapper;
    return true;
  }

  function ensureHook() {
    var a = false;
    try { a = installOn(window.jQuery) || a; } catch (e) { lastError = 'Не вдалося встановити спостереження jQuery'; }
    try { a = installOn(window.$) || a; } catch (e2) { lastError = 'Не вдалося встановити спостереження $'; }
    hooked = a;
    return a;
  }

  function reportLine(rec) {
    var t = '[' + rec.at + '] ' + statusLine(rec);
    if (rec.bytes != null) t += '\nЗапит: ' + fmtBytes(rec.bytes) + (rec.keys != null ? ', ' + rec.keys + ' ключів' : '');
    if (rec.baseRevision != null) t += '\nБазова ревізія: ' + rec.baseRevision;
    if (rec.serverRevision != null) t += '\nРевізія сервера: ' + rec.serverRevision;
    if (rec.serverKeys != null) t += '\nКлючів на сервері: ' + rec.serverKeys;
    if (rec.serverBytes != null) t += '\nБайтів за відповіддю сервера: ' + fmtBytes(rec.serverBytes);
    return t;
  }

  function report() {
    var lines = ['TG Sync Diagnostic · Test 1', 'Перехоплення $.ajax: ' + (hooked ? 'АКТИВНЕ' : 'НЕАКТИВНЕ'),
      'Збір лише метаданих. Не містить URL-параметрів, токенів або вмісту резервної копії.'];
    if (lastError) lines.push('Стан монітора: ' + lastError);
    if (!records.length) lines.push('Записів немає. Натисніть «Зберегти» у штатному TG Sync.');
    for (var i = 0; i < records.length; i++) lines.push('\n' + reportLine(records[i]));
    return lines.join('\n');
  }

  function showSelector(title, items, pick) {
    try {
      if (window.Lampa && Lampa.Select && typeof Lampa.Select.show === 'function') {
        Lampa.Select.show({
          title: title,
          items: items,
          onSelect: pick || function () {},
          onBack: function () { try { Lampa.Controller.toggle('settings_component'); } catch (e) {} }
        });
        return;
      }
    } catch (e2) {}
    notify('TG Diagnostic: немає інтерфейсу перегляду. Спробуйте на ПК через F12 → Network.');
  }

  function viewRecord(rec) {
    var parts = reportLine(rec).split('\n');
    showSelector('TG Diagnostic: деталі', parts.map(function (s) { return { title: s }; }));
  }

  function viewHistory() {
    ensureHook();
    var items = [{ title: 'Статус перехоплення: ' + (hooked ? 'активне' : 'неактивне'), informational: true }];
    if (!records.length) items.push({ title: 'Записів немає. Спочатку натисніть «Зберегти» у TG Sync.', informational: true });
    records.forEach(function (rec) {
      items.push({ title: '[' + rec.at + '] ' + statusLine(rec), diagnosticRecord: rec });
    });
    if (lastError) items.push({ title: lastError, informational: true });
    showSelector('TG Sync Diagnostic · Test 1', items, function (item) {
      if (item && item.diagnosticRecord) viewRecord(item.diagnosticRecord);
    });
  }

  function copyReport() {
    var data = report();
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        navigator.clipboard.writeText(data).then(function () { notify('TG Diagnostic: звіт скопійовано'); }, function () {
          notify('Браузер заборонив копіювання. Зробіть скріншот журналу.');
        });
        return;
      }
    } catch (e) {}
    notify('Буфер обміну недоступний. Зробіть скріншот журналу.');
  }

  function addSettings() {
    if (settingsAdded || !window.Lampa || !Lampa.SettingsApi) return;
    settingsAdded = true;
    try {
      Lampa.SettingsApi.addComponent({
        component: COMPONENT,
        name: 'TG Sync Diagnostic · Test 1',
        icon: '<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M4 4v16M4 12h5l3-5 4 10 3-5h2"/><circle cx="20" cy="4" r="2"/></svg>'
      });
      Lampa.SettingsApi.addParam({component: COMPONENT, param: {type: 'button'},
        field: {name: '🔍 Переглянути журнал запитів', description: 'HTTP, API-код, кількість ключів, розмір JSON; без секретів'},
        onChange: viewHistory});
      Lampa.SettingsApi.addParam({component: COMPONENT, param: {type: 'button'},
        field: {name: '📋 Скопіювати безпечний звіт'}, onChange: copyReport});
      Lampa.SettingsApi.addParam({component: COMPONENT, param: {type: 'button'},
        field: {name: '🧹 Очистити лише журнал діагностики', description: 'Не змінює localStorage та резервні копії'},
        onChange: function () { records.length = 0; notify('TG Diagnostic: журнал очищено'); }});
    } catch (e) {
      settingsAdded = false;
      lastError = 'Не вдалося додати меню діагностики';
    }
  }

  function init() {
    attempts++;
    ensureHook();
    addSettings();
    // Keep monitoring in case another plugin later replaces $.ajax.
    if (attempts >= 600) { clearInterval(timer); }
  }

  var timer = setInterval(init, 1000);
  init();
})();
