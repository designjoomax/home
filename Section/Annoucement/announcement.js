/* Joomax Announcement Widget - announcement.js
   Pasang: <div id="joomax-announcement"></div> + announcement.config.js + announcement.js */
(function(){
var D={"sheet": {"url": "", "tab": "", "refresh": 5}, "manual": "Berikut adalah Pemberitahuan Mengenai Website ini...", "icon": {"type": "megaphone", "custom": "", "size": 30, "divider": true}, "color": {"mode": "gradient3", "c1": "#ff6b4a", "c2": "#f5105a", "c3": "#6a1170", "angle": 90, "text": "#ffffff", "icon": "#ffffff"}, "shape": {"width": "full", "custom": 900, "height": 52, "radius": 22, "shadow": false}, "text": {"anim": "marquee", "speed": 70, "interval": 4, "size": 18, "weight": 500, "sep": "•"}};
var IC={megaphone:"M18 11v2h4v-2h-4zm-2 6.61c.96.71 2.21 1.65 3.2 2.39.4-.53.8-1.07 1.2-1.6-.99-.74-2.24-1.68-3.2-2.4-.4.54-.8 1.08-1.2 1.61zM20.4 5.6c-.4-.53-.8-1.07-1.2-1.6-.99.74-2.24 1.68-3.2 2.4.4.53.8 1.07 1.2 1.6.96-.72 2.21-1.65 3.2-2.4zM4 9c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h1v4h2v-4h1l5 3V6L8 9H4zm11.5 3c0-1.33-.58-2.53-1.5-3.35v6.69c.92-.81 1.5-2.01 1.5-3.34z",
bell:"M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z",
info:"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z",
star:"M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"};
function cl(o){return JSON.parse(JSON.stringify(o))}
function mrg(a,b){for(var k in b){var v=b[k];if(v&&typeof v==="object"&&!Array.isArray(v))mrg(a[k]=(a[k]&&typeof a[k]==="object")?a[k]:{},v);else a[k]=v}return a}
function csv(t){var r=[],row=[],c="",q=0,i=0,h;for(;i<t.length;i++){h=t[i];if(q){if(h=='"'){if(t[i+1]=='"'){c+='"';i++}else q=0}else c+=h}else if(h=='"')q=1;else if(h==","){row.push(c);c=""}else if(h=="\n"||h=="\r"){if(h=="\r"&&t[i+1]=="\n")i++;row.push(c);r.push(row);row=[];c=""}else c+=h}if(c||row.length){row.push(c);r.push(row)}return r}
function sheetCsv(u,tab){u=u.trim();if(/output=csv|tqx=out:csv/.test(u))return u;var m=u.match(/\/spreadsheets\/d\/(?:e\/)?([\w-]+)/);if(!m)return u;
 if(/\/d\/e\//.test(u))return u.replace(/\/pub.*$/,"/pub?output=csv");
 var g=u.match(/[#&?]gid=(\d+)/);return"https://docs.google.com/spreadsheets/d/"+m[1]+"/gviz/tq?tqx=out:csv"+(tab?"&sheet="+encodeURIComponent(tab):g?"&gid="+g[1]:"")}
function fromRows(rows){if(!rows.length)return[];var h=rows[0].map(function(x){return x.trim().toLowerCase()}),li=1,ai=-1;
 if(/^(text|teks|pengumuman|announcement)$/.test(h[0])){li=h.findIndex(function(x){return/^(link|url|tautan)$/.test(x)});ai=h.findIndex(function(x){return/^(aktif|active|show|tampil)$/.test(x)});rows=rows.slice(1)}
 return rows.filter(function(r){return(r[0]||"").trim()&&(ai<0||!/^(false|no|0|tidak|off|nonaktif)$/i.test((r[ai]||"").trim()))}).map(function(r){var l=li>=0?(r[li]||"").trim():"";return{t:r[0].trim(),l:/^(https?:|\/)/.test(l)?l:""}})}
function fromManual(s){return(Array.isArray(s)?s:String(s||"").split("\n")).map(function(x){if(x&&typeof x==="object")return x;var p=String(x).split("|");return{t:p[0].trim(),l:(p[1]||"").trim()}}).filter(function(x){return x.t})}
function node(it){var e=document.createElement(it.l?"a":"span");e.textContent=it.t;if(it.l){e.href=it.l;e.target="_blank";e.rel="noopener"}return e}

function W(host,cfg){
 var c=mrg(cl(D),cfg||{}),root=host.shadowRoot||host.attachShadow({mode:"open"}),T=[],items=[],run=0,iv,ld,rz,key="";
 root.innerHTML='<style></style><div class="bar"><span class="ico"></span><i class="dv"></i><div class="vp"><div class="tr"></div></div></div>';
 var st=root.querySelector("style"),ico=root.querySelector(".ico"),dv=root.querySelector(".dv"),vp=root.querySelector(".vp"),tr=root.querySelector(".tr");
 function stat(k,n,why){if(typeof c.onStatus==="function")c.onStatus(k,n,why)}
 function style(){var s=c.shape,k=c.color,t=c.text,i=c.icon,w=s.width==="full"?"100%":s.width==="custom"?(+s.custom||600)+"px":(+s.width)+"px";
  var bg=k.mode==="solid"?k.c1:"linear-gradient("+k.angle+"deg,"+k.c1+","+k.c2+(k.mode==="gradient3"?","+k.c3:"")+")";
  st.textContent="[hidden]{display:none!important}:host{display:block}*{box-sizing:border-box}"
  +".bar{display:flex;align-items:center;gap:16px;margin:0 auto;width:"+w+";max-width:100%;height:"+s.height+"px;padding:0 "+Math.max(16,Math.round(s.height*.4))+"px;background:"+bg+";color:"+k.text+";border-radius:"+s.radius+"px;overflow:hidden;font-family:inherit;font-size:"+t.size+"px;font-weight:"+t.weight+";line-height:1.3"+(s.shadow?";box-shadow:0 10px 26px -12px rgba(0,0,0,.45)":"")+"}"
  +".ico{flex:none;display:flex;align-items:center;color:"+k.icon+"}.ico svg{width:"+i.size+"px;height:"+i.size+"px;fill:currentColor}.ico img{width:"+i.size+"px;height:"+i.size+"px;object-fit:contain}"
  +".dv{flex:none;width:1px;height:55%;background:currentColor;color:"+k.icon+";opacity:.4}"
  +".vp{flex:1;min-width:0;height:100%;display:flex;align-items:center;overflow:hidden}.tr{white-space:nowrap;max-width:100%}"
  +".mq{display:flex;max-width:none;will-change:transform;animation:m linear infinite}.bar:hover .mq{animation-play-state:paused}"
  +".g{display:inline-flex;flex:none;align-items:center}.sp{padding:0 1em;opacity:.7}@keyframes m{to{transform:translateX(calc(-1*var(--g)))}}"
  +".cy{overflow:hidden;text-overflow:ellipsis}.ty:after{content:'';border-right:2px solid;margin-left:2px;animation:b 1s steps(1) infinite}@keyframes b{50%{opacity:0}}"
  +"a{color:inherit;text-decoration:none}a:hover{text-decoration:underline}@media(prefers-reduced-motion:reduce){.mq{animation:none}}"}
 function icon(){var i=c.icon,t=i.type;ico.hidden=t==="none";dv.hidden=t==="none"||!i.divider;ico.innerHTML="";ico.style.fontSize="";if(t==="none")return;
  if(t==="custom"){var v=(i.custom||"").trim();if(/^(https?:|\/|\.|data:)/.test(v)){var im=new Image();im.alt="";im.src=v;ico.appendChild(im)}else{ico.textContent=v;ico.style.fontSize=i.size+"px"}}
  else ico.innerHTML='<svg viewBox="0 0 24 24"><path d="'+(IC[t]||IC.megaphone)+'"/></svg>'}
 function stop(){T.forEach(clearTimeout);T=[];run++}
 function later(f,ms){T.push(setTimeout(f,ms))}
 function render(){stop();var r=run,a=c.text.anim,n=items.length,iv2=Math.max(1,+c.text.interval||4)*1000;tr.className="tr";tr.textContent="";tr.style.animationDuration="";if(!n)return;
  if(a==="marquee"){var g=document.createElement("span");g.className="g";items.forEach(function(it){g.appendChild(node(it));var s=document.createElement("span");s.className="sp";s.textContent=c.text.sep;g.appendChild(s)});
   tr.className="tr mq";tr.appendChild(g);var gw=g.getBoundingClientRect().width||1,k=Math.ceil(vp.clientWidth/gw)+1;for(var j=0;j<k;j++)tr.appendChild(g.cloneNode(true));
   tr.style.setProperty("--g",gw+"px");tr.style.animationDuration=Math.max(3,gw/Math.max(10,+c.text.speed||70))+"s";return}
  tr.className="tr cy";var i=0;
  (function step(){if(r!==run)return;var it=items[i%n],e=node(it),loop=n>1;tr.textContent="";tr.appendChild(e);
   function next(){i++;step()}
   if(a==="static"){return}
   if(a==="type"){e.className="ty";var k=0;(function tp(){if(r!==run)return;e.textContent=it.t.slice(0,k++);if(k<=it.t.length)later(tp,35);else if(loop)later(next,iv2)})();return}
   var inK=a==="slide"?[{transform:"translateY(100%)",opacity:0},{transform:"none",opacity:1}]:[{opacity:0},{opacity:1}],
       outK=a==="slide"?[{transform:"none",opacity:1},{transform:"translateY(-100%)",opacity:0}]:[{opacity:1},{opacity:0}];
   e.animate(inK,{duration:500,easing:"ease-out"});
   if(loop)later(function(){if(r!==run)return;var o=e.animate(outK,{duration:400,fill:"forwards"});o.onfinish=function(){if(r===run)next()}},iv2)})()}
 function load(){var u=(c.sheet.url||"").trim(),r0=run;
  function manual(why){items=fromManual(c.manual);stat("manual",items.length,why);render()}
  if(!u){manual();return}
  fetch(sheetCsv(u,c.sheet.tab),{cache:"no-store"}).then(function(r){if(!r.ok)throw 0;return r.text()}).then(function(t){
   if(/^\s*<(!doctype|html)/i.test(t))throw 0;var it=fromRows(csv(t));
   if(!it.length){manual("empty");return}
   try{localStorage.setItem("jx-ann:"+u,JSON.stringify(it))}catch(e){}items=it;stat("sheet",it.length);render()
  }).catch(function(){var ca;try{ca=JSON.parse(localStorage.getItem("jx-ann:"+u))}catch(e){}if(ca&&ca.length){items=ca;stat("cache",ca.length);render()}else manual("fail")})}
 function sched(){clearInterval(iv);if((c.sheet.url||"").trim()&&+c.sheet.refresh>0)iv=setInterval(load,c.sheet.refresh*60000)}
 function update(n){c=mrg(cl(D),n||{});style();icon();var k=JSON.stringify([c.sheet,c.manual]);
  if(k!==key){key=k;clearTimeout(ld);ld=setTimeout(load,350);sched()}else render()}
 if(window.ResizeObserver)new ResizeObserver(function(){if(c.text.anim==="marquee"){clearTimeout(rz);rz=setTimeout(render,250)}}).observe(vp);
 if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){if(c.text.anim==="marquee")render()});
 update(c);return{update:update,reload:load}
}
window.JoomaxAnnounce={mount:W,defaults:D};
var sc=document.currentScript;
function boot(){if(window.JOOMAX_ANNOUNCE_MANUAL)return;var h=document.getElementById("joomax-announcement");if(!h){h=document.createElement("div");h.id="joomax-announcement";if(sc&&sc.parentNode)sc.parentNode.insertBefore(h,sc);else document.body.appendChild(h)}
 window.JoomaxAnnounceInstance=W(h,window.JOOMAX_ANNOUNCE||{})}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();
