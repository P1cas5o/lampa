/*
 * Poster Action Menu Probe — Test 1
 * Standalone Lampa plugin. Does not modify Spectrolite or Card Fusion.
 * Adds one diagnostic item at the bottom of a TMDB card's "Дія" context menu.
 * Test only: NO poster downloads, NO persistent cache, NO setting changes.
 * Compatible with the Lampa Select "preshow" listener (no monkeypatches).
 */
(function () {
    'use strict';

    var GUARD = '__poster_action_menu_probe_test1';
    var TITLE = 'Вибрати постер TMDB (тест)';
    var TAG = '[Poster Menu Test 1]';

    function debug() {
        if (window.console && console.log) {
            var parts = Array.prototype.slice.call(arguments);
            parts.unshift(TAG);
            console.log.apply(console, parts);
        }
    }

    function hasCardActions(items) {
        // Guard: we only touch the normal card context menu, never settings,
        // playback source lists, or other Lampa.Select dialogs.
        return items.some(function (item) {
            return item && (item.where === 'book' || item.where === 'like' ||
                item.where === 'wath' || item.where === 'history' ||
                item.where === 'viewed' || item.where === 'scheduled');
        });
    }

    function isActionMenu(opts) {
        if (!opts || !Array.isArray(opts.items) || !hasCardActions(opts.items)) return false;
        var title = String(opts.title || '').trim().toLowerCase();
        var expected = '';
        try { expected = String(Lampa.Lang.translate('title_action') || '').trim().toLowerCase(); } catch (e) {}
        return title === expected || title === 'дія' || title === 'action';
    }

    function getFocusedCard() {
        var scope = document.querySelector('.activity--active') || document;
        var focused = document.activeElement;
        if (focused && focused.closest) {
            var card = focused.closest('.card');
            if (card && (!scope.contains || scope.contains(card))) return card;
        }
        var found = scope.querySelector('.card.focus, .card.traverse, .card.selected, .card.hover');
        if (!found && scope !== document) {
            found = document.querySelector('.card.focus, .card.traverse, .card.selected, .card.hover');
        }
        return found;
    }

    function readCard() {
        var node = getFocusedCard();
        var data = node && (node.card_data || node.cardData || null);
        // Fallback for Lampa-derived skins that attach the object via jQuery.
        if (!data && node && window.$) {
            try { data = $(node).data('card') || $(node).data('item') || null; } catch (e) {}
        }
        return { node: node, data: data };
    }

    function showDiagnostics(card) {
        var data = card || {};
        var title = data.title || data.name || data.original_title || data.original_name || 'Назву не знайдено';
        var id = data.id != null ? String(data.id) : 'не визначено';
        var source = data.source || 'не вказано';
        var type = (data.name || data.original_name || data.first_air_date) && !data.title ? 'серіал' : 'фільм';
        var minimal = 'невідомо';
        try {
            var v = Lampa.Storage.get('obsidian_replace_poster', false);
            minimal = v === true || v === 'true' ? 'Так' : 'Ні';
        } catch (e) {}
        var line = 'TMDB ID: ' + id + ' · ' + type + ' · мінімалістичний: ' + minimal;
        debug('Вибрано:', title, line, 'source:', source, 'object:', data);
        // Toast is intentionally used instead of another select: it is safe
        // during closing of the original context menu on phones and TV.
        setTimeout(function () {
            try {
                if (Lampa.Noty && typeof Lampa.Noty.show === 'function') {
                    Lampa.Noty.show('Тест вибору постера: ' + title + ' | ' + line);
                }
            } catch (e) { debug('Не вдалося показати повідомлення', e); }
        }, 90);
    }

    function onBeforeSelect(e) {
        var opts = e && e.active;
        if (!isActionMenu(opts)) return;
        if (opts.items.some(function (x) { return x && x.__posterActionProbe; })) return;

        var info = readCard();
        var card = info.data;
        // If a card explicitly belongs to another provider, do not inject.
        if (card && card.source && card.source !== 'tmdb') return;

        var originalSelect = opts.onSelect;
        opts.items.push({
            title: TITLE,
            subtitle: 'Перевірка меню та TMDB ID, без зміни постера',
            __posterActionProbe: true,
            onSelect: function (selected, domItem) {
                // Legacy Lampa restores the original controller in onSelect.
                // Modern Lampa does so via onBeforeClose. Keep both intact.
                if (typeof originalSelect === 'function') {
                    try { originalSelect.call(opts, selected, domItem); }
                    catch (err) { debug('Помилка штатного onSelect:', err); }
                }
                showDiagnostics(card);
            }
        });
        debug('Додано пункт у меню «Дія».', card ? 'TMDB ID: ' + card.id : 'Дані картки поки не визначені');
    }

    function start() {
        if (window[GUARD]) return;
        if (!window.Lampa || !Lampa.Select || !Lampa.Select.listener ||
            typeof Lampa.Select.listener.follow !== 'function') {
            debug('У цій збірці Lampa немає Select.listener.follow — пункт не додано.');
            try { if (Lampa.Noty) Lampa.Noty.show('Poster Menu Test: Select.listener недоступний'); } catch (e) {}
            return;
        }
        window[GUARD] = true;
        Lampa.Select.listener.follow('preshow', onBeforeSelect);
        try {
            if (Lampa.Manifest) {
                Lampa.Manifest.plugins = {
                    type: 'other', version: '1.0.0-test1', name: 'Poster Menu Probe',
                    description: 'Тест пункту вибору постера в меню «Дія» без змін даних'
                };
            }
        } catch (e) { debug('Manifest не додано', e); }
        debug('Увімкнено. Затисніть картку TMDB та відкрийте меню «Дія».');
    }

    if (window.appready) start();
    else if (window.Lampa && Lampa.Listener && typeof Lampa.Listener.follow === 'function') {
        Lampa.Listener.follow('app', function (e) { if (e && e.type === 'ready') start(); });
    }
})();
