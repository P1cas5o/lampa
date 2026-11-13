/*
 * Poster Action Menu — Test 2: TMDB poster gallery
 * Standalone Lampa plugin for TEST builds.
 * Adds an item to the end of the card "Дія" menu (Select:preshow).
 * Opens a gallery with 1 Auto tile and <=14 real TMDB posters.
 * Respects Obsidian/Spectrolite "obsidian_replace_poster".
 * IMPORTANT: preview and clicking are DEMO only. No saved choices, no poster replacement.
 * No writes to Lampa.Storage or localStorage. No Spectrolite/Card Fusion changes.
 * Replace/disable Poster Menu Probe Test 1 before using this plugin.
 */
(function () {
    'use strict';

    var FLAG = '__poster_action_menu_test2_gallery';
    var TITLE = 'Вибрати постер TMDB (Test 2)';
    var TAG = '[Poster Gallery Test 2]';
    var TILE_LIMIT = 14;
    var cssID = 'poster-action-menu-test2-css';
    var busy = false;

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
            return x && (x.where === 'book' || x.where === 'like' ||
                x.where === 'wath' || x.where === 'history' ||
                x.where === 'viewed' || x.where === 'scheduled');
        });
    }
    function isActionMenu(opts) {
        if (!opts || !Array.isArray(opts.items) || !hasCardActions(opts.items)) return false;
        var name = String(opts.title || '').trim().toLowerCase();
        var translated = '';
        try { translated = String(Lampa.Lang.translate('title_action') || '').trim().toLowerCase(); } catch (e) {}
        return name === translated || name === 'дія' || name === 'action';
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
        var node = focusedCard();
        var result = node && (node.card_data || node.cardData || null);
        if (!result && node && window.$) {
            try { result = $(node).data('card') || $(node).data('item') || null; } catch (e) {}
        }
        return result;
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
            appendLanguage('uk', 9);
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
          '.pap2-root{box-sizing:border-box;width:100%;max-width:100%;color:#fff}',
          '.pap2-sub{font-size:.9em;opacity:.8;line-height:1.4;margin:0 0 .65em;}',
          '.pap2-state{font-size:.82em;opacity:.75;min-height:1.6em;margin:.45em 0 .3em}',
          '.pap2-grid{box-sizing:border-box;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:.65em;padding:.2em .35em .6em;max-height:69vh;overflow-x:hidden;overflow-y:auto;overscroll-behavior:contain;align-content:start}',
          '.pap2-card{position:relative;min-width:0;aspect-ratio:2/3;box-sizing:border-box;background:#15262b;border:2px solid rgba(255,255,255,.20);border-radius:.6em;overflow:hidden;display:flex;align-items:center;justify-content:center;cursor:pointer;outline:0}',
          '.pap2-card img{display:block;width:100%;height:100%;object-fit:contain;background:#0b191e}',
          '.pap2-card.focus,.pap2-card.hover,.pap2-card:hover{border-color:#fff!important;box-shadow:0 0 0 2px #fff;z-index:1}',
          '.pap2-card.pap2-selected{border-color:#38c9a3!important;box-shadow:0 0 0 1px #38c9a3}',
          '.pap2-label{position:absolute;bottom:0;left:0;right:0;padding:.55em .25em .35em;text-align:center;font-size:.75em;line-height:1.25;background:linear-gradient(transparent,rgba(0,0,0,.9));text-shadow:0 1px 2px #000}',
          '.pap2-check{position:absolute;top:.25em;right:.3em;font-weight:700;font-size:1.1em;color:#39e8b1;text-shadow:0 0 3px #000}',
          '.pap2-auto{flex-direction:column;gap:.4em;text-align:center;border-style:dashed;padding:.5em}',
          '.pap2-auto-symbol{font-size:2em;line-height:1}',
          '.pap2-auto-title{font-size:.85em;line-height:1.3}',
          '.pap2-empty{padding:1.2em .5em;grid-column:1/-1;opacity:.85;text-align:center}',
          '@media(max-width:900px){.pap2-grid{grid-template-columns:repeat(3,minmax(0,1fr));max-height:63vh}}',
          '@media(max-width:600px) and (orientation:portrait){.pap2-grid{grid-template-columns:repeat(2,minmax(0,1fr));max-height:65vh;gap:.5em}}',
          '@media(max-height:480px){.pap2-grid{max-height:59vh}}'
        ].join('\n');
        $('<style>').attr('id', cssID).text(css).appendTo('head');
    }
    function openGallery(card) {
        if (busy) return;
        if (!card || !card.id || !/^\d+$/.test(String(card.id))) {
            message('Test 2: не вдалося визначити TMDB ID тайтлу');
            return;
        }
        if (!window.$ || !Lampa.Modal || !Lampa.TMDB || typeof $.getJSON !== 'function') {
            message('Test 2: у цій Lampa недоступні компоненти галереї');
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
        var subtitle = $('<div class="pap2-sub"></div>').text((minimal ? 'Мінімалістичний · без зазначеної мови' : 'Звичайний · UK → EN → мова оригіналу') + ' · ' + name);
        var status = $('<div class="pap2-state"></div>').text('Завантаження постерів TMDB…');
        var gallery = $('<div class="pap2-grid"></div>');
        root.append(subtitle, gallery, status);

        function choose(cardElement, label) {
            var now = Date.now();
            if (now - lastClick < 300) return;
            lastClick = now;
            gallery.find('.pap2-card').removeClass('pap2-selected').find('.pap2-check').remove();
            cardElement.addClass('pap2-selected').append($('<span class="pap2-check">✓</span>'));
            status.text('Тестовий вибір: ' + label + ' — постер не змінено й не збережено.');
        }
        function keepVisible(element) {
            try {
                var er = element.getBoundingClientRect(), gr = gallery[0].getBoundingClientRect();
                if (er.bottom > gr.bottom) gallery[0].scrollTop += er.bottom - gr.bottom + 8;
                else if (er.top < gr.top) gallery[0].scrollTop -= gr.top - er.top + 8;
            } catch (e) {}
        }
        function itemClick(cell, label) {
            cell.on('hover:enter click', function (e) {
                if (e && e.preventDefault) e.preventDefault();
                if (e && e.stopPropagation) e.stopPropagation();
                if (!closed) choose(cell, label);
            });
            cell.on('hover:focus hover:hover', function () { keepVisible(cell[0]); });
            return cell;
        }
        var auto = itemClick($('<div class="pap2-card pap2-auto selector"></div>')
            .append($('<div class="pap2-auto-symbol">↻</div>'))
            .append($('<div class="pap2-auto-title">Автоматичний вибір</div>')),
            'Автоматичний вибір');
        gallery.append(auto); // Keep at least one focusable item before Modal.open.

        function finish(error, response) {
            if (closed) return;
            if (error) {
                status.text('Помилка запиту TMDB. Перевір з’єднання або спробуй інший тайтл.');
                gallery.append($('<div class="pap2-empty"></div>').text('Не вдалося отримати постери.'));
                log('Помилка завантаження:', error);
                return;
            }
            var raw = Array.isArray(response && response.posters) ? response.posters : [];
            var selection = pickPosters(raw, minimal, originalLang);
            status.text('Доступно: ' + selection.length + ' із ' + raw.length + ' отриманих TMDB · до 14 варіантів · без збереження');
            log('TMDB:', mediaType, card.id, 'mode:', minimal ? 'minimal' : 'regular', 'raw posters:', raw.length, 'selected:', selection.length, 'original language:', originalLang || '(невідомо)');
            if (!selection.length) {
                gallery.append($('<div class="pap2-empty"></div>').text('Для цього режиму відповідних постерів немає.'));
                return;
            }
            selection.forEach(function (poster) {
                var language = poster.iso_639_1 ? String(poster.iso_639_1).toUpperCase() : 'без мови';
                var tile = $('<div class="pap2-card selector"></div>');
                var img = $('<img alt="Прев’ю постера">').attr('loading', 'lazy');
                img.on('error', function () { $(this).replaceWith($('<div class="pap2-empty"></div>').text('Немає прев’ю')); });
                img.attr('src', posterURL(poster.file_path));
                tile.append(img, $('<div class="pap2-label"></div>').text(language));
                gallery.append(itemClick(tile, language + ' · ' + poster.file_path));
            });
        }
        try {
            Lampa.Modal.open({
                title: 'Вибір постера TMDB · Test 2', html: root, size: 'large',
                onBack: function () {
                    if (closed) return;
                    closed = true; busy = false;
                    try { Lampa.Modal.close(); } catch (e) {}
                }
            });
        } catch (e) {
            busy = false;
            log('Не вдалося відкрити Modal:', e);
            message('Test 2: не вдалося відкрити галерею');
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
        if (!card || !card.id || (card.source && card.source !== 'tmdb')) return;
        // With Test 1 accidentally left active, remove its old item if it ran first.
        for (var i = opts.items.length - 1; i >= 0; i--) {
            if (opts.items[i] && opts.items[i].__posterActionProbe) opts.items.splice(i, 1);
        }
        var orig = opts.onSelect;
        opts.items.push({
            title: TITLE,
            subtitle: 'Галерея TMDB · Авто + до 14 постерів · без збереження',
            __pap2: true,
            onSelect: function (selected, dom) {
                if (typeof orig === 'function') {
                    try { orig.call(opts, selected, dom); }
                    catch (err) { log('Штатний onSelect завершився помилкою:', err); }
                }
                // Let the original action menu close before opening the modal.
                setTimeout(function () { openGallery(card); }, 120);
            }
        });
        log('Пункт галереї додано для:', cardTitle(card), 'TMDB ID:', card.id);
    }
    function init() {
        if (window[FLAG]) return;
        if (!window.Lampa || !Lampa.Select || !Lampa.Select.listener ||
            typeof Lampa.Select.listener.follow !== 'function') {
            log('Select.listener.follow недоступний');
            return;
        }
        window[FLAG] = true;
        Lampa.Select.listener.follow('preshow', onPreShow);
        try {
            if (Lampa.Manifest) Lampa.Manifest.plugins = {
                type: 'other', version: '1.0.0-test2', name: 'Poster Gallery Test 2',
                description: 'Окрема галерея постерів TMDB у меню «Дія» — без запису в кеш'
            };
        } catch (e) {}
        log('Плагін запущено. Виберіть постер через меню «Дія».');
    }
    if (window.appready) init();
    else if (window.Lampa && Lampa.Listener && typeof Lampa.Listener.follow === 'function')
        Lampa.Listener.follow('app', function (e) { if (e && e.type === 'ready') init(); });
})();
