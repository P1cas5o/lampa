/* Source Order Custom — Test 3 | based on LampaUA Source Order | 2026-11-15 */
(function () {
'use strict';
var PLUGIN_ID='p1cas5o_source_order_custom';
var STORAGE_KEY='lampaua_source_order_v1';
var FLAG_URL='https://p1cas5o.github.io/lampa/assets/ua_flag_source_order.svg';
var UA='__UA_FLAG_SVG__', EN='🇬🇧', TORII='⛩️', CROWN='👑', POPCORN='🍿', PLAY='▶';
var ENG_BLOCK_SOURCES=['autoembed','hydraflix','movpi','playembed','rgshows','smashystream','twoembed','videasy','vidlink','vidsrc'];
var DEFAULTS={}, GROUPS={}, lastTitles={}, filterPatched=false, editorReturnController='settings_component';
function defaults(keys,title,icon,order,group){keys.split(' ').forEach(function(k){DEFAULTS[k]={title:title,icon:icon,order:order};if(group!==undefined)GROUPS[k]=group;});}
// Group 3: premium; group 0: viewer. The mapping is informational only.
defaults('kh_uaserials','KH · UASerials',UA,49,3);defaults('kh_uafilm','KH · UAFilm',UA,50,3);
defaults('kh_kinotron','KH · Kinotron',UA,51,3);defaults('kh_uaflix','KH · Uaflix',UA,52,0);
defaults('kh_eneyida','KH · Eneyida',UA,53,3);defaults('kh_anitube','KH · AniTube',TORII,54,3);defaults('kh_animeua','KH · AnimeUA',TORII,55,3);
[
['makhno lme_makhno','Makhno ~ 1080',UA,1,3],['franko lme_franko','Franko ~ 1080',UA,2,3],['petlura lme_petlura','Petlura ~ 1080',UA,2,3],
['uaflix lme_uaflix','Uaflix ~ 1080',UA,3,3],['klonfun lme_klonfun','KlonFUN ~ 1080',UA,4,0],['uakino lme_uakino','UaKino ~ 1080',UA,5,3],
['uafilmme lme_uafilmme','UafilmME ~ 1080',UA,6,0],['uafilm lme_uafilm','UAFilm ~ 1080',UA,7,3],['kinoukr lme_kinoukr','KinoUkr ~ 1080',UA,8,3],
['ashdi lme_ashdi','Ashdi ~ 1080',UA,9,3],['eneyida lme_eneyida','Eneyida ~ 1080',UA,10,3],
['mirage lme_mirage','Mirage ~ 4K',CROWN,11,3],['spectre lme_spectre','Spectre ~ 4K',CROWN,12,3],['phantom lme_phantom','Phantom ~ 4K',CROWN,13,3],
['jacktor lme_jacktor','JackTor ~ 4K',CROWN,14,3],['pidtor lme_pidtor','PidTor ~ 4K',CROWN,15,3],
['bamboo lme_bamboo','Bamboo',TORII,16,0],['animeon lme_animeon','AnimeON',TORII,17,0],['mikai lme_mikai','Mikai',TORII,18,0],
['unimay lme_unimay','Unimay',TORII,19,0],['moonanime lme_moonanime','MoonAnime',TORII,20,0],
['nmoonanime lme_nmoonanime','New MoonAnime',TORII,21,0],['aniliberty lme_aniliberty','AniLiberty',TORII,22,0],
['filmix lme_filmix','Filmix [ Prem ]',POPCORN,23,0],['rezka pizatoadhd','Rezka ~ 4K',POPCORN,24,3],['zetflix lme_zetflix','Zetflix',POPCORN,25,3],
['starlight lme_starlight','StarLight','⭐',26,0],['streamdata lme_streamdata','StreamData','⭐',27,0],
['xullys lmg_xullys','EN Xullys ~ 4k',EN,28,3]
].forEach(function(a){defaults(a[0],a[1],a[2],a[3],a[4]);});
[
['uakino','UAKino'],['kinoukr','KinoUkr'],['uaserials','UASerials'],['uaserials_my','UASerials.my'],['eneyida','Енеїда'],['wormhole','Wormhole'],
['uaflix','UaFlix'],['uakino_ax','UAKino.ax'],['bambooua','BambooUA'],['anihub','AniHub'],['animeon','AnimeON'],['aniworld','AniWorld'],
['mikai','Mikai'],['kinostrain','KinoStrain'],['klon','Klon'],['serialno','Serialno'],['uaserials_fm','UASerials.fm'],['ufdub','UFDub'],['unimay','Unimay']
].forEach(function(a,i){var anime=['bambooua','anihub','animeon','aniworld','mikai','unimay'].indexOf(a[0])>=0;defaults('uafilm_'+a[0],'UF · '+a[1],anime?TORII:UA,29+i,3);});
defaults('sisi','Sisi','🍓',48,3);
var ICONS=['',UA,EN,TORII,CROWN,POPCORN,PLAY,'💎','⭐','⚡','🔥','🎬','📺','📁','🔎','🎞️','🧩','🟢','🟡','🔴','🍓'];
function cleanMojibake(s){return String(s||'').replace(/рџ‡єрџ‡¦/g,'🇺🇦').replace(/рџЊё/g,'🌸').replace(/рџ‘‘/g,'👑').replace(/рџЌї/g,'🍿').replace(/в–¶/g,'▶');}
function normalizeIcon(s){s=cleanMojibake(s);if(s==='🇺🇦'||s==='[UA]')return UA;if(s==='🌸')return TORII;return s;}
function saveStorage(c){Lampa.Storage.set(STORAGE_KEY,c);}
function storage(){
 var c=Lampa.Storage.get(STORAGE_KEY,null);
 if(typeof c==='string'){try{c=JSON.parse(c);}catch(e){c=null;}}
 if(!c||typeof c!=='object')c={order:[],items:{},known:{}};
 c.order=Array.isArray(c.order)?c.order:[];c.items=c.items&&typeof c.items==='object'?c.items:{};c.known=c.known&&typeof c.known==='object'?c.known:{};
 var changed=false;
 if(c.franko_title_cleanup!==1){['franko','lme_franko'].forEach(function(k){var re=/^(?:(?:\[UA\]|🇺🇦)\s*)?(?:Petlura|Петлюра)(?:\s*~\s*1080p?)?$/i;if(re.test(stripLock(c.known[k])))c.known[k]='Franko';if(c.items[k]&&re.test(stripLock(c.items[k].title)))delete c.items[k].title;});c.franko_title_cleanup=1;changed=true;}
 if(c.eng_block_cleanup!==1){c.order=c.order.filter(function(k){return ENG_BLOCK_SOURCES.indexOf(String(k).toLowerCase())<0;});Object.keys(c.known).forEach(function(k){if(ENG_BLOCK_SOURCES.indexOf(k.toLowerCase())>=0)delete c.known[k];});c.eng_block_cleanup=1;changed=true;}
 if(changed)saveStorage(c);return c;
}
function html(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function stripLock(s){return String(s||'').replace(/\s*🔒.*$/,'').trim();}
function lockSuffix(s){var m=String(s||'').match(/\s*🔒.*$/);return m?m[0]:'';}
function groupFromTitle(s){var x=lockSuffix(s);if(!x)return null;if(x.indexOf('Меценат')>=0)return 'Меценат';if(x.indexOf('Преміум')>=0)return 'Преміум';if(x.indexOf('Глядач')>=0)return 'Глядач';return null;}
function groupName(n){return n===1||n===2||n===3?'Преміум':'Глядач';}
function sourceGroupTitle(k,title){return groupFromTitle(title)||groupName(GROUPS[k]===undefined?(String(k).indexOf('uafilm_')===0?3:0):GROUPS[k]);}
function defaultTitle(k,f){return DEFAULTS[k]?DEFAULTS[k].title:stripLock(f||k);}
function defaultIcon(k){return DEFAULTS[k]?DEFAULTS[k].icon:PLAY;}
function defaultOrder(k){return DEFAULTS[k]?DEFAULTS[k].order:10000;}
function sortByDefaultOrder(keys){return keys.slice().sort(function(a,b){return defaultOrder(a)-defaultOrder(b)||defaultTitle(a,a).localeCompare(defaultTitle(b,b))||a.localeCompare(b);});}
function ensureOrder(c,keys){var seen={},next=[];c.order.forEach(function(k){if(keys.indexOf(k)>=0&&!seen[k]){next.push(k);seen[k]=true;}});sortByDefaultOrder(keys).forEach(function(k){if(!seen[k]){next.push(k);seen[k]=true;}});c.order=next;}
function mergeOrder(c,keys){var map={};(c.order||[]).concat(keys||[]).forEach(function(k){if(k)map[k]=true;});ensureOrder(c,Object.keys(map));}
function registerSources(items){var c=storage(),keys=[],changed=false;items.forEach(function(it){var k=it&&it.source;if(!k)return;keys.push(k);lastTitles[stripLock(it.title)]=k;lastTitles[it.title]=k;if(!c.known[k]){c.known[k]=stripLock(it.title||k);changed=true;}});if(keys.length){mergeOrder(c,keys);changed=true;}if(changed)saveStorage(c);}
function sourceKeys(c){var map={};Object.keys(c.known).forEach(function(k){map[k]=true;});if(!Object.keys(map).length)Object.keys(DEFAULTS).forEach(function(k){if(k.indexOf('lme_')!==0&&k!=='pizatoadhd')map[k]=true;});ensureOrder(c,Object.keys(map));return c.order.slice();}
function defaultProfileConfig(){var c=storage(),keys=Object.keys(c.known);if(!keys.length)keys=Object.keys(DEFAULTS).filter(function(k){return k.indexOf('lme_')!==0&&k!=='pizatoadhd';});return {order:sortByDefaultOrder(keys),items:{},known:c.known,franko_title_cleanup:c.franko_title_cleanup,eng_block_cleanup:c.eng_block_cleanup};}
// SVG is rendered via CSS, not embedded into the title string (Lampa filter escapes markup).
// Keep a textual sentinel for mapping and render a flag on its own pseudo-element.
var FLAG_TOKEN='◈';
function displayIcon(icon){return normalizeIcon(icon)===UA?FLAG_TOKEN:normalizeIcon(icon);}
function customTitle(k,original){var c=storage(),it=c.items[k]||{},title=it.title||defaultTitle(k,c.known[k]||original),icon=typeof it.icon==='string'?normalizeIcon(it.icon):defaultIcon(k),suffix=lockSuffix(original);var rendered=(icon?displayIcon(icon)+' ':'')+title+suffix;lastTitles[title]=k;lastTitles[rendered]=k;return rendered;}
function applyToSortItems(items){if(!items||!items.some(function(it){return it&&it.source;}))return items;registerSources(items);var c=storage(),pos={};mergeOrder(c,items.map(function(it){return it&&it.source;}).filter(Boolean));c.order.forEach(function(k,i){pos[k]=i;});items.forEach(function(it){if(!it||!it.source)return;var orig=it._p1source_original_title||it.title;it._p1source_original_title=orig;it.subtitle=sourceGroupTitle(it.source,orig);it.title=customTitle(it.source,orig);it._lampaua_source_order=pos[it.source]===undefined?99999:pos[it.source];});items.sort(function(a,b){var ag=a&&a.ghost?1:0,bg=b&&b.ghost?1:0;if(ag!==bg)return ag-bg;var ao=a&&a._lampaua_source_order!==undefined?a._lampaua_source_order:99999,bo=b&&b._lampaua_source_order!==undefined?b._lampaua_source_order:99999;return ao-bo||String(a.title||'').localeCompare(String(b.title||''));});saveStorage(c);return items;}
function chosenTitle(title){var k=lastTitles[title]||lastTitles[stripLock(title)];if(!k){var normalized=stripLock(title).toLowerCase();Object.keys(DEFAULTS).some(function(candidate){if(normalized.indexOf(candidate)>=0||normalized.indexOf(DEFAULTS[candidate].title.toLowerCase())>=0){k=candidate;return true;}return false;});}return k?customTitle(k,title):title;}
function patchFilter(){if(filterPatched)return;if(!window.Lampa||!Lampa.Filter){setTimeout(patchFilter,300);return;}filterPatched=true;var Original=Lampa.Filter;Lampa.Filter=function(obj){var f=new Original(obj),set=f.set,chosen=f.chosen;f.set=function(type,items){if(type==='sort'&&Array.isArray(items))return set.call(this,type,applyToSortItems(items));return set.apply(this,arguments);};f.chosen=function(type,selected){if(type==='sort'&&Array.isArray(selected))return chosen.call(this,type,selected.map(chosenTitle));return chosen.apply(this,arguments);};return f;};Object.keys(Original).forEach(function(k){Lampa.Filter[k]=Original[k];});Lampa.Filter.prototype=Original.prototype;}
function flagSVG(){return '<img class="source-order-ua-svg" src="'+FLAG_URL+'" alt="UA" draggable="false" />';}
function iconHtml(icon){return normalizeIcon(icon)===UA?flagSVG():html(icon||' ');}
function saveOrderFromDom(list){var c=storage();c.order=[];list.find('.source-order-item').each(function(){c.order.push($(this).attr('data-key'));});saveStorage(c);}
function updateRow(row,k){var c=storage(),it=c.items[k]||{},title=it.title||defaultTitle(k,c.known[k]),icon=typeof it.icon==='string'?normalizeIcon(it.icon):defaultIcon(k);row.find('.source-order-icon').html(iconHtml(icon)).toggleClass('source-order-icon--text',!!icon&&icon.length>2&&icon!==UA);row.find('.source-order-name').text(title);row.find('.source-order-key').text('ID: '+k+'  ·  '+sourceGroupTitle(k,c.known[k]));}
function reopenEditorSoon(){setTimeout(function(){openEditor({returnController:editorReturnController});},120);}
function closeEditorForOverlay(row){if(row&&row.length)saveOrderFromDom(row.parent());Lampa.Modal.close();}
function editName(k,row){var c=storage(),it=c.items[k]||{},value=it.title||defaultTitle(k,c.known[k]);closeEditorForOverlay(row);setTimeout(function(){Lampa.Input.edit({title:'Назва джерела',value:value,free:true},function(next){if(next!==undefined){next=String(next||'').trim();c=storage();c.items[k]=c.items[k]||{};if(next&&next!==defaultTitle(k,c.known[k]))c.items[k].title=next;else delete c.items[k].title;saveStorage(c);}reopenEditorSoon();});},120);}
function setIcon(k,icon,row){var c=storage();c.items[k]=c.items[k]||{};icon=normalizeIcon(icon);if(icon!==defaultIcon(k))c.items[k].icon=icon;else delete c.items[k].icon;saveStorage(c);if(row&&row.length)updateRow(row,k);}
function editIcon(k,row){var c=storage(),current=c.items[k]&&typeof c.items[k].icon==='string'?normalizeIcon(c.items[k].icon):defaultIcon(k);var choices=ICONS.map(function(icon){return {title:icon===UA?'🇺🇦 Україна (SVG)':icon||'Без іконки',icon:icon,selected:icon===current};});choices.push({title:'Своя іконка / текст',custom:true});closeEditorForOverlay(row);setTimeout(function(){Lampa.Select.show({title:'Іконка джерела',items:choices,onBack:reopenEditorSoon,onSelect:function(it){if(it.custom){setTimeout(function(){Lampa.Input.edit({title:'Іконка або короткий текст',value:current===UA?'':current,free:true},function(v){if(v!==undefined)setIcon(k,String(v||'').trim());reopenEditorSoon();});},120);return;}setIcon(k,it.icon);reopenEditorSoon();}});},120);}
function resetSource(k,row){var c=storage();delete c.items[k];saveStorage(c);updateRow(row,k);}
function buildRow(k){var row=$('<div class="menu-edit-list__item source-order-item" data-key="'+html(k)+'"><div class="source-order-main selector"><div class="menu-edit-list__icon source-order-icon"></div><div class="source-order-text"><div class="menu-edit-list__title source-order-name"></div><div class="source-order-key"></div></div></div><div class="source-order-actions"><div class="menu-edit-list__move source-order-action selector" data-action="name" title="Назва">✎</div><div class="menu-edit-list__move source-order-action selector" data-action="icon" title="Іконка">▣</div><div class="menu-edit-list__move source-order-action selector" data-action="up" title="Вище">⌃</div><div class="menu-edit-list__move source-order-action selector" data-action="down" title="Нижче">⌄</div><div class="menu-edit-list__move source-order-action selector" data-action="reset" title="Скинути">↺</div></div></div>');updateRow(row,k);row.find('.source-order-main').on('hover:enter',function(){editName(k,row);});row.find('.source-order-action').on('hover:enter',function(){var act=$(this).attr('data-action'),list=row.parent();if(act==='name')editName(k,row);if(act==='icon')editIcon(k,row);if(act==='reset')resetSource(k,row);if(act==='up'){var prev=row.prev('.source-order-item');if(prev.length){row.insertBefore(prev);saveOrderFromDom(list);}}if(act==='down'){var next=row.next('.source-order-item');if(next.length){row.insertAfter(next);saveOrderFromDom(list);}}});return row;}
function closeEditor(list){if(list&&list.length)saveOrderFromDom(list);Lampa.Modal.close();if(editorReturnController&&Lampa.Controller)Lampa.Controller.toggle(editorReturnController);}
function openEditor(opts){opts=opts||{};editorReturnController=opts.returnController||editorReturnController||'settings_component';var c=storage(),keys=sourceKeys(c);saveStorage(c);var wrap=$('<div class="source-order-wrap"></div>'),list=$('<div class="menu-edit-list source-order-list"></div>');keys.forEach(function(k){list.append(buildRow(k));});var reset=$('<div class="source-order-reset selector">Скинути за замовчуванням</div>');reset.on('hover:enter',function(){Lampa.Storage.set(STORAGE_KEY,defaultProfileConfig());if(Lampa.Noty)Lampa.Noty.show('Порядок джерел скинуто');Lampa.Modal.close();openEditor({returnController:editorReturnController});});wrap.append(list).append(reset);Lampa.Modal.open({title:'Редагувати джерела',html:wrap,size:'small',scroll_to_center:true,onBack:function(){closeEditor(list);}});}
function settings(){if(!Lampa.SettingsApi||!Lampa.SettingsApi.addParam){setTimeout(settings,500);return;}try{Lampa.SettingsApi.addParam({component:'interface',param:{name:'p1cas5o_source_order_open',type:'button'},field:{name:'Порядок онлайн-джерел',description:'Назви, іконки та порядок джерел'},onChange:function(){openEditor({returnController:'settings_component'});}});}catch(e){if(window.console)console.warn('[Source Order Custom] settings:',e);}}
function addStyle(){if(document.getElementById('p1cas5o-source-order-style'))return;var s=document.createElement('style');s.id='p1cas5o-source-order-style';s.textContent=[
'.source-order-wrap{width:100%;max-width:31em;margin:0 auto;box-sizing:border-box}',
'.source-order-list{padding-right:0;margin-right:0}',
'.source-order-item{display:flex;align-items:center;padding:.34em .45em;border-radius:.3em}',
'.source-order-item:nth-child(even){background:rgba(255,255,255,.1)}',
'.source-order-main{display:flex;align-items:center;min-width:0;flex:1;border-radius:.3em}',
'.source-order-main.focus{background:rgba(255,255,255,.12)}',
'.source-order-icon{font-size:1.15em;text-align:center;white-space:nowrap;overflow:hidden;font-weight:700}',
'.source-order-icon--text{font-size:.72em!important;letter-spacing:0}',
'.source-order-icon:not(:empty){background:rgba(255,255,255,.08)}',
'.source-order-ua-svg{width:1.3em;height:.9em;vertical-align:middle;display:inline-block;object-fit:fill}',
'.source-order-text{min-width:0;flex:1}',
'.source-order-name{font-size:1.18em;font-weight:300;line-height:1.15;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
'.source-order-key{font-size:.68em;line-height:1.15;opacity:.5;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
'.source-order-actions{display:flex;align-items:center;gap:.05em;margin-left:.45em;flex-shrink:0}',
'.source-order-action{background:transparent;font-size:1.02em}',
'.source-order-action.focus{background:#fff!important;color:#000!important;border-radius:.3em}',
'.source-order-reset{text-align:center;margin-top:.75em;border-radius:.3em;padding:.82em 1em;font-weight:700;background:rgba(160,70,70,.45)}',
'.source-order-reset.focus{outline:.16em solid rgba(255,255,255,.85);outline-offset:.08em}',
'@media(max-width:600px){.source-order-wrap{max-width:100%}.source-order-name{font-size:1.05em}.source-order-actions{margin-left:.25em}.source-order-action{width:2em;height:2em}}',
// Flag token: lightweight inline flag approximation with CSS background, works on Win/Android.
'.source-order-flag-token{display:inline-block!important;width:1.25em!important;min-width:1.25em;height:.84em!important;vertical-align:-.07em!important;margin-right:.12em;object-fit:fill;flex:none}',
'.source-order-torii-token{display:inline-block!important;font-size:1.12em!important;line-height:1!important;vertical-align:-.05em!important;filter:drop-shadow(0 0 1px #fff) drop-shadow(0 0 2px rgba(255,255,255,.7));margin-right:.08em}'
].join('');document.head.appendChild(s);}
// Decorate source icon text nodes wherever Lampa/Nova Plus renders them.
// The original selector only searched inside .torrent-filter, missing the actual popup.
function decorateSourceIcons(){
 var root=document.body;if(!root||!document.createTreeWalker)return;
 var walker=document.createTreeWalker(root,4,null),pending=[],node;
 while((node=walker.nextNode())){
  var val=node.nodeValue||'';
  if(val.indexOf(FLAG_TOKEN)<0&&val.indexOf(TORII)<0)continue;
  var parent=node.parentNode;
  if(!parent||!parent.closest)continue;
  if(parent.closest('.source-order-flag-token,.source-order-torii-token,script,style,textarea,input'))continue;
  // Do not rewrite text inside our settings editor or unrelated pages.
  if(parent.closest('.source-order-wrap'))continue;
  var relevant=parent.closest('.torrent-filter,.filter--sort,.filter__item,.filter__body,.filter__items,.filter,.selectbox,.selectbox-item,.selectbox__item,.selector');
  if(!relevant)continue;
  pending.push(node);
 }
 pending.forEach(function(t){
  if(!t.parentNode)return;
  var value=t.nodeValue,pattern=/(◈|⛩️)/g,match,last=0,fragment=document.createDocumentFragment();
  while((match=pattern.exec(value))!==null){
   if(match.index>last)fragment.appendChild(document.createTextNode(value.slice(last,match.index)));
   var span=document.createElement('span');
   if(match[0]===FLAG_TOKEN){span=document.createElement('img');span.className='source-order-flag-token';span.src=FLAG_URL;span.alt='UA';span.draggable=false;}
   else{span.className='source-order-torii-token';span.textContent=TORII;}
   fragment.appendChild(span);last=pattern.lastIndex;
  }
  if(!last)return;
  if(last<value.length)fragment.appendChild(document.createTextNode(value.slice(last)));
  t.parentNode.replaceChild(fragment,t);
 });
}
function observeFlags(){
 if(typeof MutationObserver==='undefined')return;
 var queued=false;
 var observer=new MutationObserver(function(){
  if(queued)return;queued=true;
  setTimeout(function(){queued=false;decorateSourceIcons();},90);
 });
 observer.observe(document.body,{childList:true,subtree:true,characterData:true});
 decorateSourceIcons();
}
function init(){if(!window.Lampa||!window.$){setTimeout(init,300);return;}if(window.__p1cas5oSourceOrderCustomLoaded)return;window.__p1cas5oSourceOrderCustomLoaded=true;addStyle();patchFilter();settings();observeFlags();window.LampaUaSourceOrderCustom={open:openEditor,config:storage,reset:function(){saveStorage(defaultProfileConfig());}};}
init();
})();
