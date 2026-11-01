/*
 * Lampa Cache Inspector v1.0.0 Test 4.1 — access history, over-limit cache cleanup and guided cleanup.
 * Standalone plugin. Only explicitly confirmed selections may remove localStorage keys; offers in-session undo and export.
 * Source-matched signatures based on Spectrolite Test 5.4.4, Card Fusion Fix 18/23,
 * and the user-provided kinohub.uk TG Cloud Sync script.
 * NOTE: labels are evidence-based hints, not a proof of ownership or of safe deletion.
 */
(function () {
  'use strict';
  var COMPONENT = 'lampa_cache_inspector_test4_page';
  var SETTINGS = 'lampa_cache_inspector_test4_settings';
  var FLAG = 'lampa_cache_inspector_test4_loaded';
  var STYLE_ID = 'lampa-cache-inspector-t4-css';
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
    {name:'YDesign',key:/^ydesign(?:[_.:\-]|$)/i,url:/(?:ydesign|\/ydes\.js)/i,legacy:true},
    // Exact keys verified against user-provided SeasonsInfo source. seasonBadgeProcessed is a related but unverified progress cache.
    {name:'SeasonsInfo / Season Badges',key:/^(?:seasonBadgeCache|seasonBadgeProcessed|sbadger_(?:settings_v1|badge_view|tmdb_key))$/i,url:/(?:\/|^)(?:seasons?info|seasonbadge|sbadger)(?:[._\/-]|$)/i,legacy:true},
    {name:'UA Films',key:/^uafilms(?:[_.:\-]|$)/i,url:/(?:ua[_\-]?films|uafilms)/i,unverified:true},
    {name:'Nova',key:/^nova(?:[_.:\-]|$)/i,url:/(?:nova)/i,unverified:true},
    {name:'Редактор кешу',key:/^lampaCacheEditorTrash$/i,url:/(redkesh|redaktor\.js|cache.?editor)/i,unverified:true}
  ];
  // Observe actual storage READ calls from now on. localStorage has no historical access time.
  // All tracking is local, key-names/timestamps only, and excluded from the TG backup by "cache".
  var ACCESS_KEY='lampa_cache_inspector_cache_access_v1';
  var DAYS_KEY='lampa_cache_inspector_cache_days_v1';
  var ACCESS_LIMIT=1600;
  var ACCESS_MAX_CHARS=48000; // <= about 96 KiB UTF-16, plus small metadata
  var TRACK_KEY='lampa_cache_inspector_cache_track_enabled_v1';
  var CAP_KEY='lampa_cache_inspector_cache_cap_limit_v1';
  var capLimit=250,trackingEnabled=false;
  var activity={started:0,last:Object.create(null)};
  var staleDays=90;
  var savedGetItem=null, savedSetItem=null, savedLampaGet=null;
  var suppressTracking=0, activityDirty=false;
  var favIds=Object.create(null);
  function quietGet(k){
    ++suppressTracking;
    try{return savedGetItem?savedGetItem.call(window.localStorage,k):window.localStorage.getItem(k);}
    catch(e){return null;}
    finally{--suppressTracking;}
  }
  function quietSet(k,v){
    ++suppressTracking;
    try{if(savedSetItem)savedSetItem.call(window.localStorage,k,v);else window.localStorage.setItem(k,v);return true;}
    catch(e){return false;}
    finally{--suppressTracking;}
  }
  function trackedCacheKey(k){
    if(typeof k!=='string'||k===ACCESS_KEY||k===DAYS_KEY||k.length>180)return false;
    if(/^(?:lampa_cache_inspector|cf_logo_override_|favorite|history|plugins|multi_installed_plugins|gramlink|dblink|tgcloudsync)/i.test(k))return false;
    if(/(?:token|password|passwd|secret|cookie|credential|account|device|session|private|vault)/i.test(k))return false;
    return /^(?:jacred_v[34]_\d+|ytrans_-?\d+|logo_uas_|logo_cache_width_based_v\d+_|poster_clean_v\d+_|ifx_tmdb_ua_title_|ydesign_c_|uafilms_c_|nfx_logo_v\d+_|img_cache_v\d+_|cf_shared_logo_v\d+_|spectrolite_quality_cache_|obsidian_poster_cache$|lmp_enh_rating_cache$|title_cache_hybrid_v3$|seasonBadgeCache$|community_watches_line_cache_|screensaver_aerial_items$|recommend_rows$)|cache/i.test(k);
  }
  function noteRead(key){
    if(!trackingEnabled||suppressTracking||!trackedCacheKey(key))return;
    var now=Date.now();
    // A popular key can be accessed many times per second. Limit recorded updates to once/minute.
    if((activity.last[key]||0)>now-60000)return;
    activity.last[key]=now;activityDirty=true;
  }
  function flushActivity(){
    if(!activityDirty)return;
    try{
      var keys=Object.keys(activity.last);
      if(keys.length>ACCESS_LIMIT){
        keys.sort(function(a,b){return (activity.last[a]||0)-(activity.last[b]||0);});
        for(var i=0;i<keys.length-ACCESS_LIMIT;i++)delete activity.last[keys[i]];
      }
      // Both count and serialized-size caps: the inspector must not become a new large cache.
      var packed=JSON.stringify({started:activity.started,last:activity.last});
      if(packed.length>ACCESS_MAX_CHARS){
        keys=Object.keys(activity.last).sort(function(a,b){return (activity.last[a]||0)-(activity.last[b]||0);});
        while(packed.length>ACCESS_MAX_CHARS&&keys.length){
          for(var drop=0;drop<Math.min(100,keys.length);drop++)delete activity.last[keys[drop]];
          keys=keys.slice(100);
          packed=JSON.stringify({started:activity.started,last:activity.last});
        }
      }
      activityDirty=!quietSet(ACCESS_KEY,packed);
    }catch(e){}
  }
  function installTracking(){
    try{
      var loaded=JSON.parse(quietGet(ACCESS_KEY)||'null');
      if(loaded&&loaded.started>0&&loaded.last&&typeof loaded.last==='object'){
        activity.started=loaded.started;
        Object.keys(loaded.last).forEach(function(k){
          if(trackedCacheKey(k)&&Number.isFinite(Number(loaded.last[k]))&&Number(loaded.last[k])>0)
            activity.last[k]=Number(loaded.last[k]);
        });
      }
    }catch(e){}
    trackingEnabled=quietGet(TRACK_KEY)==='true';
    if(trackingEnabled&&!activity.started){activity.started=Date.now();activityDirty=true;}
    var days=Number(quietGet(DAYS_KEY));if(days===30||days===90||days===180)staleDays=days;
    var cl=Number(quietGet(CAP_KEY));if(cl===100||cl===250||cl===500)capLimit=cl;
    try{
      if(typeof Storage!=='undefined'&&Storage.prototype&&typeof Storage.prototype.getItem==='function'){
        savedGetItem=Storage.prototype.getItem;savedSetItem=Storage.prototype.setItem;
        Storage.prototype.getItem=function(k){
          var result=savedGetItem.call(this,k);
          if(result!==null&&this===window.localStorage)noteRead(String(k));
          return result;
        };
      }
    }catch(e){}
    // Some Lampa versions use a memory cache in Lampa.Storage.get rather than native getItem.
    try{
      if(window.Lampa&&Lampa.Storage&&typeof Lampa.Storage.get==='function'){
        savedLampaGet=Lampa.Storage.get;
        Lampa.Storage.get=function(k){
          var result=savedLampaGet.apply(this,arguments);
          if(result!==undefined&&result!==null&&trackedCacheKey(String(k))&&quietGet(String(k))!==null)noteRead(String(k));
          return result;
        };
      }
    }catch(e){}
    setInterval(flushActivity,45000);
    try{document.addEventListener('visibilitychange',function(){if(document.hidden)flushActivity();});}catch(e){}
    try{window.addEventListener('pagehide',flushActivity);}catch(e){}
    flushActivity();
  }
  function buildFavorites(){
    var out=Object.create(null),v=quietGet('favorite');if(!v)return out;
    try{
      var f=JSON.parse(v),sections=['like','watch','wath','book','look','viewed','scheduled','continued'];
      sections.forEach(function(s){var a=f[s];if(!Array.isArray(a))return;
        a.forEach(function(row){var id=typeof row==='object'&&row?row.id:row;
          if(typeof id==='number'&&id>0&&id<1e10)out[String(id)]=true;
        });
      });
    }catch(e){}
    return out;
  }
  function cacheTitleId(k){
    var m=k.match(/(?:^|[_:])(?:movie|tv)[_:](\d{2,10})(?:$|[_:])/i)
      ||k.match(/^uafilms_c_season_(\d{2,10})_s\d+$/i)
      ||k.match(/^jacred_v[34]_(\d{2,10})$/i);
    return m?m[1]:null;
  }
  function protectedCacheKey(k){
    if(/^cf_logo_override_/i.test(k))return true;
    if(!trackedCacheKey(k)||protectReason(k,keyNature(k,'')))return true;
    var id=cacheTitleId(k);return !!(id&&favIds[id]);
  }
  function idleDays(k){var at=activity.last[k];return at?Math.floor(Math.max(0,Date.now()-at)/86400000):null;}
  function isObservedStale(k){
    var d=idleDays(k);
    return d!==null&&d>=staleDays&&trackedCacheKey(k)&&!protectedCacheKey(k)
      &&keyNature(k,'')==='cache';
  }
  function recentText(k){
    var t=activity.last[k];if(!t)return 'Використання ще не зафіксовано';
    var days=idleDays(k),date=new Date(t);
    return 'Останнє зафіксоване читання: '+date.toLocaleString('uk-UA')+' ('+days+' дн. тому)';
  }
  // Explicitly regenerable, single-item keys only. Whole-record caches need separate handling.
  var CAP_FAMILIES=[
    {id:'logos',label:'Логотипи TMDB · адреси',re:/^(?:logo_uas_v\d+_|logo_cache_width_based_v\d+_)/i},
    {id:'translations',label:'YTranslate · переклади',re:/^ytrans_-?\d+$/i},
    {id:'jacred',label:'JacRed · перевірки',re:/^jacred_v[34]_\d+$/i},
    {id:'ifx',label:'Interface+ · назви',re:/^ifx_tmdb_ua_title_v[0-9.]+:(?:movie|tv):\d+$/i},
    {id:'posters',label:'Постери · адреси',re:/^poster_clean_v\d+_/i},
    {id:'nfx',label:'Додаткові логотипи',re:/^nfx_logo_v\d+_/i},
    {id:'images',label:'Кеш зображень',re:/^img_cache_v\d+_/i},
    {id:'sharedlogo',label:'Спільні логотипи CF',re:/^cf_shared_logo_v\d+_/i}
  ];
  function createdTime(k,v){
    // Cached-at timestamp, NOT last use; only use to rank unknown-use records.
    if(!/^(?:jacred_|logo_uas_|logo_cache_|poster_clean_|ifx_tmdb_ua_title_|nfx_logo_)/i.test(k))return 0;
    if(!v||v.charAt(0)!=='{')return 0;
    try{var o=JSON.parse(v),t=Number(o.time||o._ts||o.t||o.timestamp||0);
      return t>1420070400000&&t<Date.now()+86400000?t:0;
    }catch(e){return 0;}
  }
  function capGroups(scanData){
    var result=[];
    CAP_FAMILIES.forEach(function(f){
      var rows=scanData.records.filter(function(r){return f.re.test(r.key)&&r.nature==='cache';});
      if(rows.length<=capLimit)return;
      var candidates=rows.filter(function(r){return !protectedCacheKey(r.key);});
      var need=Math.min(rows.length-capLimit,candidates.length);
      if(!need)return;
      var available=candidates.map(function(r){
        var used=activity.last[r.key]||0,created=createdTime(r.key,quietGet(r.key));
        return {record:r,used:used,created:created};
      });
      available.sort(function(a,b){
        // Prefer confirmed old reads (>= the chosen stale-days threshold);
        // then unknown-use entries ranked by cache-write time if available;
        // leave recently read entries last. Unknown usage is disclosed in UI.
        var cutoff=Date.now()-staleDays*86400000;
        var ra=a.used?(a.used<cutoff?1:3):2;
        var rb=b.used?(b.used<cutoff?1:3):2;
        if(ra!==rb)return ra-rb;
        var va=a.used||a.created||0,vb=b.used||b.created||0;
        if(va!==vb)return va-vb;
        return a.record.key.localeCompare(b.record.key);
      });
      var selected=available.slice(0,need),names=Object.create(null),unknown=0;
      selected.forEach(function(e){names[e.record.key]=1;if(!e.used)unknown++;});
      var list=selected.map(function(e){return e.record;}),bytes=0,tgBytes=0;
      list.forEach(function(r){bytes+=r.size;var v=quietGet(r.key);
        if(v!==null&&r.tg.include)tgBytes+=byteLength(JSON.stringify(r.key)+':'+JSON.stringify(v)+',');
      });
      result.push({rule:{id:'cap_'+f.id,title:f.label+' · понад '+capLimit+' записів',risk:'optional',
        isCap:true,unknown:unknown,total:rows.length,limit:capLimit,protectedCount:rows.length-candidates.length,
        hint:'Залишити близько '+capLimit+' записів. Спершу підтверджені давні читання, потім записи з невідомим використанням (за часом створення, якщо є), наприкінці недавно прочитані. '+unknown+' із вибраних не мають зафіксованого читання. Дата створення НЕ є датою останнього використання. Тільки після підтвердження.',
        match:function(k){return !!names[k];}},records:list,count:list.length,bytes:bytes,tgBytes:tgBytes});
    });
    return result;
  }
  // Undo lives only in RAM, not localStorage: avoids exhausting the storage quota.
  var lastUndo=null;
  var lastExportGroup='';
  var lastExportSnapshot=null;
  function byteLength(s){
    try{if(typeof TextEncoder!=='undefined')return new TextEncoder().encode(s).length;}catch(e){}
    try{return unescape(encodeURIComponent(s)).length;}catch(e2){return s.length*3;}
  }
  function hasInstalled(found,regexp){
    return found.list.some(function(p){
      return regexp.test(p.url) && p.statuses.some(function(st){return st!=='Вимкнений';});
    });
  }
  var DELETE_GROUPS=[
    {id:'stale_access',title:'Кеш без зафіксованого читання понад обраний поріг',risk:'optional',hint:'Лише ключі зі справді відстеженою давньою датою читання; ручні логотипи та тайтли з добірок захищені.',
      match:function(k){return isObservedStale(k);}},
    {id:'legacy_ydesign_cache',title:'YDesign · старий кеш оформлення',risk:'low',hint:'168 кешів ydesign_c_* у старому бекапі. Не має бути встановленого YDesign.',
      owned:/^(?:ydesign|\/ydes\.js)/i,absent:/(?:ydesign|\/ydes\.js)/i,
      match:function(k){return /^ydesign_c_(?:ext|col|rates|[a-z])/i.test(k);}},
    {id:'legacy_seasonsinfo_cache',title:'SeasonsInfo · кеш після видалення плагіна',risk:'low',hint:'seasonBadgeCache — підтверджений у вихідному коді SeasonsInfo відновлюваний кеш TMDB. TG Sync його вже виключає через слово cache. Якщо SeasonsInfo не встановлено, очищення не має впливати на поточні налаштування.',
      absent:/(?:\/|^)(?:seasons?info|seasonbadge|sbadger)(?:[._\/-]|$)/i,
      match:function(k){return k==='seasonBadgeCache';}},
    {id:'legacy_seasonsinfo_settings',title:'SeasonsInfo · старі налаштування та дані прогресу',risk:'high',hint:'Три ключі sbadger_* містять старі налаштування й TMDB API ключ (конфіденційний); seasonBadgeProcessed — ймовірно споріднений кеш, але точний власник не підтверджений. Тільки якщо SeasonsInfo справді давно видалено. Експортувати обов’язково. НЕ зачіпає загальний season_info.',
      absent:/(?:\/|^)(?:seasons?info|seasonbadge|sbadger)(?:[._\/-]|$)/i,
      match:function(k){return /^(?:sbadger_(?:settings_v1|badge_view|tmdb_key)|seasonBadgeProcessed)$/i.test(k);}},
    {id:'legacy_gramlink',title:'GramLink · залишки старого плагіна',risk:'high',hint:'Старі профілі, налаштування й дані авторизації. Може містити секрети; перед видаленням експортувати.',
      absent:/(?:gramlink|gramjs)/i,match:function(k){return /^gramlink(?:_|$)/i.test(k);}},
    {id:'legacy_ydesign_settings',title:'YDesign · налаштування видаленого плагіна',risk:'high',hint:'Лише якщо YDesign справді більше не потрібен. Це НЕ кеш; налаштування безповоротно зникнуть без бекапу.',
      absent:/(?:ydesign|\/ydes\.js)/i,match:function(k){return /^ydesign_(?!c_)/i.test(k);}},
    {id:'expired_uafilms',title:'UA Films · кеш із завершеним терміном дії',risk:'low',hint:'Лише uafilms_c_* з валідним exp у минулому; плагін може завантажити їх повторно.',
      match:function(k,v){if(!/^uafilms_c_/i.test(k))return false;try{var o=JSON.parse(v);return !!(o&&typeof o.exp==='number'&&o.exp>0&&o.exp<Date.now());}catch(e){return false;}}},
    {id:'optional_jacred',title:'JacRed · повторювані перевірки якості',risk:'optional',hint:'Відновлюваний кеш JacRed; не є історією перегляду. Активний плагін може створити знову.',
      match:function(k){return /^jacred_v[34]_[0-9]+$/i.test(k);}},
    {id:'optional_ytrans',title:'YTranslate · кеш перекладених назв',risk:'optional',hint:'Назви знову завантажаться; НЕ видаляє налаштування ytranslate.',
      match:function(k){return /^ytrans_-?[0-9]+$/i.test(k);}},
    {id:'optional_ifx',title:'Interface+ · кеш українських назв',risk:'optional',hint:'Активний Interface+ може отримати назви знову; НЕ торкається налаштувань interface.',
      match:function(k){return /^ifx_tmdb_ua_title_v[0-9.]+:(?:tv|movie):[0-9]+$/i.test(k);}},
    {id:'optional_logo',title:'Логотипи TMDB · кеш адрес',risk:'optional',hint:'Лише logo_uas_* і logo_cache_width_based_v1_*; НЕ видаляє logo_lang, logo_size та cf_logo_override_*.',
      match:function(k){return /^(?:logo_uas_v[0-9]+_|logo_cache_width_based_v1_)/i.test(k);}},
    {id:'optional_poster',title:'Очищені постери · кеш',risk:'optional',hint:'Лише poster_clean_*; активний плагін завантажить постери знову.',
      match:function(k){return /^poster_clean_v[0-9]+_/i.test(k);}},
    {id:'optional_screensaver',title:'Заставки · список відео',risk:'optional',hint:'Тільки screensaver_aerial_items; повторне отримання каталогу може бути не миттєвим.',
      match:function(k){return k==='screensaver_aerial_items';}}
  ];
  function cleanupReview(scanData){
    var out=[];for(var i=0;i<DELETE_GROUPS.length;i++){
      var d=DELETE_GROUPS[i];
      if(d.absent&&hasInstalled(scanData.plugins,d.absent))continue;
      var list=[];var bytes=0,tgBytes=0;
      for(var j=0;j<scanData.records.length;j++){
        var rec=scanData.records[j],val=null;
        try{val=quietGet(rec.key);}catch(e){continue;}
        if(val===null)continue;
        if(!d.match(rec.key,val)||protectedCacheKey(rec.key)&&d.risk!=='high')continue;
        list.push(rec);bytes+=rec.size;
        if(rec.tg.include)tgBytes+=byteLength(JSON.stringify(rec.key)+':'+JSON.stringify(val)+',');
      }
      if(list.length)out.push({rule:d,records:list,count:list.length,bytes:bytes,tgBytes:tgBytes});
    }
    return out;
  }
  function actualTgSize(except){
    var storage={};
    for(var i=0;i<localStorage.length;i++){
      var k=localStorage.key(i),v=quietGet(k);
      if(except&&except[k])continue;
      if(v!=null&&tgStatus(k,v).include)storage[k]=v;
    }
    return byteLength(JSON.stringify({storage:storage,baseRevision:0,allowShrink:false,forceOverwrite:false}));
  }
  function findSelection(data,id){
    for(var i=0;i<data.cleanups.length;i++)if(data.cleanups[i].rule.id===id)return data.cleanups[i];
    return null;
  }
  function exportGroup(group){
    var obj={type:'Lampa Cache Inspector · Test 4.1 backup',createdAt:new Date().toISOString(),group:group.rule.id,storage:{}};
    for(var i=0;i<group.records.length;i++){
      var k=group.records[i].key,v=quietGet(k);if(v!==null)obj.storage[k]=v;
    }
    try{
      var blob=new Blob([JSON.stringify(obj,null,2)],{type:'application/json;charset=utf-8'});
      var url=URL.createObjectURL(blob),a=document.createElement('a');
      a.href=url;a.download='lampa_cache_backup_'+group.rule.id+'.json';
      document.body.appendChild(a);a.click();document.body.removeChild(a);
      setTimeout(function(){URL.revokeObjectURL(url);},12000);
      lastExportGroup=group.rule.id;
      lastExportSnapshot=obj.storage;
      return true;
    }catch(e){return false;}
  }
  function executeDelete(group){
    var snapshot={},removed=0,skipped=0;
    // Capture and re-check exact keys immediately before deletion. Never use prefix-wide deletion.
    for(var i=0;i<group.records.length;i++){
      var k=group.records[i].key,v=quietGet(k);
      if(v===null||!group.rule.match(k,v)||(protectedCacheKey(k)&&group.rule.risk!=='high')){skipped++;continue;}
      snapshot[k]=v;
    }
    var keys=Object.keys(snapshot);
    for(var j=0;j<keys.length;j++){
      try{localStorage.removeItem(keys[j]);removed++;}catch(e){skipped++;delete snapshot[keys[j]];}
    }
    if(removed)lastUndo={group:group.rule.title,storage:snapshot,time:Date.now()};
    return {removed:removed,skipped:skipped};
  }
  function undoLast(){
    if(!lastUndo)return {restored:0,skipped:0};
    var result={restored:0,skipped:0};
    var keys=Object.keys(lastUndo.storage);
    for(var i=0;i<keys.length;i++){
      var k=keys[i];
      if(quietGet(k)!==null){result.skipped++;continue;}
      try{localStorage.setItem(k,lastUndo.storage[k]);delete activity.last[k];activityDirty=true;result.restored++;}
      catch(e){result.skipped++;}
    }
    // Keep un-restored keys in memory (e.g. storage quota) for repeated attempts.
    var left={};for(var j=0;j<keys.length;j++)if(quietGet(keys[j])===null)left[keys[j]]=lastUndo.storage[keys[j]];
    if(!Object.keys(left).length)lastUndo=null;else lastUndo.storage=left;
    return result;
  }
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
        var mp=safeArr(Lampa.Storage.get('multi_installed_plugins',[]));
        o.sources++;
        for(var m=0;m<mp.length;m++)registerPlugin(o,mp[m],'MultiPlugin · встановлені', 'Доданий до MultiPlugin');
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
    if (/(?:auth|token|password|passwd|secret|session|cookie|credential|api[_-]?key|private[_-]?key|unic[_-]?id|device[_-]?id|uuid|fingerprint|vault|account|login|^sbadger_tmdb_key$)/i.test(key)) return 'auth';
    if (/^(?:history|favorite|favorites|online_view|torrents_view|file_view|bookmarks|watchlist|progress|timeline|plugins|plugins_blacklist)$/i.test(key) || /(?:watch_history|watchlist|timecode|bookmarks|favorites)/i.test(key)) return 'user';
    if (/^(?:jacred_v[34]_\d+|ytrans_-?\d+|logo_uas_|logo_cache_width_based_|poster_clean_|ifx_tmdb_ua_title_|ydesign_c_|uafilms_c_|cf_shared_logo_v\d+_|img_cache_v\d+_|nfx_logo_v\d+_)/i.test(key)) return 'cache';
    if (/(?:cache|_cached|^tmdb|^uafilms_c_|^cf_shared_logo_v1_|^title_cache_hybrid_v3$|^seasonBadgeCache$|^seasonBadgeProcessed$|^screensaver_aerial_items$|^community_watches_line_cache|_probe$|_timestamps?$|^lmp_enh_rating_cache$)/i.test(key)) return 'cache';
    if (/(?:^cf_logo_override_|_settings?$|_enabled$|_disabled$|_position$|_duration$|_quality$|_style$|_mode$|_show_|_hide_|_font_|_color_|_size$|_opacity$|_layout$|_width$|_height$|_text$|_icon$|^cardify_|^obsidian_|^spectrolite_|^cf_)/i.test(key)) return 'settings';
    if (/^(?:language|theme|plugins|settings|player|profile)/i.test(key)) return 'settings';
    return 'other';
  }
  function protectReason(key,nature) {
    if (key===ACCESS_KEY||key===DAYS_KEY)return 'Службові дані інспектора; не очищати.';
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
    if(/^seasonBadgeCache$/i.test(key)) weak='SeasonsInfo · кеш TMDB';
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
    favIds=buildFavorites();
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
        try{val=quietGet(key);}catch(e){continue;}
        if(val===null)continue;
        var size=utf16Size(key)+utf16Size(val);
        var info=classify(key,val.slice(0,16000),found);
        var tg=tgStatus(key,val);
        var r={key:key,size:size,type:info.type,nature:info.nature,owner:info.owner,
          reason:info.reason,confidence:info.confidence,tg:tg,lastUsed:activity.last[key]||0,protectedFav:protectedCacheKey(key)};
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
    var present=Object.create(null);o.records.forEach(function(r){present[r.key]=1;});
    Object.keys(activity.last).forEach(function(k){if(!present[k]){delete activity.last[k];activityDirty=true;}});
    o.records.sort(function(a,b){return b.size-a.size;});
    for(var g in groups)if(Object.prototype.hasOwnProperty.call(groups,g)){
      groups[g].keys.sort(function(a,b){return b.size-a.size;});
      o.groups.push(groups[g]);
    }
    o.groups.sort(function(a,b){return b.bytes-a.bytes;});
    o.cleanups=cleanupReview(o).concat(capGroups(o));
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
      function chooseGroup(id){go('cleanup_detail','Група для очищення',id);}
      function groupCleanupAction(group){
        if(!group)return;
        var before=actualTgSize(null),selected={};
        group.records.forEach(function(r){selected[r.key]=1;});
        var after=actualTgSize(selected);
        var sensitive=group.records.filter(function(r){return r.nature==='auth'||r.nature==='user';}).length;
        detail('Попередній перегляд',[
          'Група: '+group.rule.title,
          'До видалення: '+group.count+' ключів · '+fmtBytes(group.bytes),
          'Оцінка TG-запиту зараз: '+fmtBytes(before),
          'Після: '+fmtBytes(after)+' (якщо більше нічого не зміниться)',
          'Потенційно важливих ключів у цій групі: '+sensitive,
          'Натисни «Підготувати очищення», якщо хочеш продовжити.'
        ]);
      }
      function confirmDeleteGroup(group){
        if(!group)return;
        if(group.rule.risk==='high'&&lastExportGroup!==group.rule.id){
          detail('Спочатку резервна копія',[
            'Ця група містить старі налаштування або авторизаційні дані.',
            'Спочатку відкрий «Експортувати ці ключі в JSON» у групі та збережи файл.',
            'Якщо браузер не вміє завантажувати файли, скористайся повним локальним бекапом і не видаляй цю групу через інспектор.'
          ]);return;
        }
        if(group.rule.risk==='high'){
          var mismatch=false,nowKeys={};
          group.records.forEach(function(r){
            var k=r.key,v=quietGet(k);
            if(v!==null&&group.rule.match(k,v)){
              nowKeys[k]=1;
              if(!lastExportSnapshot||!Object.prototype.hasOwnProperty.call(lastExportSnapshot,k)||lastExportSnapshot[k]!==v)mismatch=true;
            }
          });
          if(lastExportSnapshot&&Object.keys(lastExportSnapshot).length!==Object.keys(nowKeys).length)mismatch=true;
          if(mismatch){
            lastExportGroup='';lastExportSnapshot=null;
            detail('Ключі змінилися',['Після експорту склад або значення ключів цієї групи змінилися.','Заново відкрий групу, повторно відскануй та експортуй бекап перед очищенням.']);return;
          }
        }
        Lampa.Select.show({title:'ОЧИСТИТИ '+group.count+' ключів?',nomark:true,
          items:[{title:'↩ Скасувати',action:'no'},
            {title:'⚠ ТАК, ВИДАЛИТИ '+group.count+' ЗАПИСІВ',action:'yes'}],
          onSelect:function(item){
            if(item.action!=='yes'){Lampa.Controller.toggle('content');return;}
            var r=executeDelete(group);
            lastExportGroup='';lastExportSnapshot=null;data=scan();build();
            detail('Результат очищення',[
              'Видалено: '+r.removed+' записів.',
              'Пропущено/змінено перед видаленням: '+r.skipped+'.',
              'Можеш виконати «Відкотити останнє очищення», поки не перезавантажиш Lampa.',
              'TG Sync не змінено. Бекап на сервері не редагувався.'
            ]);
          },onBack:function(){Lampa.Controller.toggle('content');}
        });
      }
      function recordDetail(r){detail(r.key,[
        'Оцінка розміру: '+fmtBytes(r.size),'Класифікація: '+TYPES[r.type]+' · '+NATURES[r.nature],
        'Можливий власник: '+r.owner,'Достовірність: '+r.confidence,'Чому: '+r.reason,
        'Активність: '+recentText(r.key),
        'Захист обраного: '+(r.protectedFav?'Так (за відомим ідентифікатором / системне правило)':'Не знайдено збігу'),
        'TG-копія: '+(r.tg.include?'ВКЛЮЧЕНО':'ВИКЛЮЧЕНО')+' · '+r.tg.reason,
        'Класифікація не є доказом непотрібності. Очищення — лише за згодою.'
      ]);}
      function recordsList(rows,title,subtitle){
        header(grid,title,rows.length+' ключів. '+subtitle);
        rows.slice(0,limit).forEach(function(r){
          var desc=r.owner+' · '+fmtBytes(r.size)+' · '+NATURES[r.nature]+' · TG: '+(r.tg.include?'так':'ні')+' · '+recentText(r.key);
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
          header(grid,'Cache Inspector · Test 4.1',
            'АНАЛІЗ + ВИБІРКОВЕ ОЧИЩЕННЯ. '+data.records.length+' ключів · '+fmtBytes(data.total)+'. Оцінки розміру приблизні. Автоматичних змін немає. '+data.error);
          card(grid,'🕒 Останнє використання кешу','Стан: '+(trackingEnabled?'увімкнено':'вимкнено')+' · поріг неактивності: '+staleDays+' днів',
            function(){go('usage','Активність кешу');},{wide:true,accent:'green',scroll:sc});
          card(grid,'📦 Обмежити надлишковий кеш','Окремі групи (лого, переклади, JacRed, назви) · ліміт '+capLimit+' записів на групу · ручні логотипи та обране під захистом',
            function(){go('cap','Обмеження кешу');},{wide:true,accent:'green',scroll:sc});
          card(grid,'🧹 Кероване очищення','Групи кешу та спостереження за читанням. Попередній перегляд → бекап → підтвердження → відкат.',function(){go('cleanup','Кероване очищення');},{wide:true,accent:'yellow',scroll:sc});
          if(lastUndo)card(grid,'↶ Відкотити останнє очищення',lastUndo.group+' · '+Object.keys(lastUndo.storage).length+' ключів (лише до перезавантаження)',
            function(){var r=undoLast();data=scan();build();detail('Відкат',['Відновлено: '+r.restored,'Пропущено: '+r.skipped,'Наявні ключі не перезаписуються.']);},{wide:true,accent:'green',scroll:sc});
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
        } else if(level==='cap'){
          header(grid,'Надлишковий відновлюваний кеш',
            'Одноразове очищення за кількістю, НЕ фоновий ліміт у плагінах. Окремо для кожної групи; обране та ручні логотипи захищені, коли можна зіставити TMDB ID. Нові записи з часом знову накопичаться.');
          card(grid,'⚙ Ліміт на групу: '+capLimit+' записів','Натисни, щоб змінити на 100, 250 або 500. Це НЕ змінює налаштування кешу інших плагінів.',function(){
            Lampa.Select.show({title:'Поріг надлишкового кешу',items:[{title:'100 записів',limit:100},{title:'250 записів',limit:250},{title:'500 записів',limit:500}],onSelect:function(it){
              if(it&&it.limit){capLimit=it.limit;quietSet(CAP_KEY,String(capLimit));data=scan();build();}
              Lampa.Controller.toggle('content');
            },onBack:function(){Lampa.Controller.toggle('content');}});
          },{wide:true,accent:'green',scroll:sc});
          var caps=data.cleanups.filter(function(g){return !!g.rule.isCap;});
          if(!caps.length)header(grid,'Перевищення не знайдено','Групи з відомими відновлюваними записами не перевищують установлений поріг або захищені записи не дозволяють безпечне скорочення.');
          caps.forEach(function(g){
            card(grid,g.rule.title,g.rule.total+' всього · обрано '+g.count+' до очищення · '+fmtBytes(g.bytes)+' · TG: '+fmtBytes(g.tgBytes)+' · невідомі читання: '+g.rule.unknown,
              function(){chooseGroup(g.rule.id);},{wide:true,accent:'yellow',scroll:sc});
          });
          header(grid,'Як відбираються записи','Очищається лише явно підтверджена вибірка. Для кешів без історії читань використовуємо час запису, якщо він є; інакше стабільний порядок ключів, НЕ удавану дату останнього використання. Експорт перед видаленням рекомендований.');
        } else if(level==='usage'){
          var caches=data.records.filter(function(r){return trackedCacheKey(r.key)&&r.nature!=='settings'&&r.nature!=='auth'&&r.nature!=='user';});
          var used=caches.filter(function(r){return !!activity.last[r.key];});
          var stale=used.filter(function(r){return isObservedStale(r.key);});
          var unobserved=caches.filter(function(r){return !activity.last[r.key];});
          header(grid,'Спостереження за читанням кешу',
            'Стан: '+(trackingEnabled?'увімкнено':'вимкнено')+' · початок: '+(activity.started?new Date(activity.started).toLocaleString('uk-UA'):'не розпочато')+'. Не знає минулої активності або читань із внутрішньої пам’яті плагінів.');
          card(grid,trackingEnabled?'● Вимкнути стеження':'◯ Увімкнути стеження','За замовчуванням вимкнено. Зберігає лише ключі і час читання, не самі дані. Максимум ~96 КіБ.',function(){
            trackingEnabled=!trackingEnabled;quietSet(TRACK_KEY,String(trackingEnabled));
            if(trackingEnabled&&!activity.started){activity.started=Date.now();activityDirty=true;flushActivity();}
            data=scan();build();
          },{wide:true,accent:trackingEnabled?'yellow':'green',scroll:sc});
          card(grid,'⚙ Поріг неактивності: '+staleDays+' днів','Змінити на 30, 90 або 180 днів (тільки за підтвердженими датами читання).',function(){
            Lampa.Select.show({title:'Поріг неактивності кешу',items:[{title:'30 днів',days:30},{title:'90 днів',days:90},{title:'180 днів',days:180}],onSelect:function(it){
              if(it&&it.days){staleDays=it.days;quietSet(DAYS_KEY,String(it.days));data=scan();build();}
              Lampa.Controller.toggle('content');
            },onBack:function(){Lampa.Controller.toggle('content');}});
          },{wide:true,scroll:sc});
          card(grid,'◴ Без читань понад '+staleDays+' днів',stale.length+' ключів · лише за реально зафіксованою активністю, крім обраного та ручних логотипів',
            function(){go('usage:stale','Давно не читали');},{wide:true,accent:'yellow',scroll:sc});
          card(grid,'◷ Читали після встановлення',used.length+' ключів · від найдавнішого звернення',function(){go('usage:used','Відомі дати читання');},{wide:true,scroll:sc});
          card(grid,'? Немає даних про читання',unobserved.length+' ключів · це НЕ доказ, що вони старі або непотрібні',function(){go('usage:unknown','Дані про використання невідомі');},{wide:true,scroll:sc});
          header(grid,'Захист','Ручні cf_logo_override_* не очищаються; тайтли зі списків обраного/перегляду за TMDB ID не рекомендуються до очищення. Один ключ може містити кеш для багатьох фільмів, тоді історія читань стосується всього ключа.');
        } else if(level.indexOf('usage:')===0){
          var mode=level.slice(6),rows=data.records.filter(function(r){
            if(!trackedCacheKey(r.key)||r.nature==='settings'||r.nature==='auth'||r.nature==='user')return false;
            if(mode==='stale')return isObservedStale(r.key);
            if(mode==='used')return !!activity.last[r.key];
            if(mode==='unknown')return !activity.last[r.key];
            return false;
          });
          if(mode==='stale'||mode==='used')rows.sort(function(a,b){return (activity.last[a.key]||0)-(activity.last[b.key]||0);});
          else rows.sort(function(a,b){return b.size-a.size;});
          recordsList(rows,mode==='stale'?'Давно не читали':mode==='used'?'Відомі дати читання':'Не спостерігали',
            'Відстежується лише читання ключів з моменту встановлення Test 4. Не підмінює дату відкриття фільму.');
        } else if(level==='cleanup'){
          header(grid,'Кероване очищення',
            'Сканування ПОТОЧНОГО localStorage. Старий JSON використовувався для побудови правил, але після ручного очищення склад ключів міг змінитися. Не видаляємо нічого без підтвердження.');
          var tgSize=actualTgSize(null);
          card(grid,'☁ Розмір запиту TG Sync',fmtBytes(tgSize)+' · приблизна оцінка тіла HTTP-запиту, без серверної ревізії',
            function(){detail('Оцінка TG',['Розмір локально сформованого тіла POST.','Це не перевірка серверного ліміту; TG Sync не викликається.']);},{wide:true,scroll:sc});
          var kinds=[['low','✅ Відновлювані / прострочені'],['high','⚠ Залишки з налаштуваннями / профілями'],['optional','◌ Кеш активних плагінів (лише за бажанням)']];
          kinds.forEach(function(t){
            var rows=data.cleanups.filter(function(g){return g.rule.risk===t[0];});
            if(!rows.length)return;
            header(grid,t[1],t[0]==='high'?'Можуть містити цінні дані; експорт обов’язковий.':t[0]==='optional'?'Не вважаються сміттям: активні плагіни можуть створити їх повторно.':'Точний набір ключів обмежений правилами.');
            rows.forEach(function(g){card(grid,g.rule.title,g.count+' ключів · '+fmtBytes(g.bytes)+' · у TG-запиті ~'+fmtBytes(g.tgBytes),
              function(){chooseGroup(g.rule.id);},{accent:t[0]==='high'?'yellow':t[0]==='low'?'green':'blue',scroll:sc});});
          });
          header(grid,'SeasonsInfo та інші залишки','Кеш seasonBadgeCache не передається через TG Sync, а налаштування sbadger_* — передаються. Відсутність у списку установлених — лише ознака: перед видаленням профілів потрібна твоя перевірка й експорт.');
          header(grid,'Захист','Не пропонуємо групове очищення cf_logo_override_*, cf_*, spl_*, cardify_*, obsidian_* та всіх невідомих ключів. Наявність старого профілю плагіна не є доказом його непотрібності.');
        } else if(level==='cleanup_detail'){
          var group=findSelection(data,groupName);
          if(!group){header(grid,'Група вже відсутня','Можливо, її очистили або встановили відповідний плагін.');}
          else{
            header(grid,group.rule.title,group.rule.hint+' · '+group.count+' ключів, '+fmtBytes(group.bytes));
            if(group.rule.isCap)header(grid,'УВАГА · Невідомий час використання',
              group.rule.unknown+' із '+group.count+' вибраних записів не мають підтвердженої дати читання. Відбір за кількістю НЕ доводить, що користувач давно не відкривав ці тайтли. Рекомендуємо спершу експортувати.');
            card(grid,'🔍 Перегляд впливу на TG-запит','Точний розрахунок із поточного localStorage (без передачі даних)',function(){groupCleanupAction(group);},{wide:true,scroll:sc});
            card(grid,'⬇ Експортувати ці ключі в JSON','Обережно: файл містить усі значення вибраної групи, зокрема секрети, якщо вони є.',function(){
              var ok=exportGroup(group);detail('Експорт',[ok?'Браузеру передано файл для збереження. Перед очищенням обов’язково перевір, що файл справді завантажився.':'Не вдалося створити файл. Не очищуй цю групу без резервної копії.']);
            },{wide:true,scroll:sc});
            card(grid,'🧹 Підготувати очищення',group.rule.risk==='high'?'Вимагає експорту й додаткового підтвердження.':'Потрібне явне підтвердження. Жодних автоматичних видалень.',function(){confirmDeleteGroup(group);},{wide:true,accent:'yellow',scroll:sc});
            header(grid,'Ключі, що підпадають під правило','Значення не відображаються; від найбільшого.');
            group.records.slice(0,limit).forEach(function(r){card(grid,r.key,fmtBytes(r.size)+' · TG: '+(r.tg.include?'у копії':'поза копією'),function(){recordDetail(r);},{scroll:sc});});more(group.records.length);
          }
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
    window[FLAG]=true;installTracking();css();initComponent();
    Lampa.SettingsApi.addComponent({component:SETTINGS,name:'Cache Inspector · Test 4.1',
      icon:'<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect x="3" y="4" width="18" height="15" rx="2"/><path d="M7 9h10M7 13h7M9 21h6"/></svg>'});
    Lampa.SettingsApi.addParam({component:SETTINGS,param:{type:'button'},field:{name:'🔎 Аналіз і очищення localStorage',description:'Попередній перегляд, вибіркове очищення, TG-аудит і відкат'},
      onChange:function(){Lampa.Activity.push({url:'',title:'Cache Inspector · Test 4.1',component:COMPONENT,level:'overview'});}});
  }
  var tries=0,timer=setInterval(function(){
    tries++;
    if(window.Lampa&&Lampa.SettingsApi&&Lampa.Component&&Lampa.Platform){clearInterval(timer);init();}
    else if(tries>=120)clearInterval(timer);
  },500);
})();
