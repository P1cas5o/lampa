/* Obsidian Wide 0.2.0 — Lampa home continue + history; companion to Obsidian */
(function () {
 'use strict';
 var FLAG='__obsidianWide02', TAG='ow2', started=false, logoCache={}, waiting={}, io=null;
 if(window[FLAG]) return;
 window[FLAG]=true;
 function log(){try{console.log.apply(console,['[Obsidian Wide 0.2]'].concat([].slice.call(arguments)));}catch(e){}}
 function txt(m){return m.title||m.name||m.original_title||m.original_name||'';}
 function kind(m){return m.media_type==='tv'||(!m.title&&!!m.name)||!!m.first_air_date?'tv':'movie';}
 function esc(x){return String(x==null?'':x).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
 function img(path,size){return path?Lampa.TMDB.image('t/p/'+size+path):'';}
 function elOf(x){var h=x&&x.html||x;return h&&(h.jquery?h[0]:h.nodeType?h:h[0]);}
 function progress(m){
   try{
     var name=m.original_title||m.original_name||txt(m), fv=Lampa.Storage.cache('file_view',10000,{})||{};
     function read(hash){return fv[hash]||(Lampa.Timeline&&Lampa.Timeline.view&&Lampa.Timeline.view(hash));}
     function norm(v,s,e){if(!v)return null;var time=Number(v.time)||0,total=Number(v.duration)||0,p=Number(v.percent);if(!(p>=0))p=total?time/total*100:0;if(!p&&!time)return null;return {pct:Math.min(100,Math.max(0,p)),time:time,total:total,s:s||0,e:e||0};}
     if(kind(m)==='movie')return norm(read(Lampa.Utils.hash(name)));
     var best=null,seasons=Math.min(20,Number(m.number_of_seasons)||12);
     for(var s=1;s<=seasons;s++)for(var ep=1;ep<=40;ep++){
       var hash=Lampa.Utils.hash([s,s>10?':':'',ep,name].join(''));
       var p=norm(read(hash),s,ep);if(p)best=p;
     }
     return best;
   }catch(e){return null;}
 }
 function clock(t){t=Math.max(0,Number(t)||0);var h=Math.floor(t/3600),m=Math.floor(t%3600/60),s=Math.floor(t%60);return (h?h+':':'')+(h?('0'+m).slice(-2):m)+':'+('0'+s).slice(-2);}
 function fetchLogo(m,cb){
   var k=kind(m)+':'+m.id;if(Object.prototype.hasOwnProperty.call(logoCache,k))return cb(logoCache[k]);
   if(waiting[k])return waiting[k].push(cb);waiting[k]=[cb];
   function done(path){logoCache[k]=path||'';(waiting[k]||[]).forEach(function(f){try{f(logoCache[k]);}catch(e){}});delete waiting[k];}
   try{
     var path=kind(m)+'/'+m.id+'/images?include_image_language=uk,en,null';
     var url=Lampa.TMDB.api(path+'&api_key='+Lampa.TMDB.key()+'&language=uk');
     new Lampa.Reguest().silent(url,function(j){var ls=j&&j.logos||[],a=ls.filter(function(l){return l.iso_639_1==='uk';})[0]||ls.filter(function(l){return l.iso_639_1==='en';})[0]||ls[0];done(a&&a.file_path);},function(){done('');});
   }catch(e){done('');}
 }
 function visibleLogo(view,m){
   function load(){if(view.getAttribute('data-ow2-loaded'))return;view.setAttribute('data-ow2-loaded','1');fetchLogo(m,function(path){if(!path||!view.isConnected)return;var holder=view.querySelector('.ow2-name');if(!holder)return;var im=document.createElement('img');im.className='ow2-logo';im.alt='';im.onload=function(){view.classList.add('ow2-logo-ok');};im.onerror=function(){im.remove();};im.src=img(path,'w300');holder.appendChild(im);});}
   if(!window.IntersectionObserver)return load();
   if(!io)io=new IntersectionObserver(function(entries){entries.forEach(function(entry){if(entry.isIntersecting){io.unobserve(entry.target);var fn=entry.target.__ow2load;delete entry.target.__ow2load;if(fn)fn();}});},{rootMargin:'160px'});
   view.__ow2load=load;io.observe(view);
 }
 function decorate(inst,m){
   var el=elOf(inst);if(!el||!el.querySelector||el.classList.contains('ow2-card'))return;
   var view=el.querySelector('.card__view');if(!view)return;
   el.classList.add('ow2-card');
   var pic=m.backdrop_path||m.poster_path;if(pic)view.style.backgroundImage='url("'+img(pic,'w500')+'")';
   var p=progress(m),rating=Number(m.vote_average)||0,quality=m.quality||m.video_quality||'';
   var overlay=document.createElement('div');overlay.className='ow2-overlay';
   overlay.innerHTML='<div class="ow2-name"><span class="ow2-fallback">'+esc(txt(m))+'</span></div>'+
      '<div class="ow2-info">'+(rating?'<span class="ow2-rating">★ '+rating.toFixed(1)+'</span>':'')+
      (typeof quality==='string'&&/^(4k|uhd|fhd|full.?hd|1080p|720p|hd)$/i.test(quality)?'<span>'+esc(quality)+'</span>':'')+'</div>'+
      '<div class="ow2-foot"><span>'+(p&&p.s?'С'+p.s+' · Е'+p.e:'')+'</span><span>'+(p&&p.total?clock(p.time)+' / '+clock(p.total):'')+'</span></div>'+
      (p&&p.pct>0?'<div class="ow2-progress"><i style="width:'+p.pct+'%"></i></div>':'');
   view.appendChild(overlay);visibleLogo(view,m);
 }
 function enhance(m){
   if(!m||!m.id)return m;
   var item=Object.assign({},m),params=Object.assign({},m.params||{}),old=params.emit||{},emit=Object.assign({},old);
   emit.onCreate=function(){if(typeof old.onCreate==='function')old.onCreate.apply(this,arguments);try{decorate(this,m);}catch(e){log('card error',e);}};
   params.emit=emit;params.style={name:'wide'};item.params=params;item.__ow2=true;return item;
 }
 function isContinue(line){
   if(!line||!line.results||!line.results.length)return false;
   var names=['Продовжити перегляд','Продовжити','Continue watching'];
   try{names.push(Lampa.Lang.translate('title_continue'));}catch(e){}
   if(names.indexOf(String(line.title||'').trim())>=0)return true;
   if(line.url||line.source)return false;
   try{var ids={},first={};['tv','anime','movie'].forEach(function(k){var arr=Lampa.Favorite.continues(k)||[];if(arr[0])first[arr[0].id]=true;arr.forEach(function(c){if(c&&c.id)ids[c.id]=true;});});return !!first[line.results[0].id]&&line.results.every(function(c){return c&&ids[c.id];});}catch(e){return false;}
 }
 function installCardHook(){
   if(!Lampa.Utils||typeof Lampa.Utils.createInstance!=='function')return;
   var original=Lampa.Utils.createInstance;if(original.__ow2)return;
   function wrapped(Base,data){
     try{
       var n=Base&&Base.name||'',M=Lampa.Maker;
       if(M&&M.list&&M.get){var names=M.list();if(names.indexOf('Line')>=0&&Base===M.get('Line',{}))n='Line';}
       if(n==='Line'&&data&&isContinue(data)){
         data.results=data.results.map(function(m){return m&&m.__ow2?m:enhance(m);});
       }
     }catch(e){log('line hook error',e);}
     return original.apply(this,arguments);
   }
   wrapped.__ow2=true;Lampa.Utils.createInstance=wrapped;
 }
 function historyRow(){
   Lampa.ContentRows.add({name:'ObsidianWideHistory',title:'Історія перегляду',index:20,screen:['main'],
     call:function(params,screen){return function(call){
       var items=[];try{items=Lampa.Favorite.get({type:'history'})||[];}catch(e){log('history',e);}
       items=items.filter(function(m){return m&&m.id;}).slice(0,20).map(enhance);
       if(!items.length)return call();
       call({title:'Історія перегляду',source:'tmdb',results:items,total_pages:1});
     };}
   });
 }
 function css(){if(document.getElementById('ow2-style'))return;var s=document.createElement('style');s.id='ow2-style';s.textContent=`
 .ow2-card .card__view{position:relative!important;aspect-ratio:16/9!important;background-position:center!important;background-size:cover!important;overflow:hidden!important}
 .ow2-card .card__img{opacity:0!important}
 .ow2-card .ow2-overlay{position:absolute;inset:0;z-index:3;pointer-events:none;color:white;background:linear-gradient(0deg,rgba(0,0,0,.88),transparent 76%)}
 .ow2-card .ow2-name{position:absolute;top:10%;left:7%;right:7%;height:58%;display:flex;align-items:center;justify-content:center;text-align:center}
 .ow2-card .ow2-fallback{font-weight:750;font-size:1.2em;line-height:1.15;text-shadow:0 2px 6px black}
 .ow2-card .ow2-logo{position:absolute;max-width:85%;max-height:94%;object-fit:contain;filter:drop-shadow(0 2px 5px #000)}
 .ow2-card .ow2-logo-ok .ow2-fallback{visibility:hidden}
 .ow2-card .ow2-info{position:absolute;bottom:19%;left:6%;right:6%;display:flex;gap:.6em;font-size:.72em;font-weight:650;text-shadow:0 1px 3px black}
 .ow2-card .ow2-rating{color:#f7d45c}
 .ow2-card .ow2-foot{position:absolute;bottom:7%;left:6%;right:6%;display:flex;justify-content:space-between;gap:.4em;font-size:.72em;text-shadow:0 1px 3px black}
 .ow2-card .ow2-progress{position:absolute;bottom:3%;left:6%;right:6%;height:3px;background:#ffffff55;border-radius:3px;overflow:hidden}
 .ow2-card .ow2-progress i{display:block;height:100%;background:#fff}
 .ow2-card>.card__title,.ow2-card>.card__vote,.ow2-card>.card__age{display:none!important}
 @media(max-width:600px){.ow2-card .ow2-fallback{font-size:1em}.ow2-card .ow2-info,.ow2-card .ow2-foot{font-size:.65em}}
 `;document.head.appendChild(s);}
 function start(){if(started)return;if(!window.Lampa||!Lampa.ContentRows||!Lampa.ContentRows.add||!Lampa.Maker)return;
   started=true;css();
   // The native continue line is identified when Lampa instantiates it, as in zakus.js.
   installCardHook();
   try{historyRow();log('history registered');}catch(e){log('history registration error',e);}
   log('ready');
 }
 function boot(){if(window.appready)start();else if(window.Lampa&&Lampa.Listener)Lampa.Listener.follow('app',function(e){if(e&&e.type==='ready')start();});}
 boot();
})();
