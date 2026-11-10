/* UAKino Diagnostic Test 1 — independent Lampa plugin. No credentials, no proxies. */
(function(window){
 'use strict';
 var ID='uakino_diagnostic_test1', HOME='https://uakino.best/';
 function boot(){
  var L=window.Lampa, $=window.jQuery||window.$;
  if(!L||!$||window[ID+'_ready'])return;
  window[ID+'_ready']=true;
  var style=$('<style>.ukd-page{padding:2em;line-height:1.45}.ukd-row{padding:1em;margin:.5em 0;background:rgba(255,255,255,.09);border-radius:.5em}.ukd-row.focus{background:rgba(255,255,255,.24)}.ukd-log{white-space:pre-wrap;overflow-wrap:anywhere;font-size:.9em;margin:1em 0}</style>');$('head').append(style);
  function Component(params){
   params=params||{};
   var self=this, scroll=null, page=null, content=null, last=null, active=false, dead=false, running=false, net=null;
   var target=params.url||HOME;
   function add(t,cls){var el=$('<div/>').addClass(cls||'ukd-log').text(t);content.append(el);return el;}
   function row(t,fn){var el=add(t,'ukd-row selector');el.on('hover:enter click',function(){last=el;fn();});el.on('hover:focus',function(){last=el;if(scroll)scroll.update(el,true);});return el;}
   function focus(){if(!active||dead)return;var render=scroll?scroll.render():page;L.Controller.collectionSet(render);L.Controller.collectionFocus(last||false,render);}
   function classify(body){var s=String(body||'');if(!s)return 'Порожня відповідь';if(/<title>\s*(?:just a moment|attention required|access denied)/i.test(s)||/id=["']challenge-form["']/i.test(s))return 'HTML-сторінка перевірки';if(/<html|<!doctype/i.test(s))return 'HTML';if(/^\s*[\[{]/.test(s))return 'JSON або JS-структура';return 'Інший текст';}
   function probe(url,mode){if(running)return;running=true;add('Запит: '+mode+'\nАдреса: '+url);var start=Date.now(),done=false,timeout;
    function end(label,status,body){if(done)return;done=true;running=false;clearTimeout(timeout);net=null;var output='Результат: '+label+'\nHTTP-статус: '+(status==null?'невідомий (адаптер міг не надати)':status)+'\nЧас: '+(Date.now()-start)+' мс';if(body!=null){output+='\nТип: '+classify(body)+'\nРозмір: '+String(body).length+' символів';var title=String(body).match(/<title[^>]*>([^<]{0,180})<\/title>/i);if(title)output+='\nHTML title: '+title[1].trim();}add(output);focus();}
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
    add('UAKino — діагностика Test 1\nБез зміни Ukrainian Sources. Запити лише до uakino.best.');
    row('1. Головна — native',function(){probe(HOME,'native');});
    row('2. Головна — browser fetch',function(){probe(HOME,'browser');});
    row('3. Пошук — native',function(){probe(HOME+'index.php?do=search&subaction=search&story='+encodeURIComponent('Історія іграшок')+'&search_start=1','native');});
    row('4. Пошук — browser fetch',function(){probe(HOME+'index.php?do=search&subaction=search&story='+encodeURIComponent('Історія іграшок')+'&search_start=1','browser');});
    row('5. Сторінка фільму — ввести URL',function(){if(!L.Input||!L.Input.edit)return add('L.Input недоступний');L.Input.edit({title:'Посилання на фільм uakino.best',value:target===HOME?'':target,free:true,nosave:true},function(v){try{var u=new URL(v);if(u.protocol!=='https:'||u.hostname!=='uakino.best')throw Error('Потрібен URL https://uakino.best/...');target=u.href;row('6. Сторінка — native',function(){probe(target,'native');});row('7. Сторінка — browser fetch',function(){probe(target,'browser');});focus();}catch(e){add('Помилка адреси: '+e.message);}});});
    add('Примітка: HTTP-статус native може бути невідомим, якщо Lampa.Reguest повертає лише текст. CORS-помилка fetch не доводить блокування сайтом. Жодні cookies чи токени не збираються.');
    return scroll?scroll.render():page;
   }
   this.create=render;this.render=render;this.initialize=function(){render();this.start();};
   this.start=function(){active=true;render();L.Controller.add('content',{link:self,toggle:focus,up:function(){L.Controller.toggle('head');},down:focus,left:function(){L.Controller.toggle('menu');},right:focus,back:function(){L.Activity.backward();}});L.Controller.toggle('content');};
   this.pause=this.stop=function(){active=false;};this.destroy=function(){dead=true;if(net&&net.clear)net.clear();if(scroll)scroll.destroy();else if(page)page.remove();};
  }
  L.Component.add(ID,Component);
  function open(){L.Activity.push({component:ID,title:'UAKino — Test 1'});}
  if(L.Menu&&L.Menu.addButton)L.Menu.addButton('','UAKino — Test 1',open);
  else {$('.menu .menu__list').eq(0).append($('<li class="menu__item selector"><div class="menu__ico">UA</div><div class="menu__text">UAKino — Test 1</div></li>').on('hover:enter',open));}
 }
 if(window.appready)boot();else if(window.Lampa&&window.Lampa.Listener)window.Lampa.Listener.follow('app',function(e){if(e.type==='ready')boot();});else document.addEventListener('lampa',boot,{once:true});
})(window);
