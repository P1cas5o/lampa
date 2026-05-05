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

    var FLIXIO_I18N = {
        hero_row_title: { uk: 'Новинки прокату', ru: 'Новинки проката', en: 'New theatrical releases', pl: 'Nowości kinowe' },
        hero_row_title_full: { uk: '🔥 Новинки прокату', ru: '🔥 Новинки проката', en: '🔥 New theatrical releases', pl: '🔥 Nowości kinowe' },
        streamings_row_title: { uk: 'Стрімінги', ru: 'Стриминги', en: 'Streaming', pl: 'Serwisy streamingowe' },
        streamings_row_title_full: { uk: '📺 Стрімінги', ru: '📺 Стриминги', en: '📺 Streaming', pl: '📺 Serwisy streamingowe' },
        ukrainian_feed_name: { uk: 'Українська стрічка', ru: 'Украинская лента', en: 'Ukrainian feed', pl: 'Ukraiński feed' },
        polish_feed_name: { uk: 'Польська стрічка', ru: 'Польская лента', en: 'Polish feed', pl: 'Polski feed' },
        russian_feed_name: { uk: 'Російська стрічка', ru: 'Русская лента', en: 'Russian feed', pl: 'Rosyjski feed' },
        ru_new_movies: { uk: '🔥 Нові фільми', ru: '🔥 Новые фильмы', en: '🔥 New movies', pl: '🔥 Nowe filmy' },
        ru_new_tv: { uk: '🔥 Нові серіали', ru: '🔥 Новые сериалы', en: '🔥 New series', pl: '🔥 Nowe seriale' },
        ru_shows: { uk: '🎤 Шоу та Реаліті', ru: '🎤 Шоу и реалити', en: '🎤 Shows & Reality', pl: '🎤 Show i Reality' },
        ru_trending_movies: { uk: '📈 Популярні фільми', ru: '📈 Популярные фильмы', en: '📈 Trending movies', pl: '📈 Popularne filmy' },
        ru_trending_series: { uk: '📈 Популярні серіали', ru: '📈 Популярные сериалы', en: '📈 Trending series', pl: '📈 Popularne seriale' },
        ru_best_movies: { uk: '⭐ Найкращі фільми', ru: '⭐ Лучшие фильмы', en: '⭐ Best movies', pl: '⭐ Najlepsze filmy' },
        ru_all_movies: { uk: '🎬 Всі фільми (Ru)', ru: '🎬 Все фильмы (Ru)', en: '🎬 All movies (Ru)', pl: '🎬 Wszystkie filmy (Ru)' },
        ru_all_series: { uk: '📺 Всі серіали (Ru)', ru: '📺 Все сериалы (Ru)', en: '📺 All series (Ru)', pl: '📺 Wszystkie seriale (Ru)' },
        ru_all_shows: { uk: '🎤 Всі шоу (Ru)', ru: '🎤 Все шоу (Ru)', en: '🎤 All shows (Ru)', pl: '🎤 Wszystkie show (Ru)' },
        ukrainian_row_title: { uk: 'Новинки української стрічки', ru: 'Новинки украинской ленты', en: 'New in Ukrainian feed', pl: 'Nowości w ukraińskiej sekcji' },
        ukrainian_row_title_full: { uk: '🇺🇦 Новинки української стрічки', ru: '🇺🇦 Новинки украинской ленты', en: '🇺🇦 New in Ukrainian feed', pl: '🇺🇦 Nowości w ukraińskiej sekcji' },
        polish_row_title: { uk: 'Новинки польської стрічки', ru: 'Новинки польской ленты', en: 'New in Polish feed', pl: 'Nowości w polskiej sekcji' },
        polish_row_title_full: { uk: '🇵🇱 Новинки польської стрічки', ru: '🇵🇱 Новинки польской ленты', en: '🇵🇱 New in Polish feed', pl: '🇵🇱 Nowości w polskiej секcji' },
        russian_row_title: { uk: 'Новинки російської стрічки', ru: 'Новинки Русской ленты', en: 'New in Russian feed', pl: 'Nowości w rosyjskiej sekcji' },
        russian_row_title_full: { uk: '🇷🇺 Новинки російської стрічки', ru: '🇷🇺 Новинки Русской ленты', en: '🇷🇺 New in Russian feed', pl: '🇷🇺 Nowości w rosyjskiej sekcji' },
        english_row_title: { uk: 'Новинки англомовної стрічки', ru: 'Новинки Английской ленты', en: 'New in English feed', pl: 'Nowości w anglojęzycznej sekcji' },
        english_row_title_full: { uk: 'En Новинки англомовної стрічки', ru: 'En Новинки Английской ленты', en: 'En New in English feed', pl: 'En Nowości w anglojęzycznej sekcji' },
        mood_row_title: { uk: 'Кіно під настрій', ru: 'Кино по настроению', en: 'Mood movies', pl: 'Kino na nastrój' },
        mood_row_title_full: { uk: '🎭 Кіно під настрій', ru: '🎭 Кино по настроению', en: '🎭 Mood movies', pl: '🎭 Kino na nastrój' },
        mood_cry: { uk: 'До сліз / Катарсис', ru: 'До слёз / Катaрсис', en: 'To tears / Catharsis', pl: 'Do łez / Katarzis' },
        mood_positive: { uk: 'Чистий позитив', ru: 'Чистый позитив', en: 'Pure positivity', pl: 'Czysty pozytyw' },
        mood_tasty: { uk: 'Смачний перегляд', ru: 'Вкусный просмотр', en: 'Tasty watch', pl: 'Smaczne oglądanie' },
        mood_adrenaline: { uk: 'Адреналін', ru: 'Адреналин', en: 'Adrenaline', pl: 'Adrenalina' },
        mood_butterflies: { uk: 'Метелики в животі', ru: 'Бабочки в животе', en: 'Butterflies in the stomach', pl: 'Motyle w brzuchu' },
        mood_tension: { uk: 'На межі / Напруга', ru: 'На грани / Напряжение', en: 'On the edge / Tension', pl: 'Na krawędzi / Napięcie' },
        mood_adventure: { uk: 'Пошук пригод', ru: 'В поисках приключений', en: 'Looking for adventure', pl: 'W poszukiwaniu przygód' },
        mood_together: { uk: 'Разом веселіше', ru: 'Вместе веселее', en: 'More fun together', pl: 'Razem weselej' },
        mood_family: { uk: 'Малим і дорослим', ru: 'Малым и взрослым', en: 'For kids and adults', pl: 'Dla małych i dużych' },
        mood_your_choice: { uk: 'На твій смак', ru: 'На твой вкус', en: 'To your taste', pl: 'Według twojego gustu' },
        today_on_prefix: { uk: 'Сьогодні на ', ru: 'Сегодня на ', en: 'Today on ', pl: 'Dziś na ' },
        go_to_page: { uk: 'На сторінку', ru: 'На страницу', en: 'Open page', pl: 'Na stronę' },
        cat_new_movies: { uk: '🔥 Нові фільми', ru: '🔥 Новые фильмы', en: '🔥 New movies', pl: '🔥 Nowe filmy' },
        cat_new_tv: { uk: '🔥 Нові серіали', ru: '🔥 Новые сериалы', en: '🔥 New series', pl: '🔥 Nowe seriale' },
        cat_top_tv: { uk: '🏆 Топ Серіали', ru: '🏆 Топ сериалы', en: '🏆 Top series', pl: '🏆 Top seriale' },
        cat_top_movies: { uk: '🏆 Топ Фільми', ru: '🏆 Топ фильмы', en: '🏆 Top movies', pl: '🏆 Top filmy' },
        cat_top_movies_wb: { uk: '🏆 Топ Фільми (WB)', ru: '🏆 Топ фильмы (WB)', en: '🏆 Top movies (WB)', pl: '🏆 Top filmy (WB)' },
        cat_only_netflix: { uk: '🅰️ Тільки на Netflix (Originals)', ru: '🅰️ Только на Netflix (Originals)', en: '🅰️ Only on Netflix (Originals)', pl: '🅰️ Tylko na Netflix (Originals)' },
        cat_twisted_thrillers: { uk: '🤯 Заплутані трилери', ru: '🤯 Запутанные триллеры', en: '🤯 Twisted thrillers', pl: '🤯 Pokręcone thrillery' },
        cat_fantasy_sci: { uk: '🐉 Фантастика та Фентезі', ru: '🐉 Фантастика и фэнтези', en: '🐉 Sci‑Fi & Fantasy', pl: '🐉 Sci‑Fi i fantasy' },
        cat_kdrama: { uk: '🇰🇷 K-Dramas (Корея)', ru: '🇰🇷 K‑Дорамы (Корея)', en: '🇰🇷 K‑Dramas (Korea)', pl: '🇰🇷 K‑dramy (Korea)' },
        cat_truecrime_doc: { uk: '🔪 Документальний True Crime', ru: '🔪 Документальный True Crime', en: '🔪 True Crime documentaries', pl: '🔪 True crime – dokumenty' },
        cat_anime: { uk: '🍿 Аніме', ru: '🍿 Аниме', en: '🍿 Anime', pl: '🍿 Anime' },
        cat_apple_epic_sci: { uk: '🛸 Епічний Sci-Fi (Фішка Apple)', ru: '🛸 Эпический Sci‑Fi (фирменный Apple)', en: '🛸 Epic Sci‑Fi (Apple\'s specialty)', pl: '🛸 Epickie Sci‑Fi (Apple)' },
        cat_comedy_feelgood: { uk: '😂 Комедії та Feel-Good', ru: '😂 Комедии и feel‑good', en: '😂 Comedies & feel‑good', pl: '😂 Komedie i feel‑good' },
        cat_quality_detectives: { uk: '🕵️ Якісні детективи', ru: '🕵️ Качественные детективы', en: '🕵️ Quality detective shows', pl: '🕵️ Dobre kryminały' },
        cat_apple_original: { uk: '🎬 Apple Original Films', ru: '🎬 Apple Original Films', en: '🎬 Apple Original Films', pl: '🎬 Apple Original Films' },
        cat_epic_sagas: { uk: '🐉 Епічні саги (Фентезі)', ru: '🐉 Эпические саги (фэнтези)', en: '🐉 Epic fantasy sagas', pl: '🐉 Epickie sagi fantasy' },
        cat_premium_dramas: { uk: '🎭 Преміальні драми', ru: '🎭 Премиальные драмы', en: '🎭 Premium dramas', pl: '🎭 Premiowe dramaty' },
        cat_dc_blockbusters: { uk: '🦇 Блокбастери DC', ru: '🦇 Блокбастеры DC', en: '🦇 DC blockbusters', pl: '🦇 Blockbustery DC' },
        cat_dark_detectives: { uk: '🧠 Похмурі детективи', ru: '🧠 Мрачные детективы', en: '🧠 Dark detective stories', pl: '🧠 Mroczne kryminały' },
        cat_hbo_classics: { uk: '👑 Золота класика HBO', ru: '👑 Золотая классика HBO', en: '👑 HBO golden classics', pl: '👑 Złota klasyka HBO' },
        cat_hard_action: { uk: '🩸 Жорсткий екшн та Антигерої', ru: '🩸 Жёсткий экшн и антигерои', en: '🩸 Hard action & antiheroes', pl: '🩸 Ostry akcyjniak i antybohaterowie' },
        cat_amazon_mgm: { uk: '🎬 Фільми від Amazon MGM', ru: '🎬 Фильмы от Amazon MGM', en: '🎬 Amazon MGM movies', pl: '🎬 Filmy Amazon MGM' },
        cat_comedies: { uk: '😂 Комедії', ru: '😂 Комедии', en: '😂 Comedies', pl: '😂 Komedie' },
        cat_thrillers: { uk: '🕵️ Трилери', ru: '🕵️ Триллеры', en: '🕵️ Thrillers', pl: '🕵️ Thrillery' },
        cat_adult_animation: { uk: '🤬 Анімація для дорослих', ru: '🤬 Анимация для взрослых', en: '🤬 Adult animation', pl: '🤬 Animacje dla dorosłych' },
        cat_marvel_universe: { uk: '🦸\u200d♂️ Кіновсесвіт Marvel', ru: '🦸\u200d♂️ Киновселенная Marvel', en: '🦸‍♂️ Marvel Cinematic Universe', pl: '🦸‍♂️ Uniwersum Marvela' },
        cat_starwars: { uk: '⚔️ Далека галактика (Star Wars)', ru: '⚔️ Далёкая галактика (Star Wars)', en: '⚔️ A galaxy far away (Star Wars)', pl: '⚔️ Odległa galaktyka (Star Wars)' },
        cat_pixar: { uk: '🧸 Шедеври Pixar', ru: '🧸 Шедевры Pixar', en: '🧸 Pixar masterpieces', pl: '🧸 Arcydzieła Pixara' },
        cat_fx_star: { uk: '🍷 Дорослий контент (FX / Star)', ru: '🍷 Взрослый контент (FX / Star)', en: '🍷 Adult content (FX / Star)', pl: '🍷 Treści dla dorosłych (FX / Star)' },
        cat_sheridan_universe: { uk: '🤠 Всесвіт Шеридана (Yellowstone)', ru: '🤠 Вселенная Шеридана (Yellowstone)', en: '🤠 Sheridan universe (Yellowstone)', pl: '🤠 Uniwersum Sheridana (Yellowstone)' },
        cat_startrek_collection: { uk: '🖖 Колекція Star Trek', ru: '🖖 Коллекция Star Trek', en: '🖖 Star Trek collection', pl: '🖖 Kolekcja Star Trek' },
        cat_crime_investigation: { uk: '🚓 Кримінал та Розслідування', ru: '🚓 Криминал и расследования', en: '🚓 Crime & investigation', pl: '🚓 Kryminał i śledztwa' },
        cat_kids_world: { uk: '🧽 Дитячий світ (Nickelodeon)', ru: '🧽 Детский мир (Nickelodeon)', en: '🧽 Kids world (Nickelodeon)', pl: '🧽 Świat dzieci (Nickelodeon)' },
        cat_paramount_blockbusters: { uk: '🎬 Блокбастери (Paramount)', ru: '🎬 Блокбастеры (Paramount)', en: '🎬 Blockbusters (Paramount)', pl: '🎬 Blockbustery (Paramount)' },
        cat_universal_world: { uk: '🌍 Світ Universal', ru: '🌍 Мир Universal', en: '🌍 Universal world', pl: '🌍 Świat Universal' },
        cat_showtime_adult: { uk: '🕵️ Дорослий розбір (Showtime)', ru: '🕵️ Взрослый разбор (Showtime)', en: '🕵️ Adult breakdown (Showtime)', pl: '🕵️ Analizy dla dorosłych (Showtime)' },
        cat_dreamworks_worlds: { uk: '🦄 Казкові світи (DreamWorks)', ru: '🦄 Сказочные миры (DreamWorks)', en: '🦄 Fairy-tale worlds (DreamWorks)', pl: '🦄 Bajkowe światy (DreamWorks)' },
        cat_new_releases_syfy: { uk: '🔥 Новинки', ru: '🔥 Новинки', en: '🔥 New releases', pl: '🔥 Nowości' },
        cat_top_syfy: { uk: '🏆 Топ на Syfy', ru: '🏆 Топ на Syfy', en: '🏆 Top on Syfy', pl: '🏆 Top na Syfy' },
        cat_space_travel: { uk: '🚀 Космічні подорожі', ru: '🚀 Космические путешествия', en: '🚀 Space journeys', pl: '🚀 Podróże kosmiczne' },
        cat_monsters_paranormal: { uk: '🧟 Монстри та паранормальне', ru: '🧟 Монстры и паранормальное', en: '🧟 Monsters and paranormal', pl: '🧟 Potwory i zjawiska paranormalne' },
        educational_title: { uk: 'Пізнавальне', ru: 'Познавательное', en: 'Educational', pl: 'Edukacyjne' },
        cat_new_episodes: { uk: '🔥 Нові випуски', ru: '🔥 Новые выпуски', en: '🔥 New episodes', pl: '🔥 Nowe odcinki' },
        cat_cooking_battles: { uk: '🔪 Кулінарні битви', ru: '🔪 Кулинарные битвы', en: '🔪 Cooking battles', pl: '🔪 Kuchenne pojedynki' },
        cat_survival: { uk: '🪓 Виживання', ru: '🪓 Выживание', en: '🪓 Survival', pl: '🪓 Przetrwanie' },
        ua_new_movies: { uk: 'Нові українські фільми', ru: 'Новые украинские фильмы', en: 'New Ukrainian movies', pl: 'Nowe ukraińskie filmy' },
        ua_new_tv: { uk: 'Нові українські серіали', ru: 'Новые украинские serialы', en: 'New Ukrainian series', pl: 'Nowe ukraińskie seriale' },
        ua_shows: { uk: 'Шоу та програми', ru: 'Шоу и программы', en: 'Shows and programs', pl: 'Show i programy' },
        ua_trending_movies: { uk: 'В тренді в Україні', ru: 'В тренде в Украине', en: 'Trending in Ukraine', pl: 'Na topie na Ukrainie' },
        ua_trending_series: { uk: 'Українські серіали в тренді', ru: 'Украинские сериалы в тренде', en: 'Trending Ukrainian series', pl: 'Ukraińskie seriale na topie' },
        ua_best_movies: { uk: 'Найкращі українські фільми', ru: 'Лучшие украинские фильмы', en: 'Best Ukrainian movies', pl: 'Najlepsze ukraińskie filmy' },
        ua_all_movies: { uk: 'Українські фільми (повна підбірка)', ru: 'Украинские фильмы (полная подборка)', en: 'Ukrainian movies (full collection)', pl: 'Ukraińskie filmy (pełna kolekcja)' },
        ua_all_series: { uk: 'Українські серіали (повна підбірка)', ru: 'Украинские сериалы (полная подборка)', en: 'Ukrainian series (full collection)', pl: 'Ukraińskie seriale (pełna kolekcja)' },
        pl_new_movies: { uk: 'Нові польські фільми', ru: 'Новые польские фильмы', en: 'New Polish movies', pl: 'Nowe polskie filmy' },
        pl_new_tv: { uk: 'Нові польські серіали', ru: 'Новые польские сериалы', en: 'New Polish series', pl: 'Nowe polskie seriale' },
        pl_shows: { uk: 'Польські шоу та програми', ru: 'Польские шоу и программы', en: 'Polish shows and programs', pl: 'Polskie show i programy' },
        pl_trending_movies: { uk: 'В тренді в Польщі', ru: 'В тренде в Польше', en: 'Trending in Poland', pl: 'Na topie w Polsce' },
        pl_trending_series: { uk: 'Польські серіали в тренді', ru: 'Польские сериалы в тренде', en: 'Trending Polish series', pl: 'Polskie seriale na topie' },
        pl_best_movies: { uk: 'Найкращі польські фільми', ru: 'Лучшие польские фильмы', en: 'Best Polish movies', pl: 'Najlepsze polskie filmy' },
        pl_all_movies: { uk: 'Польські фільми (повна підбірка)', ru: 'Польские фильмы (полная подборка)', en: 'Polish movies (full collection)', pl: 'Polskie filmy (pełna kolekcja)' },
        pl_all_series: { uk: 'Польські серіали (повна підбірка)', ru: 'Польские сериалы (полная подборка)', en: 'Polish series (full collection)', pl: 'Polskie seriale (pełna kolekcja)' },
        pl_all_shows: { uk: 'Польські шоу та програми (повна підбірка)', ru: 'Польские шоу и программы (полная подборка)', en: 'Polish shows and programs (full collection)', pl: 'Polskie show i programy (pełna kolekcja)' },
        settings_tab_title: { uk: 'Ліхтар', ru: 'Flixio', en: 'Flixio', pl: 'Flixio' },
        settings_header_info: { uk: 'Ліхтар — кастомна головна сторінка з стрімінгами, мітками якості та українською озвучкою. Автор: Flixio Team', ru: 'Flixio — кастомная главная страница со стримингами, метками качества и украинской озвучкой. Автор: Flixio Team', en: 'Flixio — custom home screen with streamings, quality badges and Ukrainian audio. Author: Flixio Team', pl: 'Flixio — niestandardowa strona główna ze streamingami, oznaczeniami jakości i ukraińskim dubbingiem. Autor: Flixio Team' },
        settings_sections_title: { uk: 'Секції головної сторінки', ru: 'Секции главной страницы', en: 'Main screen sections', pl: 'Sekcje ekranu głównego' },
        settings_streamings_name: { uk: 'Стрімінги', ru: 'Стриминги', en: 'Streaming', pl: 'Serwisy streamingowe' },
        settings_streamings_desc: { uk: 'Секція з логотипами стрімінгових сервісів', ru: 'Секция с логотипами стриминговых сервисов', en: 'Row with streaming services logos', pl: 'Sekcja z logo serwisów streamingowych' },
        settings_hero_name: { uk: 'Новинки прокату', ru: 'Новинки проката', en: 'New theatrical releases', pl: 'Nowości kinowe' },
        settings_hero_desc: { uk: 'Ряд з новинками прокату на початку головної', ru: 'Ряд с новинками проката в начале главной', en: 'Row with theatrical new releases at the top', pl: 'Rząd z nowościami kinowymi na początku ekranu' },
        settings_row_ru_name: { uk: 'Новинки російської ленти', ru: 'Новинки Русской ленты', en: 'New in Russian feed', pl: 'Nowości rosyjskiej sekcji' },
        settings_row_ru_desc: { uk: 'Показувати ряд «Новинки Русской ленты»', ru: 'Показывать ряд «Новинки Русской ленты»', en: 'Show the "New in Russian feed" row', pl: 'Pokazuj rząd „Nowości rosyjskiej sekcji”' },
        settings_row_ua_name: { uk: 'Новинки української ленти', ru: 'Новинки Украинской ленты', en: 'New in Ukrainian feed', pl: 'Nowości ukraińskiej sekcji' },
        settings_row_ua_desc: { uk: 'Показувати ряд «Новинки української стрічки»', ru: 'Показывать ряд «Новинки Украинской ленты»', en: 'Show the "New in Ukrainian feed" row', pl: 'Pokazuj rząd „Nowości ukraińskiej sekcji”' },
        settings_row_en_name: { uk: 'Новинки англійської ленти', ru: 'Новинки Английской ленты', en: 'New in English feed', pl: 'Nowości angielskiej sekcji' },
        settings_row_en_desc: { uk: 'Показувати ряд «Новинки Английской ленты»', ru: 'Показывать ряд «Новинки Английской ленты»', en: 'Show the "New in English feed" row', pl: 'Pokazuj rząd „Nowości angielskiej sekcji”' },
        settings_row_pl_name: { uk: 'Новинки польської ленти', ru: 'Новинки Польской ленты', en: 'New in Polish feed', pl: 'Nowości polskiej sekcji' },
        settings_row_pl_desc: { uk: 'Показувати ряд «Новинки польської стрічки»', ru: 'Показывать ряд «Новинки Польской ленты»', en: 'Show the "New in Polish feed" row', pl: 'Pokazuj rząd „Nowości polskiej sekcji”' },
        settings_today_netflix_name: { uk: 'Сьогодні на Netflix', ru: 'Сегодня на Netflix', en: 'Today on Netflix', pl: 'Dziś na Netflix' },
        settings_today_netflix_desc: { uk: 'Ряд новинок Netflix за сьогодні', ru: 'Ряд новинок Netflix за сегодня', en: 'Row with today\'s Netflix releases', pl: 'Rząd dzisiejszych nowości Netflix' },
        settings_today_apple_name: { uk: 'Сьогодні на Apple TV+', ru: 'Сегодня на Apple TV+', en: 'Today on Apple TV+', pl: 'Dziś na Apple TV+' },
        settings_today_apple_desc: { uk: 'Ряд новинок Apple TV+ за сьогодні', ru: 'Ряд новинок Apple TV+ за сегодня', en: 'Row with today\'s Apple TV+ releases', pl: 'Rząd dzisiejszych nowości Apple TV+' },
        settings_today_hbo_name: { uk: 'Сьогодні на HBO / Max', ru: 'Сегодня на HBO / Max', en: 'Today on HBO / Max', pl: 'Dziś na HBO / Max' },
        settings_today_hbo_desc: { uk: 'Ряд новинок HBO / Max за сьогодні', ru: 'Ряд новинок HBO / Max за сегодня', en: 'Row with today\'s HBO / Max releases', pl: 'Rząd dzisiejszych nowości HBO / Max' },
        settings_today_prime_name: { uk: 'Сьогодні на Prime Video', ru: 'Сегодня на Prime Video', en: 'Today on Prime Video', pl: 'Dziś na Prime Video' },
        settings_today_prime_desc: { uk: 'Ряд новинок Prime Video за сьогодні', ru: 'Ряд новинок Prime Video за сегодня', en: 'Row with today\'s Prime Video releases', pl: 'Rząd dzisiejszych nowości Prime Video' },
        settings_today_disney_name: { uk: 'Сьогодні на Disney+', ru: 'Сегодня на Disney+', en: 'Today on Disney+', pl: 'Dziś na Disney+' },
        settings_today_disney_desc: { uk: 'Ряд новинок Disney+ за сьогодні', ru: 'Ряд новинок Disney+ за сегодня', en: 'Row with today\'s Disney+ releases', pl: 'Rząd dzisiejszych nowości Disney+' },
        settings_today_paramount_name: { uk: 'Сьогодні на Paramount+', ru: 'Сегодня на Paramount+', en: 'Today on Paramount+', pl: 'Dziś na Paramount+' },
        settings_today_paramount_desc: { uk: 'Ряд новинок Paramount+ за сьогодні', ru: 'Ряд новинок Paramount+ за сегодня', en: 'Row with today\'s Paramount+ releases', pl: 'Rząd dzisiejszych nowości Paramount+' },
        settings_today_sky_name: { uk: 'Сьогодні на Sky Showtime', ru: 'Сегодня на Sky Showtime', en: 'Today on Sky Showtime', pl: 'Dziś na Sky Showtime' },
        settings_today_sky_desc: { uk: 'Ряд новинок Sky Showtime за сьогодні', ru: 'Ряд новинок Sky Showtime за сегодня', en: 'Row with today\'s Sky Showtime releases', pl: 'Rząd dzisiejszych nowości Sky Showtime' },
        settings_today_hulu_name: { uk: 'Сьогодні на Hulu', ru: 'Сегодня на Hulu', en: 'Today on Hulu', pl: 'Dziś na Hulu' },
        settings_today_hulu_desc: { uk: 'Ряд новинок Hulu за сьогодні', ru: 'Ряд новинок Hulu за сегодня', en: 'Row with today\'s Hulu releases', pl: 'Rząd dzisiejszych nowości Hulu' },
        settings_mood_name: { uk: 'Кіно під настрій', ru: 'Кино по настроению', en: 'Mood movies', pl: 'Kino na nastrój' },
        settings_mood_desc: { uk: 'Підбірки фільмів за жанрами та настроєм', ru: 'Подборки фильмов по жанрам и настроению', en: 'Movie picks by genre and mood', pl: 'Zestawy filmów wg gatunku i nastroju' },
        settings_kinooglad_name: { uk: 'Кіноогляд', ru: 'Кинообзор', en: 'Movie review', pl: 'Przegląd filmowy' },
        settings_kinooglad_desc: { uk: 'Увімкнути розділ Кіноогляд у меню. Налаштування каналів нижче.', ru: 'Включить раздел Кинообзор в меню. Настройки каналов ниже.', en: 'Enable the Movie review section in the menu. Channel settings below.', pl: 'Włącz sekcję Przegląd filmowy w menu. Ustawienia kanałów poniżej.' },
        settings_badges_title: { uk: 'Мітки на картках', ru: 'Метки на карточках', en: 'Badges on cards', pl: 'Etykiety na kartach' },
        settings_badge_ru_name: { uk: 'Російська озвучка (RU)', ru: 'Русская озвучка (RU)', en: 'Russian audio (RU)', pl: 'Rosyjski dubbing (RU)' },
        settings_badge_ru_desc: { uk: 'Показувати мітку наявності російського дубляжу', ru: 'Показывать метку наличия русского дубляжа', en: 'Show badge when Russian dub is available', pl: 'Pokazuj etykietę, gdy jest rosyjski dubbing' },
        settings_badge_ua_name: { uk: 'Українська озвучка (UA)', ru: 'Украинская озвучка (UA)', en: 'Ukrainian audio (UA)', pl: 'Ukraiński dubbing (UA)' },
        settings_badge_ua_desc: { uk: 'Показувати мітку наявності українського дубляжу', ru: 'Показывать метку наличия украинского дубляжа', en: 'Show badge when Ukrainian dub is available', pl: 'Pokazuj etykietę, gdy jest ukraiński dubbing' },
        settings_badge_en_name: { uk: 'Англійська озвучка (EN)', ru: 'Английская озвучка (EN)', en: 'English audio (EN)', pl: 'Angielski dubbing (EN)' },
        settings_badge_en_desc: { uk: 'Показувати мітку наявності англійської доріжки', ru: 'Показывать метку наличия английской дорожки', en: 'Show badge when English track is available', pl: 'Pokazuj etykietę, gdy jest angielska ścieżka' },
        settings_badge_4k_name: { uk: 'Якість 4K', ru: 'Качество 4K', en: '4K quality', pl: 'Jakość 4K' },
        settings_badge_4k_desc: { uk: 'Показувати мітку наявності 4K роздільної здатності', ru: 'Показывать метку наличия 4K разрешения', en: 'Show badge when 4K resolution is available', pl: 'Pokazuj etykietę, gdy dostępne jest 4K' },
        settings_badge_fhd_name: { uk: 'Якість FHD', ru: 'Качество FHD', en: 'FHD quality', pl: 'Jakość FHD' },
        settings_badge_fhd_desc: { uk: 'Показувати мітку наявності Full HD роздільної здатності', ru: 'Показывать метку наличия Full HD разрешения', en: 'Show badge when Full HD is available', pl: 'Pokazuj etykietę, gdy dostępne jest Full HD' },
        settings_badge_hdr_name: { uk: 'HDR / Dolby Vision', ru: 'HDR / Dolby Vision', en: 'HDR / Dolby Vision', pl: 'HDR / Dolby Vision' },
        settings_badge_hdr_desc: { uk: 'Показувати мітку наявності HDR або Dolby Vision', ru: 'Показывать метку наличия HDR или Dolby Vision', en: 'Show badge when HDR or Dolby Vision is available', pl: 'Pokazuj etykietę, gdy dostępne jest HDR lub Dolby Vision' },
        settings_tmdb_input_name: { uk: 'Свій ключ TMDB', ru: 'Свой ключ TMDB', en: 'Custom TMDB key', pl: 'Własny klucz TMDB' },
        settings_tmdb_input_placeholder: { uk: 'Ключ TMDB (опційно)', ru: 'Ключ TMDB (опционально)', en: 'TMDB key (optional)', pl: 'Klucz TMDB (opcjonalnie)' },
        settings_tmdb_input_desc: { uk: 'Якщо вказати — плагін використовуватиме його замість ключа Лампи.', ru: 'Если указать — плагин будет использовать его вместо ключа Лампы.', en: 'If set, the plugin will use it instead of Lampa\'s key.', pl: 'Jeśli ustawisz, plugin użyje go zamiast klucza Lampy.' },
        menu_title: { uk: 'Меню', ru: 'Меню', en: 'Menu', pl: 'Menu' },
        menu_details: { uk: 'Детальніше', ru: 'Подробнее', en: 'Details', pl: 'Szczegóły' },
        menu_trailer: { uk: 'Трейлер', ru: 'Трейлер', en: 'Trailer', pl: 'Zwiastun' },
        loading_trailer: { uk: 'Завантаження трейлера...', ru: 'Загрузка трейлера...', en: 'Loading trailer...', pl: 'Ładowanie zwiastuna...' },
        kino_settings_title: { uk: 'Кіноогляд: Налаштування каналів YouTube', ru: 'Кинообзор: Настройки каналов YouTube', en: 'Movie review: YouTube channels settings', pl: 'Przegląd filmowy: ustawienia kanałów YouTube' },
        kino_add_channel_name: { uk: 'Додати канал', ru: 'Добавить канал', en: 'Add channel', pl: 'Dodaj kanał' },
        kino_add_channel_desc: { uk: 'Посилання YouTube або @нік', ru: 'Ссылка YouTube или @ник', en: 'YouTube link or @handle', pl: 'Link YouTube lub @nazwa' },
        kino_add_channel_input: { uk: 'Посилання на канал або @нік', ru: 'Ссылка на канал или @ник', en: 'Channel link or @handle', pl: 'Link do kanału lub @nazwa' },
        kino_channel_generic: { uk: 'Канал', ru: 'Канал', en: 'Channel', pl: 'Kanał' },
        kino_reset_name: { uk: 'Скинути налаштування каналів', ru: 'Сбросить настройки каналов', en: 'Reset channel settings', pl: 'Zresetuj ustawienia kanałów' },
        kino_reset_desc: { uk: 'Очистити список каналів', ru: 'Очистить список каналов', en: 'Clear channel list', pl: 'Wyczyść listę kanałów' },
        kino_channel_enabled: { uk: 'Увімкнено', ru: 'Включено', en: 'Enabled', pl: 'Włączony' },
        kino_channel_disabled: { uk: 'Вимкнено', ru: 'Выключено', en: 'Disabled', pl: 'Wyłączony' },
        kino_channel_delete_btn: { uk: 'Видалити канал', ru: 'Удалить канал', en: 'Delete channel', pl: 'Usuń kanał' },
        kino_menu_title: { uk: 'Кіноогляд', ru: 'Кинообзор', en: 'Movie review', pl: 'Przegląd filmowy' },
        kino_ch_navkolo_kino: {
            uk: 'Навколо Кіно',
            ru: 'Вокруг кино',
            en: 'Around Cinema',
            pl: 'Wokół kina'
        },
        kino_ch_serialy_kino: {
            uk: 'СЕРІАЛИ та КІНО',
            ru: 'СЕРИАЛЫ и КИНО',
            en: 'Series and Movies',
            pl: 'Seriale i kino'
        },
        kino_ch_ekino_ua: {
            uk: 'eKinoUA',
            ru: 'eKinoUA',
            en: 'eKinoUA',
            pl: 'eKinoUA'
        },
        kino_ch_zagin_kinomaniv: {
            uk: 'Загін Кіноманів',
            ru: 'Отряд киноманов',
            en: 'Cinephiles Squad',
            pl: 'Oddział kinomanów'
        },
        kino_ch_moi_dumky: {
            uk: 'Мої думки про кіно',
            ru: 'Мои мысли о кино',
            en: 'My Thoughts About Cinema',
            pl: 'Moje myśli o kinie'
        },
        kino_ch_kino_navuvorit: {
            uk: 'КІНО НАВИВОРІТ',
            ru: 'КИНО НАИЗНАНКУ',
            en: 'Cinema Inside Out',
            pl: 'Kino na lewą stronę'
        }
    };

    function tr(key) {
        var pack = FLIXIO_I18N[key];
        if (!pack) return key;
        return pack[FLIXIO_LANG] || pack.uk || pack.en || key;
    }

    var SERVICE_CONFIGS = {
        'netflix': {
            title: 'Netflix',
            logo: 'logos/netflix.svg',
            icon: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16.5 2L16.5 22" stroke="#E50914" stroke-width="4"/><path d="M7.5 2L7.5 22" stroke="#E50914" stroke-width="4"/><path d="M7.5 2L16.5 22" stroke="#E50914" stroke-width="4"/></svg>',
            categories: [
                { "title": tr('cat_new_movies'), "url": "discover/movie", "params": { "with_watch_providers": "8", "watch_region": "UA", "sort_by": "primary_release_date.desc", "primary_release_date.lte": "{current_date}", "vote_count.gte": "5" } },
                { "title": tr('cat_new_tv'), "url": "discover/tv", "params": { "with_networks": "213", "sort_by": "first_air_date.desc", "first_air_date.lte": "{current_date}", "vote_count.gte": "5" } },
                { "title": tr('cat_top_tv'), "url": "discover/tv", "params": { "with_networks": "213", "sort_by": "popularity.desc" } },
                { "title": tr('cat_top_movies'), "url": "discover/movie", "params": { "with_watch_providers": "8", "watch_region": "UA", "sort_by": "popularity.desc" } },
                { "title": tr('cat_only_netflix'), "url": "discover/tv", "params": { "with_networks": "213", "sort_by": "vote_average.desc", "vote_count.gte": "500", "vote_average.gte": "7.5" } },
                { "title": tr('cat_twisted_thrillers'), "url": "discover/movie", "params": { "with_watch_providers": "8", "watch_region": "UA", "with_genres": "53,9648", "sort_by": "popularity.desc" } },
                { "title": tr('cat_fantasy_sci'), "url": "discover/tv", "params": { "with_networks": "213", "with_genres": "10765", "sort_by": "popularity.desc" } },
                { "title": tr('cat_kdrama'), "url": "discover/tv", "params": { "with_networks": "213", "with_original_language": "ko", "sort_by": "popularity.desc" } },
                { "title": tr('cat_truecrime_doc'), "url": "discover/tv", "params": { "with_networks": "213", "with_genres": "99", "with_keywords": "9840|10714", "sort_by": "popularity.desc" } },
                { "title": tr('cat_anime'), "url": "discover/tv", "params": { "with_networks": "213", "with_genres": "16", "with_keywords": "210024", "sort_by": "popularity.desc" } }
            ]
        },
        'apple': {
            title: 'Apple TV+',
            logo: 'logos/apple.svg',
            icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>',
            categories: [
                { "title": tr('cat_new_tv'), "url": "discover/tv", "params": { "with_networks": "2552|3235", "sort_by": "first_air_date.desc", "first_air_date.lte": "{current_date}", "vote_count.gte": "2" } },
                { "title": tr('cat_new_movies'), "url": "discover/movie", "params": { "with_watch_providers": "350", "watch_region": "UA", "sort_by": "primary_release_date.desc", "primary_release_date.lte": "{current_date}", "vote_count.gte": "2" } },
                { "title": tr('cat_top_tv'), "url": "discover/tv", "params": { "with_networks": "2552|3235", "sort_by": "popularity.desc" } },
                { "title": tr('cat_top_movies'), "url": "discover/movie", "params": { "with_watch_providers": "350", "watch_region": "UA", "sort_by": "popularity.desc" } },
                { "title": tr('cat_apple_epic_sci'), "url": "discover/tv", "params": { "with_networks": "2552|3235", "with_genres": "10765", "sort_by": "popularity.desc" } },
                { "title": tr('cat_comedy_feelgood'), "url": "discover/tv", "params": { "with_networks": "2552|3235", "with_genres": "35", "sort_by": "popularity.desc" } },
                { "title": tr('cat_quality_detectives'), "url": "discover/tv", "params": { "with_networks": "2552|3235", "with_genres": "9648,80", "sort_by": "popularity.desc" } },
                { "title": tr('cat_apple_original'), "url": "discover/movie", "params": { "with_watch_providers": "350", "watch_region": "UA", "sort_by": "vote_average.desc", "vote_count.gte": "100" } }
            ]
        },
        'hbo': {
            title: 'HBO / Max',
            logo: 'logos/hbo.svg',
            icon: '<svg width="24px" height="24px" viewBox="0 0 24 24" fill="currentColor"><path d="M7.042 16.896H4.414v-3.754H2.708v3.754H.01L0 7.22h2.708v3.6h1.706v-3.6h2.628zm12.043.046C21.795 16.94 24 14.689 24 11.978a4.89 4.89 0 0 0-4.915-4.92c-2.707-.002-4.09 1.991-4.432 2.795.003-1.207-1.187-2.632-2.58-2.634H7.59v9.674l4.181.001c1.686 0 2.886-1.46 2.888-2.713.385.788 1.72 2.762 4.427 2.76zm-7.665-3.936c.387 0 .692.382.692.817 0 .435-.305.817-.692.817h-1.33v-1.634zm.005-3.633c.387 0 .692.382.692.817 0 .436-.305.818-.692.818h-1.33V9.373zm1.77 2.607c.305-.039.813-.387.992-.61-.063.276-.068 1.074.006 1.35-.204-.314-.688-.701-.998-.74zm3.43 0a2.462 2.462 0 1 1 4.924 0 2.462 2.462 0 0 1-4.925 0zm2.462 1.936a1.936 1.936 0 1 0 0-3.872 1.936 1.936 0 0 0 0 3.872z"/></svg>',
            categories: [
                { "title": tr('cat_new_tv'), "url": "discover/tv", "params": { "with_networks": "49|3186", "sort_by": "first_air_date.desc", "first_air_date.lte": "{current_date}", "vote_count.gte": "5" } },
                { "title": tr('cat_new_movies'), "url": "discover/movie", "params": { "with_companies": "174|49", "sort_by": "primary_release_date.desc", "primary_release_date.lte": "{current_date}", "vote_count.gte": "10" } },
                { "title": tr('cat_top_tv'), "url": "discover/tv", "params": { "with_networks": "49|3186", "sort_by": "popularity.desc" } },
                { "title": tr('cat_top_movies_wb'), "url": "discover/movie", "params": { "with_companies": "174", "sort_by": "popularity.desc", "vote_count.gte": "50" } },
                { "title": tr('cat_epic_sagas'), "url": "discover/tv", "params": { "with_networks": "49|3186", "with_genres": "10765", "sort_by": "popularity.desc" } },
                { "title": tr('cat_premium_dramas'), "url": "discover/tv", "params": { "with_networks": "49", "with_genres": "18", "without_genres": "10765", "sort_by": "popularity.desc" } },
                { "title": tr('cat_dc_blockbusters'), "url": "discover/movie", "params": { "with_companies": "174", "with_keywords": "9715", "sort_by": "revenue.desc" } },
                { "title": tr('cat_dark_detectives'), "url": "discover/tv", "params": { "with_networks": "49", "with_genres": "80,9648", "sort_by": "vote_average.desc", "vote_count.gte": "300" } },
                { "title": tr('cat_hbo_classics'), "url": "discover/tv", "params": { "with_networks": "49", "sort_by": "vote_average.desc", "vote_count.gte": "1000" } }
            ]
        },
        'amazon': {
            title: 'Prime Video',
            icon: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 15c2.4 1.7 5.1 2.6 8 2.6 2.9 0 5.6-.9 8-2.6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M15.5 14.4L18 16.8 15.5 19.2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
            categories: [
                { "title": tr('cat_new_tv'), "url": "discover/tv", "params": { "with_networks": "1024", "sort_by": "first_air_date.desc", "first_air_date.lte": "{current_date}", "vote_count.gte": "5" } },
                { "title": tr('cat_new_movies'), "url": "discover/movie", "params": { "with_watch_providers": "119", "watch_region": "US", "sort_by": "primary_release_date.desc", "primary_release_date.lte": "{current_date}", "vote_count.gte": "5" } },
                { "title": tr('cat_top_tv'), "url": "discover/tv", "params": { "with_networks": "1024", "sort_by": "popularity.desc" } },
                { "title": tr('cat_top_movies'), "url": "discover/movie", "params": { "with_watch_providers": "119", "watch_region": "US", "sort_by": "popularity.desc" } },
                { "title": tr('cat_hard_action'), "url": "discover/tv", "params": { "with_networks": "1024", "with_genres": "10759,10765", "sort_by": "popularity.desc" } },
                { "title": tr('cat_amazon_mgm'), "url": "discover/movie", "params": { "with_companies": "1024|21", "sort_by": "popularity.desc" } },
                { "title": tr('cat_comedies'), "url": "discover/tv", "params": { "with_networks": "1024", "with_genres": "35", "sort_by": "popularity.desc" } },
                { "title": tr('cat_thrillers'), "url": "discover/tv", "params": { "with_networks": "1024", "with_genres": "9648,18", "sort_by": "vote_average.desc", "vote_count.gte": "300" } }
            ]
        },
        'disney': {
            title: 'Disney+',
            logo: 'logos/disney.svg',
            icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 10c2.2-2.5 5-3.7 8-3.7 2.2 0 4.1.7 5.8 1.8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M12 13v4M10 15h4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
            categories: [
                { "title": tr('cat_new_tv'), "url": "discover/tv", "params": { "with_networks": "2739", "sort_by": "first_air_date.desc", "first_air_date.lte": "{current_date}", "vote_count.gte": "5" } },
                { "title": tr('cat_new_movies'), "url": "discover/movie", "params": { "with_watch_providers": "337", "watch_region": "US", "sort_by": "primary_release_date.desc", "primary_release_date.lte": "{current_date}", "vote_count.gte": "5" } },
                { "title": tr('cat_top_tv'), "url": "discover/tv", "params": { "with_networks": "2739", "sort_by": "popularity.desc" } },
                { "title": tr('cat_top_movies'), "url": "discover/movie", "params": { "with_companies": "2", "sort_by": "popularity.desc" } },
                { "title": tr('cat_marvel_universe'), "url": "discover/movie", "params": { "with_companies": "420", "sort_by": "release_date.desc", "vote_count.gte": "100" } },
                { "title": tr('cat_starwars'), "url": "discover/tv", "params": { "with_companies": "1", "with_keywords": "1930", "sort_by": "popularity.desc" } },
                { "title": tr('cat_pixar'), "url": "discover/movie", "params": { "with_companies": "3", "sort_by": "popularity.desc" } },
                { "title": tr('cat_fx_star'), "url": "discover/tv", "params": { "with_networks": "88|453", "sort_by": "popularity.desc" } }
            ]
        },
        'paramount': {
            title: 'Paramount+',
            logo: 'logos/paramount.svg',
            icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 22H22L12 2ZM12 6.5L18.5 19.5H5.5L12 6.5Z"/></svg>',
            categories: [
                { "title": tr('cat_new_tv'), "url": "discover/tv", "params": { "with_networks": "4330", "sort_by": "first_air_date.desc", "first_air_date.lte": "{current_date}", "vote_count.gte": "2" } },
                { "title": tr('cat_new_movies'), "url": "discover/movie", "params": { "with_companies": "4", "sort_by": "primary_release_date.desc", "primary_release_date.lte": "{current_date}", "vote_count.gte": "10" } },
                { "title": tr('cat_top_tv'), "url": "discover/tv", "params": { "with_networks": "4330", "sort_by": "popularity.desc" } },
                { "title": tr('cat_top_movies'), "url": "discover/movie", "params": { "with_companies": "4", "sort_by": "popularity.desc" } },
                { "title": tr('cat_sheridan_universe'), "url": "discover/tv", "params": { "with_networks": "318|4330", "with_keywords": "256112", "sort_by": "popularity.desc" } },
                { "title": tr('cat_startrek_collection'), "url": "discover/tv", "params": { "with_networks": "4330", "with_keywords": "159223", "sort_by": "first_air_date.desc" } },
                { "title": tr('cat_crime_investigation'), "url": "discover/tv", "params": { "with_networks": "16", "with_genres": "80,18", "sort_by": "popularity.desc" } },
                { "title": tr('cat_kids_world'), "url": "discover/tv", "params": { "with_networks": "13", "sort_by": "popularity.desc" } }
            ]
        },
        'sky_showtime': {
            title: 'Sky Showtime',
            logo: 'logos/SkyShowtime.svg',
            icon: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M9 9.5c1-.8 2.2-1.2 3.5-1.2 2 0 3.7 1 4.7 2.6" stroke="currentColor" stroke-width="1.2" fill="none" stroke-linecap="round"/></svg>',
            categories: [
                { "title": tr('cat_new_tv'), "url": "discover/tv", "params": { "with_companies": "67|115331", "sort_by": "first_air_date.desc", "first_air_date.lte": "{current_date}", "vote_count.gte": "2" } },
                { "title": tr('cat_new_movies'), "url": "discover/movie", "params": { "with_companies": "4|33|521", "sort_by": "primary_release_date.desc", "primary_release_date.lte": "{current_date}", "vote_count.gte": "5" } },
                { "title": tr('cat_top_tv'), "url": "discover/tv", "params": { "with_companies": "67|115331", "sort_by": "popularity.desc" } },
                { "title": tr('cat_top_movies'), "url": "discover/movie", "params": { "with_companies": "4|33", "sort_by": "popularity.desc" } },
                { "title": tr('cat_paramount_blockbusters'), "url": "discover/movie", "params": { "with_companies": "4", "sort_by": "revenue.desc" } },
                { "title": tr('cat_universal_world'), "url": "discover/movie", "params": { "with_companies": "33", "sort_by": "popularity.desc" } },
                { "title": tr('cat_showtime_adult'), "url": "discover/tv", "params": { "with_companies": "67", "sort_by": "popularity.desc" } },
                { "title": tr('cat_dreamworks_worlds'), "url": "discover/movie", "params": { "with_companies": "521", "sort_by": "popularity.desc" } }
            ]
        },
        'hulu': {
            title: 'Hulu',
            logo: 'logos/Hulu.svg',
            icon: '<svg viewBox="0 0 24 24" fill="#3DBB3D"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z"/></svg>',
            categories: [
                { "title": tr('cat_new_tv'), "url": "discover/tv", "params": { "with_networks": "453", "sort_by": "first_air_date.desc", "first_air_date.lte": "{current_date}", "vote_count.gte": "2" } },
                { "title": tr('cat_new_movies'), "url": "discover/movie", "params": { "with_watch_providers": "15", "watch_region": "US", "sort_by": "primary_release_date.desc", "primary_release_date.lte": "{current_date}", "vote_count.gte": "2" } },
                { "title": tr('cat_top_tv'), "url": "discover/tv", "params": { "with_networks": "453", "sort_by": "popularity.desc" } },
                { "title": tr('cat_top_movies'), "url": "discover/movie", "params": { "with_watch_providers": "15", "watch_region": "US", "sort_by": "popularity.desc" } },
                { "title": tr('cat_truecrime_doc'), "url": "discover/tv", "params": { "with_networks": "453", "with_genres": "18,9648", "sort_by": "popularity.desc" } },
                { "title": tr('cat_comedy_feelgood'), "url": "discover/tv", "params": { "with_networks": "453", "with_genres": "35", "sort_by": "popularity.desc" } },
                { "title": tr('cat_adult_animation'), "url": "discover/tv", "params": { "with_networks": "453", "with_genres": "16", "sort_by": "popularity.desc" } }
            ]
        },
        'syfy': {
            title: 'Syfy',
            logo: 'logos/Syfy.svg',
            icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4.5 20.29L5.21 21L12 18L18.79 21L19.5 20.29L12 2Z"/></svg>',
            categories: [
                { "title": tr('cat_new_releases_syfy'), "url": "discover/tv", "params": { "with_networks": "77", "sort_by": "first_air_date.desc", "first_air_date.lte": "{current_date}", "vote_count.gte": "1" } },
                { "title": tr('cat_top_syfy'), "url": "discover/tv", "params": { "with_networks": "77", "sort_by": "popularity.desc" } },
                { "title": tr('cat_space_travel'), "url": "discover/tv", "params": { "with_networks": "77", "with_genres": "10765", "with_keywords": "3801", "sort_by": "vote_average.desc", "vote_count.gte": "50" } },
                { "title": tr('cat_monsters_paranormal'), "url": "discover/tv", "params": { "with_networks": "77", "with_genres": "9648,10765", "without_keywords": "3801", "sort_by": "popularity.desc" } }
            ]
        },
        'educational_and_reality': {
            title: tr('educational_title'),
            logo: 'logos/Discovery.svg',
            icon: '<svg viewBox="0 0 24 24" fill="#FF9800"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>',
            categories: [
                { "title": tr('cat_new_episodes'), "url": "discover/tv", "params": { "with_networks": "64|91|43|2696|4|65", "sort_by": "first_air_date.desc", "first_air_date.lte": "{current_date}", "vote_count.gte": "2" } },
                { "title": "🌍 Discovery Channel", "url": "discover/tv", "params": { "with_networks": "64", "sort_by": "popularity.desc" } },
                { "title": "🦁 National Geographic", "url": "discover/tv", "params": { "with_networks": "43", "sort_by": "popularity.desc" } },
                { "title": "🐾 Animal Planet", "url": "discover/tv", "params": { "with_networks": "91", "sort_by": "popularity.desc" } },
                { "title": "🌿 BBC Earth", "url": "discover/tv", "params": { "with_networks": "4", "with_genres": "99", "sort_by": "vote_average.desc", "vote_count.gte": "20" } },
                { "title": tr('cat_cooking_battles'), "url": "discover/tv", "params": { "with_genres": "10764", "with_keywords": "222083", "sort_by": "popularity.desc" } },
                { "title": tr('cat_survival'), "url": "discover/tv", "params": { "with_genres": "10764", "with_keywords": "5481|10348", "sort_by": "popularity.desc" } }
            ]
        }
    };


    function getTmdbKey() {
        var custom = (Lampa.Storage.get('flixio_tmdb_apikey') || '').trim();
        return custom || (Lampa.TMDB && Lampa.TMDB.key ? Lampa.TMDB.key() : '');
    }

    /** Для рядка на головній: HBO/Prime/Paramount через watch_providers (TMDB), щоб отримувати і фільми, і серіали з актуальним контентом. */
    var SERVICE_WATCH_PROVIDERS_FOR_ROW = { hbo: '384', amazon: '119', paramount: '531' };

    
    // =================================================================
    // UTILS & COMPONENTS
    // =================================================================

    // Один елемент геро-рядка (backdrop + overlay). heightEm — висота банеру (напр. 28).
    function makeHeroResultItem(movie, heightEm) {
        if (!$('#studios5-hero-css').length) {
            $('body').append('<style id="studios5-hero-css">.hero-banner .card-marks, .hero-banner .card__icons, .hero-banner .card__quality { display: none !important; }</style>');
        }
        if (!$('#studios5-show-more-css').length) {
            $('body').append('<style id="studios5-show-more-css">' +
                '.show-more-button.focus { transform: scale(1.05) !important; box-shadow: 0 0 0 3px #fff !important; z-index: 10 !important; }' +
                '.card.show-more-button:focus { transform: scale(1.05) !important; box-shadow: 0 0 0 3px #fff !important; z-index: 10 !important; }' +
                '.kino-card.show-more-button:hover { transform: scale(1.05) !important; box-shadow: 0 0 0 3px #fff !important; z-index: 10 !important; }' +
                '.kino-card.show-more-button.focus { transform: scale(1.05) !important; box-shadow: 0 0 0 3px #fff !important; z-index: 10 !important; }' +
            '</style>');
        }
        heightEm = heightEm || 22.5;
        var pad = (heightEm / 35 * 2).toFixed(1);
        var titleEm = (heightEm / 35 * 2.5).toFixed(2);
        var descEm = (heightEm / 35 * 1.1).toFixed(2);

        var renderHeroContent = function(item, movie) {
            item.empty(); // Clear existing content
            item.append('<div class="hero-overlay" style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(0,0,0,0.9), transparent); padding: ' + pad + 'em; border-radius: 0 0 1em 1em;">' +
                '<div class="hero-header" style="margin-bottom: 0.3em; min-height: 3em; display: flex; align-items: flex-end;">' +
                    '<div class="hero-title" style="font-size: ' + titleEm + 'em; font-weight: bold; color: #fff; text-shadow: 2px 2px 4px rgba(0,0,0,0.7);">' + (movie.title || movie.name) + '</div>' +
                '</div>' +
                '<div class="hero-meta" style="display: flex; flex-wrap: wrap; align-items: center; gap: 0.5em; font-size: 0.9em; color: #ccc; margin-bottom: 0.5em;"></div>' +
                '<div class="hero-desc" style="font-size: ' + descEm + 'em; color: #ddd; max-width: 60%; line-height: 1.3; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 0.6em;">' + (movie.overview || '') + '</div>' +
                '<div class="hero-trailer-btn selector" style="display: inline-flex; align-items: center; background: rgba(255, 255, 255, 0.2); padding: 0.4em 0.8em; border-radius: 0.3em; cursor: pointer; transition: background 0.2s;">' +
                '<svg style="width: 1.2em; height: 1.2em; margin-right: 0.4em;" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>' +
                '<span style="font-size: 0.9em; font-weight: 600;">Трейлер</span>' +
                '</div>' +
                '</div>');
            
            // Trailer Click
            item.find('.hero-trailer-btn').on('hover:enter click', function (e) {
                e.stopPropagation();
                var network = new Lampa.Reguest();
                var type = movie.name ? 'tv' : 'movie';
                var lang = Lampa.Storage.get('language', 'uk');
                function search(searchLang) {
                    var url = Lampa.TMDB.api(type + '/' + movie.id + '/videos?api_key=' + getTmdbKey() + '&language=' + searchLang);
                    network.silent(url, function (json) {
                        var videos = json.results || [];
                        var trailer = videos.find(function(v) { return v.type === 'Trailer' && v.site === 'YouTube'; }) || videos[0];
                        if (trailer && trailer.key) {
                            playYouTubeCustom(trailer.key);
                        } else if (searchLang !== 'en-US') {
                            search('en-US');
                        } else {
                            Lampa.Noty.show('Трейлер не знайдено');
                        }
                    }, function() {
                            if (searchLang !== 'en-US') search('en-US');
                            else Lampa.Noty.show('Помилка пошуку трейлера');
                    });
                }
                search(lang);
            });

            // Fetch Details
            var type = movie.name ? 'tv' : 'movie';
            var lang = Lampa.Storage.get('language', 'uk');
            var url = Lampa.TMDB.api(type + '/' + movie.id + '?api_key=' + getTmdbKey() + '&language=' + lang + '&append_to_response=images,release_dates,content_ratings');
            
            var network = new Lampa.Reguest();
            network.silent(url, function(details) {
                // Logo
                var logo = null;
                if (details.images && details.images.logos && details.images.logos.length) {
                    logo = details.images.logos.find(function(l) { return l.iso_639_1 === lang; }) || 
                           details.images.logos.find(function(l) { return l.iso_639_1 === 'en'; }) || 
                           details.images.logos[0];
                }
                if (logo) {
                    var logoUrl = Lampa.TMDB.image('t/p/w500' + logo.file_path);
                    item.find('.hero-title').html('<img src="' + logoUrl + '" style="height: 4em; width: auto; max-width: 80%; object-fit: contain; display: block;" />');
                    item.find('.hero-header').css('min-height', 'auto');
                }

                // Metadata
                var metaParts = [];
                
                // Rating & Year
                var headMeta = '';
                var rating = details.vote_average || movie.vote_average;
                if (rating) headMeta += '<span class="card__mark card__mark--rating" style="position: static; margin: 0 0.5em 0 0; padding: 0.2em 0.5em; font-size: 0.9em; background: rgba(255,255,255,0.2); border-radius: 0.3em;">★ ' + parseFloat(rating).toFixed(1) + '</span>';
                
                var date = details.release_date || details.first_air_date || movie.release_date || movie.first_air_date;
                if (date) headMeta += parseInt(date);
                
                if (headMeta) metaParts.push(headMeta);
                
                // Type
                var typeStr = type === 'movie' ? Lampa.Lang.translate('movie') : Lampa.Lang.translate('tv');
                if (!typeStr || typeStr === 'movie' || typeStr === 'tv') {
                    typeStr = type === 'movie' ? (lang === 'ru' ? 'Фильм' : 'Фільм') : (lang === 'ru' ? 'Сериал' : 'Серіал');
                }
                metaParts.push(typeStr);
                
                // Age Rating
                var age = '';
                if (type === 'movie' && details.release_dates && details.release_dates.results) {
                    var rel = details.release_dates.results.find(function(r) { return r.iso_3166_1 === 'US' || r.iso_3166_1 === 'RU'; });
                    if (rel && rel.release_dates && rel.release_dates.length) age = rel.release_dates[0].certification;
                } else if (type === 'tv' && details.content_ratings && details.content_ratings.results) {
                    var rat = details.content_ratings.results.find(function(r) { return r.iso_3166_1 === 'US' || r.iso_3166_1 === 'RU'; });
                    if (rat) age = rat.rating;
                }
                if (age) {
                    var ageColor = '#fff';
                    var ageVal = parseInt(age);
                    var displayAge = age;

                    if (!isNaN(ageVal)) {
                        displayAge = ageVal + '+';
                        if (ageVal >= 18) ageColor = '#d32f2f'; // Red
                        else if (ageVal >= 16) ageColor = '#f57c00'; // Orange
                        else if (ageVal >= 12) ageColor = '#fbc02d'; // Yellow
                        else ageColor = '#388e3c'; // Green
                    } else {
                        // US Ratings Mapping
                        if (['R', 'NC-17', 'TV-MA'].indexOf(age) !== -1) {
                            ageColor = '#d32f2f';
                            displayAge = '18+';
                        } else if (['PG-13', 'TV-14'].indexOf(age) !== -1) {
                            ageColor = '#f57c00';
                            displayAge = '16+';
                        } else if (['PG', 'TV-PG', 'TV-Y7'].indexOf(age) !== -1) {
                            ageColor = '#fbc02d';
                            displayAge = '12+';
                        } else {
                            ageColor = '#388e3c';
                            displayAge = '0+';
                        }
                    }
                    metaParts.push('<span style="border: 1px solid ' + ageColor + '; color: ' + ageColor + '; padding: 0 0.3em; border-radius: 0.2em; font-size: 0.9em; font-weight: bold;">' + displayAge + '</span>');
                }

                // Country
                if (details.production_countries && details.production_countries.length) {
                    metaParts.push(details.production_countries[0].iso_3166_1);
                }
                
                // Duration
                var runtime = details.runtime || (details.episode_run_time ? details.episode_run_time[0] : 0);
                if (runtime) {
                    var h = Math.floor(runtime / 60);
                    var m = runtime % 60;
                    var hStr = h > 0 ? h + (lang === 'ru' ? 'ч.' : 'год.') : '';
                    var mStr = m > 0 ? m + (lang === 'ru' ? 'м.' : 'хв.') : '';
                    if (hStr || mStr) metaParts.push((hStr + ' ' + mStr).trim());
                }

                if (metaParts.length) {
                    item.find('.hero-meta').html('<span>' + metaParts.join('</span><span>') + '</span>');
                }
            });
        };

        return {
            title: 'Hero',
            params: {
                createInstance: function (element) {
                    var card = Lampa.Maker.make('Card', element, function (module) { return module.only('Card', 'Callback'); });
                    return card;
                },
                emit: {
                    onCreate: function () {
                        var img = movie.backdrop_path ? Lampa.TMDB.image('t/p/original' + movie.backdrop_path) : (movie.poster_path ? Lampa.TMDB.image('t/p/original' + movie.poster_path) : '');
                        try {
                            var item = $(this.html);
                            item.addClass('hero-banner');
                            item.css({
                                'background-image': 'url(' + img + ')',
                                'width': '100%',
                                'height': heightEm + 'em',
                                'background-size': 'cover',
                                'background-position': 'center',
                                'border-radius': '1em',
                                'position': 'relative',
                                'box-shadow': '0 0 20px rgba(0,0,0,0.5)',
                                'margin-bottom': '10px'
                            });
                            
                            renderHeroContent(item, movie);

                            item.find('.card__view').remove();
                            item.find('.card__title').remove();
                            item.find('.card__age').remove();
                            item.find('.card-marks').remove();
                            item.find('.card__icons').remove();
                            item[0].heroMovieData = movie;
                        } catch (e) { console.log('Hero onCreate error:', e); }
                    },
                    onVisible: function () {
                        try {
                            var item = $(this.html);
                            if (!item.hasClass('hero-banner')) {
                                var img = movie.backdrop_path ? Lampa.TMDB.image('t/p/original' + movie.backdrop_path) : (movie.poster_path ? Lampa.TMDB.image('t/p/original' + movie.poster_path) : '');
                                item.addClass('hero-banner');
                                item.css({
                                    'background-image': 'url(' + img + ')',
                                    'width': '100%',
                                    'height': heightEm + 'em',
                                    'background-size': 'cover',
                                    'background-position': 'center',
                                    'border-radius': '1em',
                                    'position': 'relative',
                                    'box-shadow': '0 0 20px rgba(0,0,0,0.5)',
                                    'margin-bottom': '10px'
                                });
                                
                                renderHeroContent(item, movie);

                                item.find('.card__view').remove();
                                item.find('.card__title').remove();
                                item.find('.card__age').remove();
                                item.find('.card-marks').remove();
                                item.find('.card__icons').remove();
                                item[0].heroMovieData = movie;
                            }
                            // Stop default image loading
                            if (this.img) this.img.onerror = function () { };
                            if (this.img) this.img.onload = function () { };
                        } catch (e) { console.log('Hero onVisible error:', e); }
                    },
                    onlyEnter: function () {
                        // Функция запуска трейлера (копируем логику из кнопки)
                        var playHeroTrailer = function() {
                             var network = new Lampa.Reguest();
                             var type = movie.name ? 'tv' : 'movie';
                             var lang = Lampa.Storage.get('language', 'uk');
                            
                            function search(searchLang) {
                                var url = Lampa.TMDB.api(type + '/' + movie.id + '/videos?api_key=' + getTmdbKey() + '&language=' + searchLang);
                                network.silent(url, function (json) {
                                    var videos = json.results || [];
                                    var trailer = videos.find(function(v) { return v.type === 'Trailer' && v.site === 'YouTube'; }) || videos[0];
                                    if (trailer && trailer.key) {
                                        playYouTubeCustom(trailer.key);
                                    } else if (searchLang !== 'en-US') {
                                        search('en-US');
                                    } else {
                                        Lampa.Noty.show('Трейлер не знайдено');
                                    }
                                }, function() {
                                     if (searchLang !== 'en-US') search('en-US');
                                     else Lampa.Noty.show('Помилка пошуку трейлера');
                                });
                            }
                            search(lang);
                        };

                        // Меню выбора действия
                        Lampa.Select.show({
                            title: tr('menu_title'),
                            items: [
                                { title: tr('menu_details'), action: 'open' },
                                { title: tr('menu_trailer'), action: 'trailer' }
                            ],
                            onSelect: function(a) {
                                if(a.action === 'trailer') {
                                    playHeroTrailer();
                                } else {
                                    Lampa.Activity.push({
                                        url: '',
                                        component: 'full',
                                        id: movie.id,
                                        method: movie.name ? 'tv' : 'movie',
                                        card: movie,
                                        source: 'tmdb'
                                    });
                                }
                            }
                        });
                    },
                    onKey: function(key) {
                        if (key === 'play') {
                           // Копия логики запуска трейлера (можно вынести в отдельную функцию выше, но здесь дублируем для надежности области видимости)
                           var playHeroTrailerKey = function() {
                                  var network = new Lampa.Reguest();
                                  var type = movie.name ? 'tv' : 'movie';
                                  var lang = Lampa.Storage.get('language', 'uk');
                                  
                                function search(searchLang) {
                                    var url = Lampa.TMDB.api(type + '/' + movie.id + '/videos?api_key=' + getTmdbKey() + '&language=' + searchLang);
                                    network.silent(url, function (json) {
                                        var videos = json.results || [];
                                        var trailer = videos.find(function(v) { return v.type === 'Trailer' && v.site === 'YouTube'; }) || videos[0];
                                        if (trailer && trailer.key) { playYouTubeCustom(trailer.key); } 
                                        else if (searchLang !== 'en-US') { search('en-US'); } 
                                        else { Lampa.Noty.show('Трейлер не знайдено'); }
                                    });
                                }
                                search(lang);
                           };
                           playHeroTrailerKey();
                        }
                    }
                }
            }
        };
    }

    function StudiosMain(object) {
        var comp = new Lampa.InteractionMain(object);
        var config = SERVICE_CONFIGS[object.service_id];
        if (!config) { comp.empty && comp.empty(); return comp; }

        comp.create = function () {
            var _this = this;
            this.activity.loader(true);
            var categories = config.categories;
            var network = new Lampa.Reguest();
            var total = categories.length; // No hero section
            var status = new Lampa.Status(total);

            status.onComplite = function () {
                var fulldata = [];
                // Hero section removed - only show categories
                if (status.data) {
                    Object.keys(status.data).sort(function (a, b) { return parseInt(a, 10) - parseInt(b, 10); }).forEach(function (key) {
                        var num = parseInt(key, 10);
                        var data = status.data[key];
                        var cat = categories[num];
                        if (cat && data && data.results && data.results.length) {
                            Lampa.Utils.extendItemsParams(data.results, { style: { name: 'wide' } });
                            fulldata.push({
                                title: cat.title,
                                results: data.results,
                                url: cat.url,
                                params: cat.params,
                                service_id: object.service_id
                            });
                        }
                    });
                }

                if (fulldata.length) {
                    _this.build(fulldata);
                    _this.activity.loader(false);
                } else {
                    _this.empty();
                }
            };

            var refCat = categories.find(function (c) { return c.params && (c.params.with_watch_providers || c.params.with_networks || c.params.with_companies); });
            var filterSuffix = '';
            if (refCat && refCat.params) {
                if (refCat.params.with_watch_providers) {
                    filterSuffix = '&with_watch_providers=' + refCat.params.with_watch_providers + '&watch_region=' + (refCat.params.watch_region || 'UA');
                } else if (refCat.params.with_networks) {
                    filterSuffix = '&with_networks=' + refCat.params.with_networks;
                } else if (refCat.params.with_companies) {
                    filterSuffix = '&with_companies=' + refCat.params.with_companies;
                }
            }

            // Hero section removed - just load categories
            categories.forEach(function (cat, index) {
                var params = [];
                params.push('api_key=' + getTmdbKey());
                params.push('language=' + Lampa.Storage.get('language', 'uk'));
                if (cat.params) {
                    for (var key in cat.params) {
                        var val = cat.params[key];
                        if (val === '{current_date}') {
                            var d = new Date();
                            val = [d.getFullYear(), ('0' + (d.getMonth() + 1)).slice(-2), ('0' + d.getDate()).slice(-2)].join('-');
                        }
                        params.push(key + '=' + val);
                    }
                }
                var url = Lampa.TMDB.api(cat.url + '?' + params.join('&'));

                console.log('[StudiosMain] Category', index + 1, ':', cat.title, 'URL:', url);

                network.silent(url, function (json) {
                    console.log('[StudiosMain] Category', index + 1, 'data received:', json);
                    // FIX: Normalize image paths
                    if (json && json.results && Array.isArray(json.results)) {
                        json.results.forEach(function (item) {
                            if (!item.poster_path && item.backdrop_path) {
                                item.poster_path = item.backdrop_path;
                            }
                        });
                    }
                    status.append(index.toString(), json);
                }, function () { status.error(); });
            });

            return this.render();
        };

        comp.onMore = function (data) {
            Lampa.Activity.push({
                url: data.url,
                params: data.params,
                title: data.title,
                component: 'studios_view',
                page: 1
            });
        };

        return comp;
    }

    // Категорії для секції «Українська стрічка» — фільми/серіали/шоу українського виробництва (TMDB)
    // Жанри TV: Reality 10764, Talk 10767
    var UKRAINIAN_FEED_CATEGORIES = [
        { title: tr('ua_new_movies'), url: 'discover/movie', params: { with_origin_country: 'UA', sort_by: 'primary_release_date.desc', 'vote_count.gte': '5' } },
        { title: tr('ua_new_tv'), url: 'discover/tv', params: { with_origin_country: 'UA', sort_by: 'first_air_date.desc', 'vote_count.gte': '5' } },
        { title: tr('ua_shows'), url: 'discover/tv', params: { with_origin_country: 'UA', with_genres: '10764,10767', sort_by: 'popularity.desc' } },
        { title: tr('ua_trending_movies'), url: 'discover/movie', params: { with_origin_country: 'UA', sort_by: 'popularity.desc' } },
        { title: tr('ua_trending_series'), url: 'discover/tv', params: { with_origin_country: 'UA', sort_by: 'popularity.desc' } },
        { title: tr('ua_best_movies'), url: 'discover/movie', params: { with_origin_country: 'UA', sort_by: 'vote_average.desc', 'vote_count.gte': '50' } },
        { type: 'from_global', globalKey: 'FLIXIO_UA_MOVIES', title: tr('ua_all_movies') },
        { type: 'from_global', globalKey: 'FLIXIO_UA_SERIES', title: tr('ua_all_series') }
    ];

    function UkrainianFeedMain(object) {
        var comp = new Lampa.InteractionMain(object);
        var network = new Lampa.Reguest();
        var categories = UKRAINIAN_FEED_CATEGORIES;

        comp.create = function () {
            var _this = this;
            this.activity.loader(true);
            var requestIndices = [];
            categories.forEach(function (c, i) { if (c.type !== 'from_global') requestIndices.push(i); });
            var status = new Lampa.Status(requestIndices.length);

            status.onComplite = function () {
                var fulldata = [];
                if (status.data) {
                    Object.keys(status.data).sort(function (a, b) { return parseInt(a, 10) - parseInt(b, 10); }).forEach(function (key) {
                        var data = status.data[key];
                        var cat = categories[requestIndices[parseInt(key, 10)]];
                        if (cat && data && data.results && data.results.length) {
                            Lampa.Utils.extendItemsParams(data.results, { style: { name: 'wide' } });
                            fulldata.push({
                                title: cat.title,
                                results: data.results,
                                url: cat.url,
                                params: cat.params
                            });
                        }
                    });
                }
                categories.forEach(function (cat) {
                    if (cat.type === 'from_global' && cat.globalKey && window[cat.globalKey] && window[cat.globalKey].results && window[cat.globalKey].results.length) {
                        var raw = window[cat.globalKey].results;
                        var results = Array.isArray(raw) ? raw.slice(0, 100) : (raw.results || []).slice(0, 100);
                        if (results.length === 0) return;
                        Lampa.Utils.extendItemsParams(results, { style: { name: 'wide' } });
                        var mediaType = (results[0] && results[0].media_type) ? results[0].media_type : 'movie';
                        fulldata.push({
                            title: cat.title,
                            results: results,
                            url: mediaType === 'tv' ? 'discover/tv' : 'discover/movie',
                            params: { with_origin_country: 'UA' }
                        });
                    }
                });
                if (fulldata.length) {
                    _this.build(fulldata);
                    _this.activity.loader(false);
                } else {
                    _this.empty();
                }
            };

            requestIndices.forEach(function (catIndex, rIdx) {
                var cat = categories[catIndex];
                var params = ['api_key=' + getTmdbKey(), 'language=' + Lampa.Storage.get('language', 'uk')];
                if (cat.params) {
                    for (var key in cat.params) {
                        var val = cat.params[key];
                        if (val === '{current_date}') {
                            var d = new Date();
                            val = [d.getFullYear(), ('0' + (d.getMonth() + 1)).slice(-2), ('0' + d.getDate()).slice(-2)].join('-');
                        }
                        params.push(key + '=' + val);
                    }
                }
                var url = Lampa.TMDB.api(cat.url + '?' + params.join('&'));
                network.silent(url, function (json) {
                    // FIX: Normalize image paths for all items
                    if (json && json.results && Array.isArray(json.results)) {
                        json.results.forEach(function (item) {
                            if (!item.poster_path && item.backdrop_path) {
                                item.poster_path = item.backdrop_path;
                            }
                        });
                    }
                    status.append(rIdx.toString(), json);
                }, function () { status.error(); });
            });

            return this.render();
        };

        comp.onMore = function (data) {
            Lampa.Activity.push({
                url: data.url,
                params: data.params,
                title: data.title,
                component: 'studios_view',
                page: 1
            });
        };

        return comp;
    }

    // Категорії для секції «Польська стрічка» — фільми/серіали/шоу польського виробництва (TMDB)
    var POLISH_FEED_CATEGORIES = [
        { title: tr('pl_new_movies'), url: 'discover/movie', params: { with_origin_country: 'PL', sort_by: 'primary_release_date.desc', 'vote_count.gte': '5' } },
        { title: tr('pl_new_tv'), url: 'discover/tv', params: { with_origin_country: 'PL', sort_by: 'first_air_date.desc', 'vote_count.gte': '5' } },
        { title: tr('pl_shows'), url: 'discover/tv', params: { with_origin_country: 'PL', with_genres: '10764,10767', sort_by: 'popularity.desc' } },
        { title: tr('pl_trending_movies'), url: 'discover/movie', params: { with_origin_country: 'PL', sort_by: 'popularity.desc' } },
        { title: tr('pl_trending_series'), url: 'discover/tv', params: { with_origin_country: 'PL', sort_by: 'popularity.desc' } },
        { title: tr('pl_best_movies'), url: 'discover/movie', params: { with_origin_country: 'PL', sort_by: 'vote_average.desc', 'vote_count.gte': '50' } },
        { type: 'from_global', globalKey: 'FLIXIO_PL_MOVIES', title: tr('pl_all_movies') },
        { type: 'from_global', globalKey: 'FLIXIO_PL_SERIES', title: tr('pl_all_series') },
        { type: 'from_global', globalKey: 'FLIXIO_PL_SHOWS', title: tr('pl_all_shows') }
    ];

    function PolishFeedMain(object) {
        var comp = new Lampa.InteractionMain(object);
        var network = new Lampa.Reguest();
        var categories = POLISH_FEED_CATEGORIES;

        comp.create = function () {
            var _this = this;
            this.activity.loader(true);
            var requestIndices = [];
            categories.forEach(function (c, i) { if (c.type !== 'from_global') requestIndices.push(i); });
            var status = new Lampa.Status(requestIndices.length);

            status.onComplite = function () {
                var fulldata = [];
                if (status.data) {
                    Object.keys(status.data).sort(function (a, b) { return parseInt(a, 10) - parseInt(b, 10); }).forEach(function (key) {
                        var data = status.data[key];
                        var cat = categories[requestIndices[parseInt(key, 10)]];
                        if (cat && data && data.results && data.results.length) {
                            Lampa.Utils.extendItemsParams(data.results, { style: { name: 'wide' } });
                            fulldata.push({
                                title: cat.title,
                                results: data.results,
                                url: cat.url,
                                params: cat.params
                            });
                        }
                    });
                }
                categories.forEach(function (cat) {
                    if (cat.type === 'from_global' && cat.globalKey && window[cat.globalKey] && window[cat.globalKey].results && window[cat.globalKey].results.length) {
                        var raw = window[cat.globalKey].results;
                        var results = Array.isArray(raw) ? raw.slice(0, 100) : (raw.results || []).slice(0, 100);
                        if (results.length === 0) return;
                        Lampa.Utils.extendItemsParams(results, { style: { name: 'wide' } });
                        var mediaType = (results[0] && results[0].media_type) ? results[0].media_type : 'movie';
                        fulldata.push({
                            title: cat.title,
                            results: results,
                            url: mediaType === 'tv' ? 'discover/tv' : 'discover/movie',
                            params: { with_origin_country: 'PL' }
                        });
                    }
                });
                if (fulldata.length) {
                    _this.build(fulldata);
                    _this.activity.loader(false);
                } else {
                    _this.empty();
                }
            };

            requestIndices.forEach(function (catIndex, rIdx) {
                var cat = categories[catIndex];
                var params = ['api_key=' + getTmdbKey(), 'language=' + Lampa.Storage.get('language', 'uk')];
                if (cat.params) {
                    for (var key in cat.params) {
                        var val = cat.params[key];
                        if (val === '{current_date}') {
                            var d = new Date();
                            val = [d.getFullYear(), ('0' + (d.getMonth() + 1)).slice(-2), ('0' + d.getDate()).slice(-2)].join('-');
                        }
                        params.push(key + '=' + val);
                    }
                }
                var url = Lampa.TMDB.api(cat.url + '?' + params.join('&'));
                network.silent(url, function (json) {
                    // FIX: Normalize image paths
                    if (json && json.results && Array.isArray(json.results)) {
                        json.results.forEach(function (item) {
                            if (!item.poster_path && item.backdrop_path) {
                                item.poster_path = item.backdrop_path;
                            }
                        });
                    }
                    status.append(rIdx.toString(), json);
                }, function () { status.error(); });
            });

            return this.render();
        };

        comp.onMore = function (data) {
            Lampa.Activity.push({
                url: data.url,
                params: data.params,
                title: data.title,
                component: 'studios_view',
                page: 1
            });
        };

        return comp;
    }

    // Категорії для секції «Російська стрічка» — фільми/серіали/шоу російською мовою (TMDB)
    var RUSSIAN_FEED_CATEGORIES = [
        { title: tr('ru_new_movies'), url: 'discover/movie', params: { with_original_language: 'ru', sort_by: 'primary_release_date.desc', 'vote_count.gte': '5' } },
        { title: tr('ru_new_tv'), url: 'discover/tv', params: { with_original_language: 'ru', sort_by: 'first_air_date.desc', 'vote_count.gte': '5' } },
        { title: tr('ru_shows'), url: 'discover/tv', params: { with_original_language: 'ru', with_genres: '10764,10767', sort_by: 'popularity.desc' } },
        { title: tr('ru_trending_movies'), url: 'discover/movie', params: { with_original_language: 'ru', sort_by: 'popularity.desc' } },
        { title: tr('ru_trending_series'), url: 'discover/tv', params: { with_original_language: 'ru', sort_by: 'popularity.desc' } },
        { title: tr('ru_best_movies'), url: 'discover/movie', params: { with_original_language: 'ru', sort_by: 'vote_average.desc', 'vote_count.gte': '50' } },
        { type: 'from_global', globalKey: 'FLIXIO_RU_MOVIES', title: tr('ru_all_movies') },
        { type: 'from_global', globalKey: 'FLIXIO_RU_SERIES', title: tr('ru_all_series') },
        { type: 'from_global', globalKey: 'FLIXIO_RU_SHOWS', title: tr('ru_all_shows') }
    ];

    function RussianFeedMain(object) {
        var comp = new Lampa.InteractionMain(object);
        var network = new Lampa.Reguest();
        var categories = RUSSIAN_FEED_CATEGORIES;

        comp.create = function () {
            var _this = this;
            this.activity.loader(true);
            var requestIndices = [];
            categories.forEach(function (c, i) { if (c.type !== 'from_global') requestIndices.push(i); });
            var status = new Lampa.Status(requestIndices.length);

            status.onComplite = function () {
                var fulldata = [];
                if (status.data) {
                    Object.keys(status.data).sort(function (a, b) { return parseInt(a, 10) - parseInt(b, 10); }).forEach(function (key) {
                        var data = status.data[key];
                        var cat = categories[requestIndices[parseInt(key, 10)]];
                        if (cat && data && data.results && data.results.length) {
                            Lampa.Utils.extendItemsParams(data.results, { style: { name: 'wide' } });
                            fulldata.push({
                                title: cat.title,
                                results: data.results,
                                url: cat.url,
                                params: cat.params
                            });
                        }
                    });
                }
                categories.forEach(function (cat) {
                    if (cat.type === 'from_global' && cat.globalKey && window[cat.globalKey] && window[cat.globalKey].results && window[cat.globalKey].results.length) {
                        var raw = window[cat.globalKey].results;
                        var results = Array.isArray(raw) ? raw.slice(0, 100) : (raw.results || []).slice(0, 100);
                        if (results.length === 0) return;
                        Lampa.Utils.extendItemsParams(results, { style: { name: 'wide' } });
                        var mediaType = (results[0] && results[0].media_type) ? results[0].media_type : 'movie';
                        fulldata.push({
                            title: cat.title,
                            results: results,
                            url: mediaType === 'tv' ? 'discover/tv' : 'discover/movie',
                            params: { with_original_language: 'ru' }
                        });
                    }
                });
                if (fulldata.length) {
                    _this.build(fulldata);
                    _this.activity.loader(false);
                } else {
                    _this.empty();
                }
            };

            requestIndices.forEach(function (catIndex, rIdx) {
                var cat = categories[catIndex];
                var params = ['api_key=' + getTmdbKey(), 'language=' + Lampa.Storage.get('language', 'uk')];
                if (cat.params) {
                    for (var key in cat.params) {
                        var val = cat.params[key];
                        if (val === '{current_date}') {
                            var d = new Date();
                            val = [d.getFullYear(), ('0' + (d.getMonth() + 1)).slice(-2), ('0' + d.getDate()).slice(-2)].join('-');
                        }
                        params.push(key + '=' + val);
                    }
                }
                var url = Lampa.TMDB.api(cat.url + '?' + params.join('&'));
                network.silent(url, function (json) {
                    // FIX: Normalize image paths
                    if (json && json.results && Array.isArray(json.results)) {
                        json.results.forEach(function (item) {
                            if (!item.poster_path && item.backdrop_path) {
                                item.poster_path = item.backdrop_path;
                            }
                        });
                    }
                    status.append(rIdx.toString(), json);
                }, function () { status.error(); });
            });

            return this.render();
        };

        comp.onMore = function (data) {
            Lampa.Activity.push({
                url: data.url,
                params: data.params,
                title: data.title,
                component: 'studios_view',
                page: 1
            });
        };

        return comp;
    }

    function StudiosView(object) {
        var comp = new Lampa.InteractionCategory(object);
        var network = new Lampa.Reguest();

        function buildUrl(page) {
            var params = [];
            params.push('api_key=' + getTmdbKey());
            params.push('language=' + Lampa.Storage.get('language', 'uk'));
            params.push('page=' + page);

            if (object.params) {
                for (var key in object.params) {
                    var val = object.params[key];
                    if (val === '{current_date}') {
                        var d = new Date();
                        val = [d.getFullYear(), ('0' + (d.getMonth() + 1)).slice(-2), ('0' + d.getDate()).slice(-2)].join('-');
                    }
                    params.push(key + '=' + val);
                }
            }
            return Lampa.TMDB.api(object.url + '?' + params.join('&'));
        }

        comp.create = function () {
            var _this = this;
            network.silent(buildUrl(1), function (json) {
                // FIX: Ensure all items have poster_path for display
                // If backdrop_path exists but poster_path doesn't, use backdrop_path
                if (json && json.results && Array.isArray(json.results)) {
                    json.results.forEach(function (item) {
                        if (!item.poster_path && item.backdrop_path) {
                            item.poster_path = item.backdrop_path;
                        }
                    });
                }
                _this.build(json);
            }, this.empty.bind(this));
        };

        comp.nextPageReuest = function (object, resolve, reject) {
            network.silent(buildUrl(object.page), resolve, reject);
        };

        return comp;
    }

    // =================================================================
    // ПІДПИСКИ НА СТУДІЇ (Ліхтар — інтегровано з studio_subscription)
    // =================================================================
    var FlixioStudioSubscription = (function () {
        var storageKey = 'flixio_subscription_studios';

        function getParams() {
            var raw = Lampa.Storage.get(storageKey, '[]');
            return typeof raw === 'string' ? (function () { try { return JSON.parse(raw); } catch (e) { return []; } })() : (Array.isArray(raw) ? raw : []);
        }

        function setParams(params) {
            Lampa.Storage.set(storageKey, params);
        }

        function add(company) {
            var c = { id: company.id, name: company.name || '', logo_path: company.logo_path || '' };
            var studios = getParams();
            if (!studios.find(function (s) { return String(s.id) === String(c.id); })) {
                studios.push(c);
                setParams(studios);
                Lampa.Noty.show(Lampa.Lang.translate('title_bookmarked') || 'Додано в підписки');
            }
        }

        function remove(company) {
            var studios = getParams();
            var idx = studios.findIndex(function (c) { return c.id === company.id; });
            if (idx !== -1) {
                studios.splice(idx, 1);
                setParams(studios);
                Lampa.Noty.show(Lampa.Lang.translate('title_unbookmarked'));
            }
        }

        function isSubscribed(company) {
            return !!getParams().find(function (c) { return c.id === company.id; });
        }

        function injectButton(object) {
            var attempts = 0;
            var interval = setInterval(function () {
                var nameEl = $('.company-start__name');
                var company = object.company;
                if (!nameEl.length || !company || !company.id) {
                    attempts++;
                    if (attempts > 25) clearInterval(interval);
                    return;
                }
                clearInterval(interval);
                if (nameEl.find('.studio-subscription-btn').length) return;

                var btn = $('<div class="studio-subscription-btn selector"></div>');

                function updateState() {
                    var sub = isSubscribed(company);
                    btn.text(sub ? 'Відписатися' : 'Підписатися');
                    btn.removeClass('studio-subscription-btn--sub studio-subscription-btn--unsub').addClass(sub ? 'studio-subscription-btn--unsub' : 'studio-subscription-btn--sub');
                }

                function doToggle() {
                    if (isSubscribed(company)) remove(company);
                    else add({ id: company.id, name: company.name || '', logo_path: company.logo_path || '' });
                    updateState();
                }

                btn.on('click', function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    doToggle();
                });
                btn.on('hover:enter', doToggle);

                updateState();
                nameEl.append(btn);

                // Auto-focus the subscription button so it's visible immediately
                setTimeout(function () {
                    try {
                        if (Lampa.Controller && Lampa.Controller.collectionFocus) {
                            Lampa.Controller.collectionFocus(btn[0]);
                        }
                    } catch (e) { }
                }, 300);
            }, 200);
        }

        function registerComponent() {
            // Удален компонент "Мои подписки"
        }

        return {
            init: function () {
                var existing = Lampa.Storage.get(storageKey, '[]');
                var fromOld = Lampa.Storage.get('subscription_studios', '[]');
                if ((!existing || existing === '[]' || (Array.isArray(existing) && !existing.length)) && fromOld && fromOld !== '[]') {
                    try {
                        var arr = typeof fromOld === 'string' ? JSON.parse(fromOld) : fromOld;
                        if (Array.isArray(arr) && arr.length) setParams(arr);
                    } catch (e) { }
                }
                registerComponent();
            }
        };
    })();

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

                /* Mood Buttons */
                .card--mood {
                    width: 12em !important;
                    height: 4em !important;
                    border-radius: 1em;
                    margin-bottom: 0 !important;
                    background: linear-gradient(145deg, #2a2a2a, #1f1f1f);
                    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                    transition: transform 0.2s, box-shadow 0.2s;
                    overflow: visible; 
                    border: 1px solid rgba(255,255,255,0.05);
                }
                .card--mood.focus {
                    transform: scale(1.05);
                    box-shadow: 0 0 0 3px #fff;
                    background: #333;
                    z-index: 10;
                }
                .card--mood .card__view {
                    width: 100%;
                    height: 100%;
                    padding-bottom: 0 !important;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden; 
                    border-radius: 1em;
                }
                .mood-content {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: absolute;
                    top: 0;
                    left: 0;
                }
                .mood-text {
                    color: #fff;
                    font-size: 1.1em;
                    font-weight: 500;
                    text-align: center;
                    width: 100%;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    padding: 0 0.5em;
                }

                /* Studio Buttons */
                .card--studio {
                    width: 12em !important;
                    height: 6.75em !important; /* ~16:9 */
                    padding: 0 !important;
                    background: #f5f7fa;
                    border-radius: 0.8em;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    box-shadow: 0 3px 10px rgba(0,0,0,0.35);
                    border: 1px solid rgba(255,255,255,0.06);
                    transition: transform 0.18s ease-out, box-shadow 0.18s ease-out;
                }
                .card--studio.focus {
                    transform: scale(1.06);
                    box-shadow: 0 0 18px rgba(255,255,255,0.9);
                    z-index: 10;
                }
                .card--studio .card__view {
                    width: 100%;
                    height: 100%;
                    padding: 0.6em !important;
                    box-sizing: border-box !important;
                    background-origin: content-box;
                    display: block;
                    position: relative;
                }
                .studio-logo-wrap {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .studio-logo-img {
                    max-width: 70%;
                    max-height: 60%;
                    object-fit: contain;
                    display: block;
                }
                .studio-logo-fallback {
                    display: none;
                    font-weight: 700;
                    font-size: 1.05em;
                    text-align: center;
                    color: #000;
                    padding: 0.4em;
                }
                .flixio-service-logo {
                    display: inline-block;
                    vertical-align: middle;
                    margin-right: 0.4em;
                    margin-bottom: 0.1em;
                }
                .flixio-service-logo img {
                    height: 1.4em;
                    width: auto;
                    display: block;
                }
                /* Consolidated Styles for StudioJS Widths */
                .studios_main .card--wide, .studios_view .card--wide { width: 18.3em !important; }
                .studios_view .category-full { padding-top: 1em; }
                /* Кнопка підписки на студію — у стилі міток (UA, 4K, HDR), ~50% розміру */
                .studio-subscription-btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    vertical-align: middle;
                    margin-left: 0.4em;
                    padding: 0.18em 0.22em;
                    font-size: 0.4em;
                    font-weight: 800;
                    line-height: 1;
                    letter-spacing: 0.02em;
                    border-radius: 0.25em;
                    border: 1px solid rgba(255,255,255,0.2);
                    cursor: pointer;
                    transition: box-shadow 0.15s, transform 0.15s;
                }
                .company-start__name {
                    display: inline-flex;
                    align-items: center;
                    flex-wrap: wrap;
                }
                .studio-subscription-btn.studio-subscription-btn--sub {
                    background: linear-gradient(135deg, #1565c0, #42a5f5);
                    color: #fff;
                    border-color: rgba(66,165,245,0.4);
                }
                .studio-subscription-btn.studio-subscription-btn--unsub {
                    background: linear-gradient(135deg, #37474f, #78909c);
                    color: #fff;
                    border-color: rgba(120,144,156,0.4);
                }
                .studio-subscription-btn.focus {
                    box-shadow: 0 0 0 2px #fff;
                    transform: scale(1.05);
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


    function addServiceRows() {
        var services = ['netflix', 'apple', 'hbo', 'amazon', 'disney', 'paramount', 'sky_showtime', 'hulu', 'syfy', 'educational_and_reality'];
        var serviceSettings = {
            netflix: 'flixio_row_today_netflix',
            apple: 'flixio_row_today_apple',
            hbo: 'flixio_row_today_hbo',
            amazon: 'flixio_row_today_prime',
            disney: 'flixio_row_today_disney',
            paramount: 'flixio_row_today_paramount',
            sky_showtime: 'flixio_row_today_sky',
            hulu: 'flixio_row_today_hulu'
        };

        services.forEach(function (id, index) {
            var config = SERVICE_CONFIGS[id];
            if (!config) return;

            var settingKey = serviceSettings[id];
            if (settingKey && !Lampa.Storage.get(settingKey, true)) return;

            Lampa.ContentRows.add({
                index: 7 + index,
                name: 'service_row_' + id,
                title: tr('today_on_prefix') + config.title,
                screen: ['main'],
                call: function (params) {
                    return function (callback) {
                        var network = new Lampa.Reguest();
                        var results = [];

                        var ROW_FILTER = {
                            'netflix': { with_networks: '213' },
                            'apple': { with_networks: '2552|3235' },
                            'hbo': { with_networks: '49|3186', with_companies: '174|49' },
                            'amazon': { with_networks: '1024', with_companies: '1785|21' },
                            'disney': { with_networks: '2739|19|88', with_companies: '2' },
                            'hulu': { with_networks: '453' },
                            'paramount': { with_networks: '4330|318', with_companies: '4' },
                            'sky_showtime': { with_companies: '4|33|67|521' },
                            'syfy': { with_networks: '77' },
                            'educational_and_reality': { with_networks: '64|43|91|4', with_genres: '99,10764' }
                        };

                        var filterParams = ROW_FILTER[id] || {};
                        if (Object.keys(filterParams).length === 0) return callback({ results: [] });

                        var minVotes = (id === 'syfy' || id === 'educational_and_reality') ? 1 : 3;
                        var apiKey = 'api_key=' + getTmdbKey() + '&language=' + Lampa.Storage.get('language', 'uk');
                        var voteQ = '&vote_count.gte=' + minVotes;

                        // Вікно свіжості: від сьогодні і на 8 місяців назад
                        var d = new Date();
                        var currentDate = [d.getFullYear(), ('0' + (d.getMonth() + 1)).slice(-2), ('0' + d.getDate()).slice(-2)].join('-');
                        var past = new Date();
                        past.setMonth(past.getMonth() - 8);
                        var pastDate = [past.getFullYear(), ('0' + (past.getMonth() + 1)).slice(-2), ('0' + past.getDate()).slice(-2)].join('-');

                        var dateQMovie = '&primary_release_date.gte=' + pastDate + '&primary_release_date.lte=' + currentDate;
                        var dateQTV = '&first_air_date.gte=' + pastDate + '&first_air_date.lte=' + currentDate;

                        var networkQ = filterParams.with_networks ? '&with_networks=' + encodeURIComponent(filterParams.with_networks) : '';
                        var companyQ = filterParams.with_companies ? '&with_companies=' + encodeURIComponent(filterParams.with_companies) : '';
                        var genreQ = filterParams.with_genres ? '&with_genres=' + encodeURIComponent(filterParams.with_genres) : '';

                        var requests = [];

                        // Фільми: шукаємо свіжі, але сортуємо ЗА ПОПУЛЯРНІСТЮ!
                        if (companyQ || genreQ) {
                            var urlM = Lampa.TMDB.api('discover/movie?' + apiKey + '&sort_by=popularity.desc' + dateQMovie + voteQ + companyQ + genreQ);
                            requests.push(function (cb) {
                                network.silent(urlM, function (j) { cb(j.results || []); }, function () { cb([]); });
                            });
                        }

                        // Серіали: шукаємо свіжі, але сортуємо ЗА ПОПУЛЯРНІСТЮ!
                        if (networkQ || companyQ || genreQ) {
                            var urlT = Lampa.TMDB.api('discover/tv?' + apiKey + '&sort_by=popularity.desc' + dateQTV + voteQ + networkQ + companyQ + genreQ);
                            requests.push(function (cb) {
                                network.silent(urlT, function (j) { cb(j.results || []); }, function () { cb([]); });
                            });
                        }

                        if (requests.length === 0) return callback({ results: [] });

                        var pending = requests.length;
                        requests.forEach(function (req) {
                            req(function (items) {
                                results = results.concat(items);
                                pending--;
                                if (pending === 0) {
                                    var unique = [];
                                    var seen = {};
                                    results.forEach(function (item) {
                                        if (!seen[item.id]) { seen[item.id] = true; unique.push(item); }
                                    });

                                    // Фінальне сортування: залишаємо їх по популярності
                                    unique.sort(function (a, b) { return (b.popularity || 0) - (a.popularity || 0); });

                                    callback({
                                        results: unique.slice(0, 20),
                                        title: tr('today_on_prefix') + config.title
                                    });
                                }
                            });
                        });
                    }
                }
            });
        });
    }

    // ========== ROW: НОВИНКИ ПОЛЬСЬКОЇ СТРІЧКИ (в кінці головної) ==========
    function addPolishContentRow() {
        Lampa.ContentRows.add({
            index: 6, // после English(5)
            name: 'polish_content_row',
            title: tr('polish_row_title'),
            screen: ['main'],
            call: function (params) {
                return function (callback) {
                    var network = new Lampa.Reguest();
                    var results = [];
                    var apiKey = 'api_key=' + getTmdbKey() + '&language=' + Lampa.Storage.get('language', 'uk');
                    var d = new Date();
                    var currentDate = [d.getFullYear(), ('0' + (d.getMonth() + 1)).slice(-2), ('0' + d.getDate()).slice(-2)].join('-');
                    var urlMovie = Lampa.TMDB.api('discover/movie?' + apiKey + '&sort_by=primary_release_date.desc&primary_release_date.lte=' + currentDate + '&with_origin_country=PL&vote_count.gte=1');
                    var urlTV = Lampa.TMDB.api('discover/tv?' + apiKey + '&sort_by=first_air_date.desc&first_air_date.lte=' + currentDate + '&with_origin_country=PL&vote_count.gte=1');

                    network.silent(urlMovie, function (json1) {
                        if (json1.results) results = results.concat(json1.results);
                        network.silent(urlTV, function (json2) {
                            if (json2.results) results = results.concat(json2.results);
                            results.sort(function (a, b) {
                                var dateA = new Date(a.release_date || a.first_air_date || '2000-01-01');
                                var dateB = new Date(b.release_date || b.first_air_date || '2000-01-01');
                                return dateB - dateA;
                            });
                            var unique = [];
                            var seen = {};
                            results.forEach(function (item) {
                                if (!seen[item.id]) { seen[item.id] = true; unique.push(item); }
                            });
                            callback({
                                results: unique.slice(0, 20),
                                title: tr('polish_row_title_full'),
                                params: {
                                    items: { mapping: 'line', view: 15 }
                                }
                            });
                        });
                    });
                };
            }
        });
    }

    function modifyServiceTitles() {
        var attempts = 0;
        var maxAttempts = 20;
        var timer = setInterval(function () {
            attempts++;
            var services = ['netflix', 'apple', 'hbo', 'amazon', 'disney', 'paramount', 'sky_showtime', 'hulu', 'syfy', 'educational_and_reality'];
            services.forEach(function (id) {
                var config = SERVICE_CONFIGS[id];
                if (!config) return;

                var titleText = tr('today_on_prefix') + config.title;

                var el = $('.items-line__title').filter(function () {
                    return $(this).text().trim() === titleText && $(this).find('svg').length === 0;
                });

                if (el.length) {
                    var iconHtml = '';
                    if (config.icon) {
                        iconHtml = '<div style="width: 1.2em; height: 1.2em; display: inline-block; vertical-align: middle; margin-right: 0.4em; margin-bottom: 0.1em; color: inherit;">' + config.icon + '</div>';
                    }
                    el.html(iconHtml + '<span style="vertical-align: middle;">' + tr('today_on_prefix') + config.title + '</span>');

                    var line = el.closest('.items-line');
                    if (line.length) {
                        var scrollBody = line.find('.scroll__body');
                        if (scrollBody.length && !scrollBody.data('flixio-more-observed')) {
                            scrollBody.data('flixio-more-observed', true);

                            var moreLabel = tr('go_to_page');
                            var iconHtml = config.icon ? '<div class="flixio-more-logo">' + config.icon + '</div>' : '';
                            var moreCard = $('<div class="card selector flixio-more-btn"><div>' + iconHtml + '<div>' + moreLabel + '</div><span style="color: #90caf9; font-size: 0.85em; display: block; margin-top: 0.4em;">' + config.title + '</span></div></div>');

                            moreCard.on('hover:enter', (function (serviceId) {
                                return function () {
                                    Lampa.Activity.push({
                                        url: '', title: SERVICE_CONFIGS[serviceId].title, component: 'studios_main', service_id: serviceId, page: 1
                                    });
                                };
                            })(id));
                            scrollBody.append(moreCard);
                        }
                    }
                }
            });

            // Те саме для Української, Польської та Російської стрічок
            $('.items-line').each(function () {
                var line = $(this);
                var titleText = line.find('.items-line__title').text().trim();
                var scrollBody = line.find('.scroll__body');
                if (!scrollBody.length) return;

                var isUA = titleText.indexOf('української стрічки') !== -1;
                var isPL = titleText.indexOf('польської стрічки') !== -1;
                var isRU = titleText.indexOf('російської стрічки') !== -1;
                if (!isUA && !isPL && !isRU) return;

                var dataKey = isUA ? 'flixio-more-ua' : (isPL ? 'flixio-more-pl' : 'flixio-more-ru');
                if (scrollBody.data(dataKey)) return;
                scrollBody.data(dataKey, true);

                var label = isUA ? tr('ukrainian_feed_name') : (isPL ? tr('polish_feed_name') : tr('russian_feed_name'));
                var comp = isUA ? 'ukrainian_feed' : (isPL ? 'polish_feed' : 'russian_feed');
                var color = isUA ? '#ffd700' : (isPL ? '#c41e3a' : '#d52b1e');

                // Додаємо order: 9999;
                var moreCard = $('<div class="card selector flixio-more-btn"><div><br>' + tr('go_to_page') + '<br><span style="color: ' + color + '; font-size: 0.85em; display: block; margin-top: 0.4em;">' + label + '</span></div></div>');

                moreCard.on('hover:enter', function () {
                    Lampa.Activity.push({ url: '', title: label, component: comp, page: 1 });
                });
                scrollBody.append(moreCard);
            });

            if (attempts >= maxAttempts) {
                clearInterval(timer);
            }
        }, 1000);
    }

    function overrideApi() {
        // Backup original if needed, but we want to replace it
        var originalMain = Lampa.Api.sources.tmdb.main;

        Lampa.Api.sources.tmdb.main = function (params, oncomplite, onerror) {
            var parts_data = [];

            // Allow plugins (like ours) to add their rows
            Lampa.ContentRows.call('main', params, parts_data);

            // parts_data now contains ONLY custom rows (because we didn't add the standard ones)

            // Use the standard loader to process these rows
            function loadPart(partLoaded, partEmpty) {
                Lampa.Api.partNext(parts_data, 5, partLoaded, partEmpty);
            }

            loadPart(oncomplite, onerror);

            return loadPart;
        };
    }


    function setupSettings() {
        if (!Lampa.SettingsApi || !Lampa.SettingsApi.addComponent) return;

        // Створюємо єдину вкладку "Ліхтар"
        Lampa.SettingsApi.addComponent({
            component: 'flixio_plugin',
            name: tr('settings_tab_title'),
            icon: '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="none" stroke="white" stroke-width="1.5"/><path d="M8 8h8v2H8V8zm0 4h6v2H8v-2zm0 4h8v2H8v-2z" fill="white"/><circle cx="3" cy="3" r="1" fill="white" opacity="0.6"/><circle cx="21" cy="3" r="1" fill="white" opacity="0.6"/><circle cx="3" cy="21" r="1" fill="white" opacity="0.6"/><circle cx="21" cy="21" r="1" fill="white" opacity="0.6"/><circle cx="12" cy="1" r="1" fill="white" opacity="0.7"/><circle cx="12" cy="23" r="1" fill="white" opacity="0.7"/><circle cx="1" cy="12" r="1" fill="white" opacity="0.7"/><circle cx="23" cy="12" r="1" fill="white" opacity="0.7"/></svg>'
        });

        
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

        // === Секція: Секції головної ===
        Lampa.SettingsApi.addParam({
            component: 'flixio_plugin',
            param: { type: 'title' },
            field: { name: tr('settings_sections_title') }
        });

        Lampa.SettingsApi.addParam({
            component: 'flixio_plugin',
            param: { name: 'flixio_row_hero', type: 'trigger', default: true },
            field: { name: tr('settings_hero_name'), description: tr('settings_hero_desc') }
        });

        Lampa.SettingsApi.addParam({
            component: 'flixio_plugin',
            param: { name: 'flixio_section_streamings', type: 'trigger', default: true },
            field: { name: tr('settings_streamings_name'), description: tr('settings_streamings_desc') }
        });

        Lampa.SettingsApi.addParam({
            component: 'flixio_plugin',
            param: { name: 'flixio_section_mood', type: 'trigger', default: true },
            field: { name: tr('settings_mood_name'), description: tr('settings_mood_desc') }
        });

        Lampa.SettingsApi.addParam({
            component: 'flixio_plugin',
            param: { name: 'flixio_row_ru_feed', type: 'trigger', default: false },
            field: { name: tr('settings_row_ru_name'), description: tr('settings_row_ru_desc') }
        });

        Lampa.SettingsApi.addParam({
            component: 'flixio_plugin',
            param: { name: 'flixio_row_ua_feed', type: 'trigger', default: false },
            field: { name: tr('settings_row_ua_name'), description: tr('settings_row_ua_desc') }
        });

        Lampa.SettingsApi.addParam({
            component: 'flixio_plugin',
            param: { name: 'flixio_row_en_feed', type: 'trigger', default: false },
            field: { name: tr('settings_row_en_name'), description: tr('settings_row_en_desc') }
        });

        Lampa.SettingsApi.addParam({
            component: 'flixio_plugin',
            param: { name: 'flixio_row_pl_feed', type: 'trigger', default: false },
            field: { name: tr('settings_row_pl_name'), description: tr('settings_row_pl_desc') }
        });

        Lampa.SettingsApi.addParam({
            component: 'flixio_plugin',
            param: { name: 'flixio_row_today_netflix', type: 'trigger', default: true },
            field: { name: tr('settings_today_netflix_name'), description: tr('settings_today_netflix_desc') }
        });

        Lampa.SettingsApi.addParam({
            component: 'flixio_plugin',
            param: { name: 'flixio_row_today_apple', type: 'trigger', default: true },
            field: { name: tr('settings_today_apple_name'), description: tr('settings_today_apple_desc') }
        });

        Lampa.SettingsApi.addParam({
            component: 'flixio_plugin',
            param: { name: 'flixio_row_today_hbo', type: 'trigger', default: true },
            field: { name: tr('settings_today_hbo_name'), description: tr('settings_today_hbo_desc') }
        });

        Lampa.SettingsApi.addParam({
            component: 'flixio_plugin',
            param: { name: 'flixio_row_today_prime', type: 'trigger', default: true },
            field: { name: tr('settings_today_prime_name'), description: tr('settings_today_prime_desc') }
        });

        Lampa.SettingsApi.addParam({
            component: 'flixio_plugin',
            param: { name: 'flixio_row_today_disney', type: 'trigger', default: true },
            field: { name: tr('settings_today_disney_name'), description: tr('settings_today_disney_desc') }
        });

        Lampa.SettingsApi.addParam({
            component: 'flixio_plugin',
            param: { name: 'flixio_row_today_paramount', type: 'trigger', default: true },
            field: { name: tr('settings_today_paramount_name'), description: tr('settings_today_paramount_desc') }
        });

        Lampa.SettingsApi.addParam({
            component: 'flixio_plugin',
            param: { name: 'flixio_row_today_sky', type: 'trigger', default: true },
            field: { name: tr('settings_today_sky_name'), description: tr('settings_today_sky_desc') }
        });

        Lampa.SettingsApi.addParam({
            component: 'flixio_plugin',
            param: { name: 'flixio_row_today_hulu', type: 'trigger', default: true },
            field: { name: tr('settings_today_hulu_name'), description: tr('settings_today_hulu_desc') }
        });

        Lampa.SettingsApi.addParam({
            component: 'flixio_plugin',
            param: { type: 'title' },
            field: { name: tr('settings_badges_title') }
        });

        Lampa.SettingsApi.addParam({
            component: 'flixio_plugin',
            param: { name: 'flixio_badge_seasons', type: 'trigger', default: true },
            field: { name: 'Сезоны', description: 'Показывать badge для сезонов на карточках' }
        });

        Lampa.SettingsApi.addParam({
            component: 'flixio_plugin',
            param: { name: 'flixio_badge_year', type: 'trigger', default: true },
            field: { name: 'Год', description: 'Показывать badge для года на карточках' }
        });

        Lampa.SettingsApi.addParam({
            component: 'flixio_plugin',
            param: { name: 'flixio_badge_quality', type: 'trigger', default: true },
            field: { name: 'Качество', description: 'Показывать badge для качества на карточках' }
        });

        Lampa.SettingsApi.addParam({
            component: 'flixio_plugin',
            param: { name: 'flixio_badge_rating', type: 'trigger', default: true },
            field: { name: 'Рейтинг', description: 'Показывать badge для рейтинга на карточках' }
        });
    }

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

    function initMaxsmRatingsIntegration() {
        if (window.maxsmRatingsPlugin) return;
        if (typeof Lampa === 'undefined') return;

        function normalizeApiKeys(value) {
            if (!value) return [];
            if (Array.isArray(value)) return value.filter(function (v) { return !!v; });
            if (typeof value === 'string') return [value];
            return [];
        }

        var TOKENS = window.RATINGS_PLUGIN_TOKENS || {};
        var OMDB_API_KEYS = normalizeApiKeys(TOKENS.OMDB_API_KEYS || TOKENS.OMDB || TOKENS.OMDB_KEYS || TOKENS.OMDB_API_KEY || TOKENS.OMDB_KEY);
        var KP_API_KEYS = normalizeApiKeys(TOKENS.KP_API_KEYS || TOKENS.KP || TOKENS.KP_KEYS || TOKENS.KP_API_KEY || TOKENS.KP_KEY);
        if (!OMDB_API_KEYS.length) OMDB_API_KEYS = ['73ff4450'];
        if (!KP_API_KEYS.length) KP_API_KEYS = ['5178ab83-699c-4422-937e-f8a759f872ef'];

        var C_LOGGING = false;
        var CACHE_TIME = 3 * 24 * 60 * 60 * 1000;

        var OMDB_CACHE = 'maxsm_ratings_omdb_cache';
        var KP_CACHE = 'maxsm_ratings_kp_cache';
        var ID_MAPPING_CACHE = 'maxsm_ratings_id_mapping_cache';

        var PROXY_TIMEOUT = 5000;
        var PROXY_LIST = [
            'https://cors.bwa.workers.dev/',
            'https://api.allorigins.win/raw?url='
        ];

        var AGE_RATINGS = {
            'G': '3+',
            'PG': '6+',
            'PG-13': '13+',
            'R': '17+',
            'NC-17': '18+',
            'TV-Y': '0+',
            'TV-Y7': '7+',
            'TV-G': '3+',
            'TV-PG': '6+',
            'TV-14': '14+',
            'TV-MA': '17+'
        };

        var WEIGHTS = {
            imdb: 0.35,
            tmdb: 0.15,
            kp: 0.20,
            mc: 0.15,
            rt: 0.15
        };

        var star_svg = '<svg viewBox="5 5 54 54" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill="none" stroke="white" stroke-width="2" d="M32 18.7461L36.2922 27.4159L46.2682 28.6834L38.9675 35.3631L40.7895 44.8469L32 40.2489L23.2105 44.8469L25.0325 35.3631L17.7318 28.6834L27.7078 27.4159L32 18.7461ZM32 23.2539L29.0241 29.2648L22.2682 30.1231L27.2075 34.6424L25.9567 41.1531L32 37.9918L38.0433 41.1531L36.7925 34.6424L41.7318 30.1231L34.9759 29.2648L32 23.2539Z"/><path fill="none" stroke="white" stroke-width="2" d="M32 9C19.2975 9 9 19.2975 9 32C9 44.7025 19.2975 55 32 55C44.7025 55 55 44.7025 55 32C55 19.2975 44.7025 9 32 9ZM7 32C7 18.1929 18.1929 7 32 7C45.8071 7 57 18.1929 57 32C57 45.8071 45.8071 57 32 57C18.1929 57 7 45.8071 7 32Z"/></svg>';
        var avg_svg = '<svg width="64" height="64" viewBox="10 10 44 44" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M31.4517 11.3659C31.8429 10.7366 32.7589 10.7366 33.1501 11.3659L40.2946 22.8568C40.4323 23.0782 40.651 23.2371 40.9041 23.2996L54.0403 26.5435C54.7598 26.7212 55.0428 27.5923 54.5652 28.1589L45.8445 38.5045C45.6764 38.7039 45.5929 38.961 45.6117 39.221L46.5858 52.7168C46.6392 53.4559 45.8982 53.9942 45.2117 53.7151L32.6776 48.6182C32.4361 48.52 32.1657 48.52 31.9242 48.6182L19.39 53.7151C18.7036 53.9942 17.9626 53.4559 18.016 52.7168L18.9901 39.221C19.0089 38.961 18.9253 38.7039 18.7573 38.5045L10.0366 28.1589C9.559 27.5923 9.84204 26.7212 10.5615 26.5435L23.6977 23.2996C23.9508 23.2371 24.1695 23.0782 24.3072 22.8568L31.4517 11.3659Z" fill="#FFDF6D"/></svg>';
        var tmdb_svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 150" width="150" height="150"><defs><linearGradient id="grad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#90cea1"/><stop offset="56%" stop-color="#3cbec9"/><stop offset="100%" stop-color="#00b3e5"/></linearGradient><style>.text-style{font-weight:bold;fill:url(#grad);text-anchor:start;dominant-baseline:middle;textLength:150;lengthAdjust:spacingAndGlyphs;font-size:70px;}</style></defs><text class="text-style" x="0" y="50" textLength="150" lengthAdjust="spacingAndGlyphs">TM</text><text class="text-style" x="0" y="120" textLength="150" lengthAdjust="spacingAndGlyphs">DB</text></svg>';
        var imdb_svg = '<?xml version="1.0" encoding="utf-8"?><svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 122.88 122.88" xml:space="preserve"><style type="text/css"><![CDATA[.st0{fill:#F5C518;}]]></style><g><path class="st0" d="M18.43,0h86.02c10.18,0,18.43,8.25,18.43,18.43v86.02c0,10.18-8.25,18.43-18.43,18.43H18.43 C8.25,122.88,0,114.63,0,104.45l0-86.02C0,8.25,8.25,0,18.43,0L18.43,0z"/><path d="M24.96,78.72V44.16h-9.6v34.56H24.96L24.96,78.72z M45.36,44.16L43.2,60.24L42,51.6l-1.2-7.44l-12,0v34.56h8.16v-22.8 l3.36,22.8h6l3.12-23.28v23.28h8.16V44.16H45.36L45.36,44.16z M61.44,78.72V44.16h14.88c3.6,0,6.24,2.64,6.24,6v22.56 c0,3.36-2.64,6-6.24,6H61.44L61.44,78.72z M72.72,50.4l-2.16-0.24v22.56c1.2,0,2.16-0.24,2.4-0.72c0.48-0.48,0.48-1.92,0.48-4.32 V54.24v-2.88L72.72,50.4L72.72,50.4L72.72,50.4z M100.56,52.8h0.72c3.36,0,6.24,2.64,6.24,6v13.92c0,3.36-2.88,6-6.24,6l-0.72,0 c-1.92,0-3.84-0.96-5.04-2.64l-0.48,2.16H86.4V44.16h9.12V55.2C96.72,53.76,98.64,52.8,100.56,52.8L100.56,52.8z M98.64,69.6v-8.16 L98.4,58.8c-0.24-0.48-0.96-0.72-1.44-0.72c-0.48,0-1.2,0.24-1.44,0.72v13.68c0.24,0.48,0.96,0.72,1.44,0.72 c0.48,0,1.44-0.24,1.44-0.72L98.64,69.6L98.64,69.6z"/></g></svg>';
        var kp_svg = '<svg width="300" height="300" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg"><mask id="mask0_1_69" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="300" height="300"><circle cx="150" cy="150" r="150" fill="white"/></mask><g mask="url(#mask0_1_69)"><circle cx="150" cy="150" r="150" fill="black"/><path d="M300 45L145.26 127.827L225.9 45H181.2L126.3 121.203V45H89.9999V255H126.3V178.92L181.2 255H225.9L147.354 174.777L300 255V216L160.776 160.146L300 169.5V130.5L161.658 139.494L300 84V45Z" fill="url(#paint0_radial_1_69)"/></g><defs><radialGradient id="paint0_radial_1_69" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(89.9999 45) rotate(45) scale(296.985)"><stop offset="0.5" stop-color="#FF5500"/><stop offset="1" stop-color="#BBFF00"/></radialGradient></defs></svg>';
        var rt_svg = '<svg xmlns="http://www.w3.org/2000/svg" height="141.25" viewBox="0 0 138.75 141.25" width="138.75"><g fill="#f93208"><path d="m20.154 40.829c-28.149 27.622-13.657 61.011-5.734 71.931 35.254 41.954 92.792 25.339 111.89-5.9071 4.7608-8.2027 22.554-53.467-23.976-78.009z"/><path d="m39.613 39.265 4.7778-8.8607 28.406-5.0384 11.119 9.2082z"/></g><g><path d="m39.436 8.5696 8.9682-5.2826 6.7569 15.479c3.7925-6.3226 13.79-16.316 24.939-4.6684-4.7281 1.2636-7.5161 3.8553-7.7397 8.4768 15.145-4.1697 31.343 3.2127 33.539 9.0911-10.951-4.314-27.695 10.377-41.771 2.334 0.009 15.045-12.617 16.636-19.902 17.076 2.077-4.996 5.591-9.994 1.474-14.987-7.618 8.171-13.874 10.668-33.17 4.668 4.876-1.679 14.843-11.39 24.448-11.425-6.775-2.467-12.29-2.087-17.814-1.475 2.917-3.961 12.149-15.197 28.625-8.476z" fill="#02902e"/></g></svg>';
        var mc_svg = '<svg xmlns="http://www.w3.org/2000/svg" width="88" height="88" viewBox="0 0 88 88"><circle fill="#001B36" stroke="#FC0" stroke-width="4.6" cx="44" cy="44" r="41.6"/></svg>';
        var awards_svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36"><path fill="#FFD700" d="M12 2l2.2 6.8H21l-5.5 4 2.1 6.8L12 15.8 6.4 19.6l2.1-6.8L3 8.8h6.8z"/></svg>';

        if (Lampa.Lang && Lampa.Lang.add) {
            Lampa.Lang.add({
                maxsm_ratings: { ru: 'Рейтинг и качество', en: 'Rating & Quality', uk: 'Рейтинг і якість', pl: 'Ocena i jakość' },
                maxsm_ratings_cc: { ru: 'Очистить локальный кеш', en: 'Clear local cache', uk: 'Очистити локальний кеш', pl: 'Wyczyść lokalny cache' },
                maxsm_ratings_critic: { ru: 'Оценки критиков', en: 'Critic Ratings', uk: 'Оцінки критиків', pl: 'Oceny krytyków' },
                maxsm_ratings_mode: { ru: 'Средний рейтинг', en: 'Average rating', uk: 'Середній рейтинг', pl: 'Średnia ocena' },
                maxsm_ratings_mode_normal: { ru: 'Показывать средний рейтинг', en: 'Show average rating', uk: 'Показувати середній рейтинг', pl: 'Pokaż średnią ocenę' },
                maxsm_ratings_mode_simple: { ru: 'Только средний рейтинг', en: 'Only average rating', uk: 'Лише середній рейтинг', pl: 'Tylko średnia ocena' },
                maxsm_ratings_mode_noavg: { ru: 'Без среднего рейтинга', en: 'No average', uk: 'Без середнього рейтингу', pl: 'Bez średniej' },
                maxsm_ratings_icons: { ru: 'Значки', en: 'Icons', uk: 'Значки', pl: 'Ikony' },
                maxsm_ratings_colors: { ru: 'Цвета', en: 'Colors', uk: 'Кольори', pl: 'Kolory' },
                maxsm_ratings_avg: { ru: 'ИТОГ', en: 'TOTAL', uk: 'ПІДСУМОК', pl: 'RAZEM' },
                maxsm_ratings_avg_simple: { ru: 'Оценка', en: 'Rating', uk: 'Оцінка', pl: 'Ocena' },
                maxsm_ratings_loading: { ru: 'Загрузка', en: 'Loading', uk: 'Завантаження', pl: 'Ładowanie' },
                maxsm_ratings_oscars: { ru: 'Оскар', en: 'Oscar', uk: 'Оскар', pl: 'Oscar' },
                maxsm_ratings_emmy: { ru: 'Эмми', en: 'Emmy', uk: 'Еммі', pl: 'Emmy' },
                maxsm_ratings_awards: { ru: 'Награды', en: 'Awards', uk: 'Нагороди', pl: 'Nagrody' },
                maxsm_ratings_show_total: { ru: 'Итог', en: 'Total', uk: 'Підсумок', pl: 'Razem' },
                maxsm_ratings_show_oscars: { ru: 'Оскар', en: 'Oscar', uk: 'Оскар', pl: 'Oscar' },
                maxsm_ratings_show_awards: { ru: 'Награды', en: 'Awards', uk: 'Нагороди', pl: 'Nagrody' },
                maxsm_ratings_show_tmdb: { ru: 'TMDB', en: 'TMDB', uk: 'TMDB', pl: 'TMDB' },
                maxsm_ratings_show_imdb: { ru: 'IMDB', en: 'IMDb', uk: 'IMDb', pl: 'IMDb' },
                maxsm_ratings_show_kp: { ru: 'Кинопоиск', en: 'Kinopoisk', uk: 'Кінопошук', pl: 'Kinopoisk' },
                maxsm_ratings_show_rt: { ru: 'Tomatoes', en: 'Tomatoes', uk: 'Tomatoes', pl: 'Tomatoes' },
                maxsm_ratings_show_mc: { ru: 'Metacritic', en: 'Metacritic', uk: 'Metacritic', pl: 'Metacritic' },
                maxsm_ratings_quality: { ru: 'Качество внутри карточек', en: 'Quality inside cards', uk: 'Якість всередині карток', pl: 'Jakość w kartach' },
                maxsm_ratings_quality_inlist: { ru: 'Качество на карточках', en: 'Quality on cards', uk: 'Якість на картках', pl: 'Jakość na kartach' },
                maxsm_ratings_quality_tv: { ru: 'Качество для сериалов', en: 'Quality for series', uk: 'Якість для серіалів', pl: 'Jakość dla seriali' }
            });
        }

        if (!document.getElementById('maxsm_ratings_css')) {
            var style = document.createElement('style');
            style.id = 'maxsm_ratings_css';
            style.textContent = '.full-start-new__rate-line{display:flex;flex-wrap:wrap;column-gap:.22em;row-gap:.22em}.full-start-new__rate-line>*{margin:0!important}.full-start-new__rate-line .full-start__rate{display:inline-flex!important;align-items:center!important;justify-content:flex-start!important;gap:.28em!important;margin:0!important;width:auto!important}.full-start-new__rate-line .full-start__rate.hide{display:none!important}.full-start-new__rate-line .full-start__rate>div{margin:0!important}.full-start__rate>div:last-child{padding:.2em .35em}.rate--green{color:#4caf50}.rate--lime{color:#cddc39}.rate--orange{color:#ff9800}.rate--red{color:#f44336}.rate--gold{color:gold}.rate--icon{height:1.8em}.maxsm-quality{min-width:2.8em;text-align:center}.maxsm-icon-container{display:inline-flex;align-items:center;justify-content:center;height:1.6em;width:1.6em;overflow:hidden;vertical-align:middle;padding:0}.maxsm-icon-container svg{width:100%;height:100%;object-fit:contain}.full-start-new__rate-line .source--name{display:inline-flex;align-items:center;justify-content:center;min-width:2.2em}.full-start-new__rate-line .source--name.rate--icon{min-width:2.2em}.applecation__ratings:not(.full-start-new__rate-line){display:none!important}.applecation .full-start-new__rate-line.applecation__ratings{height:auto!important;overflow:visible!important;opacity:1!important;pointer-events:auto!important;margin:0 0 .5em 0!important}';
            document.head.appendChild(style);
        }
        
        if (!document.getElementById('maxsm_ratings_modal_css')) {
            var modalStyle = document.createElement('style');
            modalStyle.id = 'maxsm_ratings_modal_css';
            modalStyle.textContent = '.maxsm-modal-ratings{padding:1.25em;font-size:1.4em;line-height:1.6}.maxsm-modal-rating-line{padding:.5em 0;border-bottom:.0625em solid rgba(255,255,255,.1)}.maxsm-modal-rating-line:last-child{border-bottom:none}.maxsm-modal-imdb{color:#f5c518}.maxsm-modal-kp{color:#4CAF50}.maxsm-modal-tmdb{color:#01b4e4}.maxsm-modal-rt{color:#fa320a}.maxsm-modal-mc{color:#6dc849}.maxsm-modal-oscars,.maxsm-modal-emmy,.maxsm-modal-awards{color:#FFD700}';
            document.head.appendChild(modalStyle);
        }

        if (!localStorage.getItem('maxsm_ratings_awards')) localStorage.setItem('maxsm_ratings_awards', 'true');
        if (!localStorage.getItem('maxsm_ratings_critic')) localStorage.setItem('maxsm_ratings_critic', 'true');
        if (!localStorage.getItem('maxsm_ratings_colors')) localStorage.setItem('maxsm_ratings_colors', 'false');
        if (!localStorage.getItem('maxsm_ratings_icons')) localStorage.setItem('maxsm_ratings_icons', 'false');
        if (!localStorage.getItem('maxsm_ratings_mode')) localStorage.setItem('maxsm_ratings_mode', '0');
        if (!localStorage.getItem('maxsm_ratings_show_total')) localStorage.setItem('maxsm_ratings_show_total', 'true');
        if (!localStorage.getItem('maxsm_ratings_show_oscars')) localStorage.setItem('maxsm_ratings_show_oscars', 'true');
        if (!localStorage.getItem('maxsm_ratings_show_awards')) localStorage.setItem('maxsm_ratings_show_awards', 'true');
        if (!localStorage.getItem('maxsm_ratings_show_tmdb')) localStorage.setItem('maxsm_ratings_show_tmdb', 'true');
        if (!localStorage.getItem('maxsm_ratings_show_imdb')) localStorage.setItem('maxsm_ratings_show_imdb', 'true');
        if (!localStorage.getItem('maxsm_ratings_show_kp')) localStorage.setItem('maxsm_ratings_show_kp', 'true');
        if (!localStorage.getItem('maxsm_ratings_show_rt')) localStorage.setItem('maxsm_ratings_show_rt', 'true');
        if (!localStorage.getItem('maxsm_ratings_show_mc')) localStorage.setItem('maxsm_ratings_show_mc', 'true');
        if (!localStorage.getItem('maxsm_ratings_quality')) localStorage.setItem('maxsm_ratings_quality', 'true');
        if (!localStorage.getItem('maxsm_ratings_quality_inlist')) localStorage.setItem('maxsm_ratings_quality_inlist', 'true');
        if (!localStorage.getItem('maxsm_ratings_quality_tv')) localStorage.setItem('maxsm_ratings_quality_tv', 'true');

        function getRandomToken(arr) {
            if (!arr || !arr.length) return '';
            return arr[Math.floor(Math.random() * arr.length)];
        }

        function getRatingClass(rating) {
            var r = parseFloat(rating);
            if (r >= 8.5) return 'rate--green';
            if (r >= 7.0) return 'rate--lime';
            if (r >= 5.0) return 'rate--orange';
            return 'rate--red';
        }

        function getCardType(card) {
            var type = card.media_type || card.type;
            if (type === 'movie' || type === 'tv') return type;
            return (card.name || card.original_name) ? 'tv' : 'movie';
        }

        function parseAwards(awardsText) {
            if (typeof awardsText !== 'string') return { oscars: 0, emmy: 0, awards: 0 };
            var result = { oscars: 0, emmy: 0, awards: 0 };

            var oscarMatch = awardsText.match(/Won (\d+) Oscars?/i);
            if (oscarMatch && oscarMatch[1]) result.oscars = parseInt(oscarMatch[1], 10);

            var emmyMatch = awardsText.match(/Won (\d+) Primetime Emmys?/i);
            if (emmyMatch && emmyMatch[1]) result.emmy = parseInt(emmyMatch[1], 10);

            var otherMatch = awardsText.match(/Another (\d+) wins?/i);
            if (otherMatch && otherMatch[1]) result.awards = parseInt(otherMatch[1], 10);

            if (result.awards === 0) {
                var simpleMatch = awardsText.match(/(\d+) wins?/i);
                if (simpleMatch && simpleMatch[1]) result.awards = parseInt(simpleMatch[1], 10);
            }

            return result;
        }

        function extractRating(ratings, source) {
            if (!ratings || !Array.isArray(ratings)) return null;
            for (var i = 0; i < ratings.length; i++) {
                if (ratings[i].Source === source) {
                    try {
                        return source === 'Rotten Tomatoes' ? parseFloat(ratings[i].Value.replace('%', '')) : parseFloat(ratings[i].Value.split('/')[0]);
                    } catch (e) {
                        return null;
                    }
                }
            }
            return null;
        }

        function getOmdbCache(key) {
            var cache = Lampa.Storage.get(OMDB_CACHE) || {};
            var item = cache[key];
            return item && (Date.now() - item.timestamp < CACHE_TIME) ? item : null;
        }

        function saveOmdbCache(key, data) {
            var cache = Lampa.Storage.get(OMDB_CACHE) || {};
            cache[key] = {
                rt: data.rt,
                mc: data.mc,
                imdb: data.imdb,
                ageRating: data.ageRating,
                oscars: data.oscars || null,
                emmy: data.emmy || null,
                awards: data.awards || null,
                timestamp: Date.now()
            };
            Lampa.Storage.set(OMDB_CACHE, cache);
        }

        function getKpCache(key) {
            var cache = Lampa.Storage.get(KP_CACHE) || {};
            var item = cache[key];
            return item && (Date.now() - item.timestamp < CACHE_TIME) ? item : null;
        }

        function saveKpCache(key, data) {
            var cache = Lampa.Storage.get(KP_CACHE) || {};
            cache[key] = { kp: data.kp || null, imdb: data.imdb || null, timestamp: Date.now() };
            Lampa.Storage.set(KP_CACHE, cache);
        }

        function getImdbIdFromTmdb(tmdbId, cardType, localCurrentCard, callback) {
            var cleanType = cardType === 'tv' ? 'tv' : 'movie';
            var cacheKey = cleanType + '_' + tmdbId;
            var cache = Lampa.Storage.get(ID_MAPPING_CACHE) || {};
            if (cache[cacheKey] && (Date.now() - cache[cacheKey].timestamp < CACHE_TIME)) {
                return callback(cache[cacheKey].imdb_id);
            }

            var mainPath = cleanType + '/' + tmdbId + '/external_ids?api_key=' + Lampa.TMDB.key();
            var mainUrl = Lampa.TMDB.api(mainPath);

            new Lampa.Reguest().silent(mainUrl, function (data) {
                if (data && data.imdb_id) {
                    cache[cacheKey] = { imdb_id: data.imdb_id, timestamp: Date.now() };
                    Lampa.Storage.set(ID_MAPPING_CACHE, cache);
                    callback(data.imdb_id);
                } else {
                    callback(null);
                }
            }, function () {
                callback(null);
            });
        }

        function fetchOmdbRatings(card, localCurrentCard, callback) {
            if (!card.imdb_id) return callback(null);
            var url = 'https://www.omdbapi.com/?apikey=' + getRandomToken(OMDB_API_KEYS) + '&i=' + card.imdb_id;
            new Lampa.Reguest().silent(url, function (data) {
                if (data && data.Response === 'True' && (data.Ratings || data.imdbRating)) {
                    var parsedAwards = parseAwards(data.Awards || '');
                    callback({
                        rt: extractRating(data.Ratings, 'Rotten Tomatoes'),
                        mc: extractRating(data.Ratings, 'Metacritic'),
                        imdb: data.imdbRating || null,
                        ageRating: data.Rated || null,
                        oscars: parsedAwards.oscars,
                        emmy: parsedAwards.emmy,
                        awards: parsedAwards.awards
                    });
                } else {
                    callback(null);
                }
            }, function () {
                callback(null);
            });
        }

        function fetchWithProxy(url, localCurrentCard, callback) {
            var currentProxy = 0;
            var callbackCalled = false;

            function tryNextProxy() {
                if (currentProxy >= PROXY_LIST.length) {
                    if (!callbackCalled) {
                        callbackCalled = true;
                        callback(new Error('All proxies failed'));
                    }
                    return;
                }

                var proxyUrl = PROXY_LIST[currentProxy] + encodeURIComponent(url);
                var timeoutId = setTimeout(function () {
                    if (!callbackCalled) {
                        currentProxy++;
                        tryNextProxy();
                    }
                }, PROXY_TIMEOUT);

                fetch(proxyUrl)
                    .then(function (response) {
                        clearTimeout(timeoutId);
                        if (!response.ok) throw new Error('Proxy error: ' + response.status);
                        return response.text();
                    })
                    .then(function (data) {
                        if (!callbackCalled) {
                            callbackCalled = true;
                            clearTimeout(timeoutId);
                            callback(null, data);
                        }
                    })
                    .catch(function () {
                        clearTimeout(timeoutId);
                        if (!callbackCalled) {
                            currentProxy++;
                            tryNextProxy();
                        }
                    });
            }

            tryNextProxy();
        }

        function getKPRatings(normalizedCard, apiKey, localCurrentCard, callback) {
            if (normalizedCard.kinopoisk_id) {
                return fetchRatings(normalizedCard.kinopoisk_id, localCurrentCard);
            }

            var queryTitle = (normalizedCard.original_title || normalizedCard.title || '').replace(/[:\\-–—]/g, ' ').trim();
            var year = '';
            if (normalizedCard.release_date && typeof normalizedCard.release_date === 'string') {
                year = normalizedCard.release_date.split('-')[0];
            }

            if (!year) {
                callback(null);
                return;
            }

            var encodedTitle = encodeURIComponent(queryTitle);
            var searchUrl = 'https://kinopoiskapiunofficial.tech/api/v2.1/films/search-by-keyword?keyword=' + encodedTitle;

            fetch(searchUrl, {
                method: 'GET',
                headers: {
                    'X-API-KEY': apiKey,
                    'Content-Type': 'application/json'
                }
            })
                .then(function (response) {
                    if (!response.ok) throw new Error('HTTP error: ' + response.status);
                    return response.json();
                })
                .then(function (data) {
                    if (!data.films || !data.films.length) {
                        callback(null);
                        return;
                    }

                    var bestMatch = null;
                    var filmYear;
                    var targetYear;
                    var film2;

                    for (var j = 0; j < data.films.length; j++) {
                        film2 = data.films[j];
                        if (!film2.year) continue;

                        filmYear = parseInt(String(film2.year).substring(0, 4), 10);
                        targetYear = parseInt(year, 10);

                        if (isNaN(filmYear)) continue;
                        if (isNaN(targetYear)) continue;

                        if (filmYear === targetYear) {
                            bestMatch = film2;
                            break;
                        }
                    }

                    if (!bestMatch) {
                        for (var k = 0; k < data.films.length; k++) {
                            film2 = data.films[k];
                            if (!film2.year) continue;

                            filmYear = parseInt(String(film2.year).substring(0, 4), 10);
                            targetYear = parseInt(year, 10);

                            if (isNaN(filmYear)) continue;
                            if (isNaN(targetYear)) continue;

                            if (Math.abs(filmYear - targetYear) <= 1) {
                                bestMatch = film2;
                                break;
                            }
                        }
                    }

                    if (!bestMatch || !bestMatch.filmId) {
                        callback(null);
                        return;
                    }

                    fetchRatings(bestMatch.filmId, localCurrentCard);
                })
                .catch(function () {
                    callback(null);
                });

            function fetchRatings(filmId, localCurrentCard) {
                var xmlUrl = 'https://rating.kinopoisk.ru/' + filmId + '.xml';

                fetchWithProxy(xmlUrl, localCurrentCard, function (error, xmlText) {
                    if (!error && xmlText) {
                        try {
                            var parser = new DOMParser();
                            var xmlDoc = parser.parseFromString(xmlText, 'text/xml');
                            var kpRatingNode = xmlDoc.getElementsByTagName('kp_rating')[0];
                            var imdbRatingNode = xmlDoc.getElementsByTagName('imdb_rating')[0];

                            var kpRating = kpRatingNode ? parseFloat(kpRatingNode.textContent) : null;
                            var imdbRating = imdbRatingNode ? parseFloat(imdbRatingNode.textContent) : null;

                            var hasValidKp = !isNaN(kpRating) && kpRating > 0;
                            var hasValidImdb = !isNaN(imdbRating) && imdbRating > 0;

                            if (hasValidKp || hasValidImdb) {
                                return callback({ kinopoisk: hasValidKp ? kpRating : null, imdb: hasValidImdb ? imdbRating : null });
                            }
                        } catch (e) { }
                    }

                    fetch('https://kinopoiskapiunofficial.tech/api/v2.2/films/' + filmId, {
                        headers: { 'X-API-KEY': apiKey }
                    })
                        .then(function (response) {
                            if (!response.ok) throw new Error('API error');
                            return response.json();
                        })
                        .then(function (data) {
                            callback({
                                kinopoisk: data.ratingKinopoisk || null,
                                imdb: data.ratingImdb || null
                            });
                        })
                        .catch(function () {
                            callback(null);
                        });
                });
            }
        }

        function addLoadingAnimation(render) {
            if (!render) return;
            var rateLine = $('.full-start-new__rate-line', render);
            if (!rateLine.length || $('.loading-dots-container', rateLine).length) return;
            rateLine.append('<div class="loading-dots-container"><div class="loading-dots"><span class="loading-dots__text">' + (Lampa.Lang ? Lampa.Lang.translate('maxsm_ratings_loading') : 'Loading') + '</span><span class="loading-dots__dot"></span><span class="loading-dots__dot"></span><span class="loading-dots__dot"></span></div></div>');
        }

        function removeLoadingAnimation(render) {
            if (!render) return;
            var containers = $('.loading-dots-container', render);
            containers.each(function (index, element) {
                element.parentNode.removeChild(element);
            });
        }

        function updateHiddenElements(ratings, render) {
            if (!render) return;

            var pgElement = $('.full-start__pg.hide', render);
            if (pgElement.length && ratings.ageRating) {
                var invalidRatings = ['N/A', 'Not Rated', 'Unrated', 'NR'];
                if (invalidRatings.indexOf(ratings.ageRating) === -1) {
                    var localizedRating = AGE_RATINGS[ratings.ageRating] || ratings.ageRating;
                    pgElement.removeClass('hide').text(localizedRating);
                }
            }

            function setRateVisible(selector, value) {
                var el = $(selector, render);
                if (!el.length) return;
                var ok = value != null && value !== '' && !isNaN(value);
                if (ok) {
                    el.removeClass('hide').find('> div').eq(0).text(parseFloat(value).toFixed(1));
                } else {
                    el.addClass('hide').find('> div').eq(0).text('');
                }
            }

            var imdbValue = null;
            if (ratings.imdb && !isNaN(ratings.imdb)) imdbValue = ratings.imdb;
            else if (ratings.imdb_kp && !isNaN(ratings.imdb_kp)) imdbValue = ratings.imdb_kp;
            var showImdb = localStorage.getItem('maxsm_ratings_show_imdb') !== 'false';
            var showKp = localStorage.getItem('maxsm_ratings_show_kp') !== 'false';
            var showTmdb = localStorage.getItem('maxsm_ratings_show_tmdb') !== 'false';
            setRateVisible('.rate--imdb', showImdb ? imdbValue : null);
            setRateVisible('.rate--kp', showKp ? ratings.kp : null);
            setRateVisible('.rate--tmdb', showTmdb ? ratings.tmdb : null);
        }

        function insertRatings(rtRating, mcRating, oscars, awards, emmy, render) {
            if (!render) return;
            var rateLine = $('.full-start-new__rate-line', render);
            if (!rateLine.length) return;

            var lastRate = $('.full-start__rate:last', rateLine);

            var showRT = localStorage.getItem('maxsm_ratings_show_rt') !== 'false';
            var showMC = localStorage.getItem('maxsm_ratings_show_mc') !== 'false';
            var showAwards = localStorage.getItem('maxsm_ratings_show_awards') !== 'false';
            var showOscar = localStorage.getItem('maxsm_ratings_show_oscars') !== 'false';
            var showEmmy = false;
            var showColors = localStorage.getItem('maxsm_ratings_colors') === 'true';

            function upsertNumberRate(className, value, label, opts) {
                var existing = $('.' + className, rateLine);
                var enabled = opts && opts.enabled;
                var okValue = value != null && value !== '' && !isNaN(value) && (!opts || !opts.min || value >= opts.min);
                if (!enabled || !okValue) {
                    if (existing.length) existing.remove();
                    return;
                }
                if (!existing.length) {
                    var el = $('<div class="full-start__rate ' + className + '"><div></div><div class="source--name"></div></div>');
                    if (opts && opts.gold) el.addClass('rate--gold');
                    el.find('> div').eq(1).text(label);
                    if (className === 'rate--rt') {
                        if (lastRate.length) el.insertAfter(lastRate);
                        else rateLine.append(el);
                    } else if (className === 'rate--mc') {
                        var afterRt = $('.rate--rt', rateLine);
                        if (afterRt.length) el.insertAfter(afterRt);
                        else if (lastRate.length) el.insertAfter(lastRate);
                        else rateLine.prepend(el);
                    } else {
                        rateLine.prepend(el);
                    }
                    existing = el;
                }
                existing.find('> div').eq(0).text(value);
                if (opts && opts.gold) {
                    if (showColors) existing.addClass('rate--gold');
                    else existing.removeClass('rate--gold');
                }
            }

            upsertNumberRate('rate--rt', rtRating, 'Tomatoes', { enabled: showRT });
            upsertNumberRate('rate--mc', mcRating, 'Metacritic', { enabled: showMC });
            upsertNumberRate('rate--awards', awards, (Lampa.Lang ? Lampa.Lang.translate('maxsm_ratings_awards') : 'Awards'), { enabled: showAwards, gold: true, min: 1 });
            upsertNumberRate('rate--oscars', oscars, (Lampa.Lang ? Lampa.Lang.translate('maxsm_ratings_oscars') : 'Oscar'), { enabled: showOscar, gold: true, min: 1 });
            upsertNumberRate('rate--emmy', emmy, (Lampa.Lang ? Lampa.Lang.translate('maxsm_ratings_emmy') : 'Emmy'), { enabled: showEmmy, gold: true, min: 1 });
        }

        function reorderRateLine(render) {
            if (!render) return;
            var rateLine = $('.full-start-new__rate-line', render).first();
            if (!rateLine.length) return;

            var order = ['rate--tmdb', 'rate--imdb', 'rate--kp', 'rate--rt', 'rate--mc', 'rate--oscars', 'rate--awards', 'rate--avg'];
            var status = rateLine.find('.full-start__status').detach();

            for (var i = 0; i < order.length; i++) {
                var el = rateLine.find('.' + order[i]).first();
                if (el.length) rateLine.append(el.detach());
            }

            if (status.length) rateLine.append(status);
        }

        function calculateAverageRating(render) {
            if (!render) return;
            var rateLine = $('.full-start-new__rate-line', render);
            if (!rateLine.length) return;

            $('.full-start__rate', rateLine).show();

            var ratings = {
                imdb: parseFloat($('.rate--imdb div:first', rateLine).text()) || 0,
                tmdb: parseFloat($('.rate--tmdb div:first', rateLine).text()) || 0,
                kp: parseFloat($('.rate--kp div:first', rateLine).text()) || 0,
                mc: (parseFloat($('.rate--mc div:first', rateLine).text()) || 0) / 10,
                rt: (parseFloat($('.rate--rt div:first', rateLine).text()) || 0) / 10
            };

            var totalWeight = 0;
            var weightedSum = 0;
            var ratingsCount = 0;

            for (var key in ratings) {
                if (ratings.hasOwnProperty(key) && !isNaN(ratings[key]) && ratings[key] > 0) {
                    weightedSum += ratings[key] * WEIGHTS[key];
                    totalWeight += WEIGHTS[key];
                    ratingsCount++;
                }
            }

            $('.rate--avg', rateLine).remove();

            var mode = parseInt(localStorage.getItem('maxsm_ratings_mode'), 10);
            var showTotal = localStorage.getItem('maxsm_ratings_show_total') !== 'false';
            if (showTotal && totalWeight > 0 && (ratingsCount > 1 || mode === 1) && mode !== 2) {
                var averageRating = (weightedSum / totalWeight).toFixed(1);
                var colorClass = getRatingClass(averageRating);
                var avgLabel = (Lampa.Lang ? Lampa.Lang.translate('maxsm_ratings_avg') : 'TOTAL');

                if (mode === 1) {
                    avgLabel = (Lampa.Lang ? Lampa.Lang.translate('maxsm_ratings_avg_simple') : 'Rating');
                    $('.full-start__rate', rateLine).not('.rate--oscars, .rate--avg, .rate--awards').hide();
                }

                var avgElement = $('<div class="full-start__rate rate--avg ' + colorClass + '"><div>' + averageRating + '</div><div class="source--name">' + avgLabel + '</div></div>');
                if (localStorage.getItem('maxsm_ratings_colors') !== 'true') avgElement.removeClass(colorClass);
                var status = rateLine.find('.full-start__status').first();
                if (status.length) avgElement.insertBefore(status);
                else rateLine.append(avgElement);
            }
        }

        function showRatingsModal(render) {
            if (!render || !Lampa.Modal) return;
            var rateLine = $('.full-start-new__rate-line', render);
            if (!rateLine.length) return;
            
            var showColors = localStorage.getItem('maxsm_ratings_colors') === 'true';
            var modalContent = $('<div class="maxsm-modal-ratings"></div>');
            
            function isNumericText(txt) {
                if (!txt) return false;
                var cleaned = String(txt).trim().replace(',', '.');
                var n = parseFloat(cleaned);
                return !isNaN(n) && isFinite(n);
            }
            
            function extractValue(element) {
                if (!element || !element.length) return '';
                var divs = element.children('div');
                for (var i = 0; i < divs.length; i++) {
                    var t = divs.eq(i).text().trim();
                    if (isNumericText(t)) return t;
                }
                var fallback = element.children().eq(0).text();
                return (fallback || '').trim();
            }
            
            var ratingOrder = [
                'rate--tmdb',
                'rate--imdb',
                'rate--kp',
                'rate--rt',
                'rate--mc',
                'rate--oscars',
                'rate--awards',
                'rate--avg'
            ];
            
            for (var i = 0; i < ratingOrder.length; i++) {
                var className = ratingOrder[i];
                var element = $('.' + className, rateLine);
                if (!element.length) continue;
                if (element.hasClass('hide') || !element.is(':visible')) continue;
                
                var value = extractValue(element);
                if (!value) continue;
                
                var numericValue = parseFloat(String(value).replace(',', '.'));
                var label = '';
                
                switch (className) {
                    case 'rate--avg':
                        label = Lampa.Lang ? Lampa.Lang.translate('maxsm_ratings_mode') : 'Средний рейтинг';
                        break;
                    case 'rate--oscars':
                        label = Lampa.Lang ? Lampa.Lang.translate('maxsm_ratings_oscars') : 'Оскар';
                        break;
                    case 'rate--emmy':
                        label = Lampa.Lang ? Lampa.Lang.translate('maxsm_ratings_emmy') : 'Эмми';
                        break;
                    case 'rate--awards':
                        label = Lampa.Lang ? Lampa.Lang.translate('maxsm_ratings_awards') : 'Награды';
                        break;
                    case 'rate--tmdb':
                        label = 'TMDB';
                        break;
                    case 'rate--imdb':
                        label = 'IMDb';
                        break;
                    case 'rate--kp':
                        label = 'Кинопоиск';
                        break;
                    case 'rate--rt':
                        label = 'Rotten Tomatoes';
                        break;
                    case 'rate--mc':
                        label = 'Metacritic';
                        break;
                }
                
                var item = $('<div class="maxsm-modal-rating-line"></div>');
                if (showColors) {
                    if (className === 'rate--avg') {
                        var colorClass = getRatingClass(numericValue);
                        if (colorClass) item.addClass(colorClass);
                    } else {
                        item.addClass('maxsm-modal-' + className.replace('rate--', ''));
                    }
                }
                
                item.text(value + ' - ' + label);
                modalContent.append(item);
            }
            
            Lampa.Modal.open({
                title: Lampa.Lang ? Lampa.Lang.translate('maxsm_ratings_avg_simple') : 'Оценка',
                html: modalContent,
                width: 600,
                onBack: function () {
                    Lampa.Modal.close();
                    if (Lampa.Controller) Lampa.Controller.toggle('content');
                    return true;
                }
            });
        }

        function insertIcons(render) {
            if (!render) return;
            var showIcons = localStorage.getItem('maxsm_ratings_icons') === 'true';

            function isNumericText(txt) {
                if (!txt) return false;
                var cleaned = String(txt).trim().replace(',', '.');
                var n = parseFloat(cleaned);
                return !isNaN(n) && isFinite(n);
            }

            function apply(className, svg) {
                var Element = $('.' + className, render);
                if (!Element.length) return;
                Element.find('.maxsm-icon-container').remove();

                if (showIcons) {
                    var target = Element.find('.source--name');
                    if (!target.length) {
                        var childDivs = Element.children('div');
                        if (childDivs.length >= 2) {
                            var t0 = childDivs.eq(0).text().trim();
                            var t1 = childDivs.eq(1).text().trim();
                            if (isNumericText(t0) && !isNumericText(t1)) target = childDivs.eq(1);
                            else if (isNumericText(t1) && !isNumericText(t0)) target = childDivs.eq(0);
                            else target = childDivs.eq(1);
                        }
                    }

                    if (target.length) {
                        var iconWrap = $('<div></div>');
                        iconWrap.addClass('maxsm-icon-container');
                        iconWrap.html(svg);
                        if (!target.data('original-html')) target.data('original-html', target.html());
                        target.html(iconWrap);
                        target.addClass('rate--icon');
                    }
                } else {
                    var t = Element.find('.rate--icon');
                    if (t.length && t.data('original-html')) {
                        t.html(t.data('original-html'));
                        t.removeClass('rate--icon');
                        t.removeData('original-html');
                    }
                }
            }

            apply('rate--imdb', imdb_svg);
            apply('rate--kp', kp_svg);
            apply('rate--tmdb', tmdb_svg);
            apply('rate--oscars', awards_svg);
            apply('rate--emmy', awards_svg);
            apply('rate--awards', awards_svg);
            apply('rate--rt', rt_svg);
            apply('rate--mc', mc_svg);
            apply('rate--avg', avg_svg);
        }

        function updateQualityElement(text, render) {
            if (!render) return;
            var rateLine = $('.full-start-new__rate-line', render);
            if (!rateLine.length) return;
            var element = $('.full-start__status.maxsm-quality', render);
            if (element.length) element.text(text);
            else {
                var div = document.createElement('div');
                div.className = 'full-start__status maxsm-quality';
                div.textContent = text;
                rateLine.append(div);
            }
        }

        function syncQualityFromJacred(card, render) {
            if (!render) return;
            if (localStorage.getItem('maxsm_ratings_quality') !== 'true') return;
            var type = getCardType(card);
            if (type === 'tv' && localStorage.getItem('maxsm_ratings_quality_tv') === 'false') return;
            if (!window.FLIXIO_GET_BEST_JACRED) return;
            updateQualityElement('...', render);
            window.FLIXIO_GET_BEST_JACRED(card, function (data) {
                if (!data || data.empty) return;
                var resText = data.resolution || '';
                if (resText === 'FHD') resText = '1080p';
                else if (resText === 'HD') resText = '720p';
                else if (resText === '4K') resText = '4K';
                else if (resText === '2K') resText = '2K';
                if (!resText) return;
                if (data.hdr) resText = resText + (data.dolbyVision ? ' DV' : ' HDR');
                updateQualityElement(resText, render);
            });
        }

        function fetchAdditionalRatings(card, render) {
            if (!render || !card || !card.id) return;
            var localCurrentCard = card.id;

            var normalizedCard = {
                id: card.id,
                tmdb: card.vote_average || null,
                kinopoisk_id: card.kinopoisk_id,
                imdb_id: card.imdb_id || card.imdb || null,
                title: card.title || card.name || '',
                original_title: card.original_title || card.original_name || '',
                type: getCardType(card),
                release_date: card.release_date || card.first_air_date || ''
            };

            var rateLine = $('.full-start-new__rate-line.applecation__ratings', render);
            if (!rateLine.length) {
                var insertPoint = $('.applecation__meta', render);
                if (!insertPoint.length) insertPoint = $('.full-start-new__title', render);
                if (!insertPoint.length) insertPoint = $(render);

                rateLine = $('<div class="full-start-new__rate-line applecation__ratings show"></div>');
                rateLine.append('<div class="full-start__rate rate--tmdb"><div></div><div class="source--name">TMDB</div></div>');
                rateLine.append('<div class="full-start__rate rate--imdb hide"><div></div><div class="source--name">IMDb</div></div>');
                rateLine.append('<div class="full-start__rate rate--kp hide"><div></div><div class="source--name">Кинопоиск</div></div>');
                rateLine.append('<div class="full-start__status hide"></div>');
                rateLine.insertAfter(insertPoint);
            }
            else if (!$('.rate--tmdb', rateLine).length) {
                rateLine.append('<div class="full-start__rate rate--tmdb"><div></div><div class="source--name">TMDB</div></div>');
                rateLine.append('<div class="full-start__rate rate--imdb hide"><div></div><div class="source--name">IMDb</div></div>');
                rateLine.append('<div class="full-start__rate rate--kp hide"><div></div><div class="source--name">Кинопоиск</div></div>');
                rateLine.append('<div class="full-start__status hide"></div>');
            }

            if (rateLine.length) {
                var tmdbEl = $('.rate--tmdb', render);
                if (tmdbEl.length && normalizedCard.tmdb && !isNaN(normalizedCard.tmdb)) {
                    tmdbEl.removeClass('hide').find('> div').eq(0).text(parseFloat(normalizedCard.tmdb).toFixed(1));
                }
                rateLine.addClass('done');
                addLoadingAnimation(render);
            }

            syncQualityFromJacred(card, render);

            var cacheKey = normalizedCard.type + '_' + (normalizedCard.imdb_id || normalizedCard.id);
            var cachedData = getOmdbCache(cacheKey);
            var cachedKpData = getKpCache(cacheKey);
            var ratingsData = {};
            ratingsData.tmdb = normalizedCard.tmdb;

            if (cachedKpData) {
                ratingsData.kp = cachedKpData.kp;
                ratingsData.imdb_kp = cachedKpData.imdb;
            }

            if (cachedData) {
                ratingsData.rt = cachedData.rt;
                ratingsData.mc = cachedData.mc;
                ratingsData.imdb = cachedData.imdb;
                ratingsData.ageRating = cachedData.ageRating;
                ratingsData.oscars = cachedData.oscars;
                ratingsData.emmy = cachedData.emmy;
                ratingsData.awards = cachedData.awards;
            }

            renderNow();

            var pending = 0;
            function startPending() { pending++; }
            function endPending() {
                pending = Math.max(0, pending - 1);
                if (pending === 0) finalizeUI();
            }

            if (!cachedKpData) {
                startPending();
                getKPRatings(normalizedCard, getRandomToken(KP_API_KEYS), localCurrentCard, function (kpRatings) {
                    if (kpRatings) {
                        ratingsData.kp = kpRatings.kinopoisk || null;
                        ratingsData.imdb_kp = kpRatings.imdb || null;
                        saveKpCache(cacheKey, { kp: ratingsData.kp, imdb: ratingsData.imdb_kp });
                    }
                    renderNow();
                    endPending();
                });
            }

            if (!cachedData) {
                startPending();
                if (normalizedCard.imdb_id) {
                    fetchOmdbRatings(normalizedCard, localCurrentCard, function (omdbData) {
                        if (omdbData) {
                            ratingsData.rt = omdbData.rt;
                            ratingsData.mc = omdbData.mc;
                            ratingsData.imdb = omdbData.imdb;
                            ratingsData.ageRating = omdbData.ageRating;
                            ratingsData.oscars = omdbData.oscars;
                            ratingsData.emmy = omdbData.emmy;
                            ratingsData.awards = omdbData.awards;
                            saveOmdbCache(cacheKey, omdbData);
                        }
                        renderNow();
                        endPending();
                    });
                } else {
                    getImdbIdFromTmdb(normalizedCard.id, normalizedCard.type, localCurrentCard, function (newImdbId) {
                        if (newImdbId) {
                            normalizedCard.imdb_id = newImdbId;
                            cacheKey = normalizedCard.type + '_' + newImdbId;
                            fetchOmdbRatings(normalizedCard, localCurrentCard, function (omdbData) {
                                if (omdbData) {
                                    ratingsData.rt = omdbData.rt;
                                    ratingsData.mc = omdbData.mc;
                                    ratingsData.imdb = omdbData.imdb;
                                    ratingsData.ageRating = omdbData.ageRating;
                                    ratingsData.oscars = omdbData.oscars;
                                    ratingsData.emmy = omdbData.emmy;
                                    ratingsData.awards = omdbData.awards;
                                    saveOmdbCache(cacheKey, omdbData);
                                }
                                renderNow();
                                endPending();
                            });
                        } else {
                            renderNow();
                            endPending();
                        }
                    });
                }
            }

            if (pending === 0) finalizeUI();

            function renderNow() {
                try { render.data('maxsm_ratings_data', ratingsData); } catch (e) { }
                insertRatings(ratingsData.rt, ratingsData.mc, ratingsData.oscars, ratingsData.awards, ratingsData.emmy, render);
                updateHiddenElements(ratingsData, render);
                calculateAverageRating(render);
                insertIcons(render);
                reorderRateLine(render);
                $('.full-start__rate', render).off('click.maxsm-ratings-modal').on('click.maxsm-ratings-modal', function (e) {
                    e.stopPropagation();
                    showRatingsModal(render);
                });
                rateLine.css('visibility', 'visible');
            }

            function finalizeUI() {
                removeLoadingAnimation(render);
            }
        }

        function refreshActiveFullRatings() {
            try {
                var act = Lampa.Activity && Lampa.Activity.active && Lampa.Activity.active();
                if (!act || act.component !== 'full') return;
                var render = act.activity && act.activity.render && act.activity.render();
                if (!render) return;
                var data = render.data ? render.data('maxsm_ratings_data') : null;
                if (!data) data = {};
                insertRatings(data.rt, data.mc, data.oscars, data.awards, data.emmy, render);
                updateHiddenElements(data, render);
                calculateAverageRating(render);
                insertIcons(render);
                reorderRateLine(render);
            } catch (e) { }
        }

        if (Lampa.SettingsApi && Lampa.SettingsApi.addComponent) {
            Lampa.SettingsApi.addComponent({ component: 'maxsm_ratings', name: (Lampa.Lang ? Lampa.Lang.translate('maxsm_ratings') : 'Рейтинг и качество'), icon: star_svg });

            var modeValue = {};
            modeValue[0] = Lampa.Lang ? Lampa.Lang.translate('maxsm_ratings_mode_normal') : 'Показывать средний рейтинг';
            modeValue[1] = Lampa.Lang ? Lampa.Lang.translate('maxsm_ratings_mode_simple') : 'Только средний рейтинг';
            modeValue[2] = Lampa.Lang ? Lampa.Lang.translate('maxsm_ratings_mode_noavg') : 'Без среднего рейтинга';

            Lampa.SettingsApi.addParam({
                component: 'maxsm_ratings',
                param: { name: 'maxsm_ratings_mode', type: 'select', values: modeValue, default: 0 },
                field: { name: Lampa.Lang ? Lampa.Lang.translate('maxsm_ratings_mode') : 'Средний рейтинг', description: '' },
                onChange: function () { refreshActiveFullRatings(); }
            });

            Lampa.SettingsApi.addParam({
                component: 'maxsm_ratings',
                param: { name: 'maxsm_ratings_awards', type: 'trigger', default: true },
                field: { name: Lampa.Lang ? Lampa.Lang.translate('maxsm_ratings_awards') : 'Награды', description: '' },
                onChange: function () { refreshActiveFullRatings(); }
            });

            Lampa.SettingsApi.addParam({
                component: 'maxsm_ratings',
                param: { name: 'maxsm_ratings_critic', type: 'trigger', default: true },
                field: { name: Lampa.Lang ? Lampa.Lang.translate('maxsm_ratings_critic') : 'Оценки критиков', description: '' },
                onChange: function () { refreshActiveFullRatings(); }
            });

            Lampa.SettingsApi.addParam({
                component: 'maxsm_ratings',
                param: { name: 'maxsm_ratings_show_total', type: 'trigger', default: true },
                field: { name: Lampa.Lang ? Lampa.Lang.translate('maxsm_ratings_show_total') : 'Итог', description: '' },
                onChange: function () { refreshActiveFullRatings(); }
            });

            Lampa.SettingsApi.addParam({
                component: 'maxsm_ratings',
                param: { name: 'maxsm_ratings_show_oscars', type: 'trigger', default: true },
                field: { name: Lampa.Lang ? Lampa.Lang.translate('maxsm_ratings_show_oscars') : 'Оскар', description: '' },
                onChange: function () { refreshActiveFullRatings(); }
            });

            Lampa.SettingsApi.addParam({
                component: 'maxsm_ratings',
                param: { name: 'maxsm_ratings_show_awards', type: 'trigger', default: true },
                field: { name: Lampa.Lang ? Lampa.Lang.translate('maxsm_ratings_show_awards') : 'Награды', description: '' },
                onChange: function () { refreshActiveFullRatings(); }
            });

            Lampa.SettingsApi.addParam({
                component: 'maxsm_ratings',
                param: { name: 'maxsm_ratings_show_tmdb', type: 'trigger', default: true },
                field: { name: Lampa.Lang ? Lampa.Lang.translate('maxsm_ratings_show_tmdb') : 'TMDB', description: '' },
                onChange: function () { refreshActiveFullRatings(); }
            });

            Lampa.SettingsApi.addParam({
                component: 'maxsm_ratings',
                param: { name: 'maxsm_ratings_show_imdb', type: 'trigger', default: true },
                field: { name: Lampa.Lang ? Lampa.Lang.translate('maxsm_ratings_show_imdb') : 'IMDB', description: '' },
                onChange: function () { refreshActiveFullRatings(); }
            });

            Lampa.SettingsApi.addParam({
                component: 'maxsm_ratings',
                param: { name: 'maxsm_ratings_show_kp', type: 'trigger', default: true },
                field: { name: Lampa.Lang ? Lampa.Lang.translate('maxsm_ratings_show_kp') : 'Кинопоиск', description: '' },
                onChange: function () { refreshActiveFullRatings(); }
            });

            Lampa.SettingsApi.addParam({
                component: 'maxsm_ratings',
                param: { name: 'maxsm_ratings_show_rt', type: 'trigger', default: true },
                field: { name: Lampa.Lang ? Lampa.Lang.translate('maxsm_ratings_show_rt') : 'Tomatoes', description: '' },
                onChange: function () { refreshActiveFullRatings(); }
            });

            Lampa.SettingsApi.addParam({
                component: 'maxsm_ratings',
                param: { name: 'maxsm_ratings_show_mc', type: 'trigger', default: true },
                field: { name: Lampa.Lang ? Lampa.Lang.translate('maxsm_ratings_show_mc') : 'Metacritic', description: '' },
                onChange: function () { refreshActiveFullRatings(); }
            });

            Lampa.SettingsApi.addParam({
                component: 'maxsm_ratings',
                param: { name: 'maxsm_ratings_colors', type: 'trigger', default: false },
                field: { name: Lampa.Lang ? Lampa.Lang.translate('maxsm_ratings_colors') : 'Цвета', description: '' },
                onChange: function () { refreshActiveFullRatings(); }
            });

            Lampa.SettingsApi.addParam({
                component: 'maxsm_ratings',
                param: { name: 'maxsm_ratings_icons', type: 'trigger', default: false },
                field: { name: Lampa.Lang ? Lampa.Lang.translate('maxsm_ratings_icons') : 'Значки', description: '' },
                onChange: function () {
                    try {
                        var act = Lampa.Activity.active();
                        if (!act || act.component !== 'full') return;
                        var render = act.activity && act.activity.render && act.activity.render();
                        insertIcons(render);
                    } catch (e) { }
                }
            });

            Lampa.SettingsApi.addParam({
                component: 'maxsm_ratings',
                param: { name: 'maxsm_ratings_quality', type: 'trigger', default: true },
                field: { name: Lampa.Lang ? Lampa.Lang.translate('maxsm_ratings_quality') : 'Качество внутри карточек', description: '' },
                onChange: function () { }
            });

            Lampa.SettingsApi.addParam({
                component: 'maxsm_ratings',
                param: { name: 'maxsm_ratings_quality_inlist', type: 'trigger', default: true },
                field: { name: Lampa.Lang ? Lampa.Lang.translate('maxsm_ratings_quality_inlist') : 'Качество на карточках', description: '' },
                onChange: function (value) {
                    if (window.FLIXIO_TOGGLE_JACRED_CARD_MARKS) window.FLIXIO_TOGGLE_JACRED_CARD_MARKS(value === 'true');
                }
            });

            Lampa.SettingsApi.addParam({
                component: 'maxsm_ratings',
                param: { name: 'maxsm_ratings_quality_tv', type: 'trigger', default: true },
                field: { name: Lampa.Lang ? Lampa.Lang.translate('maxsm_ratings_quality_tv') : 'Качество для сериалов', description: '' },
                onChange: function () { }
            });

            Lampa.SettingsApi.addParam({
                component: 'maxsm_ratings',
                param: { name: 'maxsm_ratings_cc', type: 'button' },
                field: { name: Lampa.Lang ? Lampa.Lang.translate('maxsm_ratings_cc') : 'Очистить локальный кеш' },
                onChange: function () {
                    localStorage.removeItem(OMDB_CACHE);
                    localStorage.removeItem(KP_CACHE);
                    localStorage.removeItem(ID_MAPPING_CACHE);
                    window.location.reload();
                }
            });
        }

        if (Lampa.Listener && Lampa.Listener.follow) {
            Lampa.Listener.follow('full', function (e) {
                if (e.type !== 'complite') return;
                var render = e.object && e.object.activity && e.object.activity.render && e.object.activity.render();
                var movie = e.data && e.data.movie;
                fetchAdditionalRatings(movie, render);
            });
        }

        window.maxsmRatingsPlugin = true;
    }

    function initKinoogladModule() {
        if (window.plugin_kinoohlyad_ready) return;
        window.plugin_kinoohlyad_ready = true;
        
        // Только очищаем старые каналы по умолчанию, не трогаем пользовательские
        console.log('Kinooglad: Checking for old default channels');
        
        var KINO_CHANNEL_I18N_KEYS = {};

        function getKinoChannelDisplayName(channel) {
            if (!channel || !channel.id) return channel && channel.name ? channel.name : tr('kino_channel_generic');
            var key = KINO_CHANNEL_I18N_KEYS[String(channel.id).trim()];
            if (!key) return channel.name || tr('kino_channel_generic');
            var localized = tr(key);
            return localized || channel.name || tr('kino_channel_generic');
        }

        var KinoApi = {
            proxies: [
                'https://api.codetabs.com/v1/proxy?quest=',
                'https://thingproxy.freeboard.io/fetch/',
                'https://corsproxy.io/?url=',
                'https://api.allorigins.win/raw?url=',
                'https://api.allorigins.win/get?url=',
                'https://cors.isomorphic-git.org/',
                'https://yacdn.org/proxy/'
            ],
            // Порядок: за наявністю нового відео (сортування в main()). ID відповідають @нікам.
            defaultChannels: [],
            getChannels: function () {
                var stored = Lampa.Storage.get('kino_channels', '[]');
                var channels;
                if (typeof stored === 'string') {
                    try {
                        channels = JSON.parse(stored);
                    } catch (e) {
                        return this.defaultChannels.slice();
                    }
                } else if (Array.isArray(stored)) {
                    channels = stored;
                } else {
                    return this.defaultChannels.slice();
                }
                
                if (!channels || !channels.length) return this.defaultChannels.slice();
                var seen = {};
                channels = channels.filter(function (c) {
                    var id = String(c.id).trim().toLowerCase();
                    if (seen[id]) return false;
                    seen[id] = true;
                    return true;
                });
                return channels;
            },
            saveChannels: function (channels) {
                Lampa.Storage.set('kino_channels', channels);
            },
            resolveHandleToChannelId: function (handle, callback) {
                var _this = this;
                var cleanHandle = String(handle).trim().replace(/^@/, '');
                var pageUrl = 'https://www.youtube.com/@' + encodeURIComponent(cleanHandle);
                var encodedPage = encodeURIComponent(pageUrl);
                var tried = 0;

                console.log('Kinooglad: Resolving handle @' + cleanHandle);

                function tryProxy(idx) {
                    if (idx >= _this.proxies.length) {
                        console.error('Kinooglad: All proxies failed for handle @' + cleanHandle);
                        callback(new Error('resolve_failed'));
                        return;
                    }
                    var proxy = _this.proxies[idx];
                    var url = proxy + (proxy.indexOf('corsproxy') > -1 ? pageUrl : encodedPage);
                    console.log('Kinooglad: Trying proxy ' + (idx + 1) + '/' + _this.proxies.length + ': ' + proxy);
                    
                    $.get(url).done(function (html) {
                        var str = typeof html === 'string' ? html : (html && html.contents) ? html.contents : '';
                        var m = str.match(/"externalId"\s*:\s*"(UC[\w-]{22})"/) ||
                            str.match(/"channelId"\s*:\s*"(UC[\w-]{22})"/) ||
                            str.match(/youtube\.com\/channel\/(UC[\w-]{22})/);
                        if (m && m[1]) {
                            console.log('Kinooglad: Successfully resolved @' + cleanHandle + ' to ' + m[1]);
                            callback(null, { id: m[1], name: cleanHandle });
                        } else {
                            console.log('Kinooglad: Proxy ' + (idx + 1) + ' failed to find channel ID');
                            tryProxy(idx + 1);
                        }
                    }).fail(function (xhr, status, error) { 
                        console.log('Kinooglad: Proxy ' + (idx + 1) + ' request failed: ' + status + ' ' + error);
                        tryProxy(idx + 1); 
                    });
                }
                tryProxy(0);
            },
            resolveVideoToChannelId: function (videoId, callback) {
                var _this = this;
                var cleanId = String(videoId).trim();
                if (!cleanId) return callback(new Error('no_video_id'));

                console.log('Kinooglad: Resolving video ID ' + cleanId);

                var pageUrl = 'https://www.youtube.com/watch?v=' + encodeURIComponent(cleanId);
                var encodedPage = encodeURIComponent(pageUrl);

                function tryProxy(idx) {
                    if (idx >= _this.proxies.length) {
                        console.error('Kinooglad: All proxies failed for video ' + cleanId);
                        callback(new Error('resolve_failed'));
                        return;
                    }
                    var proxy = _this.proxies[idx];
                    var url = proxy + (proxy.indexOf('corsproxy') > -1 ? pageUrl : encodedPage);
                    console.log('Kinooglad: Trying proxy ' + (idx + 1) + '/' + _this.proxies.length + ' for video');
                    
                    $.get(url).done(function (html) {
                        var str = typeof html === 'string' ? html : (html && html.contents) ? html.contents : '';
                        var m = str.match(/"channelId"\s*:\s*"(UC[\w-]{22})"/);
                        if (m && m[1]) {
                            var nameMatch = str.match(/"ownerChannelName"\s*:\s*"(.*?)"/);
                            var name = nameMatch && nameMatch[1] ? nameMatch[1] : cleanId;
                            console.log('Kinooglad: Successfully resolved video ' + cleanId + ' to channel ' + m[1]);
                            callback(null, { id: m[1], name: name });
                        } else {
                            console.log('Kinooglad: Proxy ' + (idx + 1) + ' failed to find channel ID for video');
                            tryProxy(idx + 1);
                        }
                    }).fail(function (xhr, status, error) { 
                        console.log('Kinooglad: Proxy ' + (idx + 1) + ' request failed for video: ' + status + ' ' + error);
                        tryProxy(idx + 1); 
                    });
                }
                tryProxy(0);
            },
            fetch: function (channel, oncomplite, onerror, page) {
                var _this = this;
                var id = String(channel.id).trim();
                var cacheKey = 'channel_' + id + (page ? '_page_' + page : '');
                var pageNum = page || 1;
                
                // Используем YouTube API для получения большего количества видео
                var apiKey = 'AIzaSyCEJidZhNYFlXk6aFSdJzsolqj55dXadTM'; // Правильный YouTube Data API v3 ключ
                return this.fetchWithYouTubeAPI(channel.id, apiKey, pageNum, oncomplite, onerror, cacheKey);
            },
            
            fetchWithYouTubeAPI: function(channelId, apiKey, page, oncomplite, onerror, cacheKey) {
                var _this = this;
                var cacheObj = _this.cache;
                var pageNum = page || 1;
                
                // Проверяем кэш
                if (cacheObj) {
                    var cached = cacheObj.get(cacheKey);
                    if (cached) {
                        console.log('Kinooglad: YouTube API cache hit for page ' + pageNum);
                        oncomplite(cached);
                        return;
                    }
                }
                
                // Возвращаемся к RSS методу как запасной вариант - он более надежный
                return this.fetchWithRSS({id: channelId, name: 'Channel'}, pageNum, oncomplite, onerror, cacheKey);
            },
            
            fetchWithRSS: function(channel, pageNum, oncomplite, onerror, cacheKey) {
                var _this = this;
                var id = String(channel.id).trim();
                var page = pageNum || 1;
                var cacheKey = cacheKey || ('channel_' + id + (page ? '_page_' + page : ''));
                
                // Проверяем что кэш существует
                if (!_this.cache) {
                    console.log('Kinooglad: Cache object not found, skipping cache');
                    var isChannelId = /^UC[\w-]{22}$/.test(id);
                    var feedUrl = isChannelId 
                        ? 'https://www.youtube.com/feeds/videos.xml?channel_id=' + id
                        : 'https://www.youtube.com/feeds/videos.xml?user=' + id.replace(/^@/, '');
                    
                    // Загружаем напрямую без кэша
                    var encodedUrl = encodeURIComponent(feedUrl);
                    function tryDirectFetch(index) {
                        if (index >= _this.proxies.length) {
                            console.log('Kinooglad: All proxies failed for ' + channel.name);
                            onerror();
                            return;
                        }
                        var currentProxy = _this.proxies[index];
                        var fetchUrl = currentProxy.indexOf('quest=') > -1 
                            ? currentProxy + encodedUrl 
                            : currentProxy.indexOf('fetch/') > -1 
                                ? currentProxy + encodedUrl
                                : currentProxy + encodedUrl;
                        console.log('Kinooglad: Trying proxy ' + (index + 1) + '/' + _this.proxies.length + ' for ' + channel.name + ' (no cache)');
                        
                        $.get(fetchUrl, function (data) {
                            var raw = typeof data === 'string' ? data : (data && typeof data.contents === 'string') ? data.contents : '';
                            var str = (raw || (typeof data === 'string' ? data : '')).trim();
                            if (str && str.indexOf('<?xml') !== 0 && str.indexOf('<feed') !== 0) {
                                if (str.indexOf('<!DOCTYPE') !== -1 || str.indexOf('<html') !== -1) {
                                    return tryDirectFetch(index + 1);
                                }
                            }
                            var items = [];
                            var xml;
                            try {
                                xml = typeof data === 'string' ? $.parseXML(data) : (data && data.documentElement) ? data : $.parseXML(raw || String(data || ''));
                            } catch (e) {
                                return tryDirectFetch(index + 1);
                            }
                            if (!xml || !$(xml).find('entry').length) {
                                return tryDirectFetch(index + 1);
                            }
                            $(xml).find('entry').each(function () {
                                var $el = $(this);
                                var mediaGroup = $el.find('media\\:group, group');
                                var thumb = mediaGroup.find('media\\:thumbnail, thumbnail').attr('url');
                                var videoId = $el.find('yt\\:videoId, videoId').text();
                                var link = $el.find('link').attr('href');
                                var title = $el.find('title').text();
                                if (link && link.indexOf('/shorts/') > -1) return;
                                if (title && title.toLowerCase().indexOf('#shorts') > -1) return;
                                items.push({
                                    title: title,
                                    img: thumb,
                                    video_id: videoId,
                                    release_date: ($el.find('published').text() || '').split('T')[0],
                                    vote_average: 0
                                });
                            });
                            
                            // Для пагинации: показываем все видео из RSS (обычно ~15)
                            var startIndex = (page - 1) * 15;
                            var endIndex = startIndex + 15;
                            var paginatedItems = items.slice(startIndex, endIndex);
                            
                            if (paginatedItems.length) {
                                console.log('Kinooglad: Successfully loaded ' + paginatedItems.length + ' videos for ' + channel.name + ' (page ' + page + ')');
                                console.log('Kinooglad: Total RSS items: ' + items.length + ', showing range ' + startIndex + ' to ' + endIndex);
                                oncomplite(paginatedItems);
                            } else {
                                tryDirectFetch(index + 1);
                            }
                        }).fail(function () {
                            tryDirectFetch(index + 1);
                        });
                    }
                    tryDirectFetch(0);
                    return;
                }
                
                var cacheObj = _this.cache; // Сохраняем ссылку на кэш
                
                // Проверяем кэш сначала
                var cached = cacheObj.get(cacheKey);
                if (cached) {
                    console.log('Kinooglad: Cache hit for ' + channel.name + ' (page ' + page + ')');
                    oncomplite(cached);
                    return;
                }

                var isChannelId = /^UC[\w-]{22}$/.test(id);

                function doFetch(feedUrl) {
                    var url = feedUrl;
                    var encodedUrl = encodeURIComponent(url);
                    var fetchStartTime = Date.now();

                    function tryFetch(index) {
                        if (index >= _this.proxies.length) {
                            console.log('Kinoohlyad: All proxies failed for ' + channel.name);
                            onerror();
                            return;
                        }

                        var currentProxy = _this.proxies[index];
                        var fetchUrl = currentProxy.indexOf('quest=') > -1 
                            ? currentProxy + encodedUrl 
                            : currentProxy.indexOf('fetch/') > -1 
                                ? currentProxy + encodedUrl
                                : currentProxy + encodedUrl;
                        console.log('Kinooglad: Trying proxy ' + (index + 1) + '/' + _this.proxies.length + ' for ' + channel.name + ': ' + currentProxy);

                        var fetchStartTime = Date.now();
                        $.get(fetchUrl, function (data) {
                            var loadTime = Date.now() - fetchStartTime;
                            console.log('Kinooglad: Proxy ' + (index + 1) + ' responded in ' + loadTime + 'ms for ' + channel.name);
                            
                            var raw = typeof data === 'string' ? data : (data && typeof data.contents === 'string') ? data.contents : '';
                            var str = (raw || (typeof data === 'string' ? data : '')).trim();
                            if (str && str.indexOf('<?xml') !== 0 && str.indexOf('<feed') !== 0) {
                                if (str.indexOf('<!DOCTYPE') !== -1 || str.indexOf('<html') !== -1) {
                                    console.log('Kinooglad: Proxy ' + (index + 1) + ' returned HTML, trying next');
                                    return tryFetch(index + 1);
                                }
                            }
                            var items = [];
                            var xml;
                            try {
                                xml = typeof data === 'string' ? $.parseXML(data) : (data && data.documentElement) ? data : $.parseXML(raw || String(data || ''));
                            } catch (e) {
                                console.log('Kinooglad: Proxy ' + (index + 1) + ' XML parse error, trying next');
                                return tryFetch(index + 1);
                            }

                            if (!xml || !$(xml).find('entry').length) {
                                console.log('Kinooglad: Proxy ' + (index + 1) + ' no entries found, trying next');
                                return tryFetch(index + 1);
                            }

                            $(xml).find('entry').each(function () {
                                var $el = $(this);
                                var mediaGroup = $el.find('media\\:group, group');
                                var thumb = mediaGroup.find('media\\:thumbnail, thumbnail').attr('url');
                                var videoId = $el.find('yt\\:videoId, videoId').text();
                                var link = $el.find('link').attr('href');
                                var title = $el.find('title').text();

                                // Filter out Shorts
                                if (link && link.indexOf('/shorts/') > -1) return;
                                if (title && title.toLowerCase().indexOf('#shorts') > -1) return;

                                items.push({
                                    title: title,
                                    img: thumb,
                                    video_id: videoId,
                                    release_date: ($el.find('published').text() || '').split('T')[0],
                                    vote_average: 0
                                });
                            });

                            if (items.length) {
                                // Для пагинации: показываем больше видео на странице
                                var startIndex = (page - 1) * 15;
                                var endIndex = startIndex + 15;
                                var paginatedItems = items.slice(startIndex, endIndex);
                                
                                // Сохраняем в кэш на 15 минут
                                try {
                                    cacheObj.set(cacheKey, paginatedItems, 15);
                                    console.log('Kinooglad: Successfully loaded ' + paginatedItems.length + ' videos for ' + channel.name + ' via proxy ' + (index + 1) + ' (page ' + page + ')');
                                console.log('Kinooglad: Total videos in RSS feed:', items.length, '- showing page', page, 'videos', startIndex, 'to', endIndex);
                                } catch (e) {
                                    console.log('Kinooglad: Cache set error:', e);
                                }
                                oncomplite(paginatedItems);
                            } else {
                                console.log('Kinooglad: Proxy ' + (index + 1) + ' no videos found, trying next');
                                tryFetch(index + 1);
                            }
                        }).fail(function (xhr, status, error) { 
                            console.log('Kinooglad: Proxy ' + (index + 1) + ' request failed: ' + status + ' ' + error);
                            tryFetch(index + 1); 
                        });
                    }

                    tryFetch(0);
                }

                if (isChannelId) {
                    doFetch('https://www.youtube.com/feeds/videos.xml?channel_id=' + id);
                } else {
                    _this.resolveHandleToChannelId(id, function (err, resolved) {
                        if (!err && resolved && resolved.id) {
                            var ch = _this.getChannels();
                            for (var i = 0; i < ch.length; i++) {
                                if (String(ch[i].id).trim().toLowerCase() === id.toLowerCase()) {
                                    ch[i].id = resolved.id;
                                    _this.saveChannels(ch);
                                    break;
                                }
                            }
                            doFetch('https://www.youtube.com/feeds/videos.xml?channel_id=' + resolved.id);
                        } else {
                            doFetch('https://www.youtube.com/feeds/videos.xml?user=' + id.replace(/^@/, ''));
                        }
                    });
                }
            },
            fetchPlaylistItems: function (playlistId, oncomplite, onerror) {
                var _this = this;
                var pid = String(playlistId).trim();
                if (!pid) {
                    onerror();
                    return;
                }

                var url = 'https://www.youtube.com/feeds/videos.xml?playlist_id=' + encodeURIComponent(pid);
                var encodedUrl = encodeURIComponent(url);

                function tryFetch(index) {
                    if (index >= _this.proxies.length) {
                        onerror();
                        return;
                    }

                    var currentProxy = _this.proxies[index];
                    var fetchUrl = currentProxy.indexOf('quest=') > -1 
                        ? currentProxy + encodedUrl 
                        : currentProxy.indexOf('fetch/') > -1 
                            ? currentProxy + encodedUrl
                            : currentProxy + encodedUrl;

                    $.get(fetchUrl, function (data) {
                        var raw = typeof data === 'string' ? data : (data && typeof data.contents === 'string') ? data.contents : '';
                        var str = (raw || (typeof data === 'string' ? data : '')).trim();
                        if (str && str.indexOf('<?xml') !== 0 && str.indexOf('<feed') !== 0) {
                            if (str.indexOf('<!DOCTYPE') !== -1 || str.indexOf('<html') !== -1) {
                                return tryFetch(index + 1);
                            }
                        }
                        var items = [];
                        var xml;
                        try {
                            xml = typeof data === 'string' ? $.parseXML(data) : (data && data.documentElement) ? data : $.parseXML(raw || String(data || ''));
                        } catch (e) {
                            return tryFetch(index + 1);
                        }

                        if (!xml || !$(xml).find('entry').length) {
                            return tryFetch(index + 1);
                        }

                        $(xml).find('entry').each(function () {
                            var $el = $(this);
                            var mediaGroup = $el.find('media\\:group, group');
                            var thumb = mediaGroup.find('media\\:thumbnail, thumbnail').attr('url');
                            var videoId = $el.find('yt\\:videoId, videoId').text();
                            var link = $el.find('link').attr('href');
                            var title = $el.find('title').text();

                            if (link && link.indexOf('/shorts/') > -1) return;
                            if (title && title.toLowerCase().indexOf('#shorts') > -1) return;

                            items.push({
                                title: title,
                                img: thumb,
                                video_id: videoId,
                                release_date: ($el.find('published').text() || '').split('T')[0],
                                vote_average: 0
                            });
                        });

                        if (items.length) {
                            oncomplite(items);
                        } else {
                            tryFetch(index + 1);
                        }
                    }).fail(function () {
                        tryFetch(index + 1);
                    });
                }

                tryFetch(0);
            },
            fetchPlaylists: function (channel, oncomplite, onerror) {
                var _this = this;
                var rawId = String(channel.id).trim();
                if (!rawId) {
                    onerror();
                    return;
                }

                function handleChannelId(channelId) {
                    var pageUrl = 'https://www.youtube.com/channel/' + encodeURIComponent(channelId) + '/playlists';
                    var encodedPage = encodeURIComponent(pageUrl);

                    function tryProxy(index) {
                        if (index >= _this.proxies.length) {
                            onerror();
                            return;
                        }
                        var proxy = _this.proxies[index];
                        var url = proxy + (proxy.indexOf('corsproxy') > -1 ? pageUrl : encodedPage);
                        $.get(url).done(function (html) {
                            var str = typeof html === 'string' ? html : (html && html.contents) ? html.contents : '';
                            if (!str) {
                                tryProxy(index + 1);
                                return;
                            }

                            var playlists = [];
                            var regex = /\"playlistId\":\"(PL[\\w-]+)\"[\\s\\S]*?\"title\":\\{\"simpleText\":\"(.*?)\"\\}/g;
                            var match;
                            while ((match = regex.exec(str)) !== null) {
                                var pid = match[1];
                                var title = match[2];
                                if (!pid) continue;
                                playlists.push({ id: pid, title: title });
                            }

                            if (playlists.length) {
                                oncomplite(playlists);
                            } else {
                                tryProxy(index + 1);
                            }
                        }).fail(function () {
                            tryProxy(index + 1);
                        });
                    }

                    tryProxy(0);
                }

                if (/^UC[\w-]{22}$/.test(rawId)) {
                    handleChannelId(rawId);
                } else {
                    _this.resolveHandleToChannelId(rawId, function (err, resolved) {
                        if (!err && resolved && resolved.id) {
                            handleChannelId(resolved.id);
                        } else {
                            onerror();
                        }
                    });
                }
            },
            main: function (oncomplite, onerror) {
                var _this = this;
                var channels = this.getChannels().filter(function (c) { return c.active !== false; });

                if (!channels.length) {
                    console.log('Kinooglad: No active channels found');
                    onerror();
                    return;
                }

                console.log('Kinooglad: Loading ' + channels.length + ' channels with cache optimization');
                var startTime = Date.now();

                var maxVideosPerChannel = 15; // Увеличим до 15 видео на главной
                var timeoutMs = 7000; // 7 секунд таймаут на канал
                var completed = 0;
                var promises = channels.map(function (channel, index) {
                    return new Promise(function (resolve) {
                        var channelStartTime = Date.now();
                        console.log('Kinooglad: Starting load for channel ' + (index + 1) + '/' + channels.length + ': ' + channel.name);
                        
                        var timeout = setTimeout(function() {
                            console.log('Kinooglad: Timeout for channel ' + channel.name + ' after ' + (Date.now() - channelStartTime) + 'ms');
                            completed++;
                            resolve({ title: channel.name, channelId: channel.id, results: [] });
                        }, timeoutMs);

                        _this.fetch(channel, function (items) {
                            clearTimeout(timeout);
                            var loadTime = Date.now() - channelStartTime;
                            console.log('Kinooglad: Channel ' + channel.name + ' loaded in ' + loadTime + 'ms with ' + items.length + ' videos');
                            completed++;
                            resolve({ title: channel.name, channelId: channel.id, results: items.slice(0, maxVideosPerChannel) });
                        }, function () {
                            clearTimeout(timeout);
                            var loadTime = Date.now() - channelStartTime;
                            console.log('Kinooglad: Channel ' + channel.name + ' failed after ' + loadTime + 'ms');
                            completed++;
                            resolve({ title: channel.name, channelId: channel.id, results: [] });
                        });
                    });
                });

                Promise.all(promises).then(function (results) {
                    var totalTime = Date.now() - startTime;
                    console.log('Kinooglad: All channels loaded in ' + totalTime + 'ms');
                    
                    var withVideos = results.filter(function (res) { return res.results.length > 0; });
                    var withoutVideos = results.filter(function (res) { return res.results.length === 0; });

                    withVideos.sort(function (a, b) {
                        var dateA = a.results[0] ? new Date(a.results[0].release_date) : 0;
                        var dateB = b.results[0] ? new Date(b.results[0].release_date) : 0;
                        return dateB - dateA;
                    });

                    var sorted = withVideos.concat(withoutVideos);
                    console.log('Kinooglad: Loaded ' + withVideos.length + '/' + channels.length + ' channels successfully');
                    if (sorted.length) oncomplite(sorted);
                    else onerror();
                });
            },
            mainPlaylists: function (oncomplite, onerror) {
                var _this = this;
                var channels = this.getChannels().filter(function (c) { return c.active !== false; });

                if (!channels.length) {
                    onerror();
                    return;
                }

                var maxVideosPerPlaylist = 10;
                var maxPlaylistsPerChannel = 10;

                var channelPromises = channels.map(function (channel) {
                    return new Promise(function (resolveChannel) {
                        _this.fetchPlaylists(channel, function (playlists) {
                            if (!playlists || !playlists.length) {
                                resolveChannel([]);
                                return;
                            }

                            var limited = playlists.slice(0, maxPlaylistsPerChannel);
                            var playlistPromises = limited.map(function (pl) {
                                return new Promise(function (resolvePlaylist) {
                                    _this.fetchPlaylistItems(pl.id, function (items) {
                                        resolvePlaylist({
                                            title: channel.name + ' • ' + pl.title,
                                            channelId: channel.id,
                                            playlistId: pl.id,
                                            results: (items || []).slice(0, maxVideosPerPlaylist)
                                        });
                                    }, function () {
                                        resolvePlaylist({
                                            title: channel.name + ' • ' + pl.title,
                                            channelId: channel.id,
                                            playlistId: pl.id,
                                            results: []
                                        });
                                    });
                                });
                            });

                            Promise.all(playlistPromises).then(function (blocks) {
                                resolveChannel(blocks);
                            });
                        }, function () {
                            resolveChannel([]);
                        });
                    });
                });

                Promise.all(channelPromises).then(function (perChannelBlocks) {
                    var blocks = [];
                    perChannelBlocks.forEach(function (arr) {
                        if (Array.isArray(arr) && arr.length) blocks = blocks.concat(arr);
                    });

                    if (!blocks.length) {
                        onerror();
                        return;
                    }

                    blocks.sort(function (a, b) {
                        var dateA = a.results[0] ? new Date(a.results[0].release_date) : 0;
                        var dateB = b.results[0] ? new Date(b.results[0].release_date) : 0;
                        return dateB - dateA;
                    });

                    oncomplite(blocks);
                });
            },
            clear: function () { }
        };

        if (!window.FlixioKinoApi) {
            window.FlixioKinoApi = KinoApi;
        }

        function KinoCard(data) {
            this.build = function () {
                if (data.is_button) {
                    // Создаем специальную кнопку "Показать ещё" с той же структурой что и видеокарточка
                    this.card = $('<div class="card selector card--wide layer--render layer--visible kino-card show-more-button">' +
                        '<div class="card__view" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 1.2em; height: 100%; position: relative; overflow: hidden;">' +
                            '<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); display: flex; flex-direction: column; align-items: center; color: white; font-weight: 600; font-size: 1.1em; text-shadow: 0 1px 2px rgba(0,0,0,0.3); text-align: center; width: 100%; padding: 1em; box-sizing: border-box;">' +
                                '<svg style="width: 32px; height: 32px; margin-bottom: 8px; fill: currentColor;" viewBox="0 0 24 24"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9h-4v4h-2v-4H9V9h4V5h2v4h4v2z"/></svg>' +
                                '<div style="line-height: 1.2;">Показать ещё</div>' +
                            '</div>' +
                        '</div>' +
                        '<div class="card__title" style="display: none;"></div>' +
                        '<div class="card__date" style="display: none;"></div>' +
                    '</div>');
                } else {
                    // Обычная видеокарточка
                    this.card = Lampa.Template.get('kino_card', {});
                    this.img = this.card.find('img')[0];

                    this.card.find('.card__title').text(data.title);
                    var date = data.release_date ? data.release_date.split('-').reverse().join('.') : '';
                    this.card.find('.card__date').text(date);
                }
            };

            this.image = function () {
                if (data.is_button) {
                    // Для кнопки сразу добавляем класс загрузки
                    this.card.addClass('card--loaded');
                    return;
                }
                
                var _this = this;
                this.img.onload = function () {
                    _this.card.addClass('card--loaded');
                };
                this.img.onerror = function () {
                    _this.img.src = './img/img_broken.svg';
                };
                if (data.img) this.img.src = data.img;
            };

            this.play = function (id) {
                if (data.is_button) {
                    // Обработка нажатия на кнопку "Показать ещё"
                    // Получаем данные из глобального контекста или из родительского компонента
                    var currentData = window.currentKinoChannelData || {};
                    var currentPage = parseInt(currentData.page || 1);
                    var channelId = currentData.channel_id || currentData.channel || currentData.id;
                    var channelTitle = currentData.title || 'Канал';
                    
                    Lampa.Activity.push({
                        url: '',
                        title: channelTitle + ' - Страница ' + (currentPage + 1),
                        component: 'kino_channel_view',
                        channel_id: channelId,
                        page: currentPage + 1
                    });
                    return;
                }
                
                if (Lampa.Manifest.app_digital >= 183) {
                    var item = {
                        title: Lampa.Utils.shortText(data.title, 50),
                        id: id,
                        youtube: true,
                        url: 'https://www.youtube.com/watch?v=' + id,
                        icon: '<img class="size-youtube" src="https://img.youtube.com/vi/' + id + '/default.jpg" />',
                        template: 'selectbox_icon'
                    };
                    Lampa.Player.play(item);
                    Lampa.Player.playlist([item]);
                } else {
                    Lampa.YouTube.play(id);
                }
            };

            this.create = function () {
                var _this = this;
                this.build();
                if (!this.card) return;

                this.card.on('hover:focus', function (e) {
                    if (data.is_button) {
                        // Принудительно добавляем стили для кнопки как у видеокарточек
                        $(this).css({
                            'transform': 'scale(1.05)',
                            'box-shadow': '0 0 0 3px #fff',
                            'z-index': '10'
                        });
                    }
                    if (_this.onFocus) _this.onFocus(e.target, data);
                }).on('hover:leave', function () {
                    if (data.is_button) {
                        // Убираем стили при уходе фокуса
                        $(this).css({
                            'transform': 'scale(1)',
                            'box-shadow': 'none',
                            'z-index': ''
                        });
                    }
                }).on('hover:enter', function () {
                    _this.play(data.video_id);
                });

                this.image();
            };

            this.render = function () {
                return this.card;
            };

            this.destroy = function () {
                this.img.onerror = null;
                this.img.onload = null;
                this.img.src = '';
                this.card.remove();
                this.card = this.img = null;
            }
        }

        function KinoLine(data) {
            var content = Lampa.Template.get('items_line', { title: data.title });
            var body = content.find('.items-line__body');
            var scroll = new Lampa.Scroll({ horizontal: true, step: 250 });
            var items = [];
            var active = 0;
            var last;

            this.create = function () {
                scroll.render().find('.scroll__body').addClass('items-cards');
                content.find('.items-line__title').text(data.title);
                body.append(scroll.render());
                this.bind();
            };

            this.bind = function () {
                data.results.forEach(this.append.bind(this));
                if (data.channelId) this.appendChannelLink(data.channelId, data.title);
                
                // Добавляем кнопку "Показать еще" если есть видео
                if (data.results && data.results.length > 0) {
                    var moreBtn = $('<div class="card selector card--wide layer--render layer--visible kino-card kino-card--channel">' +
                        '<div class="card__view"><svg class="card__img" viewBox="0 0 24 24" width="100%" height="100%" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; padding: 15%; box-sizing: border-box;"><path fill="white" d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2zm16-5l-4 4v-8l4 4z"/></svg></div>' +
                        '<div class="card__title">📺 Показать еще все видео</div>' +
                        '<div class="card__date" style="font-size: 0.8em; opacity: 0.7; margin-top: 0.3em;">Все видео</div></div>');
                    moreBtn.on('hover:enter', function () {
                        Lampa.Activity.push({
                            url: '',
                            title: data.title + ' - Все видео',
                            component: 'kino_channel_view',
                            channel_id: data.channelId,
                            page: 1
                        });
                    });
                    scroll.append(moreBtn);
                }
                
                Lampa.Layer.update();
            };

            this.append = function (element) {
                var _this = this;
                var card = new KinoCard(element);
                card.create();

                card.onFocus = function (target, card_data) {
                    last = target;
                    active = items.indexOf(card);
                    scroll.update(items[active].render(), true);
                    if (_this.onFocus) _this.onFocus(card_data);
                };

                scroll.append(card.render());
                items.push(card);
            };

            this.appendChannelLink = function (channelId, channelTitle) {
                var _this = this;
                var url = /^UC[\w-]{22}$/.test(channelId)
                    ? 'https://www.youtube.com/channel/' + channelId
                    : 'https://www.youtube.com/@' + channelId;
                
                // Используем переданное название канала
                var channelName = channelTitle || 'YouTube Канал';
                
                var cardEl = $('<div class="card selector card--wide layer--render layer--visible kino-card kino-card--channel">' +
                    '<div class="card__view"><svg class="card__img" viewBox="0 0 24 24" width="100%" height="100%" style="background: #FF0000; border-radius: 8px; padding: 15%; box-sizing: border-box;"><path fill="white" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></div>' +
                    '<div class="card__title">На канал автора</div>' +
                    '<div class="card__date" style="font-size: 0.8em; opacity: 0.7; margin-top: 0.3em;">' + channelName + '</div></div>');
                cardEl.addClass('card--loaded');
                cardEl.on('hover:enter click', function () {
                    if (Lampa.Platform.openWindow) Lampa.Platform.openWindow(url);
                    else window.open(url, '_blank');
                });
                var channelCard = { render: function () { return cardEl; }, destroy: function () { cardEl.remove(); } };
                scroll.append(cardEl);
                items.push(channelCard);
            };

            this.toggle = function () {
                Lampa.Controller.add('items_line', {
                    toggle: function () {
                        Lampa.Controller.collectionSet(scroll.render());
                        Lampa.Controller.collectionFocus(items.length ? last : false, scroll.render());
                    },
                    right: function () {
                        Navigator.move('right');
                    },
                    left: function () {
                        Navigator.move('left');
                    },
                    down: this.onDown,
                    up: this.onUp,
                    gone: function () { },
                    back: this.onBack
                });
                Lampa.Controller.toggle('items_line');
            };

            this.render = function () {
                return content;
            };

            this.destroy = function () {
                Lampa.Arrays.destroy(items);
                scroll.destroy();
                content.remove();
                items = [];
            };
        }


        function KinoChannelView(object) {
            var scroll = new Lampa.Scroll({ mask: true, over: true, scroll_by_item: false });
            var items = [];
            var html = $('<div></div>');
            var active = 0;
            var info;
            var last = null; // Добавляем переменную last
            
            // Устанавливаем глобальный контекст для кнопки "Показать ещё"
            window.currentKinoChannelData = object;

            this.create = function () {
                var _this = this;
                this.activity.loader(true);

                var head = $('<div class="kino-head" style="display: none;"></div>');
                head.append('<div class="kino-title" style="font-size: 2em; display: none;">' + (object.title || 'Канал') + '</div>');
                head.append('<div style="color: #90caf9; font-size: 0.9em; display: none;">Страница ' + (object.page || 1) + '</div>');

                html.append(head);

                // Загружаем видео только одного канала
                var channel = object.channel || { id: object.channel_id || object.id, name: object.title || 'Канал' };
                var page = object.page || 1;
                KinoApi.fetch(channel, function (videos) {
                    // Добавляем скролл
                    scroll.minus();
                    html.append(scroll.render());
                    
                    // Создаем отдельные карточки для каждого видео
                    videos.forEach(function(video) {
                        _this.append(video);
                    });
                    
                    // Добавляем кнопку "Показать ещё" как последнюю карточку в той же строке
                    var buttonElement = {
                        title: 'Показать ещё',
                        img: '',
                        video_id: 'show_more_button',
                        is_button: true
                    };
                    _this.append(buttonElement);
                    
                    // Добавляем информацию о количестве видео в самом конце
                    var infoText = $('<div style="text-align: center; color: #90caf9; font-size: 0.9em; margin: 1em 0; display: none;">Страница ' + page + ' - Загружено видео: ' + videos.length + ' (RSS Feed)</div>');
                    scroll.append(infoText);
                    
                    // Инициализируем контроллеры
                    _this.activity.toggle();
                    _this.activity.loader(false);
                }, function () {
                    _this.empty();
                }, page);
            };

            this.build = function (data) {
                var _this = this;
                scroll.minus();
                html.append(scroll.render());
                data.forEach(function (element) {
                    _this.append(element);
                });
                this.activity.toggle();
            };

            this.append = function (element) {
                var _this = this;
                var card = new KinoCard(element);
                card.create();

                card.onFocus = function (target, card_data) {
                    last = target;
                    active = items.indexOf(card);
                    scroll.update(items[active].render(), true);
                    if (_this.onFocus) _this.onFocus(card_data);
                };

                scroll.append(card.render());
                items.push(card);
            };

            this.toggle = function () {
                Lampa.Controller.add('items_line', {
                    toggle: function () {
                        Lampa.Controller.collectionSet(scroll.render());
                        Lampa.Controller.collectionFocus(items[active].render(), false);
                    },
                    up: function () {
                        if (_this.onUp) _this.onUp();
                        else Lampa.Controller.toggle('head');
                    },
                    down: function () {
                        Lampa.Controller.toggle('menu');
                    },
                    right: function () {
                        if (active < items.length - 1) {
                            active++;
                            scroll.update(items[active].render(), true);
                        } else if (_this.onRight) _this.onRight();
                    },
                    left: function () {
                        if (active > 0) {
                            active--;
                            scroll.update(items[active].render(), true);
                        } else if (_this.onLeft) _this.onLeft();
                    },
                    back: function () {
                        if (_this.onBack) _this.onBack();
                        else Lampa.Controller.toggle('menu');
                    }
                });

                Lampa.Controller.toggle('items_line');
            };

            this.start = function () {
                Lampa.Controller.add('content', {
                    toggle: function () {
                        Lampa.Controller.collectionSet(html);
                        if (last) {
                            Lampa.Controller.collectionFocus(last, true);
                        } else if (items.length > 0) {
                            Lampa.Controller.collectionFocus(items[0].render(), true);
                        }
                    },
                    left: function () {
                        if (Navigator.canmove('left')) Lampa.Controller.toggle('menu');
                        else Lampa.Controller.toggle('content');
                    },
                    right: function () {
                        Navigator.move('right');
                    },
                    up: function () {
                        if (Navigator.canmove('up')) Navigator.move('up');
                        else Lampa.Controller.toggle('head');
                    },
                    down: function () {
                        if (Navigator.canmove('down')) Navigator.move('down');
                        else Lampa.Controller.toggle('menu');
                    },
                    back: function () {
                        Lampa.Activity.backward();
                    }
                });

                Lampa.Controller.toggle('content');
            };

            this.render = function () {
                return html;
            };

            this.destroy = function () {
                scroll.destroy();
                html.remove();
                items = [];
            };
        }

        function KinoComponent(object) {
            var scroll = new Lampa.Scroll({ mask: true, over: true, scroll_by_item: true });
            var items = [];
            var html = $('<div></div>');
            var active = 0;
            var info;

            this.create = function () {
                var _this = this;
                this.activity.loader(true);

                var head = $('<div class="kino-head" style="/* padding: 1.5em 2em; */ display: flex; justify-content: space-between; align-items: center;"></div>');
                // head.append('<div class="kino-title" style="font-size: 2em;">Кіноогляд</div>');

                html.append(head);

                // Загружаем все каналы (только стандартное поведение)
                KinoApi.main(function (data) {
                    _this.build(data);
                    _this.activity.loader(false);
                }, function () {
                    _this.empty();
                    _this.activity.loader(false);
                });
                return this.render();
            };

            this.empty = function () {
                var empty = new Lampa.Empty();
                html.append(empty.render());
                this.start = empty.start.bind(empty);
                this.activity.toggle();
            };

            this.build = function (data) {
                var _this = this;
                scroll.minus();
                html.append(scroll.render());
                data.forEach(function (element) {
                    _this.append(element);
                });
                this.activity.toggle();
            };

            this.append = function (element) {
                var item = new KinoLine(element);
                item.create();
                item.onDown = this.down.bind(this);
                item.onUp = this.up.bind(this);
                item.onBack = this.back.bind(this);
                item.onFocus = function (data) { };
                scroll.append(item.render());
                items.push(item);
            };

            this.back = function () {
                Lampa.Activity.backward();
            };

            this.down = function () {
                active++;
                active = Math.min(active, items.length - 1);
                items[active].toggle();
                scroll.update(items[active].render());
            };

            this.up = function () {
                active--;
                if (active < 0) {
                    active = 0;
                    Lampa.Controller.toggle('head');
                } else {
                    items[active].toggle();
                }
                scroll.update(items[active].render());
            };

            this.start = function () {
                var _this = this;
                if (Lampa.Activity.active().activity !== this.activity) return;
                Lampa.Controller.add('content', {
                    toggle: function () {
                        if (items.length) {
                            items[active].toggle();
                        }
                    },
                    left: function () {
                        if (Navigator.canmove('left')) Navigator.move('left');
                        else Lampa.Controller.toggle('menu');
                    },
                    right: function () {
                        Navigator.move('right');
                    },
                    up: function () {
                        if (Navigator.canmove('up')) Navigator.move('up');
                        else Lampa.Controller.toggle('head');
                    },
                    down: function () {
                        if (items.length) {
                            items[active].toggle();
                        }
                    },
                    back: this.back
                });
                Lampa.Controller.toggle('content');
            };

            this.pause = function () { };
            this.stop = function () { };
            this.render = function () {
                return html;
            };
            this.destroy = function () {
                Lampa.Arrays.destroy(items);
                scroll.destroy();
                html.remove();
                items = [];
            };
        }

        function startPlugin() {
            window.plugin_kinoohlyad_ready = true;
            Lampa.Component.add('kinoohlyad_view', KinoComponent);
            Lampa.Component.add('kino_channel_view', KinoChannelView);

            if (Lampa.SettingsApi && Lampa.SettingsApi.addParam) {
                function parseChannelInput(input) {
                    var s = (input || '').trim();
                    if (!s) return null;
                    var m = s.match(/youtube\.com\/channel\/(UC[\w-]{22})/i) || s.match(/(?:^|\s)(UC[\w-]{22})(?:\s|$)/);
                    if (m) return { id: m[1], name: tr('kino_channel_generic') };
                    m = s.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/i);
                    if (m) return { id: 'vid:' + m[1], name: tr('kino_channel_generic') };
                    m = s.match(/(?:youtube\.com\/)?@([\w.-]+)/i) || s.match(/^@?([\w.-]+)$/);
                    if (m) return { id: m[1], name: m[1] };
                    if (/^UC[\w-]{22}$/.test(s)) return { id: s, name: tr('kino_channel_generic') };
                    return null;
                }

                function showChannelMessage(message, isError = false) {
                    if (Lampa.Noty) {
                        Lampa.Noty.show(message, isError ? 'error' : 'info');
                    } else {
                        console.log('Kinooglad:', message);
                    }
                }

        // Додаємо візуальний розділювач у налаштуваннях Ліхтаря
                Lampa.SettingsApi.addParam({
                    component: 'flixio_plugin',
                    param: { type: 'title' },
                    field: { name: tr('kino_settings_title') }
                });

                // Добавляем пункт "Кинообзор" перед "Добавить канал"
                Lampa.SettingsApi.addParam({
                    component: 'flixio_plugin',
                    param: { name: 'flixio_kinooglad_enabled', type: 'trigger', default: true },
                    field: { name: tr('settings_kinooglad_name'), description: tr('settings_kinooglad_desc') }
                });

                Lampa.SettingsApi.addParam({
                    component: 'flixio_plugin',
                    param: { name: 'kinooglad_add_channel', type: 'button' },
                    field: { name: tr('kino_add_channel_name'), description: tr('kino_add_channel_desc') },
                    onChange: function () {
                        Lampa.Input.edit({ title: tr('kino_add_channel_input'), value: '', free: true, nosave: true }, function (value) {
                            var parsed = parseChannelInput(value);
                            if (!parsed) {
                                showChannelMessage('Неверный формат ввода. Используйте @имя, ID канала UC... или ссылку YouTube', true);
                                return;
                            }
                            var ch = KinoApi.getChannels();
                            var rawId = String(parsed.id).trim();
                            var idNorm = rawId.toLowerCase();
                            if (ch.some(function (c) { return String(c.id).trim().toLowerCase() === idNorm; })) {
                                showChannelMessage('Канал уже добавлен', true);
                                return;
                            }
                            var isUc = /^UC[\w-]{22}$/.test(rawId);
                            if (isUc) {
                                ch.push({ name: parsed.name, id: parsed.id, active: true });
                                KinoApi.saveChannels(ch);
                                if (Lampa.Settings && Lampa.Settings.update) Lampa.Settings.update();
                                showChannelMessage('Канал успешно добавлен');
                                return;
                            }
                            if (rawId.indexOf('vid:') === 0) {
                                showChannelMessage('Поиск канала по видео...');
                                var videoId = rawId.slice(4);
                                KinoApi.resolveVideoToChannelId(videoId, function (err, resolved) {
                                    if (!err && resolved && resolved.id) {
                                        var existsById = ch.some(function (c) { return String(c.id).trim().toLowerCase() === String(resolved.id).trim().toLowerCase(); });
                                        if (!existsById) {
                                            ch.push({ name: resolved.name || parsed.name, id: resolved.id, active: true });
                                            showChannelMessage('Канал успешно добавлен');
                                        } else {
                                            showChannelMessage('Канал уже добавлен', true);
                                        }
                                    } else {
                                        showChannelMessage('Не удалось найти канал по видео', true);
                                    }
                                    KinoApi.saveChannels(ch);
                                    if (Lampa.Settings && Lampa.Settings.update) Lampa.Settings.update();
                                });
                            } else {
                                showChannelMessage('Поиск канала...');
                                KinoApi.resolveHandleToChannelId(rawId, function (err, resolved) {
                                    if (!err && resolved && resolved.id) {
                                        var exists = ch.some(function (c) { return String(c.id).trim() === resolved.id; });
                                        if (!exists) {
                                            ch.push({ name: resolved.name || parsed.name, id: resolved.id, active: true });
                                            showChannelMessage('Канал успешно добавлен');
                                        } else {
                                            showChannelMessage('Канал уже добавлен', true);
                                        }
                                    } else {
                                        showChannelMessage('Не удалось найти канал. Проверьте правильность @имени или попробуйте ID канала', true);
                                        ch.push({ name: parsed.name, id: parsed.id, active: true });
                                    }
                                    KinoApi.saveChannels(ch);
                                    if (Lampa.Settings && Lampa.Settings.update) Lampa.Settings.update();
                                });
                            }
                        });
                    }
                });

                Lampa.SettingsApi.addParam({
                    component: 'flixio_plugin',
                    param: { name: 'kinooglad_reset', type: 'button' },
                    field: { name: tr('kino_reset_name'), description: tr('kino_reset_desc') },
                    onChange: function () {
                        KinoApi.saveChannels(KinoApi.defaultChannels);
                        if (Lampa.Settings && Lampa.Settings.update) Lampa.Settings.update();
                    }
                });

                var KINO_MAX_CHANNELS = 50;
                for (var ci = 0; ci < KINO_MAX_CHANNELS; ci++) {
                    (function (idx) {
                        Lampa.SettingsApi.addParam({
                            component: 'flixio_plugin',
                            param: { name: 'kinooglad_ch_' + idx, type: 'button' },
                            field: { name: '—' },
                            onRender: function (item) {
                                var ch = KinoApi.getChannels()[idx];
                                if (!ch) { item.hide(); return; }
                                item.show();
                                item.find('.settings-param__name').text(getKinoChannelDisplayName(ch));
                                if (!item.find('.settings-param__value').length) item.append('<div class="settings-param__value"></div>');
                                item.find('.settings-param__value').text(ch.active !== false ? tr('kino_channel_enabled') : tr('kino_channel_disabled'));
                            },
                            onChange: function () {
                                var ch = KinoApi.getChannels();
                                if (ch[idx]) {
                                    ch[idx].active = (ch[idx].active === false);
                                    KinoApi.saveChannels(ch);
                                    var scrollWrap = document.querySelector('.activity .scroll') || document.querySelector('.scroll');
                                    var scrollTop = scrollWrap ? scrollWrap.scrollTop : 0;
                                    if (Lampa.Settings && Lampa.Settings.update) Lampa.Settings.update();
                                    setTimeout(function () {
                                        if (scrollWrap) scrollWrap.scrollTop = scrollTop;
                                    }, 80);
                                }
                            }
                        });

                        Lampa.SettingsApi.addParam({
                            component: 'flixio_plugin',
                            param: { name: 'kinooglad_ch_' + idx + '_delete', type: 'button' },
                            field: { name: tr('kino_channel_delete_btn') },
                            onRender: function (item) {
                                var ch = KinoApi.getChannels()[idx];
                                if (!ch) { item.hide(); return; }
                                item.show();
                                // Добавляем имя канала к названию кнопки удаления
                                var channelName = getKinoChannelDisplayName(ch);
                                item.find('.settings-param__name').text('🗑️ ' + tr('kino_channel_delete_btn') + ': ' + channelName);
                            },
                            onChange: function () {
                                var channels = KinoApi.getChannels();
                                if (!channels[idx]) return;
                                var name = channels[idx].name || tr('kino_channel_generic');
                                var confirmDelete = true;
                                if (typeof window !== 'undefined' && typeof window.confirm === 'function') {
                                    confirmDelete = window.confirm(name + ' — ' + tr('kino_channel_delete_btn') + '?');
                                }
                                if (!confirmDelete) return;
                                channels.splice(idx, 1);
                                KinoApi.saveChannels(channels);
                                var scrollWrap = document.querySelector('.activity .scroll') || document.querySelector('.scroll');
                                var scrollTop = scrollWrap ? scrollWrap.scrollTop : 0;
                                if (Lampa.Settings && Lampa.Settings.update) Lampa.Settings.update();
                                setTimeout(function () {
                                    if (scrollWrap) scrollWrap.scrollTop = scrollTop;
                                }, 80);
                            }
                        });
                    })(ci);
                }
            }

            Lampa.Template.add('kino_card', `
            <div class="card selector card--wide layer--render layer--visible kino-card">
                <div class="card__view">
                    <img src="./img/img_load.svg" class="card__img">
                    <div class="card__promo"></div>
                </div>
                <div class="card__title"></div>
                <div class="card__date" style="font-size: 0.8em; opacity: 0.7; margin-top: 0.3em;"></div>
            </div>
        `);

            $('body').append(`
            <style>
            .kino-card {
                width: calc(25% - 1em) !important;
                min-width: 18em !important;
                max-width: 22em !important;
                margin: 0 1em 1em 0 !important;
                aspect-ratio: 16/9;
                display: inline-block !important;
                vertical-align: top;
            }
            @media (max-width: 768px) {
                .kino-card {
                    width: calc(50% - 1em) !important;
                    min-width: 14em !important;
                    max-width: unset !important;
                }
            }
            .kino-card .card__title {
                font-size: 1em;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                line-height: 1.2;
                padding: 0 0.2em;
            }
            .kino-card .card__view {
                padding-bottom: 56.25% !important;
            }
            .kino-card .card__img {
                object-fit: cover !important;
                height: 100% !important;
                border-radius: 0.3em;
            }
            .kino-card .card__date {
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                padding: 0 0.2em;
            }
            .kino-settings:focus, .kino-settings.focus {
                background: #fff !important;
                color: #000 !important;
            }
            .kino-settings-screen {
                padding: 1.5em 2em 3em;
                max-width: 40em;
            }
            .kino-settings__wrap { }
            .kino-settings__title {
                display: block;
                font-size: 1.5em;
                font-weight: 600;
                margin-bottom: 1.2em;
                color: inherit;
            }
            .kino-settings__subtitle {
                display: block;
                font-size: 0.95em;
                opacity: 0.85;
                margin: 1.2em 0 0.6em;
                padding-top: 0.8em;
                border-top: 1px solid rgba(255,255,255,0.15);
            }
            .kino-settings__row {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                gap: 0.25em;
                padding: 0.85em 1em;
                margin-bottom: 0.4em;
                border-radius: 0.5em;
                background: rgba(255,255,255,0.06);
                min-height: 3em;
                box-sizing: border-box;
            }
            .kino-settings__row.selector:hover,
            .kino-settings__row.selector.focus {
                background: rgba(255,255,255,0.12);
            }
            .kino-settings__row--channel {
                flex-direction: row;
                align-items: center;
                justify-content: space-between;
                gap: 1em;
            }
            .kino-settings__row--off {
                opacity: 0.6;
            }
            .kino-settings__label {
                font-size: 1em;
                font-weight: 500;
            }
            .kino-settings__hint {
                font-size: 0.85em;
                opacity: 0.8;
            }
            .kino-settings__channel-name {
                flex: 1;
                min-width: 0;
                font-size: 1em;
            }
            .kino-settings__channel-status {
                flex-shrink: 0;
                font-size: 0.9em;
                opacity: 0.9;
            }
            .kino-card--channel .card__title { font-style: italic; }
            </style>
        `);

            function addMenu() {
                var getCurrentTitle = function () {
                    var title = tr('kino_menu_title');
                    try {
                        var channels = KinoApi.getChannels().filter(function (c) { return c.active !== false; });
                        if (channels.length === 1 && channels[0].name) {
                            title = channels[0].name;
                        }
                    } catch (e) { }
                    return title;
                };

                var action = function () {
                    Lampa.Activity.push({
                        url: '',
                        title: getCurrentTitle(),
                        component: 'kinoohlyad_view',
                        page: 1
                    });
                };

                var btnTitle = getCurrentTitle();
                var btn = $('<li class="menu__item selector" data-action="kinoohlyad"><div class="menu__ico"><svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg" fill="none"><circle cx="12" cy="12" r="10" fill="none" stroke="white" stroke-width="1.5"/><path d="M8 8h8v2H8V8zm0 4h6v2H8v-2zm0 4h8v2H8v-2z" fill="white"/><circle cx="3" cy="3" r="1" fill="white" opacity="0.6"/><circle cx="21" cy="3" r="1" fill="white" opacity="0.6"/><circle cx="3" cy="21" r="1" fill="white" opacity="0.6"/><circle cx="21" cy="21" r="1" fill="white" opacity="0.6"/><circle cx="12" cy="1" r="1" fill="white" opacity="0.7"/><circle cx="12" cy="23" r="1" fill="white" opacity="0.7"/><circle cx="1" cy="12" r="1" fill="white" opacity="0.7"/><circle cx="23" cy="12" r="1" fill="white" opacity="0.7"/></svg></div><div class="menu__text">' + btnTitle + '</div></li>');

                btn.on('hover:enter click', action);

                $('.menu .menu__list').eq(0).append(btn);
            }

            function addSettings() {
                // Пункт «Кіноогляд» і панель з кнопкою реєструються в setupKinoogladSettings() через SettingsApi (як Ліхтар).
                // Тут лише перевірка увімкнення плагіна для меню та панелі.
            }

            var kinoEnabled = Lampa.Storage.get('flixio_kinooglad_enabled', true);
            console.log('Kinooglad: Plugin enabled:', kinoEnabled);
            
            if (kinoEnabled) {
                if (window.appready) {
                    addMenu();
                    addSettings();
                } else {
                    Lampa.Listener.follow('app', function (e) {
                        if (e.type == 'ready') {
                            addMenu();
                            addSettings();
                        }
                    });
                }
            }
        }

        startPlugin();
    }
    // =================================================================
    // INIT FUNCTION
    // =================================================================
    function init() {
        // Settings panel
        setupSettings();

        // Register Components
        Lampa.Component.add('studios_main', StudiosMain);
        Lampa.Component.add('studios_view', StudiosView);
        Lampa.Component.add('ukrainian_feed', UkrainianFeedMain);
        Lampa.Component.add('polish_feed', PolishFeedMain);
        Lampa.Component.add('russian_feed', RussianFeedMain);
        FlixioStudioSubscription.init();

        addStyles();

        overrideApi();

        if (Lampa.Storage.get('flixio_row_hero', true)) {
            addHeroRow();
        }
        removeShotsSection();

        if (Lampa.Storage.get('flixio_section_streamings', true)) {
            addStudioRow();
        }

        if (Lampa.Storage.get('flixio_section_mood', true)) {
            addMoodRow();
        }

        if (Lampa.Storage.get('flixio_row_ru_feed', true)) {
            addRussianContentRow();
        }
        if (Lampa.Storage.get('flixio_row_ua_feed', true)) {
            addUkrainianContentRow();
        }
        if (Lampa.Storage.get('flixio_row_en_feed', true)) {
            addEnglishContentRow();
        }
        if (Lampa.Storage.get('flixio_row_pl_feed', true)) {
            addPolishContentRow();
        }

        addServiceRows();

        // Start dynamic title modifier for icons
        modifyServiceTitles();

        initKinoogladModule();

        // Initial Focus and Styling
        setTimeout(function () {
            var heroCard = document.querySelector('.hero-banner');
            if (heroCard) {
                heroCard.style.width = '85vw';
                heroCard.style.marginRight = '1.5em';
            }

            var studioCard = $('.card--studio');
            if (studioCard.length) {
                if (Lampa.Controller.enabled().name === 'main') {
                    Lampa.Controller.collectionFocus(studioCard[0], $('.scroll__content').eq(1)[0]);
                }
            }
        }, 1000);
    }

    function initAppleTvFullCardBuiltIn() {
        if (window.FLIXIO_APPLETV_BUILTIN) return;
        window.FLIXIO_APPLETV_BUILTIN = true;
        if (!Lampa.Template || !Lampa.Template.add) return;

        if (typeof Lampa.Storage.get('applecation_show_ratings') === 'undefined') Lampa.Storage.set('applecation_show_ratings', false);
        if (typeof Lampa.Storage.get('applecation_ratings_position') === 'undefined') Lampa.Storage.set('applecation_ratings_position', 'card');

        var ratings_position = Lampa.Storage.get('applecation_ratings_position', 'card');
        var ratings_html = '<div class="full-start-new__rate-line applecation__ratings show">' +
            '<div class="full-start__rate rate--tmdb"><div></div><div class="source--name">TMDB</div></div>' +
            '<div class="full-start__rate rate--imdb hide"><div></div><div class="source--name">IMDb</div></div>' +
            '<div class="full-start__rate rate--kp hide"><div></div><div class="source--name">Кинопоиск</div></div>' +
            '<div class="full-start__status hide"></div>' +
            '</div>';

        var full_start_new_html = `<div class="full-start-new applecation">\n        <div class="full-start-new__body">\n            <div class="full-start-new__left hide">\n                <div class="full-start-new__poster">\n                    <img class="full-start-new__img full--poster" />\n                </div>\n            </div>\n\n            <div class="full-start-new__right">\n                <div class="applecation__left">\n                    <div class="applecation__logo"></div>\n                    \n                    <div class="applecation__content-wrapper">\n                        <div class="full-start-new__title" style="display: none;">{title}</div>\n                        \n                        <div class="applecation__meta">\n                            <div class="applecation__meta-left">\n                                <span class="applecation__network"></span>\n                                <span class="applecation__meta-text"></span>\n                                <div class="full-start__pg hide"></div>\n                            </div>\n                        </div>\n                        \n                        ${"card"===ratings_position?ratings_html:""}\n                        \n                        <div class="applecation__description-wrapper">\n                            <div class="applecation__description"></div>\n                        </div>\n                        <div class="applecation__info"></div>\n                    </div>\n                    \n                    \x3c!-- Скрытые оригинальные элементы --\x3e\n                    <div class="full-start-new__head" style="display: none;"></div>\n                    <div class="full-start-new__details" style="display: none;"></div>\n\n                    <div class="full-start-new__buttons">\n                        <div class="full-start__button selector button--play">\n                            <svg width="28" height="29" viewBox="0 0 28 29" fill="none" xmlns="http://www.w3.org/2000/svg">\n                                <circle cx="14" cy="14.5" r="13" stroke="currentColor" stroke-width="2.7"/>\n                                <path d="M18.0739 13.634C18.7406 14.0189 18.7406 14.9811 18.0739 15.366L11.751 19.0166C11.0843 19.4015 10.251 18.9204 10.251 18.1506L10.251 10.8494C10.251 10.0796 11.0843 9.5985 11.751 9.9834L18.0739 13.634Z" fill="currentColor"/>\n                            </svg>\n                            <span>#{title_watch}</span>\n                        </div>\n\n                        <div class="full-start__button selector button--book">\n                            <svg width="21" height="32" viewBox="0 0 21 32" fill="none" xmlns="http://www.w3.org/2000/svg">\n                                <path d="M2 1.5H19C19.2761 1.5 19.5 1.72386 19.5 2V27.9618C19.5 28.3756 19.0261 28.6103 18.697 28.3595L12.6212 23.7303C11.3682 22.7757 9.63183 22.7757 8.37885 23.7303L2.30302 28.3595C1.9739 28.6103 1.5 28.3756 1.5 27.9618V2C1.5 1.72386 1.72386 1.5 2 1.5Z" stroke="currentColor" stroke-width="2.5"/>\n                            </svg>\n                            <span>#{settings_input_links}</span>\n                        </div>\n\n                        <div class="full-start__button selector button--reaction">\n                            <svg width="38" height="34" viewBox="0 0 38 34" fill="none" xmlns="http://www.w3.org/2000/svg">\n                                <path d="M37.208 10.9742C37.1364 10.8013 37.0314 10.6441 36.899 10.5117C36.7666 10.3794 36.6095 10.2744 36.4365 10.2028L12.0658 0.108375C11.7166 -0.0361828 11.3242 -0.0361227 10.9749 0.108542C10.6257 0.253206 10.3482 0.530634 10.2034 0.879836L0.108666 25.2507C0.0369593 25.4236 3.37953e-05 25.609 2.3187e-08 25.7962C-3.37489e-05 25.9834 0.0368249 26.1688 0.108469 26.3418C0.180114 26.5147 0.28514 26.6719 0.417545 26.8042C0.54995 26.9366 0.707139 27.0416 0.880127 27.1131L17.2452 33.8917C17.5945 34.0361 17.9869 34.0361 18.3362 33.8917L29.6574 29.2017C29.8304 29.1301 29.9875 29.0251 30.1199 28.8928C30.2523 28.7604 30.3573 28.6032 30.4289 28.4303L37.2078 12.065C37.2795 11.8921 37.3164 11.7068 37.3164 11.5196C37.3165 11.3325 37.2796 11.1471 37.208 10.9742ZM20.425 29.9407L21.8784 26.4316L25.3873 27.885L20.425 29.9407ZM28.3407 26.0222L21.6524 23.252C21.3031 23.1075 20.9107 23.1076 20.5615 23.2523C20.2123 23.3969 19.9348 23.6743 19.79 24.0235L17.0194 30.7123L3.28783 25.0247L12.2918 3.28773L34.0286 12.2912L28.3407 26.0222Z" fill="currentColor"/>\n                                <path d="M25.3493 16.976L24.258 14.3423L16.959 17.3666L15.7196 14.375L13.0859 15.4659L15.4161 21.0916L25.3493 16.976Z" fill="currentColor"/>\n                            </svg>\n                            <span>#{title_reactions}</span>\n                        </div>\n\n                        <div class="full-start__button selector button--subscribe hide">\n                            <svg width="25" height="30" viewBox="0 0 25 30" fill="none" xmlns="http://www.w3.org/2000/svg">\n                                <path d="M6.01892 24C6.27423 27.3562 9.07836 30 12.5 30C15.9216 30 18.7257 27.3562 18.981 24H15.9645C15.7219 25.6961 14.2632 27 12.5 27C10.7367 27 9.27804 25.6961 9.03542 24H6.01892Z" fill="currentColor"/>\n                                <path d="M3.81972 14.5957V10.2679C3.81972 5.41336 7.7181 1.5 12.5 1.5C17.2819 1.5 21.1803 5.41336 21.1803 10.2679V14.5957C21.1803 15.8462 21.5399 17.0709 22.2168 18.1213L23.0727 19.4494C24.2077 21.2106 22.9392 23.5 20.9098 23.5H4.09021C2.06084 23.5 0.792282 21.2106 1.9273 19.4494L2.78317 18.1213C3.46012 17.0709 3.81972 15.8462 3.81972 14.5957Z" stroke="currentColor" stroke-width="2.5"/>\n                            </svg>\n                            <span>#{title_subscribe}</span>\n                        </div>\n\n                        <div class="full-start__button selector button--options">\n                            <svg width="38" height="10" viewBox="0 0 38 10" fill="none" xmlns="http://www.w3.org/2000/svg">\n                                <circle cx="4.88968" cy="4.98563" r="4.75394" fill="currentColor"/>\n                                <circle cx="18.9746" cy="4.98563" r="4.75394" fill="currentColor"/>\n                                <circle cx="33.0596" cy="4.98563" r="4.75394" fill="currentColor"/>\n                            </svg>\n                        </div>\n                    </div>\n                </div>\n\n                <div class="applecation__right">\n                    <div class="full-start-new__reactions selector">\n                        <div>#{reactions_none}</div>\n                    </div>\n                    \n                    ${"corner"===ratings_position?ratings_html:""}\n\n                    \x3c!-- Скрытый элемент для совместимости (предотвращает выход реакций за экран) --\x3e\n                    <div class="full-start-new__rate-line">\n                        <div class="full-start__status hide"></div>\n                    </div>\n                    \n                    \x3c!-- Пустой маркер для предотвращения вставки элементов от modss.js --\x3e\n                    <div class="rating--modss" style="display: none;"></div>\n                </div>\n            </div>\n        </div>\n\n        <div class="hide buttons--container">\n            <div class="full-start__button view--torrent hide">\n                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="50px" height="50px">\n                    <path d="M25,2C12.317,2,2,12.317,2,25s10.317,23,23,23s23-10.317,23-23S37.683,2,25,2z M40.5,30.963c-3.1,0-4.9-2.4-4.9-2.4 S34.1,35,27,35c-1.4,0-3.6-0.837-3.6-0.837l4.17,9.643C26.727,43.92,25.874,44,25,44c-2.157,0-4.222-0.377-6.155-1.039L9.237,16.851 c0,0-0.7-1.2,0.4-1.5c1.1-0.3,5.4-1.2,5.4-1.2s1.475-0.494,1.8,0.5c0.5,1.3,4.063,11.112,4.063,11.112S22.6,29,27.4,29 c4.7,0,5.9-3.437,5.7-3.937c-1.2-3-4.993-11.862-4.993-11.862s-0.6-1.1,0.8-1.4c1.4-0.3,3.8-0.7,3.8-0.7s1.105-0.163,1.6,0.8 c0.738,1.437,5.193,11.262,5.193,11.262s1.1,2.9,3.3,2.9c0.464,0,0.834-0.046,1.152-0.104c-0.082,1.635-0.348,3.221-0.817,4.722 C42.541,30.867,41.756,30.963,40.5,30.963z" fill="currentColor"/>\n                </svg>\n                <span>#{full_torrents}</span>\n            </div>\n\n            <div class="full-start__button selector view--trailer">\n                <svg height="70" viewBox="0 0 80 70" fill="none" xmlns="http://www.w3.org/2000/svg">\n                    <path fill-rule="evenodd" clip-rule="evenodd" d="M71.2555 2.08955C74.6975 3.2397 77.4083 6.62804 78.3283 10.9306C80 18.7291 80 35 80 35C80 35 80 51.2709 78.3283 59.0694C77.4083 63.372 74.6975 66.7603 71.2555 67.9104C65.0167 70 40 70 40 70C40 70 14.9833 70 8.74453 67.9104C5.3025 66.7603 2.59172 63.372 1.67172 59.0694C0 51.2709 0 35 0 35C0 35 0 18.7291 1.67172 10.9306C2.59172 6.62804 5.3025 3.2395 8.74453 2.08955C14.9833 0 40 0 40 0C40 0 65.0167 0 71.2555 2.08955ZM55.5909 35.0004L29.9773 49.5714V20.4286L55.5909 35.0004Z" fill="currentColor"></path>\n                </svg>\n                <span>#{full_trailers}</span>\n            </div>\n        </div>\n    </div>`;

        Lampa.Template.add('full_start_new', full_start_new_html);

        Lampa.Template.add('applecation_overlay', '\n            <div class="applecation-description-overlay">\n                <div class="applecation-description-overlay__bg"></div>\n                <div class="applecation-description-overlay__content selector">\n                    <div class="applecation-description-overlay__logo"></div>\n                    <div class="applecation-description-overlay__title">{title}</div>\n                    <div class="applecation-description-overlay__text">{text}</div>\n                    <div class="applecation-description-overlay__details">\n                        <div class="applecation-description-overlay__info">\n                            <div class="applecation-description-overlay__info-name">#{full_date_of_release}</div>\n                            <div class="applecation-description-overlay__info-body">{relise}</div>\n                        </div>\n                        <div class="applecation-description-overlay__info applecation--budget">\n                            <div class="applecation-description-overlay__info-name">#{full_budget}</div>\n                            <div class="applecation-description-overlay__info-body">{budget}</div>\n                        </div>\n                        <div class="applecation-description-overlay__info applecation--countries">\n                            <div class="applecation-description-overlay__info-name">#{full_countries}</div>\n                            <div class="applecation-description-overlay__info-body">{countries}</div>\n                        </div>\n                    </div>\n                </div>\n            </div>\n        ');

        Lampa.Template.add('full_episode', '<div class="full-episode selector layer--visible">\n            <div class="full-episode__img">\n                <img />\n                <div class="full-episode__time">{time}</div>\n            </div>\n\n            <div class="full-episode__body">\n                <div class="full-episode__num">#{full_episode} {num}</div>\n                <div class="full-episode__name">{name}</div>\n                <div class="full-episode__overview">{overview}</div>\n                <div class="full-episode__date">{date}</div>\n            </div>\n        </div>');

        if (!document.getElementById('flixio_applecation_css')) {
            var cssRaw =
                String.raw`<style id="flixio_applecation_css">` +
                String.raw`\n\n/* Основной контейнер */\n.applecation {\n    transition: all .3s;\n}\n\n.applecation .full-start-new__body {\n    height: 80vh;\n}\n\n.applecation .full-start-new__right {\n    display: flex;\n    align-items: flex-end;\n}\n\n.applecation .full-start-new__title {\n    font-size: 2.5em;\n    font-weight: 700;\n    line-height: 1.2;\n    margin-bottom: 0.5em;\n    text-shadow: 0 0 .1em rgba(0, 0, 0, 0.3);\n}\n\n/* Логотип */\n.applecation__logo {\n    margin-bottom: 0.5em;\n    opacity: 0;\n    transform: translateY(20px);\n    transition: opacity 0.4s ease-out, transform 0.4s ease-out;\n}\n\n.applecation__logo.loaded {\n    opacity: 1;\n    transform: translateY(0);\n}\n\n.applecation__logo img {\n    display: block;\n    max-width: 35vw;\n    max-height: 180px;\n    width: auto;\n    height: auto;\n    object-fit: contain;\n    object-position: left center;\n}\n\n/* Контейнер для масштабируемого контента */\n.applecation__content-wrapper {\n    font-size: 100%;\n}\n\n/* Мета информация (Тип/Жанр/поджанр) */\n.applecation__meta {\n    display: flex;\n    align-items: center;\n    color: #fff;\n    font-size: 1.1em;\n    margin-bottom: 0.5em;\n    line-height: 1;\n    opacity: 0;\n    transform: translateY(15px);\n    transition: opacity 0.4s ease-out, transform 0.4s ease-out;\n    transition-delay: 0.05s;\n}\n\n.applecation__meta.show {\n    opacity: 1;\n    transform: translateY(0);\n}\n\n.applecation__meta-left {\n    display: flex;\n    align-items: center;\n    line-height: 1;\n}\n\n.applecation__network {\n    display: inline-flex;\n    align-items: center;\n    line-height: 1;\n}\n\n.applecation__network img {\n    display: block;\n    max-height: 0.8em;\n    width: auto;\n    object-fit: contain;\n    filter: brightness(0) invert(1);\n}\n\n.applecation__meta-text {\n    margin-left: 1em;\n    line-height: 1;\n}\n\n.applecation__meta .full-start__pg {\n    margin: 0 0 0 0.6em;\n    padding: 0.2em 0.5em;\n    font-size: 0.85em;\n    font-weight: 600;\n    border: 1.5px solid rgba(255, 255, 255, 0.4);\n    border-radius: 0.3em;\n    background: rgba(255, 255, 255, 0.1);\n    color: rgba(255, 255, 255, 0.9);\n    line-height: 1;\n    vertical-align: middle;\n}\n\n/* Рейтинги */\n.applecation__ratings {\n    display: flex;\n    align-items: center;\n    gap: 0.8em;\n    margin-bottom: 0.5em;\n    opacity: 0;\n    transform: translateY(15px);\n    transition: opacity 0.4s ease-out, transform 0.4s ease-out;\n    transition-delay: 0.08s;\n}\n\n.applecation__ratings.show {\n    opacity: 1;\n    transform: translateY(0);\n}\n\n.applecation__ratings .rate--imdb,\n.applecation__ratings .rate--kp {\n    display: flex;\n    align-items: center;\n    gap: 0.35em;\n}\n\n.applecation__ratings svg {\n    width: 1.8em;\n    height: auto;\n    flex-shrink: 0;\n    color: rgba(255, 255, 255, 0.85);\n}\n\n.applecation__ratings .rate--kp svg {\n    width: 1.5em;\n}\n\n.applecation__ratings > div > div {\n    font-size: 0.95em;\n    font-weight: 600;\n    line-height: 1;\n    color: #fff;\n}\n\n/* Управление видимостью рейтингов через настройки */\nbody.applecation--hide-ratings .applecation__ratings {\n    display: none !important;\n}\n\n/* Расположение рейтингов - в правом нижнем углу */\nbody.applecation--ratings-corner .applecation__right {\n    gap: 1em;\n}\n\nbody.applecation--ratings-corner .applecation__ratings {\n    margin-bottom: 0;\n}\n\n/* Обертка для описания */\n.applecation__description-wrapper {\n    background-color: transparent;\n    padding: 0;\n    border-radius: 1em;\n    width: fit-content;\n    opacity: 0;\n    transform: translateY(15px);\n    transition:\n        padding 0.25s ease,\n        transform 0.25s ease,\n        opacity 0.4s ease-out;\n    transition-delay: 0.1s;\n}\n\n.applecation__description-wrapper.show {\n    opacity: 1;\n    transform: translateY(0);\n}\n\n.applecation__description-wrapper.focus {\n  background: linear-gradient(\n    135deg,\n    rgba(255, 255, 255, 0.28),\n    rgba(255, 255, 255, 0.18)\n  );\n  padding: .15em .4em 0 .7em;\n  border-radius: 1em;\n  width: fit-content;\n\n//   box-shadow:\n//     inset 0 1px 0 rgba(255, 255, 255, 0.35),\n//     0 8px 24px rgba(0, 0, 0, 0.25);\n  box-shadow:\n    inset 0 1px 0 rgba(255, 255, 255, 0.35);\n\n  transform: scale(1.07) translateY(0);\n  \n  transition-delay: 0s;\n}\n\n/* Описание */\n.applecation__description {\n    color: rgba(255, 255, 255, 0.6);\n    font-size: 0.95em;\n    line-height: 1.5;\n    margin-bottom: 0.5em;\n    max-width: 35vw;\n    display: -webkit-box;\n    -webkit-line-clamp: 4;\n    -webkit-box-orient: vertical;\n    overflow: hidden;\n    text-overflow: ellipsis;\n}\n\n\n.focus .applecation__description {\n  color: rgba(255, 255, 255, 0.92);\n}\n\n/* Дополнительная информация (Год/длительность) */\n.applecation__info {\n    color: rgba(255, 255, 255, 0.75);\n    font-size: 1em;\n    line-height: 1.4;\n    margin-bottom: 0.5em;\n    opacity: 0;\n    transform: translateY(15px);\n    transition: opacity 0.4s ease-out, transform 0.4s ease-out;\n    transition-delay: 0.15s;\n}\n\n.applecation__info.show {\n    opacity: 1;\n    transform: translateY(0);\n}\n\n/* Левая и правая части */\n.applecation__left {\n    flex-grow: 1;\n}\n\n.applecation__right {\n    display: flex;\n    align-items: center;\n    flex-shrink: 0;\n    position: relative;\n}\n\n/* Выравнивание по baseline если рейтинги в углу */\nbody.applecation--ratings-corner .applecation__right {\n    align-items: last baseline;\n}\n\n/* Реакции */\n.applecation .full-start-new__reactions {\n    margin: 0;\n    display: flex;\n    flex-direction: column-reverse;\n    align-items: flex-end;\n}\n\n.applecation .full-start-new__reactions > div {\n    align-self: flex-end;\n}\n\n.applecation .full-start-new__reactions:not(.focus) {\n    margin: 0;\n}\n\n.applecation .full-start-new__reactions:not(.focus) > div:not(:first-child) {\n    display: none;\n}\n\n/* Стили первой реакции (всегда видимой) */\n.applecation .full-start-new__reactions > div:first-child .reaction {\n    display: flex !important;\n    align-items: center !important;\n    background-color: rgba(0, 0, 0, 0) !important;\n    gap: 0 !important;\n}\n\n.applecation .full-start-new__reactions > div:first-child .reaction__icon {\n    background-color: rgba(0, 0, 0, 0.3) !important;\n    -webkit-border-radius: 5em;\n    -moz-border-radius: 5em;\n    border-radius: 5em;\n    padding: 0.5em;\n    width: 2.6em !important;\n    height: 2.6em !important;\n}\n\n.applecation .full-start-new__reactions > div:first-child .reaction__count {\n    font-size: 1.2em !important;\n    font-weight: 500 !important;\n}\n\n/* При фокусе реакции раскрываются вверх */\n.applecation .full-start-new__reactions.focus {\n    gap: 0.5em;\n}\n\n.applecation .full-start-new__reactions.focus > div {\n    display: block;\n}\n\n/* Скрываем стандартный rate-line (используется только для статуса) */\n.applecation .full-start-new__rate-line {\n    margin: 0;\n    height: 0;\n    overflow: hidden;\n    opacity: 0;\n    pointer-events: none;\n}\n\n/* Фон - переопределяем стандартную анимацию на fade */\n.full-start__background {\n    height: calc(100% + 6em);\n    left: 0 !important;\n    opacity: 0 !important;\n    transition: opacity 0.6s ease-out, filter 0.3s ease-out !important;\n    animation: none !important;\n    transform: none !important;\n    will-change: opacity, filter;\n}\n\n.full-start__background.loaded:not(.dim) {\n    opacity: 1 !important;\n}\n\n.full-start__background.dim {\n  filter: blur(30px);\n}\n\n/* Удерживаем opacity при загрузке нового фона */\n.full-start__background.loaded.applecation-animated {\n    opacity: 1 !important;\n}\n\nbody:not(.menu--open) .full-start__background {\n    mask-image: none;\n}\n\n/* Отключаем стандартную анимацию Lampa для фона */\nbody.advanced--animation:not(.no--animation) .full-start__background.loaded {\n    animation: none !important;\n}\n\n/* Скрываем статус для предотвращения выхода реакций за экран */\n.applecation .full-start__status {\n    display: none;\n}\n\n/* Оверлей для затемнения левого края */\n.applecation__overlay {\n    width: 90vw;\n    background: linear-gradient(to right, rgba(0, 0, 0, 0.792) 0%, rgba(0, 0, 0, 0.504) 25%, rgba(0, 0, 0, 0.264) 45%, rgba(0, 0, 0, 0.12) 55%, rgba(0, 0, 0, 0.043) 60%, rgba(0, 0, 0, 0) 65%);\n}\n\n/* Бейджи качества */\n.applecation__quality-badges {\n    display: inline-flex;\n    align-items: center;\n    gap: 0.4em;\n    margin-left: 0.6em;\n    opacity: 0;\n    transform: translateY(10px);\n    transition: opacity 0.3s ease-out, transform 0.3s ease-out;\n}\n\n.applecation__quality-badges.show {\n    opacity: 1;\n    transform: translateY(0);\n}\n\n.quality-badge {\n    display: inline-flex;\n    height: 0.8em;\n}\n\n.quality-badge svg {\n    height: 100%;\n    width: auto;\n    display: block;\n}\n\n.quality-badge--res svg {\n    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));\n}\n\n.quality-badge--dv svg,\n.quality-badge--hdr svg,\n.quality-badge--sound svg,\n.quality-badge--dub svg {\n    color: rgba(255, 255, 255, 0.85);\n    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));\n}\n\n/* Эпизоды Apple TV */\n.applecation .full-episode--small {\n    width: 20em !important;\n    height: auto !important;\n    margin-right: 1.5em !important;\n    background: none !important;\n    display: flex !important;\n    flex-direction: column !important;\n    transition: transform 0.3s !important;\n}\n\n.applecation .full-episode--small.focus {\n    transform: scale(1.02);\n}\n\n.applecation .full-episode--next .full-episode__img::after {\n  border: none !important;\n}\n\n.applecation .full-episode__img {\n    padding-bottom: 56.25% !important;\n    border-radius: 0.8em !important;\n    margin-bottom: 1em !important;\n    background-color: rgba(255,255,255,0.05) !important;\n    position: relative !important;\n    overflow: visible !important;\n}\n\n.applecation .full-episode__img img {\n    border-radius: 0.8em !important;\n    object-fit: cover !important;\n}\n\n.applecation .full-episode__time {\n    position: absolute;\n    bottom: 0.8em;\n    left: 0.8em;\n    background: rgba(0,0,0,0.6);\n    padding: 0.2em 0.5em;\n    border-radius: 0.4em;\n    font-size: 0.75em;\n    font-weight: 600;\n    color: #fff;\n    backdrop-filter: blur(5px);\n    z-index: 2;\n}\n\n.applecation .full-episode__time:empty {\n    display: none;\n}\n\n.applecation .full-episode__body {\n    position: static !important;\n    display: flex !important;\n    flex-direction: column !important;\n    background: none !important;\n    padding: 0 0.5em !important;\n    opacity: 0.6;\n    transition: opacity 0.3s;\n}\n\n.applecation .full-episode.focus .full-episode__body {\n    opacity: 1;\n}\n\n.applecation .full-episode__num {\n    font-size: 0.75em !important;\n    font-weight: 600 !important;\n    text-transform: uppercase !important;\n    color: rgba(255,255,255,0.4) !important;\n    margin-bottom: 0.2em !important;\n    letter-spacing: 0.05em !important;\n}\n\n.applecation .full-episode__name {\n    font-size: 1.1em !important;\n    font-weight: 600 !important;\n    color: #fff !important;\n    margin-bottom: 0.4em !important;\n    white-space: nowrap !important;\n    overflow: hidden !important;\n    text-overflow: ellipsis !important;\n    line-height: 1.4 !important;\n    padding-bottom: 0.1em !important;\n}\n\n.applecation .full-episode__overview {\n    font-size: 0.85em !important;\n    line-height: 1.4 !important;\n    color: rgba(255,255,255,0.5) !important;\n    display: -webkit-box !important;\n    -webkit-line-clamp: 2 !important;\n    -webkit-box-orient: vertical !important;\n    overflow: hidden !important;\n    margin-bottom: 0.6em !important;\n    height: 2.8em !important;\n}\n\n.applecation .full-episode__date {\n    font-size: 0.8em !important;\n    color: rgba(255,255,255,0.3) !important;\n}\n\n\n/* =========================================================\n   БАЗА: ничего не блюрим/не затемняем без фокуса\n   ========================================================= */\n\n.applecation .full-episode{\n  position: relative;\n  z-index: 1;\n  opacity: 1;\n  filter: none;\n\n  transition: transform .6s cubic-bezier(.16,1,.3,1);\n}\n\n/* без фокуса — вообще без эффектов */\n.applecation .full-episode:not(.focus){\n  transform: none;\n}\n\n/* фокус — мягкий “apple” подъём */\n.applecation .full-episode.focus{\n  z-index: 10;\n  transform: scale(1.03) translateY(-6px);\n}\n\n\n/* =========================================================\n   КАРТИНКА\n   ========================================================= */\n\n.applecation .full-episode__img{\n  position: relative;\n  overflow: hidden;\n  border-radius: inherit;\n\n  transition:\n    box-shadow .6s cubic-bezier(.16,1,.3,1),\n    backdrop-filter .6s cubic-bezier(.16,1,.3,1),\n    transform .6s cubic-bezier(.16,1,.3,1);\n}\n\n\n/* =========================================================\n   ЖИДКОЕ СТЕКЛО — ТОЛЬКО НА ФОКУСЕ\n   ========================================================= */\n\n.applecation .full-episode.focus .full-episode__img{\n  box-shadow:\n    0 0 0 1px rgba(255,255,255,.18),\n    0 26px 65px rgba(0,0,0,.4) !important;\n\n  -webkit-backdrop-filter: blur(14px) saturate(1.25) contrast(1.05);\n  backdrop-filter: blur(14px) saturate(1.25) contrast(1.05);\n\n  background: rgba(255,255,255,.06);\n}\n\n/* толщина стекла */\n.applecation .full-episode.focus .full-episode__img::before{\n  content: '';\n  position: absolute;\n  inset: 0;\n  border-radius: inherit;\n  pointer-events: none;\n  z-index: 2;\n\n  box-shadow:\n    inset 0 0 0 1px rgba(255,255,255,.22),\n    inset 0 0 18px rgba(255,255,255,.12),\n    inset 0 -14px 22px rgba(0,0,0,.18);\n\n  filter: blur(.35px);\n  opacity: 1;\n  transition: opacity .45s ease;\n}\n\n/* блик */\n.applecation .full-episode.focus .full-episode__img::after{\n  content: '';\n  position: absolute;\n  inset: 0;\n  border-radius: inherit;\n  pointer-events: none;\n  z-index: 3;\n\n  background:\n    radial-gradient(120% 85% at 18% 10%,\n      rgba(255,255,255,.38),\n      rgba(255,255,255,.10) 38%,\n      transparent 62%),\n    linear-gradient(135deg,\n      rgba(255,255,255,.20),\n      rgba(255,255,255,0) 52%,\n      rgba(255,255,255,.06));\n\n  mix-blend-mode: screen;\n  opacity: .95;\n\n  transition:\n    opacity .45s ease,\n    transform .65s cubic-bezier(.16,1,.3,1);\n}\n\n/* когда фокуса нет — просто не показываем слои стекла */\n.applecation .full-episode:not(.focus) .full-episode__img::before,\n.applecation .full-episode:not(.focus) .full-episode__img::after{\n  opacity: 0;\n}\n\n/* убрать старый оверлей */\n.applecation .full-episode.focus::after{\n  display: none !important;\n}\n\n\n\n.applecation .full-episode__viewed {\n    top: 0.8em !important;\n    right: 0.8em !important;\n    background: rgba(0,0,0,0.5) !important;\n    border-radius: 50% !important;\n    padding: 0.3em !important;\n    backdrop-filter: blur(10px) !important;\n}\n\n/* Статус следующей серии */\n.applecation .full-episode--next .full-episode__img:after {\n    border-radius: 0.8em !important;\n}\n\n/* Оверлей для полного описания */\n.applecation-description-overlay {\n    position: fixed;\n    top: 0;\n    left: 0;\n    right: 0;\n    bottom: 0;\n    z-index: 9999;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    opacity: 0;\n    visibility: hidden;\n    pointer-events: none;\n    transition: opacity 0.3s ease, visibility 0.3s ease;\n}\n\n.applecation-description-overlay.show {\n    opacity: 1;\n    visibility: visible;\n    pointer-events: all;\n}\n\n.applecation-description-overlay__bg {\n    position: absolute;\n    top: 0;\n    left: 0;\n    right: 0;\n    bottom: 0;\n    -webkit-backdrop-filter: blur(100px);\n    backdrop-filter: blur(100px);\n}\n\n.applecation-description-overlay__content {\n    position: relative;\n    z-index: 1;\n    max-width: 60vw;\n    max-height: 90vh;\n    overflow-y: auto;\n}\n\n.applecation-description-overlay__logo {\n    text-align: center;\n    margin-bottom: 1.5em;\n    display: none;\n}\n\n.applecation-description-overlay__logo img {\n    max-width: 40vw;\n    max-height: 150px;\n    width: auto;\n    height: auto;\n    object-fit: contain;\n}\n\n.applecation-description-overlay__title {\n    font-size: 2em;\n    font-weight: 600;\n    margin-bottom: 1em;\n    color: #fff;\n    text-align: center;\n}\n\n.applecation-description-overlay__text {\n    font-size: 1.2em;\n    line-height: 1.6;\n    color: rgba(255, 255, 255, 0.9);\n    white-space: pre-wrap;\n    margin-bottom: 1.5em;\n}\n\n.applecation-description-overlay__details {\n    display: flex;\n    flex-wrap: wrap;\n    margin: -1em;\n}\n\n.applecation-description-overlay__details > * {\n    margin: 1em;\n}\n\n.applecation-description-overlay__info-name {\n    font-size: 1.1em;\n    margin-bottom: 0.5em;\n}\n\n.applecation-description-overlay__info-body {\n    font-size: 1.2em;\n    opacity: 0.6;\n}\n\n/* Скроллбар для описания */\n.applecation-description-overlay__content::-webkit-scrollbar {\n    width: 0.5em;\n}\n\n.applecation-description-overlay__content::-webkit-scrollbar-track {\n    background: rgba(255, 255, 255, 0.1);\n    border-radius: 1em;\n}\n\n.applecation-description-overlay__content::-webkit-scrollbar-thumb {\n    background: rgba(255, 255, 255, 0.3);\n    border-radius: 1em;\n}\n\n.applecation-description-overlay__content::-webkit-scrollbar-thumb:hover {\n    background: rgba(255, 255, 255, 0.5);\n}\n\n/* =========================================================\n   ПЕРСОНЫ (АКТЕРЫ И СЪЕМОЧНАЯ ГРУППА) - APPLE TV СТИЛЬ\n   ========================================================= */\n\n.applecation .full-person {\n    display: flex !important;\n    flex-direction: column !important;\n    align-items: center !important;\n    width: 10.7em !important;\n    background: none !important;\n    transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) !important;\n    will-change: transform;\n    -webkit-animation: none !important;\n    animation: none !important;\n    margin-left: 0;\n}\n\n.applecation .full-person.focus {\n    transform: scale(1.08) translateY(-6px) !important;\n    z-index: 10;\n}\n\n/* Фото персоны - круглое */\n.applecation .full-person__photo {\n    position: relative !important;\n    width: 9.4em !important;\n    height: 9.4em !important;\n    margin: 0 0 .3em 0 !important;\n    border-radius: 50% !important;\n    overflow: hidden !important;\n    background: rgba(255, 255, 255, 0.05) !important;\n    flex-shrink: 0 !important;\n    transition: \n        box-shadow 0.6s cubic-bezier(0.16, 1, 0.3, 1),\n        backdrop-filter 0.6s cubic-bezier(0.16, 1, 0.3, 1),\n        -webkit-backdrop-filter 0.6s cubic-bezier(0.16, 1, 0.3, 1),\n        transform 0.6s cubic-bezier(0.16, 1, 0.3, 1),\n        background 0.6s cubic-bezier(0.16, 1, 0.3, 1) !important;\n    will-change: transform, box-shadow, backdrop-filter;\n    -webkit-animation: none !important;\n    animation: none !important;\n}\n\n.applecation .full-person__photo img {\n    width: 100% !important;\n    height: 100% !important;\n    object-fit: cover !important;\n    border-radius: 50% !important;\n}\n\n/* Смещаем лицо только при высоком качестве (w500), так как там другой кроп у TMDB */\n.applecation.applecation--poster-high .full-person__photo img {\n    object-position: center calc(50% + 20px) !important;\n}\n\n/* Дефолтные заглушки оставляем по центру, чтобы не ломать симметрию иконок */\n.applecation .full-person__photo img[src*=\"actor.svg\"],\n.applecation .full-person__photo img[src*=\"img_broken.svg\"] {\n    object-position: center !important;\n}\n\n/* ЖИДКОЕ СТЕКЛО — БАЗОВЫЕ СЛОИ (скрыты) */\n.applecation .full-person__photo::before,\n.applecation .full-person__photo::after {\n    content: '';\n    position: absolute;\n    inset: 0;\n    border-radius: 50%;\n    pointer-events: none;\n    opacity: 0;\n    transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1) !important;\n    will-change: opacity;\n}\n\n/* толщина стекла */\n.applecation .full-person__photo::before {\n    z-index: 2;\n    box-shadow:\n        inset 2px 2px 1px rgba(255, 255, 255, 0.30),\n        inset -2px -2px 2px rgba(255, 255, 255, 0.30);\n}\n\n/* ореол и блик */\n.applecation .full-person__photo::after {\n    z-index: 3;\n    background:\n        radial-gradient(circle at center,\n            transparent 58%,\n            rgba(255, 255, 255, 0.22) 75%,\n            rgba(255, 255, 255, 0.38) 90%),\n        radial-gradient(120% 85% at 18% 10%,\n            rgba(255, 255, 255, 0.35),\n            rgba(255, 255, 255, 0.10) 38%,\n            transparent 62%);\n    mix-blend-mode: screen;\n}\n\n/* ЭФФЕКТЫ ПРИ ФОКУСЕ */\n\n.applecation .full-person.focus .full-person__photo::before,\n.applecation .full-person.focus .full-person__photo::after {\n    opacity: 1;\n}\n\n.applecation .full-person.focus .full-person__photo::after {\n    opacity: 0.9;\n}\n\n/* Текстовая информация */\n.applecation .full-person__body {\n    display: flex !important;\n    flex-direction: column !important;\n    align-items: center !important;\n    text-align: center !important;\n    width: 100% !important;\n    padding: 0 0.3em !important;\n}\n\n/* Имя персоны */\n.applecation .full-person__name {\n    font-size: 1em !important;\n    font-weight: 600 !important;\n    color: #fff !important;\n    line-height: 1.3 !important;\n    width: 100% !important;\n    white-space: nowrap !important;\n    overflow: hidden !important;\n    text-overflow: ellipsis !important;\n    position: relative !important;\n}\n\n/* Бегущая строка для длинных имен */\n.applecation .full-person__name.marquee-active {\n    text-overflow: clip !important;\n    mask-image: linear-gradient(to right, #000 92%, transparent 100%);\n    -webkit-mask-image: linear-gradient(to right, #000 92%, transparent 100%);\n}\n\n/* При фокусе (когда строка едет) прозрачность с обеих сторон */\n.applecation .full-person.focus .full-person__name.marquee-active {\n    mask-image: linear-gradient(to right, transparent 0%, #000 7%, #000 93%, transparent 100%);\n    -webkit-mask-image: linear-gradient(to right, transparent 0%, #000 7%, #000 93%, transparent 100%);\n}\n\n.applecation .marquee__inner {\n    display: inline-block;\n    white-space: nowrap;\n}\n\n.applecation .marquee__inner span {\n    padding-right: 2.5em;\n    display: inline-block;\n}\n\n/* Запуск анимации при фокусе */\n.applecation .full-person.focus .full-person__name.marquee-active .marquee__inner {\n    animation: marquee var(--marquee-duration, 5s) linear infinite;\n}\n\n@keyframes marquee {\n    0% { transform: translateX(0); }\n    100% { transform: translateX(-50%); }\n}\n\n/* Роль персоны */\n.applecation .full-person__role {\n    font-size: 0.8em !important;\n    font-weight: 400 !important;\n    color: rgba(255, 255, 255, 0.5) !important;\n    line-height: 1.3 !important;\n    white-space: nowrap !important;\n    overflow: hidden !important;\n    text-overflow: ellipsis !important;\n    width: 100% !important;\n    margin-top: 0;\n}\n\n.applecation .full-person.focus .full-person__role {\n    color: rgb(255, 255, 255) !important;\n}\n</style>`;

            var css = cssRaw.replace(/\\n/g, '\n').replace(/\\"/g, '"');
            $('body').append(css);

            if (!document.getElementById('flixio_applecation_css_mobile_fix')) {
                $('body').append('<style id="flixio_applecation_css_mobile_fix">@media screen and (max-width: 720px){.applecation .full-start-new__body{height:auto!important;min-height:0!important}.applecation .full-start-new__right{display:block!important}.applecation .applecation__right{display:none!important}.applecation .applecation__left{width:100%!important;max-width:none!important}.applecation .applecation__content-wrapper{width:100%!important}.applecation .applecation__description-wrapper{width:100%!important}.applecation .applecation__description{max-width:none!important;width:100%!important}}</style>');
            }
        }
    }

    function initAppleTvFullCardLogoRuntime() {
        if (window.FLIXIO_APPLETV_LOGO_RUNTIME) return;
        window.FLIXIO_APPLETV_LOGO_RUNTIME = true;
        if (!Lampa.Listener || !Lampa.Listener.follow) return;

        function waitForBackground(render, callback) {
            var background = render.find('.full-start__background:not(.applecation__overlay)');
            if (!background.length) return callback();
            if (background.hasClass('loaded')) {
                return setTimeout(callback, 350);
            }
            var interval = setInterval(function () {
                if (!render.closest('body').length) {
                    clearInterval(interval);
                    return;
                }
                if (background.hasClass('loaded')) {
                    clearInterval(interval);
                    setTimeout(callback, 650);
                }
            }, 50);
            setTimeout(function () {
                clearInterval(interval);
                callback();
            }, 2000);
        }

        function finalize(render) {
            render.find('.applecation__meta').addClass('show');
            render.find('.applecation__studios').addClass('show');
            render.find('.applecation__description-wrapper').addClass('show');
            render.find('.applecation__info').addClass('show');
            render.find('.full-start-new__rate-line.applecation__ratings').addClass('show');
        }

        function loadLogo(render, movie) {
            var logo = render.find('.applecation__logo');
            var titleEl = render.find('.full-start-new__title');
            if (!logo.length) return;

            var done = false;
            var timer = setTimeout(function () {
                if (done) return;
                done = true;
                titleEl.show();
                logo.addClass('loaded');
                finalize(render);
            }, 2500);

            var type = movie && movie.name ? 'tv' : 'movie';
            var lang = Lampa.Storage.get('language') || 'ru';
            var url = Lampa.TMDB.api(type + '/' + movie.id + '/images?api_key=' + Lampa.TMDB.key() + '&language=' + lang);
            var urlAll = Lampa.TMDB.api(type + '/' + movie.id + '/images?api_key=' + Lampa.TMDB.key());

            function logoSize() {
                var q = Lampa.Storage.get('applecation_poster_quality', 'medium');
                if (q === 'low') return 'w300';
                if (q === 'medium') return 'w500';
                if (q === 'high') return 'original';
                var posterSize = Lampa.Storage.field ? Lampa.Storage.field('poster_size') : null;
                return { w200: 'w300', w300: 'w500', w500: 'original' }[posterSize] || 'w500';
            }

            function applyLogoFromData(data) {
                if (done) return;
                if (!render.closest('body').length) return;

                var filePath = (data && data.logos && data.logos[0] && data.logos[0].file_path) ? data.logos[0].file_path : null;

                if (filePath) {
                    var imgUrl = Lampa.TMDB.image('/t/p/' + logoSize() + filePath);
                    var img = new Image();
                    img.onload = function () {
                        if (done) return;
                        done = true;
                        clearTimeout(timer);
                        if (!render.closest('body').length) return;
                        logo.html('<img src="' + imgUrl + '" alt="" />');
                        waitForBackground(render, function () {
                            if (!render.closest('body').length) return;
                            logo.addClass('loaded');
                            finalize(render);
                        });
                        var overlay = $('.applecation-description-overlay');
                        if (overlay.length) {
                            overlay.find('.applecation-description-overlay__logo').html($('<img>').attr('src', imgUrl)).css('display', 'block');
                            overlay.find('.applecation-description-overlay__title').css('display', 'none');
                        }
                    };
                    img.onerror = function () {
                        if (done) return;
                        done = true;
                        clearTimeout(timer);
                        titleEl.show();
                        waitForBackground(render, function () {
                            if (!render.closest('body').length) return;
                            logo.addClass('loaded');
                            finalize(render);
                        });
                    };
                    img.src = imgUrl;
                } else {
                    done = true;
                    clearTimeout(timer);
                    titleEl.show();
                    waitForBackground(render, function () {
                        if (!render.closest('body').length) return;
                        logo.addClass('loaded');
                        finalize(render);
                    });
                }
            }

            $.get(url, function (data) {
                if (data && data.logos && data.logos.length) applyLogoFromData(data);
                else $.get(urlAll, function (dataAll) { applyLogoFromData(dataAll || data); }).fail(function () { applyLogoFromData(data); });
            }).fail(function () {
                if (done) return;
                done = true;
                clearTimeout(timer);
                titleEl.show();
                waitForBackground(render, function () {
                    if (!render.closest('body').length) return;
                    logo.addClass('loaded');
                    finalize(render);
                });
            });
        }

        Lampa.Listener.follow('full', function (e) {
            if (e.type !== 'complite') return;
            var activity = e.object && e.object.activity;
            if (!activity || !activity.render) return;
            var render = activity.render();
            if (!render || !render.length) return;
            if (!render.find('.applecation__logo, .full-start-new__title').length) return;

            var movie = e.data && e.data.movie;
            if (!movie || !movie.id) return;
            loadLogo(render, movie);
        });
    }

    function initAppleTvFullCardInfoRuntime() {
        if (window.FLIXIO_APPLETV_INFO_RUNTIME) return;
        window.FLIXIO_APPLETV_INFO_RUNTIME = true;
        if (!Lampa.Listener || !Lampa.Listener.follow) return;

        function typeLabel(movie) {
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
                return count + ' ' + ((a[lang] || a.ru)[count % 100 > 4 && count % 100 < 20 ? 2 : t[Math.min(count % 10, 5)]]);
            }
            if (lang === 'en') return count === 1 ? count + ' Season' : count + ' Seasons';
            if (lang === 'cs') return count === 1 || (count >= 2 && count <= 4) ? count + ' série' : count + ' sérií';
            if (lang === 'pt') return count === 1 ? count + ' Temporada' : count + ' Temporadas';
            if (lang === 'he') return count === 1 ? 'עונה ' + count : count + ' עונות';
            if (lang === 'zh') return count + ' 季';
            var key = Lampa.Lang.translate('full_season');
            return count === 1 ? count + ' ' + key : count + ' ' + key + 's';
        }

        function insertOverlayBackground(render) {
            var bg = render.find('.full-start__background');
            if (bg.length && !bg.next('.applecation__overlay').length) {
                bg.after('<div class="full-start__background loaded applecation__overlay"></div>');
            }
        }

        function fillMeta(render, movie) {
            var metaText = render.find('.applecation__meta-text');
            if (metaText.length) {
                var parts = [];
                parts.push(typeLabel(movie));
                if (movie.genres && movie.genres.length) {
                    var g = movie.genres.slice(0, 2).map(function (x) { return Lampa.Utils.capitalizeFirstLetter(x.name); });
                    parts = parts.concat(g);
                }
                metaText.html(parts.join(' · '));
            }

            var networkNode = render.find('.applecation__network');
            if (networkNode.length) {
                networkNode.remove();
            }
        }

        function ensureStudiosStyle() {
            if (document.getElementById('flixio_applecation_studios_css')) return;
            var css = '' +
                '.applecation__studios{display:flex;align-items:center;flex-wrap:wrap;gap:.7em;margin:0 0 .6em 0;opacity:0;transform:translateY(15px);transition:opacity .4s ease-out,transform .4s ease-out;transition-delay:.07s}' +
                '.applecation__studios.show{opacity:1;transform:translateY(0)}' +
                '.applecation__studio{display:inline-flex;align-items:center;gap:.4em;background:rgba(255,255,255,.08);border:1px solid transparent;border-radius:.6em;padding:.25em .6em;transition:all .2s ease;cursor:pointer}' +
                '.applecation__studio.focus{background:rgba(255,255,255,.2);border:1px solid #fff;transform:scale(1.05)}' +
                '.applecation__studio img{height:1.3em;max-width:200px;width:auto;object-fit:contain;filter:brightness(0) invert(1)}' +
                '.applecation__studio-name{font-size:.85em;font-weight:700;color:#fff;white-space:nowrap}';
            $('head').append('<style id="flixio_applecation_studios_css">' + css + '</style>');
        }

        function fillStudios(render, movie) {
            ensureStudiosStyle();

            var meta = render.find('.applecation__meta');
            if (!meta.length) return;

            var container = render.find('.applecation__studios');
            if (!container.length) {
                container = $('<div class="applecation__studios"></div>');
                container.insertAfter(meta);
            }

            var companies = (movie && movie.production_companies && movie.production_companies.length) ? movie.production_companies.slice(0, 3) : [];
            if (!companies.length) {
                container.remove();
                return;
            }

            function imgFor(path) {
                if (!path) return '';
                if (Lampa.Api && typeof Lampa.Api.img === 'function') return Lampa.Api.img(path, 'h100');
                return 'https://image.tmdb.org/t/p/h100' + path;
            }

            container.empty();
            companies.forEach(function (co) {
                if (!co || !co.id) return;
                var node = $('<div class="applecation__studio selector" data-id="' + co.id + '" data-name="' + (co.name || '') + '"></div>');
                if (co.logo_path) {
                    node.append('<img src="' + imgFor(co.logo_path) + '" title="' + (co.name || '') + '" />');
                } else {
                    node.append('<span class="applecation__studio-name">' + (co.name || '') + '</span>');
                }
                node.off('hover:enter.applecation_studio click.applecation_studio')
                    .on('hover:enter.applecation_studio click.applecation_studio', function () {
                        var id = $(this).data('id');
                        if (!id) return;
                        Lampa.Activity.push({
                            url: 'movie',
                            id: id,
                            title: $(this).data('name') || '',
                            component: 'company',
                            source: 'tmdb',
                            page: 1
                        });
                    });
                container.append(node);
            });

            if (Lampa.Controller && Lampa.Controller.collectionAppend) {
                container.find('.applecation__studio').each(function () {
                    Lampa.Controller.collectionAppend($(this));
                });
            }

            setTimeout(function () {
                try {
                    var current = Lampa.Controller && Lampa.Controller.enabled && Lampa.Controller.enabled();
                    if (current && current.name && (current.name === 'full_start' || current.name === 'full_descr' || current.name === 'full')) {
                        current.collection = render.find('.selector');
                    }
                } catch (e) { }
            }, 100);
        }

        function buildDescriptionOverlay(movie) {
            if (!Lampa.Storage.get('applecation_description_overlay', true)) return;
            var text = movie.overview || '';
            if (!text) return;

            $('.applecation-description-overlay').remove();

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
        }

        function attachDescriptionOverlay(render) {
            if (!Lampa.Storage.get('applecation_description_overlay', true)) {
                render.find('.applecation__description-wrapper').off('hover:enter');
                $('.applecation-description-overlay').remove();
                return;
            }

            var wrap = render.find('.applecation__description-wrapper');
            if (!wrap.length) return;
            wrap.off('hover:enter').on('hover:enter', function () {
                var overlay = $('.applecation-description-overlay');
                if (!overlay.length) return;
                setTimeout(function () { overlay.addClass('show'); }, 10);

                if (!overlay.data('controller-created') && Lampa.Controller) {
                    var ctrl = {
                        toggle: function () {
                            Lampa.Controller.collectionSet(overlay);
                            Lampa.Controller.collectionFocus(overlay.find('.applecation-description-overlay__content'), overlay);
                        },
                        back: function () {
                            var ol = $('.applecation-description-overlay');
                            if (!ol.length) return;
                            ol.removeClass('show');
                            setTimeout(function () { Lampa.Controller.toggle('content'); }, 300);
                        }
                    };
                    Lampa.Controller.add('applecation_description', ctrl);
                    overlay.data('controller-created', true);
                }

                if (Lampa.Controller) Lampa.Controller.toggle('applecation_description');
            });

            if (Lampa.Controller && Lampa.Controller.collectionAppend) {
                wrap.addClass('selector');
                Lampa.Controller.collectionAppend(wrap);
            }
        }

        function fillDescription(render, movie) {
            var description = render.find('.applecation__description');
            if (description.length) description.text(movie.overview || '');
            buildDescriptionOverlay(movie);
            attachDescriptionOverlay(render);
        }

        function fillInfo(render, movie) {
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

                // Добавляем информацию о сезоне и сериях
                var lastEpisode = movie.last_episode_to_air;
                if (lastEpisode && lastEpisode.season_number && lastEpisode.episode_number) {
                    var seasonNumber = lastEpisode.season_number;
                    var episodeNumber = lastEpisode.episode_number;
                    
                    // Ищем общее количество серий в сезоне
                    var totalEpisodes = '?';
                    if (movie.seasons && Array.isArray(movie.seasons)) {
                        for (var i = 0; i < movie.seasons.length; i++) {
                            var season = movie.seasons[i];
                            if (season.season_number === seasonNumber && season.episode_count) {
                                totalEpisodes = season.episode_count;
                                break;
                            }
                        }
                    }
                    
                    // Формируем текст "1 сезон 2/20 серий"
                    var seasonText = seasonNumber + ' сезон ' + episodeNumber + '/' + totalEpisodes + ' серий';
                    parts.push(seasonText);
                } else {
                    // Если нет данных о последнем эпизоде, показываем просто количество сезонов
                    var seasons = (typeof movie.number_of_seasons === 'number' && movie.number_of_seasons > 0) ? movie.number_of_seasons : (Lampa.Utils.countSeasons ? Lampa.Utils.countSeasons(movie) : 0);
                    if (seasons) parts.push(pluralSeasons(seasons));
                }
            } else if (movie.runtime && movie.runtime > 0) {
                var h = Math.floor(movie.runtime / 60);
                var mm = movie.runtime % 60;
                var th = Lampa.Lang.translate('time_h').replace('.', '');
                var tmm = Lampa.Lang.translate('time_m').replace('.', '');
                parts.push(h > 0 ? (h + ' ' + th + ' ' + mm + ' ' + tmm) : (mm + ' ' + tmm));
            }

            info.html((parts.length ? parts.join(' · ') : '') + '<span class="applecation__quality-badges"></span>');
        }

        function parseFfprobe(streams) {
            if (!streams || !Array.isArray(streams)) return null;
            var video = null;
            var audio = [];
            for (var i = 0; i < streams.length; i++) {
                if (streams[i].codec_type === 'video' && !video) video = streams[i];
                if (streams[i].codec_type === 'audio') audio.push(streams[i]);
            }

            var resLabel = null;
            if (video && video.width && video.height) {
                if (video.height >= 2160 || video.width >= 3840) resLabel = '4K';
                else if (video.height >= 1440 || video.width >= 2560) resLabel = '2K';
                else if (video.height >= 1080 || video.width >= 1920) resLabel = 'FULL HD';
                else if (video.height >= 720 || video.width >= 1280) resLabel = 'HD';
            }

            var channels = 0;
            for (var j = 0; j < audio.length; j++) {
                if (audio[j].channels && audio[j].channels > channels) channels = audio[j].channels;
            }

            var audioLabel = null;
            if (channels >= 8) audioLabel = '7.1';
            else if (channels >= 6) audioLabel = '5.1';
            else if (channels >= 4) audioLabel = '4.0';
            else if (channels >= 2) audioLabel = '2.0';

            var hdr = new Set();
            if (video) {
                if (video.side_data_list && Array.isArray(video.side_data_list)) {
                    var hasMd = video.side_data_list.some(function (x) { return x.side_data_type === 'Mastering display metadata'; });
                    var hasCl = video.side_data_list.some(function (x) { return x.side_data_type === 'Content light level metadata'; });
                    var hasDv = video.side_data_list.some(function (x) { return x.side_data_type === 'DOVI configuration record' || x.side_data_type === 'Dolby Vision RPU'; });
                    if (hasDv) hdr.add('Dolby Vision');
                    else if (hasMd || hasCl) hdr.add('HDR');
                }

                if (!hdr.size && video.color_transfer && ['smpte2084', 'arib-std-b67'].indexOf((video.color_transfer || '').toLowerCase()) !== -1) hdr.add('HDR');
                if (!hdr.size && video.codec_name && ((video.codec_name || '').toLowerCase().indexOf('dovi') !== -1 || (video.codec_name || '').toLowerCase().indexOf('dolby') !== -1)) hdr.add('Dolby Vision');
            }

            return { resolutionLabel: resLabel, audio: audioLabel, hdr: hdr };
        }

        function updateQualityBadges(render, movie) {
            var target = render.find('.applecation__quality-badges');
            if (!target.length) return;

            function renderBadges(info) {
                if (!info) return;
                var a = [];

                function textBadge(label) {
                    return '<svg viewBox="0 0 311 134" fill="none" xmlns="http://www.w3.org/2000/svg">' +
                        '<rect x="2.5" y="2.5" width="306" height="129" rx="17.5" stroke="currentColor" stroke-width="5" fill="none"/>' +
                        '<text x="155.5" y="88" text-anchor="middle" fill="currentColor" font-family="Arial, sans-serif" font-size="64" font-weight="700">' + label + '</text>' +
                        '</svg>';
                }

                if (info.quality) {
                    var n = '';
                    var q = info.quality;
                    if (q === 'FULL HD') q = 'FHD';
                    if (q === '1080p') q = 'FHD';
                    if (q === '720p') q = 'HD';
                    if (q === 'SD') q = '';
                    if (q === '4K') n = '<svg viewBox="0 0 311 134" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M291 0C302.046 3.57563e-06 311 8.95431 311 20V114C311 125.046 302.046 134 291 134H20C8.95431 134 0 125.046 0 114V20C0 8.95431 8.95431 0 20 0H291ZM113 20.9092L74.1367 82.1367V97.6367H118.818V114H137.637V97.6367H149.182V81.8633H137.637V20.9092H113ZM162.841 20.9092V114H182.522V87.5459L192.204 75.7275L217.704 114H241.25L206.296 62.5908L240.841 20.9092H217.25L183.75 61.9541H182.522V20.9092H162.841ZM119.182 81.8633H93.9541V81.1367L118.454 42.3633H119.182V81.8633Z" fill="white"/></svg>';
                    else if (q) n = textBadge(q);
                    if (n) a.push('<div class="quality-badge quality-badge--res">' + n + '</div>');
                }

                if (info.dv) a.push('<div class="quality-badge quality-badge--dv"><svg viewBox="0 0 1051 393" xmlns="http://www.w3.org/2000/svg"><g transform="translate(0,393) scale(0.1,-0.1)" fill="currentColor"><path d="M50 2905 l0 -1017 223 5 c146 4 244 11 287 21 361 85 638 334 753 677 39 116 50 211 44 366 -7 200 -52 340 -163 511 -130 199 -329 344 -574 419 -79 24 -102 26 -327 31 l-243 4 0 -1017z"/><path d="M2436 3904 c-443 -95 -762 -453 -806 -905 -30 -308 86 -611 320 -832 104 -99 212 -165 345 -213 133 -47 253 -64 468 -64 l177 0 0 1015 0 1015 -217 -1 c-152 0 -239 -5 -287 -15z"/><path d="M3552 2908 l3 -1013 425 0 c309 0 443 4 490 13 213 43 407 148 550 299 119 124 194 255 247 428 25 84 27 103 27 270 1 158 -2 189 -22 259 -72 251 -221 458 -424 590 -97 63 -170 97 -288 134 l-85 26 -463 4 -462 3 2 -1013z m825 701 c165 -22 283 -81 404 -199 227 -223 279 -550 133 -831 -70 -133 -176 -234 -319 -304 -132 -65 -197 -75 -490 -75 l-245 0 0 703 c0 387 3 707 7 710 11 11 425 8 510 -4z"/><path d="M7070 2905 l0 -1015 155 0 155 0 0 1015 0 1015 -155 0 -155 0 0 -1015z"/><path d="M7640 2905 l0 -1015 150 0 150 0 0 60 c0 33 2 60 5 60 2 0 33 -15 67 -34 202 -110 433 -113 648 -9 79 38 108 59 180 132 72 71 95 102 134 181 102 207 102 414 1 625 -120 251 -394 411 -670 391 -115 -8 -225 -42 -307 -93 -21 -13 -42 -23 -48 -23 -7 0 -10 125 -10 370 l0 370 -150 0 -150 0 0 -1015z m832 95 c219 -67 348 -310 280 -527 -62 -198 -268 -328 -466 -295 -96 15 -168 52 -235 119 -131 132 -164 311 -87 478 27 60 101 145 158 181 100 63 234 80 350 44z"/><path d="M6035 3286 c-253 -49 -460 -232 -542 -481 -23 -70 -26 -96 -26 -210 0 -114 3 -140 26 -210 37 -113 90 -198 177 -286 84 -85 170 -138 288 -177 67 -22 94 -26 207 -26 113 0 140 4 207 26 119 39 204 92 288 177 87 89 140 174 177 286 22 67 26 99 27 200 1 137 -14 207 -69 320 -134 277 -457 440 -760 381z m252 -284 c117 -37 206 -114 260 -229 121 -253 -38 -548 -321 -595 -258 -43 -503 183 -483 447 20 271 287 457 544 377z"/><path d="M9059 3258 c10 -24 138 -312 285 -642 l266 -598 -72 -162 c-39 -88 -78 -171 -86 -183 -37 -58 -132 -80 -208 -48 l-35 14 -18 -42 c-10 -23 -37 -84 -60 -135 -23 -52 -39 -97 -36 -102 3 -4 40 -23 83 -41 70 -31 86 -34 177 -34 93 0 105 2 167 33 76 37 149 104 180 166 29 57 799 1777 805 1799 5 16 -6 17 -161 15 l-167 -3 -185 -415 c-102 -228 -192 -431 -200 -450 l-15 -35 -201 453 -201 452 -168 0 -168 0 18 -42z"/><path d="M2650 968 c0 -2 81 -211 179 -463 l179 -460 59 -3 59 -3 178 453 c98 249 180 459 183 466 4 9 -13 12 -65 12 -47 0 -71 -4 -74 -12 -3 -7 -65 -176 -138 -375 -73 -200 -136 -363 -139 -363 -3 0 -67 168 -142 373 l-136 372 -72 3 c-39 2 -71 1 -71 0z"/><path d="M3805 958 c-3 -7 -4 -215 -3 -463 l3 -450 63 -3 62 -3 0 466 0 465 -60 0 c-39 0 -62 -4 -65 -12z"/><path d="M4580 960 c-97 -16 -178 -72 -211 -145 -23 -50 -24 -143 -3 -193 32 -77 91 -117 244 -167 99 -32 146 -64 166 -112 28 -65 -11 -149 -83 -179 -78 -33 -212 -1 -261 61 l-19 24 -48 -43 -48 -42 43 -37 c121 -103 347 -112 462 -17 54 44 88 120 88 194 -1 130 -79 213 -242 256 -24 7 -71 25 -104 41 -48 22 -66 37 -79 65 -32 67 -5 138 65 174 73 37 193 18 244 -39 l20 -22 43 43 c41 40 42 43 25 61 -27 30 -102 64 -167 76 -64 12 -70 12 -135 1z"/><path d="M5320 505 l0 -465 65 0 65 0 0 465 0 465 -65 0 -65 0 0 -465z"/><path d="M6210 960 c-147 -25 -264 -114 -328 -249 -32 -65 -36 -84 -40 -175 -7 -161 33 -271 135 -367 140 -132 360 -164 541 -77 227 108 316 395 198 634 -88 177 -290 271 -506 234z m232 -132 c100 -46 165 -136 188 -261 20 -106 -18 -237 -88 -310 -101 -105 -245 -132 -377 -73 -74 33 -120 79 -157 154 -31 62 -33 74 -33 167 0 87 4 107 26 155 64 137 173 204 320 196 43 -2 85 -12 121 -28z"/><path d="M7135 958 c-3 -7 -4 -215 -3 -463 l3 -450 63 -3 62 -3 0 376 c0 207 3 374 8 371 4 -2 115 -171 247 -375 l240 -371 78 0 77 0 0 465 0 465 -60 0 -60 0 -2 -372 -3 -372 -241 370 -241 369 -82 3 c-59 2 -83 -1 -86 -10z"/></g></svg></div>');

                if (info.hdr) a.push('<div class="quality-badge quality-badge--hdr"><svg viewBox="-1 178 313 136" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2.5" y="181.5" width="306" height="129" rx="17.5" stroke="currentColor" stroke-width="5" fill="none"/><path d="M27.2784 293V199.909H46.9602V238.318H86.9148V199.909H106.551V293H86.9148V254.545H46.9602V293H27.2784ZM155.778 293H122.778V199.909H156.051C165.415 199.909 173.475 201.773 180.233 205.5C186.991 209.197 192.188 214.515 195.824 221.455C199.491 228.394 201.324 236.697 201.324 246.364C201.324 256.061 199.491 264.394 195.824 271.364C192.188 278.333 186.96 283.682 180.142 287.409C173.354 291.136 165.233 293 155.778 293ZM142.46 276.136H154.96C160.778 276.136 165.672 275.106 169.642 273.045C173.642 270.955 176.642 267.727 178.642 263.364C180.672 258.97 181.688 253.303 181.688 246.364C181.688 239.485 180.672 233.864 178.642 229.5C176.642 225.136 173.657 221.924 169.688 219.864C165.718 217.803 160.824 216.773 155.006 216.773H142.46V276.136ZM215.903 293V199.909H252.631C259.661 199.909 265.661 201.167 270.631 203.682C275.631 206.167 279.434 209.697 282.04 214.273C284.676 218.818 285.994 224.167 285.994 230.318C285.994 236.5 284.661 241.818 281.994 246.273C279.328 250.697 275.464 254.091 270.403 256.455C265.373 258.818 259.282 260 252.131 260H227.54V244.182H248.949C252.706 244.182 255.828 243.667 258.312 242.636C260.797 241.606 262.646 240.061 263.858 238C265.1 235.939 265.722 233.379 265.722 230.318C265.722 227.227 265.1 224.621 263.858 222.5C262.646 220.379 260.782 218.773 258.267 217.682C255.782 216.561 252.646 216 248.858 216H235.585V293H215.903ZM266.176 250.636L289.312 293H267.585L244.949 250.636H266.176Z" fill="currentColor"/></svg></div>');

                if (info.sound) {
                    var s = '';
                    if (info.sound === '7.1') s = '<svg viewBox="-1 368 313 136" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2.5" y="371.5" width="306" height="129" rx="17.5" stroke="currentColor" stroke-width="5" fill="none"/><path d="M91.6023 483L130.193 406.636V406H85.2386V389.909H150.557V406.227L111.92 483H91.6023ZM159.545 484.182C156.545 484.182 153.97 483.121 151.818 481C149.697 478.848 148.636 476.273 148.636 473.273C148.636 470.303 149.697 467.758 151.818 465.636C153.97 463.515 156.545 462.455 159.545 462.455C162.455 462.455 165 463.515 167.182 465.636C169.364 467.758 170.455 470.303 170.455 473.273C170.455 475.273 169.939 477.106 168.909 478.773C167.909 480.409 166.591 481.727 164.955 482.727C163.318 483.697 161.515 484.182 159.545 484.182ZM215.045 389.909V483H195.364V408.591H194.818L173.5 421.955V404.5L196.545 389.909H215.045Z" fill="currentColor"/></svg>';
                    else s = textBadge(info.sound);
                    if (s) a.push('<div class="quality-badge quality-badge--sound">' + s + '</div>');
                }

                if (info.dub) a.push('<div class="quality-badge quality-badge--dub"><svg viewBox="-1 558 313 136" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2.5" y="561.5" width="306" height="129" rx="17.5" stroke="currentColor" stroke-width="5" fill="none"/><path d="M60.5284 673H27.5284V579.909H60.8011C70.1648 579.909 78.2254 581.773 84.983 585.5C91.7405 589.197 96.9375 594.515 100.574 601.455C104.241 608.394 106.074 616.697 106.074 626.364C106.074 636.061 104.241 644.394 100.574 651.364C96.9375 658.333 91.7102 663.682 84.892 667.409C78.1042 671.136 69.983 673 60.5284 673ZM47.2102 656.136H59.7102C65.5284 656.136 70.4223 655.106 74.392 653.045C78.392 650.955 81.392 647.727 83.392 643.364C85.4223 638.97 86.4375 633.303 86.4375 626.364C86.4375 619.485 85.4223 613.864 83.392 609.5C81.392 605.136 78.4072 601.924 74.4375 599.864C70.4678 597.803 65.5739 596.773 59.7557 596.773H47.2102V656.136ZM178.153 579.909H197.835V640.364C197.835 647.152 196.214 653.091 192.972 658.182C189.759 663.273 185.259 667.242 179.472 670.091C173.684 672.909 166.941 674.318 159.244 674.318C151.517 674.318 144.759 672.909 138.972 670.091C133.184 667.242 128.684 663.273 125.472 658.182C122.259 653.091 120.653 647.152 120.653 640.364V579.909H140.335V638.682C140.335 642.227 141.108 645.379 142.653 648.136C144.229 650.894 146.441 653.061 149.29 654.636C152.138 656.212 155.456 657 159.244 657C163.063 657 166.381 656.212 169.199 654.636C172.047 653.061 174.244 650.894 175.79 648.136C177.366 645.379 178.153 642.227 178.153 638.682V579.909ZM214.028 673V579.909H251.301C258.15 579.909 263.862 580.924 268.438 582.955C273.013 584.985 276.453 587.803 278.756 591.409C281.059 594.985 282.21 599.106 282.21 603.773C282.21 607.409 281.483 610.606 280.028 613.364C278.574 616.091 276.574 618.333 274.028 620.091C271.513 621.818 268.634 623.045 265.392 623.773V624.682C268.938 624.833 272.256 625.833 275.347 627.682C278.468 629.53 280.998 632.121 282.938 635.455C284.877 638.758 285.847 642.697 285.847 647.273C285.847 652.212 284.619 656.621 282.165 660.5C279.741 664.348 276.15 667.394 271.392 669.636C266.634 671.879 260.771 673 253.801 673H214.028ZM233.71 656.909H249.756C255.241 656.909 259.241 655.864 261.756 653.773C264.271 651.652 265.528 648.833 265.528 645.318C265.528 642.742 264.907 640.47 263.665 638.5C262.422 636.53 260.65 634.985 258.347 633.864C256.074 632.742 253.362 632.182 250.21 632.182H233.71V656.909ZM233.71 618.864H248.301C250.998 618.864 253.392 618.394 255.483 617.455C257.604 616.485 259.271 615.121 260.483 613.364C261.725 611.606 262.347 609.5 262.347 607.045C262.347 603.682 261.15 600.97 258.756 598.909C256.392 596.848 253.028 595.818 248.665 595.818H233.71V618.864Z" fill="currentColor"/></svg></div>');

                if (a.length > 0) {
                    target.html(a.join(''));
                    target.addClass('show');
                }
            }

            function fallbackBadges() {
                if (!window.FLIXIO_GET_BEST_JACRED) return;
                window.FLIXIO_GET_BEST_JACRED(movie, function (q) {
                    if (!q || q.empty) return;
                    renderBadges({
                        quality: q.resolution,
                        dv: !!q.dolbyVision,
                        hdr: !!q.hdr,
                        hdr_type: q.hdr ? 'HDR' : null,
                        sound: q.sound || null,
                        dub: !!q.dub
                    });
                });
            }

            if (!Lampa.Parser || typeof Lampa.Parser.get !== 'function') {
                fallbackBadges();
                return;
            }

            if (Lampa.Storage && Lampa.Storage.field && Lampa.Storage.field('parser_use') === false) {
                fallbackBadges();
                return;
            }

            var year = ((movie.first_air_date || movie.release_date || '0000') + '').slice(0, 4);
            var originalTitle = (movie.original_title || movie.original_name || '').trim();
            var mainTitle = (movie.title || movie.name || '').trim();
            if (!originalTitle) originalTitle = mainTitle;
            var parseLang = Lampa.Storage.field('parse_lang') || 'lg';
            var keyMap = {
                df: originalTitle,
                df_year: originalTitle + ' ' + year,
                df_lg: originalTitle + ' ' + mainTitle,
                df_lg_year: originalTitle + ' ' + mainTitle + ' ' + year,
                lg: mainTitle,
                lg_year: mainTitle + ' ' + year,
                lg_df: mainTitle + ' ' + originalTitle,
                lg_df_year: mainTitle + ' ' + originalTitle + ' ' + year
            };
            var search = (keyMap[parseLang] || mainTitle).trim();
            if (!search) return;

            Lampa.Parser.get({ search: search, movie: movie, page: 1 }, function (data) {
                if (!render.closest('body').length) return;
                if (!data || !data.Results || !data.Results.length) {
                    fallbackBadges();
                    return;
                }

                var agg = { resolutions: new Set(), hdr: new Set(), audio: new Set(), hasDub: false };

                data.Results.forEach(function (item) {
                    var titleLower = ((item.Title || '') + '').toLowerCase();

                    if (titleLower.indexOf('2160') !== -1 || /\b4k\b/.test(titleLower) || titleLower.indexOf('uhd') !== -1) agg.resolutions.add('4K');
                    else if (titleLower.indexOf('1440') !== -1 || /\b2k\b/.test(titleLower)) agg.resolutions.add('2K');
                    else if (titleLower.indexOf('1080') !== -1 || titleLower.indexOf('fhd') !== -1) agg.resolutions.add('FULL HD');
                    else if (titleLower.indexOf('720') !== -1 || /\bhd\b/.test(titleLower)) agg.resolutions.add('HD');

                    if (/\b7\.1\b/.test(titleLower)) agg.audio.add('7.1');
                    else if (/\b5\.1\b/.test(titleLower)) agg.audio.add('5.1');
                    else if (/\b4\.0\b/.test(titleLower)) agg.audio.add('4.0');
                    else if (/\b2\.0\b/.test(titleLower)) agg.audio.add('2.0');

                    if (!agg.hasDub) {
                        if (titleLower.indexOf('dub') !== -1 || titleLower.indexOf('дубляж') !== -1 || titleLower.indexOf('дублир') !== -1 || /\bd\b/.test(titleLower)) {
                            agg.hasDub = true;
                        }
                    }

                    if (item.ffprobe && Array.isArray(item.ffprobe)) {
                        var parsed = parseFfprobe(item.ffprobe);
                        if (parsed) {
                            if (parsed.resolutionLabel) agg.resolutions.add(parsed.resolutionLabel);
                            if (parsed.audio) agg.audio.add(parsed.audio);
                            if (parsed.hdr && parsed.hdr.size) parsed.hdr.forEach(function (x) { agg.hdr.add(x); });
                        }

                        if (!agg.hasDub) {
                            item.ffprobe.filter(function (x) { return x.codec_type === 'audio' && x.tags; }).forEach(function (a) {
                                var lang = ((a.tags.language || '') + '').toLowerCase();
                                var nm = ((a.tags.title || a.tags.handler_name || '') + '').toLowerCase();
                                if ((lang === 'rus' || lang === 'ru' || lang === 'russian') && (nm.indexOf('dub') !== -1 || nm.indexOf('дубляж') !== -1 || nm.indexOf('дублир') !== -1 || nm === 'd')) {
                                    agg.hasDub = true;
                                }
                            });
                        }
                    }

                    if (titleLower.indexOf('dolby vision') !== -1 || titleLower.indexOf('dovi') !== -1 || /\bdv\b/.test(titleLower)) agg.hdr.add('Dolby Vision');
                    if (titleLower.indexOf('hdr10+') !== -1) agg.hdr.add('HDR10+');
                    if (titleLower.indexOf('hdr10') !== -1) agg.hdr.add('HDR10');
                    if (titleLower.indexOf('hdr') !== -1) agg.hdr.add('HDR');
                });

                var info = {};
                if (agg.resolutions.size > 0) {
                    var rOrder = ['4K', '2K', 'FULL HD', 'HD'];
                    for (var i = 0; i < rOrder.length; i++) {
                        if (agg.resolutions.has(rOrder[i])) {
                            info.quality = rOrder[i];
                            break;
                        }
                    }
                }

                if (agg.hdr.has('Dolby Vision')) {
                    info.dv = true;
                    info.hdr = true;
                }

                if (agg.hdr.size > 0) {
                    info.hdr = true;
                    var hOrder = ['HDR10+', 'HDR10', 'HDR'];
                    for (var k = 0; k < hOrder.length; k++) {
                        if (agg.hdr.has(hOrder[k])) {
                            info.hdr_type = hOrder[k];
                            break;
                        }
                    }
                }

                if (agg.audio.size > 0) {
                    var sOrder = ['7.1', '5.1', '4.0', '2.0'];
                    for (var j = 0; j < sOrder.length; j++) {
                        if (agg.audio.has(sOrder[j])) {
                            info.sound = sOrder[j];
                            break;
                        }
                    }
                }

                if (agg.hasDub) info.dub = true;
                movie.applecation_quality = info;
                renderBadges(info);
            }, function () {
                fallbackBadges();
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
