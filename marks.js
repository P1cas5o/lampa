/**
 * Ліхтар Studios2 — плагін головної сторінки (Flixio Team).
 * Кастомна головна, стрімінги, студії, підписки на студії, Кіноогляд.
 */
(function () {
    'use strict';

    window.FLIXIO_STUDIOS_VER = '4.0';
    window.FLIXIO_STUDIOS_LOADED = false;
    window.FLIXIO_STUDIOS_ERROR = null;

    if (typeof Lampa === 'undefined') {
        window.FLIXIO_STUDIOS_ERROR = 'Lampa not found (script loaded before app?)';
        return;
    }


    // =================================================================
    // CONFIGURATION & CONSTANTS
    // =================================================================

    var currentScript = document.currentScript || [].slice.call(document.getElementsByTagName('script')).filter(function (s) {
        return (s.src || '').indexOf('studios') !== -1 || (s.src || '').indexOf('fix.js') !== -1 || (s.src || '').indexOf('flixio') !== -1;
    })[0];

    // Force CDN usage to ensure logos load correctly regardless of installation method
    var FLIXIO_BASE_URL = 'https://cdn.jsdelivr.net/gh/syvyj/studio_2@main/';
    var FLIXIO_LOGO_FALLBACK_CDN = 'https://cdn.jsdelivr.net/gh/syvyj/studio_2@main/';
/*
    var FLIXIO_BASE_URL = (currentScript && currentScript.src) ? currentScript.src.replace(/[#?].*$/, '').replace(/[^/]+$/, '') : 'http://127.0.0.1:3000/';
    
    if (FLIXIO_BASE_URL.indexOf('raw.githubusercontent.com') !== -1) {
        FLIXIO_BASE_URL = FLIXIO_BASE_URL
            .replace('raw.githubusercontent.com', 'cdn.jsdelivr.net/gh')
            .replace(/\/([^@/]+\/[^@/]+)\/main\//, '/$1@main/')
            .replace(/\/([^@/]+\/[^@/]+)\/master\//, '/$1@master/');
    } else if (FLIXIO_BASE_URL.indexOf('.github.io') !== -1) {
        // e.g. https://syvyj.github.io/studio_2/ → https://cdn.jsdelivr.net/gh/syvyj/studio_2@main/
        var gitioMatch = FLIXIO_BASE_URL.match(/https?:\/\/([^.]+)\.github\.io\/([^/]+)\//i);
        if (gitioMatch) {
            FLIXIO_BASE_URL = 'https://cdn.jsdelivr.net/gh/' + gitioMatch[1] + '/' + gitioMatch[2] + '@main/';
        }
    }
*/
    var FLIXIO_LANG = (Lampa.Storage.get('language', 'uk') || 'uk').toLowerCase();
    if (FLIXIO_LANG === 'ua') FLIXIO_LANG = 'uk';
    if (['uk', 'ru', 'en', 'pl'].indexOf(FLIXIO_LANG) === -1) FLIXIO_LANG = 'en';


    
    

    // =================================================================
    // MAIN PAGE ROWS
    // =================================================================

    // ========== Прибираємо секцію Shots ==========
    function removeShotsSection() {
        function doRemove() {
            $('.items-line').each(function () {
                var title = $(this).find('.items-line__title').text().trim();
                if (title === 'Shots' || title === 'shots') {
                    $(this).remove();
                }
            });
        }
        // Виконуємо із затримкою, бо Shots може підвантажитись пізніше
        setTimeout(doRemove, 1000);
        setTimeout(doRemove, 3000);
        setTimeout(doRemove, 6000);
    }

    

    function addStyles() {
        $('#custom_main_page_css').remove();
        $('body').append(`
            <style id="custom_main_page_css">
                /* Hero Banner (‑20%: 22em) */
                .card.hero-banner { 
                    width: 52vw !important; 
                    height: 25em !important;
                    margin: 0 1.5em 0.3em 0 !important; /* Reduced bottom margin */
                    display: inline-block; 
                    scroll-snap-align: start; /* Smart Snap */
                    scroll-margin-left: 1.5em !important; /* Force indentation for every card */
                }
                
                /* Container Snap (Fallback) */
                .scroll__content:has(.hero-banner) {
                    scroll-snap-type: x mandatory;
                    padding-left: 1.5em !important;
                }
                .scroll--mask .scroll__content {
                    padding: 1.2em 1em 1em;
                }
                
                /* Global Row Spacing Reduction */
                .row--card {
                     margin-bottom: -1.2em !important; /* Pull rows closer by ~40% */
                }
                
                .items-line {
                    padding-bottom: 2em !important;
                }

                /* Кнопка "На сторінку" */
                .flixio-more-btn {
                    width: 14em !important;
                    height: 21em !important;
                    border-radius: 0.8em;
                    background: rgba(255, 255, 255, 0.05);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: transform 0.2s, background 0.2s;
                    /* Залізне правило - завжди вкінці! */
                    order: 9999 !important;
                }
                .flixio-more-btn:hover, .flixio-more-btn.focus {
                    background: rgba(255, 255, 255, 0.15);
                    transform: scale(1.05);
                    box-shadow: 0 0 0 3px #fff;
                }
                .flixio-more-btn > div {
                    text-align: center;
                }
                .flixio-more-logo {
                    margin-bottom: 0.5em;
                }
                .flixio-more-logo svg,
                .flixio-more-logo img {
                    width: 3.4em;
                    height: auto;
                }

                /* Скрываем значки качества из click_theme.js, если активен studios5.js */
                .click-quality,
                .click-quality-full,
                .full-start__status.click-quality-full {
                    display: none !important;
                }

            </style>
        `);
    }

    // =================================================================
    // FLIXIO QUALITY MARKS (Jacred)
    // =================================================================

    function initMarksJacRed() {
        var svgIcons = {
            '4K': '<span style="font-weight:800;font-size:0.85em;color:#ff9800;">4K</span>',
            'UKR': '<span style="font-weight:800;font-size:0.85em;color:#4fc3f7;">UA</span>',
            'HDR': '<span style="font-weight:800;font-size:0.85em;color:#ffeb3b;">HDR</span>'
        };

        var workingProxy = null;
        var proxies = [
            'https://myfinder.kozak-bohdan.workers.dev/?key=lmp_2026_JacRed_K9xP7aQ4mV2E&url=',
            'https://api.allorigins.win/raw?url=',
            'https://corsproxy.io/?url='
        ];

        var cardsObserver = null;

        function fetchWithProxy(url, callback) {
            // Спочатку пробуємо Lampa.Reguest (вбудований проксі Лампи)
            try {
                var network = new Lampa.Reguest();
                network.timeout(10000);
                network.silent(url, function (json) {
                    console.log('[JacRed] Direct success via Lampa.Reguest');
                    var text = typeof json === 'string' ? json : JSON.stringify(json);
                    workingProxy = 'direct';
                    callback(null, text);
                }, function () {
                    console.log('[JacRed] Direct Lampa.Reguest failed, trying proxies...');
                    tryProxies(url, callback);
                });
            } catch (e) {
                tryProxies(url, callback);
            }
        }

        function tryProxies(url, callback) {
            var proxyList = (workingProxy && workingProxy !== 'direct') ? [workingProxy] : proxies;

            function tryProxy(index) {
                if (index >= proxyList.length) {
                    console.error('[JacRed] All proxies failed for:', url);
                    callback(new Error('No proxy worked'));
                    return;
                }
                var p = proxyList[index];
                var target = p.indexOf('url=') > -1 ? p + encodeURIComponent(url) : p + url;
                console.log('[JacRed] Fetching via proxy:', target);

                var xhr = new XMLHttpRequest();
                xhr.open('GET', target, true);
                xhr.onload = function () {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        console.log('[JacRed] Proxy success:', p);
                        workingProxy = p;
                        callback(null, xhr.responseText);
                    } else {
                        console.warn('[JacRed] Proxy failed:', xhr.status, p);
                        tryProxy(index + 1);
                    }
                };
                xhr.onerror = function () {
                    console.warn('[JacRed] Proxy error:', p);
                    tryProxy(index + 1);
                };
                xhr.timeout = 10000;
                xhr.ontimeout = function () {
                    console.warn('[JacRed] Proxy timeout:', p);
                    tryProxy(index + 1);
                };
                xhr.send();
            }
            tryProxy(0);
        }

        var _jacredCache = {};

        function getBestJacred(card, callback) {
            // новая версия кэша, чтобы пересчитать языковые метки по обновлённым правилам
            var cacheKey = 'jacred_v4_' + card.id;

            // In-memory cache (миттєвий)
            if (_jacredCache[cacheKey]) {
                console.log('[JacRed] mem-cache HIT:', cacheKey);
                callback(_jacredCache[cacheKey]);
                return;
            }

            // localStorage cache (переживає перезавантаження)
            try {
                var raw = Lampa.Storage.get(cacheKey, '');
                if (raw && typeof raw === 'object' && raw._ts && (Date.now() - raw._ts < 48 * 60 * 60 * 1000)) {
                    console.log('[JacRed] storage-cache HIT:', cacheKey, raw);
                    _jacredCache[cacheKey] = raw;
                    callback(raw);
                    return;
                }
            } catch (e) { }

            console.log('[JacRed] cache MISS for', cacheKey);

            var title = (card.original_title || card.title || card.name || '').toLowerCase();
            var year = (card.release_date || card.first_air_date || '').substr(0, 4);
            console.log('[JacRed] title:', title, 'year:', year, 'release_date:', card.release_date, 'first_air_date:', card.first_air_date);

            if (!title || !year) {
                console.warn('[JacRed] SKIP: no title or year');
                callback(null);
                return;
            }

            var releaseDate = new Date(card.release_date || card.first_air_date);
            console.log('[JacRed] releaseDate:', releaseDate, 'now:', new Date(), 'future?', releaseDate.getTime() > Date.now());
            if (releaseDate && releaseDate.getTime() > Date.now()) {
                console.warn('[JacRed] SKIP: future release');
                callback(null);
                return;
            }

            var apiUrl = 'https://jr.maxvol.pro/api/v1.0/torrents?search=' + encodeURIComponent(title) + '&year=' + year;
            console.log('[JacRed] API URL:', apiUrl);

            fetchWithProxy(apiUrl, function (err, data) {
                if (err || !data) {
                    callback(null);
                    return;
                }

                try {
                    var parsed;
                    try {
                        parsed = JSON.parse(data);
                    } catch (e) {
                        console.error('[JacRed] JSON Parse Error:', e);
                        console.log('[JacRed] Raw Data:', data);
                        callback(null);
                        return;
                    }

                    // Handle AllOrigins wrapper if present
                    if (parsed.contents) {
                        try {
                            parsed = JSON.parse(parsed.contents);
                        } catch (e) {
                            console.log('[JacRed] Failed to parse inner contents, using raw');
                        }
                    }

                    var results = Array.isArray(parsed) ? parsed : (parsed.Results || []);
                    console.log('[JacRed] Parsed results:', results.length);

                    if (!results.length) {
                        var emptyData = { empty: true, _ts: Date.now() };
                        _jacredCache[cacheKey] = emptyData;
                        try { Lampa.Storage.set(cacheKey, emptyData); } catch (e) { }
                        callback(null);
                        return;
                    }

                    var best = { resolution: 'SD', rus: false, ukr: false, eng: false, hdr: false };
                    var resOrder = ['SD', 'HD', 'FHD', '2K', '4K'];

                    results.forEach(function (item) {
                        var t = (item.title || '').toLowerCase();
                        var tracker = (item.tracker || '').toLowerCase();
                        var voices = Array.isArray(item.voices) ? item.voices : [];
                        var voicesStr = (voices.join(' ') || '').toLowerCase();
                        var videotype = (item.videotype || '').toLowerCase();

                        // 1) Пытаемся определить качество по числовому полю JacRed (quality)
                        var currentRes = 'SD';
                        var q = parseInt(item.quality || 0, 10);
                        if (q >= 2160) currentRes = '4K';
                        else if (q >= 1440) currentRes = '2K';
                        else if (q >= 1080) currentRes = 'FHD';
                        else if (q >= 720) currentRes = 'HD';

                        // 2) Если quality отсутствует или равно 0 — fallback по названию
                        if (currentRes === 'SD') {
                            if (t.indexOf('4k') >= 0 || t.indexOf('2160') >= 0 || t.indexOf('uhd') >= 0) currentRes = '4K';
                            else if (t.indexOf('2k') >= 0 || t.indexOf('1440') >= 0) currentRes = '2K';
                            else if (t.indexOf('1080') >= 0 || t.indexOf('fhd') >= 0 || t.indexOf('full hd') >= 0) currentRes = 'FHD';
                            else if (t.indexOf('720') >= 0 || t.indexOf('hd') >= 0) currentRes = 'HD';
                        }

                        if (resOrder.indexOf(currentRes) > resOrder.indexOf(best.resolution)) {
                            best.resolution = currentRes;
                        }

                        if (t.indexOf('ukr') >= 0 || t.indexOf('укр') >= 0 || t.indexOf('ua') >= 0 || t.indexOf('ukrainian') >= 0) {
                            best.ukr = true;
                        }

                        // RU audio markers — максимально широкий набор паттернов
                        if (
                            t.indexOf('rus') >= 0 ||
                            t.indexOf('russian') >= 0 ||
                            t.indexOf('рус') >= 0 ||
                            t.indexOf('рос') >= 0 ||
                            t.indexOf(' ru') >= 0 ||
                            t.indexOf('ru ') >= 0 ||
                            t.indexOf('[ru]') >= 0 ||
                            t.indexOf('(ru)') >= 0 ||
                            t.indexOf('/ru') >= 0 ||
                            t.indexOf('ru/') >= 0 ||
                            t.indexOf('ua/ru') >= 0 ||
                            t.indexOf('ukr/ru') >= 0 ||
                            t.indexOf('ru/ua') >= 0
                        ) {
                            best.rus = true;
                        }

                        // JacRed дополнительно отдаёт массив voices и tracker.
                        // Для русских трекеров считаем любую озвучку в voices как RU.
                        if (!best.rus) {
                            var ruTrackers = ['kinozal', 'rutracker', 'rutor', 'nnmclub', 'megapeer', 'selezen'];
                            if (ruTrackers.indexOf(tracker) >= 0 && voices.length) {
                                best.rus = true;
                            }
                        }

                        if (t.indexOf('eng') >= 0 || t.indexOf('english') >= 0 || t.indexOf('multi') >= 0) {
                            best.eng = true;
                        }

                        // HDR / Dolby Vision: сначала по videotype, затем по названию
                        if (videotype.indexOf('dolby') >= 0 || videotype.indexOf('dv') >= 0 || t.indexOf('dolby vision') >= 0 || t.indexOf('dolbyvision') >= 0) {
                            best.hdr = true;
                            best.dolbyVision = true;
                        } else if (videotype.indexOf('hdr') >= 0 || t.indexOf('hdr') >= 0) {
                            best.hdr = true;
                        }
                    });

                    if (card.original_language === 'uk') best.ukr = true;
                    if (card.original_language === 'ru') best.rus = true;
                    if (card.original_language === 'en') best.eng = true;

                    best._ts = Date.now();
                    _jacredCache[cacheKey] = best;
                    try { Lampa.Storage.set(cacheKey, best); } catch (e) { }
                    console.log('[JacRed] RESULT for', card.id, ':', JSON.stringify(best));
                    callback(best);

                } catch (e) {
                    callback(null);
                }
            });
        }

        function createBadge(cssClass, label) {
            var badge = document.createElement('div');
            badge.classList.add('card__mark');
            badge.classList.add('card__mark--' + cssClass);
            badge.textContent = label;
            return badge;
        }

        // Вставити мітки в повну картку (спільна логіка для події та вже відкритої сторінки)
        function injectFullCardMarks(movie, renderEl) {
            // Информация о сезонах теперь добавляется через fillInfo
            return;
        }

        // ====== Функции для работы с качеством ======
        var studios_quality_cache_key = 'studios_quality_cache';
        var studios_quality_cache_ttl = 12 * 60 * 60 * 1000; // 12 часов
        
        function studiosGetQualityCache(cacheKey) {
            var cache = Lampa.Storage.get(studios_quality_cache_key) || {};
            var item = cache[cacheKey];
            if (!item) return null;
            if (!item.timestamp || (Date.now() - item.timestamp) > studios_quality_cache_ttl) return null;
            return item;
        }
        
        function studiosSaveQualityCache(cacheKey, data) {
            var cache = Lampa.Storage.get(studios_quality_cache_key) || {};
            cache[cacheKey] = {
                label: data.label,
                code: data.code,
                timestamp: Date.now()
            };
            Lampa.Storage.set(studios_quality_cache_key, cache);
        }
        
        function studiosExtractNumericQualityFromTitle(title) {
            if (!title) return 0;
            var lower = String(title).toLowerCase();
            if (/2160p|4k/.test(lower)) return 2160;
            if (/1440p|qhd|2k/.test(lower)) return 1440;
            if (/1080p/.test(lower)) return 1080;
            if (/720p/.test(lower)) return 720;
            if (/480p/.test(lower)) return 480;
            if (/tc|telecine/.test(lower)) return 3;
            if (/ts|telesync/.test(lower)) return 2;
            if (/camrip|камрип/.test(lower)) return 1;
            return 0;
        }
        
        function studiosNormalizeCardForQuality(data) {
            var type = 'movie';
            if (data && (data.name || data.first_air_date || data.media_type === 'tv' || data.type === 'tv')) {
                type = 'tv';
            }
            var release_date = '';
            if (data) {
                if (typeof data.release_date === 'string' && data.release_date.length >= 4) {
                    release_date = data.release_date;
                } else if (typeof data.first_air_date === 'string' && data.first_air_date.length >= 4) {
                    release_date = data.first_air_date;
                } else if (data.year) {
                    var yearMatch = String(data.year).match(/(19|20)\d{2}/);
                    if (yearMatch) release_date = yearMatch[0] + '-01-01';
                } else if (data.date) {
                    var dateMatch = String(data.date).match(/(19|20)\d{2}/);
                    if (dateMatch) release_date = dateMatch[0] + '-01-01';
                }
            }
            return {
                id: data && (data.id || data.tmdb_id || (data.tmdb && data.tmdb.id)) || '',
                title: data && (data.title || data.name || '') || '',
                original_title: data && (data.original_title || data.original_name || '') || '',
                type: type,
                release_date: release_date
            };
        }
        
        function studiosEstimateFallbackQuality(normalized, originalData) {
            var year = 0;
            if (normalized && normalized.release_date && normalized.release_date.length >= 4) {
                year = parseInt(normalized.release_date.substring(0, 4), 10);
            } else if (originalData && originalData.year) {
                var yearMatch = String(originalData.year).match(/(19|20)\d{2}/);
                if (yearMatch) year = parseInt(yearMatch[0], 10);
            }
            if (!year || isNaN(year)) return null;
            var code = 0;
            var label = '';
            if (year >= 2023) {
                code = 2160;
                label = '4K';
            } else if (year >= 2020) {
                code = 1080;
                label = '1080p';
            } else if (year >= 2015) {
                code = 720;
                label = '720p';
            } else {
                code = 480;
                label = 'SD';
            }
            return { code: code, label: label };
        }
        
        function studiosResolveRealQuality(cardData, callback) {
            try {
                console.log('[Studios5] Starting quality detection for:', cardData.title || cardData.name);
                
                // Проверяем, включен ли парсер
                var parserEnabled = Lampa.Storage.get('parser_use', false);
                console.log('[Studios5] Parser enabled:', parserEnabled);
                
                if (!parserEnabled) {
                    console.log('[Studios5] Parser disabled, using year fallback');
                    // Если парсер выключен, используем fallback по году
                    var normalized = studiosNormalizeCardForQuality(cardData);
                    var estimated = studiosEstimateFallbackQuality(normalized, cardData);
                    callback(estimated || null);
                    return;
                }
                
                if (!Lampa.Parser || typeof Lampa.Parser.get !== 'function') {
                    console.log('[Studios5] Lampa.Parser not available, using year fallback');
                    var normalized = studiosNormalizeCardForQuality(cardData);
                    var estimated = studiosEstimateFallbackQuality(normalized, cardData);
                    callback(estimated || null);
                    return;
                }
                
                var title = cardData.title || cardData.name || 'Неизвестно';
                var year = ((cardData.first_air_date || cardData.release_date || '0000') + '').slice(0, 4);
                var searchQuery = {
                    df: cardData.original_title,
                    df_year: cardData.original_title + ' ' + year,
                    df_lg: cardData.original_title + ' ' + cardData.title,
                    df_lg_year: cardData.original_title + ' ' + cardData.title + ' ' + year,
                    lg: cardData.title,
                    lg_year: cardData.title + ' ' + year,
                    lg_df: cardData.title + ' ' + cardData.original_title,
                    lg_df_year: cardData.title + ' ' + cardData.original_title + ' ' + year
                }[Lampa.Storage.get('parse_lang', 'ru')] || cardData.title;
                
                console.log('[Studios5] Searching with query:', searchQuery);
                
                Lampa.Parser.get({
                    search: searchQuery,
                    movie: cardData,
                    page: 1
                }, function(data) {
                    console.log('[Studios5] Parser response:', data);
                    
                    if (!data || !data.Results || data.Results.length === 0) {
                        console.log('[Studios5] No results from parser, using year fallback');
                        var normalized = studiosNormalizeCardForQuality(cardData);
                        var estimated = studiosEstimateFallbackQuality(normalized, cardData);
                        callback(estimated || null);
                        return;
                    }
                    
                    var resolutions = new Set();
                    var hdr = new Set();
                    var audio = new Set();
                    var hasDub = false;
                    
                    console.log('[Studios5] Processing', data.Results.length, 'results');
                    
                    data.Results.forEach(function(result) {
                        if (result.ffprobe && Array.isArray(result.ffprobe)) {
                            var videoInfo = function(ffprobeData) {
                                if (!ffprobeData || !Array.isArray(ffprobeData)) return null;
                                
                                var info = {
                                    resolution: null,
                                    hdr: false,
                                    dolbyVision: false,
                                    audio: null
                                };
                                
                                var videoTrack = ffprobeData.find(function(track) {
                                    return track.codec_type === 'video';
                                });
                                
                                if (videoTrack) {
                                    if (videoTrack.width && videoTrack.height) {
                                        info.resolution = videoTrack.width + 'x' + videoTrack.height;
                                        
                                        if (videoTrack.height >= 2160 || videoTrack.width >= 3840) {
                                            info.resolutionLabel = '4K';
                                        } else if (videoTrack.height >= 1440 || videoTrack.width >= 2560) {
                                            info.resolutionLabel = '2K';
                                        } else if (videoTrack.height >= 1080 || videoTrack.width >= 1920) {
                                            info.resolutionLabel = 'FULL HD';
                                        } else if (videoTrack.height >= 720 || videoTrack.width >= 1280) {
                                            info.resolutionLabel = 'HD';
                                        }
                                    }
                                    
                                    if (videoTrack.side_data_list) {
                                        var hasMastering = videoTrack.side_data_list.some(function(item) {
                                            return item.side_data_type === 'Mastering display metadata';
                                        });
                                        var hasContentLight = videoTrack.side_data_list.some(function(item) {
                                            return item.side_data_type === 'Content light level metadata';
                                        });
                                        
                                        if (videoTrack.side_data_list.some(function(item) {
                                            return item.side_data_type === 'DOVI configuration record' || item.side_data_type === 'Dolby Vision RPU';
                                        })) {
                                            info.dolbyVision = true;
                                            info.hdr = true;
                                        } else if (hasMastering || hasContentLight) {
                                            info.hdr = true;
                                        }
                                    }
                                    
                                    if (!info.hdr && videoTrack.color_transfer && ['smpte2084', 'arib-std-b67'].includes(videoTrack.color_transfer.toLowerCase())) {
                                        info.hdr = true;
                                    }
                                    
                                    if (!info.dolbyVision && videoTrack.codec_name && (videoTrack.codec_name.toLowerCase().includes('dovi') || videoTrack.codec_name.toLowerCase().includes('dolby'))) {
                                        info.dolbyVision = true;
                                        info.hdr = true;
                                    }
                                }
                                
                                var audioTracks = ffprobeData.filter(function(track) {
                                    return track.codec_type === 'audio';
                                });
                                
                                var maxChannels = 0;
                                audioTracks.forEach(function(track) {
                                    if (track.channels && track.channels > maxChannels) {
                                        maxChannels = track.channels;
                                    }
                                });
                                
                                if (maxChannels >= 8) {
                                    info.audio = '7.1';
                                } else if (maxChannels >= 6) {
                                    info.audio = '5.1';
                                } else if (maxChannels >= 4) {
                                    info.audio = '4.0';
                                } else if (maxChannels >= 2) {
                                    info.audio = '2.0';
                                }
                                
                                return info;
                            }(result.ffprobe);
                            
                            if (videoInfo) {
                                if (videoInfo.resolutionLabel) {
                                    resolutions.add(videoInfo.resolutionLabel);
                                }
                                if (videoInfo.audio) {
                                    audio.add(videoInfo.audio);
                                }
                            }
                            
                            if (!hasDub) {
                                result.ffprobe.filter(function(track) {
                                    return track.codec_type === 'audio' && track.tags;
                                }).forEach(function(track) {
                                    var language = (track.tags.language || '').toLowerCase();
                                    var trackTitle = (track.tags.title || track.tags.handler_name || '').toLowerCase();
                                    
                                    if (language === 'rus' || language === 'ru' || language === 'russian') {
                                        if (trackTitle.includes('dub') || trackTitle.includes('дубляж') || trackTitle.includes('дублир') || trackTitle === 'd') {
                                            hasDub = true;
                                        }
                                    }
                                });
                            }
                        }
                        
                        var titleLower = result.Title.toLowerCase();
                        if (titleLower.includes('dolby vision') || titleLower.includes('dovi') || titleLower.match(/\bdv\b/)) {
                            hdr.add('Dolby Vision');
                        }
                        if (titleLower.includes('hdr10+')) {
                            hdr.add('HDR10+');
                        }
                        if (titleLower.includes('hdr10')) {
                            hdr.add('HDR10');
                        }
                        if (titleLower.includes('hdr')) {
                            hdr.add('HDR');
                        }
                    });
                    
                    console.log('[Studios5] Resolutions found:', Array.from(resolutions));
                    console.log('[Studios5] Audio found:', Array.from(audio));
                    
                    var result = {
                        title: title,
                        torrents_found: data.Results.length,
                        quality: null,
                        dv: false,
                        hdr: false,
                        hdr_type: null,
                        sound: null,
                        dub: hasDub
                    };
                    
                    if (resolutions.size > 0) {
                        var qualityPriority = ['8K', '4K', '2K', 'FULL HD', 'HD'];
                        for (var i = 0; i < qualityPriority.length; i++) {
                            if (resolutions.has(qualityPriority[i])) {
                                result.quality = qualityPriority[i];
                                break;
                            }
                        }
                    }
                    
                    console.log('[Studios5] Final quality result:', result.quality);
                    
                    if (result.quality) {
                        callback({ code: result.quality, label: result.quality, fromParser: true });
                    } else {
                        console.log('[Studios5] No quality from parser, using year fallback');
                        // Fallback к оценке по году
                        var normalized = studiosNormalizeCardForQuality(cardData);
                        var estimated = studiosEstimateFallbackQuality(normalized, cardData);
                        callback(estimated || null);
                    }
                });
                
            } catch (e) {
                console.error('[Studios5] studiosResolveRealQuality error:', e);
                var normalized = studiosNormalizeCardForQuality(cardData);
                var estimated = studiosEstimateFallbackQuality(normalized, cardData);
                callback(estimated || null);
            }
        }

        // ====== Функция для получения данных о сезонах из API ======
        function fetchSeasonData(tmdbId, callback) {
            if (!tmdbId || typeof tmdbId !== 'number') {
                return callback(null);
            }

            var url = Lampa.TMDB.api('tv/' + tmdbId + '?api_key=' + getTmdbKey() + '&language=' + Lampa.Storage.get('language', 'uk'));
            var network = new Lampa.Reguest();
            
            network.silent(url, function(data) {
                if (data && data.seasons) {
                    callback(data);
                } else {
                    callback(null);
                }
            }, function(error) {
                callback(null);
            });
        }

        // ====== Принудительное применение стилей к бейджам качества ======
        function forceQualityBadgeStyles() {
            $('.card__badge--quality').each(function() {
                // Пропускаем hero-баннеры (Новинки проката)
                if ($(this).closest('.card').hasClass('hero-banner')) {
                    return;
                }
                $(this).css({
                    'border-radius': '0 0.8em 0 0.8em !important',
                    'bottom': '0 !important',
                    'left': '0 !important',
                    'background': 'rgba(51, 153, 153, 0.9) !important',
                    'color': '#fff !important',
                    'font-weight': 'bold !important',
                    'text-transform': 'uppercase !important'
                });
            });
        }

        // Применяем стили сразу и с задержкой
        setTimeout(forceQualityBadgeStyles, 100);
        setTimeout(forceQualityBadgeStyles, 500);
        setTimeout(forceQualityBadgeStyles, 1000);

        // ====== Добавление бейджей как на скриншоте ======
        
        // Безопасная функция для проверки настроек
        function isBadgeEnabled(badgeName) {
            try {
                if (typeof Lampa !== 'undefined' && Lampa.Storage && typeof Lampa.Storage.get === 'function') {
                    return Lampa.Storage.get(badgeName, true);
                }
                return true; // По умолчанию включено
            } catch (e) {
                console.log('[Studios5] Error checking badge setting:', badgeName, e);
                return true; // При ошибке включаем
            }
        }
        
        function addBadges(cardEl, movie) {
            if (!movie || !movie.id) return;

            var view = $(cardEl).find('.card__view');
            if (!view.length) view = $(cardEl);

            // Проверяем, не является ли это hero-баннером (Новинки проката)
            if ($(cardEl).hasClass('hero-banner')) {
                console.log('[Studios5] Skipping badges for hero banner (Новинки проката)');
                return;
            }

            // Удаляем старые бейджи
            view.find('.card__badge--custom').remove();

            // S1 (Season) - левый верхний угол (только один бейдж в углу)
            var isTvSeries = movie.name || movie.original_name || (movie.first_air_date && !movie.release_date) || 
                            (movie.type === 'tv' || movie.media_type === 'tv') ||
                            (movie.number_of_seasons && movie.number_of_seasons > 0) ||
                            (movie.seasons && Array.isArray(movie.seasons) && movie.seasons.length > 0) ||
                            (movie.last_episode_to_air);
            
            if (isTvSeries && isBadgeEnabled('flixio_badge_seasons')) {
                var seasonNumber = 1; // По умолчанию S1
                
                // Функция для обновления бейджа сезона с информацией о сериях
                function updateSeasonBadge(seasonNum, currentEpisode, totalEpisodes) {
                    var badgeText;
                    var isComplete = totalEpisodes > 0 && currentEpisode >= totalEpisodes;
                    
                    if (isComplete) {
                        badgeText = "S" + seasonNum;
                    } else if (totalEpisodes > 0) {
                        badgeText = "S" + seasonNum + " " + currentEpisode + "/" + totalEpisodes;
                    } else {
                        badgeText = "S" + seasonNum;
                    }
                    
                    var seasonBadge = $('<div>', {
                        class: 'card__badge card__badge--custom card__badge--season',
                        text: badgeText
                    });
                    
                    view.append(seasonBadge);
                }
                
                // Правильное определение текущего сезона
                var lastEpisode = movie.last_episode_to_air;
                var seasons = movie.seasons;
                
                if (lastEpisode && lastEpisode.season_number && seasons && Array.isArray(seasons)) {
                    // Ищем сезон, соответствующий последнему выпущенному эпизоду
                    for (var i = 0; i < seasons.length; i++) {
                        if (seasons[i].season_number === lastEpisode.season_number) {
                            seasonNumber = lastEpisode.season_number;
                            var currentEpisode = lastEpisode.episode_number || 1;
                            var totalEpisodes = seasons[i].episode_count || 0;
                            updateSeasonBadge(seasonNumber, currentEpisode, totalEpisodes);
                            break;
                        }
                    }
                } else if (movie.season_number) {
                    seasonNumber = movie.season_number;
                    var currentEpisode = movie.episode_number || 1;
                    var totalEpisodes = movie.episode_count || 0;
                    updateSeasonBadge(seasonNumber, currentEpisode, totalEpisodes);
                } else if (movie.number_of_seasons && movie.number_of_seasons > 0) {
                    seasonNumber = movie.number_of_seasons;
                    updateSeasonBadge(seasonNumber, 1, 0);
                } else {
                    // Если данных нет в карточке, пытаемся получить из API
                    var seriesId = movie.id || movie.tmdb_id;
                    if (seriesId && typeof seriesId === 'number') {
                        fetchSeasonData(seriesId, function(data) {
                            if (data && data.last_episode_to_air && data.seasons) {
                                var lastEp = data.last_episode_to_air;
                                var seasonData = data.seasons;
                                
                                for (var j = 0; j < seasonData.length; j++) {
                                    if (seasonData[j].season_number === lastEp.season_number) {
                                        seasonNumber = lastEp.season_number;
                                        var currentEpisode = lastEp.episode_number || 1;
                                        var totalEpisodes = seasonData[j].episode_count || 0;
                                        updateSeasonBadge(seasonNumber, currentEpisode, totalEpisodes);
                                        return;
                                    }
                                }
                            } else if (data && data.number_of_seasons) {
                                seasonNumber = data.number_of_seasons;
                                updateSeasonBadge(seasonNumber, 1, 0);
                            } else {
                                updateSeasonBadge(1, 1, 0);
                            }
                        });
                    } else {
                        updateSeasonBadge(1, 1, 0);
                    }
                }
            }

            // Год - правый верхний угол
            var year = '';
            if (movie.release_date && movie.release_date.length >= 4) {
                year = movie.release_date.substring(0, 4);
            } else if (movie.first_air_date && movie.first_air_date.length >= 4) {
                year = movie.first_air_date.substring(0, 4);
            } else if (movie.year) {
                var yearMatch = String(movie.year).match(/(19|20)\d{2}/);
                if (yearMatch) year = yearMatch[0];
            }

            if (year && isBadgeEnabled('flixio_badge_year')) {
                var yearBadge = $('<div>', {
                    class: 'card__badge card__badge--custom card__badge--year',
                    text: year
                });
                view.append(yearBadge);
            }

            // Качество - левый нижний угол (вместо флага Украины)
            // Всегда показываем качество по году как минимум
            var normalized = studiosNormalizeCardForQuality(movie);
            var estimated = studiosEstimateFallbackQuality(normalized, movie);
            
            if (estimated && estimated.label && isBadgeEnabled('flixio_badge_quality')) {
                var shortLabel = '';
                var lower = estimated.label.toLowerCase();
                
                if (lower.includes('4k')) {
                    shortLabel = '4K';
                } else if (lower.includes('1080p')) {
                    shortLabel = 'FHD';
                } else if (lower.includes('720p')) {
                    shortLabel = 'HD';
                } else if (lower.includes('480p')) {
                    shortLabel = 'SD';
                } else {
                    shortLabel = estimated.label;
                }
                
                if (shortLabel) {
                    var qualityBadge = $('<div>', {
                        class: 'card__badge card__badge--custom card__badge--quality',
                        text: shortLabel,
                        css: {
                            'bottom': '0 !important',
                            'left': '0 !important',
                            'background': 'rgba(51, 153, 153, 0.9) !important',
                            'color': '#fff !important',
                            'border-radius': '0 0.8em 0 0.8em !important',
                            'font-weight': 'bold !important',
                            'text-transform': 'uppercase !important'
                        }
                    });
                    view.append(qualityBadge);
                    console.log('[Studios5] Year-based quality badge added:', shortLabel);
                }
            }
            
            // Пытаемся получить более точное качество от парсера (если доступно)
            studiosResolveRealQuality(movie, function(result) {
                console.log('[Studios5] Parser quality result for movie:', movie.title || movie.name, result);
                
                if (!result || !result.label) {
                    console.log('[Studios5] No parser quality data, keeping year-based');
                    return;
                }
                
                if (!view || !view.isConnected) {
                    console.log('[Studios5] View element not connected');
                    return;
                }
                
                var shortLabel = '';
                var lower = result.label.toLowerCase();
                
                // Определяем короткую метку качества для форматов от парсера
                if (lower.includes('8k')) {
                    shortLabel = '8K';
                } else if (lower.includes('4k')) {
                    shortLabel = '4K';
                } else if (lower.includes('2k')) {
                    shortLabel = '2K';
                } else if (lower.includes('full hd') || lower.includes('1080p')) {
                    shortLabel = 'FHD';
                } else if (lower.includes('hd') || lower.includes('720p')) {
                    shortLabel = 'HD';
                } else if (lower.includes('480p')) {
                    shortLabel = 'SD';
                } else if (lower.includes('camrip') || lower.includes('камрип')) {
                    shortLabel = 'CAM';
                } else if (lower.includes('ts') || lower.includes('telesync')) {
                    shortLabel = 'TS';
                } else if (lower.includes('tc') || lower.includes('telecine')) {
                    shortLabel = 'TC';
                } else {
                    // Для других форматов оставляем как есть или сокращаем
                    if (lower.includes('2160p')) {
                        shortLabel = '4K';
                    } else if (lower.includes('1440p')) {
                        shortLabel = '2K';
                    } else {
                        shortLabel = result.label; // Полный фоллбэк
                    }
                }
                
                if (!shortLabel) {
                    console.log('[Studios5] No short label generated for:', result.label);
                    return;
                }
                
                // Заменяем существующий бейдж качества на более точный
                var existingBadge = view.find('.card__badge--quality');
                if (existingBadge.length > 0) {
                    existingBadge.text(shortLabel);
                    existingBadge.css({
                        'border-radius': '0 0.8em 0 0.8em !important'
                    });
                    console.log('[Studios5] Quality badge updated to:', shortLabel, 'from parser:', result.fromParser);
                } else {
                    var qualityBadge = $('<div>', {
                        class: 'card__badge card__badge--custom card__badge--quality',
                        text: shortLabel,
                        css: {
                            'bottom': '0 !important',
                            'left': '0 !important',
                            'background': 'rgba(51, 153, 153, 0.9) !important',
                            'color': '#fff !important',
                            'border-radius': '0 0.8em 0 0.8em !important',
                            'font-weight': 'bold !important',
                            'text-transform': 'uppercase !important'
                        }
                    });
                    view.append(qualityBadge);
                    console.log('[Studios5] Parser quality badge added:', shortLabel);
                }
            });

            // Рейтинг - правый нижний угол
            var ratingRaw = movie.vote_average || movie.rating || movie.rate || movie.imdb_rating || movie.kp_rating;
            if (ratingRaw && isBadgeEnabled('flixio_badge_rating')) {
                var ratingValue = parseFloat(String(ratingRaw).replace(',', '.'));
                if (!isNaN(ratingValue) && ratingValue > 0) {
                    var ratingBadge = $('<div>', {
                        class: 'card__badge card__badge--custom card__badge--rating',
                        text: ratingValue.toFixed(1)
                    });
                    view.append(ratingBadge);
                }
            }
        }

        // ——— Повна картка: подія 'full' + обробка вже відкритої (deep link ?card=...) ———
        function initFullCardMarks() {
            if (!Lampa.Listener || !Lampa.Listener.follow) return;
            Lampa.Listener.follow('full', function (e) {
                if (e.type !== 'complite') return;

                // Очистка артефактов click_theme.js (черные значки качества)
                var attempts = 0;
                var cleaner = setInterval(function() {
                     var badges = document.querySelectorAll('.click-quality, .click-quality-full, .full-start__status.click-quality-full');
                     for (var i = 0; i < badges.length; i++) badges[i].remove();
                     attempts++;
                     if (attempts > 25) clearInterval(cleaner); // 5 секунд
                }, 200);

                var movie = e.data && e.data.movie;
                var renderEl = e.object && e.object.activity && e.object.activity.render && e.object.activity.render();
                injectFullCardMarks(movie, renderEl);
            });
            // Якщо відкрили по силці ?card=..., повна картка вже є до нашого init — обробити її одразу
            setTimeout(function () {
                try {
                    var act = Lampa.Activity && Lampa.Activity.active && Lampa.Activity.active();
                    if (!act || act.component !== 'full') return;
                    var movie = act.card || act.movie;
                    var renderEl = act.activity && act.activity.render && act.activity.render();
                    injectFullCardMarks(movie, renderEl);

                    // Очистка артефактов click_theme.js (для прямой ссылки)
                    var attempts = 0;
                    var cleaner = setInterval(function() {
                         var badges = document.querySelectorAll('.click-quality, .click-quality-full, .full-start__status.click-quality-full');
                         for (var i = 0; i < badges.length; i++) badges[i].remove();
                         attempts++;
                         if (attempts > 25) clearInterval(cleaner);
                    }, 200);
                } catch (err) {
                    console.warn('[JacRed] full card catch-up:', err);
                }
            }, 300);
        }

        // Картки на головній: MutationObserver тільки для .card (повну картку обробляємо через подію full)
        function processCards() {
            if (localStorage.getItem('maxsm_ratings_quality_inlist') === 'false') return;
            $('.card:not(.jacred-mark-processed-v2)').each(function () {
                var card = $(this);
                card.addClass('jacred-mark-processed-v2');

                // Пропускаем hero-баннеры (Новинки проката)
                if (card.hasClass('hero-banner')) {
                    console.log('[Studios5] Skipping processing for hero banner (Новинки проката)');
                    return;
                }

                // Hero-банери зберігають movie в heroMovieData
                var movie = card[0].heroMovieData || card.data('item') || (card[0] && (card[0].card_data || card[0].item)) || null;
                if (movie && movie.id && !movie.size) {
                    // Скрываем старые бейджи и метки
                    card.find('.card-marks, .card__mark, .card__type, .card__vote, .card__quality').hide();
                    
                    // Добавляем новые бейджи
                    addBadges(card[0], movie);
                }
            });
        }

        function observeCardRows() {
            if (cardsObserver) cardsObserver.disconnect();
            cardsObserver = new MutationObserver(function () {
                processCards();
            });
            cardsObserver.observe(document.body, { childList: true, subtree: true });
            processCards();
        }

        function renderInfoRowBadges(container, data) {
            container.empty();

            if (data.resolution && data.resolution !== 'SD') {
                var resText = data.resolution;
                if (resText === 'FHD') resText = '1080p';
                else if (resText === 'HD') resText = '720p';

                var qualityTag = $('<div class="full-start__pg"></div>');
                qualityTag.text(resText);
                container.append(qualityTag);
            }

            // HDR / Dolby Vision
            if (data.hdr) {
                var hdrTag = $('<div class="full-start__pg"></div>');
                hdrTag.text(data.dolbyVision ? 'Dolby Vision' : 'HDR');
                container.append(hdrTag);
            }
        }

        function addMarksToContainer(element, movie, viewSelector) {
            var containerParent = viewSelector ? element.find(viewSelector) : element;
            var marksContainer = containerParent.find('.card-marks');

            if (!marksContainer.length) {
                marksContainer = $('<div class="card-marks"></div>');
                containerParent.append(marksContainer);
            }

            getBestJacred(movie, function (data) {
                if (!data) data = { empty: true };
                // Даже если JacRed ничего не вернул (empty),
                // всё равно отрисуем рейтинг, если он есть у карточки
                renderBadges(marksContainer, data, movie);
            });
        }

        function renderBadges(container, data, movie) {
            container.empty();
            if (data.rus && Lampa.Storage.get('flixio_badge_ru', true)) container.append(createBadge('ru', 'RU'));
            if (data.ukr && Lampa.Storage.get('flixio_badge_ua', true)) container.append(createBadge('ua', 'UA'));
            if (data.eng && Lampa.Storage.get('flixio_badge_en', true)) container.append(createBadge('en', 'EN'));
            if (data.resolution && data.resolution !== 'SD') {
                if (data.resolution === '4K' && Lampa.Storage.get('flixio_badge_4k', true)) container.append(createBadge('4k', '4K'));
                else if (data.resolution === 'FHD' && Lampa.Storage.get('flixio_badge_fhd', true)) container.append(createBadge('fhd', 'FHD'));
                else if (data.resolution === 'HD' && Lampa.Storage.get('flixio_badge_fhd', true)) container.append(createBadge('hd', 'HD'));
                else if (Lampa.Storage.get('flixio_badge_fhd', true)) container.append(createBadge('hd', data.resolution));
            }
            if (data.hdr && Lampa.Storage.get('flixio_badge_hdr', true)) container.append(createBadge('hdr', 'HDR'));
            // Рейтинг критиків
            if (movie) {
                var rating = parseFloat(movie.imdb_rating || movie.kp_rating || movie.vote_average || 0);
                if (rating > 0) {
                    var rBadge = document.createElement('div');
                    rBadge.classList.add('card__mark', 'card__mark--rating');
                    rBadge.innerHTML = '<span class="mark-star">★</span>' + rating.toFixed(1);
                    container.append(rBadge);
                }
            }
        }

        var style = document.createElement('style');
        style.innerHTML = `
            /* ====== Вирівнюємо нативну TV мітку з нашими ====== */
            .card .card__type {
                left: -0.2em !important;
            }

            /* ====== Card marks — зліва, стовпчиком під TV ====== */
            .card-marks {
                position: absolute;
                top: 2.2em;
                left: -0.2em;
                display: flex;
                flex-direction: column;
                gap: 0.15em;
                z-index: 10;
                pointer-events: none;
            }
            /* Уніфікуємо відступ для всіх типів карток (Фільм/Серіал) */
            .card:not(.card--tv):not(.card--movie) .card-marks,
            .card--movie .card-marks {
                top: 2.2em;
            }
            .card__mark {
                padding: 0.35em 0.45em;
                font-size: 0.8em;
                font-weight: 800;
                line-height: 1;
                letter-spacing: 0.03em;
                border-radius: 0.3em;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                align-self: flex-start;
                opacity: 0;
                animation: mark-fade-in 0.35s ease-out forwards;
                border: 1px solid rgba(255,255,255,0.15);
            }
            .card__mark--ru  { background: linear-gradient(135deg, #8e24aa, #ce93d8); color: #fff; border-color: rgba(206,147,216,0.4); }
            .card__mark--ua  { background: linear-gradient(135deg, #1565c0, #42a5f5); color: #fff; border-color: rgba(66,165,245,0.4); }
            .card__mark--4k  { background: linear-gradient(135deg, #e65100, #ff9800); color: #fff; border-color: rgba(255,152,0,0.4); }
            .card__mark--fhd { background: linear-gradient(135deg, #4a148c, #ab47bc); color: #fff; border-color: rgba(171,71,188,0.4); }
            .card__mark--hd  { background: linear-gradient(135deg, #1b5e20, #66bb6a); color: #fff; border-color: rgba(102,187,106,0.4); }
            .card__mark--en  { background: linear-gradient(135deg, #37474f, #78909c); color: #fff; border-color: rgba(120,144,156,0.4); }
            .card__mark--hdr { background: linear-gradient(135deg, #f57f17, #ffeb3b); color: #000; border-color: rgba(255,235,59,0.4); }
            .card__mark--rating { background: linear-gradient(135deg, #1a1a2e, #16213e); color: #ffd700; border-color: rgba(255,215,0,0.3); font-size: 0.75em; white-space: nowrap; }
            .card__mark--rating .mark-star { margin-right: 0.15em; font-size: 0.9em; }

            /* ====== Новые бейджи как на скриншоте ====== */
            .card__badge--custom {
                position: absolute;
                z-index: 15;
                padding: 0.2em 0.45em;
                font-size: 1.1em;
                font-weight: bold;
                line-height: 1;
                color: #fff;
                opacity: 0;
                animation: badge-fade-in 0.3s ease-out forwards;
                font-family: Roboto, Arial, sans-serif;
            }

            @keyframes badge-fade-in {
                from { opacity: 0; transform: scale(0.8); }
                to { opacity: 1; transform: scale(1); }
            }

            /* S1 (Season) - левый верхний угол */
            .card__badge--season {
                top: 0 !important;
                left: 0 !important;
                background: rgba(0, 0, 0, 0.5) !important;
                color: #fff !important;
                border-radius: 0.8em 0 0.8em 0 !important;
                font-weight: bold !important;
            }

            /* Год - правый верхний угол */
            .card__badge--year {
                top: 0 !important;
                right: 0 !important;
                background: rgba(0, 0, 0, 0.6) !important;
                color: #fff !important;
                border-radius: 0 0.8em 0 0.8em !important;
                font-weight: bold !important;
            }

            /* Качество - левый нижний угол*/
            .card__badge--quality {
                bottom: 0 !important;
                left: 0 !important;
                background: rgba(51, 153, 153, 0.9) !important;
                color: #fff !important;
                border-radius: 0 0.8em 0 0.8em !important;
                font-weight: bold !important;
                text-transform: uppercase !important;
            }
            
            /* Дополнительные стили для гарантии */
            .card__badge.card__badge--custom.card__badge--quality {
                border-radius: 0 0.8em 0 0.8em !important;
            }

            /* Рейтинг - правый нижний угол */
            .card__badge--rating {
                bottom: 0 !important;
                right: 0 !important;
                background: rgba(93, 173, 226, 0.8) !important;
                color: #fff !important;
                border-radius: 0.8em 0 0.8em 0.0em !important;
                font-weight: bold !important;
            }

            /* ====== Картка "На сторінку стрімінгу" — використовуємо нативний card-more ====== */
            .service-more-card .card-more__box {
                height: 0;
                padding-bottom: 150%;
                position: relative;
            }
            .service-more-card .card-more__title {
                margin-top: 0;
                top: 50%;
                transform: translateY(-50%);
                font-size: 1.4em;
            }

            /* ====== NEW badge на стрімінгах ====== */
            .studio-new-badge {
                position: absolute;
                top: 1.0em;
                right: 0.4em;
                background: linear-gradient(135deg, #e53935, #ff5252);
                color: #fff;
                font-size: 0.65em;
                font-weight: 800;
                padding: 0.25em 0.5em;
                border-radius: 0.3em;
                letter-spacing: 0.05em;
                z-index: 5;
                animation: mark-fade-in 0.35s ease-out forwards;
                box-shadow: 0 2px 6px rgba(229,57,53,0.4);
            }

            /* ====== Overrides for Click Theme elements (move down) ====== */
            .click-content-type { top: 0.6em !important; }
            .click-rating { top: 0.6em !important; }
            .click-country { top: 2.0em !important; }

            /* Ховаємо нативну оцінку, коли є наші мітки */
            .card.jacred-mark-processed-v2 .card__vote { display: none !important; }

            /* ====== Hero banner marks ====== */
            .hero-banner .card-marks {
                top: 1.5em !important;
                left: 1.2em !important;
                gap: 0.3em !important;
            }
            .hero-banner .card__mark {
                font-size: 1em;
                padding: 0.4em 0.6em;
            }
            
            /* Скрываем все кастомные бейджи на hero-баннерах (Новинки проката) */
            .hero-banner .card__badge--custom {
                display: none !important;
            }
            
            /* ====== Full card (info row) marks ====== */
            .jacred-info-marks-v2 {
                display: flex;
                flex-direction: row;
                gap: 0.5em;
                margin-right: 1em;
                align-items: center;
            }

            @keyframes mark-fade-in { to { opacity: 1; } }
        `;
        document.head.appendChild(style);

        initFullCardMarks();
        window.FLIXIO_GET_BEST_JACRED = getBestJacred;
        window.FLIXIO_TOGGLE_JACRED_CARD_MARKS = function (enabled) {
            if (!enabled) {
                if (cardsObserver) cardsObserver.disconnect();
                return;
            }
            observeCardRows();
        };
        window.FLIXIO_TOGGLE_JACRED_CARD_MARKS(localStorage.getItem('maxsm_ratings_quality_inlist') !== 'false');
    }


    
        // === API TMDB ===
        Lampa.SettingsApi.addParam({
            component: 'flixio_plugin',
            param: { type: 'title' },
            field: { name: 'API TMDB' }
        });

        Lampa.SettingsApi.addParam({
            component: 'flixio_plugin',
            param: { name: 'flixio_tmdb_apikey', type: 'input', placeholder: tr('settings_tmdb_input_placeholder'), values: '', default: '' },
            field: { name: tr('settings_tmdb_input_name'), description: tr('settings_tmdb_input_desc') }
        });

    
    function initApplecationFullCard() {
        if (window.flixioApplecationFullCard) return;
        window.flixioApplecationFullCard = true;
        if (typeof Lampa === 'undefined' || !Lampa.Listener || !Lampa.Listener.follow) return;

        if (!document.getElementById('flixio_applecation_css')) {
            var style = document.createElement('style');
            style.id = 'flixio_applecation_css';
            style.textContent =
                '.applecation{transition:all .3s}' +
                '.applecation .full-start-new__body{height:80vh}' +
                '.applecation .full-start-new__right{display:flex;align-items:flex-end}' +
                '.applecation .full-start-new__head,.applecation .full-start-new__details,.applecation .full-descr,.applecation .full-descr__title,.applecation .full-start__head{display:none !important}' +
                '.applecation .full-start-new__title{font-size:2.5em;font-weight:700;line-height:1.2;margin-bottom:.5em;text-shadow:0 0 .1em rgba(0,0,0,.3)}' +
                '.applecation__logo{margin-bottom:.5em;opacity:0;transform:translateY(20px);transition:opacity .4s ease-out,transform .4s ease-out}' +
                '.applecation__logo.loaded{opacity:1;transform:translateY(0)}' +
                '.applecation__logo img{display:block;max-width:35vw;max-height:180px;width:auto;height:auto;object-fit:contain;object-position:left center}' +
                '.applecation__content-wrapper{font-size:100%}' +
                '.applecation__meta{display:flex;align-items:center;color:#fff;font-size:1.1em;margin-bottom:.5em;line-height:1;opacity:0;transform:translateY(15px);transition:opacity .4s ease-out,transform .4s ease-out;transition-delay:.05s}' +
                '.applecation__meta.show{opacity:1;transform:translateY(0)}' +
                '.applecation__meta-left{display:flex;align-items:center;line-height:1}' +
                '.applecation__network{display:inline-flex;align-items:center;line-height:1}' +
                '.applecation__network img{display:block;max-height:.8em;width:auto;object-fit:contain;filter:brightness(0) invert(1)}' +
                '.applecation__meta-text{margin-left:1em;line-height:1}' +
                '.applecation__meta .full-start__pg{margin:0 0 0 .6em;padding:.2em .5em;font-size:.85em;line-height:1;border-radius:.3em;border:2px solid rgba(255,255,255,.45)}' +
                '.applecation__description-wrapper{opacity:0;transform:translateY(15px);transition:opacity .4s ease-out,transform .4s ease-out;transition-delay:.1s}' +
                '.applecation__description-wrapper.show{opacity:1;transform:translateY(0)}' +
                '.applecation__description{max-width:35vw;color:rgba(255,255,255,.85);font-size:1.1em;line-height:1.4;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}' +
                '.applecation__info{margin-top:.5em;color:rgba(255,255,255,.85);font-size:1.1em;opacity:0;transform:translateY(15px);transition:opacity .4s ease-out,transform .4s ease-out;transition-delay:.15s}' +
                '.applecation__info.show{opacity:1;transform:translateY(0)}' +
                '.applecation__ratings{opacity:0;transform:translateY(15px);transition:opacity .4s ease-out,transform .4s ease-out;transition-delay:.12s}' +
                '.applecation__ratings.show{opacity:1;transform:translateY(0)}' +
                '.applecation-description-overlay{position:fixed;left:0;top:0;width:100%;height:100%;z-index:1000;opacity:0;pointer-events:none;transition:opacity .3s}' +
                '.applecation-description-overlay.show{opacity:1;pointer-events:auto}' +
                '.applecation-description-overlay__bg{position:absolute;left:0;top:0;width:100%;height:100%;background:rgba(0,0,0,.75)}' +
                '.applecation-description-overlay__content{position:relative;max-width:70vw;margin:10vh auto 0 auto;background:rgba(20,20,20,.95);border-radius:1em;padding:2em}' +
                '.applecation-description-overlay__logo{margin-bottom:1em;display:none}' +
                '.applecation-description-overlay__logo img{max-width:30vw;max-height:120px;object-fit:contain}' +
                '.applecation-description-overlay__title{font-size:2em;margin-bottom:.6em}' +
                '.applecation-description-overlay__text{font-size:1.2em;line-height:1.5;color:rgba(255,255,255,.9)}' +
                '.applecation-description-overlay__details{display:flex;gap:2em;margin-top:1.5em;flex-wrap:wrap}' +
                '.applecation-description-overlay__info-name{opacity:.7;margin-bottom:.3em}' +
                '.applecation__quality-badges{margin-left:.8em;display:inline-flex;gap:.5em;align-items:center}' +
                '.quality-badge{display:inline-flex;align-items:center;justify-content:center;border:2px solid rgba(255,255,255,.45);border-radius:.35em;padding:.15em .45em;font-weight:700;font-size:.9em;line-height:1;color:#fff}' +
                '.quality-badge svg{height:1.05em;width:auto;display:block}';
            document.head.appendChild(style);
        }

        function isComponentActive(component) {
            return component && !component.__destroyed;
        }

        function ensureOverlayTemplate() {
            if (!Lampa.Template || !Lampa.Template.add) return;
            if (Lampa.Template.get && Lampa.Template.get('applecation_overlay', {}, true)) return;
            Lampa.Template.add('applecation_overlay',
                '<div class="applecation-description-overlay">' +
                '<div class="applecation-description-overlay__bg"></div>' +
                '<div class="applecation-description-overlay__content selector">' +
                '<div class="applecation-description-overlay__logo"></div>' +
                '<div class="applecation-description-overlay__title">{title}</div>' +
                '<div class="applecation-description-overlay__text">{text}</div>' +
                '<div class="applecation-description-overlay__details">' +
                '<div class="applecation-description-overlay__info"><div class="applecation-description-overlay__info-name">#{full_date_of_release}</div><div class="applecation-description-overlay__info-body">{relise}</div></div>' +
                '<div class="applecation-description-overlay__info applecation--budget"><div class="applecation-description-overlay__info-name">#{full_budget}</div><div class="applecation-description-overlay__info-body">{budget}</div></div>' +
                '<div class="applecation-description-overlay__info applecation--countries"><div class="applecation-description-overlay__info-name">#{full_countries}</div><div class="applecation-description-overlay__info-body">{countries}</div></div>' +
                '</div>' +
                '</div>' +
                '</div>'
            );
        }

        function waitForBackground(activity, callback) {
            var background = activity.render().find('.full-start__background:not(.applecation__overlay)');
            if (!background.length) return callback();
            if (background.hasClass('loaded') && background.hasClass('applecation-animated')) return callback();
            if (background.hasClass('loaded')) {
                return setTimeout(function () {
                    background.addClass('applecation-animated');
                    callback();
                }, 350);
            }
            var interval = setInterval(function () {
                if (isComponentActive(activity)) {
                    if (background.hasClass('loaded')) {
                        clearInterval(interval);
                        setTimeout(function () {
                            if (isComponentActive(activity)) {
                                background.addClass('applecation-animated');
                                callback();
                            }
                        }, 650);
                    }
                } else {
                    clearInterval(interval);
                }
            }, 50);
            setTimeout(function () {
                clearInterval(interval);
                if (!background.hasClass('applecation-animated')) {
                    background.addClass('applecation-animated');
                    callback();
                }
            }, 2000);
        }

        function injectApplecationDom(activity) {
            var render = activity.render();
            render.addClass('applecation');

            var right = render.find('.full-start-new__right');
            if (!right.length) return;

            if (!right.find('.applecation__left').length) {
                var leftWrap = $('<div class="applecation__left"></div>');
                var logo = $('<div class="applecation__logo"></div>');
                var content = $('<div class="applecation__content-wrapper"></div>');
                var meta = $('<div class="applecation__meta"><div class="applecation__meta-left"><span class="applecation__network"></span><span class="applecation__meta-text"></span><div class="full-start__pg hide"></div></div></div>');
                var descWrap = $('<div class="applecation__description-wrapper"><div class="applecation__description"></div></div>');
                var info = $('<div class="applecation__info"></div>');

                leftWrap.append(logo);
                content.append(meta);
                leftWrap.append(content);
                content.append(descWrap);
                content.append(info);

                right.prepend(leftWrap);
            }

            var rateLine = render.find('.full-start-new__rate-line').first();
            if (rateLine.length) {
                rateLine.addClass('applecation__ratings');
                var metaNode = right.find('.applecation__meta');
                if (metaNode.length) rateLine.insertAfter(metaNode);
            }

            var bg = render.find('.full-start__background');
            if (bg.length && !bg.next('.applecation__overlay').length) {
                bg.after('<div class="full-start__background loaded applecation__overlay"></div>');
            }
        }

        function getTypeLabel(movie) {
            var lang = Lampa.Storage.get('language', 'ru');
            var isTv = !!movie.name;
            var map = {
                ru: isTv ? 'Сериал' : 'Фильм',
                en: isTv ? 'TV Series' : 'Movie',
                uk: isTv ? 'Серіал' : 'Фільм',
                be: isTv ? 'Серыял' : 'Фільм',
                bg: isTv ? 'Сериал' : 'Филм',
                cs: isTv ? 'Seriál' : 'Film',
                he: isTv ? 'סדרה' : 'סרט',
                pt: isTv ? 'Série' : 'Filme',
                zh: isTv ? '电视剧' : '电影'
            };
            return map[lang] || map.en;
        }

        function pluralSeasons(count) {
            var lang = Lampa.Storage.get('language', 'ru');
            if (['ru', 'uk', 'be', 'bg'].indexOf(lang) !== -1) {
                var t = [2, 0, 1, 1, 1, 2];
                var a = {
                    ru: ['сезон', 'сезона', 'сезонов'],
                    uk: ['сезон', 'сезони', 'сезонів'],
                    be: ['сезон', 'сезоны', 'сезонаў'],
                    bg: ['сезон', 'сезона', 'сезона']
                };
                var forms = (a[lang] || a.ru);
                return count + ' ' + forms[count % 100 > 4 && count % 100 < 20 ? 2 : t[Math.min(count % 10, 5)]];
            }
            if (lang === 'en') return count === 1 ? count + ' Season' : count + ' Seasons';
            if (lang === 'cs') return count === 1 || (count >= 2 && count <= 4) ? count + ' série' : count + ' sérií';
            if (lang === 'pt') return count === 1 ? count + ' Temporada' : count + ' Temporadas';
            if (lang === 'he') return count === 1 ? 'עונה ' + count : count + ' עונות';
            if (lang === 'zh') return count + ' 季';
            var key = Lampa.Lang.translate('full_season');
            return count === 1 ? count + ' ' + key : count + ' ' + key + 's';
        }

        function injectMeta(activity, movie) {
            var render = activity.render();
            var metaText = render.find('.applecation__meta-text');
            if (!metaText.length) return;
            var parts = [];
            parts.push(getTypeLabel(movie));
            if (movie.genres && movie.genres.length) {
                var g = movie.genres.slice(0, 2).map(function (x) { return Lampa.Utils.capitalizeFirstLetter(x.name); });
                parts = parts.concat(g);
            }
            metaText.html(parts.join(' · '));

            var networkNode = render.find('.applecation__network');
            if (networkNode.length) {
                if (movie.networks && movie.networks.length && movie.networks[0].logo_path) {
                    networkNode.html('<img src="' + Lampa.Api.img(movie.networks[0].logo_path, 'w200') + '" alt="' + movie.networks[0].name + '">');
                } else if (movie.production_companies && movie.production_companies.length && movie.production_companies[0].logo_path) {
                    networkNode.html('<img src="' + Lampa.Api.img(movie.production_companies[0].logo_path, 'w200') + '" alt="' + movie.production_companies[0].name + '">');
                } else {
                    networkNode.remove();
                }
            }
        }

        function injectDescription(activity, movie) {
            ensureOverlayTemplate();
            var render = activity.render();
            var text = (movie.overview || '');
            render.find('.applecation__description').text(text);

            var wrap = render.find('.applecation__description-wrapper');
            wrap.off('hover:enter');
            $('.applecation-description-overlay').remove();
            if (!text) return;

            var title = movie.title || movie.name;
            var dateStr = (movie.release_date || movie.first_air_date || '') + '';
            var rel = dateStr.length > 3 ? Lampa.Utils.parseTime(dateStr).full : (dateStr.length > 0 ? dateStr : Lampa.Lang.translate('player_unknown'));
            var budget = '$ ' + Lampa.Utils.numberWithSpaces(movie.budget || 0);
            var countries = (movie.production_countries ? movie.production_countries.map(function (c) {
                var key = 'country_' + c.iso_3166_1.toLowerCase();
                var t = Lampa.Lang.translate(key);
                return t !== key ? t : c.name;
            }) : []).join(', ');

            var overlay = $(Lampa.Template.get('applecation_overlay', {
                title: title,
                text: text,
                relise: rel,
                budget: budget,
                countries: countries
            }));

            if (!movie.budget || movie.budget === 0) overlay.find('.applecation--budget').remove();
            if (!countries) overlay.find('.applecation--countries').remove();
            $('body').append(overlay);
            overlay.data('controller-created', false);

            wrap.addClass('selector');
            if (Lampa.Controller && Lampa.Controller.collectionAppend) Lampa.Controller.collectionAppend(wrap);

            wrap.on('hover:enter', function () {
                var el = $('.applecation-description-overlay');
                if (!el.length) return;
                setTimeout(function () { el.addClass('show'); }, 10);

                if (!el.data('controller-created') && Lampa.Controller) {
                    var ctrl = {
                        toggle: function () {
                            Lampa.Controller.collectionSet(el);
                            Lampa.Controller.collectionFocus(el.find('.applecation-description-overlay__content'), el);
                        },
                        back: function () {
                            var ol = $('.applecation-description-overlay');
                            if (!ol.length) return;
                            ol.removeClass('show');
                            setTimeout(function () { Lampa.Controller.toggle('content'); }, 300);
                        }
                    };
                    Lampa.Controller.add('applecation_description', ctrl);
                    el.data('controller-created', true);
                }
                if (Lampa.Controller) Lampa.Controller.toggle('applecation_description');
            });
        }

        function injectInfo(activity, movie) {
            var render = activity.render();
            var info = render.find('.applecation__info');
            if (!info.length) return;
            var parts = [];
            var date = movie.release_date || movie.first_air_date || '';
            if (date) parts.push(date.split('-')[0]);
            if (movie.name) {
                if (movie.episode_run_time && movie.episode_run_time.length) {
                    var m = movie.episode_run_time[0];
                    var tm = Lampa.Lang.translate('time_m').replace('.', '');
                    parts.push(m + ' ' + tm);
                }
                var seasons = Lampa.Utils.countSeasons(movie);
                if (seasons) parts.push(pluralSeasons(seasons));
            } else if (movie.runtime && movie.runtime > 0) {
                var h = Math.floor(movie.runtime / 60);
                var mm = movie.runtime % 60;
                var th = Lampa.Lang.translate('time_h').replace('.', '');
                var tmm = Lampa.Lang.translate('time_m').replace('.', '');
                parts.push(h > 0 ? (h + ' ' + th + ' ' + mm + ' ' + tmm) : (mm + ' ' + tmm));
            }
            info.html((parts.length ? parts.join(' · ') : '') + '<span class="applecation__quality-badges"></span>');
        }

        function getQualityLabels(movie, activity) {
            if (!movie || !Lampa.Storage.field('parser_use')) return;
            if (!Lampa.Parser || typeof Lampa.Parser.get !== 'function') return;

            var title = movie.title || movie.name || 'Неизвестно';
            var year = ((movie.first_air_date || movie.release_date || '0000') + '').slice(0, 4);
            var key = {
                df: movie.original_title,
                df_year: movie.original_title + ' ' + year,
                df_lg: movie.original_title + ' ' + movie.title,
                df_lg_year: movie.original_title + ' ' + movie.title + ' ' + year,
                lg: movie.title,
                lg_year: movie.title + ' ' + year,
                lg_df: movie.title + ' ' + movie.original_title,
                lg_df_year: movie.title + ' ' + movie.original_title + ' ' + year
            }[Lampa.Storage.field('parse_lang')] || movie.title;

            Lampa.Parser.get({ search: key, movie: movie, page: 1 }, function (data) {
                if (!isComponentActive(activity)) return;
                if (!data || !data.Results || data.Results.length === 0) return;

                var acc = { resolutions: new Set(), hdr: new Set(), audio: new Set(), hasDub: false };
                data.Results.forEach(function (item) {
                    if (item.ffprobe && Array.isArray(item.ffprobe)) {
                        var video = item.ffprobe.find(function (x) { return x.codec_type === 'video'; });
                        if (video) {
                            var resLabel = null;
                            if (video.width && video.height) {
                                if (video.height >= 2160 || video.width >= 3840) resLabel = '4K';
                                else if (video.height >= 1440 || video.width >= 2560) resLabel = '2K';
                                else if (video.height >= 1080 || video.width >= 1920) resLabel = 'FULL HD';
                                else if (video.height >= 720 || video.width >= 1280) resLabel = 'HD';
                            }
                            if (resLabel) acc.resolutions.add(resLabel);
                            if (video.side_data_list) {
                                var hasMd = video.side_data_list.some(function (x) { return x.side_data_type === 'Mastering display metadata'; });
                                var hasCl = video.side_data_list.some(function (x) { return x.side_data_type === 'Content light level metadata'; });
                                var hasDv = video.side_data_list.some(function (x) { return x.side_data_type === 'DOVI configuration record' || x.side_data_type === 'Dolby Vision RPU'; });
                                if (hasDv) {
                                    acc.hdr.add('Dolby Vision');
                                } else if (hasMd || hasCl) {
                                    acc.hdr.add('HDR');
                                }
                            }
                            if (!acc.hdr.size && video.color_transfer && ['smpte2084', 'arib-std-b67'].indexOf((video.color_transfer || '').toLowerCase()) !== -1) {
                                acc.hdr.add('HDR');
                            }
                            if (!acc.hdr.size && video.codec_name && ((video.codec_name || '').toLowerCase().indexOf('dovi') !== -1 || (video.codec_name || '').toLowerCase().indexOf('dolby') !== -1)) {
                                acc.hdr.add('Dolby Vision');
                            }
                        }

                        var audios = item.ffprobe.filter(function (x) { return x.codec_type === 'audio'; });
                        var ch = 0;
                        audios.forEach(function (a) { if (a.channels && a.channels > ch) ch = a.channels; });
                        if (ch >= 8) acc.audio.add('7.1');
                        else if (ch >= 6) acc.audio.add('5.1');
                        else if (ch >= 4) acc.audio.add('4.0');
                        else if (ch >= 2) acc.audio.add('2.0');

                        if (!acc.hasDub) {
                            item.ffprobe.filter(function (x) { return x.codec_type === 'audio' && x.tags; }).forEach(function (a) {
                                var lang = ((a.tags.language || '') + '').toLowerCase();
                                var nm = ((a.tags.title || a.tags.handler_name || '') + '').toLowerCase();
                                if ((lang === 'rus' || lang === 'ru' || lang === 'russian') && (nm.indexOf('dub') !== -1 || nm.indexOf('дубляж') !== -1 || nm.indexOf('дублир') !== -1 || nm === 'd')) {
                                    acc.hasDub = true;
                                }
                            });
                        }
                    }

                    var titleLower = ((item.Title || '') + '').toLowerCase();
                    if (titleLower.indexOf('dolby vision') !== -1 || titleLower.indexOf('dovi') !== -1 || /\bdv\b/.test(titleLower)) acc.hdr.add('Dolby Vision');
                    if (titleLower.indexOf('hdr10+') !== -1) acc.hdr.add('HDR10+');
                    if (titleLower.indexOf('hdr10') !== -1) acc.hdr.add('HDR10');
                    if (titleLower.indexOf('hdr') !== -1) acc.hdr.add('HDR');
                });

                var badges = [];
                if (acc.resolutions.size) {
                    var order = ['8K', '4K', '2K', 'FULL HD', 'HD'];
                    for (var i = 0; i < order.length; i++) {
                        if (acc.resolutions.has(order[i])) {
                            badges.push('<div class="quality-badge quality-badge--res">' + order[i] + '</div>');
                            break;
                        }
                    }
                }
                if (acc.hdr.size) {
                    if (acc.hdr.has('Dolby Vision')) badges.push('<div class="quality-badge quality-badge--dv">Dolby Vision</div>');
                    else if (acc.hdr.has('HDR10+')) badges.push('<div class="quality-badge quality-badge--hdr">HDR10+</div>');
                    else if (acc.hdr.has('HDR10')) badges.push('<div class="quality-badge quality-badge--hdr">HDR10</div>');
                    else badges.push('<div class="quality-badge quality-badge--hdr">HDR</div>');
                }
                if (acc.audio.size) {
                    var aOrder = ['7.1', '5.1', '4.0', '2.0'];
                    for (var j = 0; j < aOrder.length; j++) {
                        if (acc.audio.has(aOrder[j])) {
                            badges.push('<div class="quality-badge quality-badge--sound">' + aOrder[j] + '</div>');
                            break;
                        }
                    }
                }
                if (acc.hasDub) badges.push('<div class="quality-badge quality-badge--dub">DUB</div>');

                var target = activity.render().find('.applecation__quality-badges');
                if (!target.length) return;
                if (badges.length) target.html(badges.join(''));
            }, function () { });
        }

        function loadLogo(activity, movie) {
            var render = activity.render();
            var logo = render.find('.applecation__logo');
            var titleEl = render.find('.full-start-new__title');

            var type = movie.name ? 'tv' : 'movie';
            var url = Lampa.TMDB.api(type + '/' + movie.id + '/images?api_key=' + Lampa.TMDB.key() + '&language=' + Lampa.Storage.get('language'));
            $.get(url, function (data) {
                if (!isComponentActive(activity)) return;
                if (data && data.logos && data.logos[0]) {
                    var p = data.logos[0].file_path;
                    var imgUrl = Lampa.TMDB.image('/t/p/w500' + p);
                    var img = new Image();
                    img.onload = function () {
                        if (!isComponentActive(activity)) return;
                        logo.html('<img src="' + imgUrl + '" alt="" />');
                        waitForBackground(activity, function () { if (isComponentActive(activity)) logo.addClass('loaded'); });
                        var overlay = $('.applecation-description-overlay');
                        if (overlay.length) {
                            overlay.find('.applecation-description-overlay__logo').html($('<img>').attr('src', imgUrl)).css('display', 'block');
                            overlay.find('.applecation-description-overlay__title').css('display', 'none');
                        }
                    };
                    img.src = imgUrl;
                } else {
                    titleEl.show();
                    waitForBackground(activity, function () { if (isComponentActive(activity)) logo.addClass('loaded'); });
                }
            }).fail(function () {
                titleEl.show();
                waitForBackground(activity, function () { if (isComponentActive(activity)) logo.addClass('loaded'); });
            });
        }

        function bindScrollDim(activity) {
            var render = activity.render();
            var bg = render.find('.full-start__background:not(.applecation__overlay)')[0];
            var scroll = render.find('.scroll__body')[0];
            if (!bg || !scroll) return;

            var dim = false;
            var desc = Object.getOwnPropertyDescriptor(scroll.style, '-webkit-transform') || Object.getOwnPropertyDescriptor(CSSStyleDeclaration.prototype, 'webkitTransform');
            Object.defineProperty(scroll.style, '-webkit-transform', {
                set: function (v) {
                    if (v) {
                        var s = v.indexOf(',') + 1;
                        var e = v.indexOf(',', s);
                        if (s > 0 && e > s) {
                            var isDown = parseFloat(v.substring(s, e)) < 0;
                            if (isDown !== dim) {
                                dim = isDown;
                                bg.classList.toggle('dim', isDown);
                            }
                        }
                    }
                    if (desc && desc.set) desc.set.call(this, v);
                    else this.setProperty('-webkit-transform', v);
                },
                get: function () {
                    return desc && desc.get ? desc.get.call(this) : this.getPropertyValue('-webkit-transform');
                },
                configurable: true
            });
        }

        function applyMarquee(activity) {
            var render = activity.render();
            var names = render.find('.full-person__name');

            function overflow(el) {
                return el.scrollWidth > el.clientWidth + 1;
            }

            names.each(function () {
                var n = $(this);
                if (n.hasClass('marquee-processed')) {
                    var t = n.find('span').first().text();
                    if (t) {
                        n.text(t);
                        n.removeClass('marquee-processed marquee-active');
                        n.css('--marquee-duration', '');
                    }
                }
            });

            setTimeout(function () {
                if (!isComponentActive(activity)) return;
                names.each(function () {
                    var n = $(this);
                    var txt = n.text().trim();
                    if (!txt) return;
                    if (overflow(n[0])) {
                        var dur = Math.min(Math.max(0.25 * txt.length, 5), 20);
                        n.addClass('marquee-processed marquee-active');
                        n.css('--marquee-duration', dur + 's');
                        var s1 = $('<span>').text(txt);
                        var s2 = $('<span>').text(txt);
                        var inner = $('<div class="marquee__inner">').append(s1).append(s2);
                        n.empty().append(inner);
                    } else {
                        n.addClass('marquee-processed');
                    }
                });
            }, 100);
        }

        Lampa.Listener.follow('full', function (e) {
            if (e.type !== 'complite') return;
            var activity = e.object && e.object.activity;
            if (!activity || !activity.render) return;
            var render = activity.render();
            activity.__destroyed = false;
            var oldDestroy = activity.destroy;
            activity.destroy = function () {
                activity.__destroyed = true;
                if (oldDestroy) oldDestroy.apply(activity, arguments);
            };

            injectApplecationDom(activity);

            var movie = e.data && e.data.movie;
            if (!movie) return;

            injectMeta(activity, movie);
            injectDescription(activity, movie);
            injectInfo(activity, movie);
            bindScrollDim(activity);
            applyMarquee(activity);
            getQualityLabels(movie, activity);
            loadLogo(activity, movie);

            waitForBackground(activity, function () {
                if (!isComponentActive(activity)) return;
                render.find('.applecation__meta').addClass('show');
                render.find('.applecation__description-wrapper').addClass('show');
                render.find('.applecation__info').addClass('show');
                render.find('.applecation__ratings').addClass('show');
            });
        });
    }

   
                
    
        function ensureTmdbDetails(movie, callback) {
            if (!movie || !movie.id) return callback(movie);

            var hasGenres = movie.genres && movie.genres.length;
            var hasOverview = typeof movie.overview === 'string' && movie.overview.length > 0;
            var hasRuntime = (movie.runtime && movie.runtime > 0) || (movie.episode_run_time && movie.episode_run_time.length);
            var hasCompanies = movie.networks || movie.production_companies;

            if (hasGenres && hasOverview && hasRuntime && hasCompanies) return callback(movie);

            var type = movie.name ? 'tv' : 'movie';
            var lang = Lampa.Storage.get('language') || 'ru';
            var url = Lampa.TMDB.api(type + '/' + movie.id + '?api_key=' + Lampa.TMDB.key() + '&language=' + lang);
            $.get(url, function (data) {
                if (!data) return callback(movie);
                var merged = $.extend(true, {}, movie, data);
                callback(merged);
            }).fail(function () {
                callback(movie);
            });
        }

        function removeDefaultDetails(render) {
            if (!render) return;
            render.find('.full-descr').remove();
            render.find('.full-descr__title').remove();
            render.find('.full-start__head').remove();
            render.find('.full-start-new__head').remove();
            render.find('.full-start__details').remove();
            render.find('.full-start__details-more').remove();
            render.find('.full-start__info').remove();
            render.find('.full-start__tags').remove();
            render.find('.full-start__genres').remove();
            render.find('.full-start__company').remove();
            render.find('.full-start__countries').remove();

            var detailTitles = {
                ru: 'Подробно',
                uk: 'Докладно',
                en: 'Details'
            };
            var lang = (Lampa.Storage && Lampa.Storage.get) ? (Lampa.Storage.get('language', 'ru') || 'ru') : 'ru';
            var key = (lang + '').toLowerCase().indexOf('uk') === 0 ? 'uk' : ((lang + '').toLowerCase().indexOf('en') === 0 ? 'en' : 'ru');
            var targetTitle = detailTitles[key] || detailTitles.ru;

            render.find('.items-line').each(function () {
                var line = $(this);
                var title = line.find('.items-line__head .items-line__title').first().text().trim();
                if (title === targetTitle) line.remove();
            });
        }

        function fillPoster(render, movie) {
            try {
                if (!render || !movie) return;
                var posterPath = movie.poster_path;
                if (!posterPath) return;

                var imgEl = render.find('.full--poster').first();
                if (!imgEl.length) return;
                if (imgEl.attr('src')) return;

                var url = null;
                if (Lampa.Api && typeof Lampa.Api.img === 'function') {
                    var posterSize = (Lampa.Storage && Lampa.Storage.field) ? Lampa.Storage.field('poster_size') : null;
                    url = Lampa.Api.img(posterPath, posterSize || 'w300');
                } else if (Lampa.TMDB && typeof Lampa.TMDB.image === 'function') {
                    url = Lampa.TMDB.image('/t/p/w300' + posterPath);
                } else {
                    url = 'https://image.tmdb.org/t/p/w300' + posterPath;
                }

                if (url) imgEl.attr('src', url);
            } catch (e) { }
        }

        Lampa.Listener.follow('full', function (e) {
            if (e.type !== 'complite') return;
            var activity = e.object && e.object.activity;
            if (!activity || !activity.render) return;
            var render = activity.render();
            if (!render || !render.length) return;
            if (!render.find('.applecation__meta-text, .applecation__description, .applecation__info').length) return;

            var posterSize = Lampa.Storage.field ? Lampa.Storage.field('poster_size') : null;
            render.toggleClass('applecation--poster-high', posterSize === 'w500');

            var movie = e.data && e.data.movie;
            if (!movie) return;

            ensureTmdbDetails(movie, function (m) {
                insertOverlayBackground(render);
                fillMeta(render, m);
                fillStudios(render, m);
                fillDescription(render, m);
                fillInfo(render, m);
                updateQualityBadges(render, m);
                removeDefaultDetails(render);
                fillPoster(render, m);

                try {
                    if (window.matchMedia && window.matchMedia('(max-width: 720px)').matches) {
                        render.find('.full-start-new__left').removeClass('hide');
                    }
                } catch (e) { }

                render.find('.applecation__meta').addClass('show');
                render.find('.applecation__studios').addClass('show');
                render.find('.applecation__description-wrapper').addClass('show');
                render.find('.applecation__info').addClass('show');
                render.find('.full-start-new__rate-line.applecation__ratings').addClass('show');
            });
        });
    }

    function runInit() {
        try {
            initAppleTvFullCardBuiltIn();
            initAppleTvFullCardLogoRuntime();
            initAppleTvFullCardInfoRuntime();
            initMaxsmRatingsIntegration();
            initMarksJacRed();
            init();
            window.FLIXIO_STUDIOS_LOADED = true;
        } catch (err) {
            window.FLIXIO_STUDIOS_ERROR = (err && err.message) ? err.message : String(err);
            if (typeof console !== 'undefined' && console.error) {
                console.error('[Flixio Studios]', err);
            }
        }
    }

    if (window.appready) runInit();
    else if (typeof Lampa !== 'undefined' && Lampa.Listener && Lampa.Listener.follow) {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') runInit();
        });
    } else {
        window.FLIXIO_STUDIOS_ERROR = 'Lampa.Listener not found';
    }

})();
