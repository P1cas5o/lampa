/* UAKino Diagnostic Test 2 — independent Lampa plugin. No credentials, no proxies. */
(function(window){
 'use strict';
 var ID='uakino_diagnostic_test2', HOME='https://uakino.best/';
 function boot(){
  var L=window.Lampa, $=window.jQuery||window.$;
  if(!L||!$||window[ID+'_ready'])return;
  window[ID+'_ready']=true;
  var style=$('<style>.ukd-page{padding:2em;line-height:1.45}.ukd-row{padding:1em;margin:.5em 0;background:rgba(255,255,255,.09);border-radius:.5em}.ukd-row.focus{background:rgba(255,255,255,.24)}.ukd-log{white-space:pre-wrap;overflow-wrap:anywhere;font-size:.9em;margin:1em 0}</style>');$('head').append(style);
  function Component(params){
   params=params||{};
   var self=this, scroll=null, page=null, content=null, last=null, active=false, dead=false, running=false, net=null;
   var target=params.url||HOME; var filmUrl='';
   function add(t,cls){var el=$('<div/>').addClass(cls||'ukd-log').text(t);content.append(el);return el;}
   function row(t,fn){var el=add(t,'ukd-row selector');el.on('hover:enter click',function(){last=el;fn();});el.on('hover:focus',function(){last=el;if(scroll)scroll.update(el,true);});return el;}
   function focus(){if(!active||dead)return;var render=scroll?scroll.render():page;L.Controller.collectionSet(render);L.Controller.collectionFocus(last||false,render);}
   function classify(body){var s=String(body||'');if(!s)return 'Порожня відповідь';if(/<title>\s*(?:just a moment|attention required|access denied)/i.test(s)||/id=["']challenge-form["']/i.test(s))return 'HTML-сторінка перевірки';if(/<html|<!doctype/i.test(s))return 'HTML';if(/^\s*[\[{]/.test(s))return 'JSON або JS-структура';return 'Інший текст';}
   function probe(url,mode){if(running)return;running=true;add('Запит: '+mode+'\nАдреса: '+url);var start=Date.now(),done=false,timeout;
    function end(label,status,body){if(done)return;done=true;running=false;clearTimeout(timeout);net=null;var output='Результат: '+label+'\nHTTP-статус: '+(status==null?'невідомий (адаптер міг не надати)':status)+'\nЧас: '+(Date.now()-start)+' мс';if(body!=null){if(url===HOME && mode==='native'){var found=String(body).match(/href=["'](https:\/\/uakino\.best\/film\/[^"']+\.html)["']/i)||String(body).match(/href=["'](\/film\/[^"']+\.html)["']/i);if(found){filmUrl=new URL(found[1],HOME).href;output+='\nЗнайдено URL фільму: '+filmUrl;}}output+='\nТип: '+classify(body)+'\nРозмір: '+String(body).length+' символів';var title=String(body).match(/<title[^>]*>([^<]{0,180})<\/title>/i);if(title)output+='\nHTML title: '+title[1].trim();if(/api\.uakino\.app/.test(url))output+='\nПочаток відповіді: '+String(body).slice(0,180);}add(output);focus();}
    timeout=setTimeout(function(){if(net&&net.clear)net.clear();end('TIMEOUT',null,null);},18000);
    try{
     if(mode==='native'){
      if(typeof L.Reguest!=='function')return end('L.Reguest недоступний',null,null);
      net=new L.Reguest();
      net.native(url,function(response){var status=response&&typeof response==='object'&&typeof response.status==='number'?response.status:null;var body=response&&typeof response==='object'&&typeof response.responseText==='string'?response.responseText:response;end('відповідь',status,typeof body==='string'?body:JSON.stringify(body));},function(err){end('помилка мережі',err&&(err.status||err.statusCode)||null,null);},false,{dataType:'text',timeout:15000,withCredentials:false});
     }else{
      // Browser fetch may be blocked by CORS. No cookies or special bypass.
      fetch(url,{method:'GET',mode:'cors',credentials:'omit',redirect:'follow',headers:{'Accept':'text/html,application/xhtml+xml'}}).then(function(r){return r.text().then(function(b){end('відповідь браузера',r.status,b);});}).catch(function(e){end('помилка браузера / можливо CORS: '+String(e&&e.message||e),null,null);});
     }
    }catch(e){end('виняток: '+e.message,null,null);}
   }
   function render(){if(page)return scroll?scroll.render():page;
    scroll=typeof L.Scroll==='function'?new L.Scroll({mask:true,over:true}):null;if(scroll&&scroll.minus)scroll.minus();page=scroll?scroll.render(true):$('<div/>');content=$('<div class="ukd-page"/>');if(scroll)scroll.append(content);else page.append(content);
    add('UAKino — діагностика Test 2\nБез зміни Ukrainian Sources. Запити до uakino.best та api.uakino.app. Без введення тексту.');
    row('1. Головна UAKino — native (отримати URL фільму)',function(){probe(HOME,'native');});
    row('2. Сторінка фільму з каталогу — native',function(){if(!filmUrl){add('Спочатку натисніть 1, щоб отримати URL з каталогу.');return;}probe(filmUrl,'native');});
    row('3. Старий пошук DLE — native',function(){probe(HOME+'index.php?do=search&subaction=search&story='+encodeURIComponent('Історія іграшок')+'&search_start=1','native');});
    row('4. Альтернативний пошук /?s= — native',function(){probe(HOME+'?s='+encodeURIComponent('Історія іграшок'),'native');});
    row('5. Android API /filter — native (діагностика)',function(){probe('https://api.uakino.app/api/v1/filter?v=1&limit=10&cstart=0','native');});
    row('6. Android API /post/online — native (діагностика)',function(){probe('https://api.uakino.app/api/v1/post/online?v=1&cstart=0','native');});
    add('Примітка: API-запити використовують лише попередні орієнтовні параметри, а не підтверджений формат APK. HTTP 403 не доводить причину блокування. Без cookies, токенів та браузерних перевірок.');
    return scroll?scroll.render():page;
   }
   this.create=render;this.render=render;this.initialize=function(){render();this.start();};
   this.start=function(){active=true;render();L.Controller.add('content',{link:self,toggle:focus,up:function(){L.Controller.toggle('head');},down:focus,left:function(){L.Controller.toggle('menu');},right:focus,back:function(){L.Activity.backward();}});L.Controller.toggle('content');};
   this.pause=this.stop=function(){active=false;};this.destroy=function(){dead=true;if(net&&net.clear)net.clear();if(scroll)scroll.destroy();else if(page)page.remove();};
  }
  L.Component.add(ID,Component);
  function open(){L.Activity.push({component:ID,title:'UAKino — Test 2'});}
  if(L.Menu&&L.Menu.addButton)L.Menu.addButton('','UAKino — Test 2',open);
  else {$('.menu .menu__list').eq(0).append($('<li class="menu__item selector"><div class="menu__ico">UA</div><div class="menu__text">UAKino — Test 2</div></li>').on('hover:enter',open));}
 }
 if(window.appready)boot();else if(window.Lampa&&window.Lampa.Listener)window.Lampa.Listener.follow('app',function(e){if(e.type==='ready')boot();});else document.addEventListener('lampa',boot,{once:true});
})(window);
