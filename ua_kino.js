/* UAKino Diagnostic Test 3 — isolated read-only network diagnostics. */
(function(window){
 'use strict';
 var ID='uakino_diagnostic_test3';
 var HOME='https://uakino.best/';
 var FILM='https://uakino.best/cartoon/features/32432-zootropolis-2.html';
 var SEARCH=HOME+'index.php?do=search&subaction=search&story='+encodeURIComponent('Історія іграшок')+'&search_start=1';
 function boot(){
  var L=window.Lampa,$=window.jQuery||window.$;
  if(!L||!$||window[ID+'_ready'])return;
  window[ID+'_ready']=true;
  $('head').append($('<style>').text('.ukd3-page{padding:1.5em 2em 3em;line-height:1.5}.ukd3-row{padding:1em;margin:.55em 0;background:rgba(255,255,255,.09);border-radius:.45em}.ukd3-row.focus{background:rgba(255,255,255,.24)}.ukd3-log{white-space:pre-wrap;overflow-wrap:anywhere;font-size:.9em;margin:1em 0}'));
  function Component(){
   var self=this,scroll=null,page=null,content=null,last=null,active=false,dead=false,net=null,running=false,timer=null;
   function add(t,cls){var el=$('<div/>').addClass(cls||'ukd3-log').text(t);content.append(el);return el;}
   function row(t,fn){var el=add(t,'ukd3-row selector');el.on('hover:enter click',function(){last=el;fn();});el.on('hover:focus',function(){last=el;if(scroll&&scroll.update)scroll.update(el,true);});return el;}
   function focus(){if(!active||dead||!L.Controller)return;var r=scroll?scroll.render():page;L.Controller.collectionSet(r);L.Controller.collectionFocus(last||false,r);}
   function kind(s){if(/<title[^>]*>\s*(?:just a moment|attention required|access denied)/i.test(s)||/id=["']challenge-form["']/i.test(s))return 'Сторінка перевірки';if(/<html|<!doctype/i.test(s))return 'HTML';if(/^\s*[\[{]/.test(s))return 'JSON/структура';return 'Інший текст';}
   function probe(url,headers){
    if(running){add('Дочекайтеся завершення попереднього запиту.');return;}
    running=true;var started=Date.now(),done=false;
    add('Запит: native '+(headers?'з браузерними заголовками':'стандартний')+'\nURL: '+url);
    function finish(label,status,body,extra){
     if(done)return;done=true;running=false;clearTimeout(timer);net=null;
     if(dead)return;
     var s='Результат: '+label+'\nHTTP: '+(status==null?'невідомий':status)+'\nЧас: '+(Date.now()-started)+' мс';
     if(extra)s+='\n'+extra;
     if(body!=null){body=String(body);s+='\nТип: '+kind(body)+'\nРозмір: '+body.length+' символів';var m=body.match(/<title[^>]*>([^<]{0,200})<\/title>/i);if(m)s+='\nTitle: '+m[1].trim();s+='\nОзнаки відео: '+(/ashdi\.|<iframe|playlists-ajax|data-file/i.test(body)?'є':'не знайдено');}
     add(s);focus();
    }
    timer=setTimeout(function(){var n=net;finish('TIMEOUT',null,null);if(n&&n.clear)try{n.clear();}catch(e){}},20000);
    try{
     if(typeof L.Reguest!=='function')return finish('L.Reguest недоступний');
     net=new L.Reguest();
     var opts={dataType:'text',timeout:17000,withCredentials:false};
     if(headers){opts.headers={'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8','Accept-Language':'uk-UA,uk;q=0.9,en;q=0.7','Referer':HOME};}
     net.native(url,function(res){
      var st=res&&typeof res==='object'&&typeof res.status==='number'?res.status:null;
      var b=res&&typeof res==='object'&&typeof res.responseText==='string'?res.responseText:res;
      var h=res&&typeof res==='object'?(res.headers||res.responseHeaders):null;
      var x=h?'Заголовки відповіді (як надав адаптер): '+JSON.stringify(h).slice(0,600):'Заголовки відповіді адаптер не надав';
      finish('відповідь',st,typeof b==='string'?b:JSON.stringify(b),x);
     },function(err){
      var st=err&&(err.status||err.statusCode)||null;
      var h=err&&(err.headers||err.responseHeaders);
      finish('помилка мережі',st,null,h?'Заголовки помилки: '+JSON.stringify(h).slice(0,600):'Заголовки відповіді недоступні');
     },false,opts);
    }catch(e){finish('виняток',null,null,String(e&&e.message||e));}
   }
   function render(){if(page)return scroll?scroll.render():page;
    scroll=typeof L.Scroll==='function'?new L.Scroll({mask:true,over:true}):null;
    if(scroll&&scroll.minus)scroll.minus();page=scroll?scroll.render(true):$('<div/>');content=$('<div class="ukd3-page"/>');if(scroll)scroll.append(content);else page.append(content);
    add('UAKino — діагностика Test 3\nОкремий плагін, без полів введення. Лише GET-запити.');
    row('1. Фільм — стандартний native',function(){probe(FILM,false);});
    row('2. Фільм — native + браузерні заголовки',function(){probe(FILM,true);});
    row('3. Пошук — стандартний native',function(){probe(SEARCH,false);});
    row('4. Пошук — native + браузерні заголовки',function(){probe(SEARCH,true);});
    row('5. Головна — native + браузерні заголовки (контроль)',function(){probe(HOME,true);});
    add('Увага: L.Reguest може ігнорувати заголовки в opts.headers. Цей тест перевіряє результат запиту, але не підтверджує фактичне надсилання заголовків. User-Agent, cookies і токени не підмінюються.');
    return scroll?scroll.render():page;
   }
   this.create=this.render=render;this.initialize=function(){render();this.start();};
   this.start=function(){active=true;render();L.Controller.add('content',{link:self,toggle:focus,up:function(){L.Controller.toggle('head');},down:focus,left:function(){L.Controller.toggle('menu');},right:focus,back:function(){L.Activity.backward();}});L.Controller.toggle('content');};
   this.pause=this.stop=function(){active=false;};
   this.destroy=function(){dead=true;clearTimeout(timer);if(net&&net.clear)try{net.clear();}catch(e){}if(scroll)scroll.destroy();else if(page)page.remove();};
  }
  L.Component.add(ID,Component);
  function open(){L.Activity.push({component:ID,title:'UAKino — Test 3'});}
  if(L.Menu&&L.Menu.addButton)L.Menu.addButton('','UAKino — Test 3',open);
  else $('.menu .menu__list').eq(0).append($('<li class="menu__item selector"><div class="menu__ico">UA</div><div class="menu__text">UAKino — Test 3</div></li>').on('hover:enter',open));
 }
 if(window.appready)boot();else if(window.Lampa&&window.Lampa.Listener)window.Lampa.Listener.follow('app',function(e){if(e.type==='ready')boot();});else document.addEventListener('lampa',boot,{once:true});
})(window);
