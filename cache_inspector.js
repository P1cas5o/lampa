/*
 * Lampa Cache Inspector v1.0.0 Test 2 — read-only audit.
 * Standalone plugin. Does not remove, save, export, post or modify localStorage values.
 * Source-matched signatures based on Spectrolite Test 5.4.4, Card Fusion Fix 18/23,
 * and the user-provided kinohub.uk TG Cloud Sync script.
 * NOTE: labels are evidence-based hints, not a proof of ownership or of safe deletion.
 */
(function () {
  'use strict';
  var COMPONENT = 'lampa_cache_inspector_test2_page';
  var SETTINGS = 'lampa_cache_inspector_test2_settings';
  var FLAG = 'lampa_cache_inspector_test2_loaded';
  var STYLE_ID = 'lampa-cache-inspector-t2-css';
  var PAGE_SIZE = 48;
  var TYPES = {
    protected: 'Захищені',
    active: 'Пов’язані з плагінами',
    candidate: 'Можливі залишки',
    unknown: 'Не визначено'
  };
  var NATURES = {
    settings: 'Налаштування',
    cache: 'Кеш / відновлювані дані',
    auth: 'Авторизація / ідентичність',
    user: 'Дані користувача',
    other: 'Інші / не встановлено'
  };
  // Exact snapshot filters from the supplied Telegram Cloud Sync plugin.
  var TG_SENSITIVE = /token|password|passwd|secret|cookie|api[_-]?key|authorization|credential|access[_-]?code|account_|lampac_(?!smart_)|unic|nws|session|device|room|supportcontrol|playlist|torrserver/i;
  var TG_EPHEMERAL = /cache|^tmdb|^metric_|^marks_jacred_v1_|^storage_online_choice_.*_update_time$|^lampa_quality_cache$|^content_rows_|^shots_|^notice_|^cub_notice|stats|notified|updated_status|restore|migration|timestamp|_time$/i;
  var TG_EXACT = {
    'app.js': 1, activity: 1,
    tgcloudsync_revision: 1, tgcloudsync_saved_hash: 1,
    tgcloudsync_dirty: 1, tgcloudsync_last_command: 1,
    desktop_backup_last_id: 1, player_volume: 1, player_size: 1
  };
  // Fingerprints denote possible owners. A matching installed URL is separate evidence.
  var RULES = [
    {name:'GramLink / GramJS',key:/^(gramlink(?:[_.:\-]|$)|gramjs(?:[_.:\-]|$)|telegram(?:[_.:\-]|$)|mtproto(?:[_.:\-]|$)|tg_schema(?:[_.:\-]|$))/i,url:/(gramlink|gramjs|tgsbundle|mtproto|telegram)/i, legacy:true},
    {name:'Card Fusion',key:/^(card[_-]?fusion(?:[_.:\-]|$)|cf_(?:logo|hybrid|info|card|rating|slideshow|backdrop|image|shared|status|title|tmdb))/i,url:/card[_-]?fusion/i},
    {name:'Spectrolite',key:/^spectrolite(?:[_.:\-]|$)/i,url:/spectrolite/i},
    {name:'Obsidian',key:/^obsidian(?:[_.:\-]|$)/i,url:/obsidian/i,legacy:true},
    {name:'Cardify',key:/^cardify(?:[_.:\-]|$)/i,url:/cardify/i,legacy:true},
    {name:'YTranslate',key:/^ytranslate(?:[_.:\-]|$)/i,url:/ytranslate/i},
    {name:'YMod',key:/^(ym_(?:logo|title|buttons|ratings|main|cache|background|poster)|yarik[_-]?mod(?:[_.:\-]|$))/i,url:/(yarik.?mod|ymod\.js|yariks.?mod)/i},
    {name:'EasyTorrent',key:/^(easytorrent(?:[_.:\-]|$)|etd_)/i,url:/easytorrent/i},
    {name:'UA Films',key:/^uafilms(?:[_.:\-]|$)/i,url:/(?:ua[_\-]?films|uafilms)/i,unverified:true},
    {name:'Nova',key:/^nova(?:[_.:\-]|$)/i,url:/(?:nova)/i,unverified:true},
    {name:'Редактор кешу',key:/^lampaCacheEditorTrash$/i,url:/(redkesh|redaktor\.js|cache.?editor)/i,unverified:true}
  ];
  function fmtBytes(n) {
    n = Number(n) || 0;
    if (n < 1024) return n + ' Б';
    if (n < 1048576) return (n/1024).toFixed(1) + ' КБ';
    return (n/1048576).toFixed(2) + ' МБ';
  }
  function utf16Size(s) { return String(s == null ? '' : s).length * 2; }
  function cleanUrl(url) { return String(url || '').split('#')[0].split('?')[0].slice(0, 256); }
  function safeArr(v) {
    if (typeof v === 'string') { try { v = JSON.parse(v); } catch(e) { return []; } }
    return Object.prototype.toString.call(v) === '[object Array]' ? v : [];
  }
  function registerPlugin(out, v, source, forced) {
    var obj = typeof v === 'string' ? {url:v} : v;
    if (!obj || typeof obj.url !== 'string') return;
    var url = cleanUrl(obj.url);
    if (!url) return;
    var id = '$' + url.toLowerCase();
    var p = out.map[id];
    if (!p) {
      p = {url:url,sources:[],statuses:[]};
      out.map[id] = p;
      out.list.push(p);
    }
    var disabled = obj.status === 0 || obj.status === false || obj.status === '0';
    var status = forced || (disabled ? 'Вимкнений' : 'Доданий');
    if (p.statuses.indexOf(status) === -1) p.statuses.push(status);
    if (p.sources.indexOf(source) === -1) p.sources.push(source);
  }
  function detectPlugins() {
    var o = {list:[],map:{},sources:0,warnings:[]};
    try {
      if (window.Lampa && Lampa.Plugins) {
        var sources = [
          ['get','Додані плагіни',null],
          ['awaits','Очікують завантаження / CUB','Запланований'],
          ['loaded','Завантажені','Завантажений']
        ];
        for (var i=0;i<sources.length;i++) {
          var item=sources[i];
          if (typeof Lampa.Plugins[item[0]] !== 'function') continue;
          var ar=safeArr(Lampa.Plugins[item[0]]());
          o.sources++;
          for (var a=0;a<ar.length;a++) registerPlugin(o,ar[a],item[1],item[2]);
        }
      }
    } catch(e) {o.warnings.push('Не вдалося повністю прочитати Lampa.Plugins');}
    try {
      if (window.Lampa && Lampa.Storage && typeof Lampa.Storage.get==='function') {
        var st=safeArr(Lampa.Storage.get('plugins',[]));
        o.sources++;
        for(var j=0;j<st.length;j++) registerPlugin(o,st[j],'Lampa.Storage.plugins',null);
      }
    } catch(e2) {o.warnings.push('Не вдалося прочитати Lampa.Storage.plugins');}
    o.list.sort(function(a,b){return a.url.localeCompare(b.url);});
    return o;
  }
  function pluginWith(re, found) {
    for(var i=0;i<found.list.length;i++) if(re.test(found.list[i].url)) return found.list[i];
    return null;
  }
  function genericPluginByFile(key, found) {
    var n=key.toLowerCase().replace(/[^a-z0-9]/g,'');
    var nonUnique=/^(?:main|index|app|lampa|plugin|plugins|script|bundle|modification|extensions|common|utils|custom|settings|player|mobile|desktop|loader|dist|release|default)$/;
    for(var i=0;i<found.list.length;i++){
      var name=found.list[i].url.split('/').pop().replace(/\.js$/i,'').toLowerCase().replace(/[^a-z0-9]/g,'');
      if(name.length>=7 && !nonUnique.test(name) && n.indexOf(name)===0) return found.list[i];
    }
    return null;
  }
  function signatureFromContent(sample) {
    // Only short local content preview; no values are shown or exported.
    if(sample.indexOf('"constructorId"')>=0 && sample.indexOf('"argsConfig"')>=0 &&
       (sample.indexOf('"InputPeer')>=0 || sample.indexOf('"subclassOfId"')>=0)) return RULES[0];
    return null;
  }
  function keyNature(key, value) {
    if (/(?:auth|token|password|passwd|secret|session|cookie|credential|api[_-]?key|private[_-]?key|unic[_-]?id|device[_-]?id|uuid|fingerprint|vault|account|login)/i.test(key)) return 'auth';
    if (/^(?:history|favorite|favorites|online_view|torrents_view|file_view|bookmarks|watchlist|progress|timeline|plugins|plugins_blacklist)$/i.test(key) || /(?:watch_history|watchlist|timecode|bookmarks|favorites)/i.test(key)) return 'user';
    if (/(?:cache|_cached|^tmdb|^uafilms_c_|^cf_shared_logo_v1_|^title_cache_hybrid_v3$|^seasonBadgeCache$|^screensaver_aerial_items$|^community_watches_line_cache|_probe$|_timestamps?$|^lmp_enh_rating_cache$)/i.test(key)) return 'cache';
    if (/(?:^cf_logo_override_|_settings?$|_enabled$|_disabled$|_position$|_duration$|_quality$|_style$|_mode$|_show_|_hide_|_font_|_color_|_size$|_opacity$|_layout$|_width$|_height$|_text$|_icon$|^cardify_|^obsidian_|^spectrolite_|^cf_)/i.test(key)) return 'settings';
    if (/^(?:language|theme|plugins|settings|player|profile)/i.test(key)) return 'settings';
    return 'other';
  }
  function protectReason(key,nature) {
    if (nature==='auth') return 'Ідентифікатор, авторизація або захищена конфігурація. Не видаляти за припущенням.';
    if (nature==='user') return 'Історія, обране, налаштування плагінів або інші дані користувача.';
    if (/^(?:settings|activity|language|theme|profile|profiles|plugins|plugins_blacklist|app\.js|cache)$/i.test(key)) return 'Системні дані або список плагінів Lampa.';
    if (/^(?:tgcloudsync_|lampac_|account_|cub_|device_|player_|lampa_)/i.test(key)) return 'Дані інтеграції Lampa, синхронізації або системних налаштувань.';
    return '';
  }
  function classify(key, sample, found) {
    var nature=keyNature(key,sample);
    var protectedText=protectReason(key,nature);
    if (protectedText) return {type:'protected',nature:nature,owner:/^gramlink/i.test(key)?'GramLink (чутливі дані)':'Захищені дані',reason:protectedText,confidence:'захист'};
    // Confirmed cross-plugin reuse by inspected source code.
    var cf = pluginWith(/card[_-]?fusion/i,found);
    var sp = pluginWith(/spectrolite/i,found);
    if(cf && (/^cardify(?:[_.:\-]|$)/i.test(key) || /^(?:title_cache_hybrid_v3|lmp_enh_rating_cache|cf_shared_logo_v1_)/i.test(key))) {
      return {type:'active',nature:nature,owner:'Card Fusion (спільний модуль)',confidence:'підтверджено кодом',
        reason:'Використання цього ключа або простору імен підтверджено в коді Card Fusion; окремий Cardify не обов’язковий. '+cf.url};
    }
    if(sp && (/^obsidian(?:[_.:\-]|$)/i.test(key) || /^cf_shared_logo_v1_/i.test(key))) {
      return {type:'active',nature:nature,owner:'Spectrolite (рушій Obsidian)',confidence:'підтверджено кодом',
        reason:'Spectrolite містить рушій Obsidian і використовує цей простір імен; obsidian_poster_cache і cf_shared_logo_v1_* є в його вихідному коді. '+sp.url};
    }
    if (/^(?:title_cache_hybrid_v3|lmp_enh_rating_cache)$/i.test(key)) {
      return {type:'unknown',nature:nature,owner:'Card Fusion (можливо)',confidence:'без підтвердження активності',
        reason:'Ці ключі є у вихідному коді Card Fusion, але збігу з активним URL не знайдено. Не видаляти за цим висновком.'};
    }
    var rule=null;
    for (var i=0;i<RULES.length;i++) if(RULES[i].key.test(key)) {rule=RULES[i];break;}
    if(!rule) rule=signatureFromContent(sample);
    if(rule){
      var match=pluginWith(rule.url,found);
      if(match) return {type:'active',nature:nature,owner:rule.name,confidence:'збіг URL',reason:'Знайдено відомий префікс та відповідний URL плагіна: '+match.url};
      // Don't call unknown current UA Films or Nova installations "leftovers" based on a missing URL.
      if(rule.unverified) return {type:'unknown',nature:nature,owner:rule.name+' (ймовірно)',confidence:'URL не підтверджено',reason:'Префікс схожий на '+rule.name+', але плагін може завантажуватися нестандартно. Це НЕ доказ відсутності плагіна.'};
      return {type:'candidate',nature:nature,owner:rule.name,confidence:'лише сигнатура',
        reason:'Відомий префікс, але відповідного URL не знайдено. Може бути залишком або використовуватися іншим плагіном; безпечність видалення НЕ встановлено.'};
    }
    // Known functionality, but no assumption about which plugin owns it.
    var weak=null;
    if(/^seasonBadgeCache$/i.test(key)) weak='Кеш плашок сезонів';
    else if(/^community_watches_line_cache/i.test(key)) weak='Кеш інформації про перегляди';
    else if(/^screensaver_aerial_items$/i.test(key)) weak='Кеш заставки';
    else if(/^button_default_icons$/i.test(key)) weak='Дані оформлення кнопок';
    else if(/^(?:timetable|recommend_rows)$/i.test(key)) weak='Дані каталогів / рекомендацій';
    if(weak) return {type:'unknown',nature:nature,owner:weak,confidence:'назва ключа',reason:'Призначення припускається за назвою. Точний плагін не встановлено.'};
    var generic=genericPluginByFile(key,found);
    if(generic) return {type:'active',nature:nature,owner:'Ймовірно: '+generic.url.split('/').pop(),confidence:'непрямий збіг',reason:'Назва ключа схожа на ім’я JS-файлу встановленого плагіна. Потрібна перевірка.'};
    return {type:'unknown',nature:nature,owner:'Не встановлено',confidence:'немає збігу',reason:'Немає достатньо даних для прив’язки. Не означає, що запис зайвий.'};
  }
  function tgStatus(key,value) {
    if(!key || key.length>160) return {include:false,reason:'Занадто довга назва ключа (>160 символів)'};
    if(TG_EXACT[key]) return {include:false,reason:'Службове виключення TG Sync'};
    if(TG_SENSITIVE.test(key)) return {include:false,reason:'Правило захисту облікових даних/ідентифікаторів TG Sync'};
    if(TG_EPHEMERAL.test(key)) return {include:false,reason:'Фільтр тимчасових даних TG Sync (назва ключа)'};
    if(value == null || value.length>192*1024) return {include:false,reason:'Значення більше 192 × 1024 символів'};
    return {include:true,reason:'Потрапляє до snapshotStorage() у наданому TG-плагіні'};
  }
  function newStat(){return {count:0,bytes:0};}
  function inc(stat,bytes){stat.count++;stat.bytes+=bytes;}
  function groupNameForRecord(r) {
    if(r.owner && r.owner!=='Не встановлено' && r.owner!=='Захищені дані') return r.owner;
    var k=r.key;
    if(/^\d{5,}$/.test(k))return 'Цифрові ключі (власник невідомий)';
    var parts=k.split(/[_:.\-]/);
    var name=parts.slice(0,Math.min(2,parts.length)).join('_');
    return name.length>42?name.slice(0,42)+'…':(name||'Інші ключі');
  }
  function scan(){
    var found=detectPlugins();
    var o={plugins:found, records:[],total:0,error:'', types:{protected:newStat(),active:newStat(),candidate:newStat(),unknown:newStat()},
      natures:{settings:newStat(),cache:newStat(),auth:newStat(),user:newStat(),other:newStat()},
      tg:{included:newStat(),excluded:newStat(),includedSettings:newStat(),includedCache:newStat(),excludedCache:newStat(), includedUnknown:newStat(),includedSensitive:newStat(), skippedReasons:{}},groups:[]};
    var groups={};
    try{
      var ls=window.localStorage,keys=[];
      for(var i=0;i<ls.length;i++)keys.push(ls.key(i));
      for(var j=0;j<keys.length;j++){
        var key=keys[j]; if(typeof key!=='string')continue;
        var val=null;
        try{val=ls.getItem(key);}catch(e){continue;}
        if(val===null)continue;
        var size=utf16Size(key)+utf16Size(val);
        var info=classify(key,val.slice(0,16000),found);
        var tg=tgStatus(key,val);
        var r={key:key,size:size,type:info.type,nature:info.nature,owner:info.owner,
          reason:info.reason,confidence:info.confidence,tg:tg};
        o.records.push(r);o.total+=size;
        inc(o.types[r.type],size);inc(o.natures[r.nature],size);
        inc(tg.include?o.tg.included:o.tg.excluded,size);
        if(tg.include){
          if(r.nature==='auth')inc(o.tg.includedSensitive,size);
          if(r.nature==='settings')inc(o.tg.includedSettings,size);
          else if(r.nature==='cache')inc(o.tg.includedCache,size);
          else if(r.nature==='other')inc(o.tg.includedUnknown,size);
        }else{
          if(r.nature==='cache')inc(o.tg.excludedCache,size);
          if(!o.tg.skippedReasons[tg.reason])o.tg.skippedReasons[tg.reason]=newStat();
          inc(o.tg.skippedReasons[tg.reason],size);
        }
        var group=groupNameForRecord(r);
        if(!groups[group])groups[group]={name:group,count:0,bytes:0,cache:0,settings:0,keys:[]};
        groups[group].count++;groups[group].bytes+=size;
        if(r.nature==='cache')groups[group].cache++;
        if(r.nature==='settings')groups[group].settings++;
        groups[group].keys.push(r);
      }
    }catch(err){o.error='Не вдалося прочитати localStorage: '+(err&&err.message?err.message:'невідома помилка');}
    o.records.sort(function(a,b){return b.size-a.size;});
    for(var g in groups)if(Object.prototype.hasOwnProperty.call(groups,g)){
      groups[g].keys.sort(function(a,b){return b.size-a.size;});
      o.groups.push(groups[g]);
    }
    o.groups.sort(function(a,b){return b.bytes-a.bytes;});
    return o;
  }
  function css(){
    if($('#'+STYLE_ID).length)return;
    var rules=''+
     '.cit-wrap{height:100%;width:100%;overflow:hidden;padding:1.1em;box-sizing:border-box;display:flex;flex-direction:column}'+
     '.cit-grid{width:100%;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.8em;padding:.5em .4em 4em;box-sizing:border-box}'+
     '.cit-head{grid-column:1/-1;background:rgba(255,255,255,.07);padding:1.05em;border-radius:.7em;line-height:1.45}'+
     '.cit-head strong{font-size:1.09em}.cit-hint{opacity:.74;font-size:.85em;display:block;margin-top:.35em;overflow-wrap:anywhere}'+
     '.cit-card{border:2px solid transparent;min-height:7.4em;background:rgba(255,255,255,.085);border-radius:.75em;padding:1em;box-sizing:border-box;display:flex;flex-direction:column;justify-content:center;gap:.4em;overflow:hidden;cursor:pointer}'+
     '.cit-card.focus{background:#fff;color:#111;transform:scale(1.02);border-color:#fff}'+
     '.cit-card.focus .cit-name,.cit-card.focus .cit-sub{color:#111}'+
     '.cit-name{font-size:1em;font-weight:600;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
     '.cit-sub{font-size:.83em;color:#ccc;overflow:hidden;overflow-wrap:anywhere;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:3}'+
     '.cit-wide{grid-column:1/-1;min-height:4em}.cit-yellow{border-left:4px solid #daa548}.cit-green{border-left:4px solid #51a480}.cit-blue{border-left:4px solid #7196b4}'+
     '@media(max-width:900px){.cit-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:.6em}.cit-card{min-height:6.6em;padding:.7em}.cit-wrap{padding:.65em}}'+
     '@media(min-width:901px) and (max-width:1200px){.cit-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}';
    $('<style id="'+STYLE_ID+'"></style>').text(rules).appendTo('head');
  }
  function card(grid,title,desc,onClick,opts){
    opts=opts||{};
    var el=$('<div class="cit-card selector"></div>');
    if(opts.wide)el.addClass('cit-wide');
    if(opts.accent)el.addClass('cit-'+opts.accent);
    el.append($('<div class="cit-name"></div>').text(title));
    if(desc)el.append($('<div class="cit-sub"></div>').text(desc));
    el.on('hover:focus',function(){if(opts.scroll)opts.scroll.update(el);});
    el.on('hover:enter',function(){if(typeof onClick==='function')onClick();});
    grid.append(el);return el;
  }
  function header(grid,name,desc){var h=$('<div class="cit-head"></div>');h.append($('<strong></strong>').text(name));h.append($('<span class="cit-hint"></span>').text(desc));grid.append(h);}
  function detail(title,lines){
    var items=[];
    for(var i=0;i<lines.length;i++)items.push({title:String(lines[i]).slice(0,290),id:'i'+i});
    items.push({title:'Закрити',id:'close'});
    Lampa.Select.show({title:String(title).slice(0,190),nomark:true,items:items,
      onSelect:function(){Lampa.Controller.toggle('content');},onBack:function(){Lampa.Controller.toggle('content');}});
  }
  function initComponent(){
    if(Lampa.Component.get(COMPONENT))return;
    Lampa.Component.add(COMPONENT,function(obj){
      var self=this,root=$('<div class="cit-wrap"></div>'),sc=new Lampa.Scroll({mask:true,over:true,scroll_by_item:true}),
      grid=$('<div class="cit-grid"></div>'),data=null,level=obj.level||'overview',limit=PAGE_SIZE,groupName=obj.groupName||'';
      function go(to,title,extra){Lampa.Activity.push({url:'',title:title,component:COMPONENT,level:to,groupName:extra||''});}
      function more(total){if(total>limit)card(grid,'▶ Показати ще',(total-limit)+' записів',function(){limit+=PAGE_SIZE;build();},{wide:true,scroll:sc});}
      function recordDetail(r){detail(r.key,[
        'Оцінка розміру: '+fmtBytes(r.size),'Класифікація: '+TYPES[r.type]+' · '+NATURES[r.nature],
        'Можливий власник: '+r.owner,'Достовірність: '+r.confidence,'Чому: '+r.reason,
        'TG-копія: '+(r.tg.include?'ВКЛЮЧЕНО':'ВИКЛЮЧЕНО')+' · '+r.tg.reason,
        'Тільки аналіз: Test 2 нічого не змінює.'
      ]);}
      function recordsList(rows,title,subtitle){
        header(grid,title,rows.length+' ключів. '+subtitle);
        rows.slice(0,limit).forEach(function(r){
          var desc=r.owner+' · '+fmtBytes(r.size)+' · '+NATURES[r.nature]+' · TG: '+(r.tg.include?'так':'ні');
          card(grid,r.key,desc,function(){recordDetail(r);},{accent:r.type==='candidate'?'yellow':r.type==='active'?'green':'blue',scroll:sc});
        });
        if(!rows.length)header(grid,'Нічого не знайдено','Немає записів у цій категорії.');
        more(rows.length);
      }
      function build(){
        grid.empty();sc.clear();
        if(typeof sc.minus==='function')sc.minus();
        if(typeof sc.reset==='function')sc.reset();
        var body=sc.render().find('.scroll__body');
        if(body.length)body.css('transform','translate3d(0px,0px,0px)');
        if(level==='overview'){
          header(grid,'Cache Inspector · Test 2',
            'ТІЛЬКИ АНАЛІЗ. '+data.records.length+' ключів · '+fmtBytes(data.total)+'. Оцінки розміру приблизні. Дані не змінюються. '+data.error);
          card(grid,'↻ Сканувати повторно','Повторно прочитати сховище й список плагінів',function(){data=scan();build();},{wide:true,scroll:sc});
          var cats=[['candidate','⚠ Можливі залишки','yellow'],['active','✓ Пов’язані з плагінами','green'],['protected','🔒 Захищені','blue'],['unknown','? Не визначено','blue']];
          cats.forEach(function(c){var st=data.types[c[0]];
            card(grid,c[1],st.count+' ключів · '+fmtBytes(st.bytes),function(){go('cat:'+c[0],TYPES[c[0]]);},{accent:c[2],scroll:sc});});
          card(grid,'📦 Кеш і налаштування','Кеш: '+data.natures.cache.count+' · налаштування: '+data.natures.settings.count+' · дані користувача: '+data.natures.user.count,
            function(){go('natures','Типи записів');},{wide:true,scroll:sc});
          card(grid,'☁ Аудит TG-копії',data.tg.included.count+' ключів включено · '+data.tg.excluded.count+' виключено за правилами поточного TG-плагіна',
            function(){go('tg','Аудит TG-копії');},{wide:true,accent:'green',scroll:sc});
          card(grid,'🧩 Виявлені плагіни',data.plugins.list.length+' URL · додані, вимкнені та завантажені (якщо доступно)',function(){go('plugins','Виявлені плагіни');},{wide:true,scroll:sc});
          card(grid,'📁 Власники та групи',data.groups.length+' груп · за розміром',function(){go('groups','Власники та групи');},{wide:true,scroll:sc});
          card(grid,'▤ Усі записи',data.records.length+' ключів · від найбільшого',function(){go('all','Усі записи');},{wide:true,scroll:sc});
          header(grid,'Важливо','«Не визначено» не означає сміття. Збіг з URL не гарантує власника, а відсутність URL — що плагін видалений. Навіть кеш активного плагіна може бути важливим для його роботи.');
          if(!data.plugins.sources)header(grid,'Увага','Списки встановлених плагінів недоступні. Висновки про залишки особливо ненадійні.');
        } else if(level==='plugins') {
          header(grid,'Виявлені плагіни',data.plugins.list.length+' URL з доступних джерел; перелік може бути неповним.');
          data.plugins.list.slice(0,limit).forEach(function(p){card(grid,p.url.split('/').pop(),p.statuses.join(' / ')+' · '+p.url,
            function(){detail(p.url,['Статус: '+p.statuses.join(', '),'Джерела: '+p.sources.join(', '),'Список може не містити динамічно підвантажені плагіни.']);},{scroll:sc});});more(data.plugins.list.length);
        } else if(level==='groups'){
          header(grid,'Власники та групи','Групування лише за впізнаними сигнатурами або назвами ключів. Воно не доводить власника.');
          data.groups.slice(0,limit).forEach(function(g){card(grid,g.name,g.count+' ключів · '+fmtBytes(g.bytes)+' · кеш: '+g.cache+', налаштування: '+g.settings,
            function(){go('group','Група: '+g.name,g.name);},{scroll:sc});});more(data.groups.length);
        } else if(level==='group'){
          var chosen=null;for(var i=0;i<data.groups.length;i++)if(data.groups[i].name===groupName){chosen=data.groups[i];break;}
          recordsList(chosen?chosen.keys:[],'Група: '+groupName,'Групування не є доказом власника.');
        } else if(level==='natures'){
          header(grid,'Типи записів','Орієнтовне визначення за назвами та відомими сигнатурами, а не за фактом використання.');
          ['settings','cache','user','auth','other'].forEach(function(k){var n=data.natures[k];card(grid,NATURES[k],n.count+' ключів · '+fmtBytes(n.bytes),function(){go('nature:'+k,NATURES[k]);},{scroll:sc});});
        } else if(level==='tg'){
          header(grid,'Аудит TG-синхронізації','Локальне відтворення фільтрів snapshotStorage() із наданого коду. Жодних запитів до kinohub.uk, дані не передаються. Розмір — UTF-16, а НЕ точний розмір HTTP-запиту.');
          var sections=[
            ['tg:included','✓ Потрапляють до копії',data.tg.included,'green'],
            ['tg:excluded','− Виключені з копії',data.tg.excluded,'blue'],
            ['tg:includedSettings','⚙ Налаштування в копії',data.tg.includedSettings,'green'],
            ['tg:includedCache','⚠ Кеш у копії',data.tg.includedCache,'yellow'],
            ['tg:excludedCache','✓ Кеш поза копією',data.tg.excludedCache,'blue'],
            ['tg:includedUnknown','? Неясні дані в копії',data.tg.includedUnknown,'yellow'],
            ['tg:includedSensitive','⚠ Чутливі ключі у копії',data.tg.includedSensitive,'yellow']
          ];
          sections.forEach(function(x){card(grid,x[1],x[2].count+' ключів · '+fmtBytes(x[2].bytes),function(){go(x[0],x[1]);},{accent:x[3],scroll:sc});});
          header(grid,'Причини виключення','Розподіл за першим спрацьованим правилом із TG Sync.');
          Object.keys(data.tg.skippedReasons).sort(function(a,b){return data.tg.skippedReasons[b].bytes-data.tg.skippedReasons[a].bytes;}).forEach(function(k){
            var st=data.tg.skippedReasons[k];card(grid,k,st.count+' ключів · '+fmtBytes(st.bytes),function(){detail(k,['Правило з вихідного TG Sync, не висновок про те, що дані можна видалити.']);},{scroll:sc});});
          header(grid,'Що означає аудит','Плагін може включити кеші uafilms_c_season_*, якщо значення не перевищує 192 × 1024 символи; слово «cache» у ключі виключає запис. Ключі на зразок gramlink_vault_* можуть потрапляти в копію попри шифрування. Аудит НЕ перевіряє серверні ліміти, ревізії та помилки запиту.');
        } else if(level.indexOf('tg:')===0){
          var kind=level.slice(3),rows=data.records.filter(function(r){
            if(kind==='included')return r.tg.include;
            if(kind==='excluded')return !r.tg.include;
            if(kind==='includedSettings')return r.tg.include&&r.nature==='settings';
            if(kind==='includedCache')return r.tg.include&&r.nature==='cache';
            if(kind==='excludedCache')return !r.tg.include&&r.nature==='cache';
            if(kind==='includedUnknown')return r.tg.include&&r.nature==='other';
            if(kind==='includedSensitive')return r.tg.include&&r.nature==='auth';return false;
          });
          recordsList(rows,'TG · '+(kind==='included'?'У копії':kind==='excluded'?'Виключені':kind==='includedSettings'?'Налаштування у копії':kind==='includedCache'?'Кеш у копії':kind==='excludedCache'?'Кеш поза копією':kind==='includedSensitive'?'Чутливі ключі':'Неясні у копії'),
            'Зіставлення з поточними фільтрами TG-плагіна, не реальна операція збереження.');
        } else if(level.indexOf('cat:')===0){
          var type=level.slice(4);recordsList(data.records.filter(function(r){return r.type===type;}),TYPES[type],
            type==='candidate'?'Не видаляйте без перевірки. Навіть підтверджена відсутність URL не є доказом, що дані не використовуються.':'Не означає, що запис можна видалити.');
        } else if(level.indexOf('nature:')===0){
          var nature=level.slice(7);recordsList(data.records.filter(function(r){return r.nature===nature;}),NATURES[nature],
            'Визначено за назвою та сигнатурами. Не доводить непотрібність.');
        } else if(level==='all'){
          recordsList(data.records,'Усі записи','Сортування за приблизним розміром. Значення не показуються.');
        }
        sc.append(grid);
      }
      this.create=function(){data=scan();root.append(sc.render());build();return root;};
      this.start=function(){
        Lampa.Controller.add('content',{
          toggle:function(){var el=sc.render();Lampa.Controller.collectionSet(el);var first=el.find('.selector').eq(0)[0];Lampa.Controller.collectionFocus(first||false,el);},
          left:function(){if(window.Navigator&&window.Navigator.canmove('left'))window.Navigator.move('left');else Lampa.Controller.toggle('menu');},
          right:function(){if(window.Navigator&&window.Navigator.canmove('right'))window.Navigator.move('right');},
          up:function(){if(window.Navigator&&window.Navigator.canmove('up'))window.Navigator.move('up');else Lampa.Controller.toggle('head');},
          down:function(){if(window.Navigator&&window.Navigator.canmove('down'))window.Navigator.move('down');},
          back:function(){Lampa.Activity.backward();}
        });Lampa.Controller.toggle('content');
      };
      this.pause=function(){};this.stop=function(){};this.render=function(){return root;};
      this.destroy=function(){sc.destroy();root.remove();};
    });
  }
  function init(){
    if(window[FLAG]||!window.Lampa||!Lampa.SettingsApi||!Lampa.Component||!Lampa.Scroll)return;
    window[FLAG]=true;css();initComponent();
    Lampa.SettingsApi.addComponent({component:SETTINGS,name:'Cache Inspector · Test 2',
      icon:'<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect x="3" y="4" width="18" height="15" rx="2"/><path d="M7 9h10M7 13h7M9 21h6"/></svg>'});
    Lampa.SettingsApi.addParam({component:SETTINGS,param:{type:'button'},field:{name:'🔎 Аналізувати localStorage',description:'Аналіз кешів, залежностей і TG-копії без змін даних'},
      onChange:function(){Lampa.Activity.push({url:'',title:'Cache Inspector · Test 2',component:COMPONENT,level:'overview'});}});
  }
  var tries=0,timer=setInterval(function(){
    tries++;
    if(window.Lampa&&Lampa.SettingsApi&&Lampa.Component&&Lampa.Platform){clearInterval(timer);init();}
    else if(tries>=120)clearInterval(timer);
  },500);
})();
