/*
 * Poster Action Menu — Test 2.4: mobile menu and fixed-layout TMDB gallery (15 posters + Auto)
 * Standalone Lampa plugin for TEST builds.
 * Adds an item to the end of the card "Дія" menu (Select:preshow).
 * Opens a gallery with 1 Auto tile and <=15 real TMDB posters, using 8x2 landscape and 3-column portrait layouts.
 * Respects Obsidian/Spectrolite "obsidian_replace_poster".
 * IMPORTANT: preview and clicking are DEMO only. No saved choices, no poster replacement.
 * No writes to Lampa.Storage or localStorage. No Spectrolite/Card Fusion changes.
 * Replace/disable older Poster Gallery tests before using this plugin.
 */
(function () {
    'use strict';

    var FLAG = '__poster_action_menu_test2_4_gallery';
    var TITLE = 'Вибрати постер TMDB (Test 2.4)';
    var TAG = '[Poster Gallery Test 2.4]';
    var TILE_LIMIT = 15;
    var cssID = 'poster-action-menu-test2-4-css';
    var busy = false;
    var lastTouchedCard = null;
    var lastTouchedAt = 0;

    function log() {
        if (window.console && console.log) {
            var args = Array.prototype.slice.call(arguments);
            args.unshift(TAG);
            console.log.apply(console, args);
        }
    }
    function message(text) {
        try { if (Lampa.Noty && Lampa.Noty.show) Lampa.Noty.show(text); }
        catch (e) { log('Повідомлення:', text); }
    }
    function isMinimal() {
        try {
            var v = Lampa.Storage.get('obsidian_replace_poster', false);
            return v === true || v === 'true' || v === 1 || v === '1';
        } catch (e) { return false; }
    }
    function typeOf(card) {
        if (!card) return 'movie';
        if (card.media_type === 'tv' || card.type === 'tv' ||
            card.first_air_date || card.original_name || card.number_of_seasons) return 'tv';
        return 'movie';
    }
    function cardTitle(card) {
        return String((card && (card.title || card.name || card.original_title || card.original_name)) || 'Без назви');
    }
    function hasCardActions(items) {
        return items.some(function (x) {
            return x && (x.where === 'book' || x.where === 'like' || x.where === 'wath' ||
                x.where === 'history' || x.where === 'viewed' || x.where === 'scheduled' ||
                x.where === 'continue' || x.where === 'thrown');
        });
    }
    function isActionMenu(opts) {
        if (!opts || !Array.isArray(opts.items)) return false;
        var name = String(opts.title || '').trim().toLowerCase();
        var translated = '';
        try { translated = String(Lampa.Lang.translate('title_action') || '').trim().toLowerCase(); } catch (e) {}
        if (name !== translated && name !== 'дія' && name !== 'action') return false;
        if (hasCardActions(opts.items)) return true;
        // Some phone layouts use a differently composed status menu.
        // Match both bookmark and watch-status headings to avoid other 'Action' dialogs.
        var names = opts.items.map(function (x) { return String(x && x.title || '').trim().toLowerCase(); });
        return names.some(function (x) { return /подобається|пізніше|закладки|history|watch|like/.test(x); }) &&
            names.some(function (x) { return /дивлюся|переглянуто|заплановано|далі буде|відкинуто|viewed|scheduled/.test(x); });
    }
    function dataFromNode(node) {
        if (!node) return null;
        var data = node.card_data || node.cardData || null;
        if (!data && window.$) {
            try { data = $(node).data('card') || $(node).data('item') || null; } catch (e) {}
        }
        return data && data.id ? data : null;
    }
    // Touch controls often clear the card focus before Select:preshow fires.
    // Remember the touched card in capture phase; never store it persistently.
    function rememberCard(e) {
        var target = e && e.target;
        var node = target && target.closest ? target.closest('.card') : null;
        var info = dataFromNode(node);
        if (info) { lastTouchedCard = info; lastTouchedAt = Date.now(); }
    }
    function focusedCard() {
        var activity = document.querySelector('.activity--active') || document;
        var focused = document.activeElement;
        if (focused && focused.closest) {
            var near = focused.closest('.card');
            if (near && (!activity.contains || activity.contains(near))) return near;
        }
        return activity.querySelector('.card.focus, .card.traverse, .card.selected, .card.hover') ||
            document.querySelector('.card.focus, .card.traverse, .card.selected, .card.hover');
    }
    function getCardData() {
        // Use the last touched card first: in mobile portrait Select steals focus.
        if (lastTouchedCard && Date.now() - lastTouchedAt < 20000) return lastTouchedCard;
        return dataFromNode(focusedCard());
    }
    function goodPoster(p) {
        return p && typeof p.file_path === 'string' && /^\/[A-Za-z0-9_./-]+\.(?:jpg|jpeg|png|webp)$/i.test(p.file_path);
    }
    function rankImages(a, b) {
        return (Number(b.vote_average) || 0) - (Number(a.vote_average) || 0) ||
            (Number(b.vote_count) || 0) - (Number(a.vote_count) || 0) ||
            ((Number(b.width) || 0) * (Number(b.height) || 0)) -
            ((Number(a.width) || 0) * (Number(a.height) || 0));
    }
    function pickPosters(all, minimal, originalLang) {
        var posters = (Array.isArray(all) ? all : []).filter(goodPoster);
        var orig = String(originalLang || '').trim().toLowerCase().split('-')[0];
        var wanted = minimal ? [null] : ['uk', 'en'];
        if (!minimal && orig && orig !== 'uk' && orig !== 'en') wanted.push(orig);
        var result = [], seen = Object.create(null);
        function appendLanguage(lang, cap) {
            var choices = posters.filter(function (p) {
                return (p.iso_639_1 == null ? null : String(p.iso_639_1).toLowerCase()) === lang;
            }).sort(rankImages);
            for (var i = 0; i < choices.length && result.length < TILE_LIMIT && cap > 0; i++) {
                var p = choices[i];
                if (seen[p.file_path]) continue;
                seen[p.file_path] = true;
                result.push(p);
                cap--;
            }
        }
        if (minimal) {
            appendLanguage(null, TILE_LIMIT);
        } else {
            // Preserve room for English when both Ukrainian and English are abundant.
            appendLanguage('uk', 10);
            appendLanguage('en', TILE_LIMIT - result.length);
            // If EN has fewer than five, give remaining room to more Ukrainian posters.
            if (result.length < TILE_LIMIT) appendLanguage('uk', TILE_LIMIT - result.length);
            // Original-language posters are used only when UK/EN could not fill the grid.
            if (result.length < TILE_LIMIT && wanted.length > 2) appendLanguage(orig, TILE_LIMIT - result.length);
        }
        return result;
    }
    function posterURL(path) {
        return Lampa.TMDB.image('/t/p/w342' + path);
    }
    function addCSS() {
        if (document.getElementById(cssID)) return;
        var css = [
          '.pap2-root{box-sizing:border-box;width:100%;max-width:100%;color:#fff;margin-top:-.35em}',
          '.pap2-state{display:none;font-size:.78em;opacity:.9;line-height:1.3;margin:.3em 0 0}',
          '.pap2-state.pap2-error{display:block}',
          // A stable grid. On landscape 16 cells fit in two rows; no nested scrolling.
          '.pap2-grid{box-sizing:border-box;display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:.5em;padding:.2em .3em .35em;overflow:visible;align-content:start;overflow-anchor:none}',
          '.pap2-card{box-sizing:border-box;position:relative;min-width:0;min-height:0;aspect-ratio:2/3;background:#15262b;border:2px solid rgba(255,255,255,.20);border-radius:.5em;overflow:hidden;cursor:pointer;outline:0}',
          // An absolutely positioned image never changes the cell dimensions during load/focus/scroll.
          '.pap2-card img{position:absolute;inset:0;display:block;width:100%;height:100%;object-fit:cover;background:#0b191e}',
          '.pap2-card.focus,.pap2-card.hover,.pap2-card:hover{border-color:#fff!important;box-shadow:0 0 0 2px #fff;z-index:1}',
          '.pap2-card.pap2-selected{border-color:#38c9a3!important;box-shadow:0 0 0 1px #38c9a3}',
          '.pap2-check{position:absolute;top:.22em;right:.3em;font-weight:700;font-size:1.1em;color:#39e8b1;text-shadow:0 0 3px #000}',
          '.pap2-auto{display:flex;align-items:center;justify-content:center;flex-direction:column;gap:.4em;text-align:center;border-style:dashed;padding:.45em}',
          '.pap2-auto-symbol{font-size:2em;line-height:1}',
          '.pap2-auto-title{font-size:.72em;line-height:1.2}',
          '.pap2-empty{padding:.8em .4em;grid-column:1/-1;opacity:.85;text-align:center}',
          // Use screen orientation, not CSS viewport width: Android often scales the viewport.
          '.pap2-root.pap2-landscape .pap2-grid{grid-template-columns:repeat(8,minmax(0,1fr))}',
          '.pap2-root.pap2-portrait .pap2-grid{grid-template-columns:repeat(3,minmax(0,1fr));gap:.38em;max-height:calc(100vh - 8em);max-height:calc(100dvh - 8em);overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;scrollbar-gutter:stable;overflow-anchor:none;-webkit-overflow-scrolling:touch}',
          '@media(max-width:360px){.pap2-root.pap2-portrait .pap2-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}',
          // Very short landscape windows can scroll if even eight compact columns do not fit.
          '@media(max-height:330px){.pap2-root.pap2-landscape .pap2-grid{max-height:calc(100dvh - 7em);overflow-y:auto;scrollbar-gutter:stable}}'
        ].join('\n');
        $('<style>').attr('id', cssID).text(css).appendTo('head');
    }
    function openGallery(card) {
        if (busy) return;
        if (!card || !card.id || !/^\d+$/.test(String(card.id))) {
            message('Test 2.4: не вдалося визначити TMDB ID тайтлу');
            return;
        }
        if (!window.$ || !Lampa.Modal || !Lampa.TMDB || typeof $.getJSON !== 'function') {
            message('Test 2.4: у цій Lampa недоступні компоненти галереї');
            return;
        }
        busy = true;
        addCSS();
        var minimal = isMinimal();
        var mediaType = typeOf(card);
        var originalLang = String(card.original_language || '').trim().toLowerCase().split('-')[0];
        var name = cardTitle(card);
        var closed = false, lastClick = 0;
        var root = $('<div class="pap2-root"></div>');
        function setOrientation() {
            root.toggleClass('pap2-portrait', window.innerHeight > window.innerWidth);
            root.toggleClass('pap2-landscape', window.innerHeight <= window.innerWidth);
        }
        setOrientation();
        window.addEventListener('resize', setOrientation);
        var status = $('<div class="pap2-state"></div>');
        var gallery = $('<div class="pap2-grid"></div>');
        root.append(gallery, status);

        function choose(cardElement, label) {
            var now = Date.now();
            if (now - lastClick < 300) return;
            lastClick = now;
            gallery.find('.pap2-card').removeClass('pap2-selected').find('.pap2-check').remove();
            cardElement.addClass('pap2-selected').append($('<span class="pap2-check">✓</span>'));
            // Selected border/check is the entire visual feedback for this preview-only test.
        }
        // Avoid fighting Lampa's own focus navigation with another scroll routine.
        function itemClick(cell, label) {
            cell.on('hover:enter click', function (e) {
                if (e && e.preventDefault) e.preventDefault();
                if (e && e.stopPropagation) e.stopPropagation();
                if (!closed) choose(cell, label);
            });
            return cell;
        }
        var auto = itemClick($('<div class="pap2-card pap2-auto selector"></div>')
            .append($('<div class="pap2-auto-symbol">↻</div>'))
            .append($('<div class="pap2-auto-title">Автоматичний вибір</div>')),
            'Автоматичний вибір');
        gallery.append(auto); // Keep at least one focusable item before Modal.open.
        var loading = $('<div class="pap2-empty"></div>').text('Завантаження постерів…');
        gallery.append(loading);

        function finish(error, response) {
            if (closed) return;
            loading.remove();
            if (error) {
                status.addClass('pap2-error').text('Помилка запиту TMDB. Перевір з’єднання або спробуй інший тайтл.');
                gallery.append($('<div class="pap2-empty"></div>').text('Не вдалося отримати постери.'));
                log('Помилка завантаження:', error);
                return;
            }
            var raw = Array.isArray(response && response.posters) ? response.posters : [];
            var selection = pickPosters(raw, minimal, originalLang);
            // No permanent status line: screen space belongs to poster previews.
            log('TMDB:', mediaType, card.id, 'mode:', minimal ? 'minimal' : 'regular', 'raw posters:', raw.length, 'selected:', selection.length, 'original language:', originalLang || '(невідомо)');
            if (!selection.length) {
                gallery.append($('<div class="pap2-empty"></div>').text('Для цього режиму відповідних постерів немає.'));
                return;
            }
            selection.forEach(function (poster) {
                var language = poster.iso_639_1 ? String(poster.iso_639_1).toUpperCase() : 'без мови';
                var tile = $('<div class="pap2-card selector"></div>');
                var img = $('<img alt="Прев’ю постера" width="240" height="360">').attr('loading', 'eager').attr('decoding', 'async');
                img.on('error', function () { $(this).replaceWith($('<div class="pap2-empty"></div>').text('Немає прев’ю')); });
                img.attr('src', posterURL(poster.file_path));
                tile.append(img);
                gallery.append(itemClick(tile, language + ' · ' + poster.file_path));
            });
        }
        try {
            Lampa.Modal.open({
                title: minimal ? 'Постери TMDB · Без мови · T2.4' : 'Постери TMDB · UK/EN · T2.4', html: root, size: 'large',
                onBack: function () {
                    if (closed) return;
                    closed = true; busy = false;
                    window.removeEventListener('resize', setOrientation);
                    try { Lampa.Modal.close(); } catch (e) {}
                }
            });
        } catch (e) {
            busy = false;
            window.removeEventListener('resize', setOrientation);
            log('Не вдалося відкрити Modal:', e);
            message('Test 2.4: не вдалося відкрити галерею');
            return;
        }
        // TMDB handles poster language selection via include_image_language.
        // Do not pass the overall `language=uk` filter: it would hide EN/original.
        var languages = minimal ? ['null'] : ['uk', 'en'];
        if (!minimal && originalLang && languages.indexOf(originalLang) < 0) languages.push(originalLang);
        var url;
        try {
            url = Lampa.TMDB.api(mediaType + '/' + card.id + '/images?api_key=' + Lampa.TMDB.key() +
                '&include_image_language=' + encodeURIComponent(languages.join(',')));
        } catch (e) { finish(e, null); return; }
        try {
            $.getJSON(url, function (data) { finish(null, data); })
                .fail(function (xhr, textStatus) { finish(textStatus || 'network', null); });
        } catch (e) { finish(e, null); }
    }
    function onPreShow(e) {
        var opts = e && e.active;
        if (!isActionMenu(opts)) return;
        if (opts.items.some(function (item) { return item && item.__pap2; })) return;
        var card = getCardData();
        // Do not hide the action just because mobile Select removed focus from the card.
        if (card && card.source && card.source !== 'tmdb') return;
        // With Test 1 accidentally left active, remove its old item if it ran first.
        for (var i = opts.items.length - 1; i >= 0; i--) {
            if (opts.items[i] && opts.items[i].__posterActionProbe) opts.items.splice(i, 1);
        }
        var orig = opts.onSelect;
        opts.items.push({
            title: TITLE,
            subtitle: 'Вибір зображення · тестова галерея',
            __pap2: true,
            onSelect: function (selected, dom) {
                if (typeof orig === 'function') {
                    try { orig.call(opts, selected, dom); }
                    catch (err) { log('Штатний onSelect завершився помилкою:', err); }
                }
                // Let the original action menu close before opening the modal.
                setTimeout(function () { openGallery(card || getCardData()); }, 120);
            }
        });
        log('Пункт галереї додано для:', cardTitle(card), 'TMDB ID:', card && card.id ? card.id : '(немає фокуса; очікується дотик до картки)');
    }
    function init() {
        if (window[FLAG]) return;
        if (!window.Lampa || !Lampa.Select || !Lampa.Select.listener ||
            typeof Lampa.Select.listener.follow !== 'function') {
            log('Select.listener.follow недоступний');
            return;
        }
        window[FLAG] = true;
        document.addEventListener('pointerdown', rememberCard, true);
        document.addEventListener('touchstart', rememberCard, true);
        document.addEventListener('contextmenu', rememberCard, true);
        document.addEventListener('focusin', rememberCard, true);
        Lampa.Select.listener.follow('preshow', onPreShow);
        try {
            if (Lampa.Manifest) Lampa.Manifest.plugins = {
                type: 'other', version: '1.0.0-test2.4', name: 'Poster Gallery Test 2.4',
                description: 'Мобільне меню та стабільна галерея 15 постерів + Авто — без запису в кеш'
            };
        } catch (e) {}
        log('Плагін запущено. Виберіть постер через меню «Дія».');
    }
    if (window.appready) init();
    else if (window.Lampa && Lampa.Listener && typeof Lampa.Listener.follow === 'function')
        Lampa.Listener.follow('app', function (e) { if (e && e.type === 'ready') init(); });
})();
