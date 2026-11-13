(function () {
  'use strict';
  var KEY = '__uafilms_comments_diagnostic_1';
  if (window[KEY]) return;
  window[KEY] = true;

  var root = null, output = null, runButton = null, closeButton = null;
  var lines = [];
  var tests = [
    {name: 'Project Hail Mary (2026), сторінка 1', params: {imdb_id:'tt12042730', title:'Проєкт «Аве Марія»', original_title:'Project Hail Mary', year:'2026', page:'1'}},
    {name: 'Interstellar (2014), сторінка 1', params: {imdb_id:'tt0816692', title:'Інтерстеллар', original_title:'Interstellar', year:'2014', page:'1'}},
    {name: 'Project Hail Mary (2026), сторінка 2', params: {imdb_id:'tt12042730', title:'Проєкт «Аве Марія»', original_title:'Project Hail Mary', year:'2026', page:'2'}}
  ];
  function log(s) {
    lines.push(s);
    if (output) { output.textContent = lines.join('\n'); output.scrollTop = output.scrollHeight; }
  }
  function makeUrl(params) {
    var parts = [];
    Object.keys(params).forEach(function (k) { parts.push(encodeURIComponent(k) + '=' + encodeURIComponent(params[k])); });
    return 'https://films.aartzz.pp.ua/api/comments?' + parts.join('&');
  }
  function request(url, callback) {
    var xhr = new XMLHttpRequest(), done = false, started = Date.now();
    function finish(err, status, body) {
      if (done) return;
      done = true;
      callback(err, status, body, Date.now() - started);
    }
    try {
      xhr.open('GET', url, true);
      xhr.timeout = 15000;
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) finish(null, xhr.status, xhr.responseText || '');
      };
      xhr.onerror = function () { finish('Помилка мережі/CORS', xhr.status || 0, ''); };
      xhr.ontimeout = function () { finish('Тайм-аут 15 с', xhr.status || 0, ''); };
      xhr.send(null);
    } catch (e) { finish('Виняток: ' + e.message, 0, ''); }
  }
  function run() {
    if (!runButton) return;
    runButton.disabled = true;
    lines = [];
    log('UAFilms → UaKino Comments — діагностика 1.0');
    log('3 GET-запити тільки на читання; основний UaKomentsY не змінюється.');
    log('HTTP 200 не гарантує, що коментарі належать потрібному фільму.\n');
    var i = 0;
    function next() {
      if (i >= tests.length) { log('\nГотово. Скопіюй журнал і надішли його Лексі.'); runButton.disabled = false; return; }
      var t = tests[i++], url = makeUrl(t.params);
      log('▶ ' + i + '/' + tests.length + ' ' + t.name);
      log(url);
      request(url, function (err, status, body, elapsed) {
        log('↳ HTTP ' + status + ' (' + elapsed + ' мс)' + (err ? ' — ' + err : ''));
        if (body) {
          log('Довжина: ' + body.length);
          try {
            var data = JSON.parse(body);
            var arr = Array.isArray(data) ? data : (data && Array.isArray(data.comments) ? data.comments : null);
            if (arr) {
              log('JSON: ' + arr.length + ' коментарів');
              if (arr.length) {
                var first = arr[0] || {};
                log('Перший: id=' + (first.id || '?') + ', автор=' + ((first.author && first.author.name) || String(first.author || '?')) + ', replies=' + (Array.isArray(first.replies) ? first.replies.length : '?'));
                log('Поля: ' + Object.keys(first).join(', '));
              }
            } else log('JSON: не масив коментарів; поля: ' + (data && typeof data === 'object' ? Object.keys(data).join(', ') : typeof data));
          } catch (e) { log('Не JSON; початок: ' + body.slice(0, 160).replace(/\s+/g, ' ')); }
        } else log('Порожнє тіло відповіді / недоступне через CORS');
        log('');
        next();
      });
    }
    next();
  }
  function el(tag, css, text) {
    var node = document.createElement(tag);
    if (css) node.style.cssText = css;
    if (text != null) node.textContent = text;
    return node;
  }
  function show() {
    if (root) { root.style.display = 'flex'; return; }
    root = el('div','position:fixed;inset:0;z-index:2147483647;background:rgba(0,0,0,.9);display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;color:#fff;font:16px Arial,sans-serif;');
    var panel = el('div','width:min(920px,100%);max-height:95vh;display:flex;flex-direction:column;gap:12px;background:#20242a;border:1px solid #697481;border-radius:12px;padding:18px;box-sizing:border-box;');
    panel.appendChild(el('div','font-size:22px;font-weight:bold;','UAFilms → UaKino · Тест 1.0'));
    panel.appendChild(el('div','font-size:14px;color:#ccc;','Перевірка API з Lampa. Тексти коментарів у журнал не записуються.'));
    output = el('pre','flex:1;min-height:180px;max-height:60vh;overflow:auto;white-space:pre-wrap;overflow-wrap:anywhere;background:#101317;padding:12px;border-radius:6px;font:13px/1.5 monospace;','Натисни «Запустити тест».');
    panel.appendChild(output);
    var controls = el('div','display:flex;flex-wrap:wrap;gap:10px;');
    function button(title, action) {
      var b = el('button','background:#3a566e;color:#fff;border:1px solid #8ea4b7;border-radius:8px;padding:12px 16px;font:16px Arial;cursor:pointer;',title);
      b.addEventListener('click',action); controls.appendChild(b); return b;
    }
    runButton = button('Запустити 3 тести',run);
    button('Копіювати журнал',function () {
      var value = lines.join('\n');
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(value).catch(function () { fallbackCopy(value); });
      else fallbackCopy(value);
    });
    closeButton = button('Закрити',function () { root.style.display = 'none'; });
    panel.appendChild(controls); root.appendChild(panel); document.body.appendChild(root);
  }
  function fallbackCopy(value) {
    var a = document.createElement('textarea'); a.value = value; a.style.cssText = 'position:fixed;left:-9999px;'; document.body.appendChild(a); a.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(a);
  }
  function init() {
    if (!document.body) { setTimeout(init,500); return; }
    show();
    if (window.Lampa && Lampa.SettingsApi && Lampa.SettingsApi.addComponent && Lampa.SettingsApi.addParam) {
      try {
        Lampa.SettingsApi.addComponent({component:'uafilms_diag_1',name:'UAFilms Comments Test',icon:'comment'});
        Lampa.SettingsApi.addParam({component:'uafilms_diag_1',param:{name:'uafilms_diag_open',type:'button',default:''},field:{name:'Відкрити діагностику'},onChange:show});
      } catch(e) { log('Налаштування недоступні: ' + e.message); }
    }
  }
  setTimeout(init, 1000);
})();
