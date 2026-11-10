/* UAKino Diagnostic Test 4 Fix 1 — isolated HTML and player marker inspection. */
(function(window){
'use strict';
function boot(){
var L=window.Lampa, $=window.jQuery||window.$;
if(!L||!$||window.uakino_diag4_ready)return;
window.uakino_diag4_ready=true;
var KEY='uakino_diag_test4', URL='https://uakino.best/cartoon/features/32432-zootropolis-2.html';
var headers={'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8','Accept-Language':'uk-UA,uk;q=0.9,en;q=0.7','Referer':'https://uakino.best/'};
var css=document.createElement('style');css.textContent='.ud4-page{padding:1.5em 2em 4em}.ud4-btn{padding:1em;margin:.55em 0;background:rgba(255,255,255,.1);border-radius:.5em}.ud4-btn.focus{background:rgba(255,255,255,.25)}.ud4-log{white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.5;margin:1em 0;font-size:.94em}';document.head.appendChild(css);
function Component(){var self=this,scroll=null,content=null,alive=true,net=null,rows=[],index=0,busy=false;
function node(tag,cls,text){var n=document.createElement(tag);n.className=cls||'';if(text!=null)n.textContent=text;return n;}
function log(s){if(!alive)return;content.appendChild(node('div','ud4-log',s));if(scroll&&scroll.update)scroll.update($(rows[index]||content),true);}
function btn(label,fn){var n=node('div','ud4-btn selector',label);n.onclick=fn;n.addEventListener('hover:enter',fn);content.appendChild(n);rows.push(n);}
function focus(){if(!alive||!L.Controller)return;var r=scroll?scroll.render():$(content);L.Controller.collectionSet(r);L.Controller.collectionFocus(rows[index]||false,r);}
function analyze(html){var doc=new DOMParser().parseFromString(html,'text/html');var report=[];report.push('HTML: '+html.length+' символів');report.push('Title: '+((doc.querySelector('title')||{}).textContent||'немає').trim());
var checks=[['iframe', 'iframe[src],iframe[data-src]'],['video/source','video[src],source[src]'],['data-file','[data-file]'],['playlist AJAX','.playlists-ajax,[data-playlist-url]'],['script','script']];checks.forEach(function(c){report.push(c[0]+': '+doc.querySelectorAll(c[1]).length);});
['ashdi.vip','ashdi.org','tortuga','hdvb','playlists.php','dle_edittime','data-news_id','m3u8','mp4','file:','playlist:'].forEach(function(m){report.push(m+': '+(html.toLowerCase().indexOf(m.toLowerCase())>=0?'так':'ні'));});
var urls=[],seen={};function add(type,value){if(!value||urls.length>=35)return;try{var u=new URL(value.replace(/&amp;/g,'&'),URL);if(!/^https?:$/.test(u.protocol))return;var key=type+' '+u.origin+u.pathname;if(seen[key])return;seen[key]=true;urls.push(type+': '+u.origin+u.pathname+(u.search?' [query приховано]':''));}catch(e){}}
Array.prototype.forEach.call(doc.querySelectorAll('iframe[src],iframe[data-src]'),function(n){add('iframe',n.getAttribute('data-src')||n.getAttribute('src'));});
Array.prototype.forEach.call(doc.querySelectorAll('[data-playlist-url]'),function(n){add('playlist endpoint',n.getAttribute('data-playlist-url'));});
Array.prototype.forEach.call(doc.querySelectorAll('video[src],source[src]'),function(n){add('media',n.getAttribute('src'));});
var news=html.match(/data-news_id\s*=\s*["'](\d+)["']/i);report.push('news_id: '+(news?news[1]:'не знайдено'));var x=html.match(/data-xfname\s*=\s*["']([^"']+)["']/i);report.push('xfield: '+(x?x[1]:'не знайдено'));var tm=html.match(/dle_edittime\s*=\s*["'](\d+)["']/);report.push('dle_edittime: '+(tm?'присутній':'не знайдено'));
return {report:report.join('\n'),urls:urls.join('\n')||'Відкритих URL у DOM не знайдено',ajax:news?{news:news[1],xfield:x?x[1]:'playlist',time:tm?tm[1]:null}:null};}
var last=null;
function request(url,cb){if(busy){log('Зачекайте завершення запиту.');return;}busy=true;log('Запит: '+url.split('?')[0]);var started=Date.now(),done=false;var timer=setTimeout(function(){finish('Тайм-аут (35 с)');if(net&&net.clear)net.clear();},35000);function finish(err,data){if(done)return;done=true;clearTimeout(timer);busy=false;net=null;if(!alive)return;log((err?'Помилка: '+err:'Відповідь отримана')+' · '+(Date.now()-started)+' мс');if(cb)cb(err,data);}
try{net=new L.Reguest();net.native(url,function(res){var body=typeof res==='string'?res:(res&&typeof res.responseText==='string'?res.responseText:res);if(body&&typeof body==='object'&&body.data!==undefined)body=body.data;if(typeof body!=='string')body=JSON.stringify(body||'');finish(null,body);},function(e){finish('HTTP '+(e&&(e.status||e.statusCode)||'невідомий'));},false,{dataType:'text',timeout:30000,withCredentials:false,headers:headers});}catch(e){finish(e.message||'Помилка native');}}
function page(){request(URL,function(err,html){if(err)return;try{last=analyze(html);log(last.report);log('Адреси (без параметрів запиту):\n'+last.urls);}catch(e){log('Помилка аналізу: '+e.message);}});}
function ajax(){if(!last||!last.ajax){log('Спочатку перевірте HTML. Дані AJAX не знайдені.');return;}var a=last.ajax,u=new URL('/engine/ajax/playlists.php',URL);u.searchParams.set('news_id',a.news);u.searchParams.set('xfield',a.xfield);if(a.time)u.searchParams.set('time',a.time);request(u.href,function(err,body){if(err)return;log('AJAX: '+body.length+' символів; JSON: '+(/^\s*[{[]/.test(body)?'можливо':'ні'));try{var v=JSON.parse(body);log('JSON keys: '+Object.keys(v).slice(0,12).join(', '));if(typeof v.response==='string')log('response: '+v.response.length+' символів; data-file: '+(v.response.indexOf('data-file')>=0?'так':'ні'));}catch(e){log('HTML title: '+((body.match(/<title[^>]*>([^<]*)/i)||[])[1]||'не знайдено'));}});}
this.create=function(){if(!content){scroll=new L.Scroll({mask:true,over:true});if(scroll.minus)scroll.minus();content=node('div','ud4-page');scroll.append($(content));content.appendChild(node('h2','', 'UAKino — Diagnostic Test 4'));log('Окремий тест. Ukrainian Sources не змінено. URL: Зоотрополіс 2. Запити Native з опціями заголовків; їх фактичне надсилання не підтверджено.');btn('1. Отримати HTML і перевірити плеєри',page);btn('2. Перевірити AJAX-плейлист (якщо знайдено)',ajax);btn('3. Повторити перевірку HTML',page);}return scroll.render();};this.render=this.create;this.start=function(){this.create();L.Controller.add('content',{link:self,toggle:focus,up:function(){index=Math.max(0,index-1);focus();},down:function(){index=Math.min(rows.length-1,index+1);focus();},enter:function(){if(rows[index])rows[index].click();},back:function(){L.Activity.backward();}});L.Controller.toggle('content');};this.initialize=function(){this.create();this.start();};this.pause=this.stop=function(){};this.destroy=function(){alive=false;if(net&&net.clear)net.clear();if(scroll)scroll.destroy();};}
L.Component.add(KEY,Component);function open(){L.Activity.push({component:KEY,title:'UAKino Test 4'});}if(L.Menu&&L.Menu.addButton)L.Menu.addButton('','UAKino Test 4',open);else if($){var m=$('<li class="menu__item selector"><div class="menu__ico">UA</div><div class="menu__text">UAKino Test 4</div></li>');m.on('hover:enter',open);$('.menu .menu__list').eq(0).append(m);}
}
if(window.appready)boot();
else if(window.Lampa&&window.Lampa.Listener)window.Lampa.Listener.follow('app',function(e){if(e.type==='ready')boot();});
else document.addEventListener('lampa',boot,{once:true});
})(window);
