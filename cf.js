/*
 Card Fusion Portrait Spacing — independent TEST 1
 Test-only CSS override; remove this plugin to revert.
 Does not change Card Fusion settings or source.
*/
(function(){
 'use strict';
 if(window.__cfPortraitSpacingFixT1)return;
 window.__cfPortraitSpacingFixT1=true;
 var id='cf-portrait-spacing-fix-t1';
 function install(){
   if(document.getElementById(id))return;
   var el=document.createElement('style');
   el.id=id;
   el.textContent=`
   @media (max-aspect-ratio:1/1) {
     /* Diagnostic T2 found 12.4px top padding on ratings row. */
     .full-start-new__rate-line.cf-ratings-layout,
     .full-start__rate-line.cf-ratings-layout {
       padding-top:0!important;
     }
     /* Center native and Card Fusion generated taglines. */
     .full-start-new .full-start-new__tagline,
     .full-start-new .full-start__tagline,
     .full-start .full-start__tagline,
     .full-start-new .full--tagline,
     .full-start .full--tagline,
     .full-start-new .cf-generated-tagline,
     .full-start .cf-generated-tagline {
       text-align:center!important;
       margin-left:auto!important;
       margin-right:auto!important;
     }
     .full-start-new .cf-generated-tagline,
     .full-start .cf-generated-tagline {
       display:table!important;
       max-width:100%;
     }
     /* Preserve same metadata appearance when optional title is hidden. */
     .full-start-new .cf-standalone-meta,
     .full-start .cf-standalone-meta,
     .full-start-new .plugin-hybrid-title:has(.cf-secondary-title.cf-hybrid-only-hidden) .cf-secondary-metadata,
     .full-start .plugin-hybrid-title:has(.cf-secondary-title.cf-hybrid-only-hidden) .cf-secondary-metadata {
       font-weight:bold!important;
       font-size:inherit!important;
     }
     .full-start-new .cf-standalone-meta .cf-year-country,
     .full-start .cf-standalone-meta .cf-year-country,
     .full-start-new .plugin-hybrid-title:has(.cf-secondary-title.cf-hybrid-only-hidden) .cf-year-country,
     .full-start .plugin-hybrid-title:has(.cf-secondary-title.cf-hybrid-only-hidden) .cf-year-country {
       font-weight:bold!important;
     }
   }`;
   (document.head||document.documentElement).appendChild(el);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);
 else install();
})();
