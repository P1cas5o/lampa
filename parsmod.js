(function () {
    'use strict';

// https://ko31k.github.io/LMP/plugins/Parsers.js moded 081026 to publ
    var STORAGE_PARSERS = 'ps_list_combo_v0.2';
    var STORAGE_PRI_ACT = 'bat_url_two';
    var STORAGE_SEC_ACT = 'ps_active_sec_v0.2';
    var NO_PARSER       = 'no_parser';
    // V14 Test 4: 15 Jackett parsers; retire both bundled Prowlarr entries.
    var INDEXER_META_KEY = 'ps_indexer_meta_v13';
    var CATALOG_MIGRATION_KEY = 'ps_catalog_curated_17_v14';
    var PROWLARR_FIX_KEY = 'ps_prowlarr_https_type_v14_test2';
    var PROWLARR_KEYS_FIX_KEY = 'ps_prowlarr_keys_v14_test3';
    var REMOVE_PROWLARR_KEY = 'ps_remove_prowlarr_v14_test4';
    var PROXY_PREFIX    = 'https://parserbridge.lampame.v6.rocks/';

    var DEFAULT_PARSERS = [
        { base: 'lampa_uaj', shortName: 'LampaUAj', name: 'LampaUA jackett', url: 'jackettua.mooo.com', displayUrl: 'http://jackettua.mooo.com', settings: { key: 'ua', parser_torrent_type: 'jackett' } },
        { base: 'lampa_ua', shortName: 'LampaUA', name: 'LampaUA (Toloka, Mazepa)', url: 'lampaua.mooo.com', displayUrl: 'http://lampaua.mooo.com', settings: { key: '1', parser_torrent_type: 'jackett' } },
        { base: 'spawnum_duckdns_org_49117', shortName: 'Spawn UA', name: 'SpawnUA (UA only)', url: 'http://jackukr.spawn.pp.ua', settings: { key: '2', parser_torrent_type: 'jackett' } },
        { base: 'spawnum_duckdns_org_59117', shortName: 'Spawn +', name: 'SpawnUA (розширений)', url: 'http://jack.spawn.pp.ua', settings: { key: '2', parser_torrent_type: 'jackett' } },
        { base: 'otlampa', shortName: 'Всяке', name: 'Всяке різне', url: 'http://87.120.84.218:9117', settings: { key: '333', parser_torrent_type: 'jackett' } },
        { base: 'jac_red', shortName: 'Jac.red', name: 'Jac.red', url: 'jac.red', settings: { key: '', parser_torrent_type: 'jackett' } },
        { base: 'alco2', shortName: 'alco v2', name: 'alco v2', url: 'https://tv.alcopa.cc/api/v2.0/indexers/all/results?title=', settings: { key: '', parser_torrent_type: 'jackett' } },
        { base: 'alco1', shortName: 'alco v1', name: 'alco v1', url: 'https://alpacv1filt.pubgpityx.workers.dev/', settings: { key: '', parser_torrent_type: 'jackett' } },
        { base: 'jacred_stream', shortName: 'Jacred', name: 'Jacred stream', url: 'jacred.stream', settings: { key: 'pp', parser_torrent_type: 'jackett' } },
        { base: 'nmjc', shortName: 'nmjc', name: 'nmjc', url: 'nmjc.duckdns.org', settings: { key: '', parser_torrent_type: 'jackett' } },
        { base: 'jac_red_ru', shortName: 'Jac-red.ru', name: 'Jac-red.ru', url: 'jac-red.ru', settings: { key: '', parser_torrent_type: 'jackett' } },
        { base: 'lampaapp', shortName: 'lampaapp', name: 'lampaapp', url: 'lampa.app', settings: { key: '1', parser_torrent_type: 'jackett' } },
        { base: '12407_xyz', shortName: '12407', name: '12407_xyz ⚠ Toloka.to', url: '12.307407.xyz', settings: { key: '12307407', parser_torrent_type: 'jackett' } },
        { base: 'maxvol_pro', shortName: 'Jac.Maxvol', name: 'Jac.Maxvol.pro ⚠ Toloka.to', url: 'jac.maxvol.pro', settings: { key: '1', parser_torrent_type: 'jackett' } },
        { base: 'crab', shortName: 'Crab', name: 'Crab', url: 'https://8dppbb.bot-keep.xyz', settings: { key: '', parser_torrent_type: 'jackett' } }
    ];

    function getProto() {
        return window.location.protocol === 'https:' ? 'https://' : 'http://';
    }

    function stripProxy(url) {
        if (!url) return '';
        return url.replace(PROXY_PREFIX, '');
    }

    function withProto(url) {
        if (!url) return '';
        var clean = stripProxy(url).replace(/^https?:\/\//i, '');
        if (/^https?:\/\//i.test(stripProxy(url))) return stripProxy(url);
        return getProto() + clean;
    }

    function applyProxy(url, targetType) {
        if (!url) return '';
        var cleanUrl = stripProxy(url);
        var finalUrl = withProto(cleanUrl); 


        var proxyVal = Lampa.Storage.get('parser_use_proxy', false);
        var useProxy = (proxyVal === true || proxyVal === 'true');
        
        var currentTarget = Lampa.Storage.get('parser_proxy_target', 'both');
        var shouldHaveProxy = useProxy && (currentTarget === 'both' || currentTarget === targetType);
        
        if (shouldHaveProxy) {
            return PROXY_PREFIX + finalUrl;
        }
        return finalUrl;
    }

    function normalizeUrl(url) {
        return (url || '').replace(/^https?:\/\//i, '').replace(/\/$/, '').trim().toLowerCase();
    }

    // Оновлюємо лише старі адреси Spawn, не торкаючись API-ключів і ручних URL.
    function updatedSpawnUrl(url) {
        var clean = normalizeUrl(stripProxy(url));
        if (clean === 'spawnum.duckdns.org:49117') return 'http://jackukr.spawn.pp.ua';
        if (clean === 'spawnum.duckdns.org:59117' || clean === 'spawn.pp.ua:59117') return 'http://jack.spawn.pp.ua';
        return null;
    }

    // Одноразова міграція V14: оновлюємо штатні записи, зберігаємо власні парсери.
    // Не скидаємо ручні URL/ключі та не перемикаємо обрані сервери автоматично.
    var RETIRED_BASES = ['spawpp_ua_59117', 'jac_black', 'jac_stull', 'crab_alt', 'jr_maxvol'];
    var PREVIOUS_BUILTIN_BASES = [
        'lampa_uaj', 'lampa_ua', 'spawnum_duckdns_org_49117',
        'spawnum_duckdns_org_59117', 'spawpp_ua_59117', 'otlampa',
        'jac_red', 'jac_black', 'alco2', 'alco1', 'jac_stull',
        'jacred_stream', '12407_xyz', 'crab', 'crab_alt', 'nmjc',
        'jac_red_ru', 'lampaapp', 'jr_maxvol', 'maxvol_pro',
        'prowl_dshs', 'prowl_ashpan'
    ];

    function migrateCuratedCatalog(oldList) {
        var result = [];
        var byBase = {};
        oldList.forEach(function (p) { if (p && p.base && !byBase[p.base]) byBase[p.base] = p; });
        DEFAULT_PARSERS.forEach(function (def) {
            var old = byBase[def.base];
            if (!old) { result.push(JSON.parse(JSON.stringify(def))); return; }
            var merged = JSON.parse(JSON.stringify(old));
            // Міняємо тільки каталогові підписи. Користувацькі URL і ключі зберігаємо.
            merged.name = def.name;
            merged.shortName = def.shortName;
            result.push(merged);
        });
        oldList.forEach(function (p) {
            if (!p || !p.base || PREVIOUS_BUILTIN_BASES.indexOf(p.base) !== -1 ||
                DEFAULT_PARSERS.some(function (d) { return d.base === p.base; })) return;
            result.push(p); // Користувацькі записи не видаляємо.
        });
        // Після зміни порядку індекс додаткового парсера перераховується за URL.
        var selectedSecondary = Lampa.Storage.get('jackett_url_two', '');
        if (selectedSecondary) {
            var selectedNorm = normalizeUrl(stripProxy(selectedSecondary));
            var nextIdx = result.findIndex(function (p) {
                return normalizeUrl(stripProxy(p.url)) === selectedNorm ||
                    (p.displayUrl && normalizeUrl(stripProxy(p.displayUrl)) === selectedNorm);
            });
            if (nextIdx >= 0) Lampa.Storage.set(STORAGE_SEC_ACT, nextIdx);
        }
        if (Lampa.Storage.get(STORAGE_PRI_ACT, '') === 'spawpp_ua_59117') {
            Lampa.Storage.set(STORAGE_PRI_ACT, 'spawnum_duckdns_org_59117');
        }
        return result;
    }

    // One-time targeted correction for users who already installed V14 Test 1.
    // Update only the two bundled Prowlarr entries; preserve custom parsers and keys.
    function migrateProwlarrFix(list) {
        if (Lampa.Storage.get(PROWLARR_FIX_KEY, false)) return false;
        var changed = false;
        var hosts = { 'prowl_dshs': 'https://prwl.dshs.uk',
                      'prowl_ashpan': 'https://prowlarr.ashpanraskar.com' };
        list.forEach(function (p) {
            if (!p || !Object.prototype.hasOwnProperty.call(hosts, p.base)) return;
            var target = hosts[p.base];
            // Do not overwrite an intentionally customized server address.
            if (normalizeUrl(stripProxy(p.url)) !== normalizeUrl(target)) return;
            if (p.url !== target) { p.url = target; changed = true; }
            if (!p.settings) { p.settings = {}; changed = true; }
            if (p.settings.parser_torrent_type !== 'prowlarr') {
                p.settings.parser_torrent_type = 'prowlarr'; changed = true;
            }
            if (p.displayUrl && normalizeUrl(stripProxy(p.displayUrl)) === normalizeUrl(target) && p.displayUrl !== target) {
                p.displayUrl = target; changed = true;
            }
        });
        // Fix stored active URLs only when they match the two built-in hosts.
        ['prowlarr_url', 'jackett_url', 'jackett_url_two'].forEach(function (key) {
            var old = Lampa.Storage.get(key, '');
            if (!old) return;
            Object.keys(hosts).forEach(function (base) {
                if (normalizeUrl(stripProxy(old)) !== normalizeUrl(hosts[base])) return;
                var fixed = (old.indexOf(PROXY_PREFIX) === 0 ? PROXY_PREFIX : '') + hosts[base];
                if (old !== fixed) Lampa.Storage.set(key, fixed);
            });
        });
        Lampa.Storage.set(PROWLARR_FIX_KEY, true);
        return changed;
    }

    // V14 Test 3: fill missing API keys only for the two bundled Prowlarr hosts.
    // Preserve user-supplied nonempty keys and customized server addresses.
    function migrateProwlarrKeys(list) {
        if (Lampa.Storage.get(PROWLARR_KEYS_FIX_KEY, false)) return false;
        var changed = false;
        var hosts = {
            prowl_dshs: 'https://prwl.dshs.uk',
            prowl_ashpan: 'https://prowlarr.ashpanraskar.com'
        };
        var keys = {
            prowl_dshs: '027ebc50daf34338a9b80b553ee2fe20',
            prowl_ashpan: '2bab8542870f47c383e41c993f315f41'
        };
        list.forEach(function (p) {
            if (!p || !Object.prototype.hasOwnProperty.call(hosts, p.base)) return;
            if (normalizeUrl(stripProxy(p.url)) !== normalizeUrl(hosts[p.base])) return;
            if (!p.settings) { p.settings = {}; changed = true; }
            if (!p.settings.key) { p.settings.key = keys[p.base]; changed = true; }
        });
        Lampa.Storage.set(PROWLARR_KEYS_FIX_KEY, true);
        return changed;
    }

    // V14 Test 4: remove only the two bundled Prowlarr records from existing storage.
    // Do not touch user-created parsers, active Jackett URLs, keys, or selections.
    function migrateRemoveProwlarr(list) {
        if (Lampa.Storage.get(REMOVE_PROWLARR_KEY, false)) return false;
        var removed = false;
        for (var i = list.length - 1; i >= 0; i--) {
            if (list[i] && (list[i].base === 'prowl_dshs' || list[i].base === 'prowl_ashpan')) {
                list.splice(i, 1);
                removed = true;
            }
        }
        // The secondary index is positional; resolve it from the current URL if possible.
        var secondaryUrl = Lampa.Storage.get('jackett_url_two', '');
        if (secondaryUrl) {
            var norm = normalizeUrl(stripProxy(secondaryUrl));
            var idx = list.findIndex(function (p) {
                return normalizeUrl(stripProxy(p.url)) === norm ||
                    (p.displayUrl && normalizeUrl(stripProxy(p.displayUrl)) === norm);
            });
            if (idx >= 0) Lampa.Storage.set(STORAGE_SEC_ACT, idx);
        }
        Lampa.Storage.set(REMOVE_PROWLARR_KEY, true);
        return removed;
    }

    function getParsers() {
        var s = Lampa.Storage.get(STORAGE_PARSERS, false);
        if (typeof s === 'string') {
            try { s = JSON.parse(s); } catch (e) { s = false; }
        }
        if (s && Array.isArray(s) && s.length > 0) {
            var changed = false;
            s.forEach(function (p) {
                if (!p || !p.url) return;
                var updated = updatedSpawnUrl(p.url);
                if (updated) {
                    p.url = updated;
                    if (p.displayUrl) p.displayUrl = updated;
                    changed = true;
                }
            });
            if (!Lampa.Storage.get(CATALOG_MIGRATION_KEY, false)) {
                s = migrateCuratedCatalog(s);
                Lampa.Storage.set(CATALOG_MIGRATION_KEY, true);
                changed = true;
            }
            if (migrateProwlarrFix(s)) changed = true;
            if (migrateProwlarrKeys(s)) changed = true;
            if (migrateRemoveProwlarr(s)) changed = true;
            if (changed) saveParsers(s);
            return s;
        }
        Lampa.Storage.set(CATALOG_MIGRATION_KEY, true);
        Lampa.Storage.set(PROWLARR_FIX_KEY, true);
        Lampa.Storage.set(PROWLARR_KEYS_FIX_KEY, true);
        Lampa.Storage.set(REMOVE_PROWLARR_KEY, true);
        return JSON.parse(JSON.stringify(DEFAULT_PARSERS));
    }

    function saveParsers(list) {
        Lampa.Storage.set(STORAGE_PARSERS, list);
    }

    // Оновлюємо вже активні адреси, якщо вони досі посилаються на старий Spawn.
    function migrateActiveSpawnUrls() {
        ['jackett_url', 'jackett_url_two'].forEach(function (key) {
            var original = Lampa.Storage.get(key, '');
            var updated = updatedSpawnUrl(original);
            if (updated) {
                // Зберігаємо вже ввімкнений проксі, не чіпаємо вибір або API-ключ.
                var prefix = original.indexOf(PROXY_PREFIX) === 0 ? PROXY_PREFIX : '';
                Lampa.Storage.set(key, prefix + updated);
            }
        });
    }

    function updateStandardFieldsUI() {
        setTimeout(function() {
            var j1 = Lampa.Storage.get('jackett_url', '');
            var j2 = Lampa.Storage.get('jackett_url_two', '');
            var p1 = Lampa.Storage.get('prowlarr_url', '');
            
            $('div[data-name="jackett_url"] .settings-param__value').text(j1);
            $('div[data-name="jackett_url_two"] .settings-param__value').text(j2);
            $('div[data-name="prowlarr_url"] .settings-param__value').text(p1);
        }, 50);
    }

    function refreshExistingUrls() {
        var j_url1 = Lampa.Storage.get('jackett_url', '');
        var j_url2 = Lampa.Storage.get('jackett_url_two', '');
        var p_url1 = Lampa.Storage.get('prowlarr_url', '');
        
        if (j_url1) Lampa.Storage.set('jackett_url', applyProxy(j_url1, 'primary'));
        if (p_url1) Lampa.Storage.set('prowlarr_url', applyProxy(p_url1, 'primary'));
        if (j_url2) Lampa.Storage.set('jackett_url_two', applyProxy(j_url2, 'secondary'));
    }

    function translate() {
        Lampa.Lang.add({
            bat_parser: { en: 'Parsers catalog', uk: 'Каталог парсерів', zh: '解析器目录' },
            bat_parser_description: { en: 'Click to select a parser from', uk: 'Натисніть для вибору парсера з', zh: '点击从目录中选择解析器' },
            bat_parser_current: { en: 'Current selection:', uk: 'Поточний вибір:', zh: '当前选择：' },
            bat_parser_none: { en: 'Not selected', uk: 'Не вибрано', zh: '未选择' },
            bat_parser_selected_label: { en: 'Selected:', uk: 'Обрано:', zh: '已选择：' },
            bat_check_parsers: { en: 'Check parsers availability', uk: 'Перевірити доступність парсерів', zh: '检查解析器可用性' },
            bat_check_parsers_desc: { en: 'Checks parsers availability', uk: 'Виконує перевірку доступності парсерів', zh: '执行解析器可用性检查' },
            bat_check_search: { en: 'Check search availability', uk: 'Перевірити доступність пошуку', zh: '检查搜索可用性' },
            bat_check_search_desc: { en: 'Checks torrent search availability', uk: 'Виконує перевірку доступності пошуку торентів', zh: '执行种子搜索可用性检查' },
            bat_check_done: { en: 'Check completed', uk: 'Перевірку завершено', zh: '检查完成' },
            bat_status_checking_server: { en: 'Checking server…', uk: 'Перевірка сервера…', zh: '检查服务器…' },
            bat_status_server_ok: { en: 'Server available', uk: 'Сервер доступний', zh: '服务器可用' },
            bat_status_auth_error: { en: 'Auth error', uk: 'Помилка ключа', zh: '密钥错误' },
            bat_status_server_warn: { en: 'Server responds (restrictions)', uk: 'Сервер відповідає (обмеження)', zh: '服务器有响应（受限）' },
            bat_status_server_bad: { en: 'Server unavailable', uk: 'Сервер недоступний', zh: '服务器不可用' },
            bat_status_unknown: { en: 'Unchecked', uk: 'Не перевірено', zh: '未检查' },
            bat_status_checking_search: { en: 'Checking search…', uk: 'Перевірка пошуку…', zh: '检查搜索…' },
            bat_status_search_ok: { en: 'Search works', uk: 'Пошук працює', zh: '搜索可用' },
            bat_status_search_empty: { en: 'No results', uk: 'Немає результатів', zh: '无结果' },
            bat_status_search_limited: { en: 'Search restricted', uk: 'Пошук обмежено', zh: '搜索受限' },
            bat_status_search_unknown: { en: 'Response not recognized', uk: 'Невідомий формат відповіді', zh: '响应格式未知' },
            bat_status_search_bad: { en: 'Search does not work', uk: 'Пошук не працює', zh: '搜索不可用' },
            
            bat_parser_proxy: { en: 'Enable proxy', uk: 'Включити проксі', zh: '启用代理' },
            bat_parser_proxy_desc: { en: 'Adds a proxy before the parser URL', uk: 'Додає проксі перед адресою парсера', zh: '在解析器URL前添加代理' },
            
            bat_parser_proxy_target: { en: 'Proxy target', uk: 'Для якого парсера (проксі)', zh: '代理目标' },
            bat_parser_proxy_target_desc: { en: 'Select which parser will use the proxy', uk: 'Оберіть, до якої адреси додавати проксі', zh: '选择使用代理的解析器' }
        });
    }

    var COLOR_OK = '#1aff00';
    var COLOR_BAD = '#ff2e36';
    var COLOR_WARN = '#f3d900';
    var COLOR_AUTH = '#ff9900';
    var COLOR_UNKNOWN = '#8c8c8c';

    function readIndexerMeta() {
        var data = Lampa.Storage.get(INDEXER_META_KEY, {});
        if (typeof data === 'string') { try { data = JSON.parse(data); } catch (e) { data = {}; } }
        return data && typeof data === 'object' && !Array.isArray(data) ? data : {};
    }

    function parserName(p) {
        return p.name; // Назви без мінливих лічильників індексаторів.
    }

    function indexerNamesFromResponse(data) {
        var nodes = [];
        try {
            var doc = null;
            if (data && data.documentElement) doc = data;
            else if (typeof data === 'string' && typeof DOMParser !== 'undefined') {
                doc = new DOMParser().parseFromString(data, 'application/xml');
            }
            if (doc && !doc.getElementsByTagName('parsererror').length) {
                var items = doc.getElementsByTagName('indexer');
                if (!items.length) items = doc.getElementsByTagName('item');
                for (var i = 0; i < items.length; i++) {
                    var title = items[i].getAttribute('title') || items[i].getAttribute('name');
                    var t = items[i].getElementsByTagName('title');
                    if (!title && t.length) title = t[0].textContent;
                    if (title) nodes.push(title.trim());
                }
            } else {
                if (typeof data === 'string') { try { data = JSON.parse(data); } catch (e) {} }
                var arr = Array.isArray(data) ? data : (data && Array.isArray(data.indexers) ? data.indexers : null);
                if (arr) arr.forEach(function (x) { if (x && x.configured !== false && (x.name || x.title)) nodes.push(String(x.name || x.title)); });
            }
        } catch (e) {}
        return nodes.filter(function (x) { return !!x; });
    }

    function indexerUrlCandidates(parser) {
        var base = stripProxy(parser.url);
        // Спеціальні URL пошуку (Alco тощо) не є коренем Jackett API.
        if (/\/api\/|\?|workers\.dev/i.test(base)) return [];
        var key = encodeURIComponent((parser.settings && parser.settings.key) || '');
        return protocolCandidatesFor(base).map(function (proto) {
            return proto + base.replace(/\/$/, '') + '/api/v2.0/indexers?apikey=' + key + '&configured=true';
        });
    }

    function checkIndexerMetadata(parser) {
        var urls = indexerUrlCandidates(parser);
        if (!urls.length || (parser.settings && parser.settings.parser_torrent_type === 'prowlarr')) return Promise.resolve(null);
        return new Promise(function (resolve) {
            var i = 0;
            function next() {
                if (i >= urls.length) { resolve(null); return; }
                $.ajax({
                    url: urls[i++], method: 'GET', timeout: 5000,
                    success: function (data) {
                        var names = indexerNamesFromResponse(data);
                        if (!names.length) { next(); return; }
                        var all = readIndexerMeta();
                        all[parser.base] = {
                            url: normalizeUrl(stripProxy(parser.url)),
                            key: (parser.settings && parser.settings.key) || '',
                            count: names.length,
                            names: names,
                            checkedAt: Date.now()
                        };
                        Lampa.Storage.set(INDEXER_META_KEY, all);
                        resolve(all[parser.base]);
                    },
                    error: next
                });
            }
            next();
        });
    }

    var cache = {
        data: {}, 
        ttlHealth: 30 * 1000, 
        ttlSearch: 15 * 60 * 1000,
        get: function (key) { 
            var v = this.data[key]; 
            if (v && Date.now() < v.expiresAt) return v; 
            return null; 
        },
        set: function (key, value, ttl) { 
            this.data[key] = { value: value, expiresAt: Date.now() + ttl }; 
        }
    };

    function notifyDone() {
        var text = Lampa.Lang.translate('bat_check_done');
        try { 
            if (Lampa.Noty && typeof Lampa.Noty.show === 'function') { Lampa.Noty.show(text); return; }
            if (Lampa.Toast && typeof Lampa.Toast.show === 'function') { Lampa.Toast.show(text); return; } 
        } catch (e) {}
        alert(text);
    }

    function getSelectedBase() { 
        return Lampa.Storage.get(STORAGE_PRI_ACT, NO_PARSER); 
    }

    function getParserByBase(base) {
        var list = getParsers();
        return list.find(function (p) { return p.base === base; });
    }

    function applySelectedParser(base) {
        if (!base || base === NO_PARSER) return false;
        var p = getParserByBase(base);
        if (!p || !p.settings) return false;

        var type = p.settings.parser_torrent_type || 'jackett';
        var finalUrl = applyProxy(p.url, 'primary'); 

        Lampa.Storage.set(type === 'prowlarr' ? 'prowlarr_url' : 'jackett_url', finalUrl);
        Lampa.Storage.set(type === 'prowlarr' ? 'prowlarr_key' : 'jackett_key', p.settings.key || '');
        Lampa.Storage.set('parser_torrent_type', type);
        return true;
    }

    function updateSelectedLabelInSettings() {
        var base = getSelectedBase();
        var parser = getParserByBase(base);
        var name = parser ? parserName(parser) : Lampa.Lang.translate('bat_parser_none');
        $('.bat-parser-selected').text(Lampa.Lang.translate('bat_parser_selected_label') + " " + name);
    }

    function protocolCandidatesFor(url) {
        if (/^https?:\/\//i.test(url)) return [''];
        return ['https://', 'http://'];
    }

    function ajaxTryUrls(urls, timeout) {
        return new Promise(function (resolve) {
            var idx = 0;
            function attempt() {
                if (idx >= urls.length) { resolve({ ok: false, xhr: null, url: null, networkError: true }); return; }
                var url = urls[idx++];
                $.ajax({
                    url: url, method: 'GET', timeout: timeout,
                    success: function (data, textStatus, xhr) { 
                        if (xhr && xhr.status === 401) {
                            resolve({ ok: false, xhr: xhr, url: url, authError: true });
                        } else {
                            resolve({ ok: true, xhr: xhr, url: url, data: data }); 
                        }
                    },
                    error: function (xhr) {
                        var status = xhr && typeof xhr.status === 'number' ? xhr.status : 0;
                        if (status === 200) {
                            resolve({ ok: true, xhr: xhr, url: url });
                        } else if (status === 401) {
                            resolve({ ok: false, xhr: xhr, url: url, authError: true });
                        } else if (status === 0) {
                            attempt();
                        } else {
                            resolve({ ok: false, xhr: xhr, url: url, networkError: true });
                        }
                    }
                });
            }
            attempt();
        });
    }

    function healthUrlCandidates(parser) {
        var key = encodeURIComponent((parser.settings && parser.settings.key) || '');
        var type = (parser.settings && parser.settings.parser_torrent_type) || 'jackett';
        var path = (type === 'prowlarr') ? '/api/v1/health?apikey=' + key : '/api/v2.0/indexers/status:healthy/results?apikey=' + key;
        
        var cleanUrl = stripProxy(parser.url); 
        var protos = protocolCandidatesFor(cleanUrl);
        
        return protos.map(function (p) { 
            return p + cleanUrl + path; 
        });
    }

    function runHealthChecks(parsers) {
        var map = {};
        var requests = parsers.map(function (parser) {
            return new Promise(function (resolve) {
                var urls = healthUrlCandidates(parser);
                var cacheKey = 'health::' + parser.base + '::direct::' + urls.join('|');
                var cached = cache.get(cacheKey);
                if (cached) {
                    map[parser.base] = cached.value;
                    var meta = readIndexerMeta()[parser.base];
                    if (cached.value.color === COLOR_OK &&
                        (!meta || meta.url !== normalizeUrl(stripProxy(parser.url)) ||
                         Date.now() - meta.checkedAt > 24 * 60 * 60 * 1000)) {
                        checkIndexerMetadata(parser).then(function () { resolve(); }, function () { resolve(); });
                    } else resolve();
                    return;
                }

                ajaxTryUrls(urls, 5000).then(function (res) {
                    var val;
                    if (res.ok || (res.xhr && res.xhr.status === 200)) {
                        val = { color: COLOR_OK, labelKey: 'bat_status_server_ok' };
                    } else if (res.authError || (res.xhr && res.xhr.status === 401)) {
                        val = { color: COLOR_AUTH, labelKey: 'bat_status_auth_error' };
                    } else if (res.networkError === false) {
                        val = { color: COLOR_WARN, labelKey: 'bat_status_server_warn' };
                    } else {
                        val = { color: COLOR_BAD, labelKey: 'bat_status_server_bad' };
                    }
                    map[parser.base] = val;
                    cache.set(cacheKey, val, cache.ttlHealth);
                    if (val.color === COLOR_OK) {
                        checkIndexerMetadata(parser).then(function () { resolve(); }, function () { resolve(); });
                    } else resolve();
                });
            });
        });
        return Promise.all(requests).then(function () { return map; });
    }

    function deepSearchUrlCandidates(parser, query) {
        var raw = stripProxy(parser.url || '').trim();
        var key = encodeURIComponent((parser.settings && parser.settings.key) || '');
        var type = (parser.settings && parser.settings.parser_torrent_type) || 'jackett';
        var urls = protocolCandidatesFor(raw).map(function (prefix) {
            var root = prefix + raw;
            // Повні пошукові endpoint-и не можна доповнювати Jackett-шляхом.
            if (/\/api\/v2\.0\/indexers\/all\/results\?title=$/i.test(root)) return root + encodeURIComponent(query);
            if (/[?&](?:title|query|q)=$/i.test(root)) return root + encodeURIComponent(query);
            if (/\?/i.test(root)) return null; // Невідомий формат URL: не вгадуємо параметри.
            if (/\/api\//i.test(root)) return null;
            if (type === 'prowlarr') return root.replace(/\/$/, '') + '/api/v1/search?query=' + encodeURIComponent(query) + '&apikey=' + key;
            return root.replace(/\/$/, '') + '/api/v2.0/indexers/all/results?apikey=' + key + '&Query=' + encodeURIComponent(query) + '&Category=2000';
        });
        return urls.filter(function (url) { return !!url; });
    }

    function parseSearchResponse(data) {
        try {
            if (typeof data === 'string') {
                var t = data.trim();
                if (!t) return 'unknown';
                if (t.charAt(0) === '{' || t.charAt(0) === '[') data = JSON.parse(t);
                else if (t.charAt(0) === '<' && typeof DOMParser !== 'undefined') data = new DOMParser().parseFromString(t, 'text/xml');
                else return 'unknown';
            }
            if (data && data.documentElement) {
                if (data.getElementsByTagName('parsererror').length || data.getElementsByTagName('error').length) return 'unknown';
                var channel = data.getElementsByTagName('channel');
                if (!channel.length) return 'unknown';
                return data.getElementsByTagName('item').length ? 'found' : 'empty';
            }
            if (Array.isArray(data)) return data.length ? 'found' : 'empty';
            if (data && typeof data === 'object') {
                if (data.error || data.errors) return 'unknown';
                var keys = ['results', 'Results', 'items', 'Items', 'releases', 'Releases', 'data'];
                for (var i = 0; i < keys.length; i++) {
                    if (Array.isArray(data[keys[i]])) return data[keys[i]].length ? 'found' : 'empty';
                }
            }
        } catch (e) {}
        return 'unknown';
    }

    function runDeepSearchChecks(parsers) {
        var map = {};
        // Стабільний запит: результати різних перевірок можна порівнювати.
        var query = '2022';
        var requests = parsers.map(function (parser) {
            return new Promise(function (resolve) {
                var urls = deepSearchUrlCandidates(parser, query);
                var cacheKey = 'search-v13::' + parser.base + '::' + urls.join('|');
                var cached = cache.get(cacheKey);
                if (cached) { map[parser.base] = cached.value; resolve(); return; }
                if (!urls.length) {
                    map[parser.base] = { color: COLOR_UNKNOWN, labelKey: 'bat_status_search_unknown' };
                    resolve(); return;
                }
                ajaxTryUrls(urls, 6000).then(function (res) {
                    var val;
                    if (res.ok) {
                        var parsed = parseSearchResponse(res.data);
                        if (parsed === 'found') val = { color: COLOR_OK, labelKey: 'bat_status_search_ok' };
                        else if (parsed === 'empty') val = { color: COLOR_WARN, labelKey: 'bat_status_search_empty' };
                        else val = { color: COLOR_UNKNOWN, labelKey: 'bat_status_search_unknown' };
                    } else if (res.authError || (res.xhr && [401, 403, 429].indexOf(res.xhr.status) >= 0)) {
                        val = { color: COLOR_WARN, labelKey: 'bat_status_search_limited' };
                    } else {
                        val = { color: COLOR_BAD, labelKey: 'bat_status_search_bad' };
                    }
                    map[parser.base] = val;
                    cache.set(cacheKey, val, cache.ttlSearch);
                    resolve();
                });
            });
        });
        return Promise.all(requests).then(function () { return map; });
    }

    function injectStyleOnce() {
        if (window.__bat_parser_modal_style__) return;
        window.__bat_parser_modal_style__ = true;
        
        var css = 
            ".bat-parser-modal{display:flex;flex-direction:column;gap:1em}\n" +
            ".bat-parser-modal__head{display:flex;align-items:center;justify-content:space-between;gap:1em}\n" +
            ".bat-parser-modal__current-label{font-size:.9em;opacity:.7}\n" +
            ".bat-parser-modal__current-value{font-size:1.1em}\n" +
            ".bat-parser-modal__list{display:flex;flex-direction:column;gap:.6em}\n" +
            ".bat-parser-modal__item{display:flex;align-items:center;justify-content:space-between;gap:1em;padding:.8em 1em;border-radius:.7em;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08)}\n" +
            ".bat-parser-modal__item.is-selected,.bat-parser-modal__item.focus{border-color:#fff}\n" +
            ".bat-parser-modal__left{display:flex;align-items:center;gap:.65em;min-width:0}\n" +
            ".bat-parser-modal__dot{width:.55em;height:.55em;border-radius:50%;background:" + COLOR_UNKNOWN + ";box-shadow:0 0 .6em rgba(0,0,0,.35);flex:0 0 auto}\n" +
            ".bat-parser-modal__name{font-size:1em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n" +
            ".bat-parser-modal__status{font-size:.85em;opacity:.75;text-align:right;flex:0 0 auto}\n" +
            ".bat-parser-modal__actions{display:flex;gap:.6em;flex-wrap:wrap}\n" +
            ".bat-parser-modal__action{padding:.55em .9em;border-radius:.6em;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2)}\n" +
            ".bat-parser-modal__action.focus{border-color:#fff}";
            
        var style = document.createElement('style'); 
        style.type = 'text/css'; 
        style.appendChild(document.createTextNode(css)); 
        document.head.appendChild(style);
    }

    function buildParserItem(base, name) {
        var item = $("<div class='bat-parser-modal__item selector' data-base='" + base + "'><div class='bat-parser-modal__left'><span class='bat-parser-modal__dot'></span><div class='bat-parser-modal__name'></div></div><div class='bat-parser-modal__status'></div></div>");
        item.find('.bat-parser-modal__name').text(name);
        item.find('.bat-parser-modal__status').text(Lampa.Lang.translate('bat_status_unknown'));
        return item;
    }

    function setItemStatus(item, color, labelKey) {
        item.find('.bat-parser-modal__dot').css('background-color', color);
        item.find('.bat-parser-modal__status').text(Lampa.Lang.translate(labelKey));
    }

    function applySelection(list, base) {
        list.find('.bat-parser-modal__item').removeClass('is-selected');
        list.find("[data-base='" + base + "']").addClass('is-selected');
    }

    function updateCurrentLabel(wrapper, base) {
        var parser = getParserByBase(base);
        wrapper.find('.bat-parser-modal__current-value').text(parser ? parserName(parser) : Lampa.Lang.translate('bat_parser_none'));
    }

    function openParserModal() {
        injectStyleOnce();
        var selected = getSelectedBase();
        var listData = getParsers();

        var modal = $("<div class='bat-parser-modal'><div class='bat-parser-modal__head'><div class='bat-parser-modal__current'><div class='bat-parser-modal__current-label'></div><div class='bat-parser-modal__current-value'></div></div></div><div class='bat-parser-modal__list'></div><div class='bat-parser-modal__actions'></div></div>");
        modal.find('.bat-parser-modal__current-label').text(Lampa.Lang.translate('bat_parser_current'));
        updateCurrentLabel(modal, selected);

        var list = modal.find('.bat-parser-modal__list');
        var noneItem = buildParserItem(NO_PARSER, Lampa.Lang.translate('bat_parser_none'));
        
        noneItem.on('hover:enter', function () {
            Lampa.Storage.set(STORAGE_PRI_ACT, NO_PARSER); 
            applySelection(list, NO_PARSER); 
            updateCurrentLabel(modal, NO_PARSER); 
            updateSelectedLabelInSettings();
        });
        list.append(noneItem);

        listData.forEach(function (p) {
            var item = buildParserItem(p.base, parserName(p));
            item.on('hover:enter', function () {
                Lampa.Storage.set(STORAGE_PRI_ACT, p.base); 
                applySelectedParser(p.base); 
                applySelection(list, p.base); 
                updateCurrentLabel(modal, p.base); 
                updateSelectedLabelInSettings();
                updateStandardFieldsUI();
            });
            list.append(item);
        });

        applySelection(list, selected);

        var actions = modal.find('.bat-parser-modal__actions');
        var btnHealth = $("<div class='bat-parser-modal__action selector'></div>").text(Lampa.Lang.translate('bat_check_parsers'));
        var btnSearch = $("<div class='bat-parser-modal__action selector'></div>").text(Lampa.Lang.translate('bat_check_search'));
        actions.append(btnHealth).append(btnSearch);

        function applyMapToList(statusMap) {
            list.find('.bat-parser-modal__item').each(function () {
                var it = $(this); var base = it.data('base');
                if (base === NO_PARSER) { setItemStatus(it, COLOR_UNKNOWN, 'bat_status_unknown'); return; }
                var st = statusMap[base];
                if (!st) setItemStatus(it, COLOR_UNKNOWN, 'bat_status_unknown'); else setItemStatus(it, st.color, st.labelKey);
                var p = listData.filter(function (x) { return x.base === base; })[0];
                if (p) it.find('.bat-parser-modal__name').text(parserName(p));
            });
        }

        function runHealthUI() {
            list.find('.bat-parser-modal__item').each(function () {
                var it = $(this); if (it.data('base') === NO_PARSER) setItemStatus(it, COLOR_UNKNOWN, 'bat_status_unknown'); else setItemStatus(it, COLOR_WARN, 'bat_status_checking_server');
            });
            return runHealthChecks(listData).then(function (map) { applyMapToList(map); notifyDone(); });
        }

        function runSearchUI() {
            list.find('.bat-parser-modal__item').each(function () {
                var it = $(this); if (it.data('base') === NO_PARSER) return; setItemStatus(it, COLOR_WARN, 'bat_status_checking_search');
            });
            return runDeepSearchChecks(listData).then(function (map) { applyMapToList(map); notifyDone(); });
        }

        btnHealth.on('hover:enter', runHealthUI);
        btnSearch.on('hover:enter', runSearchUI);

        var firstSelectable = list.find('.bat-parser-modal__item').first();
        Lampa.Modal.open({
            title: Lampa.Lang.translate('bat_parser'), html: modal, size: 'medium', scroll_to_center: true, select: firstSelectable,
            onBack: function () { Lampa.Modal.close(); Lampa.Controller.toggle('settings_component'); }
        });

        runHealthUI();
    }

    function initPrimarySettings() {
        applySelectedParser(getSelectedBase());
        
        Lampa.SettingsApi.addParam({
            component: 'parser', param: { name: 'bat_parser_manage', type: 'button' },
            field: {
                name: Lampa.Lang.translate('bat_parser'),
                description: Lampa.Lang.translate('bat_parser_description') + " " + getParsers().length + "<div class='bat-parser-selected' style='margin-top:.35em;opacity:.85'></div>"
            },
            onChange: openParserModal,
            onRender: function (item) {
                setTimeout(function () {
                    if (Lampa.Storage.field('parser_use')) item.show(); else item.hide();
                    $('.settings-param__name', item).css('color', COLOR_WARN);
                    updateSelectedLabelInSettings();
                    var parserUse = $('div[data-name="parser_use"]').first();
                    if (parserUse.length) item.insertAfter(parserUse);
                });
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'parser',
            param: { name: 'parser_use_proxy', type: 'trigger', default: false },
            field: {
                name: Lampa.Lang.translate('bat_parser_proxy'),
                description: Lampa.Lang.translate('bat_parser_proxy_desc')
            },
            onChange: function () {
                refreshExistingUrls();
                Lampa.Settings.update();
            },
            onRender: function (item) {
                setTimeout(function () {
                    if (Lampa.Storage.field('parser_use')) item.show(); else item.hide();
                    var manageBtn = $('div[data-name="bat_parser_manage"]').first();
                    if (manageBtn.length) item.insertAfter(manageBtn);
                }, 10);
            }
        });

        Lampa.SettingsApi.addParam({
            component: 'parser',
            param: {
                name: 'parser_proxy_target',
                type: 'select',
                values: {
                    primary: 'Тільки для основного',
                    secondary: 'Тільки для додаткового',
                    both: 'Для обох (Основний + Додатковий)'
                },
                default: 'both'
            },
            field: {
                name: Lampa.Lang.translate('bat_parser_proxy_target'),
                description: Lampa.Lang.translate('bat_parser_proxy_target_desc')
            },
            onChange: function () {
                refreshExistingUrls();
                Lampa.Settings.update();
            },
            onRender: function (item) {
                setTimeout(function () {
                    var proxyVal = Lampa.Storage.get('parser_use_proxy', false);
                    var isProxyOn = (proxyVal === true || proxyVal === 'true');
                    
                    if (Lampa.Storage.field('parser_use') && isProxyOn) {
                        item.show();
                    } else {
                        item.hide();
                    }
                    var proxyBtn = $('div[data-name="parser_use_proxy"]').first();
                    if (proxyBtn.length) item.insertAfter(proxyBtn);
                }, 10);
            }
        });
    }

    function applySecondaryParser(idx) {
        var list = getParsers();
        var p = list[idx];
        if (!p) return;

        var finalUrl = applyProxy(p.url, 'secondary');

        Lampa.Storage.set('jackett_url_two', finalUrl);
        Lampa.Storage.set('jackett_key_two', (p.settings && p.settings.key) || '');
        Lampa.Storage.set('parser_use_link', 'both');
    }

    function activeShortName() {
        var currentUrl = Lampa.Storage.get('jackett_url_two', '');
        if (!currentUrl) return '—';

        var normCurrent = normalizeUrl(stripProxy(currentUrl));
        var list = getParsers();

        for (var i = 0; i < list.length; i++) {
            var normListUrl = normalizeUrl(stripProxy(list[i].url));
            var normDisplayUrl = normalizeUrl(stripProxy(list[i].displayUrl));
            
            if (normListUrl === normCurrent || (normDisplayUrl && normDisplayUrl === normCurrent)) {
                Lampa.Storage.set(STORAGE_SEC_ACT, i);
                return list[i].shortName || list[i].name;
            }
        }
        
        return 'Ручне нал.'; 
    }

    function reloadTorrents() {
        var a = Lampa.Activity.active();
        if (!a || a.component !== 'torrents') return;
        Lampa.Activity.replace({
            component: 'torrents', url: a.url, title: a.title, search: a.search, search_one: a.search_one, search_two: a.search_two, movie: a.movie, page: 1, params: a.params
        });
    }

    var ICON = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="width:1.4em;height:1.4em;min-width:1.4em;min-height:1.4em;vertical-align:middle;fill:currentColor;flex-shrink:0"><use xlink:href="#sprite-folder"></use></svg>';

    function buildSecondaryButton() {
        var btn = $('<div class="simple-button simple-button--filter selector filter--parser">' + ICON + '<div class="ps-name">' + activeShortName() + '</div></div>');
        btn.on('hover:enter click', function () { openSecondarySelectMenu(btn); });
        return btn;
    }

    function updateBtnName(btn) { 
        btn.find('.ps-name').text(activeShortName()); 
    }

    function tryInjectSecondaryButton(torrentFilter) {
        if (torrentFilter.find('.filter--parser').length) return;
        var btn = buildSecondaryButton();
        var search = torrentFilter.find('.filter--search');
        if (search.length) btn.insertAfter(search);
        else {
            var sort = torrentFilter.find('.filter--sort');
            if (sort.length) btn.insertBefore(sort); else torrentFilter.prepend(btn);
        }
    }

    function openSecondarySelectMenu(btn) {
        var list = getParsers();
        var currentUrl = normalizeUrl(stripProxy(Lampa.Storage.get('jackett_url_two', '')));
        var active = -1;
        
        for (var i = 0; i < list.length; i++) {
            if (normalizeUrl(stripProxy(list[i].url)) === currentUrl || normalizeUrl(stripProxy(list[i].displayUrl)) === currentUrl) {
                active = i; break;
            }
        }

        var enabled = Lampa.Controller.enabled().name;

        var items = list.map(function (p, i) {
            var sub = p.displayUrl ? p.displayUrl : withProto(stripProxy(p.url));
            if (p.settings && p.settings.key) sub += '  |  apikey: ' + p.settings.key;
            
            var dotHtml = '<span class="sec-dot" data-base="' + p.base + '" style="display:inline-block; width:0.55em; height:0.55em; border-radius:50%; background-color:' + COLOR_WARN + '; margin-right:0.6em; box-shadow:0 0 0.6em rgba(0,0,0,0.35); vertical-align:middle;"></span>';
            
            return { 
                title: dotHtml + parserName(p), 
                subtitle: sub, 
                selected: i === active, 
                myIdx: i 
            };
        });
        
        items.push({ title: 'Керування парсерами…', manage: true });

        Lampa.Select.show({
            title: 'Вибір додаткового парсера', items: items,
            onSelect: function (item) {
                if (item.manage) openManageMenu(btn, enabled);
                else {
                    Lampa.Storage.set(STORAGE_SEC_ACT, item.myIdx);
                    applySecondaryParser(item.myIdx); 
                    updateBtnName(btn);
                    Lampa.Noty.show('Парсер: ' + activeShortName());
                    Lampa.Controller.toggle(enabled); 
                    reloadTorrents();
                }
            },
            onBack: function () { Lampa.Controller.toggle(enabled); }
        });

        runHealthChecks(list).then(function (map) {
            list.forEach(function(p) {
                var st = map[p.base];
                var color = st ? st.color : COLOR_UNKNOWN;
                $('.sec-dot[data-base="' + p.base + '"]').css('background-color', color);
            });
        });
    }

    function openManageMenu(btn, enabled) {
        var list = getParsers();
        var items = list.map(function (p, i) {
            var sub = p.displayUrl ? p.displayUrl : withProto(stripProxy(p.url));
            if (p.settings && p.settings.key) sub += '  |  apikey: ' + p.settings.key;
            return { title: parserName(p), subtitle: sub, myIdx: i };
        });
        
        items.push({ title: '+ Додати парсер', add: true });
        items.push({ title: 'Скинути за замовчуванням', reset: true });

        Lampa.Select.show({
            title: 'Керування парсерами', items: items,
            onSelect: function (item) {
                if (item.add) {
                    inputDialog('Повна назва', '', function (name) {
                        if (!name) return;
                        setTimeout(function() { 
                            inputDialog('Коротка назва (для кнопки)', name, function (shortName) {
                                setTimeout(function() {
                                    inputDialog('URL (без протоколу, наприклад: jac.red)', '', function (url) {
                                        setTimeout(function() {
                                            inputDialog('API-ключ (або залиште порожнім)', '', function (key) {
                                                var l = getParsers();
                                                var cleanUrl = stripProxy(url || '').trim().replace(/^https?:\/\//i, '');
                                                l.push({ 
                                                    base: 'base_' + Date.now(), 
                                                    name: name.trim(), 
                                                    shortName: (shortName || name).trim(), 
                                                    url: cleanUrl, 
                                                    settings: { key: (key || '').trim(), parser_torrent_type: 'jackett' } 
                                                });
                                                saveParsers(l);
                                                Lampa.Noty.show('Додано: ' + name.trim()); 
                                                Lampa.Controller.toggle(enabled);
                                            });
                                        }, 350);
                                    });
                                }, 350);
                            });
                        }, 350);
                    });
                } else if (item.reset) {
                    saveParsers(DEFAULT_PARSERS);
                    Lampa.Storage.set(STORAGE_SEC_ACT, 0);
                    updateBtnName(btn);
                    Lampa.Noty.show('Список відновлено');
                    Lampa.Controller.toggle(enabled);
                } else {
                    editMenu(item.myIdx, btn, enabled);
                }
            },
            onBack: function () { Lampa.Controller.toggle(enabled); }
        });
    }

    function editMenu(idx, btn, enabled) {
        var list = getParsers();
        var p = list[idx];
        Lampa.Select.show({
            title: p.name,
            items: [ 
                { title: 'Змінити URL', action: 'url' }, 
                { title: 'Змінити API-ключ', action: 'apikey' }, 
                { title: 'Перейменувати', action: 'rename' }, 
                { title: 'Видалити', action: 'delete' } 
            ],
            onSelect: function (item) {
                if (item.action === 'delete') {
                    list.splice(idx, 1); 
                    saveParsers(list);
                    updateBtnName(btn); 
                    Lampa.Noty.show('Видалено'); 
                    Lampa.Controller.toggle(enabled);
                } else if (item.action === 'url') {
                    inputDialog('Новий URL (без протоколу)', stripProxy(p.url), function (val) {
                        list[idx].url = stripProxy(val || '').trim().replace(/^https?:\/\//i, '');
                        if (list[idx].displayUrl) delete list[idx].displayUrl;
                        saveParsers(list); 
                        updateBtnName(btn);
                        Lampa.Noty.show('URL оновлено'); 
                        Lampa.Controller.toggle(enabled);
                    });
                } else if (item.action === 'apikey') {
                    inputDialog('API-ключ', (p.settings && p.settings.key) || '', function (val) {
                        if (!list[idx].settings) list[idx].settings = {};
                        list[idx].settings.key = (val || '').trim(); 
                        saveParsers(list);
                        updateBtnName(btn);
                        Lampa.Noty.show('API-ключ оновлено'); 
                        Lampa.Controller.toggle(enabled);
                    });
                } else if (item.action === 'rename') {
                    inputDialog('Нова повна назва', p.name, function (nameVal) {
                        if (!nameVal) return;
                        setTimeout(function() { 
                            inputDialog('Нова коротка назва', p.shortName || nameVal, function (shortVal) {
                                list[idx].name = nameVal.trim(); 
                                list[idx].shortName = (shortVal || nameVal).trim();
                                saveParsers(list); 
                                updateBtnName(btn);
                                Lampa.Noty.show('Перейменовано'); 
                                Lampa.Controller.toggle(enabled);
                            });
                        }, 350);
                    });
                }
            },
            onBack: function () { Lampa.Controller.toggle(enabled); }
        });
    }

    function inputDialog(title, value, cb) {
        if (Lampa.Input && typeof Lampa.Input.edit === 'function') {
            Lampa.Input.edit({
                title: title,
                value: value || '',
                free: true,
                nosave: true
            }, function (new_val) {
                cb(new_val);
            });
        } else {
            var res = prompt(title, value || '');
            if (res !== null) cb(res);
        }
    }

    var secondaryObserver = null;

    function startSecondaryObserver() {
        if (secondaryObserver) return;
        secondaryObserver = new MutationObserver(function () {
            var activity = Lampa.Activity.active();
            if (activity && activity.component !== 'torrents') return;
            
            var el = $('.torrent-filter');
            if (el.length && !el.find('.filter--parser').length) {
                tryInjectSecondaryButton(el);
            }
        });
        secondaryObserver.observe(document.body, { childList: true, subtree: true });
    }

    function stopSecondaryObserver() {
        if (secondaryObserver) {
            secondaryObserver.disconnect();
            secondaryObserver = null;
        }
    }

    function initSecondaryPlugin() {
        var isFixingUrl = false;
        
        Lampa.Storage.listener.follow('change', function (e) {
            if (!isFixingUrl && (e.name === 'jackett_url' || e.name === 'jackett_url_two' || e.name === 'prowlarr_url')) {
                var targetType = (e.name === 'jackett_url_two') ? 'secondary' : 'primary';
                if (e.value) {
                    var expectedUrl = applyProxy(e.value, targetType);
                    if (expectedUrl !== e.value) {
                        isFixingUrl = true;
                        Lampa.Storage.set(e.name, expectedUrl);
                        updateStandardFieldsUI();
                        setTimeout(function(){ isFixingUrl = false; }, 150);
                    }
                }
            }
            
            if (e.name === 'activity') {
                var activity = Lampa.Activity.active();
                if (activity && activity.component === 'torrents') {
                    startSecondaryObserver();
                    setTimeout(function() {
                        var el = $('.torrent-filter');
                        if (el.length) tryInjectSecondaryButton(el);
                    }, 100);
                    setTimeout(function() {
                        var el = $('.torrent-filter');
                        if (el.length) tryInjectSecondaryButton(el);
                    }, 800);
                } else {
                    stopSecondaryObserver();
                }
            }
        });

        var activity = Lampa.Activity.active();
        if (activity && activity.component === 'torrents') {
            startSecondaryObserver();
            var el = $('.torrent-filter');
            if (el.length) tryInjectSecondaryButton(el);
        }
    }

    function initAll() {
        Lampa.Lang.add = Lampa.Lang.add || function() {};
        translate();
        getParsers(); // Міграція списку, що зберігається в ps_list_combo_v0.2
        migrateActiveSpawnUrls();
        // Reapply the selected built-in Prowlarr so Lampa picks up its corrected type.
        var selected = getSelectedBase();
        if (selected === 'prowl_dshs' || selected === 'prowl_ashpan') applySelectedParser(selected);
        initPrimarySettings();
        initSecondaryPlugin();
        console.log('[CombinedParserPlugin V14 Test 3 - Prowlarr API keys fix] Loaded successfully');
    }

    if (!window.plugin_combined_parser_ready) {
        window.plugin_combined_parser_ready = true;
        if (window.appready || (window.Lampa && window.Lampa.Storage)) initAll();
        else {
            document.addEventListener('lampa:ready', initAll);
            if (window.Lampa && window.Lampa.Listener) Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') initAll(); });
        }
    }

})();
