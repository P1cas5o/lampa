(function () {
    'use strict';

    if (window.ymod_loaded) return;
    window.ymod_loaded = true;

    var YMOD = 'ymod_';

    function isEnabled(mod) {
        return Lampa.Storage.get(YMOD + 'enable_' + mod, true);
    }

    var yIcon = '<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-weight="900" font-size="20" fill="currentColor">Y</text></svg>';

    var uatorIcons = {
        ua: 'https://yarikrazor-star.github.io/lmp/ua.svg',
        none: 'https://yarikrazor-star.github.io/lmp/dontknow.svg',
        top: 'https://yarikrazor-star.github.io/lmp/stream.svg',
        seeds: 'https://yarikrazor-star.github.io/lmp/upload.svg',
        audio: 'https://yarikrazor-star.github.io/lmp/zvuk.svg',
        dv: 'https://upload.wikimedia.org/wikipedia/commons/0/03/Dolby_Vision_2021_logo.svg',
        hdr: 'https://yarikrazor-star.github.io/lmp/hdr.svg'
    };

    var countryNames = {
        'us': 'США', 'usa': 'США', 'gb': 'Велика Британія', 'uk': 'Велика Британія',
        'ua': 'Україна', 'ca': 'Канада', 'hk': 'Гонконг', 'fr': 'Франція',
        'de': 'Німеччина', 'it': 'Італія', 'es': 'Іспанія', 'jp': 'Японія',
        'kr': 'Південна Корея', 'cn': 'Китай', 'pl': 'Польща', 'au': 'Австралія',
        'ie': 'Ірландія', 'be': 'Бельгія', 'dk': 'Данія', 'no': 'Норвегія',
        'se': 'Швеція', 'fi': 'Фінляндія', 'tr': 'Туреччина', 'in': 'Індія',
        'br': 'Бразилія', 'mx': 'Мексика', 'nl': 'Нідерланди', 'at': 'Австрія',
        'ch': 'Швейцарія', 'cz': 'Чехія', 'hu': 'Угорщина', 'nz': 'Нова Зеландія',
        'za': 'ПАР', 'il': 'Ізраїль', 'th': 'Таїланд', 'tw': 'Тайвань', 
        'ru': 'Країна-агресор', 'pt': 'Португалія', 'gr': 'Греція',
        'is': 'Ісландія', 'ro': 'Румунія', 'bg': 'Болгарія',
        'ar': 'Аргентина', 'cl': 'Чилі', 'co': 'Колумбія', 'pe': 'Перу',
        'id': 'Індонезія', 'my': 'Малайзія', 'ph': 'Філіппіни', 'sg': 'Сінгапур',
        'vn': 'В\'єтнам', 'ae': 'ОАЕ', 'sa': 'Саудівська Аравія', 'eg': 'Єгипет'
    };

    var extSizes = { '0.5em':'0.5em', '0.6em':'0.6em', '0.7em':'0.7em', '0.8em':'0.8em', '0.9em':'0.9em', '1.0em':'1.0em', '1.1em':'1.1em', '1.2em':'1.2em', '1.3em':'1.3em', '1.4em':'1.4em', '1.5em':'1.5em', '1.7em':'1.7em', '2.0em':'2.0em', '2.5em':'2.5em', '3.0em':'3.0em', '3.5em':'3.5em', '4.0em':'4.0em', '5.0em':'5.0em', '6.0em':'6.0em' };
    var extGaps = { '-2em': '-2em', '-1.5em': '-1.5em', '-1em': '-1em', '-0.8em': '-0.8em', '-0.5em': '-0.5em', '-0.2em': '-0.2em', '0px':'0', '0.2em':'0.2em', '0.5em':'0.5em', '0.8em':'0.8em', '1.0em':'1.0em', '1.2em':'1.2em', '1.5em':'1.5em', '2.0em':'2.0em', '2.5em':'2.5em', '3.0em':'3.0em' };
    var extMargins = { 'auto':'Авто', '-3em': '-3em', '-2.5em': '-2.5em', '-2em': '-2em', '-1.5em': '-1.5em', '-1em': '-1em', '-0.8em': '-0.8em', '-0.5em': '-0.5em', '-0.2em': '-0.2em', '0px':'0px', '5px':'5px', '10px':'10px', '15px':'15px', '20px':'20px', '0.5em':'0.5em', '1em':'1em', '1.5em':'1.5em', '2em':'2em', '3em':'3em' };
    var extMarginsLeft = { '0px':'0px', '5px':'5px', '10px':'10px', '15px':'15px', '20px':'20px', '30px':'30px', '40px':'40px', '50px':'50px', '0.5em':'0.5em', '1em':'1em', '1.5em':'1.5em', '2em':'2em', '2.5em':'2.5em', '3em':'3em', '4em':'4em', '5em':'5em', '6em':'6em', '8em':'8em', '10em':'10em', '15em':'15em', '20em':'20em', '5vw':'5vw', '10vw':'10vw', '15vw':'15vw', '20vw':'20vw', '25vw':'25vw', '30vw':'30vw', '40vw':'40vw', '50vw':'50vw' };
    var imgWidths = { 'auto':'Авто', '10vw':'10vw', '15vw':'15vw', '20vw':'20vw', '25vw':'25vw', '30vw':'30vw', '35vw':'35vw', '40vw':'40vw', '50vw':'50vw', '60vw':'60vw', '70vw':'70vw', '80vw':'80vw', '90vw':'90vw', '100vw':'100vw' };
    var imgHeights = { 'auto':'Авто', '5vh':'5vh', '10vh':'10vh', '15vh':'15vh', '20vh':'20vh', '25vh':'25vh', '30vh':'30vh', '40vh':'40vh', '50vh':'50vh', '60vh':'60vh' };

    var titleCache = Lampa.Storage.get("title_cache_hybrid_v3") || {};
    var uatorCache = {};

    var styles = `
        .ymod-slogan-hidden .full-start__tagline, 
        .ymod-slogan-hidden [class*="tagline"],
        .ymod-slogan-hidden .full-start__description + div:not([class]) {
            display: none !important; height: 0px !important; min-height: 0px !important; margin: 0px !important; padding: 0px !important;
            font-size: 0px !important; line-height: 0 !important; visibility: hidden !important; opacity: 0 !important;
            pointer-events: none !important; position: absolute !important; z-index: -1;
        }
        .ymod-slogan-hidden .full-start__title { margin-bottom: 5px !important; }
        .ymod-slogan-hidden .full-start__details { margin-top: 0px !important; margin-bottom: 10px !important; }

        .ymod-hybrid-enabled .full-start-new__head, 
        .ymod-hybrid-enabled .full-start__head { 
            display: none !important; height: 0px !important; margin: 0 !important; padding: 0 !important; visibility: hidden !important; position: absolute !important; 
        }

        .plugin-hybrid-title { margin-top: 5px; margin-bottom: 5px; width: 100%; position: relative; z-index: 10; text-align: left; }
        .plugin-hybrid-title__body { line-height: 1.2; font-weight: bold; display: flex; align-items: baseline; flex-wrap: wrap; justify-content: flex-start; }
        
        .quality-badges-container { display: flex; align-items: center; }
        .qb-unified-block { display: flex; flex-wrap: nowrap; align-items: center; }
        .quality-badge { display: inline-flex; align-items: center; gap: 0.35em; color: #fff; white-space: nowrap; flex-shrink: 0; height: 1.1em; }
        .qb-text { font-weight: bold; line-height: 1.1em; height: 1.1em; display: flex; align-items: center; }
        .qb-prefix-icon { height: 1.1em !important; width: auto; display: block; object-fit: contain; margin: 0; }
        .qb-text-icon { height: 1.1em !important; line-height: 1.1em !important; font-size: 0.85em !important; font-weight: 900; display: inline-flex; align-items: center; justify-content: center; background: #fff; color: #000; padding: 0 0.25em; border-radius: 2px; box-sizing: border-box; vertical-align: top; }
        .qb-not-found { opacity: 0.6; }
        
        .card .qb-unified-block { position: absolute; top: 0.5rem; left: 0.5rem; z-index: 10; flex-direction: column; align-items: flex-start; gap: 0.2rem !important; font-size: 0.7em !important; }
        .card .quality-badge { background: rgba(0, 0, 0, 0.6); padding: 2px 4px; border-radius: 4px; height: 1em; }
        .card .qb-prefix-icon, .card .qb-text-icon { height: 1em !important; }
        .card .qb-text { height: 1em; line-height: 1em; }

        .ymod-gap-negative > *:not(:first-child) {
            margin-left: var(--ymod-gap-negative, 0px) !important;
        }

        .ymod-logo-loader {
            width: 250px; height: 3em; margin: 5px 0;
            background: linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.05) 75%);
            background-size: 200% 100%; animation: ymod-loading 1.5s infinite linear; border-radius: 8px;
            display: inline-block;
        }
        @keyframes ymod-loading { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

        img.ymod-poster-rounded,
        .full-start-new__poster img,
        .full-start__poster img,
        img.full-start__poster {
            border-radius: 36px 36px 36px 36px !important;
            border-top-left-radius: 36px !important;
            border-top-right-radius: 36px !important;
            border-bottom-left-radius: 36px !important;
            border-bottom-right-radius: 36px !important;
            -webkit-border-radius: 36px !important;
            -webkit-border-top-left-radius: 36px !important;
            -webkit-border-top-right-radius: 36px !important;
            -webkit-border-bottom-left-radius: 36px !important;
            -webkit-border-bottom-right-radius: 36px !important;
            -moz-border-radius: 36px !important;
            -moz-border-radius-topleft: 36px !important;
            -moz-border-radius-topright: 36px !important;
            -moz-border-radius-bottomleft: 36px !important;
            -moz-border-radius-bottomright: 36px !important;
            overflow: hidden !important;
            box-shadow: 0px 8px 25px rgba(0,0,0,0.3) !important;
        }

        .ymod-apple-container {
            display: inline-flex !important; align-items: center;
            padding: 0.21em 0.32em !important; border-radius: 999px !important;
            background: rgba(22,24,30,.28) !important; border: 1px solid rgba(255,255,255,.10) !important;
            box-shadow: inset 0 1px 0 rgba(255,255,255,.10), 0 8px 18px rgba(0,0,0,.12) !important;
            backdrop-filter: blur(18px) saturate(140%) !important; -webkit-backdrop-filter: blur(18px) saturate(140%) !important;
            width: max-content;
        }
        .ymod-apple-container.is-lite {
            background: rgba(30, 32, 40, 0.98) !important; box-shadow: 0 4px 15px rgba(0,0,0,0.6) !important;
            backdrop-filter: none !important; -webkit-backdrop-filter: none !important;
        }
        .ymod-apple-item {
            border: 0 !important; background: transparent !important; color: rgba(255,255,255,.92) !important;
            height: 2.16em !important; min-height: 2.16em !important; 
            display: inline-flex !important; align-items: center; justify-content: center;
            padding: 0 0.8em !important; border-radius: 999px !important;
            transition: background .2s ease !important; cursor: pointer; outline: none; margin: 0 !important;
        }
        .ymod-apple-item.focus, .ymod-apple-item.hover {
            background: rgba(255,255,255,.14) !important; box-shadow: inset 0 1px 0 rgba(255,255,255,.10) !important; transform: none !important;
        }
        .ymod-apple-container .quality-badge { padding: 0 0.8em !important; }

        body .full-start__buttons,
        body .full-start-new__buttons,
        body.ymod-buttons-apple .full-start__buttons,
        body.ymod-buttons-apple .full-start-new__buttons {
            display: inline-flex !important; align-items: center; justify-content: flex-start;
            margin-top: var(--ymod-btn-margin-top, 1em) !important;
            max-width: 100%; flex-wrap: wrap !important; gap: 0.25em !important;
            box-sizing: border-box;
        }
        
        body.ymod-buttons-apple .full-start__buttons,
        body.ymod-buttons-apple .full-start-new__buttons {
            padding: 0.35em 0.4em !important; border-radius: 999px !important;
            background: rgba(22,24,30,.28) !important; border: 1px solid rgba(255,255,255,.10) !important;
            box-shadow: inset 0 1px 0 rgba(255,255,255,.10), 0 8px 18px rgba(0,0,0,.12) !important;
            backdrop-filter: blur(18px) saturate(140%) !important; -webkit-backdrop-filter: blur(18px) saturate(140%) !important;
            font-size: var(--ymod-btn-size, 1em) !important;
        }
        
        body.ymod-buttons-apple-lite .full-start__buttons,
        body.ymod-buttons-apple-lite .full-start-new__buttons {
            background: rgba(30, 32, 40, 0.98) !important; box-shadow: 0 4px 15px rgba(0,0,0,0.6) !important;
            backdrop-filter: none !important; -webkit-backdrop-filter: none !important;
        }

        body.ymod-buttons-apple .full-start__button,
        body.ymod-buttons-apple .full-start-new__button {
            border: 0 !important; background: transparent !important; color: rgba(255,255,255,.92) !important;
            height: 2.8em !important; min-height: 2.8em !important; align-items: center; justify-content: center;
            padding: 0 1.2em !important; border-radius: 999px !important; transition: background .2s ease !important;
            margin: 0 !important; font-weight: bold; font-size: inherit !important; box-shadow: none !important;
        }
        
        body.ymod-buttons-apple .full-start__button:not(.hidden):not(.hide):not([style*="display: none"]):not([style*="display:none"]),
        body.ymod-buttons-apple .full-start-new__button:not(.hidden):not(.hide):not([style*="display: none"]):not([style*="display:none"]) {
            display: inline-flex !important;
        }
        
        body.ymod-buttons-apple .ua-sites-container {
            display: inline-flex !important; align-items: center; gap: 0.25em !important; margin: 0 !important; padding: 0 !important; background: transparent !important; border: none !important; box-shadow: none !important;
        }
        body.ymod-buttons-apple .ua-btn-item {
            border: 0 !important; background: transparent !important; color: rgba(255,255,255,.92) !important;
            height: 2.8em !important; min-height: 2.8em !important; width: 2.8em !important; display: inline-flex !important; align-items: center; justify-content: center;
            border-radius: 999px !important; transition: background .2s ease !important; margin: 0 !important; padding: 0 !important; box-shadow: none !important;
            font-size: inherit !important; 
        }
        body.ymod-buttons-apple .full-start__button.focus, 
        body.ymod-buttons-apple .full-start__button:hover,
        body.ymod-buttons-apple .ua-btn-item.focus,
        body.ymod-buttons-apple .ua-btn-item:hover,
        body.ymod-buttons-apple .ua-btn-item.active.focus {
            background: rgba(255,255,255,.14) !important; box-shadow: inset 0 1px 0 rgba(255,255,255,.10) !important; transform: none !important; color: #fff !important;
        }
        body.ymod-buttons-apple .ua-btn-item.active {
            transform: none !important;
        }
        body.ymod-buttons-apple .full-start__button svg {
            width: 1.2em !important; height: 1.2em !important; margin-right: 0.4em !important;
        }
        body.ymod-buttons-apple .full-start__button.button--options svg {
            margin-right: 0 !important;
        }
        body.ymod-buttons-apple .full-start__button.button--options {
            padding: 0 0.8em !important;
        }
        body.ymod-buttons-apple .ua-btn-item img,
        body.ymod-buttons-apple .ua-btn-item svg {
            width: 1.5em !important; height: 1.5em !important; border-radius: 0 !important; display: block; filter: none !important;
        }
        body.ymod-buttons-apple .ua-sites-container:not(.is-bw) .ua-btn-item.active.focus img {
            filter: drop-shadow(0px 1px 2px rgba(0,0,0,0.3)) !important;
        }
        body.ymod-buttons-apple .ua-btn-item.loading svg {
            animation: spin-badge 1.5s linear infinite !important;
        }

        @media screen and (orientation: portrait), screen and (max-width: 767px) {
            .plugin-hybrid-title { text-align: center !important; }
            .plugin-hybrid-title__body { justify-content: center !important; }
            .quality-badges-container { width: 100%; justify-content: center; display: block !important; margin: 10px 0; clear: both; }
            .qb-unified-block { flex-wrap: wrap; justify-content: center; width: 100%; }
            .ymod-apple-container { flex-wrap: wrap !important; width: 100% !important; justify-content: center !important; }
            body.ymod-buttons-apple .full-start__buttons,
            body.ymod-buttons-apple .full-start-new__buttons {
                justify-content: center !important; width: 100% !important; margin-left: 0 !important; margin-right: 0 !important;
            }

            .card__age { text-align: center !important; width: 100% !important; display: block !important; }
            .full-start__pg { text-align: center !important; display: flex !important; justify-content: center !important; align-items: center !important; margin-left: auto !important; margin-right: auto !important; }
            .full-start-new__details, .full-start__details { justify-content: center !important; display: flex !important; flex-wrap: wrap !important; }
            .full-start-new__details > *, .full-start__details > * { text-align: center !important; margin: 0.45em !important; }
        }
        
        div[data-component="ym_logo"], div[data-component="ym_title"], div[data-component="ym_uator"], div[data-component="ym_buttons"] { display: none !important; }
    `;
    $('head').append('<style id="ymod-global-styles">' + styles + '</style>');

    function updateBodyClasses() {
        if (isEnabled('slogan')) $('body').addClass('ymod-slogan-hidden');
        else $('body').removeClass('ymod-slogan-hidden');

        if (isEnabled('hybrid')) $('body').addClass('ymod-hybrid-enabled');
        else $('body').removeClass('ymod-hybrid-enabled');

        var btnStyle = Lampa.Storage.get('ym_button_style', 'normal');
        var btnSize = Lampa.Storage.get('ym_button_size', '1em');
        var btnMarginTop = Lampa.Storage.get('ym_button_margin_top', '1em');
        
        $('body').removeClass('ymod-buttons-apple ymod-buttons-apple-lite');
        if (btnStyle === 'apple') $('body').addClass('ymod-buttons-apple');
        if (btnStyle === 'apple_lite') $('body').addClass('ymod-buttons-apple ymod-buttons-apple-lite');
        
        document.documentElement.style.setProperty('--ymod-btn-size', btnSize);
        document.documentElement.style.setProperty('--ymod-btn-margin-top', btnMarginTop);
    }
    updateBodyClasses();

    function ymodCleanSlogan() {
        var full = document.querySelector('.full-start');
        if (full) {
            var nodes = full.querySelectorAll('div, span, p');
            nodes.forEach(function(node) {
                if (node.innerText && node.innerText.length > 3 && node.innerText.length < 150) {
                    var prev = node.previousElementSibling;
                    if (prev && prev.classList.contains('full-start__details')) {
                        node.style.display = 'none';
                        node.setAttribute('data-slogan-hidden', 'true');
                    }
                }
            });
        }
    }

    var sloganObserver = new MutationObserver(function() {
        if (isEnabled('slogan')) ymodCleanSlogan();
    });
    sloganObserver.observe(document.body, { childList: true, subtree: true });

    function analyzeAndInvert(img, threshold) {
        try {
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');
            canvas.width = img.naturalWidth || img.width;
            canvas.height = img.naturalHeight || img.height;
            if (canvas.width === 0 || canvas.height === 0) return;
            ctx.drawImage(img, 0, 0);
            var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            var data = imageData.data;
            var darkPixels = 0;
            var totalPixels = 0;
            for (var i = 0; i < data.length; i += 4) {
                var alpha = data[i + 3];
                if (alpha < 10) continue;
                totalPixels++;
                var r = data[i], g = data[i + 1], b = data[i + 2];
                var brightness = (r * 299 + g * 587 + b * 114) / 1000;
                if (brightness < 120) darkPixels++;
            }
            if (totalPixels > 0 && (darkPixels / totalPixels) >= threshold) {
                var curFilter = img.style.filter || '';
                img.style.filter = curFilter + " drop-shadow(0px -1px 0px rgba(255, 255, 255, 1)) drop-shadow(0px 1px 0px rgba(255, 255, 255, 1)) drop-shadow(-1px 0px 0px rgba(255, 255, 255, 1)) drop-shadow(1px 0px 0px rgba(255, 255, 255, 1))";
            }
        } catch (e) {}
    }
    function handleLogo(e) {
        var render = e.object.activity.render();
        var data = e.data.movie;
        var type = data.name ? "tv" : "movie";
        
        var isMoveEnabled = Lampa.Storage.get("logo_move", false);
        var isLandscape = window.innerWidth > window.innerHeight;

        var originalTitle = render.find(".full-start-new__title, .full-start__title").not('.ymod-moved-title').first();
        var finalTarget = originalTitle;

        if (originalTitle.length) {
            if (!originalTitle.data('ymod-orig-html')) {
                var rawHtml = originalTitle.html();
                if (rawHtml && rawHtml.indexOf('ymod-logo-loader') === -1) {
                    originalTitle.data('ymod-orig-html', rawHtml);
                } else {
                    originalTitle.data('ymod-orig-html', data.title || data.name || "Title");
                }
            }
        }

        if (isMoveEnabled && isLandscape && originalTitle.length) {
            var body = render.find('.full-start-new__body');
            if (body.length) {
                var wrapper = render.find('.ymod-title-wrapper');
                if (wrapper.length === 0) {
                    body.css('position', 'relative');
                    wrapper = $('<div class="ymod-title-wrapper"></div>');
                    var mT = Lampa.Storage.get("logo_margin_top", "0px");
                    var mL = Lampa.Storage.get("logo_margin_left", "0px");
                    var mB = Lampa.Storage.get("logo_margin_bottom", "auto");
                    wrapper.css({
                        'position': 'absolute',
                        'top': mT !== 'auto' ? mT : 'auto',
                        'left': mL !== 'auto' ? mL : 'auto',
                        'bottom': mB !== 'auto' && mB !== '0px' ? mB : 'auto',
                        'z-index': '9999',
                        'pointer-events': 'none',
                        'box-sizing': 'border-box',
                        'max-width': '100vw'
                    });
                    body.append(wrapper);
                }

                var movedTitle = render.find('.ymod-moved-title');
                if (movedTitle.length === 0) {
                    movedTitle = originalTitle.clone();
                    movedTitle.removeClass('full-start-new__title full-start__title');
                    movedTitle.addClass('ymod-moved-title');
                    movedTitle.data('ymod-orig-html', originalTitle.data('ymod-orig-html'));
                    movedTitle.css({
                        'margin': '0', 'padding': '0', 'line-height': '1.2', 'text-shadow': '1px 1px 3px rgba(0,0,0,0.9)',
                        'text-align': 'left'
                    });
                    wrapper.append(movedTitle);
                }
                originalTitle.hide().attr('style', 'display: none !important;');
                finalTarget = movedTitle;
            }
        } else if (originalTitle.length) {
            if (!isLandscape) finalTarget.css("text-align", "center");
            else finalTarget.css("text-align", "left");
            
            if (!(isMoveEnabled && isLandscape)) {
                var leftM = Lampa.Storage.get("logo_margin_left", "0px");
                if(leftM !== '0px') finalTarget.css('margin-left', leftM);
            }
        }

        var head_elem = render.find(".full-start-new__head");
        var details_elem = render.find(".full-start-new__details");
        if (head_elem.length && details_elem.length && details_elem.find(".logo-moved-head").length === 0 && (!isMoveEnabled || !isLandscape)) {
            var content = head_elem.html();
            if (content) {
                head_elem.hide();
                if (details_elem.children().length > 0) details_elem.append('<span class="full-start-new__split logo-moved-separator">●</span>');
                details_elem.append('<span class="logo-moved-head">' + content + "</span>");
            }
        }

        function applyTextFallback() {
            if (!finalTarget.length) return;
            var orig = finalTarget.data('ymod-orig-html');
            if (orig) finalTarget.html(orig);
            
            var customSize = Lampa.Storage.get("logo_custom_text_size", "3.0em");
            var customW = Lampa.Storage.get("logo_custom_width", "auto");
            var customH = Lampa.Storage.get("logo_custom_height", "auto");
            var defaultMaxW = (isMoveEnabled && isLandscape) ? "100%" : (!isLandscape ? "90vw" : "50vw");

            finalTarget.css({
                'font-size': customSize,
                'white-space': 'normal',
                'word-break': 'break-word',
                'overflow-wrap': 'break-word',
                'max-width': customW !== "auto" ? customW : defaultMaxW,
                'max-height': customH !== "auto" ? customH : 'none',
                'display': 'block',
                'margin': '0',
                'padding': '0',
                'line-height': '1.2',
                'text-shadow': '1px 1px 3px rgba(0,0,0,0.9)',
                'text-align': (isMoveEnabled && isLandscape) ? 'left' : (!isLandscape ? 'center' : 'left'),
                'opacity': '1'
            });

            finalTarget[0].style.setProperty("overflow", "visible", "important");
            var pElem = finalTarget[0].parentElement;
            if (pElem) {
                pElem.style.setProperty("overflow", "visible", "important");
            }

            if (!(isMoveEnabled && isLandscape)) {
                var mLeftStatic = Lampa.Storage.get("logo_margin_left", "0px");
                if (mLeftStatic !== '0px') finalTarget.css('margin-left', mLeftStatic);
            }
        }

        if (Lampa.Storage.get("logo_glav", "0") == "1") {
            applyTextFallback();
            return;
        }

        var imgType = Lampa.Storage.get("logo_type", "logo");
        var user_lang = Lampa.Storage.get("logo_lang", "uk");
        var target_lang = user_lang ? user_lang : Lampa.Storage.get("language");
        var size = Lampa.Storage.get("logo_size", "original");
        var cache_key = "img_cache_v3_" + type + "_" + data.id + "_" + target_lang + "_" + imgType;

        var isPoster = imgType.indexOf("poster") !== -1;
        var isBackdrop = imgType.indexOf("backdrop") !== -1;

        function startLogoAnimation(img_url, save_to_cache) {
            if (save_to_cache) Lampa.Storage.set(cache_key, img_url);
            var img = new Image();
            img.crossOrigin = "anonymous";
            img.src = img_url;
            
            img.onload = function () {
                if (finalTarget.length) {
                    finalTarget[0].style.height = ""; 
                    finalTarget[0].style.margin = "0"; 
                    finalTarget[0].style.padding = "0";
                    finalTarget[0].style.display = "block"; 
                    finalTarget[0].style.transition = "none";
                    finalTarget[0].style.boxSizing = "border-box"; 
                    finalTarget[0].style.opacity = "1";
                    
                    finalTarget[0].style.setProperty("overflow", "visible", "important");
                    finalTarget[0].style.setProperty("white-space", "normal", "important");
                    var pElem = finalTarget[0].parentElement;
                    if (pElem) {
                        pElem.style.setProperty("overflow", "visible", "important");
                    }
                    
                    if (!isLandscape) {
                        finalTarget[0].style.textAlign = "center";
                    } else {
                        finalTarget[0].style.textAlign = "left";
                    }
                    
                    if (!(isMoveEnabled && isLandscape)) {
                        var mLeftStatic = Lampa.Storage.get("logo_margin_left", "0px");
                        if(mLeftStatic !== '0px') finalTarget[0].style.marginLeft = mLeftStatic;
                    }

                    img.style.marginTop = "0"; img.style.marginBottom = "0"; img.style.paddingTop = "0em"; img.style.paddingBottom = "0em";
                    
                    var customW = Lampa.Storage.get("logo_custom_width", "auto");
                    var defaultCustomH = (isPoster || isBackdrop) ? "40vh" : "15vh";
                    var customH = Lampa.Storage.get("logo_custom_height", defaultCustomH);

                    if (isPoster || isBackdrop) {
                        var defaultH;
                        if (isPoster) {
                            defaultH = isLandscape ? "55vh" : "40vh";
                        } else {
                            defaultH = isLandscape ? "35vh" : "25vh";
                        }

                        img.style.width = customW !== "auto" ? customW : "auto";
                        img.style.height = customH !== "auto" ? customH : (customW === "auto" ? defaultH : "auto");
                        
                        img.style.maxWidth = "100%"; 
                        img.style.maxHeight = customH !== "auto" ? customH : "80vh";
                        
                        img.style.aspectRatio = isPoster ? "2 / 3" : "16 / 9";
                        img.style.objectFit = "cover";
                        img.classList.add('ymod-poster-rounded');
                    } else {
                        var defaultMaxW = (isMoveEnabled && isLandscape) ? "100%" : (!isLandscape ? "90vw" : "50vw");
                        var defaultMaxH = (isMoveEnabled && isLandscape) ? "100%" : "60vh";
                        
                        img.style.width = customW !== "auto" ? customW : "auto";
                        img.style.height = "auto";
                        
                        if (customW === "auto" && !isLandscape) {
                            img.style.width = "100%";
                        }
                        
                        img.style.maxWidth = customW !== "auto" ? customW : defaultMaxW;
                        img.style.maxHeight = customH !== "auto" ? customH : defaultMaxH;
                        img.style.objectFit = "contain";
                        img.classList.remove('ymod-poster-rounded');
                    }
                    
                    img.style.display = "inline-block";
                    img.style.boxSizing = "border-box";
                    
                    if (isMoveEnabled && isLandscape) {
                        img.style.objectPosition = "left top"; 
                        img.style.marginLeft = "0"; 
                        img.style.marginRight = "0"; 
                    } else if (!isLandscape) { 
                        img.style.objectPosition = "center"; 
                        img.style.marginLeft = "auto"; 
                        img.style.marginRight = "auto"; 
                    } else { 
                        img.style.objectPosition = "left bottom"; 
                        img.style.marginLeft = "0"; 
                        img.style.marginRight = "0"; 
                    }
                    
                    img.style.opacity = "1"; img.style.transition = "none";
                    var saturation = Lampa.Storage.get("logo_saturation", "1");
                    img.style.filter = "drop-shadow(3px 3px 3px rgba(0, 0, 0, 0.5)) saturate(" + saturation + ")";
                    
                    if (!isPoster && !isBackdrop) analyzeAndInvert(img, 0.90);
                    
                    finalTarget.empty().append(img);
                }
            };
            img.onerror = function () {
                Lampa.Storage.set(cache_key, "none");
                applyTextFallback();
            };
        }

        var cached_url = Lampa.Storage.get(cache_key);
        if (cached_url && cached_url !== "none") {
            startLogoAnimation(cached_url, false);
            return;
        } else if (cached_url === "none") {
            applyTextFallback();
            return;
        }

        if (finalTarget.length) {
            finalTarget.html('<div class="ymod-logo-loader"></div>');
            finalTarget.css({
                'display': 'block', 'margin': '0', 'padding': '0',
                'text-align': (isMoveEnabled && isLandscape) ? 'left' : (!isLandscape ? 'center' : 'left')
            });
            if (!(isMoveEnabled && isLandscape)) {
                var mLf = Lampa.Storage.get("logo_margin_left", "0px");
                if(mLf !== '0px') finalTarget.css('margin-left', mLf);
            }
        }

        if (data.id) {
            var url = Lampa.TMDB.api(type + "/" + data.id + "/images?api_key=" + Lampa.TMDB.key() + "&include_image_language=" + target_lang + ",en,null");
            $.get(url, function (data_api) {
                var final_img = null;
                var targetArray;
                
                if (isPoster) targetArray = data_api.posters;
                else if (isBackdrop) targetArray = data_api.backdrops;
                else targetArray = data_api.logos;

                if (targetArray && targetArray.length > 0) {
                    var found;
                    if (imgType.indexOf("_ua") !== -1) {
                        found = targetArray.find(function(l) { return l.iso_639_1 == "uk"; }) || 
                                targetArray.find(function(l) { return l.iso_639_1 == "en"; }) || 
                                targetArray[0];
                    } else if (imgType.indexOf("_en") !== -1) {
                        found = targetArray.find(function(l) { return l.iso_639_1 == "en"; }) || 
                                targetArray[0];
                    } else {
                        found = targetArray.find(function(l) { return l.iso_639_1 == target_lang; }) || 
                                targetArray.find(function(l) { return l.iso_639_1 == "en"; }) || 
                                targetArray[0];
                    }
                    if (found) final_img = found.file_path;
                }
                if (final_img) {
                    var img_url = Lampa.TMDB.image("/t/p/" + size + final_img.replace(".svg", ".png"));
                    startLogoAnimation(img_url, true);
                } else {
                    Lampa.Storage.set(cache_key, "none");
                    applyTextFallback();
                }
            }).fail(function() {
                Lampa.Storage.set(cache_key, "none");
                applyTextFallback();
            });
        } else {
            applyTextFallback();
        }
    }

    function getCountryUA(iso) {
        if (!iso) return '';
        var code = iso.toLowerCase().trim();
        return countryNames[code] || Lampa.Lang.translate(code) || iso;
    }

    function renderHybridTitle(render, ukTitle, enTitle, hasLogo, year, country) {
        if (!render) return;
        $(".plugin-hybrid-title", render).remove();
        
        var mode = Lampa.Storage.get('hybrid_title_mode', 'smart');
        var sizeKey = Lampa.Storage.get('hybrid_title_size', 'm');
        var marginLeft = Lampa.Storage.get('hybrid_title_margin_left', '0px');
        var displayTitle = (mode === 'smart' && hasLogo) ? enTitle : ukTitle;
        if (!displayTitle || displayTitle === "undefined") displayTitle = "";

        var sizes = {
            'xs': { title: '1.0em', info: '0.8em' }, 's': { title: '1.2em', info: '0.9em' },
            'm': { title: '1.4em', info: '1.0em' }, 'l': { title: '1.7em', info: '1.1em' },
            'xl': { title: '2.0em', info: '1.2em' }, 'xxl': { title: '2.4em', info: '1.3em' },
            'giant': { title: '3.0em', info: '1.5em' }
        };
        var currentSize = sizes[sizeKey] || sizes['m'];

        var details = [];
        if (year && year !== "undefined") details.push(year);
        if (country && country !== "undefined") details.push(country);
        var secondaryInfo = details.length > 0 ? ' • ' + details.join(' • ') : '';

        var html = '<div class="plugin-hybrid-title" style="margin-left: ' + marginLeft + ';"><div class="plugin-hybrid-title__body">' +
            '<span style="font-size: ' + currentSize.title + '; color: #fff; opacity: 0.8;">' + displayTitle + '</span>' + 
            '<span style="font-size: ' + currentSize.info + '; color: #fff; opacity: 0.5; margin-left: 6px;">' + secondaryInfo + '</span>' +
            '</div></div>';

        var target = render.find(".full-start-new__title, .full-start__title").not('.ymod-moved-title').first();
        if(target.length) target.after(html);

        render.find('.full-start-new__details span, .full-start__details span').each(function() {
            var txt = $(this).text().trim();
            if (/^\d{4}$/.test(txt) || Object.values(countryNames).includes(txt) || !!countryNames[txt.toLowerCase()]) {
                var next = $(this).next('.full-start-new__split');
                if(next.length) next.hide();
                else $(this).prev('.full-start-new__split').hide();
                $(this).hide();
            }
        });
    }

    function handleHybridTitle(e) {
        var card = e.data.movie;
        var render = e.object.activity.render();
        var cached = titleCache[card.id];
        var now = Date.now();

        var imgType = Lampa.Storage.get("logo_type", "logo");

        if (cached && (now - cached.timestamp < 2592000000)) {
            renderHybridTitle(render, cached.ukTitle, cached.enTitle, cached.hasLogo, cached.year, cached.country);
            return;
        }

        var type = card.first_air_date ? "tv" : "movie";
        var url = "https://api.themoviedb.org/3/" + type + "/" + card.id + "?api_key=" + Lampa.TMDB.key() + "&append_to_response=translations,images&include_image_language=uk,en,null";

        $.getJSON(url, function (data) {
            var hasUkrainianImage = false;
            var isPoster = imgType.indexOf("poster") !== -1;
            var isBackdrop = imgType.indexOf("backdrop") !== -1;
            var targetArray = isPoster ? data.images.posters : (isBackdrop ? data.images.backdrops : data.images.logos);

            if (data.images && targetArray) {
                hasUkrainianImage = targetArray.some(function (l) { return l.iso_639_1 === "uk"; });
            }
            var originalName = data.original_title || data.original_name || card.original_title || card.original_name || "";
            var enTitle = data.title || data.name || originalName;
            var ukTitle = enTitle;
            if (data.translations && data.translations.translations) {
                var translation = data.translations.translations.find(function (t) { return t.iso_3166_1 === "UA" || t.iso_639_1 === "uk"; });
                if (translation) ukTitle = translation.data.title || translation.data.name || enTitle;
            }
            var dateStr = data.release_date || data.first_air_date || "";
            var year = dateStr ? dateStr.split("-")[0] : "";
            var countryList = (data.production_countries || []).map(function (c) { return getCountryUA(c.iso_3166_1); });
            var countryString = countryList.join(" / ");

            titleCache[card.id] = { ukTitle: ukTitle || "", enTitle: enTitle || "", hasLogo: hasUkrainianImage, year: year || "", country: countryString || "", timestamp: now };
            Lampa.Storage.set("title_cache_hybrid_v3", titleCache);
            renderHybridTitle(render, ukTitle, enTitle, hasUkrainianImage, year, countryString);
        }).fail(function() {
            var fallbackTitle = card.title || card.name || card.original_title || "";
            renderHybridTitle(render, fallbackTitle, fallbackTitle, false, "", "");
        });
    }

    function getResolutionLabel(width) {
        var w = parseInt(width || 0);
        if (w >= 3800) return '4K';
        if (w >= 2500) return '2K';
        if (w >= 1900) return 'FHD';
        if (w >= 1200) return 'HD';
        return 'SD';
    }

    function getBestAndPopular(results, movie) {
        if (!results || !Array.isArray(results)) return { ukr: false };
        
        var ukrPattern = /(^|[^а-яєіїґa-z])(ukr|ukrainian|українськ[а-яєіїґ]*|укр|ua|укрдубляж|укрпереклад|укрмов[а-яєіїґ]*)($|[^а-яєіїґa-z])/i;
        var ukrResults = [];
        var movieYear = parseInt(movie.release_date || movie.first_air_date || movie.year || 0);
        var isTv = !!(movie.name || movie.first_air_date); 

        results.forEach(function(item) {
            var title = (item.Title || '').toLowerCase();
            
            if (movieYear > 0 && !isTv) {
                var yearMatch = title.match(/\b(19|20)\d{2}\b/g);
                if (yearMatch) {
                    var correctYear = yearMatch.some(function(y) { return Math.abs(parseInt(y) - movieYear) <= 1; });
                    if (!correctYear) return;
                }
            }
            
            var titleClean = title
                .replace(/[a-z0-9\-]+\.(ua|uk)\b/ig, '') 
                .replace(/(укр[а-яєіїґ]*|ukr[a-z]*|ua|ukrainian)[\s\.\,\_\-\|]*(sub|суб)[a-zа-яєіїґ]*/ig, '')
                .replace(/(sub|суб)[a-zа-яєіїґ]*[\s\.\,\_\-\|]*(укр[а-яєіїґ]*|ukr[a-z]*|ua|ukrainian)/ig, '');
                
            var hasUkr = ukrPattern.test(titleClean);

            if (!hasUkr && item.ffprobe && Array.isArray(item.ffprobe)) {
                hasUkr = item.ffprobe.some(function(s) {
                    if (s.codec_type !== 'audio') return false;
                    var l = (s.tags && s.tags.language ? s.tags.language : '').toLowerCase();
                    var t = (s.tags && s.tags.title ? s.tags.title : '').toLowerCase();
                    return l === 'uk' || l === 'ukr' || l === 'ua' || ukrPattern.test(t);
                });
            }

            if (!hasUkr) {
                var trackerName = (item.tracker || item.Tracker || item.name || '').toLowerCase();
                if (trackerName.indexOf('toloka') !== -1 || trackerName.indexOf('mazepa') !== -1) {
                    hasUkr = true;
                }
            }

            if (hasUkr) {
                var width = 0;
                if (item.ffprobe) {
                    item.ffprobe.forEach(function(s) { if (s.codec_type === 'video' && s.width) width = Math.max(width, parseInt(s.width)); });
                }
                if (width === 0) {
                    if (/2160|4k|uhd/i.test(title)) width = 3840; 
                    else if (/1080|fhd/i.test(title)) width = 1920; 
                    else if (/720|hd/i.test(title)) width = 1280; 
                    else if (/480|sd/i.test(title)) width = 720; 
                    else width = 720;
                }
                item.detectedWidth = width;
                item.seedersCount = parseInt(item.Seeders || 0);
                ukrResults.push(item);
            }
        });

        if (ukrResults.length === 0) return { ukr: false };

        var best = ukrResults.reduce(function(p, c) { 
            if (p.detectedWidth > c.detectedWidth) return p;
            if (p.detectedWidth < c.detectedWidth) return c;
            return (p.seedersCount > c.seedersCount) ? p : c;
        });
        var popular = ukrResults.reduce(function(p, c) { return (p.seedersCount > c.seedersCount) ? p : c; });
        var tech = { hdr: false, dv: false, audio: null };
        var maxChannels = 0;

        ukrResults.forEach(function(item) {
            if (item.ffprobe) {
                item.ffprobe.forEach(function(s) { if (s.codec_type === 'audio' && s.channels) maxChannels = Math.max(maxChannels, parseInt(s.channels)); });
            }
            var t = item.Title.toLowerCase();
            if (t.match(/7\.1|8ch/)) maxChannels = Math.max(maxChannels, 8);
            else if (t.match(/5\.1|6ch/)) maxChannels = Math.max(maxChannels, 6);
            else if (t.match(/2\.0/)) maxChannels = Math.max(maxChannels, 2);
        });

        if (maxChannels > 0) tech.audio = (maxChannels >= 8) ? '7.1' : (maxChannels >= 6) ? '5.1' : (maxChannels >= 4) ? '4.0' : '2.0';

        if (best.ffprobe) {
            best.ffprobe.forEach(function(s) {
                if (s.codec_type === 'video') {
                    var side = JSON.stringify(s.side_data_list || []);
                    if (/vision|dovi/i.test(side)) tech.dv = true;
                    if (s.color_transfer === 'smpte2084') tech.hdr = true;
                }
            });
        }
        var bTitle = best.Title.toLowerCase();
        if (!tech.dv && /vision|dovi/i.test(bTitle)) tech.dv = true;
        if (!tech.hdr && /hdr/i.test(bTitle)) tech.hdr = true;

        return { ukr: true, bestRes: getResolutionLabel(best.detectedWidth), popRes: getResolutionLabel(popular.detectedWidth), popSeeds: popular.seedersCount, tech: tech };
    }

    function renderUator(container, data) {
        container.find('.qb-unified-block').remove();
        if (!data) return;

        var isCard = container.closest('.card').length > 0 || container.hasClass('card__view');
        var styleType = isCard ? 'normal' : Lampa.Storage.get('uator_style', 'normal');
        var isApple = (styleType === 'apple' || styleType === 'apple_lite');

        var size = Lampa.Storage.get('uator_rating_size', '1.1em');
        var saturation = Lampa.Storage.get('uator_saturation', '100%');
        var uatorGap = Lampa.Storage.get('uator_gap', '0.45em');
        
        var blockClass = 'qb-unified-block' + (isApple ? ' ymod-apple-container' + (styleType === 'apple_lite' ? ' is-lite' : '') : '');
        var blockStyle = 'font-size: ' + size + ';';

        if (uatorGap.indexOf('-') !== -1) {
            blockStyle += ' gap: 0px; --ymod-gap-negative: ' + uatorGap + ';';
            blockClass += ' ymod-gap-negative';
        } else {
            blockStyle += ' gap: ' + uatorGap + ';';
        }

        var block = $('<div class="' + blockClass + '" style="' + blockStyle + '"></div>');
        var badgeClass = 'quality-badge' + (isApple ? ' ymod-apple-item' : '');

        if (!data.ukr) {
            var iconHtml = (saturation === '0%') ? '<span class="qb-text-icon">UA</span>' : '<img src="'+uatorIcons.none+'" class="qb-prefix-icon" style="filter: saturate('+saturation+')">';
            block.append('<div class="' + badgeClass + ' qb-not-found">' + iconHtml + '<span class="qb-text">немає</span></div>');
        } else {
            var items = [ {i: uatorIcons.ua, t: data.bestRes, type: 'ua'}, {i: uatorIcons.top, t: data.popRes}, {i: uatorIcons.seeds, t: data.popSeeds} ];
            if (data.tech.audio) items.push({i: uatorIcons.audio, t: data.tech.audio});
            if (data.tech.dv) items.push({i: uatorIcons.dv, t: '', type: 'dv'});
            if (data.tech.hdr) items.push({i: uatorIcons.hdr, t: '', type: 'hdr'});
            
            items.forEach(function(it) {
                var iconHtml = '';
                if (it.i) {
                    var style = 'filter: saturate('+saturation+');';
                    if (it.type === 'ua' && saturation === '0%') iconHtml = '<span class="qb-text-icon">UA</span>';
                    else {
                        if (it.type === 'dv') style = 'filter: brightness(0) invert(1);';
                        else if (it.type === 'hdr') style = 'filter: grayscale(1);';
                        iconHtml = '<img src="'+it.i+'" class="qb-prefix-icon" style="'+style+'">';
                    }
                }
                var textHtml = it.t ? '<span class="qb-text">' + it.t + '</span>' : '';
                block.append('<div class="' + badgeClass + '">' + iconHtml + textHtml + '</div>');
            });
        }
        container.append(block);
    }

    function processUatorCards() {
        if (!isEnabled('uator')) return;
        $('.card:not(.qb-processed)').each(function() {
            var card = $(this);
            var movie = card.data('item');
            if (movie && movie.id) {
                card.addClass('qb-processed');
                var key = movie.id + '_' + (movie.title || movie.name);
                if (uatorCache[key] && uatorCache[key].ukr) {
                    renderUator(card.find('.card__view'), uatorCache[key]);
                } else {
                    var localSearch = movie.title || movie.name;
                    var origSearch = movie.original_title || movie.original_name;
                    
                    Lampa.Parser.get({ search: localSearch, movie: movie, page: 1 }, function(res) {
                        var data = (res && res.Results) ? getBestAndPopular(res.Results, movie) : { ukr: false };
                        if (data.ukr) { 
                            uatorCache[key] = data; 
                            renderUator(card.find('.card__view'), data); 
                        } else if (origSearch && origSearch !== localSearch) {
                            Lampa.Parser.get({ search: origSearch, movie: movie, page: 1 }, function(res2) {
                                var data2 = (res2 && res2.Results) ? getBestAndPopular(res2.Results, movie) : { ukr: false };
                                uatorCache[key] = data2;
                                if (data2.ukr) renderUator(card.find('.card__view'), data2);
                            }, function() { uatorCache[key] = data; });
                        } else {
                            uatorCache[key] = data;
                        }
                    }, function() { uatorCache[key] = { ukr: false }; });
                }
            }
        });
    }
    setInterval(processUatorCards, 2000);

    function handleUatorFull(e) {
        var renderTarget = e.object.activity.render();
        var isPortrait = window.innerHeight > window.innerWidth;
        var cont = $('.quality-badges-container', renderTarget);
        if (!cont.length) { 
            cont = $('<div class="quality-badges-container"></div>'); 
            if (isPortrait) {
                var title = $('.full-start-new__title, .full-start__title', renderTarget).not('.ymod-moved-title').first();
                if(title.length) title.after(cont);
            } else {
                var rateLine = $('.full-start-new__rate-line, .full-start__rate-line', renderTarget);
                if (rateLine.length) rateLine.append(cont);
                else $('.full-start__info', renderTarget).append(cont);
            }
        }
        
        var mLeft = Lampa.Storage.get('uator_margin_left', '0px');
        cont.css('margin-left', mLeft);
        
        var movie = e.data.movie;
        var localSearch = movie.title || movie.name;
        var origSearch = movie.original_title || movie.original_name;
        
        Lampa.Parser.get({ search: localSearch, movie: movie, page: 1 }, function(res) {
            var data = (res && res.Results) ? getBestAndPopular(res.Results, movie) : { ukr: false };
            if (data.ukr) { 
                renderUator(cont, data); 
            } else if (origSearch && origSearch !== localSearch) {
                Lampa.Parser.get({ search: origSearch, movie: movie, page: 1 }, function(res2) {
                    var data2 = (res2 && res2.Results) ? getBestAndPopular(res2.Results, movie) : { ukr: false };
                    renderUator(cont, data2);
                }, function() { renderUator(cont, data); });
            } else {
                renderUator(cont, data);
            }
        }, function() { renderUator(cont, { ukr: false }); });
    }

    Lampa.Listener.follow('full', function(e) {
        if (e.type === 'complite' || e.type === 'ready') {
            if (isEnabled('slogan')) ymodCleanSlogan();
        }
        if (e.type === 'complite' || e.type === 'complete') {
            var render = e.object && e.object.activity ? e.object.activity.render() : null;
            if(render) {
                if (render.data('ymod_processed')) return;
                render.data('ymod_processed', true);
            }

            if (isEnabled('logo')) handleLogo(e);
            if (isEnabled('hybrid')) handleHybridTitle(e);
            if (isEnabled('uator')) handleUatorFull(e);
        }
    });

    function createSettings() {
        var MAIN_C = 'yariks_mod_main';
        Lampa.SettingsApi.addComponent({ component: MAIN_C, name: "Yarik's Mod", icon: yIcon });
        Lampa.SettingsApi.addComponent({ component: 'ym_logo', name: 'Лого / Постер' });
        Lampa.SettingsApi.addComponent({ component: 'ym_title', name: 'Додаткова назва' });
        Lampa.SettingsApi.addComponent({ component: 'ym_buttons', name: 'Кнопки карток' });
        Lampa.SettingsApi.addComponent({ component: 'ym_uator', name: 'Uator' });

        function addStatic(comp, name, title, desc, onClick) {
            Lampa.SettingsApi.addParam({ component: comp, param: { name: name, type: "static" }, field: { name: title, description: desc }, onRender: function (item) { item.on("hover:enter", onClick); } });
        }
        function addToggle(comp, modName, title, desc) {
            Lampa.SettingsApi.addParam({ component: comp, param: { name: YMOD + 'enable_' + modName, type: "trigger", default: true }, field: { name: title, description: desc }, onChange: function(val) { Lampa.Storage.set(YMOD + 'enable_' + modName, val); updateBodyClasses(); } });
        }
        function addSelect(comp, name, title, desc, values, def, onChange) {
            Lampa.SettingsApi.addParam({ component: comp, param: { name: name, type: "select", values: values, default: def }, field: { name: title, description: desc }, onChange: onChange });
        }
        function backTo(comp, target) {
            addStatic(comp, comp+'_back', "Назад", "Повернутися", function() { Lampa.Settings.create(target); });
        }
        function clearCacheBtn(comp, title, prefix) {
            addStatic(comp, comp+'_clear', title, "Очистити кеш плагіну", function() {
                for (var i = 0; i < localStorage.length; i++) {
                    var key = localStorage.key(i);
                    if (key && key.indexOf(prefix) !== -1) { localStorage.removeItem(key); i--; }
                }
                Lampa.Noty.show("Кеш очищено. Перезавантаження...");
                setTimeout(function() { window.location.reload(); }, 1000);
            });
        }

        addToggle(MAIN_C, 'slogan', "Приховування слогану", "Прибрати короткі слогани під назвою");
        
        addStatic(MAIN_C, "ym_logo_entry", "Лого / Постер (Smart)", "Заміна тексту назви на картинку", function() { Lampa.Settings.create('ym_logo'); });
        backTo('ym_logo', MAIN_C);
        addToggle('ym_logo', 'logo', "Увімкнути плагін", "Відображати графічну назву");
        Lampa.SettingsApi.addParam({ component: 'ym_logo', param: { name: "logo_move", type: "trigger", default: false }, field: { name: "Перенести назву", description: "Перемістити назву в лівий верхній кут (гориз. екрани)" } });
        addSelect('ym_logo', "logo_glav", "Режим заміни", "", { 1: "Текст (вимкнути картинку)", 0: "Картинка (Лого/Постер)" }, "0");
        
        addSelect('ym_logo', "logo_type", "Що показувати?", "Логотип або постер фільму", { 
            "logo": "Логотип (текстовий дизайн)", 
            "poster_ua": "Вертикальний постер (UA -> EN)", 
            "poster_en": "Вертикальний постер (Тільки EN)",
            "backdrop_ua": "Горизонтальний постер (UA -> EN)",
            "backdrop_en": "Горизонтальний постер (Тільки EN)"
        }, "logo");
        
        addSelect('ym_logo', "logo_custom_text_size", "Розмір назви (текст)", "Якщо вибрано 'Текст'", extSizes, '3.0em');
        addSelect('ym_logo', "logo_lang", "Мова логотипа", "Пріоритет мови", { "": "Як у Lampa", en: "English", uk: "Українська" }, "uk");
        addSelect('ym_logo', "logo_size", "Якість TMDB", "", { w300: "w300", w500: "w500", w780: "w780", original: "Оригінал" }, "original");
        addSelect('ym_logo', "logo_custom_width", "Обмеження по ширині (vw)", "Відносно ширини екрану", imgWidths, "auto");
        addSelect('ym_logo', "logo_custom_height", "Обмеження по висоті (vh)", "Відносно висоти екрану", imgHeights, "auto");
        addSelect('ym_logo', "logo_margin_left", "Зсув ліворуч", "Зсув назви або лого", extMarginsLeft, "0px");
        addSelect('ym_logo', "logo_saturation", "Насиченість кольору лого", "", { "0": "Чорно-біле", "0.5": "50%", "0.8": "80%", "1": "100% (Норма)", "1.2": "120%", "1.5": "150%" }, "1");
        clearCacheBtn('ym_logo', "Очистити кеш логотипів", "img_cache_v3_");

        addStatic(MAIN_C, "ym_title_entry", "Додаткова назва", "Гібридний режим та оригінальні назви", function() { Lampa.Settings.create('ym_title'); });
        backTo('ym_title', MAIN_C);
        addToggle('ym_title', 'hybrid', "Увімкнути плагін", "Показувати додаткову назву та інфо");
        addSelect('ym_title', "hybrid_title_mode", "Режим відображення", "", { "smart": "Smart (EN якщо є лого, UA якщо немає)", "uk": "Завжди українська назва", "en": "Завжди англійська назва" }, "smart");
        addSelect('ym_title', "hybrid_title_size", "Розмір шрифту", "", { 'xs': 'Маленький (XS)', 's': 'Нижче середнього (S)', 'm': 'Середній (M)', 'l': 'Більше середнього (L)', 'xl': 'Великий (XL)', 'xxl': 'Дуже великий (XXL)', 'giant': 'Гігантський' }, "m");
        addSelect('ym_title', "hybrid_title_margin_left", "Зсув ліворуч", "", extMarginsLeft, "0px");
        clearCacheBtn('ym_title', "Очистити кеш назв", "title_cache_hybrid_v3");

        addStatic(MAIN_C, "ym_buttons_entry", "Стиль кнопок картки", "Apple Glass та нові стилі", function() { Lampa.Settings.create('ym_buttons'); });
        backTo('ym_buttons', MAIN_C);
        addSelect('ym_buttons', "ym_button_style", "Стиль кнопок", "", { "normal": "Стандартний Lampa", "apple": "Apple Glass (Затемнений ефект)", "apple_lite": "Apple Glass Lite (Суцільний фон)" }, "normal", updateBodyClasses);
        addSelect('ym_buttons', "ym_button_size", "Розмір кнопок", "", extSizes, "1.0em", updateBodyClasses);
        addSelect('ym_buttons', "ym_button_margin_top", "Відступ зверху", "", extMargins, "1.0em", updateBodyClasses);

        addStatic(MAIN_C, "ym_uator_entry", "Uator (Якість укр. роздач)", "Індикатор наявності української озвучки", function() { Lampa.Settings.create('ym_uator'); });
        backTo('ym_uator', MAIN_C);
        addToggle('ym_uator', 'uator', "Увімкнути плагін", "Аналізувати наявність укр. торрентів");
        addSelect('ym_uator', "uator_style", "Стиль бейджів", "", { "normal": "Звичайний", "apple": "Apple Glass (Прозорий)", "apple_lite": "Apple Glass Lite (Темний)" }, "normal");
        addSelect('ym_uator', "uator_rating_size", "Розмір шрифту та іконок", "", extSizes, "1.1em");
        addSelect('ym_uator', "uator_gap", "Відстань між елементами", "", extGaps, "0.45em");
        addSelect('ym_uator', "uator_margin_left", "Зсув ліворуч", "", extMarginsLeft, "0px");
        addSelect('ym_uator', "uator_saturation", "Насиченість кольорів", "", { "0%": "Чорно-білі", "50%": "50%", "100%": "100% (Кольорові)" }, "100%");
    }

    if (window.appready) createSettings();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') createSettings();
        });
    }
})();
