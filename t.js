/* Card Fusion — Tagline Gap Diagnostic T3. Read-only, standalone. */
(function(){
'use strict';
if(window.__cfTaglineGapDiagT3)return;
window.__cfTaglineGapDiagT3=true;
var ID='cf-tagline-gap-diag-t3', last='';
function rect(e){return e&&e.getBoundingClientRect?e.getBoundingClientRect():null;}
function n(x){return Number.isFinite(x)?x.toFixed(1):'—';}
function cs(e){return e?getComputedStyle(e):null;}
function visible(e){if(!e)return false;var r=rect(e),s=cs(e);return !!(r&&r.width>0&&r.height>0&&s.display!=='none'&&s.visibility!=='hidden'&&parseFloat(s.opacity)!==0);}
function candidates(root,sel){return Array.prototype.slice.call(root.querySelectorAll(sel)).filter(visible);}
function name(e){return e?e.tagName.toLowerCase()+(typeof e.className==='string'&&e.className.trim()?'.'+e.className.trim().split(/\s+/).slice(0,3).join('.'):''):'НЕМАЄ';}
function metrics(e){if(!e)return 'НЕМАЄ';var r=rect(e),s=cs(e);return name(e)+'\n  y '+n(r.top)+'–'+n(r.bottom)+' h '+n(r.height)+' | margin '+s.marginTop+'/'+s.marginBottom+' | padding '+s.paddingTop+'/'+s.paddingBottom+' | minH '+s.minHeight+' | display '+s.display+' | align '+s.alignItems+' | justify '+s.justifyContent+' | lineH '+s.lineHeight;}
function gap(a,b){return a&&b?n(rect(b).top-rect(a).bottom)+'px':'—';}
function getPanel(){var p=document.getElementById(ID);if(p)return p;p=document.createElement('div');p.id=ID;p.style.cssText='position:fixed!important;top:8px!important;left:8px!important;right:8px!important;z-index:2147483647!important;max-height:42vh!important;overflow:auto!important;white-space:pre-wrap!important;word-break:break-word!important;background:rgba(6,10,19,.95)!important;color:#fff!important;border:2px solid #39dfb4!important;border-radius:10px!important;padding:10px!important;box-sizing:border-box!important;font:11px/1.38 monospace!important;text-align:left!important;box-shadow:0 4px 18px #000!important;pointer-events:auto!important;touch-action:pan-y!important';document.body.appendChild(p);return p;}
function main(){if(!document.body)return;var panel=document.getElementById(ID);if(innerWidth>=innerHeight){if(panel)panel.style.display='none';return;}
var roots=candidates(document,'.full-start-new,.full-start').filter(function(e){return candidates(e,'.plugin-hybrid-title,.cf-generated-tagline,.full-start-new__tagline,.full-start__tagline,.cf-ratings-layout').length;});
var root=roots.sort(function(a,b){return rect(b).height-rect(a).height;})[0];if(!root){if(panel)panel.style.display='none';return;}
var title=candidates(root,'.plugin-hybrid-title')[0];var secondary=title&&title.querySelector('.cf-secondary-title');var meta=title&&title.querySelector('.cf-secondary-metadata');
var tags=candidates(root,'.cf-generated-tagline,.full-start-new__tagline,.full-start__tagline,.full--tagline');var tag=tags[0];
var rows=candidates(root,'.full-start-new__rate-line,.full-start__rate-line,.cf-ratings-layout');
var icons=candidates(root,'.lmp-custom-rate,.full-start__rate,.rate--tmdb,.rate--imdb,.rate--kp,.cf-ratings-loader');
var rating=rows.filter(function(e){return icons.some(function(i){return e.contains(i);});})[0]||rows[0];
var ratingIcons=rating?icons.filter(function(i){return rating.contains(i);}):icons;
var icon=ratingIcons.sort(function(a,b){return rect(a).top-rect(b).top;})[0];
var before=tag||title;var r=rating&&rect(rating),i=icon&&rect(icon),t=tag&&rect(tag);
var lines=['CF TAGLINE GAP DIAG T3 | '+innerWidth+'×'+innerHeight,
 'Додаткова назва: '+(secondary&&visible(secondary)?'УВІМКНЕНА':'ВИМКНЕНА'),
 'Слоган: '+(tag?'Є, '+(tag.textContent||'').trim().slice(0,65):'НЕМАЄ'),
 'Слоганів знайдено: '+tags.length+' | Рядів рейтингів: '+rows.length,
 '━━━━━━━━━━ ВІДСТАНІ ━━━━━━━━━━',
 'НАЗВА → СЛОГАН: '+gap(title,tag),
 'СЛОГАН → РЯД рейтингів: '+gap(tag,rating),
 'СЛОГАН → ПЕРША ІКОНКА: '+gap(tag,icon),
 'НАЗВА → РЯД рейтингів: '+gap(title,rating),
 'РЯД → ПЕРША ІКОНКА: '+(r&&i?n(i.top-r.top)+'px':'—'),
 'Внутрішній резерв ЗНИЗУ слогану: '+(tag&&t?n(t.bottom-(function(){var children=candidates(tag,'*');return children.length?Math.max.apply(null,children.map(function(e){return rect(e).bottom;})):t.bottom;})())+'px':'—'),
 '━━━━━━━━━━ ЕЛЕМЕНТИ ━━━━━━━━━━',
 'НАЗВА: '+metrics(title),
 'СЛОГАН: '+metrics(tag),
 'РЯД РЕЙТИНГІВ: '+metrics(rating),
 'ПЕРША ІКОНКА: '+metrics(icon),
 '━━━━━━━━━━ БАТЬКИ СЛОГАНУ ━━━━━━━━━━'];
var par=tag&&tag.parentElement;for(var k=0;par&&k<3;k++,par=par.parentElement)lines.push(metrics(par));
lines.push('━━━━━━━━━━ УСІ СЛОГАНИ ━━━━━━━━━━');tags.forEach(function(e,j){lines.push((j+1)+'. '+metrics(e));});
lines.push('━━━━━━━━━━ УСІ РЯДИ РЕЙТИНГІВ ━━━━━━━━━━');rows.forEach(function(e,j){lines.push((j+1)+'. '+metrics(e));});
var output=lines.join('\n');panel=getPanel();panel.style.display='block';if(output!==last){panel.textContent=output;last=output;}
}
setInterval(function(){try{main();}catch(e){console.warn('[CF TAGLINE DIAG T3]',e);}},1100);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',main);else main();
})();
