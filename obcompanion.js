(function () {
    'use strict';

    var PLUGIN_NAME = 'Obsidian Universal Fixer & Collections';

    var customStyles = `
        /* 1. Загальна уніфікація постерів для ВСІХ розділів (включно з Колекцією) */
        .card, 
        .card--collection, 
        .card--vinyl,
        .items-line .card,
        .category-full .card {
            background-color: transparent !important;
            border: none !important;
            box-shadow: none !important;
        }

        /* Контейнер постера */
        .card .card__view {
            background-color: #1a1a1a !important;
            border-radius: 8px !important;
            overflow: hidden !important;
            position: relative !important;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4) !important;
            transition: transform 0.2s ease, box-shadow 0.2s ease !important;
        }

        /* Зображення всередині карток */
        .card .card__img {
            object-fit: cover !important;
            border-radius: 8px !important;
        }

        /* Ефект фокусу (пульт / мишка) */
        .card:focus .card__view,
        .card.focus .card__view {
            transform: scale(1.04) !important;
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.6), 0 0 0 3px #ffffff !important;
            z-index: 10 !important;
        }

        /* 2. Позиціонування плашок сезонів/епізодів та статусів у всіх розділах */
        .card .card__head,
        .card .card__age, 
        .card .card__quality,
        .card .card__anime-episod,
        .card .card__series,
        .card .card__marker {
            z-index: 5 !important;
        }

        /* Коригування відступів для плашок епізодів (як в Obsidian) */
        .card .card__view > div[class*="head"],
        .card .card__view > div[class*="marker"] {
            display: flex !important;
            align-items: center !important;
            gap: 6px !important;
            padding: 6px !important;
        }

        /* 3. Адаптація текстових метаданих під постерми */
        .card .card__title {
            font-weight: 600 !important;
            font-size: 0.9em !important;
            color: #ffffff !important;
            margin-top: 6px !important;
            text-shadow: 0 1px 2px rgba(0,0,0,0.8) !important;
        }

        .card .card__vote {
            background: rgba(0, 0, 0, 0.6) !important;
            backdrop-filter: blur(4px) !important;
            border-radius: 6px !important;
            padding: 2px 6px !important;
            font-weight: 700 !important;
        }
    `;

    function injectStyles() {
        if (document.getElementById('obsidian-universal-fixer-style')) return;
        var styleElement = document.createElement('style');
        styleElement.id = 'obsidian-universal-fixer-style';
        styleElement.type = 'text/css';
        styleElement.appendChild(document.createTextNode(customStyles));
        document.head.appendChild(styleElement);
    }

    function initFixer() {
        injectStyles();
        console.log(PLUGIN_NAME + ': стилі колекцій та постерів успішно активовано.');
    }

    if (window.Lampa) {
        Lampa.Plugins.add({
            name: PLUGIN_NAME,
            version: '1.2.0',
            description: 'Поширює дизайн Obsidian на розділ Колекція та всі інші екрани Lampa',
            onInit: initFixer
        });
    } else {
        document.addEventListener('lampa:initialize', initFixer, { once: true });
    }
})();
