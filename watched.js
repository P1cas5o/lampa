/*
 * Lampa plugin: "Mark as watched" in context menus
 *
 * Adds a "Mark as watched" item (timecode = 100%) to the long-press / right-click
 * context menu of:
 *   - a movie card            -> the movie is marked 100%
 *   - a series card           -> all aired episodes are marked 100% (asks to confirm)
 *   - an episode / file in a source (online balancers, torrent files, ...)
 *                              -> that episode / movie file is marked 100%
 * Also adds a "Mark as watched" button to the full card page (next to "Watch").
 * Works with non-standard sources too: if a source has its own long-press menu the
 * item is injected into it, if it has none a small menu with this item is shown.
 *
 * How the menu is opened is Lampa's own behaviour:
 *   phone: long tap, TV: long OK, PC: long left click or short right click
 *   (on PC this needs Settings -> Navigation type = "Mouse").
 *
 * ES5 only, so it works on old Tizen / WebOS TV browsers.
 */
(function () {
    'use strict';

    if (window.mark_watched_plugin) return;
    window.mark_watched_plugin = true;

    var last_target = null;
    var last_time = 0;
    var last_select_time = 0;
    var fallback_timer = null;
    var WINDOW = 600;        // menu shown right away: accept any select
    var WINDOW_ASYNC = 8000; // menu shown after a request: accept only the "Action" select
    var FALLBACK_DELAY = 1200; // no menu from the source at all -> show our own

    var TXT = {
        uk: { mark: 'Позначити як переглянуте', all: 'Позначити всі вийшлі серії як переглянуті?', yes: 'Так', no: 'Ні', done: 'Позначено серій: ', one: 'Позначено як переглянуте', fail: 'Не вдалося отримати список серій' },
        ru: { mark: 'Отметить как просмотренное', all: 'Отметить все вышедшие серии как просмотренные?', yes: 'Да', no: 'Нет', done: 'Отмечено серий: ', one: 'Отмечено как просмотренное', fail: 'Не удалось получить список серий' },
        en: { mark: 'Mark as watched', all: 'Mark all aired episodes as watched?', yes: 'Yes', no: 'No', done: 'Episodes marked: ', one: 'Marked as watched', fail: 'Could not load the episode list' }
    };

    function t(key) {
        var l = 'uk';
        try { l = Lampa.Storage.get('language', 'uk'); } catch (e) {}
        var set = TXT[l] || (l === 'be' ? TXT.ru : TXT.en);
        return set[key];
    }

    function markTitle() {
        var tr = '';
        try { tr = Lampa.Lang.translate('episode_mark_watched'); } catch (e) {}
        return tr && tr !== 'episode_mark_watched' ? tr : t('mark');
    }

    function noty(text) {
        try { Lampa.Noty.show(text); } catch (e) {}
    }

    // ---------- marking ----------

    function setWatched(hash, meta) {
        var v = Lampa.Timeline.view(hash);
        var duration = v.duration || 0;
        var params = {
            hash: hash,
            percent: 100,
            time: duration,
            duration: duration,
            profile: v.profile
        };
        if (meta) {
            params.card = meta.card;
            if (typeof meta.season !== 'undefined') params.season = meta.season;
            if (typeof meta.episode !== 'undefined') params.episode = meta.episode;
        }
        Lampa.Timeline.update(params);
    }

    function linkOf(card, season, episode) {
        try { return Lampa.Timeline.link ? Lampa.Timeline.link(card, season, episode) : null; } catch (e) { return null; }
    }

    function epHash(title, season, episode) {
        return Lampa.Utils.hash([season, season > 10 ? ':' : '', episode, title].join(''));
    }

    function cardTitle(card) {
        return card.original_title || card.original_name || '';
    }

    function isSeries(card) {
        return !!(card.original_name || card.name || card.number_of_seasons || card.first_air_date);
    }

    function markMovie(card) {
        var title = cardTitle(card);
        if (!title) return;
        setWatched(Lampa.Utils.hash(title), linkOf(card));
        noty(t('one'));
    }

    function aired(ep) {
        if (!ep || !ep.air_date) return false;
        var p = ep.air_date.split('-');
        if (p.length < 3) return false;
        return new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10)).getTime() <= Date.now();
    }

    function markSeries(card) {
        var title = cardTitle(card);
        var tmdb = Lampa.Api && Lampa.Api.sources && Lampa.Api.sources.tmdb;
        if (!title || !tmdb) return noty(t('fail'));

        tmdb.get('tv/' + card.id, {}, function (json) {
            var nums = [];
            (json.seasons || []).forEach(function (s) {
                if (s.season_number > 0) nums.push(s.season_number);
            });
            if (!nums.length) return noty(t('fail'));

            tmdb.seasons({ id: card.id }, nums, function (res) {
                var count = 0;
                for (var key in res) {
                    var season = res[key];
                    if (!season || !season.episodes) continue;
                    season.episodes.forEach(function (ep) {
                        if (!aired(ep)) return;
                        var s = ep.season_number || parseInt(key, 10);
                        var e = ep.episode_number;
                        if (!s || !e) return;
                        setWatched(epHash(title, s, e), linkOf(card, s, e));
                        count++;
                    });
                }
                noty(count ? t('done') + count : t('fail'));
            });
        }, function () { noty(t('fail')); });
    }

    function confirmSeries(card, back) {
        Lampa.Select.show({
            title: t('all'),
            items: [{ title: t('yes'), yes: true }, { title: t('no') }],
            onSelect: function (a) {
                try { Lampa.Controller.toggle(back); } catch (e) {}
                if (a.yes) markSeries(card);
            },
            onBack: function () {
                try { Lampa.Controller.toggle(back); } catch (e) {}
            }
        });
    }

    // ---------- context detection ----------

    function detect(el) {
        if (!el || !el.closest || el.closest('.selectbox')) return null;

        var node = el;
        while (node && node !== document.body) {
            if (node.card_data) {
                var card = node.card_data;
                // skip persons and incomplete cards
                if (!card.id || typeof card.gender !== 'undefined' || !cardTitle(card)) return null;
                return { type: 'card', card: card };
            }
            node = node.parentNode;
        }

        var tl = el.querySelector ? el.querySelector('.time-line[data-hash]') : null;
        if (tl) return { type: 'file', hash: tl.getAttribute('data-hash') };

        return null;
    }

    function hasMark(items) {
        var title = markTitle();
        for (var i = 0; i < items.length; i++) {
            var it = items[i];
            if (!it) continue;
            if (it.mark_watched_plugin || it.action === 'mark' || it.title === title) return true;
        }
        return false;
    }

    function actionTitle() {
        var tr = '';
        try { tr = Lampa.Lang.translate('title_action'); } catch (e) {}
        return tr || 'Action';
    }

    function currentController() {
        try { return Lampa.Controller.enabled().name || 'content'; } catch (e) { return 'content'; }
    }

    function backTo(name) {
        try { Lampa.Controller.toggle(name); } catch (e) {}
    }

    // One action for a card: movie -> mark now, series -> ask, then mark all aired episodes
    function markCard(card, back) {
        if (isSeries(card)) confirmSeries(card, back);
        else markMovie(card);
    }

    function makeItem(ctx, back) {
        return {
            title: markTitle(),
            mark_watched_plugin: true,
            onSelect: function () {
                if (ctx.type === 'file') {
                    backTo(back);
                    setWatched(ctx.hash);
                    noty(t('one'));
                } else if (isSeries(ctx.card)) {
                    // wait for the menu to close before opening the confirmation
                    setTimeout(function () { confirmSeries(ctx.card, back); }, 50);
                } else {
                    backTo(back);
                    markMovie(ctx.card);
                }
            }
        };
    }

    function inject(params) {
        if (!params || !params.items || !last_target) return;

        var age = Date.now() - last_time;
        if (age > WINDOW_ASYNC) return;
        if (age > WINDOW && params.title !== actionTitle()) return;

        var target = last_target;
        last_target = null; // only the first menu after the long press

        var ctx = detect(target);
        if (!ctx || hasMark(params.items)) return;

        params.items.unshift(makeItem(ctx, currentController()));
    }

    // Source without its own long-press menu: show a small menu with our item
    function fallback(el) {
        if (last_select_time >= last_time || last_target !== el) return;
        try { if (Lampa.Select.opened && Lampa.Select.opened()) return; } catch (e) {}

        var ctx = detect(el);
        if (!ctx || ctx.type !== 'file') return;

        last_target = null;

        var back = currentController();

        Lampa.Select.show({
            title: actionTitle(),
            items: [makeItem(ctx, back)],
            onBack: function () { backTo(back); }
        });
    }

    // ---------- button on the full card page ----------

    var ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M7.5 12.5l3 3 6-7"></path></svg>';

    function addButton(e) {
        var movie = e && e.data && e.data.movie;
        if (!movie || !movie.id || !cardTitle(movie)) return;

        var root = e.object && e.object.activity && e.object.activity.render();
        if (!root || !root.length || root.find('.button--mark-watched').length) return;

        var cont = root.find('.full-start-new__buttons').eq(0);
        if (!cont.length) cont = root.find('.full-start__buttons').eq(0);
        if (!cont.length) return;

        var btn = $('<div class="full-start__button selector button--mark-watched">' + ICON + '<span></span></div>');
        btn.find('span').text(markTitle());

        var last_fire = 0;
        var fire = function () {
            var now = Date.now();
            if (now - last_fire < 400) return;
            last_fire = now;
            markCard(movie, currentController());
        };

        btn.on('hover:enter', fire);
        // Lampa binds click handlers only for nodes added to the DOM, bind ours directly
        btn[0].addEventListener('click', fire);

        var play = cont.find('.button--play').eq(0);
        if (play.length) play.after(btn);
        else cont.prepend(btn);

        try {
            if (Lampa.Controller.collectionAppend && currentController() === 'content') Lampa.Controller.collectionAppend(btn[0]);
        } catch (err) {}
    }

    // ---------- hooks ----------

    function start() {
        // hover:long does not bubble, but the capture phase still sees it
        document.addEventListener('hover:long', function (e) {
            var el = e.target;
            last_target = el;
            last_time = Date.now();

            clearTimeout(fallback_timer);
            fallback_timer = setTimeout(function () { fallback(el); }, FALLBACK_DELAY);
        }, true);

        var orig = Lampa.Select.show;
        Lampa.Select.show = function (params) {
            last_select_time = Date.now();
            try { inject(params); } catch (e) {}
            return orig.apply(this, arguments);
        };

        Lampa.Listener.follow('full', function (e) {
            if (e.type === 'complite') {
                try { addButton(e); } catch (err) {}
            }
        });
    }

    if (window.appready) start();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') start();
        });
    }
})();