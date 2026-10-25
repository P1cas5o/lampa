//orig  https://yarikrazor-star.github.io/lmp/redaktor.js
// автор https://t.me/Yaroslav_Films
(function() {
    'use strict';

    // ==========================================
    // СТИЛІ РЕДАКТОРА (З АДАПТАЦІЄЮ ПІД МОБІЛЬНІ ТА БЕКДРОПИ) 1.0.2.0 — додано відображення розміру кешу+мод
    // ==========================================
    $('head').append('<style>' +
        '.cache-editor-module { width: 100%; height: 100%; display: flex; flex-direction: column; overflow: hidden; padding: 10px; box-sizing: border-box; }' +
        '.cache-editor-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 15px; padding: 10px 10px 50px 10px; width: 100%; box-sizing: border-box; }' + 
        '.cache-card { background: rgba(255,255,255,0.08); border-radius: 12px; height: 160px; padding: 15px; display: flex; flex-direction: column; justify-content: center; align-items: center; border: 3px solid transparent; transition: transform 0.2s; cursor: pointer; overflow: hidden; box-sizing: border-box; position: relative; }' +
        '.cache-card.focus { background: #fff !important; transform: scale(1.08); z-index: 2; position: relative; border-color: #fff; box-shadow: 0 10px 20px rgba(0,0,0,0.4); }' +
        '.cache-card.focus .cc-title, .cache-card.focus .cc-subtitle, .cache-card.focus .cc-desc { color: #000 !important; text-shadow: none !important; }' +
        '.cc-title { font-weight: bold; font-size: 1.15em; margin-bottom: 5px; color: #fff; width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-align: center; position: relative; z-index: 2; }' +
        '.cc-subtitle { font-size: 0.75em; color: #888; margin-bottom: 10px; width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-align: center; position: relative; z-index: 2; }' +
        '.cc-desc { font-size: 0.95em; font-weight: bold; color: #aaa; width: 100%; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; text-align: center; word-break: break-word; position: relative; z-index: 2; }' +
        '.cc-bg-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.95)); z-index: 1; }' +
        '.cache-card.has-bg .cc-title { text-shadow: 1px 1px 3px rgba(0,0,0,0.9); }' +
        '.cache-card.has-bg .cc-subtitle { color: #bbb; text-shadow: 1px 1px 2px rgba(0,0,0,0.9); }' +
        '.cache-card.has-bg .cc-desc { color: #ddd; text-shadow: 1px 1px 3px rgba(0,0,0,0.9); }' +
        '.cache-card.control-card { border: 2px dashed rgba(255,255,255,0.35); background: rgba(255,255,255,0.03); height: 90px; }' +
        '.cache-card.control-card.focus { border-color: #fff; }' +
        '.cache-card.control-card .cc-title { font-size: 1.05em; }' +
        '.cache-card.control-card .cc-desc { color: #999; font-weight: normal; font-size: 0.8em; }' +
        '.cache-card.control-card.focus .cc-desc { color: #555 !important; }' +
        '.cache-card.control-danger { border-color: rgba(255,120,120,0.5); }' +
        '.cc-bar-outer { width: 100%; height: 6px; background: rgba(255,255,255,0.15); border-radius: 3px; margin-top: 8px; overflow: hidden; position: relative; z-index: 2; }' +
        '.cc-bar-inner { height: 100%; border-radius: 3px; transition: width 0.3s; }' +
        '.cache-chart-card { grid-column: 1 / -1; background: rgba(255,255,255,0.04); border-radius: 12px; padding: 15px 18px; box-sizing: border-box; }' +
        '.cc-chart-title { font-weight: bold; margin-bottom: 12px; font-size: 1em; color: #fff; }' +
        '.cc-chart-row { display: flex; align-items: center; gap: 10px; margin-bottom: 9px; }' +
        '.cc-chart-row:last-child { margin-bottom: 0; }' +
        '.cc-chart-label { width: 130px; flex-shrink: 0; font-size: 0.85em; color: #ccc; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }' +
        '.cc-chart-track { flex: 1; height: 10px; background: rgba(255,255,255,0.1); border-radius: 5px; overflow: hidden; }' +
        '.cc-chart-fill { height: 100%; border-radius: 5px; background: linear-gradient(to right, #4caf50, #8bc34a); }' +
        '.cc-chart-value { width: 72px; flex-shrink: 0; text-align: right; font-size: 0.8em; color: #999; }' +
        '@media (max-width: 768px), (orientation: portrait) { ' +
            '.cache-editor-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 10px; padding: 10px 10px 50px 10px; } ' +
            '.cache-card { height: 130px; padding: 10px; } ' +
            '.cc-title { font-size: 1em; margin-bottom: 2px; } ' +
            '.cc-subtitle { font-size: 0.65em; margin-bottom: 5px; } ' +
            '.cc-desc { font-size: 0.85em; -webkit-line-clamp: 2; } ' +
            '.cc-chart-label { width: 80px; font-size: 0.75em; } ' +
            '.cc-chart-value { width: 55px; font-size: 0.72em; } ' +
        '}' +
    '</style>');

    // ==========================================
    // ЛОГІКА КОМПОНЕНТА РЕДАКТОРА
    // ==========================================
    function initCacheEditorActivity() {
        if (Lampa.Component.get('cache_editor_grid')) return;

        Lampa.Component.add('cache_editor_grid', function(object) {
            var self = this;
            var html = $('<div class="cache-editor-module"></div>');
            var scroll = new Lampa.Scroll({ mask: true, over: true, scroll_by_item: true });
            var grid = $('<div class="cache-editor-grid"></div>');
            
            var action_busy = false;
            var search_query = '';
            var render_limit = 60;
            var PAGE_SIZE = 60;
            var metaCache = {};

            this.create = function() {
                purgeOldTrash();
                this.buildData();
                html.append(scroll.render());
                return this.render();
            };

            // Алгоритм хешування Lampa (Java String.hashCode)
            var localHash = function(str) {
                if (window.Lampa && window.Lampa.Utils && typeof window.Lampa.Utils.hash === 'function') {
                    return String(window.Lampa.Utils.hash(str));
                }
                str = String(str);
                var hash = 0;
                for (var i = 0; i < str.length; i++) {
                    var char = str.charCodeAt(i);
                    hash = ((hash << 5) - hash) + char;
                    hash |= 0; // Перетворення у 32-бітне ціле
                }
                return String(Math.abs(hash));
            };

            // ==========================================
            // РОЗРАХУНОК РОЗМІРУ ДАНИХ (БАЙТИ)
            // ==========================================
            // localStorage зберігає рядки у форматі UTF-16 (2 байти на символ) —
            // це наближена, але стандартна оцінка, яку використовують браузери для квоти.
            var byteSize = function(str) {
                str = String(str === null || str === undefined ? '' : str);
                return str.length * 2;
            };

            var formatBytes = function(bytes) {
                bytes = bytes || 0;
                if (bytes < 1024) return bytes + ' Б';
                if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' КБ';
                return (bytes / (1024 * 1024)).toFixed(2) + ' МБ';
            };

            // Розмір одного запису localStorage (ключ + значення)
            var getKeyByteSize = function(key) {
                return byteSize(key) + byteSize(localStorage.getItem(key));
            };

            var getTotalStorageBytes = function() {
                var total = 0;
                for (var i = 0; i < localStorage.length; i++) {
                    var k = localStorage.key(i);
                    if (!k || isTechnicalKey(k)) continue;
                    total += getKeyByteSize(k);
                }
                return total;
            };

            // ==========================================
            // СЛУЖБОВІ КЛЮЧІ, КОШИК ТА СОРТУВАННЯ/ФІЛЬТР
            // ==========================================
            var TRASH_KEY = 'lampaCacheEditorTrash';
            var TRASH_RETENTION_DAYS = 7;
            var TRASH_MAX_ITEMS = 300;
            var STORAGE_QUOTA_BYTES = 4.88 * 1024 * 1024; // орієнтовний ліміт localStorage (~5 МБ у більшості браузерів)
            var TECHNICAL_KEYS = [TRASH_KEY];

            var sort_mode = 'size';  // 'size' | 'name' | 'date'
            var filter_min_kb = 0;   // мінімальний розмір запису для показу (КБ), 0 = без фільтра

            var isTechnicalKey = function(k) { return TECHNICAL_KEYS.indexOf(k) !== -1; };

            // --- Кошик: м'яке видалення з можливістю відновлення протягом 7 днів ---
            var getTrash = function() {
                try { return JSON.parse(localStorage.getItem(TRASH_KEY) || '[]') || []; } catch(e) { return []; }
            };
            var saveTrash = function(arr) {
                try { localStorage.setItem(TRASH_KEY, JSON.stringify(arr)); } catch(e) {}
            };
            var purgeOldTrash = function() {
                var arr = getTrash();
                var cutoff = Date.now() - TRASH_RETENTION_DAYS * 24 * 60 * 60 * 1000;
                var filtered = arr.filter(function(t) { return t && t.deletedAt >= cutoff; });
                if (filtered.length > TRASH_MAX_ITEMS) filtered = filtered.slice(filtered.length - TRASH_MAX_ITEMS);
                if (filtered.length !== arr.length) saveTrash(filtered);
                return filtered;
            };
            var pushToTrash = function(entry) {
                var arr = purgeOldTrash();
                entry.id = 't_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
                entry.deletedAt = Date.now();
                arr.push(entry);
                if (arr.length > TRASH_MAX_ITEMS) arr = arr.slice(arr.length - TRASH_MAX_ITEMS);
                saveTrash(arr);
                return entry;
            };
            var removeFromTrash = function(id) {
                saveTrash(getTrash().filter(function(t) { return t.id !== id; }));
            };
            var restoreTrashEntry = function(entry) {
                if (entry.type === 'key') {
                    localStorage.setItem(entry.payload.key, entry.payload.value);
                } else if (entry.type === 'group') {
                    entry.payload.items.forEach(function(it) { localStorage.setItem(it.key, it.value); });
                } else if (entry.type === 'json_item') {
                    var raw = localStorage.getItem(entry.payload.storageKey);
                    var obj = {};
                    try { obj = JSON.parse(raw) || {}; } catch(e) {}
                    obj[entry.payload.itemKey] = entry.payload.itemValue;
                    localStorage.setItem(entry.payload.storageKey, JSON.stringify(obj));
                } else if (entry.type === 'json_bulk') {
                    var raw2 = localStorage.getItem(entry.payload.storageKey);
                    var obj2 = {};
                    try { obj2 = JSON.parse(raw2) || {}; } catch(e) {}
                    for (var kk in entry.payload.items) obj2[kk] = entry.payload.items[kk];
                    localStorage.setItem(entry.payload.storageKey, JSON.stringify(obj2));
                }
                removeFromTrash(entry.id);
            };

            // --- Пошук дублікатів вмісту (однакові значення під різними ключами) ---
            this.findDuplicateSets = function() {
                var map = {};
                for (var i = 0; i < localStorage.length; i++) {
                    var k = localStorage.key(i);
                    if (!k || isTechnicalKey(k)) continue;
                    var val = localStorage.getItem(k) || '';
                    if (val.length < 20) continue; // ігноруємо тривіальні короткі значення (шум)
                    var hk = val.length + '_' + localHash(val);
                    if (!map[hk]) map[hk] = [];
                    map[hk].push(k);
                }
                var sets = [];
                for (var hkKey in map) {
                    var candidates = map[hkKey];
                    if (candidates.length < 2) continue;
                    var refVal = localStorage.getItem(candidates[0]);
                    // Перевіряємо справжню рівність значень (захист від колізій хешу)
                    var confirmed = candidates.filter(function(kk) { return localStorage.getItem(kk) === refVal; });
                    if (confirmed.length > 1) sets.push({ id: hkKey, keys: confirmed, valueSize: byteSize(refVal) });
                }
                sets.sort(function(a, b) { return (b.keys.length * b.valueSize) - (a.keys.length * a.valueSize); });
                return sets;
            };

            // ==========================================
            // ДЕШИФРУВАННЯ ТА ГЛИБОКИЙ ПОШУК МЕТАДАНИХ
            // ==========================================
            this.findMetaForHash = function(hash) {
                var hashStr = String(hash);
                // Дефолтні значення на випадок, якщо реліз взагалі видалено з пам'яті
                var meta = { title: 'Невідомий файл', bg: null, subtitle: 'Хеш: ' + hashStr };

                // 1. Збираємо всі унікальні картки фільмів/серіалів із локальної пам'яті
                var cards = [];
                var addCard = function(c) {
                    if (!c || typeof c !== 'object') return;
                    cards.push(c);
                    if (c.card) cards.push(c.card);
                    if (c.movie) cards.push(c.movie);
                };

                // Збираємо з Історії
                var hist = Lampa.Storage.get('history', []);
                if (Array.isArray(hist)) hist.forEach(addCard);

                // Збираємо з Обраного
                var fav = Lampa.Storage.get('favorite', {});
                for (var fKey in fav) {
                    if (Array.isArray(fav[fKey])) fav[fKey].forEach(addCard);
                }

                // Збираємо з Онлайн переглядів
                var ov = Lampa.Storage.get('online_view', {});
                for (var oKey in ov) { addCard(ov[oKey]); }

                // Збираємо з Торрентів
                var tv = Lampa.Storage.get('torrents_view', {});
                for (var tKey in tv) { addCard(tv[tKey]); }

                // Дедуплікація за Назвами та ID
                var uniqueCards = [];
                var seenKeys = {};
                cards.forEach(function(c) {
                    var uniqKey = (c.original_title || c.original_name || c.title || c.name || '') + '_' + (c.id || '');
                    if (uniqKey && !seenKeys[uniqKey]) {
                        seenKeys[uniqKey] = true;
                        uniqueCards.push(c);
                    }
                });

                // 2. Метод А: Спроба розпізнати хеш за формулами Lampa.Utils.hash() (Перебір варіантів)
                for (var i = 0; i < uniqueCards.length; i++) {
                    var card = uniqueCards[i];
                    
                    var origTitle = card.original_title || '';
                    var origName = card.original_name || card.original_title || '';
                    var localTitle = card.title || card.name || '';

                    // А. Перевірка Фільмів (по оригінальній та локальній назві)
                    var checkMovieTitle = function(t) {
                        if (!t) return false;
                        if (localHash(t) === hashStr) {
                            meta.title = card.title || card.name || t;
                            meta.subtitle = 'Фільм (ID: ' + (card.id || 'Невідомо') + ')';
                            var imgPath = card.backdrop_path || card.poster_path;
                            if (imgPath) meta.bg = imgPath.indexOf('http') === 0 ? imgPath : 'https://image.tmdb.org/t/p/w300' + imgPath;
                            return true;
                        }
                        return false;
                    };
                    if (checkMovieTitle(origTitle)) return meta;
                    if (checkMovieTitle(localTitle)) return meta;

                    // Б. Перевірка Серіалів (Загальний прогрес: 1 + серія + назва)
                    // Шукаємо по епізодах від 1 до 50
                    var checkSerialProgress = function(nameStr) {
                        if (!nameStr) return false;
                        for (var ep = 1; ep <= 50; ep++) {
                            var checkStr = [1, ep, nameStr].join('');
                            if (localHash(checkStr) === hashStr) {
                                meta.title = (card.title || card.name || nameStr) + ' (Серія ' + ep + ')';
                                meta.subtitle = 'Серіал (ID: ' + (card.id || 'Невідомо') + ')';
                                var imgPath = card.backdrop_path || card.poster_path;
                                if (imgPath) meta.bg = imgPath.indexOf('http') === 0 ? imgPath : 'https://image.tmdb.org/t/p/w300' + imgPath;
                                return true;
                            }
                        }
                        return false;
                    };
                    if (checkSerialProgress(origName)) return meta;
                    if (checkSerialProgress(localTitle)) return meta;

                    // В. Перевірка конкретних Епізодів серіалів (сезон + роздільник + серія + назва)
                    // Seasons 1-20, Episodes 1-60
                    var checkSerialEpisodes = function(nameStr) {
                        if (!nameStr) return false;
                        for (var s = 1; s <= 20; s++) {
                            var delimiter = s > 10 ? ':' : '';
                            for (var e = 1; e <= 60; e++) {
                                var checkStr = [s, delimiter, e, nameStr].join('');
                                if (localHash(checkStr) === hashStr) {
                                    meta.title = (card.title || card.name || nameStr) + ' (Сезон ' + s + ', Серія ' + e + ')';
                                    meta.subtitle = 'Серіал (ID: ' + (card.id || 'Невідомо') + ')';
                                    var imgPath = card.backdrop_path || card.poster_path;
                                    if (imgPath) meta.bg = imgPath.indexOf('http') === 0 ? imgPath : 'https://image.tmdb.org/t/p/w300' + imgPath;
                                    return true;
                                }
                            }
                        }
                        return false;
                    };
                    if (checkSerialEpisodes(origName)) return meta;
                    if (checkSerialEpisodes(localTitle)) return meta;
                }

                // 3. Метод Б: Агресивний текстовий пошук у localStorage (для нетипових плагінів та балансерів)
                for (var j = 0; j < localStorage.length; j++) {
                    var key = localStorage.key(j);
                    if (key === object.storage_key) continue;

                    var val = localStorage.getItem(key);
                    if (!val || val.indexOf(hashStr) === -1) continue;

                    try {
                        var parsed = JSON.parse(val);
                        if (typeof parsed === 'object' && parsed !== null) {
                            for (var mKey in parsed) {
                                var movie = parsed[mKey];
                                if (typeof movie === 'object' && movie !== null) {
                                    var movieStr = JSON.stringify(movie);
                                    if (movieStr.indexOf(hashStr) !== -1 || String(movie.id) === hashStr) {
                                        var title = movie.title || movie.name || movie.original_title || (movie.movie && (movie.movie.title || movie.movie.name));
                                        if (title) {
                                            meta.title = title;
                                            var source = key === 'online_view' ? 'Онлайн' : (key === 'torrents_view' ? 'Торрент' : (key === 'history' ? 'Історія' : 'Кеш'));
                                            meta.subtitle = source + ' (ID: ' + (movie.id || mKey) + ')';
                                            var imgPath = movie.backdrop_path || movie.poster_path || (movie.movie && movie.movie.backdrop_path);
                                            if (imgPath) {
                                                meta.bg = imgPath.indexOf('http') === 0 ? imgPath : 'https://image.tmdb.org/t/p/w300' + imgPath;
                                            }
                                            return meta;
                                        }
                                    }
                                }
                            }
                        }
                    } catch(e) {
                        if (hashStr.indexOf('http') === 0 && meta.title === 'Невідомий файл') {
                            try {
                                var parts = hashStr.split('/');
                                meta.title = decodeURIComponent(parts[parts.length - 1] || parts[parts.length - 2]);
                            } catch(err) {}
                        }
                    }
                }

                return meta;
            };

            // Кешування результатів пошуку метаданих, щоб не перераховувати хеші
            // повторно при пагінації/пошуку одного й того ж списку таймкодів
            var getMeta = function(k) {
                if (!metaCache[k]) metaCache[k] = self.findMetaForHash(k);
                return metaCache[k];
            };

            // Службова картка (пошук/очищення/показати ще) — без контекстного меню
            var addControlCard = function(title, desc, onEnter, opts) {
                opts = opts || {};
                var card = $('<div class="cache-card selector control-card' + (opts.danger ? ' control-danger' : '') + '"></div>');
                if (opts.wide) card.css('grid-column', '1 / -1');
                card.attr('data-id', '__ctrl_' + title);
                card.append($('<div class="cc-title"></div>').text(title));
                if (desc) card.append($('<div class="cc-desc"></div>').text(desc));

                // Смуга заповнення (напр. використання квоти localStorage)
                if (typeof opts.percent === 'number') {
                    var pct = Math.max(0, Math.min(100, opts.percent));
                    var barColor = pct < 60 ? '#4caf50' : (pct < 85 ? '#ffc107' : '#f44336');
                    var barOuter = $('<div class="cc-bar-outer"></div>');
                    var barInner = $('<div class="cc-bar-inner"></div>').css({ width: pct + '%', background: barColor });
                    barOuter.append(barInner);
                    card.append(barOuter);
                }

                card.on('hover:focus', function() { scroll.update(card); });
                card.on('hover:enter', function() {
                    if (action_busy) return;
                    action_busy = true; setTimeout(function() { action_busy = false; }, 300);
                    onEnter();
                });

                grid.append(card);
                return card;
            };

            // Простий горизонтальний бар-чарт розмірів топ-груп (без окремого фокусу — суто інформаційний)
            var buildSizeChartHtml = function(namesSortedBySize, sizeMap) {
                var top = namesSortedBySize.slice(0, 8);
                if (!top.length) return null;
                var maxB = sizeMap[top[0]] || 1;
                var rows = top.map(function(name) {
                    var bytes = sizeMap[name] || 0;
                    var pct = Math.max(4, Math.round((bytes / maxB) * 100));
                    var safeName = name.length > 18 ? name.substring(0, 18) + '…' : name;
                    return '<div class="cc-chart-row">' +
                            '<div class="cc-chart-label">' + safeName + '</div>' +
                            '<div class="cc-chart-track"><div class="cc-chart-fill" style="width:' + pct + '%"></div></div>' +
                            '<div class="cc-chart-value">' + formatBytes(bytes) + '</div>' +
                        '</div>';
                }).join('');
                return '<div class="cache-chart-card"><div class="cc-chart-title">📈 Топ груп за розміром</div>' + rows + '</div>';
            };

            // Фільтр за мінімальним розміром запису (КБ)
            this.openSizeFilter = function() {
                Lampa.Input.edit({ title: 'Мінімальний розмір, КБ (0 = без фільтра)', value: String(filter_min_kb || 0), free: true, nosave: true }, function(val) {
                    var num = parseFloat(val);
                    filter_min_kb = (isNaN(num) || num < 0) ? 0 : num;
                    render_limit = PAGE_SIZE;
                    self.buildData();
                    setTimeout(function() { Lampa.Controller.toggle('content'); }, 100);
                });
            };

            var sortLabel = function() {
                if (sort_mode === 'size') return 'за розміром';
                if (sort_mode === 'date') return 'за датою';
                return 'за назвою';
            };

            // Додає парні картки керування сортуванням/фільтром; modes — доступні режими для цього рівня
            var addSortFilterControls = function(modes) {
                if (modes.indexOf(sort_mode) === -1) sort_mode = modes[0];
                addControlCard('🔀 Сортування: ' + sortLabel(), 'Натисніть, щоб змінити', function() {
                    var idx = modes.indexOf(sort_mode);
                    sort_mode = modes[(idx + 1) % modes.length];
                    self.buildData();
                });
                addControlCard('📏 Фільтр розміру' + (filter_min_kb > 0 ? ': > ' + filter_min_kb + ' КБ' : ': вимкнено'), 'Натисніть, щоб змінити поріг', function() {
                    self.openSizeFilter();
                });
            };

            this.openSearch = function() {
                Lampa.Input.edit({ title: 'Пошук', value: search_query, free: true, nosave: true }, function(val) {
                    search_query = (val === undefined || val === null) ? '' : String(val).trim();
                    render_limit = PAGE_SIZE;
                    self.buildData();
                    setTimeout(function() { Lampa.Controller.toggle('content'); }, 100);
                });
            };

            this.clearSearch = function() {
                search_query = '';
                render_limit = PAGE_SIZE;
                self.buildData();
                Lampa.Controller.toggle('content');
            };

            // Масове очищення таймкодів: повністю переглянуті або "невідомі" (без метаданих)
            this.bulkCleanup = function(mode) {
                var rawJson = localStorage.getItem(object.storage_key);
                var parsedObj = {};
                try { parsedObj = JSON.parse(rawJson) || {}; } catch (e) {}

                var toDelete = [];
                Object.keys(parsedObj).forEach(function(k) {
                    var item = parsedObj[k];
                    if (mode === 'watched') {
                        if (item && typeof item.percent === 'number' && item.percent >= 95) toDelete.push(k);
                    } else if (mode === 'orphan') {
                        var meta = getMeta(k);
                        if (!meta || meta.title === 'Невідомий файл') toDelete.push(k);
                    }
                });

                if (!toDelete.length) {
                    Lampa.Noty.show('Немає записів для видалення');
                    return;
                }

                var freedBytes = 0;
                toDelete.forEach(function(k) { freedBytes += byteSize(JSON.stringify(parsedObj[k])); });

                Lampa.Select.show({
                    title: 'Видалити ' + toDelete.length + ' записів (' + formatBytes(freedBytes) + ')?',
                    nomark: true,
                    items: [
                        { title: '✅ Так, видалити', id: 'yes' },
                        { title: '❌ Скасувати', id: 'no' }
                    ],
                    onSelect: function(a) {
                        if (a.id === 'yes') {
                            var trashItems = {};
                            toDelete.forEach(function(k) {
                                trashItems[k] = parsedObj[k];
                                delete parsedObj[k];
                                delete metaCache[k];
                            });
                            localStorage.setItem(object.storage_key, JSON.stringify(parsedObj));
                            pushToTrash({ type: 'json_bulk', label: 'Масове видалення (' + toDelete.length + ')', sizeBytes: freedBytes, payload: { storageKey: object.storage_key, items: trashItems } });
                            Lampa.Noty.show('Видалено записів: ' + toDelete.length + ' (у кошику, звільнено ' + formatBytes(freedBytes) + ')');
                            render_limit = PAGE_SIZE;
                            self.buildData();
                        }
                        Lampa.Controller.toggle('content');
                    },
                    onBack: function() { Lampa.Controller.toggle('content'); }
                });
            };

            this.emptyTrash = function() {
                Lampa.Select.show({
                    title: 'Очистити кошик назавжди?',
                    nomark: true,
                    items: [
                        { title: '✅ Так, очистити', id: 'yes' },
                        { title: '❌ Скасувати', id: 'no' }
                    ],
                    onSelect: function(a) {
                        if (a.id === 'yes') {
                            saveTrash([]);
                            Lampa.Noty.show('Кошик очищено');
                            self.buildData();
                        }
                        Lampa.Controller.toggle('content');
                    },
                    onBack: function() { Lampa.Controller.toggle('content'); }
                });
            };

            this.buildData = function() {
                grid.empty();
                scroll.clear(); 
                
                if (typeof scroll.minus === 'function') scroll.minus();
                if (typeof scroll.reset === 'function') scroll.reset();
                var bodyEl = scroll.render().find('.scroll__body');
                if (bodyEl.length) bodyEl.css('transform', 'translate3d(0px, 0px, 0px)');

                var hasItems = false;
                var q = search_query ? search_query.toLowerCase() : '';

                // Панель пошуку показується на всіх рівнях
                addControlCard(
                    '🔍 Пошук' + (search_query ? ': ' + search_query : ''),
                    search_query ? 'Натисніть, щоб змінити' : 'Натисніть, щоб шукати',
                    function() { self.openSearch(); }
                );
                if (search_query) {
                    addControlCard('❌ Скинути пошук', '', function() { self.clearSearch(); });
                }

                if (object.level === 'groups') {
                    var groups = {};
                    var groupBytes = {};
                    for (var i = 0; i < localStorage.length; i++) {
                        var k = localStorage.key(i); if (!k || isTechnicalKey(k)) continue;
                        var p = k.split('_')[0] || k;
                        if (!groups[p]) { groups[p] = 0; groupBytes[p] = 0; }
                        groups[p]++;
                        groupBytes[p] += getKeyByteSize(k);
                    }
                    var allGroupNames = Object.keys(groups);

                    // Загальний обсяг усього локального сховища + смуга використання квоти
                    if (!q) {
                        var totalStorageBytes = 0;
                        for (var gKey in groupBytes) totalStorageBytes += groupBytes[gKey];
                        var quotaPct = Math.round((totalStorageBytes / STORAGE_QUOTA_BYTES) * 100);
                        addControlCard(
                            '📊 Загальний розмір кешу',
                            formatBytes(totalStorageBytes) + ' з ~' + formatBytes(STORAGE_QUOTA_BYTES) + ' (' + quotaPct + '%) • ' + allGroupNames.length + ' груп',
                            function() { self.buildData(); },
                            { wide: true, percent: quotaPct }
                        );

                        var namesBySize = allGroupNames.slice().sort(function(a, b) { return groupBytes[b] - groupBytes[a]; });
                        var chartHtml = buildSizeChartHtml(namesBySize, groupBytes);
                        if (chartHtml) grid.append(chartHtml);
                    }

                    addSortFilterControls(['size', 'name']);

                    var keysArr = allGroupNames;
                    if (q) keysArr = keysArr.filter(function(p) { return p.toLowerCase().indexOf(q) !== -1; });
                    if (filter_min_kb > 0) keysArr = keysArr.filter(function(p) { return (groupBytes[p] / 1024) >= filter_min_kb; });

                    if (sort_mode === 'name') keysArr.sort();
                    else keysArr.sort(function(a, b) { return groupBytes[b] - groupBytes[a]; });

                    var totalGroups = keysArr.length;
                    keysArr.slice(0, render_limit).forEach(function(p) { self.addCard('📁 ' + p, p, groups[p] + ' записів • ' + formatBytes(groupBytes[p]), 'group'); hasItems = true; });

                    if (totalGroups > render_limit) {
                        addControlCard('▶ Показати ще', (totalGroups - render_limit) + ' груп залишилось', function() {
                            render_limit += PAGE_SIZE;
                            self.buildData();
                        }, { wide: true });
                    }
                } 
                else if (object.level === 'keys') {
                    var prefix = object.prefix;
                    var keyNames = [];
                    for (var j = 0; j < localStorage.length; j++) {
                        var keyName = localStorage.key(j);
                        if (keyName && !isTechnicalKey(keyName) && (keyName.split('_')[0] === prefix || keyName === prefix)) keyNames.push(keyName);
                    }

                    // Розмір усієї групи
                    if (!q) {
                        var groupTotalBytes = 0;
                        keyNames.forEach(function(kn) { groupTotalBytes += getKeyByteSize(kn); });
                        addControlCard(
                            '📊 Розмір групи «' + prefix + '»',
                            formatBytes(groupTotalBytes) + ' • ' + keyNames.length + ' записів',
                            function() { self.buildData(); },
                            { wide: true }
                        );
                    }

                    addSortFilterControls(['size', 'name']);

                    // Пошук за назвою ключа АБО за вмістом значення
                    if (q) {
                        keyNames = keyNames.filter(function(keyName) {
                            if (keyName.toLowerCase().indexOf(q) !== -1) return true;
                            var val = localStorage.getItem(keyName) || '';
                            return val.toLowerCase().indexOf(q) !== -1;
                        });
                    }
                    if (filter_min_kb > 0) keyNames = keyNames.filter(function(kn) { return (getKeyByteSize(kn) / 1024) >= filter_min_kb; });

                    if (sort_mode === 'name') keyNames.sort();
                    else keyNames.sort(function(a, b) { return getKeyByteSize(b) - getKeyByteSize(a); });

                    var totalKeys = keyNames.length;
                    keyNames.slice(0, render_limit).forEach(function(keyName) {
                        var val = localStorage.getItem(keyName) || '';
                        var sizeLabel = formatBytes(getKeyByteSize(keyName));
                        self.addCard('📄 ' + keyName, keyName, val, 'key', { rawSubtitle: sizeLabel });
                        hasItems = true;
                    });

                    if (totalKeys > render_limit) {
                        addControlCard('▶ Показати ще', (totalKeys - render_limit) + ' записів залишилось', function() {
                            render_limit += PAGE_SIZE;
                            self.buildData();
                        }, { wide: true });
                    }
                }
                // РІВЕНЬ: JSON-РЕДАКТОР (Таймкоди)
                else if (object.level === 'json') {
                    var rawJson = localStorage.getItem(object.storage_key);
                    var parsedObj = {};
                    try { parsedObj = JSON.parse(rawJson) || {}; } catch(e) {}

                    if (!q) {
                        addControlCard(
                            '📊 Розмір даних',
                            formatBytes(getKeyByteSize(object.storage_key)) + ' • ' + Object.keys(parsedObj).length + ' записів',
                            function() { self.buildData(); },
                            { wide: true }
                        );
                    }

                    addControlCard('🧹 Очистити переглянуті', 'Видалити таймкоди з прогресом ≥95%', function() {
                        self.bulkCleanup('watched');
                    }, { danger: true });
                    addControlCard('🧹 Видалити невідомі', 'Видалити записи без визначеної назви', function() {
                        self.bulkCleanup('orphan');
                    }, { danger: true });

                    var pKeys = Object.keys(parsedObj);

                    // Визначаємо, чи є в записах якесь поле з датою/часовою міткою, щоб дозволити сортування за датою
                    var dateField = null;
                    var dateCandidates = ['date', 'timestamp', 'updated', 'watched_at', 'mtime', 'utime', 'atime', 'time_added'];
                    findDate: for (var dpk = 0; dpk < pKeys.length && dpk < 30; dpk++) {
                        var dItem = parsedObj[pKeys[dpk]];
                        if (dItem && typeof dItem === 'object') {
                            for (var dci = 0; dci < dateCandidates.length; dci++) {
                                if (typeof dItem[dateCandidates[dci]] === 'number') { dateField = dateCandidates[dci]; break findDate; }
                            }
                        }
                    }
                    addSortFilterControls(dateField ? ['size', 'name', 'date'] : ['size', 'name']);

                    if (q) {
                        pKeys = pKeys.filter(function(k) {
                            var meta = getMeta(k);
                            return k.toLowerCase().indexOf(q) !== -1 ||
                                (meta.title && meta.title.toLowerCase().indexOf(q) !== -1) ||
                                (meta.subtitle && meta.subtitle.toLowerCase().indexOf(q) !== -1);
                        });
                    }
                    if (filter_min_kb > 0) {
                        pKeys = pKeys.filter(function(k) { return (byteSize(JSON.stringify(parsedObj[k])) / 1024) >= filter_min_kb; });
                    }

                    if (sort_mode === 'name') {
                        pKeys.sort(function(a, b) { return getMeta(a).title.localeCompare(getMeta(b).title); });
                    } else if (sort_mode === 'date' && dateField) {
                        pKeys.sort(function(a, b) { return (parsedObj[b][dateField] || 0) - (parsedObj[a][dateField] || 0); });
                    } else {
                        pKeys.sort(function(a, b) { return byteSize(JSON.stringify(parsedObj[b])) - byteSize(JSON.stringify(parsedObj[a])); });
                    }

                    var totalJson = pKeys.length;
                    if (totalJson > 0) {
                        pKeys.slice(0, render_limit).forEach(function(k) {
                            var item = parsedObj[k];
                            
                            // Збираємо візуальні дані через розшифрування (з кешем)
                            var meta = getMeta(k);
                            
                            var desc = JSON.stringify(item);
                            // Форматування часу
                            if (item && item.percent !== undefined) {
                                var m = Math.floor((item.time || 0) / 60);
                                var s = Math.floor((item.time || 0) % 60);
                                var md = Math.floor((item.duration || 0) / 60);
                                var sd = Math.floor((item.duration || 0) % 60);
                                desc = '⏳ ' + item.percent + '% ( ' + m + ':' + (s<10?'0':'')+s + ' / ' + md + ':' + (sd<10?'0':'')+sd + ' )';
                            }
                            
                            var itemSize = formatBytes(byteSize(JSON.stringify(item)));
                            self.addCard(meta.title, k, desc, 'json_item', { bg: meta.bg, parentKey: object.storage_key, jsonObj: parsedObj, rawSubtitle: meta.subtitle + ' • ' + itemSize });
                            hasItems = true;
                        });
                    }

                    if (totalJson > render_limit) {
                        addControlCard('▶ Показати ще', (totalJson - render_limit) + ' записів залишилось', function() {
                            render_limit += PAGE_SIZE;
                            self.buildData();
                        }, { wide: true });
                    }
                }
                // РІВЕНЬ: КОШИК (відновлення видаленого)
                else if (object.level === 'trash') {
                    var trashArr = purgeOldTrash();
                    trashArr.sort(function(a, b) { return b.deletedAt - a.deletedAt; });
                    if (q) trashArr = trashArr.filter(function(t) { return (t.label || t.type || '').toLowerCase().indexOf(q) !== -1; });

                    if (!q && trashArr.length) {
                        var trashTotalBytes = 0;
                        trashArr.forEach(function(t) { trashTotalBytes += (t.sizeBytes || 0); });
                        addControlCard('🗑 У кошику', formatBytes(trashTotalBytes) + ' • ' + trashArr.length + ' записів • автоочищення через ' + TRASH_RETENTION_DAYS + ' дн.', function() { self.buildData(); }, { wide: true });
                        addControlCard('🧹 Очистити кошик назавжди', 'Видалити всі записи без можливості відновлення', function() { self.emptyTrash(); }, { danger: true, wide: true });
                    }

                    var totalTrash = trashArr.length;
                    trashArr.slice(0, render_limit).forEach(function(t) {
                        var dateLabel = new Date(t.deletedAt).toLocaleString();
                        var typeLabel = t.type === 'group' ? 'Група' : (t.type === 'json_item' ? 'Таймкод' : (t.type === 'json_bulk' ? 'Масове видалення' : 'Запис'));
                        self.addCard('🗑 ' + (t.label || t.type), t.id, typeLabel + ' • видалено ' + dateLabel, 'trash_item', { rawSubtitle: formatBytes(t.sizeBytes || 0), trashEntry: t });
                        hasItems = true;
                    });

                    if (totalTrash > render_limit) {
                        addControlCard('▶ Показати ще', (totalTrash - render_limit) + ' записів залишилось', function() {
                            render_limit += PAGE_SIZE;
                            self.buildData();
                        }, { wide: true });
                    }
                }
                // РІВЕНЬ: ДУБЛІКАТИ (однаковий вміст під різними ключами)
                else if (object.level === 'duplicates') {
                    var dupSets = self.findDuplicateSets();
                    if (q) dupSets = dupSets.filter(function(s) { return s.keys.join(' ').toLowerCase().indexOf(q) !== -1; });

                    if (!q && dupSets.length) {
                        var wastedBytes = 0;
                        dupSets.forEach(function(s) { wastedBytes += s.valueSize * (s.keys.length - 1); });
                        addControlCard('🧬 Знайдено дублікатів', dupSets.length + ' наборів • можна звільнити ' + formatBytes(wastedBytes), function() { self.buildData(); }, { wide: true });
                    }

                    var totalDup = dupSets.length;
                    dupSets.slice(0, render_limit).forEach(function(s) {
                        var sample = s.keys.slice(0, 3).join(', ') + (s.keys.length > 3 ? '…' : '');
                        self.addCard('🧬 ' + s.keys.length + ' копії', s.id, sample, 'dup_set', { rawSubtitle: formatBytes(s.valueSize) + ' кожна • ' + formatBytes(s.valueSize * s.keys.length) + ' разом', dupSet: s });
                        hasItems = true;
                    });

                    if (totalDup > render_limit) {
                        addControlCard('▶ Показати ще', (totalDup - render_limit) + ' наборів залишилось', function() {
                            render_limit += PAGE_SIZE;
                            self.buildData();
                        }, { wide: true });
                    }

                    if (!dupSets.length && !q) {
                        grid.append('<div style="grid-column: 1 / -1; padding: 3em; text-align: center; font-size: 1.3em;">Дублікатів не знайдено 🎉</div>');
                        hasItems = true;
                    }
                }
                
                if (!hasItems) {
                    if (search_query) {
                        grid.append('<div style="grid-column: 1 / -1; padding: 3em; text-align: center; font-size: 1.3em;">Нічого не знайдено за запитом «' + search_query + '»</div>');
                    } else if (object.level === 'keys') {
                        var emptyBtn = $('<div class="cache-card selector" style="grid-column: 1 / -1; height: 100px;"><div class="cc-title" style="font-size:1.3em;">➕ Створити перший запис</div></div>');
                        emptyBtn.on('hover:enter', function() { self.createNewKey(object.prefix); });
                        grid.append(emptyBtn);
                    } else {
                        grid.append('<div style="grid-column: 1 / -1; padding: 3em; text-align: center; font-size: 1.5em;">Список порожній</div>');
                    }
                }
                
                scroll.append(grid);
            };

            this.createNewGroup = function() {
                Lampa.Input.edit({ title: 'Префікс нової групи', value: '', free: true, nosave: true }, function(newPrefix) {
                    if (newPrefix && newPrefix.trim()) {
                        localStorage.setItem(newPrefix.trim() + '_new_record', 'новий запис');
                        self.buildData();
                    }
                    setTimeout(function() { Lampa.Controller.toggle('content'); }, 100);
                });
            };

            this.createNewKey = function(prefix) {
                Lampa.Input.edit({ title: 'Ключ (починайте з ' + prefix + '_):', value: prefix + '_', free: true, nosave: true }, function(newKey) {
                    if (newKey && newKey.trim()) {
                        setTimeout(function() {
                            Lampa.Input.edit({ title: 'Значення для ' + newKey.trim() + ':', value: '', free: true, nosave: true }, function(newVal) {
                                localStorage.setItem(newKey.trim(), newVal || '');
                                self.buildData();
                                setTimeout(function() { Lampa.Controller.toggle('content'); }, 100);
                            });
                        }, 300);
                    } else {
                        setTimeout(function() { Lampa.Controller.toggle('content'); }, 100);
                    }
                });
            };

            this.addCard = function(title, rawId, desc, type, extra) {
                var safeDesc = typeof desc === 'string' && desc.length > 90 ? desc.substring(0, 90) + '...' : desc;
                var card = $('<div class="cache-card selector"></div>');
                card.attr('data-id', rawId); 
                
                if (extra && extra.bg) {
                    card.addClass('has-bg');
                    card.css({ 'background-image': 'url(' + extra.bg + ')', 'background-size': 'cover', 'background-position': 'center' });
                    card.append('<div class="cc-bg-overlay"></div>');
                }

                var tDiv = $('<div class="cc-title"></div>').text(title);
                var subDiv = $('<div class="cc-subtitle"></div>').text(extra && extra.rawSubtitle ? extra.rawSubtitle : rawId);
                var dDiv = $('<div class="cc-desc"></div>').text(safeDesc);
                
                if (type === 'group') {
                    card.append(tDiv, dDiv);
                } else {
                    card.append(tDiv, subDiv, dDiv);
                }

                card.on('hover:focus', function() { 
                    object.last_focus = rawId; 
                    scroll.update(card);
                });

                card.on('hover:enter', function(e) {
                    if (action_busy) return;
                    action_busy = true; setTimeout(function() { action_busy = false; }, 1000);

                    if (type === 'group') {
                        Lampa.Activity.push({ url: '', title: 'Група: ' + rawId, component: 'cache_editor_grid', level: 'keys', prefix: rawId });
                    } else if (type === 'trash_item') {
                        Lampa.Select.show({
                            title: 'Кошик: ' + title,
                            nomark: true,
                            items: [
                                { title: '♻ Відновити', id: 'restore' },
                                { title: '🗑 Видалити назавжди', id: 'purge' },
                                { title: 'Скасувати', id: 'cancel' }
                            ],
                            onSelect: function(a) {
                                if (a.id === 'restore') {
                                    restoreTrashEntry(extra.trashEntry);
                                    Lampa.Noty.show('Відновлено');
                                    self.buildData();
                                } else if (a.id === 'purge') {
                                    removeFromTrash(extra.trashEntry.id);
                                    Lampa.Noty.show('Видалено назавжди');
                                    self.buildData();
                                }
                                Lampa.Controller.toggle('content');
                            },
                            onBack: function() { Lampa.Controller.toggle('content'); }
                        });
                    } else if (type === 'dup_set') {
                        var set = extra.dupSet;
                        var dupItems = set.keys.map(function(k) { return { title: k, id: k }; });
                        dupItems.push({ title: '🗑 Видалити всі копії, крім однієї', id: '__keep_one__' });
                        dupItems.push({ title: 'Скасувати', id: 'cancel' });
                        Lampa.Select.show({
                            title: 'Дублікати (' + set.keys.length + ')',
                            nomark: true,
                            items: dupItems,
                            onSelect: function(a) {
                                if (a.id === '__keep_one__') {
                                    var keep = set.keys[0];
                                    var toRemove = set.keys.slice(1);
                                    var freed = 0;
                                    toRemove.forEach(function(k) {
                                        pushToTrash({ type: 'key', label: k, sizeBytes: getKeyByteSize(k), payload: { key: k, value: localStorage.getItem(k) } });
                                        freed += getKeyByteSize(k);
                                        localStorage.removeItem(k);
                                    });
                                    Lampa.Noty.show('Видалено ' + toRemove.length + ' копій (у кошику, звільнено ' + formatBytes(freed) + '), залишено «' + keep + '»');
                                    self.buildData();
                                    Lampa.Controller.toggle('content');
                                } else if (a.id !== 'cancel') {
                                    Lampa.Select.show({
                                        title: a.id,
                                        nomark: true,
                                        items: [
                                            { title: '🗑 Видалити цей запис', id: 'del' },
                                            { title: 'Скасувати', id: 'cancel' }
                                        ],
                                        onSelect: function(b) {
                                            if (b.id === 'del') {
                                                pushToTrash({ type: 'key', label: a.id, sizeBytes: getKeyByteSize(a.id), payload: { key: a.id, value: localStorage.getItem(a.id) } });
                                                localStorage.removeItem(a.id);
                                                Lampa.Noty.show('Видалено (у кошику)');
                                                self.buildData();
                                            }
                                            Lampa.Controller.toggle('content');
                                        },
                                        onBack: function() { Lampa.Controller.toggle('content'); }
                                    });
                                } else {
                                    Lampa.Controller.toggle('content');
                                }
                            },
                            onBack: function() { Lampa.Controller.toggle('content'); }
                        });
                    } else if (type === 'key' || type === 'json_item') {
                        var isJson = (type === 'json_item');
                        var oldVal = isJson ? JSON.stringify(extra.jsonObj[rawId], null, 2) : (localStorage.getItem(rawId) || '');
                        
                        Lampa.Input.edit({ title: 'Редагування (JSON):', value: oldVal, free: true, nosave: true }, function(nv) {
                            var checkVal = (nv === undefined || nv === null) ? '' : String(nv).trim();

                            if (checkVal === '' || nv === oldVal) {
                                Lampa.Noty.show('Скасовано (без змін)');
                            } else {
                                if (isJson) {
                                    try {
                                        extra.jsonObj[rawId] = JSON.parse(nv);
                                        localStorage.setItem(extra.parentKey, JSON.stringify(extra.jsonObj));
                                        Lampa.Noty.show('Збережено');
                                        self.buildData();
                                    } catch(err) { Lampa.Noty.show('Помилка: Невірний JSON формат'); }
                                } else {
                                    localStorage.setItem(rawId, nv);
                                    dDiv.text(nv.length > 90 ? nv.substring(0, 90) + '...' : nv);
                                    Lampa.Noty.show('Збережено');
                                }
                            }
                            setTimeout(function() {
                                Lampa.Controller.toggle('content');
                                if (card && card.length) Lampa.Controller.collectionFocus(card[0], scroll.render());
                            }, 200);
                        });
                    }
                });

                card.on('hover:long contextmenu', function(e) {
                    if (e.type === 'contextmenu') { e.preventDefault(); e.stopPropagation(); }
                    if (action_busy) return;
                    action_busy = true; setTimeout(function() { action_busy = false; }, 1000);
                    
                    var menuItems = [];
                    if (type === 'group') {
                        menuItems.push({ title: '🗑 Видалити групу', id: 'del' });
                        menuItems.push({ title: '➕ Створити нову групу', id: 'add' });
                    } else if (type === 'key') {
                        menuItems.push({ title: '🗑 Видалити запис', id: 'del' });
                        menuItems.push({ title: '➕ Створити новий запис', id: 'add' });
                    } else if (type === 'json_item') {
                        menuItems.push({ title: '🗑 Видалити таймкод', id: 'del' });
                    }
                    menuItems.push({ title: 'Скасувати', id: 'cancel' });

                    Lampa.Select.show({
                        title: 'Дія: ' + (type === 'group' ? rawId : 'Поточний запис'), nomark: true,
                        items: menuItems,
                        onSelect: function(a) {
                            if (a.id === 'del') {
                                if (type === 'group') {
                                    var toDel = [];
                                    var freedGroupBytes = 0;
                                    var groupItems = [];
                                    for (var i=0; i<localStorage.length; i++) {
                                        var k = localStorage.key(i);
                                        if (k && !isTechnicalKey(k) && (k.split('_')[0] === rawId || k === rawId)) toDel.push(k);
                                    }
                                    toDel.forEach(function(k) {
                                        groupItems.push({ key: k, value: localStorage.getItem(k) });
                                        freedGroupBytes += getKeyByteSize(k);
                                        localStorage.removeItem(k);
                                    });
                                    pushToTrash({ type: 'group', label: rawId, sizeBytes: freedGroupBytes, payload: { prefix: rawId, items: groupItems } });
                                    Lampa.Noty.show('Групу ' + rawId + ' переміщено в кошик (звільнено ' + formatBytes(freedGroupBytes) + ')');
                                } else if (type === 'json_item') {
                                    var oldItemVal = extra.jsonObj[rawId];
                                    pushToTrash({ type: 'json_item', label: (getMeta(rawId).title || rawId), sizeBytes: byteSize(JSON.stringify(oldItemVal)), payload: { storageKey: extra.parentKey, itemKey: rawId, itemValue: oldItemVal } });
                                    delete extra.jsonObj[rawId];
                                    localStorage.setItem(extra.parentKey, JSON.stringify(extra.jsonObj));
                                    Lampa.Noty.show('Таймкод переміщено в кошик');
                                } else {
                                    var oldKeyVal = localStorage.getItem(rawId) || '';
                                    pushToTrash({ type: 'key', label: rawId, sizeBytes: getKeyByteSize(rawId), payload: { key: rawId, value: oldKeyVal } });
                                    localStorage.removeItem(rawId);
                                    Lampa.Noty.show('Запис переміщено в кошик');
                                }
                                
                                var nextFocus = card.next('.selector')[0] || card.prev('.selector')[0];
                                card.remove(); 
                                
                                if (grid.find('.selector').length > 0) {
                                    if (nextFocus) object.last_focus = $(nextFocus).attr('data-id'); 
                                    Lampa.Controller.toggle('content');
                                    if (nextFocus) Lampa.Controller.collectionFocus(nextFocus, scroll.render());
                                } else {
                                    self.buildData();
                                    Lampa.Controller.toggle('content');
                                    Lampa.Controller.collectionFocus(scroll.render().find('.selector').eq(0)[0], scroll.render());
                                }
                            } 
                            else if (a.id === 'add') {
                                if (type === 'group') self.createNewGroup();
                                if (type === 'key') self.createNewKey(object.prefix);
                            }
                            else {
                                Lampa.Controller.toggle('content');
                                if (card && card.length) Lampa.Controller.collectionFocus(card[0], scroll.render());
                            }
                        },
                        onBack: function() { 
                            Lampa.Controller.toggle('content');
                            if (card && card.length) Lampa.Controller.collectionFocus(card[0], scroll.render());
                        }
                    });
                });

                grid.append(card);
            };

            this.start = function() {
                Lampa.Controller.add('content', {
                    toggle: function() {
                        Lampa.Controller.collectionSet(scroll.render());
                        var elements = scroll.render().find('.selector');
                        var target = false;

                        if (object.last_focus) {
                            elements.each(function() {
                                if ($(this).attr('data-id') === object.last_focus) target = this;
                            });
                        }
                        if (!target && elements.length) target = elements.eq(0)[0];
                        Lampa.Controller.collectionFocus(target || false, scroll.render());
                    },
                    left: function() { 
                        if (window.Navigator && window.Navigator.canmove('left')) window.Navigator.move('left'); 
                        else Lampa.Controller.toggle('menu');
                    },
                    right: function() { if (window.Navigator && window.Navigator.canmove('right')) window.Navigator.move('right'); },
                    up: function() { 
                        if (window.Navigator && window.Navigator.canmove('up')) window.Navigator.move('up'); 
                        else Lampa.Controller.toggle('head');
                    },
                    down: function() { if (window.Navigator && window.Navigator.canmove('down')) window.Navigator.move('down'); },
                    back: function() { Lampa.Activity.backward(); }
                });
                Lampa.Controller.toggle('content');
            };

            this.pause = function() {};
            this.stop = function() {};
            this.render = function() { return html; }; 
            this.destroy = function() { scroll.destroy(); html.remove(); };
        });
    }

    // ==========================================
    // ІНІЦІАЛІЗАЦІЯ ПЛАГІНУ ТА МЕНЮ
    // ==========================================
    function initPlugin() {
        window.lampac_cache_editor_plugin = true;
        initCacheEditorActivity();

        Lampa.SettingsApi.addComponent({
            component: 'local_cache_editor_menu',
            icon: '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>',
            name: 'Редактор Кешу'
        });

        // 1. Оригінальний Редактор Локального Кешу
        Lampa.SettingsApi.addParam({ 
            component: 'local_cache_editor_menu', 
            param: { type: 'button' }, 
            field: { name: '🛠 Відкрити загальний редактор кешу' }, 
            onChange: function() { 
                Lampa.Activity.push({ url: '', title: 'Редактор Кешу', component: 'cache_editor_grid', level: 'groups' });
            }
        });
        
        // 2. Редактор Таймкодів
        Lampa.SettingsApi.addParam({ 
            component: 'local_cache_editor_menu', 
            param: { type: 'button' }, 
            field: { name: '⏱ Відкрити редактор Таймкодів' }, 
            onChange: function() { 
                var tcKey = (typeof Lampa.Timeline === 'object' && typeof Lampa.Timeline.filename === 'function') ? Lampa.Timeline.filename() : 'file_view';
                Lampa.Activity.push({ url: '', title: 'Редактор Таймкодів', component: 'cache_editor_grid', level: 'json', storage_key: tcKey });
            }
        });

        // 3. Кошик (відновлення видаленого)
        Lampa.SettingsApi.addParam({ 
            component: 'local_cache_editor_menu', 
            param: { type: 'button' }, 
            field: { name: '🗑 Кошик (відновити видалене)' }, 
            onChange: function() { 
                Lampa.Activity.push({ url: '', title: 'Кошик', component: 'cache_editor_grid', level: 'trash' });
            }
        });

        // 4. Пошук дублікатів кешу
        Lampa.SettingsApi.addParam({ 
            component: 'local_cache_editor_menu', 
            param: { type: 'button' }, 
            field: { name: '🧬 Знайти дублікати кешу' }, 
            onChange: function() { 
                Lampa.Activity.push({ url: '', title: 'Дублікати', component: 'cache_editor_grid', level: 'duplicates' });
            }
        });
    }

    var checkTimer = setInterval(function() {
        if (window.Lampa && window.Lampa.SettingsApi && typeof window.Lampa.Platform !== "undefined") {
            if (!window.lampac_cache_editor_plugin) initPlugin();
            clearInterval(checkTimer);
        }
    }, 500);

})();
