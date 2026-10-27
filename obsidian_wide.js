/* Lampa · Obsidian Wide · 0.1.0
 * Перший тест: широкі картки продовження та окремий канал історії.
 * Не змінює глобальні шаблони Lampa/Obsidian.
 */
(function () {
  'use strict';
  var NS = 'owide01', ready = false;
  if (window.__lampa_owide01) return;
  window.__lampa_owide01 = true;
  var logoCache = {}, logoWait = {}, observed = [];
  var observer = null;

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
  }); }
  function kind(m) { return m.media_type === 'tv' || m.name || m.first_air_date ? 'tv' : 'movie'; }
  function title(m) { return m.title || m.name || m.original_title || m.original_name || ''; }
  function tmdb(path, size) { return 'https://image.tmdb.org/t/p/' + (size || 'w500') + path; }
  function duration(sec) { sec = Math.max(0, Number(sec) || 0); return Math.floor(sec / 3600) ? Math.floor(sec / 3600) + ':' + ('0' + Math.floor(sec % 3600 / 60)).slice(-2) + ':' + ('0' + Math.floor(sec % 60)).slice(-2) : Math.floor(sec / 60) + ':' + ('0' + Math.floor(sec % 60)).slice(-2); }
  function timeline(m) {
    try {
      if (!Lampa.Timeline || !Lampa.Timeline.view || !Lampa.Utils.hash) return null;
      var name = m.original_title || m.original_name || title(m), view, best = null;
      if (kind(m) === 'movie') {
        view = Lampa.Timeline.view(Lampa.Utils.hash(name));
        if (view) return normalize(view);
      } else {
        var seasons = Math.min(15, Number(m.number_of_seasons) || 8);
        for (var s = 1; s <= seasons; s++) for (var e = 1; e <= 35; e++) {
          view = Lampa.Timeline.view(Lampa.Utils.hash(String(s) + (s > 10 ? ':' : '') + String(e) + name));
          if (view && (Number(view.time) > 0 || Number(view.percent) > 0)) best = Object.assign(normalize(view), {s:s, e:e});
        }
        return best;
      }
    } catch (err) {}
    return null;
  }
  function normalize(v) {
    var time = Number(v.time) || 0, total = Number(v.duration) || 0;
    var pct = Number(v.percent);
    if (!isFinite(pct) || pct < 0) pct = total ? time / total * 100 : 0;
    return {pct:Math.min(100, Math.max(0, pct)), time:time, total:total};
  }
  function getLogo(m, cb) {
    var type = kind(m), key = type + ':' + m.id;
    if (Object.prototype.hasOwnProperty.call(logoCache, key)) return cb(logoCache[key]);
    if (logoWait[key]) return logoWait[key].push(cb);
    logoWait[key] = [cb];
    function done(path) {
      logoCache[key] = path || '';
      var callbacks = logoWait[key] || []; delete logoWait[key];
      callbacks.forEach(function (fn) { try { fn(logoCache[key]); } catch (_) {} });
    }
    if (!m.id || !Lampa.TMDB || !Lampa.TMDB.api) return done('');
    try {
      // TMDB images endpoint, через штатний клієнт Lampa; не зберігаємо API-ключ.
      new Lampa.Reguest().silent(Lampa.TMDB.api(type + '/' + m.id + '/images?include_image_language=uk,en,null&api_key=' + Lampa.TMDB.key() + '&language=uk'), function (data) {
        var logos = data && data.logos || [];
        var chosen = logos.filter(function (x) { return x.iso_639_1 === 'uk'; })[0] ||
                     logos.filter(function (x) { return x.iso_639_1 === 'en'; })[0] || logos[0];
        done(chosen && chosen.file_path);
      }, function () { done(''); });
    } catch (e) { done(''); }
  }
  function loadLogo(view, m, label) {
    if (view.getAttribute('data-ow-logo')) return;
    view.setAttribute('data-ow-logo', '1');
    getLogo(m, function (path) {
      if (!path || !view.isConnected) return;
      var im = document.createElement('img'); im.className = 'ow-logo'; im.alt = '';
      im.onload = function () { view.classList.add('ow-has-logo'); };
      im.onerror = function () { if (im.parentNode) im.parentNode.removeChild(im); };
      im.src = tmdb(path, 'w300');
      label.appendChild(im);
    });
  }
  function lazyLogo(view, m, label) {
    if ('IntersectionObserver' in window) {
      if (!observer) observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          observer.unobserve(entry.target);
          var d = entry.target.__owLogo;
          if (d) { loadLogo(entry.target, d.m, d.label); delete entry.target.__owLogo; }
        });
      }, {rootMargin:'120px'});
      view.__owLogo = {m:m, label:label}; observer.observe(view);
    } else loadLogo(view, m, label);
  }
  function decorate(root, m) {
    var el = root && (root.jquery ? root[0] : root.nodeType ? root : root[0]);
    if (!el || el.classList.contains('ow-card')) return;
    var view = el.querySelector('.card__view'); if (!view) return;
    el.classList.add('ow-card');
    if (m.backdrop_path) view.style.backgroundImage = 'url("' + tmdb(m.backdrop_path, 'w500') + '")';
    var image = view.querySelector('.card__img'); if (image) image.style.opacity = '0';
    var p = timeline(m), rating = Number(m.vote_average) || 0;
    var label = document.createElement('div'); label.className = 'ow-label';
    label.innerHTML = '<div class="ow-title">' + esc(title(m)) + '</div>';
    var meta = document.createElement('div'); meta.className = 'ow-meta';
    // Не повторюємо штатний номер серії Obsidian.
    if (p && p.s) meta.innerHTML += '<span>С' + p.s + ' · Е' + p.e + '</span>';
    if (rating > 0) meta.innerHTML += '<span class="ow-rating">★ ' + rating.toFixed(1) + '</span>';
    // Якість беремо лише якщо вона вже відома в даних картки.
    var quality = m.quality || m.video_quality || '';
    if (typeof quality === 'string' && /^(4k|uhd|fhd|full.?hd|1080p|720p|hd)$/i.test(quality)) meta.innerHTML += '<span>' + esc(quality) + '</span>';
    var bottom = document.createElement('div'); bottom.className = 'ow-bottom';
    if (p && p.total > 0) bottom.innerHTML = '<div class="ow-time">' + duration(p.time) + ' / ' + duration(p.total) + '</div>';
    else if (p && p.s) bottom.innerHTML = '<div class="ow-time">С' + p.s + ' · Е' + p.e + '</div>';
    if (p && p.pct > 0) bottom.innerHTML += '<div class="ow-track"><i style="width:' + p.pct + '%"></i></div>';
    var shade = document.createElement('div'); shade.className = 'ow-shade';
    view.appendChild(shade); view.appendChild(label); view.appendChild(meta); view.appendChild(bottom);
    lazyLogo(view, m, label);
  }
  function enhance(m) {
    if (!m || !m.id) return m;
    var item = Object.assign({}, m), params = Object.assign({}, m.params || {});
    var old = params.emit || {}, emit = Object.assign({}, old);
    emit.onCreate = function () {
      if (typeof old.onCreate === 'function') old.onCreate.apply(this, arguments);
      try { decorate(this.render && this.render(), m); } catch (e) { console.warn('[Obsidian Wide] card:', e); }
    };
    params.emit = emit; params.style = {name:'wide'};
    item.params = params;
    return item;
  }
  function isContinue(line) {
    if (!line || !line.title) return false;
    var labels = ['Продовжити перегляд', 'Продовжити', 'Continue watching'];
    try { labels.push(Lampa.Lang.translate('title_continue')); } catch (_) {}
    return labels.indexOf(String(line.title).trim()) !== -1;
  }
  function addStyle() {
    if (document.getElementById('owide01-css')) return;
    var st = document.createElement('style'); st.id = 'owide01-css';
    st.textContent = '\
    .ow-card .card__view{position:relative!important;aspect-ratio:16/9!important;overflow:hidden;background-size:cover!important;background-position:center!important}\
    .ow-card .card__view>.card__img{opacity:0!important}\
    .ow-card .ow-shade{position:absolute;inset:0;pointer-events:none;background:linear-gradient(0deg,rgba(0,0,0,.90),rgba(0,0,0,.08) 78%)}\
    .ow-card .ow-label{position:absolute;z-index:2;left:6%;right:6%;top:14%;height:51%;display:flex;align-items:center;justify-content:center;pointer-events:none}\
    .ow-card .ow-title{font-size:1.25em;line-height:1.12;text-align:center;font-weight:750;color:#fff;text-shadow:0 2px 8px #000}\
    .ow-card .ow-logo{position:absolute;max-width:78%;max-height:95%;width:auto;height:auto;object-fit:contain;filter:drop-shadow(0 2px 5px rgba(0,0,0,.7))}\
    .ow-card .ow-has-logo .ow-title{visibility:hidden}\
    .ow-card .ow-meta{position:absolute;z-index:2;bottom:15%;left:6%;right:6%;display:flex;gap:.65em;align-items:center;color:white;font-size:.76em;font-weight:600;text-shadow:0 1px 4px #000;pointer-events:none}\
    .ow-card .ow-rating{color:#f7d45c}\
    .ow-card .ow-bottom{position:absolute;z-index:2;bottom:4%;left:6%;right:6%;color:#fff;font-size:.7em;pointer-events:none}\
    .ow-card .ow-time{text-align:right;margin-bottom:.25em;font-variant-numeric:tabular-nums}\
    .ow-card .ow-track{height:3px;border-radius:3px;background:rgba(255,255,255,.3);overflow:hidden}\
    .ow-card .ow-track i{display:block;height:100%;background:#fff;border-radius:3px}\
    .ow-card>.card__title,.ow-card>.card__vote,.ow-card>.card__age{display:none!important}\
    @media(max-width:600px){.ow-card .ow-title{font-size:1em}.ow-card .ow-meta{font-size:.68em}.ow-card .ow-bottom{font-size:.64em}}';
    document.head.appendChild(st);
  }
  function register() {
    if (ready) return; ready = true; addStyle();
    Lampa.Listener.follow('line', function (ev) {
      try {
        if (!ev || ev.type !== 'create' || !ev.data || !isContinue(ev.data)) return;
        // Лише рідний канал, без додавання дубліката.
        ev.data.results = (ev.data.results || []).map(enhance);
      } catch (e) { console.warn('[Obsidian Wide] line:', e); }
    });
    Lampa.ContentRows.add({
      name:'ObsidianWideHistory', title:'Історія перегляду', index:20, screen:['main'],
      call:function () { return function (call) {
        var items = [];
        try { items = Lampa.Favorite.get({type:'history'}) || []; } catch (_) {}
        items = items.filter(function (m) { return m && m.id; }).slice(0,20).map(enhance);
        if (!items.length) return call();
        call({title:'Історія перегляду', results:items, source:'tmdb', total_pages:1});
      }; }
    });
    console.log('[Obsidian Wide] 0.1.0 ready');
  }
  if (window.appready) register();
  else Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') register(); });
})();
