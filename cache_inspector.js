/*
 * Lampa Cache Inspector v1.0.0 Test 1 (read-only)
 * Ukrainian interface. Separate from YarikRazor Cache Editor.
 * SAFETY: does not delete, overwrite, export or persist user data.
 * The scan reads localStorage and Lampa plugin registries only.
 * Detection is heuristic: unknown != unused; possible leftover != safe to delete.
 */
(function () {
    'use strict';

    var COMPONENT = 'lampa_cache_inspector_t1';
    var SETTINGS = 'lampa_cache_inspector_settings_t1';
    var STYLE_ID = 'lampa-cache-inspector-t1-css';
    var FLAG = 'lampa_cache_inspector_test1_started';
    var PAGE_SIZE = 48;

    var FINGERPRINTS = [
        {
            name: 'GramLink / GramJS',
            key: /^(gramlink(?:[_.:\-]|$)|gramjs(?:[_.:\-]|$)|telegram(?:[_.:\-]|$)|mtproto(?:[_.:\-]|$)|tg_schema(?:[_.:\-]|$))/i,
            url: /(gramlink|gramjs|tgsbundle|mtproto|telegram)/i,
            reason: 'Ключ схожий на дані Telegram / GramJS.'
        },
        {
            name: 'Card Fusion',
            key: /^(card[_-]?fusion(?:[_.:\-]|$)|cf_(?:logo|hybrid|info|card|rating|slideshow|backdrop|image))/i,
            url: /card[_-]?fusion/i,
            reason: 'Префікс належить до відомих ключів Card Fusion.'
        },
        {
            name: 'Spectrolite',
            key: /^spectrolite(?:[_.:\-]|$)/i,
            url: /spectrolite/i,
            reason: 'Префікс схожий на Spectrolite.'
        },
        {
            name: 'YTranslate',
            key: /^ytranslate(?:[_.:\-]|$)/i,
            url: /ytranslate/i,
            reason: 'Префікс схожий на YTranslate.'
        },
        {
            name: 'YMod',
            key: /^(ym_(?:logo|title|buttons|ratings|main|cache|background|poster)|yarik[_-]?mod(?:[_.:\-]|$))/i,
            url: /(yarik.?mod|ymod\.js|yariks.?mod)/i,
            reason: 'Ключ схожий на налаштування YMod.'
        },
        {
            name: 'Obsidian',
            key: /^obsidian(?:[_.:\-]|$)/i,
            url: /obsidian/i,
            reason: 'Префікс схожий на Obsidian.'
        },
        {
            name: 'Cardify',
            key: /^cardify(?:[_.:\-]|$)/i,
            url: /cardify/i,
            reason: 'Префікс схожий на Cardify.'
        },
        {
            name: 'EasyTorrent Design',
            key: /^(easytorrent(?:[_.:\-]|$)|etd_(?:style|design|compact|layout))/i,
            url: /easytorrent/i,
            reason: 'Ключ схожий на EasyTorrent.'
        },
        {
            name: 'Редактор кешу YarikRazor',
            key: /^lampaCacheEditorTrash$/,
            url: /(redkesh|redaktor\.js|cache.?editor)/i,
            reason: 'Кошик редактора кешу (може містити відновлювані дані).'
        }
    ];

    var TITLES = {
        protected: 'Захищені / важливі',
        active: 'Пов’язані з плагінами',
        candidate: 'Можливі залишки',
        unknown: 'Не визначено'
    };

    function safeArray(value) {
        if (typeof value === 'string') {
            try { value = JSON.parse(value); } catch (e) { return []; }
        }
        return Object.prototype.toString.call(value) === '[object Array]' ? value : [];
    }

    function readableUrl(url) {
        return String(url || '').split('?')[0].split('#')[0].slice(0, 240);
    }

    function bytesOf(str) {
        // Approximate localStorage capacity: UTF-16 code units. Actual quota varies.
        return (String(str || '').length * 2);
    }

    function displayBytes(size) {
        if (size < 1024) return size + ' Б';
        if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' КБ';
        return (size / (1024 * 1024)).toFixed(2) + ' МБ';
    }

    function addPlugin(registry, value, source, forcedStatus) {
        var entry = typeof value === 'string' ? { url: value } : value;
        if (!entry || typeof entry.url !== 'string' || !entry.url) return;
        var url = readableUrl(entry.url);
        if (!url) return;
        var marker = '$' + url.toLowerCase();
        var disabled = (entry.status === 0 || entry.status === false || entry.status === '0');
        var status = forcedStatus || (disabled ? 'Вимкнений' : 'Доданий');
        var item = registry.byUrl[marker];
        if (!item) {
            item = { url: url, sources: [], statuses: [], enabled: false };
            registry.byUrl[marker] = item;
            registry.list.push(item);
        }
        if (item.sources.indexOf(source) === -1) item.sources.push(source);
        if (item.statuses.indexOf(status) === -1) item.statuses.push(status);
        if (status !== 'Вимкнений') item.enabled = true;
    }

    function pluginList() {
        var r = { list: [], byUrl: {}, sourceFound: false, errors: [] };
        try {
            if (window.Lampa && Lampa.Plugins) {
                var p = Lampa.Plugins;
                var methods = [
                    ['get', 'Додані вручну', null],
                    ['awaits', 'До завантаження / CUB', 'Запланований'],
                    ['loaded', 'Завантажені', 'Завантажений']
                ];
                for (var m = 0; m < methods.length; m++) {
                    var method = methods[m];
                    if (typeof p[method[0]] !== 'function') continue;
                    var arr = safeArray(p[method[0]]());
                    r.sourceFound = true;
                    for (var i = 0; i < arr.length; i++) addPlugin(r, arr[i], method[1], method[2]);
                }
            }
        } catch (e) { r.errors.push('API списку плагінів недоступний'); }
        try {
            if (window.Lampa && Lampa.Storage && typeof Lampa.Storage.get === 'function') {
                var stored = safeArray(Lampa.Storage.get('plugins', []));
                r.sourceFound = true;
                for (var j = 0; j < stored.length; j++) addPlugin(r, stored[j], 'Список Lampa.Storage', null);
            }
        } catch (e2) { r.errors.push('Список у Lampa.Storage недоступний'); }
        r.list.sort(function (a, b) { return a.url.localeCompare(b.url); });
        return r;
    }

    function protectedReason(key) {
        // Conservative protection: false positives are safer than deleting valuable data.
        if (/^(plugins|plugins_blacklist|history|favorite|favorites|file_view|online_view|torrents_view|settings|profile|profiles|bookmarks|cache|device_id|lampac_unic_id)$/i.test(key)) {
            return 'Системний або важливий запис Lampa. Не очищати автоматично.';
        }
        if (/^(lampac[_-]|cub[_-]|account[_-]|device[_-]|user[_-]|player[_-]|timeline[_-])/i.test(key)) {
            return 'Префікс пов’язаний із системою, обліковим записом або відтворенням.';
        }
        if (/(?:auth|token|password|passwd|secret|session|cookie|credential|api[_-]?key|access[_-]?key|private[_-]?key|unic[_-]?id|device[_-]?id|uuid|fingerprint|login|account|synchron|[_-]sync|backup|history|favorite|bookmark|watchlist|setting|profile|progress|timeline)/i.test(key)) {
            return 'Назва може вказувати на авторизацію, ідентичність, синхронізацію або користувацькі дані.';
        }
        return '';
    }

    function looksLikeGramSchema(preview) {
        // This examines the initial portion only; no full JSON parsing or copying values.
        return preview.indexOf('"constructorId"') !== -1 &&
               preview.indexOf('"argsConfig"') !== -1 &&
               (preview.indexOf('"InputPeer') !== -1 || preview.indexOf('"InputMedia') !== -1 || preview.indexOf('"subclassOfId"') !== -1);
    }

    function matchedPluginByUrl(plugin, registry) {
        for (var i = 0; i < registry.list.length; i++) {
            if (plugin.url.test(registry.list[i].url)) return registry.list[i];
        }
        return null;
    }

    function genericPluginMatch(key, registry) {
        var normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
        var badNames = /^(?:main|index|app|lampa|plugin|plugins|script|bundle|modification|extensions|common|utils|custom|settings|player|mobile|desktop|loader|dist|release)$/;
        for (var i = 0; i < registry.list.length; i++) {
            var url = registry.list[i].url;
            var filename = url.slice(url.lastIndexOf('/') + 1).replace(/\.js$/i, '').toLowerCase().replace(/[^a-z0-9]/g, '');
            if (filename.length >= 7 && !badNames.test(filename) && normalizedKey.indexOf(filename) === 0) return registry.list[i];
        }
        return null;
    }

    function classify(key, initialText, registry) {
        var protectedText = protectedReason(key);
        if (protectedText) return { type: 'protected', owner: 'Lampa / важливі дані', reason: protectedText };

        var fingerprint = null;
        for (var i = 0; i < FINGERPRINTS.length; i++) {
            if (FINGERPRINTS[i].key.test(key)) {
                fingerprint = FINGERPRINTS[i];
                break;
            }
        }
        if (!fingerprint && looksLikeGramSchema(initialText)) {
            fingerprint = FINGERPRINTS[0];
        }
        if (fingerprint) {
            var matching = matchedPluginByUrl(fingerprint, registry);
            if (matching) return {
                type: 'active', owner: fingerprint.name,
                reason: fingerprint.reason + ' Є відповідний плагін у доступних списках Lampa: ' + matching.url
            };
            return {
                type: 'candidate', owner: fingerprint.name,
                reason: fingerprint.reason + ' Відповідного URL немає в доступних списках. Це НЕ доводить, що дані більше не потрібні.'
            };
        }
        var genericMatch = genericPluginMatch(key, registry);
        if (genericMatch) return {
            type: 'active', owner: 'Ймовірно: ' + genericMatch.url.slice(genericMatch.url.lastIndexOf('/') + 1),
            reason: 'Назва ключа схожа на назву файлу встановленого плагіна. Зв’язок орієнтовний.'
        };
        return {
            type: 'unknown', owner: 'Не визначено',
            reason: 'Недостатньо даних для визначення власника. Відсутність збігу НЕ є підставою для видалення.'
        };
    }

    function scan() {
        var registry = pluginList();
        var result = {
            registry: registry, records: [], error: '', totalBytes: 0,
            counters: { protected: { count: 0, bytes: 0 }, active: { count: 0, bytes: 0 }, candidate: { count: 0, bytes: 0 }, unknown: { count: 0, bytes: 0 } }
        };
        try {
            var ls = window.localStorage;
            var keys = [];
            for (var i = 0; i < ls.length; i++) keys.push(ls.key(i));
            for (var j = 0; j < keys.length; j++) {
                var key = keys[j];
                if (typeof key !== 'string') continue;
                var value;
                try { value = ls.getItem(key); } catch (e) { continue; }
                if (value === null) continue;
                var size = bytesOf(key) + bytesOf(value);
                var kind = classify(key, value.slice(0, 16000), registry);
                result.records.push({ key: key, size: size, type: kind.type, owner: kind.owner, reason: kind.reason });
                result.totalBytes += size;
                result.counters[kind.type].count++;
                result.counters[kind.type].bytes += size;
            }
        } catch (err) {
            result.error = 'Немає доступу до localStorage: ' + (err && err.message ? err.message : 'невідома помилка');
        }
        result.records.sort(function (a, b) { return b.size - a.size; });
        return result;
    }

    function addCss() {
        if ($('#' + STYLE_ID).length) return;
        var css = '' +
            '.ci-wrap{width:100%;height:100%;display:flex;flex-direction:column;box-sizing:border-box;padding:1.2em;overflow:hidden}' +
            '.ci-list{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:0.8em;padding:0.5em 0.4em 4em;box-sizing:border-box}' +
            '.ci-header{grid-column:1/-1;background:rgba(255,255,255,.065);padding:1em 1.1em;border-radius:.75em;line-height:1.5}' +
            '.ci-header strong{font-size:1.08em;color:#fff}' +
            '.ci-small{display:block;opacity:.7;font-size:.84em;margin-top:.3em;line-height:1.5;overflow-wrap:anywhere}' +
            '.ci-card{border:2px solid transparent;background:rgba(255,255,255,.08);border-radius:.75em;padding:1em;min-height:7.6em;box-sizing:border-box;display:flex;flex-direction:column;justify-content:center;gap:.4em;cursor:pointer;overflow:hidden}' +
            '.ci-card.focus{background:#fff;color:#111;border-color:#fff;transform:scale(1.025)}' +
            '.ci-card.focus .ci-name,.ci-card.focus .ci-desc{color:#111}' +
            '.ci-name{font-weight:600;color:#fff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:1em}' +
            '.ci-desc{color:#ccc;font-size:.83em;overflow:hidden;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:3;overflow-wrap:anywhere;line-height:1.4}' +
            '.ci-card.focus .ci-desc{color:#444}' +
            '.ci-card-wide{grid-column:1/-1;min-height:4em}' +
            '.ci-accent{border-left:4px solid #e6b04c}' +
            '.ci-neutral{border-left:4px solid #6b8aad}' +
            '.ci-safe{border-left:4px solid #6baf85}' +
            '.ci-stat{font-size:1.08em;font-weight:bold;white-space:nowrap}' +
            '@media(max-width:900px){.ci-list{grid-template-columns:repeat(2,minmax(0,1fr));gap:.6em}.ci-card{min-height:6.8em;padding:.7em}.ci-wrap{padding:.65em}}' +
            '@media(min-width:901px) and (max-width:1200px){.ci-list{grid-template-columns:repeat(3,minmax(0,1fr))}}';
        $('<style id="' + STYLE_ID + '"></style>').text(css).appendTo('head');
    }

    function makeCard(grid, title, description, callback, opts) {
        opts = opts || {};
        var card = $('<div class="ci-card selector"></div>');
        if (opts.wide) card.addClass('ci-card-wide');
        if (opts.accent) card.addClass('ci-' + opts.accent);
        card.append($('<div class="ci-name"></div>').text(title));
        if (opts.stat) card.append($('<div class="ci-stat"></div>').text(opts.stat));
        if (description) card.append($('<div class="ci-desc"></div>').text(description));
        card.on('hover:focus', function () {
            if (opts.scroll) opts.scroll.update(card);
        });
        card.on('hover:enter', function () {
            if (typeof callback === 'function') callback();
        });
        grid.append(card);
        return card;
    }

    function makeHeader(grid, heading, description) {
        var header = $('<div class="ci-header"></div>');
        header.append($('<strong></strong>').text(heading));
        header.append($('<span class="ci-small"></span>').text(description));
        grid.append(header);
    }

    function showDetail(title, lines) {
        var items = [];
        for (var i = 0; i < lines.length; i++) {
            items.push({ title: lines[i].slice(0, 280), id: 'line' + i });
        }
        items.push({ title: 'Закрити', id: 'close' });
        Lampa.Select.show({
            title: String(title).slice(0, 180), nomark: true, items: items,
            onSelect: function () { Lampa.Controller.toggle('content'); },
            onBack: function () { Lampa.Controller.toggle('content'); }
        });
    }

    function registerComponent() {
        if (Lampa.Component.get(COMPONENT)) return;
        Lampa.Component.add(COMPONENT, function (object) {
            var self = this;
            var root = $('<div class="ci-wrap"></div>');
            var scroll = new Lampa.Scroll({ mask: true, over: true, scroll_by_item: true });
            var grid = $('<div class="ci-list"></div>');
            var snapshot = null;
            var limit = PAGE_SIZE;
            var level = object.level || 'overview';

            function go(target, title) {
                Lampa.Activity.push({ url: '', component: COMPONENT, title: title, level: target });
            }

            function displayRecord(rec) {
                showDetail(rec.key, [
                    'Розмір (орієнтовно): ' + displayBytes(rec.size),
                    'Статус: ' + TITLES[rec.type],
                    'Ймовірний власник: ' + rec.owner,
                    'Підстава: ' + rec.reason,
                    'Test 1: жодних дій із видалення немає.'
                ]);
            }

            function build() {
                grid.empty();
                scroll.clear();
                if (typeof scroll.minus === 'function') scroll.minus();
                if (typeof scroll.reset === 'function') scroll.reset();
                var sc = scroll.render();
                var body = sc.find('.scroll__body');
                if (body.length) body.css('transform', 'translate3d(0, 0, 0)');

                if (level === 'overview') {
                    makeHeader(grid, 'Cache Inspector · Test 1',
                        'ТІЛЬКИ АНАЛІЗ. Дані не змінюються. Оцінка розміру приблизна. ' +
                        (snapshot.error || ('Перевірено ' + snapshot.records.length + ' ключів · ' + displayBytes(snapshot.totalBytes) + '.')));
                    makeCard(grid, '↻ Сканувати повторно', 'Перечитати поточний список плагінів та localStorage', function () {
                        snapshot = scan(); self.buildData();
                    }, { wide: true, scroll: scroll });
                    var blocks = [
                        { type: 'candidate', title: '⚠ Можливі залишки', accent: 'accent' },
                        { type: 'active', title: '✓ Пов’язані з плагінами', accent: 'safe' },
                        { type: 'protected', title: '🔒 Захищені записи', accent: 'neutral' },
                        { type: 'unknown', title: '? Не визначено', accent: 'neutral' }
                    ];
                    blocks.forEach(function (b) {
                        var c = snapshot.counters[b.type];
                        makeCard(grid, b.title, c.count + ' ключів · ' + displayBytes(c.bytes), function () {
                            go(b.type, TITLES[b.type]);
                        }, { accent: b.accent, scroll: scroll });
                    });
                    makeCard(grid, '🧩 Виявлені плагіни', snapshot.registry.list.length + ' URL · враховано додані, вимкнені, завантажені та CUB (якщо доступні)', function () {
                        go('plugins', 'Виявлені плагіни');
                    }, { wide: true, scroll: scroll });
                    makeCard(grid, '▤ Усі записи', snapshot.records.length + ' ключів за спаданням розміру', function () {
                        go('all', 'Усі записи localStorage');
                    }, { wide: true, scroll: scroll });
                    makeHeader(grid, 'Як читати висновки',
                        '«Можливий залишок» — лише збіг з відомою сигнатурою без знайденого URL плагіна. ' +
                        '«Не визначено» не означає сміття. JavaScript може завантажуватися нестандартно. ' +
                        'Дати створення ключів localStorage недоступні; IndexedDB та Cache Storage поки не аналізуються.');
                    if (!snapshot.registry.sourceFound) makeHeader(grid, 'Увага', 'API списку плагінів не вдалося прочитати. Висновки про відсутність плагінів особливо ненадійні.');
                } else if (level === 'plugins') {
                    makeHeader(grid, 'Виявлені плагіни',
                        snapshot.registry.list.length + ' адрес · перелік може не включати скрипти, завантажені нестандартним способом. URL показуються без параметрів запиту.');
                    var plugins = snapshot.registry.list;
                    plugins.slice(0, limit).forEach(function (p) {
                        makeCard(grid, p.url.slice(p.url.lastIndexOf('/') + 1) || p.url,
                            p.statuses.join(' / ') + ' · ' + p.url,
                            function () { showDetail(p.url, ['Статус: ' + p.statuses.join(', '), 'Джерела: ' + p.sources.join(', '), 'Ключі кешу не можна достовірно прив’язати лише за URL.']); },
                            { scroll: scroll });
                    });
                    if (!plugins.length) makeHeader(grid, 'Список порожній', 'Або API недоступний, або доданих плагінів не виявлено.');
                    if (plugins.length > limit) makeCard(grid, 'Показати ще', (plugins.length - limit) + ' адрес', function () { limit += PAGE_SIZE; self.buildData(); }, { wide: true, scroll: scroll });
                } else {
                    var rows = level === 'all' ? snapshot.records : snapshot.records.filter(function (x) { return x.type === level; });
                    var detail = level === 'candidate' ? 'Не видаляйте ці дані лише за цим висновком. Спочатку перевірте залежності.' :
                        level === 'unknown' ? 'Власника не встановлено. Це НЕ означає, що запис зайвий.' :
                        level === 'active' ? 'Є схожий встановлений або завантажений плагін; збіг може бути приблизним.' :
                        level === 'protected' ? 'Потенційно важливі дані; очищення не пропонується.' :
                        'Усі доступні ключі localStorage, від найбільшого до найменшого.';
                    makeHeader(grid, level === 'all' ? 'Усі записи' : TITLES[level],
                        rows.length + ' ключів. ' + detail);
                    rows.slice(0, limit).forEach(function (r) {
                        makeCard(grid, r.key, r.owner + ' · ' + displayBytes(r.size), function () { displayRecord(r); },
                            { accent: r.type === 'candidate' ? 'accent' : r.type === 'active' ? 'safe' : 'neutral', scroll: scroll });
                    });
                    if (!rows.length) makeHeader(grid, 'Записів не знайдено', 'Для цієї категорії збігів немає.');
                    if (rows.length > limit) makeCard(grid, 'Показати ще', (rows.length - limit) + ' записів', function () { limit += PAGE_SIZE; self.buildData(); }, { wide: true, scroll: scroll });
                }
                scroll.append(grid);
            }

            this.create = function () {
                snapshot = scan();
                root.append(scroll.render());
                build();
                return root;
            };
            this.buildData = build;
            this.start = function () {
                Lampa.Controller.add('content', {
                    toggle: function () {
                        var el = scroll.render();
                        Lampa.Controller.collectionSet(el);
                        var first = el.find('.selector').eq(0)[0];
                        Lampa.Controller.collectionFocus(first || false, el);
                    },
                    left: function () { if (window.Navigator && window.Navigator.canmove('left')) window.Navigator.move('left'); else Lampa.Controller.toggle('menu'); },
                    right: function () { if (window.Navigator && window.Navigator.canmove('right')) window.Navigator.move('right'); },
                    up: function () { if (window.Navigator && window.Navigator.canmove('up')) window.Navigator.move('up'); else Lampa.Controller.toggle('head'); },
                    down: function () { if (window.Navigator && window.Navigator.canmove('down')) window.Navigator.move('down'); },
                    back: function () { Lampa.Activity.backward(); }
                });
                Lampa.Controller.toggle('content');
            };
            this.pause = function () {};
            this.stop = function () {};
            this.render = function () { return root; };
            this.destroy = function () { scroll.destroy(); root.remove(); };
        });
    }

    function init() {
        if (window[FLAG]) return;
        if (!window.Lampa || !Lampa.SettingsApi || !Lampa.Component || !Lampa.Scroll) return;
        window[FLAG] = true;
        addCss();
        registerComponent();
        Lampa.SettingsApi.addComponent({
            component: SETTINGS,
            name: 'Cache Inspector · Test 1',
            icon: '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect x="3" y="4" width="18" height="15" rx="2"/><path d="M7 9h10M7 13h7M9 21h6"/></svg>'
        });
        Lampa.SettingsApi.addParam({
            component: SETTINGS,
            param: { type: 'button' },
            field: { name: '🔎 Аналізувати localStorage', description: 'Тільки перегляд. Нічого не видаляє.' },
            onChange: function () { Lampa.Activity.push({ url: '', title: 'Cache Inspector · Test 1', component: COMPONENT, level: 'overview' }); }
        });
    }

    var tries = 0;
    var timer = setInterval(function () {
        tries++;
        if (window.Lampa && Lampa.SettingsApi && Lampa.Component && Lampa.Platform) {
            clearInterval(timer);
            init();
        } else if (tries >= 120) {
            clearInterval(timer);
        }
    }, 500);
})();
