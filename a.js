(function () {
    'use strict';

    var PLUGIN_NAME = 'Obsidian Collection Badge Fixer';

    // CSS-стилі для перенесення статусу та вирівнювання в колекціях
    var cssStyles = `
        /* Переносимо мітки статусу (Переглянуто / Заплановано) нагору праворуч у колекціях */
        .card--collection .card__view,
        .card--vinyl .card__view,
        .card--collection,
        .card--vinyl {
            position: relative !important;
        }

        /* Знаходимо блок із міткою статусу знизу і перекидаємо наверх праворуч */
        .card--collection .card__head,
        .card--collection .card__age,
        .card--collection .card__vote-wrap {
            /* За потреби можна точково керувати позицією */
        }

        /* Виправляємо відображення плажки статусу в колекціях */
        .card--collection .card__details,
        .card--collection .card__box {
            /* Забезпечуємо правильний контекст */
        }
    `;

    // Функція, яка програмно переносить статусний блок нагору в картках колекцій
    function fixCollectionBadges() {
        try {
            var collectionCards = document.querySelectorAll('.card--collection, .card--vinyl');
            for (var i = 0; i < collectionCards.length; i++) {
                var card = collectionCards[i];
                var view = card.querySelector('.card__view');
                if (!view) continue;

                // Шукаємо плажку статусу (там, де текст "Перегля..." або "Заплано...")
                var statusBadge = card.querySelector('.card__head') || card.querySelector('.card__age');
                
                if (statusBadge && !view.contains(statusBadge)) {
                    // Змінюємо стилі, щоб вона гарно висіла вгорі праворуч всередині блоку постера
                    statusBadge.style.position = 'absolute';
                    statusBadge.style.top = '8px';
                    statusBadge.style.right = '8px';
                    statusBadge.style.left = 'auto';
                    statusBadge.style.bottom = 'auto';
                    statusBadge.style.zIndex = '20';
                    statusBadge.style.background = 'rgba(0, 0, 0, 0.6)';
                    statusBadge.style.backdropFilter = 'blur(6px)';
                    statusBadge.style.borderRadius = '6px';
                    statusBadge.style.padding = '2px 6px';
                    
                    view.appendChild(statusBadge);
                }
            }
        } catch (e) {
            // Тихо обробляємо помилки, щоб плагін працював стабільно
        }
    }

    function init() {
        if (document.getElementById('obs-collection-badge-style')) return;
        var style = document.createElement('style');
        style.id = 'obs-collection-badge-style';
        style.innerHTML = cssStyles;
        document.head.appendChild(style);

        // Спостерігач за появою карток колекції
        var observer = new MutationObserver(function () {
            fixCollectionBadges();
        });

        observer.observe(document.body, { childList: true, subtree: true });
        fixCollectionBadges();

        console.log(PLUGIN_NAME + ': успішно активовано.');
    }

    if (window.Lampa) {
        Lampa.Plugins.add({
            name: PLUGIN_NAME,
            version: '1.0.0',
            description: 'Переносить плажки статусів нагору праворуч у розділі Колекція',
            onInit: init
        });
    } else {
        document.addEventListener('lampa:initialize', init, { once: true });
    }
})();
