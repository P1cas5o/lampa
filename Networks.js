/* Networks — Networks Test 12 | Base: Networks.js (Library 2026-11-13)
 * Streaming channel + shared service catalog navigation; preserve existing provider/store menu.
 * Franchise v2: four catalogs, HBO Harry Potter TV, collection recognition, aligned button row. No Lampa Collection edits.
 * UA discovery expansion, service visibility menu, shared SVG flag, company logo contrast.
 * Studios Master v1.2.0 category definitions; Spectrolite handles native cards.
 */
(function () {
    'use strict';
    var LIST_DISPLAY_MODE = Object.freeze({ HIDE: 0, LOGO: 1, TEXT: 2 });
    var EXTRA_BTN_DISPLAY_MODE = Object.freeze({ HIDE: 0, LOGO: 1, TEXT: 2, LIST_BTN: 3 });
    var settings = { platfroms_tv_list_mode: -1, platfroms_tv_list_max_visible: -1, platfroms_tv_extra_btn_mode: -1, platfroms_movie_list_mode: -1, platfroms_movie_list_max_visible: -1, platfroms_movie_extra_btn_mode: -1, studios_list_mode: -1, studios_list_max_visible: -1, platforms_mobile_center: false, networks_margin_top: '-3em', networks_margin_bottom: '3em', networks_margin_buttons: '0.5em', networks_btn_height: '2.2em' };
    var network = new Lampa.Reguest();
    var customLogos = {
        '20th century': { url: 'https://raw.githubusercontent.com/ko31k/LMP/main/wwwroot/img/20th-Century-Fox-Logo.png' },
        'twentieth century': { url: 'https://raw.githubusercontent.com/ko31k/LMP/main/wwwroot/img/20th-Century-Fox-Logo.png' },
        '127928': { url: 'https://raw.githubusercontent.com/ko31k/LMP/main/wwwroot/img/20th-Century-Fox-Logo.png' },
        'h0rjx5vjw5r8yenubstfarjclt4': { url: 'https://raw.githubusercontent.com/ko31k/LMP/main/wwwroot/img/20th-Century-Fox-Logo.png' },
        '1+1 media': { forceText: true }
    };
    function getCustomLogo(name, path, id) {
        var searchStr = ((name || '') + ' ' + (path || '') + ' ' + (id || '')).toLowerCase();
        for (var key in customLogos) {
            if (searchStr.indexOf(key.toLowerCase()) !== -1) return customLogos[key];
        }
        return null;
    }
    function formatCSSValue(value) {
        var val = (value + '').trim();
        if (val === '') return '0em';
        if (/^-?\d*\.?\d+$/.test(val)) return val + 'em';
        return val;
    }
    function addLocalization() {
        Lampa.Lang.add({
            tmdb_networks_open: { en: 'Open', uk: 'Відкрити' },
            tmdb_networks_top: { en: 'Top', uk: 'Популярні' },
            tmdb_networks_new: { en: 'New', uk: 'Новинки' },
            tmdb_networks_hide: { en: 'Hide', uk: 'Сховати' },
            tmdb_networks_plugin_platforms: { en: 'Platforms and Studios', uk: 'Платформи та студії' },
            tmdb_networks_plugin_platforms_setting_descr: { en: 'Display configuration settings for platforms adn studios in cards', uk: 'Налаштування відображення платформ та студій-виробників у картках' },
            tmdb_networks_plugin_about: { en: 'About the plugin', uk: 'Про плагін' },
            tmdb_networks_plugin_descr: { en: 'The plugin adds buttons for streaming services and platforms to cards, showing where movies and series were released or sold, making them easier to find. Buttons with production studios are also added.', uk: 'Модифікація плагіну від @levende, @Yaroslav_Films. Додає в картки кнопки стримінгових сервісів і платформ, де виходили або продавалися фільми та серіали, що спрощує їх пошук. Також додаються кнопки з виробничими студіями.' },
            platfroms_list: { en: 'List', uk: 'Перелік' },
            platfroms_list_limit: { en: 'List limit', uk: 'Ліміт переліку' },
            platform_display_hide: { en: 'Do not show', uk: 'Не показувати' },
            platform_display_logo: { en: 'Logo', uk: 'Логотип' },
            platform_display_name: { en: 'Name', uk: 'Назва' },
            platform_display_combo_btn: { en: 'Select button', uk: 'Кнопка з вибором' },
            platform_extra_btn: { en: 'Extra button', uk: 'Додаткова кнопка' },
            studios_title: { en: 'Studios', uk: 'Студії' },
            platforms_mobile_center: { en: 'Center on mobile', uk: 'Центрувати на смартфонах' },
            networks_margins_title: { en: 'Sizes and margins', uk: 'Розміри та відступи' },
            networks_margins_descr: { en: 'Configure spacing and button sizes', uk: 'Налаштування розмірів та відступів' },
            networks_margin_top: { en: 'Top margin', uk: 'Відступ зверху' },
            networks_margin_bottom: { en: 'Bottom margin', uk: 'Відступ знизу' },
            networks_margin_buttons: { en: 'Margin between buttons', uk: 'Відступ між кнопками' },
            networks_btn_height: { en: 'Button height', uk: 'Висота кнопок' },
            networks_margin_input_descr: { en: 'Manual entry (e.g., 2.2, 10px, -3)', uk: 'Ручний ввід (напр. 2.2, 10px, -3)' },
            tmdb_networks_reset: { en: 'Reset to defaults', uk: 'Скинути за замовчуванням' },
            tmdb_networks_reset_descr: { en: 'Restore default margin and size values', uk: 'Повернути стандартні значення відступів та розмірів' }
        });
    }
    // Test 11: preserve TMDB logo colors; contrast only for known light-logo cases.
    // Additional exceptions may be added by exact TMDB ID without affecting other logos.
    var nxDarkLogoIds = {};
    function nxLogoNeedsDark(item) {
        var name = String(item && item.name || '').toLowerCase();
        return !!nxDarkLogoIds[String(item && item.id)] || /київстар|kyivstar/i.test(name);
    }
    // Company page is rendered by native Lampa; fix only the light Kyivstar logo.
    // The MutationObserver is scoped to the active company activity and disconnected on exit.
    var nxCompanyObserver = null;
    function nxCompanyLogoContrast() {
        if (nxCompanyObserver) {nxCompanyObserver.disconnect();nxCompanyObserver=null;}
        var activity = Lampa.Activity.active();
        var data = activity && activity.activity || {};
        var item = data.card || data.object || data;
        var name = String((item && (item.title || item.name)) || (activity && activity.title) || '');
        if (!/київстар|kyivstar/i.test(name)) return;
        var root = activity && activity.activity && activity.activity.render && activity.activity.render();
        if (!root) return;
        var el = $(root);
        function apply() {
            el.find('.company__logo, .company-logo, .company__img').each(function(){
                $(this).css({'background-color':'#252a35','border-radius':'.6em'});
            });
        }
        apply();
        if (window.MutationObserver && el[0]) {
            nxCompanyObserver = new MutationObserver(apply);
            nxCompanyObserver.observe(el[0],{childList:true,subtree:true});
        }
    }
    function nxAppendLogo(button, item, url) {
        if (nxLogoNeedsDark(item)) button.addClass('nx-logo-dark');
        var img = $('<img/>').attr({src:url, alt:item.name || ''});
        img.on('error', function () {
            img.remove();
            button.removeClass('network-logo nx-logo-dark').addClass('nx-logo-fallback');
            button.find('.overlay').remove();
            button.append($('<div class="tag-count__name"></div>').text(item.name || '—'));
        });
        button.append(img);
    }
    function createNetworkButton(network, index, type, mode, limit) {
        var networkBtn = $('<div class="tag-count selector network-btn platform-btn"></div>');
        var custom = getCustomLogo(network.name, network.logo_path, network.id);
        if (mode == LIST_DISPLAY_MODE.LOGO && (network.logo_path || custom)) {
            networkBtn.addClass('network-logo');
            networkBtn.addClass(type);
            networkBtn.append($('<div class="tag-count overlay"></div>'));
            var imgSrc = custom ? custom.url : Lampa.TMDB.image("t/p/w300" + network.logo_path);
            nxAppendLogo(networkBtn, network, imgSrc);
        } else {
            networkBtn.append($('<div class="tag-count__name">' + network.name + '</div>'));
        }
        if (index >= limit) networkBtn.addClass('hide');
        networkBtn.on('hover:enter', function () { onNetworkButtonClick(network, this, type); });
        return networkBtn;
    }
    function createStudioButton(company, type, mode, index, limit) {
        var btn = $('<div class="tag-count selector network-btn studio-btn"></div>');
        var custom = getCustomLogo(company.name, company.logo_path, company.id);
        if (custom && custom.forceText) {
            company.logo_path = null;
            custom = null;
        }
        if (mode == LIST_DISPLAY_MODE.LOGO && (company.logo_path || custom)) {
            btn.addClass('network-logo');
            btn.addClass(type);
            btn.append($('<div class="tag-count overlay"></div>'));
            var imgSrc = custom ? custom.url : Lampa.TMDB.image("t/p/w300" + company.logo_path);
            nxAppendLogo(btn, company, imgSrc);
        } else {
            btn.append($('<div class="tag-count__name">' + company.name + '</div>'));
        }
        if (index >= limit) btn.addClass('hide');
        btn.on('hover:enter click', function () {
            Lampa.Activity.push({ url: 'movie', id: company.id, title: company.name, component: 'company', source: 'tmdb', page: 1 });
        });
        return btn;
    }
    function createMoreButton(hiddenCount, limit, container) {
        var moreBtn = $('<div class="tag-count selector network-btn network-more"><div class="tag-count__name">' + Lampa.Lang.translate('more') + '</div><div class="tag-count__count">' + hiddenCount + '</div></div>');
        moreBtn.on('hover:enter', function () {
            $('.network-btn.hide', container).removeClass('hide');
            $(this).addClass('hide');
            Lampa.Controller.collectionFocus($('.network-btn', container).eq(limit + 1), Lampa.Activity.active().activity.render());
        });
        return moreBtn;
    }
    function createHideButton(limit, container) {
        var hideBtn = $('<div class="tag-count selector network-btn hide-btn hide"><div class="tag-count__name">' + Lampa.Lang.translate('tmdb_networks_hide') + '</div></div>');
        hideBtn.on('hover:enter', function () {
            $(this).addClass('hide');
            $('.network-btn', container).not('.network-more').not('.hide-btn').each(function(idx) {
                if (idx >= limit) $(this).addClass('hide');
            });
            var moreBtn = $('.network-more', container);
            moreBtn.removeClass('hide');
            Lampa.Controller.collectionFocus(moreBtn, Lampa.Activity.active().activity.render());
        });
        return hideBtn;
    }
    function getMovieProviders(movie, callback) {
        var allowedCountryCodes = ['US', 'RU'];
        var excludeKeywords = ['Free', 'Ad', 'With Ads', 'Free with Ads', 'Plex', 'Tubi', 'Pluto TV', 'Google Play', 'Youtube', 'Max Amazon Channel'];
        var maxDisplayPriority = 20;
        var url = Lampa.TMDB.api('movie/' + movie.id + '/watch/providers?api_key=' + Lampa.TMDB.key());
        network.silent(url, function (data) {
            if (!data.results) return callback([]);
            var countryCodes = Object.keys(data.results).filter(function(countryCode) { return allowedCountryCodes.indexOf(countryCode) !== -1; });
            var providers = [];
            var uniqueProviders = [];
            countryCodes.forEach(function(countryCode) {
                var countryProviders = (data.results[countryCode].flatrate || []).concat(data.results[countryCode].rent || []).concat(data.results[countryCode].buy || []);
                countryProviders.forEach(function(provider) { provider.country_code = countryCode });
                providers = providers.concat(countryProviders);
            });
            providers.forEach(function (provider) {
                if (provider.display_priority > maxDisplayPriority) return;
                if (uniqueProviders.some(function(p) { return p.id == provider.provider_id } )) return;
                var name = provider.provider_name;
                var excluded = excludeKeywords.some(function (keyword) { return name.toLowerCase().indexOf(keyword.toLowerCase()) !== -1; });
                if (excluded) return;
                uniqueProviders.push({ id: provider.provider_id, name: name, logo_path: provider.logo_path, display_priority: provider.display_priority, country_code: provider.country_code });
            });
            uniqueProviders = uniqueProviders.sort(function (a, b) { return a.display_priority - b.display_priority });
            callback(uniqueProviders);
        });
    }
    function getNetworks(object, callback) {
        var movie = object.card;
        if (!movie || movie.source !== 'tmdb') return callback([]);
        var getFn = movie.networksList ? function() { callback(movie.networksList); } : movie.networks ? function() { callback(movie.networks); } : getMovieProviders;
        getFn(movie, function(networks) {
            movie.networksList = networks;
            callback(networks);
        });
    }
    function renderExtraBtn(render, networks, type) {
        $('.button--plaftorms', render).remove();
        var displayMode = settings['platfroms_' + type + '_extra_btn_mode'];
        var container = $('.full-start-new__buttons', render);
        var btn = $('<div class="full-start__button selector button--plaftorms"></div>');
        switch (displayMode) {
            case EXTRA_BTN_DISPLAY_MODE.LOGO:
            case EXTRA_BTN_DISPLAY_MODE.TEXT: {
                btn = createNetworkButton(networks[0], 0, type, displayMode, 1);
                btn.removeClass('tag-count').addClass('full-start__button').addClass('button--plaftorms');
                btn.css('height', $('.full-start__button', render).first().outerHeight() + 'px');
                break;
            }
            case EXTRA_BTN_DISPLAY_MODE.LIST_BTN: {
                var title = Lampa.Lang.translate('tmdb_networks_plugin_platforms');
                btn.html('<svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="512.000000pt" height="512.000000pt" viewBox="0 0 512.000000 512.000000"><g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)" fill="currentColor"><path d="M895 4306 c-16 -7 -59 -44 -95 -82 -284 -302 -487 -669 -586 -1060 -57 -227 -69 -330 -69 -604 0 -274 12 -377 69 -604 86 -339 253 -666 483 -943 156 -189 209 -225 300 -208 49 9 109 69 118 118 13 67 -1 103 -72 180 -389 422 -583 908 -583 1457 0 551 193 1032 584 1459 45 48 67 81 72 105 24 131 -102 234 -221 182z"/><path d="M4095 4306 c-41 -18 -83 -69 -91 -111 -12 -65 3 -102 73 -178 388 -422 583 -909 583 -1457 0 -548 -195 -1035 -583 -1457 -71 -77 -85 -113 -72 -180 9 -49 69 -109 118 -118 77 -15 105 -1 199 96 272 279 482 659 583 1053 58 225 70 331 70 606 0 275 -12 381 -70 606 -101 394 -301 756 -585 1058 -88 94 -148 116 -225 82z"/><path d="M1525 3695 c-83 -28 -274 -269 -364 -458 -53 -111 -95 -234 -123 -358 -20 -91 -23 -130 -23 -319 0 -189 3 -228 23 -319 28 -124 70 -247 123 -358 92 -193 290 -440 371 -461 102 -27 198 46 198 151 0 60 -8 76 -83 157 -32 36 -83 101 -112 145 -142 215 -205 425 -205 685 0 260 63 470 205 685 29 44 80 109 112 145 75 81 83 97 83 158 0 107 -103 181 -205 147z"/><path d ="M3513 3700 c-76 -17 -123 -76 -123 -153 0 -60 8 -76 83 -157 153 -168 262 -390 302 -614 19 -114 19 -318 0 -432 -40 -224 -149 -446 -302 -614 -75 -81 -83 -97 -83 -157 0 -105 96 -178 198 -151 81 21 279 268 371 461 53 111 95 234 123 358 20 91 23 130 23 319 0 189 -3 228 -23 319 -61 273 -193 531 -367 719 -88 95 -133 118 -202 102z"/><path d="M2435 3235 c-417 -77 -668 -518 -519 -912 111 -298 421 -488 723 -445 326 46 557 277 603 603 41 289 -136 595 -412 710 -130 55 -260 69 -395 44z m197 -316 c77 -17 137 -50 190 -107 57 -61 83 -110 98 -190 22 -111 -12 -222 -96 -312 -138 -148 -359 -156 -510 -18 -96 88 -138 210 -114 330 16 82 42 132 99 191 52 55 97 81 174 102 65 17 92 18 159 4z"/></g></svg><span>' + title + '</span>');
                    btn.on('hover:enter', function () {
                        var controllerName = Lampa.Controller.enabled().name;
                        Lampa.Select.show({
                            title: title,
                            items: networks.map(function(n) { return { title: n.name, network: n }; }),
                            onBack: function () { Lampa.Controller.toggle(controllerName); Lampa.Controller.collectionFocus(btn, render); },
                            onSelect: function (action) { onNetworkButtonClick(action.network, null, type, controllerName); }
                        });
                    });
                    break;
                }
                default: return;
            }
            container.append(btn);
            Lampa.Activity.active().activity.toggle();
        }
        function renderNetworks() {
            var object = Lampa.Activity.active();
            var render = object.activity.render();
            var detailedMovie = render.data('movie') || render.data('item') || object.card;
            $('.tmdb-networks', render).remove();
            getNetworks(object, function(networks) {
                var type = object.method;
                var displayMode = settings['platfroms_' + type + '_list_mode'];
                var studiosMode = settings.studios_list_mode;
                var companies = (detailedMovie && detailedMovie.production_companies) ? detailedMovie.production_companies : [];
                var validStudios = companies.filter(function(company) {
                    if (!company.id) return false;
                    var custom = getCustomLogo(company.name, company.logo_path, company.id);
                    return studiosMode != LIST_DISPLAY_MODE.LOGO || company.logo_path || custom;
                });
                var hasPlatforms = displayMode != LIST_DISPLAY_MODE.HIDE && networks.length > 0;
                var hasStudios = studiosMode != LIST_DISPLAY_MODE.HIDE && validStudios.length > 0;
                if (!hasPlatforms && !hasStudios) { nxFranchiseInsert(render, detailedMovie, type); return; }
                if (networks.length > 0) renderExtraBtn(render, networks, type, object);
                var wrapClass = settings.platforms_mobile_center ? 'networks-wrapper center-on-mobile' : 'networks-wrapper';
                var mTop = formatCSSValue(settings.networks_margin_top);
                var mBot = formatCSSValue(settings.networks_margin_bottom);
                var mGap = formatCSSValue(settings.networks_margin_buttons);
                var btnH = formatCSSValue(settings.networks_btn_height);
                var networksLine = $('<div class="tmdb-networks" style="margin-top:' + mTop + '; --tmdb-net-gap:' + mGap + '; --tmdb-net-btn-h:' + btnH + ';"><div class="items-line__body" style="margin-bottom:' + mBot + ';"><div class="full-descr"><div class="full-descr__left"><div class="full-descr__tags ' + wrapClass + '" style="margin-top:0;"></div></div></div></div></div>');
                var container = $('.full-descr__tags', networksLine);
                var platformsContainer = null;
                var studiosContainer = null;
                var separator = null;
                if (hasPlatforms) {
                    platformsContainer = $('<div class="platforms-group"></div>');
                    var displayLimit = settings['platfroms_' + type + '_list_max_visible'];
                    var hasMoreBtn = false;
                    networks.forEach(function (network, index) {
                        platformsContainer.append(createNetworkButton(network, index, type, displayMode, displayLimit));
                        if (networks.length > displayLimit && index === displayLimit - 1) {
                            platformsContainer.append(createMoreButton(networks.length - displayLimit, displayLimit, platformsContainer));
                            hasMoreBtn = true;
                        }
                    });
                    if (hasMoreBtn) platformsContainer.append(createHideButton(displayLimit, platformsContainer));
                    container.append(platformsContainer);
                }
                if (hasPlatforms && hasStudios) {
                    separator = $('<div class="network-separator"></div>');
                    container.append(separator);
                }
                if (hasStudios) {
                    studiosContainer = $('<div class="studios-group"></div>');
                    var studiosLimit = settings.studios_list_max_visible;
                    var hasStudioMoreBtn = false;
                    validStudios.forEach(function(company, index) {
                        studiosContainer.append(createStudioButton(company, type, studiosMode, index, studiosLimit));
                        if (validStudios.length > studiosLimit && index === studiosLimit - 1) {
                            studiosContainer.append(createMoreButton(validStudios.length - studiosLimit, studiosLimit, studiosContainer));
                            hasStudioMoreBtn = true;
                        }
                    });
                    if (hasStudioMoreBtn) studiosContainer.append(createHideButton(studiosLimit, studiosContainer));
                    container.append(studiosContainer);
                }
                if (container.children().length > 0) {
                    $('.items-line', render).eq(0).prepend(networksLine);
                    if (hasPlatforms && hasStudios && separator && platformsContainer && studiosContainer) {
                        var eventName = 'resize.tmdbnet_' + Date.now();
                        var checkSeparatorWrap = function() {
                            if (!document.body.contains(separator[0])) {
                                $(window).off(eventName);
                                return;
                            }
                            if (platformsContainer.length && studiosContainer.length) {
                                var pTop = platformsContainer.offset().top;
                                var sTop = studiosContainer.offset().top;
                                if (sTop > pTop + 10) separator.hide();
                                else separator.show();
                            }
                        };
                        setTimeout(checkSeparatorWrap, 100);
                        $(window).on(eventName, checkSeparatorWrap);
                    }
                }
                nxFranchiseInsert(render, detailedMovie, type);
            });
        }
        function onNetworkButtonClick(network, element, type, controller) {
            var serviceId = nxServiceFromButton(network, type);
            if (serviceId && nxOpenService(serviceId)) return;
            var isTv = type == 'tv';
            var controllerName = controller || Lampa.Controller.enabled().name;
            var releaseDateField = isTv ? 'first_air_date' : 'primary_release_date';
            var topFilter = { 'vote_count.gte': 10 };
            var newFilter = { 'vote_count.gte': 10 };
            newFilter[releaseDateField + '.lte'] = new Date().toISOString().split('T')[0];
            var menu = [
                { title: Lampa.Lang.translate('tmdb_networks_open') + ' ' + Lampa.Lang.translate('tmdb_networks_top').toLowerCase(), sort_by: '', type: Lampa.Lang.translate('tmdb_networks_top'), filter: topFilter },
                { title: Lampa.Lang.translate('tmdb_networks_open') + ' ' + Lampa.Lang.translate('tmdb_networks_new').toLowerCase(), sort_by: releaseDateField + '.desc', type: Lampa.Lang.translate('tmdb_networks_new'), filter: newFilter }
            ];
            if (network.country_code) {
                menu.forEach(function(selectItem) {
                    selectItem.filter.watch_region = network.country_code;
                    selectItem.filter.with_watch_providers = network.id;
                });
            }
            var categoryLangKey = isTv ? 'menu_tv' : 'menu_movies';
            Lampa.Select.show({
                title: network.name + ' ' + Lampa.Lang.translate(categoryLangKey),
                items: menu,
                onBack: function () { Lampa.Controller.toggle(controllerName); Lampa.Controller.collectionFocus(element, Lampa.Activity.active().activity.render()); },
                onSelect: function (action) {
                    Lampa.Activity.push({ url: 'discover/' + type, title: network.name + ' ' + action.type + ' ' + Lampa.Lang.translate(categoryLangKey), component: 'category_full', networks: network.id, sort_by: action.sort_by, source: 'tmdb', card_type: true, page: 1, filter: action.filter });
                }
            });
        }
        function showSettingsMenu() {
            Lampa.Settings.create('platforms', { template: 'settings_platforms', onBack: function() { Lampa.Settings.create('interface'); } });
        }
        function addSettingsByType(type) {
            Lampa.SettingsApi.addParam({ component: 'platforms', param: { name: 'platfroms_' + type + '_list_mode', type: 'select', values: { '0': Lampa.Lang.translate('platform_display_hide'), '1': Lampa.Lang.translate('platform_display_logo'), '2': Lampa.Lang.translate('platform_display_name') }, default: settings['platfroms_' + type + '_list_mode'] }, field: { name: Lampa.Lang.translate('platfroms_list') }, onChange: initSettings });
            Lampa.SettingsApi.addParam({ component: 'platforms', param: { name: 'platfroms_' + type + '_list_max_visible', type: 'select', values: { 1: 1, 2: 2, 3: 3, 5: 5 }, default: settings['platfroms_' + type + '_list_max_visible'] }, field: { name: Lampa.Lang.translate('platfroms_list_limit') }, onChange: initSettings });
            Lampa.SettingsApi.addParam({ component: 'platforms', param: { name: 'platfroms_' + type + '_extra_btn_mode', type: 'select', values: { '0': Lampa.Lang.translate('platform_display_hide'), '1': Lampa.Lang.translate('platform_display_logo'), '2': Lampa.Lang.translate('platform_display_name'), '3': Lampa.Lang.translate('platform_display_combo_btn') }, default: settings['platfroms_' + type + '_extra_btn_mode'] }, field: { name: Lampa.Lang.translate('platform_extra_btn') }, onChange: initSettings });
        }
        function addSettings() {
            Lampa.Template.add('settings_platforms', '<div></div>');
            Lampa.Template.add('settings_platforms_margins', '<div></div>');
            Lampa.SettingsApi.addParam({ component: 'interface', param: { type: 'button', component: 'platforms' }, field: { name: Lampa.Lang.translate('tmdb_networks_plugin_platforms'), description: Lampa.Lang.translate('tmdb_networks_plugin_platforms_setting_descr') }, onChange: showSettingsMenu });
            Lampa.SettingsApi.addParam({ component: 'platforms', param: { type: 'button', component: 'about' }, field: { name: Lampa.Lang.translate('tmdb_networks_plugin_about'), description: Lampa.Lang.translate('menu_about') }, onChange: showAbout });
            Lampa.SettingsApi.addParam({ component: 'platforms', param: { type: 'title' }, field: { name: Lampa.Lang.translate('menu_tv') } });
            addSettingsByType('tv');
            Lampa.SettingsApi.addParam({ component: 'platforms', param: { type: 'title' }, field: { name: Lampa.Lang.translate('menu_movies') } });
            addSettingsByType('movie');
            Lampa.SettingsApi.addParam({ component: 'platforms', param: { type: 'title' }, field: { name: Lampa.Lang.translate('studios_title') } });
            Lampa.SettingsApi.addParam({ component: 'platforms', param: { name: 'studios_list_mode', type: 'select', values: { '0': Lampa.Lang.translate('platform_display_hide'), '1': Lampa.Lang.translate('platform_display_logo') }, default: settings.studios_list_mode }, field: { name: Lampa.Lang.translate('platfroms_list') }, onChange: initSettings });
            Lampa.SettingsApi.addParam({ component: 'platforms', param: { name: 'studios_list_max_visible', type: 'select', values: { 1: 1, 2: 2, 3: 3, 5: 5, 10: 10 }, default: settings.studios_list_max_visible }, field: { name: Lampa.Lang.translate('platfroms_list_limit') }, onChange: initSettings });
            var isMobileCenter = Lampa.Storage.get('platforms_mobile_center', false);
            var mobileCenterDefault = (isMobileCenter === true || isMobileCenter === 'true');
            Lampa.SettingsApi.addParam({ component: 'platforms', param: { name: 'platforms_mobile_center', type: 'trigger', default: mobileCenterDefault }, field: { name: Lampa.Lang.translate('platforms_mobile_center') }, onChange: function (value) { Lampa.Storage.set('platforms_mobile_center', value); settings.platforms_mobile_center = value; } });
            Lampa.SettingsApi.addParam({ component: 'platforms', param: { type: 'button', component: 'platforms_margins' }, field: { name: Lampa.Lang.translate('networks_margins_title'), description: Lampa.Lang.translate('networks_margins_descr') }, onChange: function() { Lampa.Settings.create('platforms_margins', { template: 'settings_platforms_margins', onBack: showSettingsMenu }); } });
            var marginSettings = ['top', 'bottom', 'buttons'];
            marginSettings.forEach(function(pos) {
                Lampa.SettingsApi.addParam({
                    component: 'platforms_margins',
                    param: { name: 'networks_margin_' + pos, type: 'input', values: '', default: settings['networks_margin_' + pos] },
                    field: { name: Lampa.Lang.translate('networks_margin_' + pos), description: Lampa.Lang.translate('networks_margin_input_descr') },
                    onChange: function (value) {
                        var formattedValue = formatCSSValue(value);
                        Lampa.Storage.set('networks_margin_' + pos, formattedValue);
                        settings['networks_margin_' + pos] = formattedValue;
                        var networksEl = $('.tmdb-networks');
                        if (networksEl.length) {
                            if (pos === 'top') networksEl.css('margin-top', formattedValue);
                            if (pos === 'bottom') networksEl.find('.items-line__body').css('margin-bottom', formattedValue);
                            if (pos === 'buttons') networksEl.css('--tmdb-net-gap', formattedValue);
                        }
                        Lampa.Settings.update();
                    }
                });
            });
            Lampa.SettingsApi.addParam({
                component: 'platforms_margins',
                param: { name: 'networks_btn_height', type: 'input', values: '', default: settings.networks_btn_height },
                field: { name: Lampa.Lang.translate('networks_btn_height'), description: Lampa.Lang.translate('networks_margin_input_descr') },
                onChange: function (value) {
                    var formattedValue = formatCSSValue(value);
                    Lampa.Storage.set('networks_btn_height', formattedValue);
                    settings.networks_btn_height = formattedValue;
                    var networksEl = $('.tmdb-networks');
                    if (networksEl.length) networksEl.css('--tmdb-net-btn-h', formattedValue);
                    Lampa.Settings.update();
                }
            });
            Lampa.SettingsApi.addParam({
                component: 'platforms_margins',
                param: { type: 'button' },
                field: { name: Lampa.Lang.translate('tmdb_networks_reset'), description: Lampa.Lang.translate('tmdb_networks_reset_descr') },
                onChange: function() {
                    var defaults = { top: '-3em', bottom: '3em', buttons: '0.5em', height: '2.2em' };
                    Lampa.Storage.set('networks_margin_top', defaults.top);
                    settings.networks_margin_top = defaults.top;
                    Lampa.Storage.set('networks_margin_bottom', defaults.bottom);
                    settings.networks_margin_bottom = defaults.bottom;
                    Lampa.Storage.set('networks_margin_buttons', defaults.buttons);
                    settings.networks_margin_buttons = defaults.buttons;
                    Lampa.Storage.set('networks_btn_height', defaults.height);
                    settings.networks_btn_height = defaults.height;
                    var networksEl = $('.tmdb-networks');
                    if (networksEl.length) {
                        networksEl.css('margin-top', defaults.top);
                        networksEl.find('.items-line__body').css('margin-bottom', defaults.bottom);
                        networksEl.css('--tmdb-net-gap', defaults.buttons);
                        networksEl.css('--tmdb-net-btn-h', defaults.height);
                    }
                    Lampa.Settings.update();
                }
            });
        }
        function showAbout() {
            var html = '<p>' + Lampa.Lang.translate('tmdb_networks_plugin_descr') + '</p>';
            var controller = Lampa.Controller.enabled().name;
            Lampa.Select.show({ title: Lampa.Lang.translate('tmdb_networks_plugin_about'), items: [{ title: html, disabled: true }], onSelect: function () { Lampa.Controller.toggle(controller); }, onBack: function () { Lampa.Controller.toggle(controller); } });
        }
        function initSettings() {
            settings.platfroms_tv_list_mode = Lampa.Storage.get('platfroms_tv_list_mode', LIST_DISPLAY_MODE.LOGO);
            settings.platfroms_tv_list_max_visible = Lampa.Storage.get('platfroms_tv_list_max_visible', 3);
            settings.platfroms_tv_extra_btn_mode = Lampa.Storage.get('platfroms_tv_extra_btn_mode', EXTRA_BTN_DISPLAY_MODE.HIDE);
            settings.platfroms_movie_list_mode = Lampa.Storage.get('platfroms_movie_list_mode', LIST_DISPLAY_MODE.TEXT);
            settings.platfroms_movie_list_max_visible = Lampa.Storage.get('platfroms_movie_list_max_visible', 3);
            settings.platfroms_movie_extra_btn_mode = Lampa.Storage.get('platfroms_movie_extra_btn_mode', EXTRA_BTN_DISPLAY_MODE.HIDE);
            settings.studios_list_mode = Lampa.Storage.get('studios_list_mode', LIST_DISPLAY_MODE.LOGO);
            settings.studios_list_max_visible = Lampa.Storage.get('studios_list_max_visible', 3);
            var isMC = Lampa.Storage.get('platforms_mobile_center', false);
            settings.platforms_mobile_center = (isMC === true || isMC === 'true');
            settings.networks_margin_top = Lampa.Storage.get('networks_margin_top', '-3em');
            settings.networks_margin_bottom = Lampa.Storage.get('networks_margin_bottom', '3em');
            settings.networks_margin_buttons = Lampa.Storage.get('networks_margin_buttons', '0.5em');
            settings.networks_btn_height = Lampa.Storage.get('networks_btn_height', '2.2em');
        }

var nxServiceConfigs = {
        'ua': {
            title: 'UA',
            icon: '<svg viewBox="0 0 24 24"><path fill="#0057B7" d="M0 0h24v12H0z"/><path fill="#FFD700" d="M0 12h24v12H0z"/></svg>',
            // TMDB origin country: UA, not the language of dubbing or Ukrainian availability.
            categories: [
                {title:'Українські фільми — популярні',url:'discover/movie',params:{with_origin_country:'UA',sort_by:'popularity.desc'}},
                {title:'Українські серіали — популярні',url:'discover/tv',params:{with_origin_country:'UA',sort_by:'popularity.desc'}},
                {title:'Нові українські фільми',url:'discover/movie',params:{with_origin_country:'UA',sort_by:'primary_release_date.desc','primary_release_date.lte':'{current_date}'}},
                {title:'Нові українські серіали',url:'discover/tv',params:{with_origin_country:'UA',sort_by:'first_air_date.desc','first_air_date.lte':'{current_date}'}},
                {title:'Українські фільми — найвищий рейтинг',url:'discover/movie',params:{with_origin_country:'UA',sort_by:'vote_average.desc','vote_count.gte':'20'}},
                {title:'Українські серіали — найвищий рейтинг',url:'discover/tv',params:{with_origin_country:'UA',sort_by:'vote_average.desc','vote_count.gte':'10'}},
                {title:'Українські документальні фільми',url:'discover/movie',params:{with_origin_country:'UA',with_genres:'99',sort_by:'popularity.desc'}},
                {title:'Українські комедії',url:'discover/movie',params:{with_origin_country:'UA',with_genres:'35',sort_by:'popularity.desc'}},
                {title:'Українські драми',url:'discover/movie',params:{with_origin_country:'UA',with_genres:'18',sort_by:'popularity.desc'}},
                {title:'Українські бойовики та пригоди',url:'discover/movie',params:{with_origin_country:'UA',with_genres:'28|12',sort_by:'popularity.desc'}},
                {title:'Українські історичні фільми',url:'discover/movie',params:{with_origin_country:'UA',with_genres:'36',sort_by:'popularity.desc'}},
                {title:'Українські кримінальні фільми',url:'discover/movie',params:{with_origin_country:'UA',with_genres:'80',sort_by:'popularity.desc'}},
                {title:'Українські мультфільми',url:'discover/movie',params:{with_origin_country:'UA',with_genres:'16',sort_by:'popularity.desc'}},
                {title:'Українські мультсеріали',url:'discover/tv',params:{with_origin_country:'UA',with_genres:'16',sort_by:'popularity.desc'}},
                {title:'Українські документальні серіали',url:'discover/tv',params:{with_origin_country:'UA',with_genres:'99',sort_by:'popularity.desc'}},
                {title:'Українські комедійні серіали',url:'discover/tv',params:{with_origin_country:'UA',with_genres:'35',sort_by:'popularity.desc'}},
                {title:'Українські драматичні серіали',url:'discover/tv',params:{with_origin_country:'UA',with_genres:'18',sort_by:'popularity.desc'}}
            ]
        },
        'netflix': {
            title: 'Netflix',
            icon: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16.5 2L16.5 22" stroke="#E50914" stroke-width="4"/><path d="M7.5 2L7.5 22" stroke="#E50914" stroke-width="4"/><path d="M7.5 2L16.5 22" stroke="#E50914" stroke-width="4"/></svg>',
            categories: [
                { "title": "Нові фільми", "url": "discover/movie", "params": { "with_watch_providers": "8", "watch_region": "UA", "sort_by": "primary_release_date.desc", "primary_release_date.lte": "{current_date}", "vote_count.gte": "5" } },
                { "title": "Нові серіали", "url": "discover/tv", "params": { "with_networks": "213", "sort_by": "first_air_date.desc", "first_air_date.lte": "{current_date}", "vote_count.gte": "5" } },
                { "title": "В тренді на Netflix", "url": "discover/tv", "params": { "with_networks": "213", "sort_by": "popularity.desc" } },
                { "title": "Екшн та Блокбастери", "url": "discover/movie", "params": { "with_companies": "213", "with_genres": "28,12", "sort_by": "popularity.desc" } },
                { "title": "Фантастичні світи", "url": "discover/tv", "params": { "with_networks": "213", "with_genres": "10765", "sort_by": "vote_average.desc", "vote_count.gte": "200" } },
                { "title": "Реаліті-шоу: Хіти", "url": "discover/tv", "params": { "with_networks": "213", "with_genres": "10764", "sort_by": "popularity.desc" } },
                { "title": "Кримінальні драми", "url": "discover/tv", "params": { "with_networks": "213", "with_genres": "80", "sort_by": "popularity.desc" } },
                { "title": "K-Dramas (Корейські серіали)", "url": "discover/tv", "params": { "with_networks": "213", "with_original_language": "ko", "sort_by": "popularity.desc" } },
                { "title": "Аніме колекція", "url": "discover/tv", "params": { "with_networks": "213", "with_genres": "16", "with_keywords": "210024", "sort_by": "popularity.desc" } },
                { "title": "Документальне кіно", "url": "discover/movie", "params": { "with_companies": "213", "with_genres": "99", "sort_by": "release_date.desc" } },
                { "title": "Вибір критиків (Високий рейтинг)", "url": "discover/movie", "params": { "with_companies": "213", "vote_average.gte": "7.5", "vote_count.gte": "300", "sort_by": "vote_average.desc" } }
            ]
        },
        'apple': {
            title: 'Apple TV+',
            icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>',
            categories: [
                { "title": "Нові фільми", "url": "discover/movie", "params": { "with_watch_providers": "350", "watch_region": "UA", "sort_by": "primary_release_date.desc", "primary_release_date.lte": "{current_date}", "vote_count.gte": "5" } },
                { "title": "Нові серіали", "url": "discover/tv", "params": { "with_watch_providers": "350", "watch_region": "UA", "sort_by": "first_air_date.desc", "first_air_date.lte": "{current_date}", "vote_count.gte": "5" } },
                { "title": "Хіти Apple TV+", "url": "discover/tv", "params": { "with_watch_providers": "350", "watch_region": "UA", "sort_by": "popularity.desc" } },
                { "title": "Apple Original Films", "url": "discover/movie", "params": { "with_watch_providers": "350", "watch_region": "UA", "sort_by": "release_date.desc", "vote_count.gte": "10" } },
                { "title": "Фантастика Apple", "url": "discover/tv", "params": { "with_watch_providers": "350", "watch_region": "UA", "with_genres": "10765", "sort_by": "vote_average.desc", "vote_count.gte": "200" } },
                { "title": "Комедії та Feel-good", "url": "discover/tv", "params": { "with_watch_providers": "350", "watch_region": "UA", "with_genres": "35", "sort_by": "popularity.desc" } },
                { "title": "Трилери та Детективи", "url": "discover/tv", "params": { "with_watch_providers": "350", "watch_region": "UA", "with_genres": "9648,80", "sort_by": "popularity.desc" } }
            ]
        },
        'hbo': {
            title: 'HBO',
            icon: '<svg width="24px" height="24px" viewBox="0 0 24 24" fill="currentColor"><path d="M7.042 16.896H4.414v-3.754H2.708v3.754H.01L0 7.22h2.708v3.6h1.706v-3.6h2.628zm12.043.046C21.795 16.94 24 14.689 24 11.978a4.89 4.89 0 0 0-4.915-4.92c-2.707-.002-4.09 1.991-4.432 2.795.003-1.207-1.187-2.632-2.58-2.634H7.59v9.674l4.181.001c1.686 0 2.886-1.46 2.888-2.713.385.788 1.72 2.762 4.427 2.76zm-7.665-3.936c.387 0 .692.382.692.817 0 .435-.305.817-.692.817h-1.33v-1.634zm.005-3.633c.387 0 .692.382.692.817 0 .436-.305.818-.692.818h-1.33V9.373zm1.77 2.607c.305-.039.813-.387.992-.61-.063.276-.068 1.074.006 1.35-.204-.314-.688-.701-.998-.74zm3.43 0a2.462 2.462 0 1 1 4.924 0 2.462 2.462 0 0 1-4.925 0zm2.462 1.936a1.936 1.936 0 1 0 0-3.872 1.936 1.936 0 0 0 0 3.872z"/></svg>',
            categories: [
                { "title": "Нові фільми WB/HBO", "url": "discover/movie", "params": { "with_companies": "174|49", "sort_by": "primary_release_date.desc", "primary_release_date.lte": "{current_date}", "vote_count.gte": "10" } },
                { "title": "Нові серіали HBO/Max", "url": "discover/tv", "params": { "with_networks": "49|3186", "sort_by": "first_air_date.desc", "first_air_date.lte": "{current_date}", "vote_count.gte": "5" } },
                { "title": "HBO: Головні хіти", "url": "discover/tv", "params": { "with_networks": "49", "sort_by": "popularity.desc" } },
                { "title": "Max Originals", "url": "discover/tv", "params": { "with_networks": "3186", "sort_by": "popularity.desc" } },
                { "title": "Блокбастери Warner Bros.", "url": "discover/movie", "params": { "with_companies": "174", "sort_by": "revenue.desc", "vote_count.gte": "1000" } },
                { "title": "Золота колекція HBO (Найвищий рейтинг)", "url": "discover/tv", "params": { "with_networks": "49", "sort_by": "vote_average.desc", "vote_count.gte": "500", "vote_average.gte": "8.0" } },
                { "title": "Епічні світи (Фентезі)", "url": "discover/tv", "params": { "with_networks": "49|3186", "with_genres": "10765", "sort_by": "popularity.desc" } },
                { "title": "Преміальні драми", "url": "discover/tv", "params": { "with_networks": "49", "with_genres": "18", "without_genres": "10765", "sort_by": "popularity.desc" } },
                { "title": "Доросла анімація (Adult Swim)", "url": "discover/tv", "params": { "with_networks": "3186|80", "with_genres": "16", "sort_by": "popularity.desc" } },
                { "title": "Всесвіт DC (Фільми)", "url": "discover/movie", "params": { "with_companies": "174", "with_keywords": "9715", "sort_by": "release_date.desc" } }
            ]
        },
        'amazon': {
            title: 'Prime Video',
            icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22.787 15.292c-.336-.43-2.222-.204-3.069-.103-.257.031-.296-.193-.065-.356 1.504-1.056 3.968-.75 4.255-.397.288.357-.076 2.827-1.485 4.007-.217.18-.423.084-.327-.155.317-.792 1.027-2.566.69-2.996"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/></svg>',
            categories: [
                { "title": "В тренді на Prime Video", "url": "discover/tv", "params": { "with_networks": "1024", "sort_by": "popularity.desc" } },
                { "title": "Нові фільми", "url": "discover/movie", "params": { "with_watch_providers": "119", "watch_region": "UA", "sort_by": "primary_release_date.desc", "primary_release_date.lte": "{current_date}", "vote_count.gte": "5" } },
                { "title": "Нові серіали", "url": "discover/tv", "params": { "with_networks": "1024", "sort_by": "first_air_date.desc", "first_air_date.lte": "{current_date}", "vote_count.gte": "5" } },
                { "title": "Жорсткий екшн та Антигерої", "url": "discover/tv", "params": { "with_networks": "1024", "with_genres": "10765,10759", "sort_by": "popularity.desc" } },
                { "title": "Блокбастери MGM та Amazon", "url": "discover/movie", "params": { "with_companies": "1024|21", "sort_by": "revenue.desc" } },
                { "title": "Комедії", "url": "discover/tv", "params": { "with_networks": "1024", "with_genres": "35", "sort_by": "vote_average.desc" } },
                { "title": "Найвищий рейтинг IMDb", "url": "discover/tv", "params": { "with_networks": "1024", "vote_average.gte": "8.0", "vote_count.gte": "500", "sort_by": "vote_average.desc" } }
            ]
        },
        'disney': {
            title: 'Disney+',
            icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19,3V7m2-2H17m-10.31,4L8.69,21m-5.69-7c0-3,5.54-4.55,9-2m-9,2s12.29-2,13.91,6.77c1.09,5.93-6.58,6.7-9.48,5.89S3,16.06,3,14.06"/></svg>',
            categories: [
                { "title": "Нові фільми на Disney+", "url": "discover/movie", "params": { "with_watch_providers": "337", "watch_region": "UA", "sort_by": "primary_release_date.desc", "primary_release_date.lte": "{current_date}", "vote_count.gte": "5" } },
                { "title": "Нові серіали на Disney+", "url": "discover/tv", "params": { "with_watch_providers": "337", "watch_region": "UA", "sort_by": "first_air_date.desc", "first_air_date.lte": "{current_date}", "vote_count.gte": "5" } },
                { "title": "Marvel: Кіновсесвіт (MCU)", "url": "discover/movie", "params": { "with_companies": "420", "sort_by": "release_date.desc", "vote_count.gte": "200" } },
                { "title": "Marvel: Серіали", "url": "discover/tv", "params": { "with_companies": "420", "with_networks": "2739", "sort_by": "first_air_date.desc" } },
                { "title": "Зоряні Війни: Фільми", "url": "discover/movie", "params": { "with_companies": "1", "sort_by": "release_date.asc" } },
                { "title": "Зоряні Війни: Мандалорець та інші", "url": "discover/tv", "params": { "with_companies": "1", "with_keywords": "1930", "sort_by": "popularity.desc" } },
                { "title": "Класика Disney", "url": "discover/movie", "params": { "with_companies": "6125", "sort_by": "popularity.desc" } },
                { "title": "Pixar: Нескінченність і далі", "url": "discover/movie", "params": { "with_companies": "3", "sort_by": "popularity.desc" } },
                { "title": "FX: Дорослі хіти (The Bear, Shogun)", "url": "discover/tv", "params": { "with_networks": "88", "sort_by": "popularity.desc" } },
                { "title": "Сімпсони та анімація FOX", "url": "discover/tv", "params": { "with_networks": "19", "with_genres": "16", "sort_by": "popularity.desc" } }
            ]
        },
        'hulu': {
            title: 'Hulu',
            icon: '<svg viewBox="0 0 24 24" fill="#3DBB3D"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z"/></svg>',
            categories: [
                { "title": "Hulu Originals: У тренді", "url": "discover/tv", "params": { "with_networks": "453", "sort_by": "popularity.desc" } },
                { "title": "Драми та Трилери Hulu", "url": "discover/tv", "params": { "with_networks": "453", "with_genres": "18,9648", "sort_by": "vote_average.desc" } },
                { "title": "Комедії та Анімація для дорослих", "url": "discover/tv", "params": { "with_networks": "453", "with_genres": "35,16", "sort_by": "popularity.desc" } },
                { "title": "Міні-серіали (Limited Series)", "url": "discover/tv", "params": { "with_networks": "453", "with_keywords": "158718", "sort_by": "first_air_date.desc" } }
            ]
        },
        'paramount': {
            title: 'Paramount+',
            icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 22H22L12 2ZM12 6.5L18.5 19.5H5.5L12 6.5Z"/></svg>',
            categories: [
                { "title": "Блокбастери Paramount Pictures", "url": "discover/movie", "params": { "with_companies": "4", "sort_by": "revenue.desc" } },
                { "title": "Paramount+ Originals", "url": "discover/tv", "params": { "with_networks": "4330", "sort_by": "popularity.desc" } },
                { "title": "Всесвіт Йеллоустоун", "url": "discover/tv", "params": { "with_networks": "318|4330", "with_genres": "37,18", "sort_by": "popularity.desc" } },
                { "title": "Star Trek: Остання межа", "url": "discover/tv", "params": { "with_networks": "4330", "with_keywords": "159223", "sort_by": "first_air_date.desc" } },
                { "title": "Nickelodeon: Для дітей", "url": "discover/tv", "params": { "with_networks": "13", "sort_by": "popularity.desc" } }
            ]
        },
        'syfy': {
            title: 'Syfy',
            icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4.5 20.29L5.21 21L12 18L18.79 21L19.5 20.29L12 2Z"/></svg>',
            categories: [
                { "title": "Хіти телеканалу Syfy", "url": "discover/tv", "params": { "with_networks": "77", "sort_by": "popularity.desc" } },
                { "title": "Космічні подорожі та Наукова Фантастика", "url": "discover/tv", "params": { "with_networks": "77", "with_genres": "10765", "with_keywords": "3801", "sort_by": "vote_average.desc" } },
                { "title": "Містика, Жахи та Фентезі", "url": "discover/tv", "params": { "with_networks": "77", "with_genres": "9648,10765", "without_keywords": "3801", "sort_by": "popularity.desc" } }
            ]
        },
        'educational_and_reality': {
            title: 'Discovery+',
            icon: '<svg viewBox="0 0 24 24" fill="#FF9800"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>',
            categories: [
                // --- БЛОК 1: Студійні новинки (Discovery, NatGeo, BBC, History) ---
                {
                    "title": "Нові випуски: Discovery, NatGeo, BBC",
                    "url": "discover/tv",
                    "params": {
                        "with_networks": "64|91|43|2696|4|65", // Всі топ канали разом
                        "sort_by": "first_air_date.desc",     // Сортування від нового
                        "first_air_date.lte": "{current_date}",
                        "vote_count.gte": "0"                 // Показувати навіть без оцінок (зовсім свіже)
                    }
                },

                // --- БЛОК 2: Найкраще від студій ---
                { "title": "Discovery Channel: Хіти", "url": "discover/tv", "params": { "with_networks": "64", "sort_by": "popularity.desc" } },
                { "title": "National Geographic: Світ навколо", "url": "discover/tv", "params": { "with_networks": "43", "sort_by": "popularity.desc" } },
                { "title": "Animal Planet: Тварини", "url": "discover/tv", "params": { "with_networks": "91", "sort_by": "popularity.desc" } },
                { "title": "BBC Earth: Природа (Високий рейтинг)", "url": "discover/tv", "params": { "with_networks": "4", "with_genres": "99", "sort_by": "vote_average.desc", "vote_count.gte": "50" } },

                // --- БЛОК 3: Жанрові добірки (Всі студії світу) ---

                // Кулінарія (MasterChef, Hell's Kitchen і т.д.)
                {
                    "title": "Кулінарні битви та Шеф-кухарі",
                    "url": "discover/tv",
                    "params": {
                        "with_genres": "10764",             // Reality
                        "with_keywords": "222083",     // Cooking OR Baking (Випічка)
                        "without_keywords": "10636,5481",   // ПРИБРАТИ: Dating (Single's Inferno), Survival
                        "sort_by": "popularity.desc"
                    }
                },

                // Шоу талантів (The Voice, X-Factor, Idol)
                {
                    "title": "Голос, Танці та Шоу талантів",
                    "url": "discover/tv",
                    "params": {
                        "with_genres": "10764",             // Reality
                        "with_keywords": "4542|4568|2643",  // Singing OR Dancing OR Talent Show
                        "without_keywords": "5481,9714",    // ПРИБРАТИ: Survival (Survivor), Travel (Amazing Race)
                        "sort_by": "popularity.desc"
                    }
                },

                // Виживання (Survivor, Bear Grylls)
                {
                    "title": "Шоу про виживання",
                    "url": "discover/tv",
                    "params": {
                        "with_genres": "10764",
                        "with_keywords": "5481|10348", // Keywords: Survival
                        "sort_by": "popularity.desc"
                    }
                },
                // Наука та Технології (Mythbusters, How it's made)
                {
                    "title": "Наука, Техніка та Експерименти",
                    "url": "discover/tv",
                    "params": {
                        "with_genres": "99",
                        "with_keywords": "12554|4924", // Science OR Technology
                        "sort_by": "popularity.desc"
                    }
                },

                // Подорожі (Орел і Решка, Travel Man)
                {
                    "title": "Подорожі та Туризм",
                    "url": "discover/tv",
                    "params": {
                        "with_genres": "99,10764",
                        "with_keywords": "9714",   // Keyword: Travel
                        "sort_by": "vote_average.desc",
                        "vote_count.gte": "20"
                    }
                },

                // True Crime (Кримінал)
                {
                    "title": "True Crime: Реальні розслідування",
                    "url": "discover/tv",
                    "params": {
                        "with_genres": "99",
                        "with_keywords": "10714|9840", // Serial Killer OR Investigation
                        "sort_by": "popularity.desc"
                    }
                }
            ]
        }
    };

    // Networks Catalog Test 6 — restore native More controls on Maker Main rows.
    var nxCatalogCache = {}, nxPending = {}, nxCacheOrder = [];
    var nxProviders = { '8':'netflix', '350':'apple', '384':'hbo', '119':'amazon', '337':'disney', '531':'paramount', '15':'hulu' };
    var nxNetworkIds = { '213':'netflix', '49':'hbo', '3186':'hbo', '1024':'amazon', '2739':'disney', '4330':'paramount', '453':'hulu', '77':'syfy' };
    var nxCatalogSettingsKey = 'networks_catalog_channel';
    var nxCatalogVisibilityKey = 'networks_catalog_visibility_v12';
    var nxCatalogOrder = ['netflix','apple','hbo','amazon','disney','paramount','hulu','syfy','educational_and_reality','ua'];
    function nxCatalogEnabled(id) {
        var saved = Lampa.Storage.get(nxCatalogVisibilityKey, null);
        if (saved && typeof saved === 'object' && Object.prototype.hasOwnProperty.call(saved,id)) return saved[id] !== false;
        // Migrate the Test 11 UA toggle without silently changing user preference.
        if (id === 'ua') return Lampa.Storage.get('networks_show_ua',true) !== false;
        return true;
    }
    function nxCatalogVisibilityMenu() {
        var controller = Lampa.Controller.enabled().name;
        function show() {
            Lampa.Select.show({
                title: 'Керування каталогами',
                items: nxCatalogOrder.map(function(id){
                    return {id:id,title:(nxCatalogEnabled(id) ? '☑ ' : '☐ ') + (nxServiceConfigs[id] ? nxServiceConfigs[id].title : id)};
                }),
                onBack: function(){ Lampa.Controller.toggle(controller); },
                onSelect: function(item){
                    var state = Lampa.Storage.get(nxCatalogVisibilityKey,null) || {};
                    state[item.id] = !nxCatalogEnabled(item.id);
                    Lampa.Storage.set(nxCatalogVisibilityKey,state);
                    // Reopen to permit several selections without navigating settings again.
                    setTimeout(show,60);
                }
            });
        }
        show();
    }
    var nxCatalogTTL = 5 * 60 * 1000;
    function nxServiceFromButton(item, type) {
        if (!item) return '';
        var id = String(item.id);
        // TMDB watch provider vs TV network are distinct entities.
        if (item.country_code) return nxProviders[id] || '';
        if (type === 'tv') return nxNetworkIds[id] || '';
        return '';
    }
    function nxUrl(cat, page) {
        var args = ['api_key=' + encodeURIComponent(Lampa.TMDB.key()), 'language=' + encodeURIComponent(Lampa.Storage.get('language','uk')), 'page=' + (page || 1)];
        var p = cat.params || {};
        Object.keys(p).forEach(function (k) {
            var v = p[k];
            if (v === '{current_date}') {
                var d = new Date();
                v = [d.getFullYear(), ('0'+(d.getMonth()+1)).slice(-2), ('0'+d.getDate()).slice(-2)].join('-');
            }
            args.push(encodeURIComponent(k) + '=' + encodeURIComponent(v));
        });
        return Lampa.TMDB.api(cat.url + '?' + args.join('&'));
    }
    function nxFetch(url, cb) {
        var now = Date.now();
        if (nxCatalogCache[url] && now - nxCatalogCache[url].time < nxCatalogTTL) return cb(nxCatalogCache[url].data);
        if (nxPending[url]) { nxPending[url].push(cb); return; }
        nxPending[url] = [cb];
        var req = new Lampa.Reguest();
        req.silent(url, function(data) {
            nxCatalogCache[url] = {time:Date.now(), data:data};
            nxCacheOrder.push(url);
            while(nxCacheOrder.length > 80) {
                var old = nxCacheOrder.shift();
                if (nxCacheOrder.indexOf(old) === -1) delete nxCatalogCache[old];
            }
            var callbacks = nxPending[url] || []; delete nxPending[url];
            callbacks.forEach(function(fn){fn(data);});
        }, function() {
            var callbacks = nxPending[url] || []; delete nxPending[url];
            callbacks.forEach(function(fn){fn(null);});
        });
    }

    // Franchise Expansion Test 10. Keep this registry separate from Lampa's Collection.
    // When franchises.json is published to this path, it replaces the built-in
    // pilot registry without a JS update. Offline / 404 uses the built-in copy.
    var nxFranchiseUrl = 'https://raw.githubusercontent.com/P1cas5o/lampa/main/franchises.json';
    var nxFranchiseFallback = {"version":2,"franchises":[{"id":"wizarding-world","title":"Чарівний світ","description":"Гаррі Поттер, Фантастичні звірі та нова телеадаптація HBO","collection_ids":[1241,435259],"movie_ids":[671,672,673],"tv_ids":[224377]},{"id":"john-wick","title":"Джон Вік","description":"Кінофраншиза Джона Віка","collection_ids":[404609],"movie_ids":[],"tv_ids":[]},{"id":"middle-earth","title":"Середзем’я","description":"Володар перснів і Гобіт","collection_ids":[119,121938],"movie_ids":[],"tv_ids":[]},{"id":"star-wars","title":"Зоряні війни","description":"Основна кіносерія та вибрані анімаційні серіали","collection_ids":[10],"movie_ids":[],"tv_ids":[4194,60554]}]};
    var nxFranchiseRegistry = nxFranchiseFallback;
    var nxFranchiseLoadedAt = 0;
    var nxFranchiseLoading = false;
    var nxFranchiseWaiters = [];
    var nxFranchiseCollectionCache = {};
    function nxFranchiseLoad(callback) {
        if (Date.now() - nxFranchiseLoadedAt < 6*60*60*1000) {callback(nxFranchiseRegistry);return;}
        nxFranchiseWaiters.push(callback);
        if (nxFranchiseLoading) return;
        nxFranchiseLoading = true;
        var req = new Lampa.Reguest();
        function finish(data) {
            if (data && data.version === 2 && Array.isArray(data.franchises)) nxFranchiseRegistry = data;
            nxFranchiseLoadedAt = Date.now();
            nxFranchiseLoading = false;
            nxFranchiseWaiters.splice(0).forEach(function(fn){try{fn(nxFranchiseRegistry);}catch(e){}});
        }
        req.silent(nxFranchiseUrl + '?v=2', function(data){finish(data);}, function(){finish(null);});
    }
    function nxFranchiseForTitle(item, type) {
        if (!item || !item.id) return [];
        var key = type === 'tv' ? 'tv_ids' : 'movie_ids';
        var collectionId = item.belongs_to_collection && item.belongs_to_collection.id;
        return nxFranchiseRegistry.franchises.filter(function(f){
            return (f[key] || []).some(function(id){return Number(id) === Number(item.id);}) ||
                (type !== 'tv' && collectionId && (f.collection_ids || []).some(function(id){return Number(id) === Number(collectionId);})) ||
                (type !== 'tv' && (f.collection_ids || []).some(function(id){
                    var data = nxFranchiseCollectionCache[id];
                    return data && (data.parts || []).some(function(part){return Number(part.id) === Number(item.id);});
                }));
        });
    }
    function nxFranchiseButton(f) {
        var btn = $('<div class="tag-count selector network-btn nx-franchise-button"></div>');
        btn.append($('<div class="tag-count__name"></div>').text('✦ ' + f.title));
        btn.on('hover:enter click', function(){
            Lampa.Activity.push({title:f.title,component:'networks_franchise_main',franchise_id:f.id,source:'tmdb',page:1});
        });
        return btn;
    }
    function nxFranchiseInsert(render, item, type) {
        if (!render || !render.length || !item || !item.id) return;
        if (Lampa.Storage.get('networks_show_franchises', true) === false) return;
        nxFranchiseLoad(function(){
            if (Lampa.Storage.get('networks_show_franchises', true) === false) return;
            // Never inject into a stale title after a navigation change.
            if (!render[0] || !document.body.contains(render[0])) return;
            var matches = nxFranchiseForTitle(item,type);
            if (!matches.length && type !== 'tv' && !item.belongs_to_collection) {
                // One title-details request only on cache miss, never one per franchise.
                nxFetch(Lampa.TMDB.api('movie/'+item.id+'?api_key='+Lampa.TMDB.key()+'&language=uk-UA'),function(detail){
                    if (detail && detail.belongs_to_collection) {
                        item.belongs_to_collection=detail.belongs_to_collection;
                        nxFranchiseInsert(render,item,type);
                    }
                });
                return;
            }
            if (!matches.length) return;
            var line = $('.tmdb-networks',render).first();
            if (!line.length) {
                var top = formatCSSValue(settings.networks_margin_top);
                var bottom = formatCSSValue(settings.networks_margin_bottom);
                line = $('<div class="tmdb-networks" style="margin-top:'+top+';--tmdb-net-gap:'+formatCSSValue(settings.networks_margin_buttons)+';--tmdb-net-btn-h:'+formatCSSValue(settings.networks_btn_height)+';"><div class="items-line__body" style="margin-bottom:'+bottom+'"><div class="full-descr"><div class="full-descr__left"><div class="full-descr__tags networks-wrapper"></div></div></div></div></div>');
                $('.items-line',render).eq(0).prepend(line);
            }
            var tags = line.find('.full-descr__tags').first();
            tags.find('.nx-franchise-group').remove();
            var group = $('<div class="nx-franchise-group"></div>');
            matches.forEach(function(f){group.append(nxFranchiseButton(f));});
            tags.append(group);
            // Align with the actual logo row, not the outer full-description edge.
            // Portrait phones inherit the existing center-on-mobile option.
            function nxAlignFranchise() {
                if (!document.body.contains(group[0])) return;
                var center = settings.platforms_mobile_center && window.matchMedia && window.matchMedia('(max-width: 768px) and (orientation: portrait)').matches;
                group.css({'justify-content':center?'center':'flex-start','padding-left':'0'});
                if (!center) {
                    var logos = tags.children('.platforms-group').first();
                    if (!logos.length) logos = tags.children('.studios-group').first();
                    if (logos.length) {
                        var delta = logos.offset().left - tags.offset().left;
                        if (delta > 0 && delta < 150) group.css('padding-left',delta+'px');
                    }
                }
            }
            nxAlignFranchise();
            $(window).off('resize.nxfranchisealign').on('resize.nxfranchisealign',nxAlignFranchise);
        });
    }
    function nxFranchiseFetchCollection(id,cb) {
        if (nxFranchiseCollectionCache[id]) {cb(nxFranchiseCollectionCache[id]);return;}
        var url = Lampa.TMDB.api('collection/'+id+'?api_key='+Lampa.TMDB.key()+'&language=uk-UA');
        nxFetch(url,function(data){
            if (data && Array.isArray(data.parts)) nxFranchiseCollectionCache[id]=data;
            cb(data);
        });
    }
    function nxFranchiseMain(object) {
        if (!Lampa.Maker || !Lampa.Maker.make || !Lampa.Maker.map || !Lampa.Maker.map('Main')) {
            var legacy = new Lampa.InteractionMain(object);
            legacy.create=function(){this.empty();};
            return legacy;
        }
        var comp = Lampa.Maker.make('Main',object);
        comp.use({onCreate:function(){
            var main=this;
            nxFranchiseLoad(function(reg){
                var f=(reg.franchises||[]).filter(function(x){return x.id===object.franchise_id;})[0];
                if (!f){main.empty();return;}
                var movies=[],series=[],tasks=[],seen={};
                function add(item,type) {
                    if (!item || !item.id || seen[type+':'+item.id]) return;
                    seen[type+':'+item.id]=true;
                    item.media_type=type; item.source='tmdb';
                    var method=type;
                    item.params=item.params||{};item.params.emit=item.params.emit||{};
                    item.params.emit.onlyEnter=function(){Lampa.Activity.push({url:method+'/'+item.id,component:'full',id:item.id,method:method,card:item,source:'tmdb'});};
                    (type==='tv'?series:movies).push(item);
                }
                (f.collection_ids||[]).forEach(function(id){tasks.push(function(done){nxFranchiseFetchCollection(id,function(data){
                    if (data && Array.isArray(data.parts)) data.parts.forEach(function(part){add(part,'movie');});
                    done();
                });});});
                (f.movie_ids||[]).forEach(function(id){tasks.push(function(done){
                    if (seen['movie:'+id]) {done();return;}
                    nxFetch(Lampa.TMDB.api('movie/'+id+'?api_key='+Lampa.TMDB.key()+'&language=uk-UA'),function(data){if(data && data.id)add(data,'movie');done();});
                });});
                (f.tv_ids||[]).forEach(function(id){tasks.push(function(done){
                    nxFetch(Lampa.TMDB.api('tv/'+id+'?api_key='+Lampa.TMDB.key()+'&language=uk-UA'),function(data){if(data && data.id)add(data,'tv');done();});
                });});
                var pos=0,active=0,complete=0;
                function build(){
                    movies.sort(function(a,b){return (a.release_date||'').localeCompare(b.release_date||'');});
                    series.sort(function(a,b){return (a.first_air_date||'').localeCompare(b.first_air_date||'');});
                    var rows=[];
                    if(movies.length)rows.push({title:'Фільми ('+movies.length+')',results:movies,source:'tmdb',params:{items:{mapping:'line',view:15}}});
                    if(series.length)rows.push({title:'Серіали ('+series.length+')',results:series,source:'tmdb',params:{items:{mapping:'line',view:15}}});
                    if(rows.length)main.build(rows);else main.empty();
                }
                function pump(){while(active<4 && pos<tasks.length){active++;tasks[pos++](function(){active--;complete++;if(complete===tasks.length)build();else pump();});}}
                if(tasks.length)pump();else main.empty();
            });
        }});
        return comp;
    }

    function nxNormalize(json, cat) {
        if (!json || !Array.isArray(json.results)) return {results:[], page:1, total_pages:1};
        json.results.forEach(function(item){
            item.source='tmdb'; // Force native Obsidian/Spectrolite source recognition for TMDB Discover results.
            if (!item.media_type) item.media_type = cat.url === 'discover/tv' ? 'tv' : 'movie';
        });
        return json;
    }
    // Use the actual Lampa Maker Card pipeline, so Obsidian can select card_obsidian
    // and Spectrolite can decorate .card--obsidian. Never imitate Spectrolite CSS.
    // Obsidian selects its own card template during Maker Card.onCreate,
    // but only for data.source === 'tmdb'. Keep the same maker path as home rows.
    function nxNativeCard(element) {
        if (element && element.data && typeof element.data === 'object') element.data.source = 'tmdb';
        return Lampa.Maker.make('Card', element, function(module) {
            return module.only('Card', 'Callback');
        });
    }
    function nxNativeItems(data) {
        if (!data || !data.results) return data;
        data.results.forEach(function(item) {
            item.source = 'tmdb';
            if (item.params) delete item.params.createInstance;
        });
        data.params = data.params || {};
        data.params.items = data.params.items || {};
        // Lampa reads the renderer from row params, not from TMDB item params.
        data.params.items.createInstance = nxNativeCard;
        data.params.createInstance = nxNativeCard;
        return data;
    }
    function nxServiceMark(id, title) {
        var words = {
            netflix:'<span class="nx-word nx-netflix">N</span>',
            apple:'<span class="nx-word nx-apple">Apple TV+</span>',
            hbo:'<span class="nx-word nx-hbo">HBO / Max</span>',
            amazon:'<span class="nx-word nx-prime">prime video</span>',
            disney:'<span class="nx-word nx-disney">Disney+</span>',
            paramount:'<span class="nx-word nx-paramount">Paramount+</span>',
            hulu:'<span class="nx-word nx-hulu">hulu</span>',
            syfy:'<span class="nx-word nx-syfy">SYFY</span>',
            educational_and_reality:'<span class="nx-word nx-learning">Discovery+</span>',
            ua:'<span class="nx-word nx-ua">UA <img class="nx-ua-flag" src="https://raw.githubusercontent.com/P1cas5o/lampa/main/assets/ua_flag_source_order.svg" alt="Україна" /></span>'
        };
        return words[id] || $('<span>').text(title).prop('outerHTML');
    }
    function nxOpenService(id) {
        var conf = nxServiceConfigs[id];
        if (!conf) return false;
        Lampa.Activity.push({title:conf.title, component:'networks_catalog_main', service_id:id, page:1, source:'tmdb'});
        return true;
    }
    // The existing Networks buttons use category_full. Unlike InteractionCategory,
    // this is the proven native TMDB path decorated by Obsidian/Spectrolite.
    function nxOpenNativeCategory(cat, title) {
        var filter = {}, params = cat.params || {};
        Object.keys(params).forEach(function(key) {
            var value = params[key];
            if (value === '{current_date}') {
                var d = new Date();
                value = [d.getFullYear(), ('0'+(d.getMonth()+1)).slice(-2), ('0'+d.getDate()).slice(-2)].join('-');
            }
            filter[key] = value;
        });
        var sort = filter.sort_by || 'popularity.desc';
        delete filter.sort_by;
        Lampa.Activity.push({
            url: cat.url,
            title: title,
            component: 'category_full',
            sort_by: sort,
            filter: filter,
            source: 'tmdb',
            card_type: true,
            page: 1
        });
    }
    // Test 5: Native Maker Main -> Line -> Card chain, matching the Lampa 3.x
    // home screen and category_full card creation path. No DOM replacement.
    function nxCatalogMain(object) {
        var conf = nxServiceConfigs[object.service_id];
        // Preserve the Test 4 behavior on older Lampa builds without Maker Main.
        if (!Lampa.Maker || !Lampa.Maker.make || !Lampa.Maker.map || !Lampa.Maker.map('Main')) {
            return nxLegacyCatalogMain(object);
        }
        var comp = Lampa.Maker.make('Main', object);
        comp.use({
            onCreate: function () {
                var main = this;
                if (!conf) { main.empty(); return; }
                var cats = conf.categories || [];
                var rows = new Array(cats.length);
                var next = 0, active = 0, finished = 0;
                function done() {
                    finished++;
                    if (finished !== cats.length) return;
                    var list = rows.filter(Boolean);
                    if (list.length) main.build(list); else main.empty();
                }
                function pump() {
                    while (active < 4 && next < cats.length) {
                        (function (index) {
                            active++;
                            var cat = cats[index];
                            nxFetch(nxUrl(cat, 1), function (json) {
                                var data = nxNormalize(json, cat);
                                if (data.results.length) {
                                    // Maker Main rows do not inherit the category_full
                                    // card selection handler. Wire the same native
                                    // full-screen navigation through Card's emit API.
                                    data.results.forEach(function (item) {
                                        if (!item || !item.id) return;
                                        var method = item.media_type === 'tv' ? 'tv' : 'movie';
                                        item.params = item.params || {};
                                        item.params.emit = item.params.emit || {};
                                        item.params.emit.onlyEnter = function () {
                                            Lampa.Activity.push({
                                                url: method + '/' + item.id,
                                                component: 'full',
                                                id: item.id,
                                                method: method,
                                                card: item,
                                                source: 'tmdb'
                                            });
                                        };
                                    });
                                    // Main builds native Line instances, which build native
                                    // Card instances. The Obsidian hook sees source=tmdb.
                                    rows[index] = {
                                        title: cat.title,
                                        results: data.results,
                                        // Both the header More action and the final More card
                                        // are generated by the native Line only when the row
                                        // advertises additional pages.
                                        url: cat.url,
                                        source: 'tmdb',
                                        page: 1,
                                        more: true,
                                        total_pages: Math.max(2, Number(data.total_pages) || 2),
                                        category_index: index,
                                        service_id: object.service_id,
                                        params: {items: {mapping: 'line', view: 15}}
                                    };
                                }
                                active--;
                                done();
                                pump();
                            });
                        })(next++);
                    }
                }
                if (cats.length) pump(); else main.empty();
            },
            onInstance: function (line, data) {
                // Keep both native More affordances wired to the same filtered
                // category_full destination. No synthetic DOM or custom focus.
                if (!line || !line.use || !data) return;
                line.use({
                    onMore: function () {
                        var cat = conf && conf.categories && conf.categories[data.category_index];
                        if (cat) nxOpenNativeCategory(cat, data.title || cat.title);
                    }
                });
            },
            onMore: function (data) {
                // Some Maker Main versions dispatch More at Main level.
                var cat = conf && conf.categories && conf.categories[data && data.category_index];
                if (!cat && data && conf) cat = conf.categories.filter(function (item) {
                    return item.title === data.title;
                })[0];
                if (cat) nxOpenNativeCategory(cat, (data && data.title) || cat.title);
            }
        });
        return comp;
    }
    function nxLegacyCatalogMain(object) {
        var comp = new Lampa.InteractionMain(object);
        comp.create = function () {
            var that = this, conf = nxServiceConfigs[object.service_id];
            if (!conf) { this.empty(); return this.render(); }
            this.activity.loader(true);
            var cats = conf.categories || [], rows = new Array(cats.length);
            var next = 0, active = 0, finished = 0;
            function done() {
                finished++;
                if (finished !== cats.length) return;
                var list = rows.filter(Boolean);
                if (list.length) that.build(list); else that.empty();
                that.activity.loader(false);
            }
            function pump() {
                while (active < 4 && next < cats.length) {
                    (function (index) {
                        active++;
                        var cat = cats[index];
                        nxFetch(nxUrl(cat, 1), function (json) {
                            var data = nxNormalize(json, cat);
                            if (data.results.length) rows[index] = nxNativeItems({
                                title: cat.title, results: data.results, url: cat.url, more: true,
                                total_pages: Math.max(2, Number(data.total_pages) || 2),
                                params: {items: {mapping: 'line', view: 15}},
                                category_index: index, service_id: object.service_id
                            });
                            active--; done(); pump();
                        });
                    })(next++);
                }
            }
            if (cats.length) pump(); else {this.empty(); this.activity.loader(false);}
            return this.render();
        };
        comp.onMore = function (data) {
            var conf = nxServiceConfigs[object.service_id];
            var cat = conf && conf.categories && conf.categories[data.category_index];
            if (!cat && conf && conf.categories) cat = conf.categories.filter(function (c) {return c.title === data.title;})[0];
            if (cat) nxOpenNativeCategory(cat, data.title || cat.title);
        };
        return comp;
    }
    function nxCatalogView(object) {
        var comp = new Lampa.InteractionCategory(object);
        var conf = nxServiceConfigs[object.service_id];
        var cat = conf && conf.categories[object.category_index];
        function request(page, resolve, reject) {
            if (!cat) {reject();return;}
            nxFetch(nxUrl(cat,page),function(data){
                if (data) resolve(nxNativeItems(nxNormalize(data,cat))); else reject();
            });
        }
        comp.create = function() {
            var that=this;
            request(1,function(data){that.build(data);},function(){that.empty();});
        };
        comp.nextPageReuest = function(params,resolve,reject) {request(params.page,resolve,reject);};
        return comp;
    }
    function nxRegisterCatalog() {
        if (!Lampa.Component || !Lampa.ContentRows) return;
        Lampa.Component.add('networks_catalog_main',nxCatalogMain);
        Lampa.Component.add('networks_franchise_main',nxFranchiseMain);
        // Full thematic lists use Lampa's native category_full (Obsidian-compatible).
        Lampa.ContentRows.add({
            index: 7, name:'networks_streaming_catalogs', title:'Стрімінги', screen:['main'],
            call:function(){return function(callback){
                if (Lampa.Storage.get(nxCatalogSettingsKey,true) === false) {callback({results:[]});return;}
                var ids=nxCatalogOrder.filter(nxCatalogEnabled);
                var items=ids.filter(function(id){return nxServiceConfigs[id];}).map(function(id){
                    var conf=nxServiceConfigs[id];
                    return {title:conf.title,params:{
                        createInstance:nxNativeCard,
                        emit:{
                            onCreate:function(){
                                var card=$(this.html); card.addClass('nx-service-tile');
                                card.find('.card__view').empty().append($('<div class="nx-service-logo"></div>').html(nxServiceMark(id,conf.title)));
                                card.find('.card__age,.card__year,.card__type,.card__textbox,.card__img,.card__metadata,.card__marker,.card__title').remove();
                            },
                            onlyEnter:function(){nxOpenService(id);}
                        }
                    }};
                });
                callback({results:items,title:'Стрімінги',params:{items:{mapping:'line',view:15}}});
            };}
        });
        $('<style id="networks-catalog-style">' +
          '.nx-service-tile{width:12.5em!important;min-width:12.5em!important;max-width:12.5em!important;flex:0 0 12.5em!important;box-sizing:border-box!important}' +
          '.nx-service-tile .card__view{width:100%!important;height:7.3em!important;min-height:7.3em!important;max-height:7.3em!important;aspect-ratio:auto!important;display:flex!important;align-items:center!important;justify-content:center!important;overflow:hidden!important;background:rgba(255,255,255,.085)!important;border-radius:.7em!important;padding:.65em!important;box-sizing:border-box!important}' +
          '.nx-service-tile .card__view:before,.nx-service-tile .card__view:after{content:none!important}' +
          '.nx-service-tile .card__title,.nx-service-tile .spl-caption{display:none!important}' +
          '.nx-service-logo{width:100%;height:100%;display:flex;align-items:center;justify-content:center;overflow:hidden;box-sizing:border-box}' +
          '.nx-word{display:block;max-width:100%;text-align:center;white-space:nowrap;font-weight:800;font-size:1.35em;letter-spacing:-.04em;line-height:1.1;color:#fff}' +
          '.nx-netflix{font-size:3.5em;color:#e50914;font-family:Arial,sans-serif}' +
          '.nx-apple{font-size:1.65em;letter-spacing:-.055em}' +
          '.nx-hbo{font-size:1.65em;letter-spacing:-.065em}' +
          '.nx-prime{font-size:1.4em;color:#56c5f5}' +
          '.nx-disney{font-size:1.65em}' +
          '.nx-paramount{font-size:1.4em}' +
          '.nx-hulu{font-size:2.1em;color:#1ce783}' +
          '.nx-syfy{font-size:2.05em}' +
          '.nx-learning{font-size:1.25em}' +
          '.nx-ua{font-size:2em;letter-spacing:.02em;display:flex;align-items:center;justify-content:center;gap:.22em}.nx-ua-flag{width:.75em;height:.5em;object-fit:contain;display:inline-block}' +
          '</style>').appendTo('head');
        Lampa.SettingsApi.addParam({component:'platforms',param:{name:nxCatalogSettingsKey,type:'trigger',default:true},field:{name:'Канал стримінгів на головній',description:'Показувати логотипи сервісів із переходом до тематичних каталогів'}});
        Lampa.SettingsApi.addParam({component:'platforms',param:{type:'button',component:'networks_catalog_visibility'},field:{name:'Керування каталогами',description:'Вибрати видимі каталоги галочками; після зміни оновіть головну'},onChange:nxCatalogVisibilityMenu});
        Lampa.SettingsApi.addParam({component:'platforms',param:{name:'networks_show_franchises',type:'trigger',default:true},field:{name:'Показувати франшизи',description:'Один загальний перемикач кнопок франшиз у картках тайтлів'}});
    }

        function startPlugin() {
            if (window.tmdb_networks) return;
            window.tmdb_networks = true;
            $('<style>').prop('type', 'text/css').html('.networks-wrapper { display: flex; flex-wrap: wrap; align-items: center; } .platforms-group, .studios-group { display: flex; flex-wrap: wrap; align-items: center; } .platforms-group > *, .studios-group > * { margin-right: var(--tmdb-net-gap, 0.5em); margin-bottom: var(--tmdb-net-gap, 0.5em); } .network-btn { height: var(--tmdb-net-btn-h, 2.2em); display: inline-flex; align-items: center; justify-content: center; overflow: hidden; } .full-descr__left .tag-count.network-btn::before { display: none !important; content: none !important; } .network-separator { width: 2px; height: 1.8em; background: rgba(255,255,255,0.2); margin: 0 var(--tmdb-net-gap, 0.5em) var(--tmdb-net-gap, 0.5em) 0.1em; border-radius: 2px; } .network-logo { background-color: #ffffff !important; position: relative; padding: 0.3em 0.6em; border-radius: 0.6em; } .network-logo img { height: calc(var(--tmdb-net-btn-h, 2.2em) * 0.7); width: auto; max-width: 100%; object-fit: contain; border-radius: 0; } .network-logo .overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(255, 255, 255, 0); border-radius: 0.6em; } .network-logo.full-start__button .overlay { border-radius: 1em; } .network-logo.focus { box-shadow: 0 0 0 0.2em #fff !important; } .network-logo.focus .overlay { background: rgba(0, 0, 0, 0.2) !important; } @media (max-width: 768px) { .center-on-mobile { justify-content: center; } .center-on-mobile .platforms-group, .center-on-mobile .studios-group { justify-content: center; } }').appendTo('head');
            if (!$('#nx-logo-contrast-style').length) $('<style id="nx-logo-contrast-style">.tmdb-networks .network-logo.nx-logo-dark{background-color:#252a35!important}.tmdb-networks .nx-logo-fallback{padding:0 .65em;max-width:18em}.tmdb-networks .nx-logo-fallback .tag-count__name{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}</style>').appendTo('head');
            initSettings();
            addLocalization();
            addSettings();
            nxRegisterCatalog();
            if (!$('#nx-franchise-style').length) $('<style id="nx-franchise-style">.nx-franchise-group{display:flex;flex-wrap:wrap;column-gap:var(--tmdb-net-gap,.5em);row-gap:var(--tmdb-net-gap,.5em);align-items:center;flex:0 0 100%;width:100%;min-width:0;margin:0;padding:0}.nx-franchise-button{border:1px solid rgba(255,255,255,.35);border-radius:.65em;padding:0 .75em;max-width:100%}.nx-franchise-button.focus{box-shadow:0 0 0 .18em #fff}.nx-franchise-group{box-sizing:border-box}.nx-franchise-group .nx-franchise-button{margin-top:var(--tmdb-net-gap,.5em)}</style>').appendTo('head');
            Lampa.Listener.follow('activity',function(e){
                if (e && e.type === 'complite') {
                    var a = Lampa.Activity.active();
                    if (a && a.component === 'company') setTimeout(nxCompanyLogoContrast,60);
                    else if (nxCompanyObserver) {nxCompanyObserver.disconnect();nxCompanyObserver=null;}
                }
            });
            Lampa.Listener.follow('activity,full', function (e) {
                if (e.type === 'complite' || e.type === 'archive') renderNetworks();
            });
        }
        if (window.appready) startPlugin();
        else Lampa.Listener.follow('app', function (event) { if (event.type === 'ready') startPlugin(); });
    })();
