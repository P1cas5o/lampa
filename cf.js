/*
 * Card Fusion — Unified Tagline & Spacing, Test 2
 * Standalone reversible style test; does not edit main plugin.
 * Based on CF existing native / generated tagline classes.
 */
(function () {
  'use strict';
  if (window.__cfUnifiedTaglineT2) return;
  window.__cfUnifiedTaglineT2 = true;
  var id = 'cf-unified-tagline-test2';
  function add() {
    if (document.getElementById(id)) return;
    var style = document.createElement('style');
    style.id = id;
    style.textContent = `
/* Both native Lampa and CF fallback taglines: same typography and spacing. */
.full-start-new .full-start-new__tagline,
.full-start-new .full-start__tagline,
.full-start-new .full--tagline,
.full-start-new .cf-generated-tagline,
.full-start .full-start__tagline,
.full-start .full--tagline,
.full-start .cf-generated-tagline {
  font-size: .8em !important;
  font-style: italic !important;
  font-weight: normal !important;
  line-height: 1.4 !important;
  color: rgba(255,255,255,.88) !important;
  margin-top: .25em !important;
  margin-bottom: 5px !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  max-width: 100% !important;
  overflow-wrap: anywhere !important;
  text-align: left !important;
}
/* Keep native display mode untouched; fallback naturally sizes to text. */
.full-start-new .cf-generated-tagline,
.full-start .cf-generated-tagline {
  display: table;
  width: max-content;
}
/* Portrait-specific spacing and alignment. */
@media (max-aspect-ratio: 1/1) {
  .full-start-new .full-start-new__tagline,
  .full-start-new .full-start__tagline,
  .full-start-new .full--tagline,
  .full-start-new .cf-generated-tagline,
  .full-start .full-start__tagline,
  .full-start .full--tagline,
  .full-start .cf-generated-tagline {
    text-align: center !important;
    margin-left: auto !important;
    margin-right: auto !important;
  }
  .full-start-new__rate-line.cf-ratings-layout,
  .full-start__rate-line.cf-ratings-layout {
    padding-top: 0 !important;
  }
  .full-start-new .cf-standalone-meta,
  .full-start .cf-standalone-meta,
  .full-start-new .plugin-hybrid-title:has(.cf-secondary-title.cf-hybrid-only-hidden) .cf-secondary-metadata,
  .full-start .plugin-hybrid-title:has(.cf-secondary-title.cf-hybrid-only-hidden) .cf-secondary-metadata {
    font-weight: bold !important;
  }
  .full-start-new .cf-standalone-meta .cf-year-country,
  .full-start .cf-standalone-meta .cf-year-country {
    font-weight: bold !important;
  }
}`;
    (document.head || document.documentElement).appendChild(style);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', add);
  else add();
})();
