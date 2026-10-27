/* Obsidian Wide v0.3.0
 * Companion to Lampa + Obsidian (levende).
 * Scope: native Continue row, separately registered History row, 2 episode-release rows.
 * Does not replace card templates or ContentRows.add/call; does not change other rows.
 */
(function () {
  'use strict';
  var ID = '__obsidianWideV03';
  if (window[ID]) return;
  window[ID] = true;

  var started = false;
  var logoCache = Object.create(null);
  var logoPending = Object.create(null);
  var progressCache = Object.create(null);
  var logoObserver = null;
  var episodeObservers = [];
  var NAME = 'ObsidianWideHistory'; // Preserve the channel's existing on/off preference.

  function log() {
    try { console.log.apply(console, ['[Obsidian Wide 0.3]'].concat([].slice.call(arguments))); } catch (e) {}
  }
  function title(m) { return m && (m.title || m.name || m.original_title || m.original_name) || ''; }
  function type(m) {
    return m && (m.media_type === 'tv' || m.first_air_date || m.number_of_seasons || (!m.title && m.name)) ? 'tv' : 'movie';
  }
  function photo(path, size) {
    try { return path ? Lampa.TMDB.image('t/p/' + size + path) : ''; } catch (e) { return ''; }
  }
  function htmlOf(inst) {
    var h = inst && (inst.html || inst);
    return h && (h.nodeType === 1 ? h : h[0] && h[0].nodeType === 1 ? h[0] : null);
  }
  function clamp(n) { return Math.max(0, Math.min(100, n)); }
  function timeString(value) {
    var t = Math.floor(Math.max(0, Number(value) || 0));
    var h = Math.floor(t / 3600), m = Math.floor(t % 3600 / 60), s = t % 60;
    return (h ? h + ':' + ('0' + m).slice(-2) : String(m)) + ':' + ('0' + s).slice(-2);
  }
  function make(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }
  function prefix(m) { return type(m) + ':' + m.id; }

  // TMDB logos: Ukrainian > English > language-neutral; queued to avoid duplicate calls.
  function logoPath(m, callback) {
    if (!m || !m.id) return callback('');
    var k = prefix(m);
    if (Object.prototype.hasOwnProperty.call(logoCache, k)) return callback(logoCache[k]);
    if (logoPending[k]) { logoPending[k].push(callback); return; }
    logoPending[k] = [callback];
    function complete(path) {
      logoCache[k] = path || '';
      var callbacks = logoPending[k] || [];
      delete logoPending[k];
      callbacks.forEach(function (f) { try { f(logoCache[k]); } catch (e) {} });
    }
    function pick(images) {
      var logos = images && images.logos || [];
      var langs = ['uk', 'en', null];
      for (var i = 0; i < langs.length; i++) {
        for (var j = 0; j < logos.length; j++) {
          if (logos[j].iso_639_1 === langs[i]) return logos[j].file_path;
        }
      }
      return '';
    }
    try {
      if (m.images && m.images.logos) return complete(pick(m.images));
      var endpoint = type(m) + '/' + m.id + '/images?include_image_language=uk,en,null';
      var url = Lampa.TMDB.api(endpoint + '&api_key=' + Lampa.TMDB.key() + '&language=uk');
      new Lampa.Reguest().silent(url, function (data) { complete(pick(data)); }, function () { complete(''); });
    } catch (e) { complete(''); }
  }
  function requestLogo(el, m, onLoaded) {
    if (!el || !m || !m.id || el.getAttribute('data-ow3-logo')) return;
    el.setAttribute('data-ow3-logo', 'waiting');
    function doLoad() {
      logoPath(m, function (path) {
        if (!path || !el.isConnected) return;
        var image = new Image();
        image.className = 'ow3-logo';
        image.alt = '';
        image.onload = function () { if (image.isConnected) onLoaded(); };
        image.onerror = function () { if (image.parentNode) image.parentNode.removeChild(image); };
        image.src = photo(path, 'w300');
        el.appendChild(image);
      });
    }
    if (!window.IntersectionObserver) return doLoad();
    if (!logoObserver) logoObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        logoObserver.unobserve(entry.target);
        var task = entry.target.__ow3Lazy;
        delete entry.target.__ow3Lazy;
        if (task) task();
      });
    }, { rootMargin: '180px' });
    el.__ow3Lazy = doLoad;
    logoObserver.observe(el);
  }

  function viewing(m) {
    if (!m || !m.id || !Lampa.Timeline || !Lampa.Utils) return null;
    var key = prefix(m), old = progressCache[key];
    if (old && Date.now() - old.at < 20000) return old.value;
    var found = null;
    try {
      var name = m.original_title || m.original_name || title(m);
      var saved = Lampa.Storage.cache('file_view', 10000, {}) || {};
      function get(hash) { return saved[hash] || Lampa.Timeline.view(hash); }
      function normalize(v, sn, ep) {
        if (!v) return null;
        var current = Number(v.time) || 0, total = Number(v.duration) || 0;
        var percent = Number(v.percent);
        if (!isFinite(percent)) percent = total ? current / total * 100 : 0;
        if (!percent && !current) return null;
        return { percent: clamp(percent), current: current, total: total, sn: sn || 0, ep: ep || 0 };
      }
      if (type(m) === 'movie') found = normalize(get(Lampa.Utils.hash(name)));
      else {
        var seasons = Math.min(20, Number(m.number_of_seasons) || 12);
        for (var s = 1; s <= seasons; s++) for (var e = 1; e <= 40; e++) {
          var hash = Lampa.Utils.hash([s, s > 10 ? ':' : '', e, name].join(''));
          var value = normalize(get(hash), s, e);
          if (value) found = value;
        }
      }
    } catch (e) {}
    progressCache[key] = { at: Date.now(), value: found };
    return found;
  }

  // Use Obsidian's OWN .card__metadata for quality/rating (not synthetic substitutes).
  // Obsidian only builds it for card data.source = tmdb/cub.
  function ensureMetadata(inst, original) {
    // This can only encourage the Obsidian plugin to render the data when its hook runs;
    // never create a fake quality badge. Ordering of enabled plugins remains a test variable.
    if (!inst || !inst.data) return;
    if (!inst.data.source && inst.data.id && !original.source) inst.data.source = 'tmdb';
  }
  function decorate(inst, item) {
    var card = htmlOf(inst);
    if (!card || !card.querySelector || card.classList.contains('ow3-card')) return;
    var view = card.querySelector('.card__view');
    if (!view) return;
    card.classList.add('ow3-card');
    var picture = item.backdrop_path || item.poster_path;
    if (picture) view.style.backgroundImage = 'url("' + photo(picture, 'w500') + '")';

    var overlay = make('div', 'ow3-overlay');
    var caption = make('div', 'ow3-name');
    var fallback = make('span', 'ow3-fallback', title(item));
    caption.appendChild(fallback);
    overlay.appendChild(caption);
    var watch = viewing(item);
    var row = make('div', 'ow3-watch');
    var seriesText = watch && watch.sn ? 'С' + watch.sn + ' · Е' + watch.ep : '';
    var timeText = watch && watch.total ? timeString(watch.current) + ' / ' + timeString(watch.total) : '';
    if (seriesText || timeText) {
      row.appendChild(make('span', 'ow3-episode', seriesText));
      row.appendChild(make('span', 'ow3-time', timeText));
      overlay.appendChild(row);
    }
    if (watch && watch.percent > 0) {
      var bar = make('div', 'ow3-progress');
      var fill = make('i', 'ow3-fill');
      fill.style.width = watch.percent + '%';
      bar.appendChild(fill);
      overlay.appendChild(bar);
    }
    view.appendChild(overlay);
    requestLogo(caption, item, function () { card.classList.add('ow3-has-logo'); });
  }
  function enhanced(item) {
    if (!item || !item.id) return item;
    // Avoid changing Favorite records that Lampa may share with other pages.
    var copy = Object.assign({}, item);
    if (!copy.source) copy.source = 'tmdb';
    var params = Object.assign({}, copy.params || {});
    var old = params.emit || {}, emit = Object.assign({}, old);
    emit.onCreate = function () {
      if (typeof old.onCreate === 'function') old.onCreate.apply(this, arguments);
      try { ensureMetadata(this, copy); decorate(this, copy); } catch (e) { log('Card render error', e); }
    };
    params.emit = emit;
    params.style = { name: 'wide' };
    copy.params = params;
    copy.__ow3 = true;
    return copy;
  }

  function normalized(text) { return String(text || '').trim().toLocaleLowerCase(); }
  function continueTitles() {
    var titles = ['Продовжити перегляд', 'Продовжити', 'Continue watching', 'Continue Watching', 'Продолжить просмотр'];
    try { titles.push(Lampa.Lang.translate('title_continue')); } catch (e) {}
    return titles.map(normalized);
  }
  function isContinue(line) {
    if (!line || line.__ow3History || line.ow3_history) return false;
    // IMPORTANT: NEVER compare results with Favorite.continues(). History can contain
    // exactly the same titles; classifying by IDs causes row collisions.
    return continueTitles().indexOf(normalized(line.title)) !== -1;
  }
  function isEpisodeLine(line) {
    if (!line || !line.title) return false;
    var t = normalized(line.title);
    var timing = /(найближч|нещодавн|недавн|ближайш|recent|upcoming|soon)/.test(t);
    var episode = /(епізод|сері[йя]|эпизод|выход|виход|episode|release)/.test(t);
    return timing && episode;
  }
  function makerName(base) {
    try {
      var maker = Lampa.Maker;
      if (maker && maker.get && maker.list) {
        var list = maker.list();
        if (list.indexOf('Line') >= 0 && base === maker.get('Line', {})) return 'Line';
        if (list.indexOf('Card') >= 0 && base === maker.get('Card', {})) return 'Card';
      }
    } catch (e) {}
    return base && base.name || '';
  }
  function interceptNativeContinue() {
    if (!Lampa.Utils || !Lampa.Utils.createInstance) return;
    var original = Lampa.Utils.createInstance;
    if (original.__ow3Wrapped) return;
    var wrapped = function (base, data) {
      try {
        if (makerName(base) === 'Line' && data && !data.__ow3History && isContinue(data)) {
          if (Array.isArray(data.results)) data.results = data.results.map(function (m) {
            return m && m.__ow3 ? m : enhanced(m);
          });
        }
      } catch (e) { log('Continue line error', e); }
      return original.apply(this, arguments);
    };
    wrapped.__ow3Wrapped = true;
    Lampa.Utils.createInstance = wrapped;
  }
  function historyRow() {
    Lampa.ContentRows.add({
      name: NAME,
      title: 'Історія перегляду',
      index: 6, // v0.2 used index 20; some home layouts only render early rows.
      screen: ['main'],
      call: function (params, screen) {
        if (screen !== 'main') return;
        return function (call) {
          try {
            var history = Lampa.Favorite.get({ type: 'history' }) || [];
            var movies = history.filter(function (x) { return x && x.id; }).slice(0, 20).map(enhanced);
            if (!movies.length) return call();
            call({
              title: 'Історія перегляду',
              source: 'tmdb',
              results: movies,
              total_pages: 1,
              __ow3History: true,
              ow3_history: true
            });
          } catch (e) { log('History error', e); call(); }
        };
      }
    });
  }

  function episodeCard(card, item) {
    if (!card || card.classList.contains('ow3-episode-card')) return;
    var frame = card.querySelector('.full-episode');
    if (!frame) return;
    card.classList.add('ow3-episode-card');
    var t = card.querySelector('.full-episode__body .card__title');
    if (!t || !item || !item.id) return;
    // Keep the original title as fallback. No navigation or card template changes.
    var text = t.textContent;
    var holder = make('span', 'ow3-episode-title', text || title(item));
    t.textContent = '';
    t.appendChild(holder);
    var show = item.show && item.show.id ? item.show : item.tv && item.tv.id ? item.tv : item;
    if (!show.media_type) show = Object.assign({}, show, { media_type: 'tv' });
    requestLogo(holder, show, function () { holder.classList.add('ow3-episode-has-logo'); });
  }
  function enhanceEpisodeRow(data, line) {
    var root;
    try { root = htmlOf(line.render()); } catch (e) { return; }
    if (!root) return;
    root.classList.add('ow3-episode-row');
    var items = data && data.results || [];
    function sync() {
      var cards = root.querySelectorAll('.card-episode');
      for (var i = 0; i < cards.length; i++) episodeCard(cards[i], items[i]);
    }
    sync();
    if (!window.MutationObserver || root.__ow3EpisodeObserver) return;
    var pending = false;
    var observer = new MutationObserver(function () {
      if (pending) return;
      pending = true;
      setTimeout(function () { pending = false; sync(); }, 0);
    });
    observer.observe(root, { childList: true, subtree: true });
    root.__ow3EpisodeObserver = observer;
    episodeObservers.push({ root: root, observer: observer });
    if (episodeObservers.length > 12) {
      episodeObservers = episodeObservers.filter(function (x) {
        if (x.root.isConnected) return true;
        x.observer.disconnect();
        return false;
      });
    }
  }
  function episodeLines() {
    if (!Lampa.Listener || !Lampa.Listener.follow) return;
    Lampa.Listener.follow('line', function (event) {
      if (!event || event.type !== 'create' || !isEpisodeLine(event.data) || !event.line) return;
      try { enhanceEpisodeRow(event.data, event.line); } catch (e) { log('Episode row error', e); }
    });
  }

  function css() {
    if (document.getElementById('ow3-styles')) return;
    var style = make('style');
    style.id = 'ow3-styles';
    style.textContent = [
      /* Only our marked cards, never all wide cards or the other Obsidian tiles. */
      '.ow3-card.card--wide{width:20.5em!important;max-width:85vw!important}',
      '.ow3-card .card__view{position:relative!important;aspect-ratio:16/9!important;background-position:center!important;background-size:cover!important;overflow:hidden!important}',
      '.ow3-card .card__img{opacity:0!important}',
      '.ow3-card .ow3-overlay{position:absolute;inset:0;pointer-events:none;color:#fff;z-index:3;background:linear-gradient(0deg,rgba(0,0,0,.77),rgba(0,0,0,.05) 70%)}',
      '.ow3-card .ow3-name{position:absolute;top:17%;left:8%;right:8%;height:49%;display:flex;align-items:center;justify-content:center;text-align:center}',
      '.ow3-card .ow3-fallback{font-weight:700;font-size:1.06em;line-height:1.15;text-shadow:0 2px 6px #000}',
      '.ow3-card .ow3-logo{display:block;position:absolute;max-width:68%;max-height:76%;width:auto;height:auto;object-fit:contain;filter:drop-shadow(0 2px 5px #000)}',
      '.ow3-card.ow3-has-logo .ow3-fallback{visibility:hidden}',
      '.ow3-card .ow3-watch{position:absolute;left:7%;right:7%;bottom:8%;display:flex;justify-content:space-between;align-items:center;gap:.6em;font-size:.74em;font-weight:600;text-shadow:0 1px 4px #000}',
      '.ow3-card .ow3-progress{position:absolute;left:7%;right:7%;bottom:3.3%;height:3px;border-radius:5px;overflow:hidden;background:rgba(255,255,255,.38)}',
      '.ow3-card .ow3-fill{display:block;height:100%;background:#f5f5f5}',
      /* Obsidian's original metadata remains responsible for quality and rating. */
      '.ow3-card .card__view .card__metadata{position:absolute!important;top:.5em!important;right:.55em!important;bottom:auto!important;left:auto!important;width:auto!important;padding:0!important;background:none!important;z-index:6!important;pointer-events:none}',
      '.ow3-card .card__metadata .metadata__genres,.ow3-card .card__metadata .metadata__title,.ow3-card .card__metadata .metadata__year{display:none!important}',
      '.ow3-card .card__metadata .metadata__bottom{display:flex!important;align-items:center!important;justify-content:flex-end!important;gap:.32em!important;flex-wrap:wrap!important}',
      '.ow3-card .card__metadata .metadata__bottom > *:not(.metadata__quality){display:flex!important;align-items:center!important;gap:.25em!important}',
      '.ow3-card .card__metadata .metadata__rating,.ow3-card .card__metadata .metadata__quality{font-size:.74em!important;line-height:1.2!important}',
      /* Only native duplicate text/type badges in these particular cards. */
      '.ow3-card > .card__title,.ow3-card > .card__age,.ow3-card > .card__description,.ow3-card > .card__footer,.ow3-card .card__promo-title,.ow3-card .card__view > .card__type{display:none!important}',
      /* The two stock episode-release rows. No globally replaced card_episode template. */
      '.ow3-episode-row .card-episode{width:19.5em;max-width:80vw}',
      '.ow3-episode-row .card-episode .full-episode{position:relative;overflow:hidden;border-radius:.45em}',
      '.ow3-episode-row .card-episode .full-episode__img{position:relative;aspect-ratio:16/9;overflow:hidden}',
      '.ow3-episode-row .card-episode .full-episode__img img{display:block;width:100%;height:100%;object-fit:cover}',
      '.ow3-episode-row .card-episode .full-episode__body{position:absolute;inset:0!important;pointer-events:none;padding:.65em .7em!important;display:flex;flex-direction:column;justify-content:flex-end;background:linear-gradient(to top,rgba(0,0,0,.85),transparent 82%);color:white}',
      '.ow3-episode-row .card-episode .card__title{position:absolute;top:12%;left:8%;right:8%;display:flex;align-items:center;justify-content:center;text-align:center;min-height:45%;margin:0!important;text-shadow:0 2px 5px #000}',
      '.ow3-episode-row .ow3-episode-title{display:flex;align-items:center;justify-content:center;position:relative;min-height:2em;font-weight:700;font-size:.95em}',
      '.ow3-episode-row .ow3-episode-title.ow3-episode-has-logo{font-size:0}',
      '.ow3-episode-row .ow3-episode-title .ow3-logo{position:absolute;max-width:70%;max-height:3em;width:auto;height:auto;object-fit:contain;filter:drop-shadow(0 2px 4px black)}',
      '.ow3-episode-row .card-episode .full-episode__num,.ow3-episode-row .card-episode .full-episode__date{display:block!important;position:relative!important;font-size:.76em!important;margin:0 .1em .12em!important;z-index:2}',
      '.ow3-episode-row .card-episode .full-episode__name,.ow3-episode-row .card-episode .card__age{display:none!important}',
      '@media(max-width:600px){.ow3-card.card--wide{width:17.5em!important;max-width:85vw!important}.ow3-card .ow3-watch{font-size:.7em}.ow3-episode-row .card-episode{width:17.5em}}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function start() {
    if (started || !window.Lampa || !Lampa.ContentRows || !Lampa.Maker || !Lampa.Utils) return;
    started = true;
    css();
    interceptNativeContinue();
    episodeLines();
    try { historyRow(); log('History registered separately at index 6'); }
    catch (e) { log('History registration failed', e); }
    log('Ready');
  }
  if (window.appready) start();
  else if (window.Lampa && Lampa.Listener && Lampa.Listener.follow) {
    Lampa.Listener.follow('app', function (event) { if (event && event.type === 'ready') start(); });
  }
})();
