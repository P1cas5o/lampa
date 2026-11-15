/* UAKino AX Minimal — Test 2 (2026-11-16)
 * Independent Lampa online source. No theme, global player hooks or account UI.
 * Uses UAKino AX's public Lampa find/play endpoints; stream URLs may be IP-bound/short-lived.
 */
(function () {
  'use strict';
  if (window.__uakinoAxMinimalTest2) return;
  window.__uakinoAxMinimalTest2 = true;
  var API = 'https://uakino.ax', COMPONENT = 'uakino_ax_minimal';
  var $ = window.$;
  function notify(s) { try { Lampa.Noty.show('UAKino AX: ' + s); } catch (e) {} }
  function query(o) { return Object.keys(o).filter(function(k){return o[k] !== null && o[k] !== undefined && o[k] !== '';}).map(function(k){return encodeURIComponent(k)+'='+encodeURIComponent(o[k]);}).join('&'); }
  // Match the original UAKino AX transport: fetch with no-store; XHR only as fallback.
  // A fetch network error may indicate CORS, DNS, TLS or server reachability.
  function request(url) {
    if (typeof window.fetch === 'function') {
      return window.fetch(url, {cache:'no-store'}).then(function(r){
        return r.text().then(function(t){
          var data; try {data=JSON.parse(t);} catch(e){throw new Error('HTTP '+r.status+': не JSON');}
          // Original UAKino AX allows a 404 "not found" result to pass through.
          if (!r.ok && !data.found && r.status!==404) throw new Error(data.error || ('HTTP '+r.status));
          return data;
        });
      }).catch(function(e){
        if(e instanceof TypeError) throw new Error('Мережа/CORS: '+e.message);
        throw e;
      });
    }
    return new Promise(function(resolve,reject){
      var xhr=new XMLHttpRequest(); xhr.open('GET',url,true); xhr.timeout=18000;
      try{xhr.setRequestHeader('Cache-Control','no-cache');}catch(e){}
      xhr.onload=function(){var d;try{d=JSON.parse(xhr.responseText);}catch(e){reject(new Error('HTTP '+xhr.status+': не JSON'));return;}
        if((xhr.status<200||xhr.status>=300)&&!d.found&&xhr.status!==404){reject(new Error(d.error||('HTTP '+xhr.status)));return;}resolve(d);};
      xhr.onerror=function(){reject(new Error('Мережа/CORS (XHR)'));};
      xhr.ontimeout=function(){reject(new Error('Тайм-аут запиту'));};
      xhr.send();
    });
  }
  function sid() { var s=Lampa.Storage.get('uakino_sid',''); if(!s){s='lp'+Math.random().toString(36).slice(2)+Date.now().toString(36);Lampa.Storage.set('uakino_sid',s);}return s; }
  function hevc() { try { if(Lampa.Platform.is('android')) return 1; var c='video/mp4; codecs="hvc1.1.6.L153.90"'; if(window.MediaSource&&MediaSource.isTypeSupported&&MediaSource.isTypeSupported(c))return 1; if(document.createElement('video').canPlayType(c))return 1; }catch(e){} return 0; }
  function isTV(m){return !!(m.name||m.number_of_seasons||m.first_air_date);}
  function find(m){var date=m.release_date||m.first_air_date||'';return request(API+'/hls/api/lampa/find?'+query({tmdb:m.id,imdb:m.imdb_id,type:isTV(m)?'tv':'movie',year:date.slice(0,4),title:m.title||m.name,orig:m.original_title||m.original_name}));}
  function play(id,o){o=o||{};return request(API+'/hls/api/play?'+query({movie:id,s:sid(),hevc:hevc(),voice:o.voice,season:o.season,episode:o.episode,q:o.q}));}
  function streamURL(p){var m=p&&p.manifest||'';var u=/^https?:/i.test(m)?m:((p&&p.manifest_abs)||(m?API+m:''));if(u&&!/\.m3u8($|\?)/i.test(u))u+='.m3u8';return u;}
  function copy(url){if(!url){notify('Посилання не знайдено');return;}try{Lampa.Utils.copyTextToClipboard(url,function(){notify('Посилання скопійовано');},function(){notify('Не вдалося скопіювати');});}catch(e){notify('Не вдалося скопіювати');}}
  function timeline(m,s,e){try{var name=m.original_title||m.original_name||m.title||m.name||'';var key=s!=null?String(s)+(s>10?':':'')+String(e)+name:name;return Lampa.Timeline.view(Lampa.Utils.hash(key));}catch(e){return undefined;}}
  function launch(p,meta,m){var url=streamURL(p);if(!url){notify('Сервер не повернув відеопосилання');return;}
    var item={title:(m.title||m.name||'UAKino')+(meta.season!=null?' • С'+meta.season+' Е'+meta.episode:''),url:url,isonline:true,hls_type:'hlsjs',timeline:timeline(m,meta.season,meta.episode)};
    if(p.subs&&p.subs.length)item.subtitles=p.subs.map(function(s){return {label:s.label,url:/^https?:/i.test(s.url)?s.url:API+s.url};});
    try{Lampa.Player.play(item);Lampa.Player.playlist([item]);}catch(e){notify('Не вдалося відкрити плеєр');}
  }
  function choose(title,items,selected,done){
    Lampa.Select.show({title:title,items:items.map(function(x){return {title:x.title,subtitle:x.subtitle||'',value:x.value,selected:x.value===selected,template:'selectbox_icon'};}),onSelect:function(x){done(x.value);},onBack:function(){try{Lampa.Controller.toggle('content');}catch(e){}}});
  }
  function Component(object){
    var self=this, movie=object.movie||object.card||{}, html=null,scroll=null,body=null,rows=[],focusIndex=0,state={id:null,meta:null,voice:null,season:null,quality:0,episodes:[],voices:[],loading:false},destroyed=false;
    function active(){try{return Lampa.Activity.active().activity===self.activity;}catch(e){return false;}}
    function busy(on){state.loading=on;try{self.activity.loader(on);if(!on)self.activity.toggle();}catch(e){}}
    function focus(el){try{focusIndex=Math.max(0,rows.indexOf(el));Lampa.Controller.collectionSet(scroll.render());Lampa.Controller.collectionFocus(el,scroll.render());scroll.update($(el),true);}catch(e){}}
    function row(title,sub,fn){var el=$('<div class="online__item selector" style="padding:1em 1.25em;min-height:3.4em;border-bottom:1px solid rgba(255,255,255,.09)"><div class="online__item-title"></div><div class="online__item-subtitle" style="opacity:.6;font-size:.9em;margin-top:.25em"></div></div>');el.find('.online__item-title').text(title);el.find('.online__item-subtitle').text(sub||'');el.on('hover:enter',fn);el.on('hover:focus',function(){try{scroll.update(el,true);}catch(e){}});body.append(el);rows.push(el);return el;}
    function resolve(meta,action){if(state.loading)return;busy(true);play(state.id,{voice:meta.voice,season:meta.season,episode:meta.episode,q:meta.quality||undefined}).then(function(p){busy(false);if(destroyed)return;var url=streamURL(p);if(!url){notify('Сервер не повернув посилання');return;}if(action==='copy')copy(url);else launch(p,meta,movie);}).catch(function(e){busy(false);notify(e.message||'Не вдалося отримати потік');});}
    function context(meta){var items=[{title:'Відкрити у плеєрі',value:'play'},{title:'Копіювати посилання',value:'copy'}];choose('UAKino AX',items,'',function(v){try{Lampa.Controller.toggle('content');}catch(e){}resolve(meta,v);});}
    function episodeMeta(e){return {voice:state.voice,season:e.season,episode:e.episode,quality:state.quality};}
    function voicesInSeason(s){var have={};state.episodes.forEach(function(e){if(e.season===s&&e.episode!=null)have[e.voice||'']=1;});return state.voices.filter(function(v){return have[v||''];}).concat(Object.keys(have).filter(function(k){return state.voices.indexOf(k)<0;}).map(function(k){return k||null;}));}
    function seasons(){var a=[];state.episodes.forEach(function(e){if(e.episode!=null&&a.indexOf(e.season)<0)a.push(e.season);});return a.sort(function(a,b){return a-b;});}
    function draw(){if(destroyed||!body)return;body.empty();rows=[];focusIndex=0;
      if(!state.id){row('Завантаження…','Пошук на UAKino AX',function(){});return;}
      var tv=isTV(movie)||state.episodes.some(function(e){return e.episode!=null;}), list=state.episodes;
      if(tv){var ss=seasons();if(!ss.length){row('Серії не знайдено','',function(){});return;}
        if(ss.indexOf(state.season)<0)state.season=ss[0];var vs=voicesInSeason(state.season);if(vs.indexOf(state.voice)<0)state.voice=vs[0]||null;
        if(ss.length>1)row('Сезон: '+state.season,'Змінити сезон',function(){choose('Сезон',ss.map(function(s){return {title:'Сезон '+s,value:s};}),state.season,function(v){state.season=v;draw();focus(rows[0]);});});
        if(vs.length>1)row('Озвучка: '+(state.voice||'Українська'),'Змінити озвучку',function(){choose('Озвучка',vs.map(function(v){return {title:v||'Українська',value:v};}),state.voice,function(v){state.voice=v;draw();focus(rows[0]);});});
      }else if(state.voices.length>1)row('Озвучка: '+(state.voice||'Українська'),'Змінити озвучку',function(){choose('Озвучка',state.voices.map(function(v){return {title:v||'Українська',value:v};}),state.voice,function(v){state.voice=v;draw();focus(rows[0]);});});
      row('Якість: '+(state.quality?state.quality+'p':'Авто'),'Змінити якість потоку',function(){var q=[{title:'Авто',value:0},];if(hevc())q.push({title:'2160p (4K)',value:2160});choose('Якість',q,state.quality,function(v){state.quality=v;draw();focus(rows[0]);});});
      if(tv){list.filter(function(e){return e.season===state.season&&(e.voice||null)===(state.voice||null)&&e.episode!=null;}).sort(function(a,b){return a.episode-b.episode;}).forEach(function(e){var meta=episodeMeta(e);var el=row('Серія '+e.episode+(e.title&&e.title!=='Серія '+e.episode?' · '+e.title:''),'UAKino AX · '+(state.voice||'Українська'),function(){resolve(meta,'play');});el.on('hover:long',function(){context(meta);});});
      }else{var meta={voice:state.voice,quality:state.quality};var el=row(movie.title||movie.name||'Дивитися','UAKino AX · '+(state.voice||'Українська'),function(){resolve(meta,'play');});el.on('hover:long',function(){context(meta);});}
      try{Lampa.Layer.update();}catch(e){}
    }
    this.create=function(){html=$('<div class="uakino-ax-minimal" style="height:100%"></div>');scroll=new Lampa.Scroll({mask:true,over:true,step:250});try{scroll.minus();}catch(e){}body=$('<div style="padding:1em 2em 3em"></div>');scroll.append(body);html.append(scroll.render());draw();busy(true);
      find(movie).then(function(f){if(!f||!f.found||!f.movie_id)throw new Error('Тайтл не знайдено');state.id=f.movie_id;return play(state.id,{});}).then(function(p){if(destroyed)return;state.meta=p;state.episodes=p.episodes||[];state.voices=p.voices||[];state.voice=(p.current&&p.current.voice)||state.voices[0]||null;busy(false);draw();}).catch(function(e){busy(false);if(destroyed)return;body.empty();rows=[];focusIndex=0;row('UAKino AX: '+(e.message||'Помилка завантаження'),'Поверніться назад і спробуйте ще раз',function(){});});};
    this.start=function(){Lampa.Controller.add('content',{toggle:function(){Lampa.Controller.collectionSet(scroll.render());if(rows.length)focus(rows[0]);},up:function(){if(focusIndex>0)focus(rows[focusIndex-1]);else Lampa.Controller.toggle('head');},down:function(){if(focusIndex<rows.length-1)focus(rows[focusIndex+1]);},left:function(){Lampa.Controller.toggle('menu');},right:function(){},enter:function(){},back:function(){Lampa.Activity.backward();}});Lampa.Controller.toggle('content');};
    this.pause=function(){};this.stop=function(){};this.render=function(){return html;};this.destroy=function(){destroyed=true;try{scroll.destroy();}catch(e){}if(html)html.remove();};
  }
  function init(){if(!window.Lampa||!Lampa.Component||!Lampa.Manifest)return;
    Lampa.Component.add(COMPONENT,Component);
    var manifest={type:'video',version:'1.0-test2',name:'UAKino AX Minimal',description:'Мінімальне онлайн-джерело UAKino AX',component:COMPONENT,
      onContextMenu:function(){return {name:'UAKino AX',description:'Онлайн'};},
      onContextLauch:function(movie){Lampa.Activity.push({url:'',title:'UAKino AX',component:COMPONENT,movie:movie,card:movie,page:1});}};
    // Same registration contract as gpbay: manifest describes an online video source.
    Lampa.Manifest.plugins=manifest;
    try{console.log('[UAKino AX Minimal] Test 2 ready');}catch(e){}
  }
  if(window.appready)init();else if(window.Lampa&&Lampa.Listener)Lampa.Listener.follow('app',function(e){if(e.type==='ready')init();});
})();
