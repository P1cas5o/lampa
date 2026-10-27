/* Obsidian Wide v0.7.2.0
 * Companion to Lampa + Obsidian (levende).
 * Scope: native Continue row, separately registered History row, 2 episode-release rows.
 * Does not replace card templates or ContentRows.add/call; does not change other rows.
 */
(function () {
  'use strict';
  var ID = '__obsidianWideV07';
  if (window[ID]) return;
  window[ID] = true;

  var started = false;
  var logoCache = Object.create(null);
  var logoLanguage = Object.create(null);
  var logoPending = Object.create(null);
  var progressCache = Object.create(null);
  var logoObserver = null;
  var episodeObserver = null;
  var episodeScanTimer = null;
  var episodeResults = typeof WeakMap !== 'undefined' ? new WeakMap() : null;
  var showSearchCache = Object.create(null);
  var showSearchPending = Object.create(null);
  var episodeStyledCount = 0;
  var NAME = 'ObsidianWideHistory'; // Preserve the channel's existing on/off preference.

  function log() {
    try { console.log.apply(console, ['[Obsidian Wide 0.7.2]'].concat([].slice.call(arguments))); } catch (e) {}
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

  // Prefer Ukrainian logos even when Lampa already embeds a PARTIAL images list
  // containing only English logos. History rows usually lack this list;
  // upcoming/recent episode rows sometimes include it.
  function logoPath(m, callback) {
    if (!m || !m.id) return callback('');
    var k = prefix(m);
    if (Object.prototype.hasOwnProperty.call(logoCache, k)) return callback(logoCache[k], logoLanguage[k]);
    if (logoPending[k]) { logoPending[k].push(callback); return; }
    logoPending[k] = [callback];

    function pick(logos) {
      logos = Array.isArray(logos) ? logos : [];
      var langs = ['uk', 'en', null];
      for (var i = 0; i < langs.length; i++) {
        for (var j = 0; j < logos.length; j++) {
          if (logos[j].iso_639_1 === langs[i] && logos[j].file_path) return logos[j].file_path;
        }
      }
      return '';
    }
    function ukrainian(logos) {
      return (Array.isArray(logos) ? logos : []).some(function (x) {
        return x.iso_639_1 === 'uk' && !!x.file_path;
      });
    }
    var inline = m.images && m.images.logos || [];
    function complete(path, lang) {
      logoCache[k] = path || '';
      logoLanguage[k] = lang || '';
      var callbacks = logoPending[k] || [];
      delete logoPending[k];
      callbacks.forEach(function (f) { try { f(logoCache[k], logoLanguage[k]); } catch (e) {} });
    }
    // If Ukrainian is already in the supplied images, no request is needed.
    if (ukrainian(inline)) return complete(pick(inline), 'uk');

    var done = false;
    function success(data) {
      if (done) return;
      done = true;
      // On empty / partial responses use the existing English image as fallback.
      var list = (data && data.logos) || [];
      var path = pick(list) || pick(inline);
      var match = list.concat(inline).filter(function (x) { return x.file_path === path; })[0];
      complete(path, match && match.iso_639_1 || '');
    }
    function failure() { success(null); }
    try {
      var endpoint = type(m) + '/' + m.id + '/images?include_image_language=uk%2Cen%2Cnull';
      // Same source API as the reference LMX plugin. It uses Lampa's
      // configured TMDB connection and avoids reconstructing proxy URLs.
      if (Lampa.Api && Lampa.Api.sources && Lampa.Api.sources.tmdb && Lampa.Api.sources.tmdb.get) {
        Lampa.Api.sources.tmdb.get(endpoint, {}, success, failure);
      } else {
        var url = Lampa.TMDB.api(endpoint + '&api_key=' + Lampa.TMDB.key() + '&language=uk');
        new Lampa.Reguest().silent(url, success, failure);
      }
    } catch (e) { failure(); }
  }
  function requestLogo(el, m, onLoaded) {
    if (!el || !m || !m.id || el.getAttribute('data-ow6-logo')) return;
    el.setAttribute('data-ow6-logo', 'waiting');
    function doLoad() {
      logoPath(m, function (path, lang) {
        if (!path || !el.isConnected) return;
        var image = new Image();
        image.className = 'ow6-logo';
        image.alt = '';
        image.onload = function () { if (image.isConnected) onLoaded(lang, path); };
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
        var task = entry.target.__ow6Lazy;
        delete entry.target.__ow6Lazy;
        if (task) task();
      });
    }, { rootMargin: '180px' });
    el.__ow6Lazy = doLoad;
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
  function arrangeObsidianMetadata(card) {
    // Move *real* Obsidian nodes, never duplicate/recompute their values.
    var metadata = card && card.querySelector('.card__metadata');
    var bottom = metadata && metadata.querySelector('.metadata__bottom');
    if (!bottom) return;
    var left = bottom.children[0], right = bottom.children[1];
    if (!left || !right) return;
    Array.prototype.slice.call(bottom.querySelectorAll('.metadata__rating, .metadata__quality')).forEach(function (node) {
      if (node.parentNode !== left) left.appendChild(node);
    });
    Array.prototype.slice.call(bottom.querySelectorAll('.metadata__year')).forEach(function (node) {
      if (node.parentNode !== right) right.appendChild(node);
    });
  }

  // A focus-only caption independent of Obsidian's native card__title.
  // Keep one/two-line space reserved to avoid changing the row height on focus.
  function localizedTitle(m) {
    if (!m) return '';
    return String(m.title || m.name || m.original_title || m.original_name || '').trim();
  }
  function addFocusCaption(card, m) {
    if (!card || card.querySelector('.ow7-focus-title')) return;
    var caption = make('div', 'ow7-focus-title');
    caption.appendChild(make('span', 'ow7-focus-title-text', localizedTitle(m)));
    card.appendChild(caption);
    card.classList.add('ow7-caption-host');
  }
  function updateFocusCaption(card, m) {
    var node = safeFind(card, '.ow7-focus-title-text');
    var value = localizedTitle(m);
    if (node && value) node.textContent = value;
  }
  function setCaptionLanguage(card, language) {
    if (!card) return;
    card.classList.toggle('ow7-logo-uk', language === 'uk');
  }

  function decorate(inst, item) {
    var card = htmlOf(inst);
    if (!card || !card.querySelector || card.classList.contains('ow6-card')) return;
    var view = card.querySelector('.card__view');
    if (!view) return;
    card.classList.add('ow6-card');
    addFocusCaption(card, item);
    var picture = item.backdrop_path || item.poster_path;
    if (picture) view.style.backgroundImage = 'url("' + photo(picture, 'w500') + '")';

    var overlay = make('div', 'ow6-overlay');
    var caption = make('div', 'ow6-name');
    caption.appendChild(make('span', 'ow6-fallback', title(item)));
    overlay.appendChild(caption);
    var watch = viewing(item);
    // Lower line = watched episode and timecodes. Upper-left remains Obsidian's
    // own last-aired episode badge (.card__type.episode_metadata), NOT watch progress.
    if (watch && (watch.sn && watch.ep || watch.total)) {
      var watchLine = make('div', 'ow6-watch');
      if (watch.sn && watch.ep)
        watchLine.appendChild(make('span', 'ow6-watch-episode', 'С' + watch.sn + ' · Е' + watch.ep));
      if (watch.total)
        watchLine.appendChild(make('span', 'ow6-watch-time', timeString(watch.current) + ' / ' + timeString(watch.total)));
      overlay.appendChild(watchLine);
    }
    if (watch && watch.percent > 0) {
      var bar = make('div', 'ow6-progress');
      var fill = make('i', 'ow6-fill');
      fill.style.width = watch.percent + '%';
      bar.appendChild(fill);
      overlay.appendChild(bar);
    }
    view.appendChild(overlay);
    arrangeObsidianMetadata(card);
    // Obsidian can append its metadata after the card's own onCreate handler.
    // A few deferred checks do not change the layout or perform any requests.
    setTimeout(function () { if (card.isConnected) arrangeObsidianMetadata(card); }, 120);
    requestLogo(caption, item, function (language) { card.classList.add('ow6-has-logo'); setCaptionLanguage(card, language); });
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
    if (!line || line.__ow4History || line.ow6_history) return false;
    // IMPORTANT: NEVER compare results with Favorite.continues(). History can contain
    // exactly the same titles; classifying by IDs causes row collisions.
    return continueTitles().indexOf(normalized(line.title)) !== -1;
  }
  function isEpisodeLine(line) {
    var t = normalized(line && line.title);
    // In different Lampa localizations the native rows can be called
    // "Найближчі виходи", "Нещодавні виходи епізодів", etc.
    return /(найближч|нещодавн|недавн|ближайш|recent|upcoming)/.test(t)
      && /(виход|эпизод|епізод|сері|серий|выход|episode|release|soon)/.test(t);
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
              ow6_history: true
            });
          } catch (e) { log('History error', e); call(); }
        };
      }
    });
  }

  // Release-episode cards are sometimes rendered after the "line:create" event.
  // Combine the native event with a tightly scoped DOM fallback, without
  // replacing card_episode globally (Obsidian and other plugins use it too).
  function safeFind(root, selector) {
    try { return root && root.querySelector ? root.querySelector(selector) : null; } catch (e) { return null; }
  }
  function originalEpisodeShow(item, card) {
    var data = item || card && (card.card_data || card.__card_data || card.__episodeData);
    if (!data && window.jQuery && card) {
      try {
        var $c = window.jQuery(card);
        data = $c.data('card') || $c.data('data') || $c.data('movie') || $c.data('item');
      } catch (e) {}
    }
    if (!data) return null;
    var m = data.card || data.show || data.tv || data.movie || data;
    if (!m || !m.id) return null;
    return Object.assign({}, m, { media_type: 'tv' });
  }
  function findShowByName(name, callback) {
    var k = normalized(name);
    if (!k || k.length < 2) return callback(null);
    if (Object.prototype.hasOwnProperty.call(showSearchCache, k)) return callback(showSearchCache[k]);
    if (showSearchPending[k]) { showSearchPending[k].push(callback); return; }
    showSearchPending[k] = [callback];
    function done(value) {
      showSearchCache[k] = value || null;
      var callbacks = showSearchPending[k] || [];
      delete showSearchPending[k];
      callbacks.forEach(function (fn) { try { fn(showSearchCache[k]); } catch (e) {} });
    }
    try {
      var url = Lampa.TMDB.api('search/tv?api_key=' + Lampa.TMDB.key() + '&language=uk&query=' + encodeURIComponent(name));
      new Lampa.Reguest().silent(url, function (data) {
        var results = data && data.results || [];
        // Avoid placing a different show's logo on this card.
        var exact = results.filter(function (r) {
          return normalized(r.name) === k || normalized(r.original_name) === k;
        })[0];
        done(exact ? Object.assign({}, exact, { media_type: 'tv' }) : null);
      }, function () { done(null); });
    } catch (e) { done(null); }
  }
  function episodeNameFromCard(card) {
    var titleNode = safeFind(card, '.card-episode__footer .card__title')
      || safeFind(card, '.card-episode__footer .card__left .card__title');
    return titleNode && titleNode.textContent ? titleNode.textContent.trim() : '';
  }
  function episodeCard(card, item) {
    if (!card || card.classList.contains('ow6-episode-card')) return false;
    var frame = safeFind(card, '.full-episode');
    var body = safeFind(frame, '.full-episode__body');
    if (!frame || !body) return false;
    var epName = safeFind(body, '.full-episode__name');
    var show = originalEpisodeShow(item, card);
    var fallback = show ? title(show) : episodeNameFromCard(card);
    if (!fallback && !show) return false; // Retry when native Lampa finishes drawing.

    var holder = make('div', 'ow6-ep-logo-holder');
    holder.appendChild(make('span', 'ow6-ep-fallback', fallback));
    if (epName) body.insertBefore(holder, epName);
    else body.appendChild(holder);
    card.classList.add('ow6-episode-card');
    addFocusCaption(card, show || { title: fallback, name: fallback });
    episodeStyledCount++;

    function addLogo(realShow) {
      if (!realShow || !realShow.id || !holder.isConnected) return;
      updateFocusCaption(card, realShow);
      requestLogo(holder, realShow, function (language) { holder.classList.add('ow6-ep-has-logo'); setCaptionLanguage(card, language); });
    }
    if (show) addLogo(show);
    else {
      // Without line data, the visible native footer still has the TV title.
      // Search it lazily and cache one lookup per unique show title.
      function search() { findShowByName(fallback, addLogo); }
      if (window.IntersectionObserver) {
        var localObserver = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) { localObserver.disconnect(); search(); }
          });
        }, { rootMargin: '150px' });
        localObserver.observe(card);
      } else search();
    }
    return true;
  }
  function enhanceEpisodeRow(data, line, preRendered) {
    var root = preRendered;
    if (!root && line && line.render) { try { root = htmlOf(line.render()); } catch (e) {} }
    if (!root) return;
    var cards = root.querySelectorAll('.card-episode');
    var items = data && data.results || [];
    root.classList.add('ow6-episode-row');
    for (var i = 0; i < cards.length; i++) {
      if (episodeResults && items[i]) episodeResults.set(cards[i], items[i]);
      episodeCard(cards[i], items[i]);
    }
  }
  function episodeRowFor(card) {
    var current = card && card.parentElement;
    // The episode row title can sit outside its scrolling node.
    for (var step = 0; current && step < 8 && current !== document.body; step++, current = current.parentElement) {
      var heading = safeFind(current,
        '.items-line__title, .items-line__name, .items-line__head, .items-line__header, .items__title, .scroll__title, .line__title, .line__name');
      if (!heading) continue;
      if (!isEpisodeLine({ title: heading.textContent || '' })) continue;
      // Do not allow a parent containing ALL rows to mark unrelated cards.
      var childRows = current.querySelectorAll('.items-line');
      if (childRows.length > 1) continue;
      return current;
    }
    return null;
  }
  function scanEpisodeCards() {
    if (!document.body || !document.body.querySelectorAll) return;
    var cards = document.body.querySelectorAll('.card-episode:not(.ow6-episode-card)');
    for (var i = 0; i < cards.length; i++) {
      var card = cards[i];
      var root = episodeRowFor(card);
      if (!root) continue;
      root.classList.add('ow6-episode-row');
      episodeCard(card, episodeResults && episodeResults.get(card));
    }
  }
  function scheduleEpisodeScan() {
    if (episodeScanTimer) return;
    episodeScanTimer = setTimeout(function () {
      episodeScanTimer = null;
      try { scanEpisodeCards(); } catch (e) { log('Episode DOM scan error', e); }
    }, 100);
  }
  function episodeLines() {
    if (Lampa.Listener && Lampa.Listener.follow) Lampa.Listener.follow('line', function (event) {
      if (!event || !event.line) return;
      var data = event.data || event.line.data;
      if (data && isEpisodeLine(data)) {
        try { enhanceEpisodeRow(data, event.line); }
        catch (e) { log('Episode line hook error', e); }
      }
      scheduleEpisodeScan();
    });
    // Native cards are frequently appended AFTER line:create; this catches
    // them without touching templates or unrelated channels.
    if (window.MutationObserver && document.body && !episodeObserver) {
      episodeObserver = new MutationObserver(function (mutations) {
        for (var i = 0; i < mutations.length; i++) {
          var nodes = mutations[i].addedNodes || [];
          for (var j = 0; j < nodes.length; j++) {
            var n = nodes[j];
            if (!n || n.nodeType !== 1) continue;
            if (n.matches && n.matches('.card-episode,.items-line')) { scheduleEpisodeScan(); return; }
            if (safeFind(n, '.card-episode,.items-line')) { scheduleEpisodeScan(); return; }
          }
        }
      });
      episodeObserver.observe(document.body, { childList: true, subtree: true });
    }
    scheduleEpisodeScan();
  }

  function css() {
    if (document.getElementById('ow6-styles')) return;
    var style = make('style');
    style.id = 'ow6-styles';
    style.textContent = [
      /* Two independent wide rows, preserving the rest of Obsidian / Lampa. */
      '.ow6-card.card--wide{width:26em!important;max-width:92vw!important}',
      '.ow6-card .card__imgbox,.ow6-card .card__view{border-radius:.85em!important}',
      '.ow6-card .card__view{position:relative!important;aspect-ratio:16/9!important;background-position:center!important;background-size:cover!important;overflow:hidden!important}',
      '.ow6-card .card__view:after{border-radius:.85em!important}',
      '.ow6-card .card__img{opacity:0!important}',
      '.ow6-card .ow6-overlay{position:absolute;inset:0;pointer-events:none;color:#fff;z-index:3;border-radius:inherit;background:linear-gradient(0deg,rgba(0,0,0,.81),rgba(0,0,0,.03) 72%)}',
      '.ow6-card .ow6-name{position:absolute;top:15%;left:8%;right:8%;height:47%;display:flex;align-items:center;justify-content:center;text-align:center}',
      '.ow6-card .ow6-fallback{font-weight:700;font-size:1.06em;line-height:1.15;text-shadow:0 2px 6px #000}',
      '.ow6-card .ow6-logo{display:block;position:absolute;max-width:62%;max-height:73%;width:auto;height:auto;object-fit:contain;filter:drop-shadow(0 2px 5px #000)}',
      '.ow6-card.ow6-has-logo .ow6-fallback{visibility:hidden}',
      /* Obsidian owns the latest-aired episode badge in the upper-left corner. */
      '.ow6-card .card__view > .card__type{display:flex!important;left:0!important;top:0!important;right:auto!important;bottom:auto!important;z-index:9!important}',
      '.ow6-card .ow6-watch{position:absolute;left:7%;right:7%;bottom:8%;display:flex;align-items:center;justify-content:space-between;gap:1em;font-size:.76em;font-weight:600;text-shadow:0 1px 4px #000}',
      '.ow6-card .ow6-watch-time{margin-left:auto;text-align:right;white-space:nowrap}',
      '.ow6-card .ow6-watch-episode{white-space:nowrap}',
      '.ow6-card .ow6-progress{position:absolute;left:7%;right:7%;bottom:3.3%;height:3px;border-radius:5px;overflow:hidden;background:rgba(255,255,255,.38)}',
      '.ow6-card .ow6-fill{display:block;height:100%;background:#f5f5f5}',
      /* Obsidian produces real quality + rating in metadata__bottom. Place ABOVE timecodes. */
      '.ow6-card .card__view .card__metadata{position:absolute!important;left:7%!important;right:7%!important;bottom:18%!important;top:auto!important;width:86%!important;max-width:none!important;padding:0!important;background:none!important;z-index:6!important;pointer-events:none}',
      '.ow6-card .card__metadata .metadata__genres,.ow6-card .card__metadata .metadata__title{display:none!important}',
      '.ow6-card .card__metadata .metadata__bottom{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:.35em!important;flex-wrap:nowrap!important;margin:0!important}',
      '.ow6-card .card__metadata .metadata__bottom > div{display:flex!important;align-items:center!important;justify-content:flex-start!important;gap:.35em!important;white-space:nowrap!important}',
      '.ow6-card .card__metadata .metadata__bottom .metadata__year{display:inline-block!important;margin-left:auto!important;font-size:.8em!important}',
      '.ow6-card .card__metadata .metadata__rating,.ow6-card .card__metadata .metadata__quality{font-size:.8em!important;line-height:1.2!important;margin-right:.25em!important}',
      /* Hide only the native Lampa last-watched episode/progress badge. The custom lower watch line and Obsidian S/E badge remain visible. */
      '.ow6-card .card-watched{display:none!important}',
      '.ow6-card .card__view > .card__marker{z-index:7!important}',
      /* These are native wide promo overlays. We also drop promo fields from the cloned item. */
      '.ow6-card .card__promo,.ow6-card .card__promo-title,.ow6-card .card__promo-text,.ow6-card .card__description,.ow6-card .card__desc{display:none!important}',
      '.ow6-card > .card__title,.ow6-card > .card__age,.ow6-card > .card__description,.ow6-card > .card__footer,.ow6-card .card__view > .card__title{display:none!important}',
      /* Keep only the Obsidian ratings/quality, not Lampa fallback duplicates. */
      '.ow6-card .card__view > .card__vote,.ow6-card .card__view > .card__quality{display:none!important}',
      /* Native forthcoming/recent episode cards only: logo in still, no duplicate footer/poster. */
      '.ow6-episode-card{width:20.5em!important;max-width:86vw!important}',
      '.ow6-episode-card .card-episode__body{width:100%!important}',
      '.ow6-episode-card .card-episode__footer{display:none!important}',
      '.ow6-episode-card .full-episode{position:relative;overflow:hidden;border-radius:.85em!important}',
      '.ow6-episode-card .full-episode__img{position:relative;aspect-ratio:16/9;overflow:hidden;border-radius:inherit}',
      '.ow6-episode-card .full-episode__img img{display:block;width:100%;height:100%;object-fit:cover}',
      '.ow6-episode-card .full-episode__body{position:absolute!important;inset:0!important;pointer-events:none;padding:0.8em!important;display:flex!important;flex-direction:column!important;align-items:flex-start!important;justify-content:flex-end!important;background:linear-gradient(to top,rgba(0,0,0,.91),rgba(0,0,0,.08) 85%);color:#fff;box-sizing:border-box}',
      '.ow6-episode-card .full-episode__body > .card__title,.ow6-episode-card .full-episode__body > .card__age{display:none!important}',
      '.ow6-episode-card .ow6-ep-logo-holder{position:relative;display:flex;align-items:flex-end;justify-content:flex-start;text-align:left;width:72%;height:2.55em;max-height:37%;margin-bottom:.28em;flex:none}',
      '.ow6-episode-card .ow6-ep-fallback{font-weight:700;font-size:1.02em;text-shadow:0 2px 4px #000;line-height:1.1;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden}',
      '.ow6-episode-card .ow6-ep-logo-holder .ow6-logo{position:absolute;left:0;bottom:0;max-width:100%;max-height:100%;width:auto;height:auto;object-fit:contain;object-position:left bottom;filter:drop-shadow(0 2px 4px #000)}',
      '.ow6-episode-card .ow6-ep-has-logo .ow6-ep-fallback{visibility:hidden}',
      '.ow6-episode-card .full-episode__num{position:absolute!important;left:.8em!important;top:.7em!important;z-index:2;margin:0!important;padding:.14em .48em!important;font-size:.78em!important;border-radius:.35em;background:rgba(0,0,0,.58)}',
      '.ow6-episode-card .full-episode__name{display:block!important;position:relative!important;max-width:100%;font-weight:650!important;line-height:1.2!important;font-size:.83em!important;margin:.12em 0!important;text-align:left!important;text-shadow:0 1px 4px #000}',
      '.ow6-episode-card .full-episode__date{display:block!important;position:relative!important;max-width:100%;font-size:.72em!important;margin:.12em 0 0!important;opacity:.82!important;text-align:left!important;text-shadow:0 1px 4px #000}',
      /* Interface+ alternate card mode overrides the native episode DOM with its own
         title/number rules. Override ONLY for our two decorated episode rows. */
      'body.ifx-ep-alt .ow6-episode-card .full-episode .full-episode__body > .card__title{display:none!important}',
      'body.ifx-ep-alt .ow6-episode-card .full-episode .full-episode__num,body.ifx-num-only .ow6-episode-card .full-episode .full-episode__num{display:block!important}',
      /* Lampa focuses the entire .card-episode, not the still image inside it.
         A clipped inset outline remains visible and respects the rounded corners. */
      '.ow6-episode-card.focus .full-episode:after,.ow6-episode-card:focus .full-episode:after,.ow6-episode-card:focus-visible .full-episode:after,.ow6-episode-card:focus-within .full-episode:after{content:"";position:absolute;inset:0;z-index:20;pointer-events:none;border:.21em solid var(--color-main,#fff);border-radius:inherit;box-sizing:border-box}',
      /* v0.7 focus styling is limited to the two wide rows and two episode rows. */
      '.ow7-caption-host{position:relative!important;overflow:visible!important;transition:transform .2s ease!important}',
      '.ow7-caption-host.focus,.ow7-caption-host:focus-visible{z-index:12!important;transform:scale(1.025)}',
      '.ow7-caption-host.focus .card__view,.ow7-caption-host:focus-visible .card__view{box-shadow:0 0 0 .13em rgba(255,255,255,.92),0 10px 22px rgba(0,0,0,.3)!important}',
      '.ow7-caption-host.ow6-episode-card.focus .full-episode,.ow7-caption-host.ow6-episode-card:focus-visible .full-episode{box-shadow:0 0 0 .13em rgba(255,255,255,.92),0 10px 22px rgba(0,0,0,.3)!important}',
      '.ow7-caption-host.ow6-episode-card.focus .full-episode:after,.ow7-caption-host.ow6-episode-card:focus-visible .full-episode:after{display:none!important}',
      '.ow7-caption-host .ow7-focus-title{position:absolute!important;top:100%!important;left:0!important;right:0!important;height:3em!important;box-sizing:border-box!important;padding:.12em .35em 0!important;opacity:0!important;visibility:hidden!important;transform:translateY(-.2em);transition:opacity .16s ease,transform .16s ease,visibility .16s!important;z-index:12!important;pointer-events:none!important;background:none!important;color:#fff!important;text-align:center!important}',
      '.ow7-caption-host .ow7-focus-title-text{display:-webkit-box!important;-webkit-box-orient:vertical!important;-webkit-line-clamp:2!important;line-clamp:2;overflow:hidden!important;white-space:normal!important;overflow-wrap:anywhere!important;font-family:inherit!important;font-weight:400!important;font-size:1.15em!important;line-height:1.2!important;max-height:2.4em!important;text-shadow:0 .0625em .1875em rgba(0,0,0,.9)!important}',
      '.ow7-caption-host:not(.ow7-logo-uk).focus .ow7-focus-title,.ow7-caption-host:not(.ow7-logo-uk):focus-visible .ow7-focus-title{opacity:1!important;visibility:visible!important;transform:translateY(0)}',
      /* Reserve a modest title gutter without modifying native rows globally. */
      '.ow6-card.ow7-caption-host,.ow6-episode-card.ow7-caption-host{margin-bottom:3em!important}',
      /* Move the native quick-action strip away from the centered logo. */
      '.ow6-card .card__icons{position:absolute!important;top:6%!important;left:50%!important;bottom:auto!important;transform:translateX(-50%)!important;z-index:15!important}',
      '.ow6-card .card__icons .card__icon{position:relative}',
      '@media(max-width:600px){.ow6-card.card--wide{width:22.5em!important;max-width:92vw!important}.ow6-card .ow6-watch{font-size:.7em}.ow6-episode-card{width:18em!important}.ow7-caption-host .ow7-focus-title-text{font-size:1.15em}}'
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
