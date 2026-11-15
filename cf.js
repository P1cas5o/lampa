/* Card Fusion Portrait Gap Diagnostic — Test 2. Standalone, read-only. */
(function(){
'use strict';
if(window.__cfTitleDiagT2)return;
window.__cfTitleDiagT2=true;
var ID='cf-title-gap-t2', tickNo=0;
function box(e){return e&&e.getBoundingClientRect?e.getBoundingClientRect():null;}
function fmt(v){return typeof v==='number'&&isFinite(v)?v.toFixed(1):'—';}
function name(e){if(!e)return '—';var s=e.tagName.toLowerCase();if(e.id)s+='#'+e.id;if(typeof e.className==='string')s+='.'+e.className.trim().split(/\s+/).slice(0,3).join('.');return s;}
function visible(e){if(!e)return false;var b=box(e),c=getComputedStyle(e);return !!(b&&b.width>0&&b.height>0&&c.display!=='none'&&c.visibility!=='hidden'&&+c.opacity!==0);}
function style(e){if(!e)return '';var c=getComputedStyle(e);return 'margin='+c.marginTop+'/'+c.marginBottom+' padding='+c.paddingTop+'/'+c.paddingBottom+' gap='+c.rowGap+' display='+c.display+' position='+c.position+' transform='+c.transform;}
function line(e){var b=box(e);return name(e)+' [top '+fmt(b&&b.top)+' bottom '+fmt(b&&b.bottom)+' h '+fmt(b&&b.height)+'] '+style(e);}
function panel(){var e=document.getElementById(ID);if(e)return e;e=document.createElement('div');e.id=ID;e.style.cssText='position:fixed!important;top:7px!important;left:7px!important;right:7px!important;max-height:55vh!important;overflow:auto!important;z-index:2147483647!important;padding:10px!important;background:rgba(0,9,18,.95)!important;color:#fff!important;border:2px solid #2de3b2!important;border-radius:10px!important;white-space:pre-wrap!important;overflow-wrap:anywhere!important;text-align:left!important;font:11px/1.36 monospace!important;pointer-events:none!important;box-sizing:border-box!important';document.body.appendChild(e);return e;}
function run(){
 if(!document.body)return;
 var p=document.getElementById(ID);
 if(innerWidth>=innerHeight){if(p)p.style.display='none';return;}
 var titles=[].slice.call(document.querySelectorAll('.plugin-hybrid-title')).filter(visible);
 if(!titles.length){if(p)p.style.display='none';return;}
 var title=titles[titles.length-1],tb=box(title), body=title.querySelector('.plugin-hybrid-title__body');
 var scope=title.closest('.full-start-new,.full-start')||document;
 var all=[].slice.call(scope.querySelectorAll('[class*="rate"], [class*="rating"], [class*="ratings"], .full-start__pg, .full-start__status'));
 var candidates=all.filter(function(e){return /rate-line|rating|ratings|rate--|full-start__rate/.test(typeof e.className==='string'?e.className:'');});
 var seen=[];candidates=candidates.filter(function(e){if(seen.indexOf(e)>=0)return false;seen.push(e);return true;});
 var rated=candidates.map(function(e){var b=box(e);return {el:e,b:b,vis:visible(e),delta:b?b.top-tb.bottom:Infinity};});
 var below=rated.filter(function(x){return x.vis&&x.b.top>=tb.bottom-3;}).sort(function(a,b){return a.b.top-b.b.top;});
 var near=below[0];
 var text=['CF GAP DIAG T2  |  '+innerWidth+'×'+innerHeight,'Назва: '+(title.textContent||'').trim().slice(0,72),'',
 'НАЗВА: '+line(title),'ВМІСТ: '+line(body),
 'НАЙБЛИЖЧИЙ ВИДИМИЙ РЕЙТИНГ: '+(near?line(near.el):'не знайдено'),
 'ВІДСТАНЬ від контейнера назви: '+(near?fmt(near.delta)+' px':'—'),
 '', 'УСІ КАНДИДАТИ РЕЙТИНГІВ (до 22):'];
 rated.sort(function(a,b){return Math.abs(a.delta)-Math.abs(b.delta);}).slice(0,22).forEach(function(x,i){text.push((i+1)+'. '+(x.vis?'VISIBLE':'hidden')+' gap='+fmt(x.delta)+' '+line(x.el));});
 text.push('','БАТЬКИ НАЗВИ:');var q=title.parentElement;for(var j=0;q&&j<5;j++,q=q.parentElement)text.push(j+1+'. '+line(q));
 if(near){text.push('','БАТЬКИ РЕЙТИНГУ:');q=near.el.parentElement;for(j=0;q&&j<5;j++,q=q.parentElement)text.push(j+1+'. '+line(q));}
 // Highlight measured boxes, without altering any layout or hit-testing.
 ['title','rate'].forEach(function(which){var eid=ID+'-'+which, overlay=document.getElementById(eid);if(!overlay){overlay=document.createElement('div');overlay.id=eid;overlay.style.cssText='position:fixed!important;pointer-events:none!important;z-index:2147483646!important;border:2px dashed '+(which==='title'?'#ffdd44':'#ff6c9a')+'!important;box-sizing:border-box!important';document.body.appendChild(overlay);}var b=which==='title'?tb:(near&&near.b);overlay.style.display=b?'block':'none';if(b){overlay.style.left=b.left+'px';overlay.style.top=b.top+'px';overlay.style.width=b.width+'px';overlay.style.height=b.height+'px';}});
 p=panel();p.style.display='block';var output=text.join('\n');if(p.textContent!==output)p.textContent=output;
 if(++tickNo%5===1)console.log('[CF GAP DIAG T2]\n'+output);
}
setInterval(function(){try{run();}catch(e){console.warn('[CF GAP DIAG T2]',e);}},1300);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
})();
