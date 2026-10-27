/* Obsidian Wide v0.4.0
 * Companion to Lampa + Obsidian (levende).
 * Scope: native Continue row, separately registered History row, 2 episode-release rows.
 * Does not replace card templates or ContentRows.add/call; does not change other rows.
 */
(function () {
  'use strict';
  var ID = '__obsidianWideV04';
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
    try { console.log.apply(console, ['[Obsidian Wide 0.4]'].concat([].slice.call(arguments))); } catch (e) {}
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
    if (!el || !m || !m.id || el.getAttribute('data-ow4-logo')) return;
    el.setAttribute('data-ow4-logo', 'waiting');
    function doLoad() {
      logoPath(m, function (path) {
        if (!path || !el.isConnected) return;
        var image = new Image();
        image.className = 'ow4-logo';
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
        var task = entry.target.__ow4Lazy;
        delete entry.target.__ow4Lazy;
        if (task) task();
      });
    }, { rootMargin: '180px' });
    el.__ow4Lazy = doLoad;
    logoObserver.observe(el);
  }

  function viewing(m) {
    if (!m || !m.id || !Lampa.Timeline || !Lampa.Utils) return null;
    var key = prefix(m), old = progressCache[key];
    if (old && Date.now() - old.at < 20000) return old.value;
    var found = null;
    try {
      var name = m.original_name || m.original_title || title(m);
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
        var seasons = Math.min(30, Number(m.number_of_seasons) || 12);
        for (var s = 1; s <= seasons; s++) {
          var missing = 0, maxEpisodes = s === 1 ? 120 : 60;
          for (var e = 1; e <= maxEpisodes; e++) {
            var hash = Lampa.Utils.hash([s, s > 10 ? ':' : '', e, name].join(''));
            var value = normalize(get(hash), s, e);
            if (value) { found = value; missing = 0; }
            else if (++missing > 10 && e > 10) break;
          }
        }
        // Some Lampa players remember the episode in online_watched_last,
        // even when the timeline wasn't saved in file_view.
        if (!found) {
          var last = Lampa.Storage.get('online_watched_last', '{}') || {};
          if (typeof last === 'string') { try { last = JSON.parse(last); } catch (e) { last = {}; } }
          var lastEp = last[Lampa.Utils.hash(name)];
          if (lastEp && +lastEp.season > 0 && +lastEp.episode > 0)
            found = normalize(get(Lampa.Utils.hash([+lastEp.season, +lastEp.season > 10 ? ':' : '', +lastEp.episode, name].join(''))), +lastEp.season, +lastEp.episode)
              || { percent: 0, current: 0, total: 0, sn: +lastEp.season, ep: +lastEp.episode };
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
    if (!card || !card.querySelector || card.classList.contains('ow4-card')) return;
    var view = card.querySelector('.card__view');
    if (!view) return;
    card.classList.add('ow4-card');
    var picture = item.backdrop_path || item.poster_path;
    if (picture) view.style.backgroundImage = 'url("' + photo(picture, 'w500') + '")';

    var overlay = make('div', 'ow4-overlay');
    var caption = make('div', 'ow4-name');
    caption.appendChild(make('span', 'ow4-fallback', title(item)));
    overlay.appendChild(caption);
    var watch = viewing(item);
    if (watch && watch.sn && watch.ep) {
      overlay.appendChild(make('div', 'ow4-episode-badge', 'С' + watch.sn + ' · Е' + watch.ep));
    }
    if (watch && watch.total) {
      overlay.appendChild(make('div', 'ow4-watch', timeString(watch.current) + ' / ' + timeString(watch.total)));
    }
    if (watch && watch.percent > 0) {
      var bar = make('div', 'ow4-progress');
      var fill = make('i', 'ow4-fill');
      fill.style.width = watch.percent + '%';
      bar.appendChild(fill);
      overlay.appendChild(bar);
    }
    view.appendChild(overlay);
    requestLogo(caption, item, function () { card.classList.add('ow4-has-logo'); });
  }
  function enhanced(item) {
    if (!item || !item.id) return item;
    // Avoid changing Favorite records that Lampa may share with other pages.
    var copy = Object.assign({}, item);
    if (!copy.source) copy.source = 'tmdb';
    // The native wide renderer reads these fields to place promo text BEHIND logos.
    // Remove them only from our cloned card, leaving original Favorite data untouched.
    delete copy.promo;
    delete copy.promo_title;
    var params = Object.assign({}, copy.params || {});
    var old = params.emit || {}, emit = Object.assign({}, old);
    emit.onCreate = function () {
      if (typeof old.onCreate === 'function') old.onCreate.apply(this, arguments);
      try { ensureMetadata(this, copy); decorate(this, copy); } catch (e) { log('Card render error', e); }
    };
    params.emit = emit;
    params.style = { name: 'wide' };
    copy.params = params;
    copy.__ow4 = true;
    return copy;
  }

  function normalized(text) { return String(text || '').trim().toLocaleLowerCase(); }
  function continueTitles() {
    var titles = ['Продовжити перегляд', 'Продовжити', 'Continue watching', 'Continue Watching', 'Продолжить просмотр'];
    try { titles.push(Lampa.Lang.translate('title_continue')); } catch (e) {}
    return titles.map(normalized);
  }
  function isContinue(line) {
    if (!line || line.__ow4History || line.ow4_history) return false;
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
    if (original.__ow4Wrapped) return;
    var wrapped = function (base, data) {
      try {
        if (makerName(base) === 'Line' && data && !data.__ow4History && isContinue(data)) {
          if (Array.isArray(data.results)) data.results = data.results.map(function (m) {
            return m && m.__ow4 ? m : enhanced(m);
          });
        }
      } catch (e) { log('Continue line error', e); }
      return original.apply(this, arguments);
    };
    wrapped.__ow4Wrapped = true;
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
              __ow4History: true,
              ow4_history: true
            });
          } catch (e) { log('History error', e); call(); }
        };
      }
    });
  }

  // Stock Lampa episode data is often {card: <TV show>, episode: <episode>}.
  // Its title/poster sit in .card-episode__footer, NOT in .full-episode__body.
  function episodeShow(item, card) {
    var d = item || card && (card.card_data || card.__card_data);
    if (!d && window.jQuery && card) {
      try { d = window.jQuery(card).data('card') || window.jQuery(card).data('data'); } catch (e) {}
    }
    if (!d) return null;
    var m = d.card || d.show || d.tv || d;
    if (!m || !m.id) return null;
    if (!m.media_type) m = Object.assign({}, m, { media_type: 'tv' });
    return m;
  }
  function episodeCard(card, item) {
    if (!card || card.classList.contains('ow4-episode-card')) return;
    var frame = card.querySelector('.full-episode');
    var body = frame && frame.querySelector('.full-episode__body');
    if (!frame || !body) return;
    var show = episodeShow(item, card);
    card.classList.add('ow4-episode-card');
    // Add logo above the native episode title. No template changes and no cloning cards.
    var holder = make('div', 'ow4-ep-logo-holder');
    var originalTitle = card.querySelector('.card-episode__footer .card__title') || card.querySelector('.card__title');
    holder.appendChild(make('span', 'ow4-ep-fallback', show ? title(show) : originalTitle ? originalTitle.textContent : ''));
    var epName = body.querySelector('.full-episode__name');
    if (epName) body.insertBefore(holder, epName);
    else body.appendChild(holder);
    if (show) requestLogo(holder, show, function () { holder.classList.add('ow4-ep-has-logo'); });
  }
  function enhanceEpisodeRow(data, line, preRendered) {
    var root = preRendered;
    if (!root) { try { root = htmlOf(line.render()); } catch (e) { return; } }
    if (!root) return;
    root.classList.add('ow4-episode-row');
    var items = data && data.results || [];
    function sync() {
      var cards = root.querySelectorAll('.card-episode');
      for (var i = 0; i < cards.length; i++) episodeCard(cards[i], items[i]);
    }
    sync();
    if (!window.MutationObserver || root.__ow4EpisodeObserver) return;
    var pending = false;
    var observer = new MutationObserver(function () {
      if (pending) return;
      pending = true;
      setTimeout(function () { pending = false; sync(); }, 0);
    });
    observer.observe(root, { childList: true, subtree: true });
    root.__ow4EpisodeObserver = observer;
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
      if (!event || event.type !== 'create' || !event.line) return;
      var root;
      try { root = htmlOf(event.line.render()); } catch (e) { return; }
      var visibleTitle = root && root.querySelector('.items-line__title');
      var name = visibleTitle && visibleTitle.textContent || '';
      if (!isEpisodeLine(event.data) && !isEpisodeLine({ title: name })) return;
      try { enhanceEpisodeRow(event.data, event.line, root); }
      catch (e) { log('Episode row error', e); }
    });
  }

  function css() {
    if (document.getElementById('ow4-styles')) return;
    var style = make('style');
    style.id = 'ow4-styles';
    style.textContent = [
      /* Two independent wide rows, preserving the rest of Obsidian / Lampa. */
      '.ow4-card.card--wide{width:24em!important;max-width:88vw!important}',
      '.ow4-card .card__imgbox,.ow4-card .card__view{border-radius:.85em!important}',
      '.ow4-card .card__view{position:relative!important;aspect-ratio:16/9!important;background-position:center!important;background-size:cover!important;overflow:hidden!important}',
      '.ow4-card .card__view:after{border-radius:.85em!important}',
      '.ow4-card .card__img{opacity:0!important}',
      '.ow4-card .ow4-overlay{position:absolute;inset:0;pointer-events:none;color:#fff;z-index:3;border-radius:inherit;background:linear-gradient(0deg,rgba(0,0,0,.81),rgba(0,0,0,.03) 72%)}',
      '.ow4-card .ow4-name{position:absolute;top:15%;left:8%;right:8%;height:47%;display:flex;align-items:center;justify-content:center;text-align:center}',
      '.ow4-card .ow4-fallback{font-weight:700;font-size:1.06em;line-height:1.15;text-shadow:0 2px 6px #000}',
      '.ow4-card .ow4-logo{display:block;position:absolute;max-width:62%;max-height:73%;width:auto;height:auto;object-fit:contain;filter:drop-shadow(0 2px 5px #000)}',
      '.ow4-card.ow4-has-logo .ow4-fallback{visibility:hidden}',
      '.ow4-card .ow4-episode-badge{position:absolute;left:7%;top:6%;padding:.24em .55em;background:rgba(0,0,0,.58);border-radius:.4em;font-weight:700;font-size:.78em;line-height:1.25;text-shadow:0 1px 2px #000;z-index:4}',
      '.ow4-card .ow4-watch{position:absolute;left:7%;right:7%;bottom:8%;font-size:.76em;font-weight:600;text-align:right;text-shadow:0 1px 4px #000}',
      '.ow4-card .ow4-progress{position:absolute;left:7%;right:7%;bottom:3.3%;height:3px;border-radius:5px;overflow:hidden;background:rgba(255,255,255,.38)}',
      '.ow4-card .ow4-fill{display:block;height:100%;background:#f5f5f5}',
      /* Obsidian produces real quality + rating in metadata__bottom. Place ABOVE timecodes. */
      '.ow4-card .card__view .card__metadata{position:absolute!important;left:7%!important;right:auto!important;bottom:18%!important;top:auto!important;width:auto!important;max-width:84%!important;padding:0!important;background:none!important;z-index:6!important;pointer-events:none}',
      '.ow4-card .card__metadata .metadata__genres,.ow4-card .card__metadata .metadata__title,.ow4-card .card__metadata .metadata__year{display:none!important}',
      '.ow4-card .card__metadata .metadata__bottom{display:flex!important;align-items:center!important;justify-content:flex-start!important;gap:.35em!important;flex-wrap:wrap!important;margin:0!important}',
      '.ow4-card .card__metadata .metadata__bottom > div{display:flex!important;align-items:center!important;justify-content:flex-start!important;gap:.35em!important}',
      '.ow4-card .card__metadata .metadata__rating,.ow4-card .card__metadata .metadata__quality{font-size:.8em!important;line-height:1.2!important;margin-right:.25em!important}',
      '.ow4-card .card__view > .card__marker{z-index:7!important}',
      /* These are native wide promo overlays. We also drop promo fields from the cloned item. */
      '.ow4-card .card__promo,.ow4-card .card__promo-title,.ow4-card .card__promo-text,.ow4-card .card__description,.ow4-card .card__desc{display:none!important}',
      '.ow4-card > .card__title,.ow4-card > .card__age,.ow4-card > .card__description,.ow4-card > .card__footer,.ow4-card .card__view > .card__title,.ow4-card .card__view > .card__type{display:none!important}',
      /* Keep only the Obsidian ratings/quality, not Lampa fallback duplicates. */
      '.ow4-card .card__view > .card__vote,.ow4-card .card__view > .card__quality{display:none!important}',
      /* Native forthcoming/recent episode cards only: logo in still, no duplicate footer/poster. */
      '.ow4-episode-row .card-episode{width:20.5em!important;max-width:86vw!important}',
      '.ow4-episode-row .card-episode__body{width:100%!important}',
      '.ow4-episode-row .card-episode__footer{display:none!important}',
      '.ow4-episode-row .card-episode .full-episode{position:relative;overflow:hidden;border-radius:.85em!important}',
      '.ow4-episode-row .card-episode .full-episode__img{position:relative;aspect-ratio:16/9;overflow:hidden;border-radius:inherit}',
      '.ow4-episode-row .card-episode .full-episode__img img{display:block;width:100%;height:100%;object-fit:cover}',
      '.ow4-episode-row .card-episode .full-episode__body{position:absolute!important;inset:0!important;pointer-events:none;padding:0.8em!important;display:flex!important;flex-direction:column!important;align-items:flex-start!important;justify-content:flex-end!important;background:linear-gradient(to top,rgba(0,0,0,.91),rgba(0,0,0,.08) 85%);color:#fff;box-sizing:border-box}',
      '.ow4-episode-row .card-episode .full-episode__body > .card__title,.ow4-episode-row .card-episode .full-episode__body > .card__age{display:none!important}',
      '.ow4-episode-row .ow4-ep-logo-holder{position:relative;display:flex;align-items:flex-end;justify-content:flex-start;text-align:left;width:72%;height:2.55em;max-height:37%;margin-bottom:.28em;flex:none}',
      '.ow4-episode-row .ow4-ep-fallback{font-weight:700;font-size:1.02em;text-shadow:0 2px 4px #000;line-height:1.1;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden}',
      '.ow4-episode-row .ow4-ep-logo-holder .ow4-logo{position:absolute;left:0;bottom:0;max-width:100%;max-height:100%;width:auto;height:auto;object-fit:contain;object-position:left bottom;filter:drop-shadow(0 2px 4px #000)}',
      '.ow4-episode-row .ow4-ep-has-logo .ow4-ep-fallback{visibility:hidden}',
      '.ow4-episode-row .card-episode .full-episode__num{position:absolute!important;left:.8em!important;top:.7em!important;z-index:2;margin:0!important;padding:.14em .48em!important;font-size:.78em!important;border-radius:.35em;background:rgba(0,0,0,.58)}',
      '.ow4-episode-row .card-episode .full-episode__name{display:block!important;position:relative!important;max-width:100%;font-weight:650!important;line-height:1.2!important;font-size:.83em!important;margin:.12em 0!important;text-align:left!important;text-shadow:0 1px 4px #000}',
      '.ow4-episode-row .card-episode .full-episode__date{display:block!important;position:relative!important;max-width:100%;font-size:.72em!important;margin:.12em 0 0!important;opacity:.82!important;text-align:left!important;text-shadow:0 1px 4px #000}',
      '@media(max-width:600px){.ow4-card.card--wide{width:20em!important;max-width:88vw!important}.ow4-card .ow4-watch{font-size:.7em}.ow4-episode-row .card-episode{width:18em!important}}'
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
