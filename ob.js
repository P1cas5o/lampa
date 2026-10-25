(function () {
    'use strict';

    var PLUGIN_NAME = 'Obsidian Collection Sync';

    // Безпечні стилі виключно для уніфікації зовнішнього вигляду карток у колекціях та інших розділах
    var cssRules = `
        /* Уніфікуємо контейнери карток у нестандартних розділах (Колекція тощо) */
        .card--collection, 
        .card--vinyl,
        .items-line .card,
        .category-full .card {
            background-color: transparent !important;
            border: none !important;
            box-shadow: none !important;
        }

        /* Налаштування самого блоку постера */
        .card--collection .card__view,
        .card--vinyl .card__view {
            background-color: #1a1a1a !important;
            border-radius: 8px !important;
            overflow: hidden !important;
            position: relative !important;
        }

        /* Рівні пропорції та зображення */
        .card--collection .card__img,
        .card--vinyl .card__img {
            object-fit: cover !important;
            border-radius: 8px !important;
        }

        /* Плавний і чистий фокус без чорних тіней-артефактів */
        .card--collection.focus .card__view,
        .card--vinyl.focus .card__view {
            transform: scale(1.04) !important;
            box-shadow: 0 0 0 3px #ffffff !important;
            z-index: 10 !important;
        }
    `;

    function init() {
        try {
            if (document.getElementById('obsidian-collection-sync-style')) return;
            var style = document.createElement('style');
            style.id = 'obsidian-collection-sync-style';
            style.type = 'text/css';
            style.appendChild(document.createTextNode(cssRules));
            document.head.appendChild(style);
            console.log(PLUGIN_NAME + ': успішно застосовано.');
        } catch (e) {
            // Тихо обробляємо будь-які нюанси, щоб не забивати консоль
        }
    }

    if (window.Lampa) {
        Lampa.Plugins.add({
            name: PLUGIN_NAME,
            version: '1.0.1',
            description: 'Безпечне вирівнювання стилів колекцій під Obsidian',
            onInit: init
        });
    } else {
        document.addEventListener('lampa:initialize', init, { once: true });
    }
})();
