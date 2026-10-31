/*
 * UAKino Direct — Test 1 (bootstrap + UI fix for Lampa)
 * Base runtime: RevoltEnergy/lampa-plugins/uakino.js (upstream, loaded remotely).
 * This is a launcher/compatibility shim, not a replacement stream parser.
 * 2026-10-31. Requires Internet access to upstream plugin at startup.
 * IMPORTANT: disable original uakino.js before installing this file to avoid duplicate registrations.
 */
(function () {
    'use strict';

    if (window.__uakino_direct_test1_loaded__) return;
    window.__uakino_direct_test1_loaded__ = true;

    var TAG = '[UAKino Direct Test 1]';
    var URLS = [
        'https://raw.githubusercontent.com/RevoltEnergy/lampa-plugins/main/uakino.js',
        'https://revoltenergy.github.io/lampa-plugins/uakino.js'
    ];
    var ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m10 8 6 4-6 4z"/></svg>';
    var booted = false;
    var attached = false;
    var coreState = 'очікування';
    var lastError = '';
    var lastMovie = null;
    var menuAdded = false;
    var lastOpen = 0;
    var lastSource = '';
    var timer = null;

    function log(message, error) {
        try { console.log(TAG, message, error || ''); } catch (ignore) {}
    }
    function show(message) {
        try {
            if (window.Lampa && Lampa.Noty && typeof Lampa.Noty.show === 'function') {
                Lampa.Noty.show(message);
                return;
            }
        } catch (ignore) {}
        log(message);
    }
    function hasCore() {
        try {
            if (!window.Lampa || !Lampa.Component || typeof Lampa.Component.get !== 'function') return !!window.uakino_plugin_ready;
            return !!Lampa.Component.get('uakino');
        } catch (error) {
            return !!window.uakino_plugin_ready;
        }
    }
    function isReady() {
        try {
            if (!window.Lampa || !Lampa.Component || typeof Lampa.Component.add !== 'function' ||
                !Lampa.Activity || typeof Lampa.Activity.push !== 'function' || !Lampa.Listener) return false;
            if (window.appready) return true;
            return typeof Lampa.Activity.active === 'function' && !!Lampa.Activity.active();
        } catch (ignore) { return false; }
    }
    function activityMovie() {
        try {
            var active = Lampa.Activity.active && Lampa.Activity.active();
            if (active && active.component === 'full') return active.card || active.movie || null;
        } catch (ignore) {}
        return null;
    }
    function openUakino(movie) {
        var now = Date.now();
        if (now - lastOpen < 650) return;
        lastOpen = now;
        if (!hasCore()) {
            show('UAKino Direct: модуль не запущено (' + coreState + '). ' + (lastError || 'Перевір підключення та консоль.'));
            return;
        }
        try {
            var info = movie || lastMovie || activityMovie();
            var page = {component: 'uakino', title: 'UAKino', page: 1};
            if (info) {
                page.movie = info;
                page.search = info.title || info.name || '';
                page.searchTwo = info.original_title || info.original_name || '';
            }
            Lampa.Activity.push(page);
        } catch (error) {
            log('Activity.push failure', error);
            show('UAKino Direct: помилка відкриття — ' + (error.message || error));
        }
    }
    function addFullButton(event) {
        if (!window.Lampa || typeof window.$ !== 'function') return;
        try {
            var root = null;
            if (event && event.object && event.object.activity && typeof event.object.activity.render === 'function') {
                root = $(event.object.activity.render());
            }
            if (!root || !root.length) {
                var active = Lampa.Activity && Lampa.Activity.active ? Lampa.Activity.active() : null;
                if (!active || active.component !== 'full') return;
                root = $('.full').last();
            }
            if (!root.length || root.find('.view--uakino-direct-test1').length) return;
            var target = root.find('.full-start-new__buttons, .buttons--container, .full-start__buttons').first();
            if (!target.length) return;
            var movie = event && event.data && (event.data.movie || event.data.card) ||
                        event && event.object && (event.object.movie || event.object.card) ||
                        activityMovie();
            if (movie) lastMovie = movie;
            var btn = $('<div class="full-start__button selector view--uakino-direct-test1" data-subtitle="UAKino Direct · Test 1">' +
                       '<div class="full-start__icon">' + ICON + '</div>' +
                       '<div class="full-start__text">UAKino</div></div>');
            btn.on('hover:enter click', function () { openUakino(movie || activityMovie()); });
            target.append(btn);
            attached = true;
            log('Movie-page button added');
        } catch (error) { log('Button insertion failed', error); }
    }
    function addMenuFallback() {
        if (menuAdded || !Lampa.Menu || typeof Lampa.Menu.addButton !== 'function') return;
        try {
            if (typeof window.$ === 'function' && $('.uakino-menu, .uakino-direct-test1-menu').length) {
                menuAdded = true;
                return;
            }
            var btn = Lampa.Menu.addButton(ICON, 'UAKino', function () { openUakino(null); });
            if (btn && typeof btn.addClass === 'function') btn.addClass('uakino-direct-test1-menu');
            else if (btn && btn.classList) btn.classList.add('uakino-direct-test1-menu');
            menuAdded = true;
            log('Fallback menu entry added');
        } catch (error) { log('Menu insertion failed', error); }
    }
    // Original upstream assigns an object to Manifest.plugins. Protect all other registrations
    // during that one external script evaluation without altering the original stream parser.
    function guardManifest() {
        var manifest = Lampa.Manifest;
        if (!manifest) return function () {};
        var originalDesc = Object.getOwnPropertyDescriptor(manifest, 'plugins');
        if (originalDesc && !originalDesc.configurable) return function () {};
        var previous = manifest.plugins;
        var list = Array.isArray(previous) ? previous : previous && previous.component ? [previous] : [];
        try {
            Object.defineProperty(manifest, 'plugins', {
                configurable: true,
                enumerable: true,
                get: function () { return list; },
                set: function (next) {
                    if (Array.isArray(next)) {
                        list = next;
                    } else if (next && next.component) {
                        if (!list.some(function (p) { return p && p.component === next.component; })) list.push(next);
                    }
                }
            });
        } catch (error) { log('Manifest guard unavailable', error); return function () {}; }
        return function restore() {
            try {
                Object.defineProperty(manifest, 'plugins', {
                    value: list, writable: true, configurable: true, enumerable: true
                });
            } catch (error) { log('Manifest restore failure', error); }
        };
    }
    function checkCoreAfterLoad(url, next) {
        if (hasCore()) {
            coreState = 'готово';
            lastError = '';
            lastSource = url;
            log('Core component registered from ' + url);
            addMenuFallback();
            addFullButton();
        } else {
            lastError = 'Скрипт завантажився, але компонент uakino не зареєстровано';
            log(lastError);
            // A failed upstream boot may leave the ready flag set despite no component.
            if (window.uakino_plugin_ready) window.uakino_plugin_ready = false;
            next();
        }
    }
    function loadCore(index) {
        if (hasCore()) {
            coreState = 'готово (вже встановлений)';
            addMenuFallback();
            return;
        }
        if (index >= URLS.length) {
            coreState = 'помилка';
            addMenuFallback();
            log('Could not initialize upstream core: ' + lastError);
            return;
        }
        var url = URLS[index];
        coreState = 'завантаження ' + (index + 1) + '/' + URLS.length;
        // We inject only after Lampa is fully initialized: prevent missing the app-ready event.
        if (!window.appready) window.appready = true;
        var restore = guardManifest();
        var script = document.createElement('script');
        var completed = false;
        var watchdog = setTimeout(function () {
            if (completed) return;
            completed = true;
            script.onload = script.onerror = null;
            restore();
            lastError = 'Тайм-аут завантаження ' + url;
            log(lastError);
            loadCore(index + 1);
        }, 13000);
        function finish(ok) {
            if (completed) return;
            completed = true;
            clearTimeout(watchdog);
            restore();
            if (ok) checkCoreAfterLoad(url, function () { loadCore(index + 1); });
            else {
                lastError = 'Не вдалося завантажити ' + url;
                log(lastError);
                loadCore(index + 1);
            }
        }
        script.onload = function () { finish(true); };
        script.onerror = function () { finish(false); };
        script.async = true;
        script.src = url;
        (document.head || document.documentElement).appendChild(script);
    }
    function init() {
        if (booted || !isReady()) return;
        booted = true;
        try {
            Lampa.Listener.follow('full', function (event) {
                if (event && event.type && event.type !== 'complite' && event.type !== 'complete') return;
                addFullButton(event);
                setTimeout(function () { addFullButton(event); }, 250);
            });
        } catch (error) { log('Full event subscription failed', error); }
        addFullButton();
        setTimeout(addFullButton, 600);
        loadCore(0);
    }
    if (window.Lampa && Lampa.Listener && typeof Lampa.Listener.follow === 'function') {
        try { Lampa.Listener.follow('app', function (event) { if (event && event.type === 'ready') init(); }); }
        catch (ignore) {}
    }
    var tries = 0;
    timer = setInterval(function () {
        tries++;
        init();
        if (booted || tries >= 100) clearInterval(timer);
    }, 350);
    init();

    window.__UAKINO_DIRECT_TEST1__ = {
        status: function () {
            return { booted: booted, state: coreState, component: hasCore(),
                     movieButton: attached, upstreamUrl: lastSource, error: lastError };
        },
        open: openUakino,
        addButton: addFullButton
    };
})();
