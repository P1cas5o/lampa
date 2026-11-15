/*
 * Card Fusion — Portrait Title Spacing Diagnostic Test 1
 * Standalone read-only measurement overlay. Does not alter Card Fusion.
 * Remove this plugin after taking screenshots.
 */
(function () {
  'use strict';
  if (window.__cfTitleSpacingDiagnosticT1) return;
  window.__cfTitleSpacingDiagnosticT1 = true;

  var PANEL_ID = 'cf-title-diag-t1';
  var lastText = '';
  var lastLog = '';
  function rect(el) { return el && el.getBoundingClientRect ? el.getBoundingClientRect() : null; }
  function px(n) { return typeof n === 'number' && isFinite(n) ? n.toFixed(1) : '—'; }
  function num(v) { var n = parseFloat(v); return isFinite(n) ? n : 0; }
  function label(el) {
    if (!el) return 'немає';
    var s = el.tagName.toLowerCase();
    if (el.id) s += '#' + el.id;
    if (el.className && typeof el.className === 'string') s += '.' + el.className.trim().split(/\s+/).slice(0,3).join('.');
    return s;
  }
  function detail(el) {
    if (!el) return 'немає';
    var b = rect(el), c = getComputedStyle(el);
    return label(el) + '\n' +
      '  rect: top ' + px(b.top) + ', bottom ' + px(b.bottom) + ', height ' + px(b.height) + '\n' +
      '  margin T/B ' + c.marginTop + ' / ' + c.marginBottom +
      ' | padding T/B ' + c.paddingTop + ' / ' + c.paddingBottom + '\n' +
      '  display ' + c.display + ' | position ' + c.position +
      ' | min-height ' + c.minHeight + ' | line-height ' + c.lineHeight;
  }
  function firstVisible(selector) {
    var list = document.querySelectorAll(selector);
    for (var i=0; i<list.length; i++) {
      var b = rect(list[i]), c = getComputedStyle(list[i]);
      if (b && b.width > 0 && b.height > 0 && c.display !== 'none' && c.visibility !== 'hidden') return list[i];
    }
    return null;
  }
  function ensurePanel() {
    var p = document.getElementById(PANEL_ID);
    if (p) return p;
    p = document.createElement('div');
    p.id = PANEL_ID;
    p.setAttribute('aria-label', 'Card Fusion title spacing diagnostics');
    p.style.cssText = 'position:fixed!important;left:8px!important;right:8px!important;top:8px!important;z-index:2147483647!important;max-height:43vh!important;overflow:auto!important;background:rgba(6,12,18,.94)!important;color:#fff!important;border:2px solid #52e4bc!important;border-radius:9px!important;padding:9px 11px!important;box-sizing:border-box!important;font:11px/1.35 monospace!important;white-space:pre-wrap!important;word-break:break-word!important;pointer-events:none!important;text-align:left!important;box-shadow:0 2px 16px #000!important';
    document.body.appendChild(p);
    return p;
  }
  function tick() {
    if (!document.body) return;
    var portrait = innerHeight > innerWidth && innerWidth < 900;
    var title = firstVisible('.plugin-hybrid-title');
    var panel = document.getElementById(PANEL_ID);
    if (!portrait || !title) {
      if (panel) panel.style.display = 'none';
      return;
    }
    panel = ensurePanel();
    panel.style.display = 'block';
    var body = title.querySelector('.plugin-hybrid-title__body');
    var secondary = title.querySelector('.cf-secondary-title');
    var metadata = title.querySelector('.cf-secondary-metadata');
    var host = title.closest('.full-start-new,.full-start') || document;
    var rates = host.querySelector('.full-start-new__rate-line.rate-fix,.full-start-new__rate-line.cf-ratings-layout,.full-start__rate-line.cf-ratings-layout,.full-start-new__rate-line,.full-start__rate-line');
    if (!rates) rates = firstVisible('.full-start-new__rate-line,.full-start__rate-line');
    var tb=rect(title), bb=rect(body), sb=rect(secondary), mb=rect(metadata), rb=rect(rates);
    var titleBottom = bb ? bb.bottom : tb.bottom;
    var lines = [
      'CF TITLE DIAG T1  |  ПОРТРЕТ  |  ' + innerWidth + '×' + innerHeight,
      'Назва: ' + ((secondary && secondary.textContent || '').trim().slice(0,65) || '(порожньо)'),
      'Від низу НАЗВИ до початку РЕЙТИНГІВ: ' + (rb ? px(rb.top-titleBottom) + ' px' : 'рейтинги не знайдені'),
      'Від низу КОНТЕЙНЕРА до рейтингів: ' + (rb ? px(rb.top-tb.bottom) + ' px' : '—'),
      'Резерв всередині контейнера знизу: ' + px(tb.bottom-titleBottom) + ' px',
      '',
      'КОНТЕЙНЕР: ' + detail(title),
      'ТЕКСТ: ' + detail(secondary),
      'ВМІСТ: ' + detail(body),
      'МЕТАДАНІ: ' + detail(metadata),
      'РЕЙТИНГИ: ' + detail(rates),
      '',
      'БАТЬКІВСЬКІ ЕЛЕМЕНТИ:'
    ];
    var parent=title.parentElement;
    for (var i=0; parent && i<3; i++,parent=parent.parentElement) lines.push(detail(parent));
    var t=lines.join('\n');
    if (t!==lastText) { panel.textContent=t;lastText=t; }
    if (t!==lastLog) { console.log('[CF Title Diagnostic T1]\n'+t);lastLog=t; }
  }
  setInterval(function(){ try{tick();}catch(e){console.warn('[CF Title Diagnostic T1]',e);} }, 1200);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',tick);
  else tick();
})();
