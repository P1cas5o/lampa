(function () {
    'use strict';

    if (window.ObsidianProLoaded) return;
    window.ObsidianProLoaded = true;

    var CONFIG = {
        name: 'Obsidian Pro Design',
        cacheTime: 7 * 24 * 60 * 60 * 1000,
        tmdbKey: function () {
            try {
                return (window.Lampa && Lampa.TMDB && Lampa.TMDB.key) ? Lampa.TMDB.key() : '4ef0d7355d9ffb5151e987764708ce96';
            } catch (e) {
                return '4ef0d7355d9ffb5151e987764708ce96';
            }
        }
    };

    // =========================================================================
    // 1. РОЗПІЗНАВАННЯ ТИПІВ КАРТОК ТА МЕДІА
    // =========================================================================
    function isPersonCard(data) {
        if (!data) return false;
        if (data.media_type === 'person' || data.type === 'person') return true;
        if (data.profile_path && !data.poster_path && !data.backdrop_path) return true;
        return false;
    }

    function isSpecialPluginCard(data, html) {
        if (!data) return false;
        if (data.vinyl || data.vinyl_type) return true;
        if (['playlist', 'album', 'artist', 'radio', 'song', 'genre', 'section'].indexOf(data.media) !== -1) return true;
        if (html) {
            var el = html[0] || html;
            if (el && el.classList && (
                el.classList.contains('card--vinyl') || 
                el.classList.contains('card-more') || 
                el.classList.contains('card--collection') ||
                el.classList.contains('card--iptv')
            )) return true;
        }
        return false;
    }

    function isMovieCard(data, html) {
        if (!data || !data.id) return false;
        if (isSpecialPluginCard(data, html)) return false;
        if (isPersonCard(data)) return false;
        return true;
    }

    function isTvMedia(movie, cardEl, extData) {
        if (!movie && !cardEl && !extData) return false;
        if (extData) {
            if (extData.seasons || extData.se_str || extData.number_of_seasons) return true;
            if (extData.type === 'tv' || extData.media_type === 'tv') return true;
        }
        if (movie) {
            if (movie.media_type === 'tv' || movie.type === 'tv' || movie.type === 'tv_series') return true;
            if (movie.number_of_seasons !== undefined && movie.number_of_seasons > 0) return true;
            if (movie.seasons && movie.seasons.length > 0) return true;
            if (movie.first_air_date || movie.original_name) return true;
        }
        return false;
    }

    // =========================================================================
    // 2. КЕШУВАННЯ ТА РОБОТА З ПАМ'ЯТТЮ
    // =========================================================================
    var ApiCache = {
        get: function (key) {
            try {
                var raw = localStorage.getItem('obs_pro_' + key);
                if (raw) {
                    var parsed = JSON.parse(raw);
                    if (parsed && parsed.time && (Date.now() - parsed.time < CONFIG.cacheTime)) {
                        return parsed.val;
                    }
                }
            } catch (e) {}
            return null;
        },
        set: function (key, val) {
            try {
                localStorage.setItem('obs_pro_' + key, JSON.stringify({ val: val, time: Date.now() }));
            } catch (e) {}
        }
    };

    // =========================================================================
    // 3. ОТРИМАННЯ ДАНИХ TMDB ДЛЯ СЕРІАЛІВ ТА ФІЛЬМІВ
    // =========================================================================
    function fetchExtendedData(id, type) {
        var cacheKey = 'ext_' + type + '_' + id;
        var cached = ApiCache.get(cacheKey);
        if (cached) return Promise.resolve(cached);

        return new Promise(function (resolve) {
            var url = 'https://api.themoviedb.org/3/' + type + '/' + id + '?api_key=' + CONFIG.tmdbKey() + '&language=uk-UA';
            $.ajax({
                url: url,
                timeout: 4000,
                success: function(data) {
                    var se_str = '';
                    if (type === 'tv') {
                        var ds = data.number_of_seasons;
                        var de = data.number_of_episodes;
                        if (data.last_episode_to_air) {
                            ds = data.last_episode_to_air.season_number;
                            de = data.last_episode_to_air.episode_number;
                            se_str = 'S' + ds + ':E' + de;
                        } else if (ds) {
                            se_str = 'S' + ds;
                        }
                    }

                    var result = {
                        se_str: se_str,
                        seasons: data.number_of_seasons,
                        episodes: data.number_of_episodes,
                        vote_average: data.vote_average
                    };
                    ApiCache.set(cacheKey, result);
                    resolve(result);
                },
                error: function() { resolve(null); }
            });
        });
    }

    // =========================================================================
    // 4. ОФОРМЛЕННЯ ВЕРХНЬОГО БЛОКУ (НОЧІ/ПЛАШКИ)
    // =========================================================================
    function updateCardNotch(cardEl, data, extData) {
        if (!cardEl) return;
        var view = cardEl.querySelector ? cardEl.querySelector('.card__view') : null;
        if (!view) return;

        var notchEl = view.querySelector('.obs-card-notch');
        var badgeText = '';
        var statusText = '';

        if (isTvMedia(data, cardEl, extData)) {
            if (extData && extData.se_str) {
                badgeText = extData.se_str;
            } else if (data.seasons_count) {
                badgeText = 'S' + data.seasons_count;
            } else {
                badgeText = 'TV';
            }
        }

        try {
            if (window.Lampa && Lampa.Favorite && Lampa.Favorite.check) {
                var favStatus = Lampa.Favorite.check(data) || {};
                if (favStatus.scheduled) statusText = 'Заплановано';
                else if (favStatus.look) statusText = 'Дивлюся';
                else if (favStatus.viewed) statusText = 'Переглянуто';
                else if (favStatus.continued) statusText = 'Далі буде';
            }
        } catch (e) {}

        if (!badgeText && !statusText) {
            if (notchEl) notchEl.style.display = 'none';
            return;
        }

        if (!notchEl) {
            notchEl = document.createElement('div');
            notchEl.className = 'obs-card-notch';
            view.appendChild(notchEl);
        }

        var htmlContent = '';
        if (badgeText) {
            htmlContent += '<span class="obs-notch-ep">' + badgeText + '</span>';
        }
        if (statusText) {
            htmlContent += '<span class="obs-notch-status"><span class="obs-dot"></span>' + statusText + '</span>';
        }

        notchEl.innerHTML = htmlContent;
        notchEl.style.display = 'flex';
    }

    // =========================================================================
    // 5. ПОБУДОВА ЕЛЕМЕНТІВ КАРТКИ
    // =========================================================================
    function buildCardDOM(cardHtml, data) {
        var el = cardHtml[0] || cardHtml;
        el.classList.add('obs-card-pro');
        
        var type = isTvMedia(data, el) ? 'tv' : (data.media_type || 'movie');
        if (!data.id) return;

        updateCardNotch(el, data, null);

        fetchExtendedData(data.id, type).then(function (extData) {
            if (extData) {
                updateCardNotch(el, data, extData);
            }
        });
    }

    // =========================================================================
    // 6. CSS СТИЛІ (ОБСІДІАН ДИЗАЙН ДЛЯ ВСІХ СТОРІНОК ТА КОЛЕКЦІЙ)
    // =========================================================================
    function injectStyles() {
        if (document.getElementById('obsidian-pro-styles')) return;
        var style = document.createElement('style');
        style.id = 'obsidian-pro-styles';
        style.innerHTML = `
            /* Загальна структура карток у колекціях та каталогах */
            .obs-card-pro,
            .card--collection,
            .card--vinyl {
                background: transparent !important;
                border: none !important;
                box-shadow: none !important;
            }

            .obs-card-pro .card__view,
            .card--collection .card__view {
                background-color: #141418 !important;
                border-radius: 9px !important;
                overflow: hidden !important;
                position: relative !important;
                box-shadow: 0 4px 14px rgba(0,0,0,0.6) !important;
                transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.22s ease !important;
            }

            .obs-card-pro .card__img,
            .card--collection .card__img {
                object-fit: cover !important;
                border-radius: 9px !important;
            }

            /* Ефект фокусу без темних артефактів кутів */
            .obs-card-pro.focus .card__view,
            .card--collection.focus .card__view,
            .card.focus .card__view {
                transform: scale(1.04) !important;
                box-shadow: 0 0 0 3.5px #ffffff, 0 12px 30px rgba(0,0,0,0.8) !important;
                z-index: 30 !important;
            }

            /* Верхній блок (Notch) */
            .obs-card-notch {
                position: absolute !important;
                top: 0 !important;
                left: 50% !important;
                transform: translateX(-50%) !important;
                z-index: 25 !important;
                display: flex !important;
                align-items: center !important;
                gap: 6px !important;
                padding: 4px 9px !important;
                background: rgba(25, 25, 32, 0.8) !important;
                backdrop-filter: blur(8px) !important;
                -webkit-backdrop-filter: blur(8px) !important;
                border-bottom-left-radius: 8px !important;
                border-bottom-right-radius: 8px !important;
                border: 1px solid rgba(255, 255, 255, 0.18) !important;
                border-top: none !important;
                pointer-events: none !important;
            }

            .obs-notch-ep {
                font-size: 0.7em !important;
                font-weight: 700 !important;
                color: #ffffff !important;
                letter-spacing: 0.03em;
            }

            .obs-notch-status {
                font-size: 0.65em !important;
                font-weight: 600 !important;
                color: #c4b5fd !important;
                display: flex !important;
                align-items: center !important;
                gap: 4px !important;
            }

            .obs-dot {
                width: 5px;
                height: 5px;
                background-color: #c4b5fd;
                border-radius: 50%;
                display: inline-block;
            }

            /* Стилізація назви під постермом */
            .obs-card-pro .card__title {
                font-size: 0.88em !important;
                font-weight: 600 !important;
                color: #f1f5f9 !important;
                margin-top: 6px !important;
                text-shadow: 0 1px 3px rgba(0,0,0,0.9) !important;
            }
        `;
        document.head.appendChild(style);
    }

    // =========================================================================
    // 7. ПЕРЕХОПЛЕННЯ ПОДІЙ КАРТОК (Maker API)
    // =========================================================================
    function initCardHooks() {
        try {
            var CardMaker = Lampa.Maker.map('Card');
            if (!CardMaker || !CardMaker.Card) return;

            var originalOnVisible = CardMaker.Card.onVisible;
            CardMaker.Card.onVisible = function () {
                if (typeof originalOnVisible === 'function') {
                    originalOnVisible.apply(this, arguments);
                }
                if (isMovieCard(this.data, this.html)) {
                    var cardEl = this.html[0] || this.html;
                    if (!cardEl._obsProBuilt) {
                        cardEl._obsProBuilt = true;
                        buildCardDOM(cardEl, this.data);
                    }
                }
            };
        } catch (e) {}
    }

    function startPlugin() {
        injectStyles();
        initCardHooks();
        console.log(CONFIG.name + ' успішно ініціалізовано.');
    }

    if (window.Lampa) {
        Lampa.Plugins.add({
            name: CONFIG.name,
            version: '1.1.0',
            description: 'Повноцінний рушій стилю Obsidian для всіх розділів і колекцій Lampa',
            onInit: startPlugin
        });
    } else {
        document.addEventListener('lampa:initialize', startPlugin, { once: true });
    }
})();
