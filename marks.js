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
    // GLOBAL PLAYER HELPER
    // =================================================================
    function playYouTubeCustom(key) {
        var overlay = $('<div class="youtube-pro-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 10000; background: #000;"></div>');
        var playerContainer = $('<div id="yt-player-custom"></div>');
        var loader = $('<div class="yt-loader" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #fff; font-size: 1.5em; font-weight: bold; text-align: center;"><div class="broadcast__scan"></div><div>' + tr('loading_trailer') + '</div></div>');
        
        overlay.append(loader);
        overlay.append(playerContainer);
        $('body').append(overlay);
        
        var closePlayer = function() {
            overlay.remove();
            Lampa.Controller.toggle('content'); 
        };
        
        Lampa.Controller.add('youtube_custom_controller', {
            toggle: function() {}, up: function() {}, down: function() {}, left: function() {}, right: function() {},
            enter: function() {}, back: closePlayer
        });
        Lampa.Controller.toggle('youtube_custom_controller');
        
        var initPlayer = function() {
            new YT.Player('yt-player-custom', {
                height: '100%',
                width: '100%',
                videoId: key,
                playerVars: { 'autoplay': 1, 'controls': 1, 'showinfo': 0, 'rel': 0, 'modestbranding': 1, 'iv_load_policy': 3, 'playsinline': 1, 'disablekb': 1, 'fs': 0 },
                events: {
                    'onReady': function(event) { 
                        loader.remove(); // Hide loader
                        event.target.playVideo(); 
                    },
                    'onStateChange': function(event) {
                        if (event.data === 0) { // 0 = ended
                            closePlayer();
                        }
                    },
                    'onError': function(e) { 
                        if (e.data == 150 || e.data == 153) Lampa.Noty.show('Відео обмежено власником (Error ' + e.data + ')');
                        else Lampa.Noty.show('Помилка YouTube: ' + e.data);
                        closePlayer();
                    }
                }
            });
        };
        
        if (typeof YT === 'undefined' || typeof YT.Player === 'undefined') {
            var tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            var firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            var oldReady = window.onYouTubeIframeAPIReady;
            window.onYouTubeIframeAPIReady = function() { if(oldReady) oldReady(); initPlayer(); };
        } else {
            initPlayer();
        }
    }
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

        
            
                
   
