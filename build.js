// Genera index.html dal file data.json — usato anche dagli aggiornamenti automatici
const fs = require('fs');
const DATA = JSON.parse(fs.readFileSync(__dirname + '/data.json', 'utf8'));
const L = DATA.listings;
const NEW_MS = 7*24*3600*1000;
const isNew = x => x.added && (Date.now() - new Date(x.added+'T00:00:00Z').getTime()) < NEW_MS;

const SL={rist:["s-rist","Ristrutturato"],buono:["s-buono","Buono stato"],abit:["s-abit","Abitabile"]};
const fmt=n=>n.toLocaleString("it-IT");
const esc=s=>s.replace(/&/g,"&amp;").replace(/</g,"&lt;");

const ACTS = `<div class="acts">
  <button class="act fav" aria-label="Preferito" title="Segna come preferito"><svg viewBox="0 0 24 24"><path d="M12 21C7 16.6 3 13 3 8.9 3 6.2 5.2 4 7.9 4c1.6 0 3.1.8 4.1 2 1-1.2 2.5-2 4.1-2C18.8 4 21 6.2 21 8.9c0 4.1-4 7.7-9 12.1z"/></svg></button>
  <button class="act del" aria-label="Nascondi" title="Nascondi annuncio"><svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V5h6v2m-8 0 1 13h8l1-13M10 11v6M14 11v6"/></svg></button>
</div>`;

function card(x){
  return `<div class="card${x.top?" top":""}${x.riserva?" riserva":""}" data-id="${esc(x.links[0][1])}" data-valle="${x.valle}" data-price="${x.price}" data-alt="${x.alt}" data-sqm="${x.sqm}" data-riserva="${x.riserva?1:0}">
  ${ACTS}
  <div class="valle">${x.valle} · ~${fmt(x.alt)} m slm</div>
  <div class="loc">${esc(x.loc)}</div>
  <div class="price">${fmt(x.price)} €</div>
  <div class="meta"><span><b>${x.sqm} mq</b></span><span>${esc(x.tip)}</span><span><b>${Math.round(x.price/x.sqm)}</b> €/mq</span></div>
  <div class="badges">${isNew(x)?'<span class="stato s-new">NUOVA</span>':''}<span class="stato ${SL[x.stato][0]}">${SL[x.stato][1]}</span>${x.lim?'<span class="stato s-lim">quota limite</span>':''}${x.garden?'<span class="stato s-gard">🌿 giardino/terreno</span>':''}</div>
  ${x.note?`<div class="note">${esc(x.note)}</div>`:""}
  <div class="links">${x.links.map(l=>`<a href="${l[1]}" target="_blank" rel="noopener">${esc(l[0])} →</a>`).join("")}</div>
</div>`;
}

function section(sec){
  let d=L.filter(x=>x.sec===sec);
  d.sort((a,b)=>a.price-b.price);
  d.sort((a,b)=>(a.riserva?1:0)-(b.riserva?1:0));
  d.sort((a,b)=>(isNew(b)?1:0)-(isNew(a)?1:0));
  return d.map(card).join("\n");
}

const html = `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Casa in montagna — Report ricerca</title>
<style>
  :root{
    --bg:#f6f5f1; --card:#ffffff; --ink:#2b2a26; --muted:#77746b;
    --line:#e4e1d8; --accent:#3d5a45; --accent-soft:#e8efe9;
    --gold:#a8823c; --gold-soft:#f4ecdc; --warn:#9a5b2f; --warn-soft:#f6e9dd;
  }
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;background:var(--bg);color:var(--ink);padding:24px 16px 56px;line-height:1.45}
  .wrap{max-width:1060px;margin:0 auto}
  h1{font-size:23px;font-weight:700;letter-spacing:-.02em}
  .sub{color:var(--muted);font-size:13px;margin-top:4px}
  .criteria{display:flex;flex-wrap:wrap;gap:7px;margin:14px 0 18px}
  .chip{background:var(--accent-soft);color:var(--accent);border-radius:999px;padding:5px 12px;font-size:12px;font-weight:600}
  h2{font-size:18px;margin:26px 0 4px;color:var(--accent)}
  h2 small{font-weight:500;color:var(--muted);font-size:13px}
  .h2sub{font-size:12.5px;color:var(--muted);margin-bottom:12px}
  .tabs{display:flex;gap:8px;margin:4px 0 12px}
  .tab{flex:1;border:1px solid var(--line);background:var(--card);border-radius:12px;padding:11px 8px;font-size:13.5px;font-weight:650;color:var(--ink);text-align:center;text-decoration:none;cursor:pointer}
  .tab small{display:block;font-weight:500;color:var(--muted);font-size:11px;margin-top:2px}
  .tab.active{background:var(--accent);border-color:var(--accent);color:#fff}
  .tab.active small{color:#dbe6dd}
  body.js .sec.off{display:none}
  .filters{display:none;flex-wrap:nowrap;overflow-x:auto;-webkit-overflow-scrolling:touch;gap:8px;margin:4px 0 14px;padding-bottom:6px;scrollbar-width:none}
  .filters.on{display:flex}
  .filters::-webkit-scrollbar{display:none}
  .fbtn{flex:0 0 auto;border:1px solid var(--line);background:var(--card);border-radius:999px;padding:9px 15px;font-size:13.5px;cursor:pointer;color:var(--ink)}
  .fbtn.active{background:var(--accent);color:#fff;border-color:var(--accent)}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px}
  .card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:15px 16px;display:flex;flex-direction:column;gap:8px;position:relative}
  .card.hide{display:none}
  .card.top::before{content:"★ consigliata";position:absolute;top:-9px;left:14px;background:var(--gold);color:#fff;font-size:11px;font-weight:700;border-radius:999px;padding:2px 10px}
  .card.riserva{border-style:dashed}
  .card.riserva::before{content:"con riserva";position:absolute;top:-9px;left:14px;background:var(--warn);color:#fff;font-size:11px;font-weight:700;border-radius:999px;padding:2px 10px}
  .acts{position:absolute;top:9px;right:9px;display:flex;gap:2px;z-index:2}
  .act{border:none;background:none;cursor:pointer;padding:6px;line-height:0;border-radius:8px}
  .act:active{transform:scale(.88)}
  .act svg{width:21px;height:21px;fill:none;stroke:#b9b4a7;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;transition:all .15s}
  .act.fav.on svg{fill:#d64541;stroke:#d64541}
  .act.del:hover svg{stroke:var(--warn)}
  .card{padding-right:16px}
  .card .valle{padding-right:72px}
  .card.ghost{opacity:.55;border-style:dotted}
  .confirm{position:absolute;top:6px;right:6px;background:var(--card);border:1px solid var(--warn);border-radius:10px;padding:7px 9px;font-size:12.5px;display:flex;gap:7px;align-items:center;z-index:3;box-shadow:0 2px 10px rgba(0,0,0,.12)}
  .confirm button{border:1px solid var(--line);background:var(--bg);border-radius:7px;padding:4px 10px;font-size:12.5px;cursor:pointer;color:var(--ink)}
  .confirm .yes{background:var(--warn);color:#fff;border-color:var(--warn)}
  .fbtn.favchip.active{background:#d64541;border-color:#d64541;color:#fff}
  .hidbar{display:none;font-size:12.5px;color:var(--muted);margin:-4px 0 12px}
  .hidbar.on{display:block}
  .hidbar a{color:var(--accent);font-weight:650;cursor:pointer;text-decoration:underline}
  .price{font-size:21px;font-weight:750;letter-spacing:-.02em}
  .loc{font-size:15px;font-weight:650}
  .valle{font-size:12px;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;font-weight:600}
  .meta{display:flex;flex-wrap:wrap;gap:6px 14px;font-size:13px;color:var(--muted)}
  .meta b{color:var(--ink);font-weight:600}
  .badges{display:flex;gap:6px;flex-wrap:wrap}
  .stato{display:inline-block;font-size:11.5px;font-weight:700;border-radius:6px;padding:3px 8px}
  .s-rist{background:var(--accent-soft);color:var(--accent)}
  .s-buono{background:#e7ecf3;color:#3b5a7d}
  .s-abit{background:var(--gold-soft);color:var(--gold)}
  .s-lim{background:var(--warn-soft);color:var(--warn)}
  .s-new{background:var(--accent);color:#fff;letter-spacing:.04em}
  .s-gard{background:#e4efdc;color:#4a7031}
  .note{font-size:13px;color:var(--muted)}
  .links{display:flex;gap:6px 8px;flex-wrap:wrap;margin-top:auto;padding-top:6px}
  .links a{font-size:13.5px;font-weight:650;color:var(--accent);text-decoration:none;padding:7px 11px;background:var(--accent-soft);border-radius:8px}
  footer{margin-top:28px;font-size:12px;color:var(--muted);border-top:1px solid var(--line);padding-top:14px}
</style>
</head>
<body>
<div class="wrap">
  <h1>Casa in montagna — report ricerca</h1>
  <div class="sub">Aggiornato al ${DATA.updated_it || DATA.updated} · immobiliare.it, idealista, casa.it, subito.it, Gruppo Monviso + agenzie locali</div>
  <div class="criteria">
    <span class="chip">max 130.000 €</span>
    <span class="chip">case indipendenti / 2-3 lati / porzioni ≥ 1000 m</span>
    <span class="chip">alloggi solo ≥ 1500 m</span>
    <span class="chip">no ruderi</span>
  </div>

  <div class="tabs" id="tabs">
    <a class="tab active" data-t="case" href="#sec-case">Case indipendenti e porzioni<small>≥ 1000 m slm</small></a>
    <a class="tab" data-t="apt" href="#sec-apt">Alloggi in quota<small>solo località ≥ 1500 m slm</small></a>
  </div>

  <div class="filters" id="filters">
    <button class="fbtn active" data-v="all">Tutte le valli</button>
    <button class="fbtn" data-v="Val Varaita">Varaita</button>
    <button class="fbtn" data-v="Val Maira">Maira</button>
    <button class="fbtn" data-v="Valle Po">Po</button>
    <button class="fbtn" data-v="Val Chisone">Chisone</button>
    <button class="fbtn" data-v="Alta Val Susa">Alta V. Susa</button>
    <button class="fbtn" data-v="Valle Stura">Stura</button>
    <button class="fbtn" data-v="Valle Orco">Orco</button>
    <button class="fbtn" data-v="Monregalese">Monregalese</button>
    <button class="fbtn favchip" data-f="fav">♥ Preferiti</button>
  </div>
  <div class="hidbar" id="hidbar"><span id="hidcount">0</span> <span id="hidlabel">annunci nascosti</span> · <a id="hidtoggle">mostra</a></div>

  <div class="sec" id="sec-case">
    <h2>Case indipendenti e porzioni <small>· ≥ 1000 m slm · ordinate per prezzo</small></h2>
    <div class="h2sub">Le schede "con riserva" (bordo tratteggiato, in fondo) hanno la parte principale abitabile ma fienile/sottotetto/altre unità da recuperare.</div>
    <div class="grid">
${section("casa")}
    </div>
  </div>

  <div class="sec" id="sec-apt">
    <h2>Alloggi in quota <small>· solo località ≥ 1500 m slm · ordinati per prezzo</small></h2>
    <div class="grid">
${section("apt")}
    </div>
  </div>

  <footer>
    Cuori e annunci nascosti sono condivisi: chiunque apra questo link vede (e può modificare) gli stessi. Quote verificate su fonti pubbliche a livello di comune/frazione; per le borgate resta una stima da confermare prima del sopralluogo. Stato come dichiarato dall'inserzionista. Prezzi e disponibilità possono cambiare: verificare sempre sul portale.
  </footer>
</div>
<script>
// Tab e filtri sono un extra: senza JavaScript la pagina mostra comunque tutto
// (i tab diventano semplici ancore alle due sezioni).
(function(){
  document.body.classList.add("js");
  var tabs=document.getElementById("tabs");
  function show(t){
    document.getElementById("sec-case").classList.toggle("off", t!=="case");
    document.getElementById("sec-apt").classList.toggle("off", t!=="apt");
    tabs.querySelectorAll(".tab").forEach(function(x){x.classList.toggle("active",x.dataset.t===t)});
  }
  tabs.addEventListener("click",function(e){
    var b=e.target.closest(".tab"); if(!b)return;
    e.preventDefault();
    show(b.dataset.t);
    window.scrollTo({top:0});
  });
  show("case");

  // Preferiti e annunci nascosti CONDIVISI: salvati su Firebase, visibili a chiunque
  // abbia il link. Se il database non risponde, si torna al salvataggio locale.
  var DB='https://case-montagna-default-rtdb.europe-west1.firebasedatabase.app/shared';
  var store={
    get:function(k){try{return JSON.parse(localStorage.getItem(k))||[]}catch(e){return[]}},
    set:function(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
  };
  function enc(id){return btoa(unescape(encodeURIComponent(id))).replace(/[+]/g,'-').replace(/[/]/g,'_').replace(/=+$/,'')}
  var favs=store.get("cm_favs"), hidden=store.get("cm_hidden");
  var remoteOk=false;
  var curV="all", favOnly=false, showHidden=false;
  function setRemote(kind,id,on){
    if(!remoteOk) return;
    fetch(DB+'/'+kind+'/'+enc(id)+'.json',{method:on?'PUT':'DELETE',body:on?JSON.stringify(id):undefined}).catch(function(){});
  }
  function syncFromRemote(){
    return Promise.all([
      fetch(DB+'/favs.json').then(function(r){return r.json()}),
      fetch(DB+'/hidden.json').then(function(r){return r.json()})
    ]).then(function(res){
      remoteOk=true;
      var f=res[0]||{}, h=res[1]||{};
      try{
        if(!localStorage.getItem('cm_migrated')){
          store.get("cm_favs").forEach(function(id){var k=enc(id); if(!f[k]){f[k]=id; fetch(DB+'/favs/'+k+'.json',{method:'PUT',body:JSON.stringify(id)}).catch(function(){})}});
          store.get("cm_hidden").forEach(function(id){var k=enc(id); if(!h[k]){h[k]=id; fetch(DB+'/hidden/'+k+'.json',{method:'PUT',body:JSON.stringify(id)}).catch(function(){})}});
          localStorage.setItem('cm_migrated','1');
        }
      }catch(e){}
      favs=Object.keys(f).map(function(k){return f[k]});
      hidden=Object.keys(h).map(function(k){return h[k]});
      update();
    }).catch(function(){});
  }

  function update(){
    var nHid=0;
    document.querySelectorAll(".card").forEach(function(c){
      var id=c.dataset.id;
      var isFav=favs.indexOf(id)>=0, isHid=hidden.indexOf(id)>=0;
      var fb=c.querySelector(".act.fav"); if(fb) fb.classList.toggle("on",isFav);
      if(isHid) nHid++;
      c.classList.toggle("ghost", isHid && showHidden);
      var db=c.querySelector(".act.del");
      if(db){db.setAttribute("aria-label", isHid?"Ripristina":"Nascondi"); db.setAttribute("title", isHid?"Ripristina annuncio":"Nascondi annuncio");}
      var vis=(curV==="all"||c.dataset.valle===curV) && (!favOnly||isFav) && (!isHid||showHidden);
      c.classList.toggle("hide",!vis);
    });
    var bar=document.getElementById("hidbar");
    bar.classList.toggle("on", nHid>0);
    document.getElementById("hidcount").textContent=nHid;
    document.getElementById("hidlabel").textContent=nHid===1?"annuncio nascosto":"annunci nascosti";
    document.getElementById("hidtoggle").textContent=showHidden?(nHid===1?"nascondilo di nuovo":"nascondili di nuovo"):"mostra";
  }

  var f=document.getElementById("filters");
  f.classList.add("on");
  f.addEventListener("click",function(e){
    var b=e.target.closest(".fbtn"); if(!b)return;
    if(b.dataset.f==="fav"){ favOnly=!favOnly; b.classList.toggle("active",favOnly); update(); return; }
    curV=b.dataset.v;
    f.querySelectorAll(".fbtn[data-v]").forEach(function(x){x.classList.toggle("active",x===b)});
    update();
  });

  document.getElementById("hidtoggle").addEventListener("click",function(){ showHidden=!showHidden; update(); });
  update();
  syncFromRemote();
  document.addEventListener("visibilitychange",function(){ if(document.visibilityState==="visible") syncFromRemote(); });

  document.addEventListener("click",function(e){
    var fav=e.target.closest(".act.fav");
    if(fav){
      var id=fav.closest(".card").dataset.id;
      var i=favs.indexOf(id);
      if(i>=0) favs.splice(i,1); else favs.push(id);
      store.set("cm_favs",favs); setRemote('favs',id,i<0); update(); return;
    }
    var del=e.target.closest(".act.del");
    if(del){
      var c=del.closest(".card"), id=c.dataset.id;
      if(hidden.indexOf(id)>=0){ hidden.splice(hidden.indexOf(id),1); store.set("cm_hidden",hidden); setRemote('hidden',id,false); update(); return; }
      if(c.querySelector(".confirm")) return;
      var box=document.createElement("div");
      box.className="confirm";
      box.innerHTML='Nascondere? <button class="yes">Sì</button> <button class="no">No</button>';
      c.appendChild(box);
      var t=setTimeout(function(){box.remove()},5000);
      box.querySelector(".yes").addEventListener("click",function(ev){ev.stopPropagation();clearTimeout(t);box.remove();hidden.push(id);store.set("cm_hidden",hidden);setRemote('hidden',id,true);update();});
      box.querySelector(".no").addEventListener("click",function(ev){ev.stopPropagation();clearTimeout(t);box.remove();});
    }
  });

  // Aggiornamento live: la pagina prova a caricare i dati più recenti dal
  // pacchetto npm "case-montagna-data". Se fallisce, restano le schede statiche.
  var SL={rist:["s-rist","Ristrutturato"],buono:["s-buono","Buono stato"],abit:["s-abit","Abitabile"]};
  function fmt(n){return n.toLocaleString("it-IT")}
  function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;")}
  var ACTS='<div class="acts">'
    +'<button class="act fav" aria-label="Preferito" title="Segna come preferito"><svg viewBox="0 0 24 24"><path d="M12 21C7 16.6 3 13 3 8.9 3 6.2 5.2 4 7.9 4c1.6 0 3.1.8 4.1 2 1-1.2 2.5-2 4.1-2C18.8 4 21 6.2 21 8.9c0 4.1-4 7.7-9 12.1z"/></svg></button>'
    +'<button class="act del" aria-label="Nascondi" title="Nascondi annuncio"><svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V5h6v2m-8 0 1 13h8l1-13M10 11v6M14 11v6"/></svg></button>'
    +'</div>';
  function isNew(x){return x.added && (Date.now()-new Date(x.added+'T00:00:00Z').getTime()) < 7*24*3600*1000}
  function card(x){
    return '<div class="card'+(x.top?' top':'')+(x.riserva?' riserva':'')+'" data-id="'+esc(x.links[0][1])+'" data-valle="'+esc(x.valle)+'">'
      +ACTS
      +'<div class="valle">'+esc(x.valle)+' · ~'+fmt(x.alt)+' m slm</div>'
      +'<div class="loc">'+esc(x.loc)+'</div>'
      +'<div class="price">'+fmt(x.price)+' €</div>'
      +'<div class="meta"><span><b>'+x.sqm+' mq</b></span><span>'+esc(x.tip)+'</span><span><b>'+Math.round(x.price/x.sqm)+'</b> €/mq</span></div>'
      +'<div class="badges">'+(isNew(x)?'<span class="stato s-new">NUOVA</span>':'')+'<span class="stato '+SL[x.stato][0]+'">'+SL[x.stato][1]+'</span>'+(x.lim?'<span class="stato s-lim">quota limite</span>':'')+(x.garden?'<span class="stato s-gard">🌿 giardino/terreno</span>':'')+'</div>'
      +(x.note?'<div class="note">'+esc(x.note)+'</div>':'')
      +'<div class="links">'+x.links.map(function(l){return '<a href="'+l[1]+'" target="_blank" rel="noopener">'+esc(l[0])+' →</a>'}).join('')+'</div>'
      +'</div>';
  }
  function renderSec(d,sec,el){
    var rows=d.listings.filter(function(x){return x.sec===sec});
    rows.sort(function(a,b){return a.price-b.price});
    rows.sort(function(a,b){return (a.riserva?1:0)-(b.riserva?1:0)});
    rows.sort(function(a,b){return (isNew(b)?1:0)-(isNew(a)?1:0)});
    el.innerHTML=rows.map(card).join("");
  }
  (function(){
    fetch("https://registry.npmjs.org/case-montagna-data/latest").then(function(r){return r.json()}).then(function(meta){
      var v=meta.version;
      var urls=["https://cdn.jsdelivr.net/npm/case-montagna-data@"+v+"/data.json",
                "https://unpkg.com/case-montagna-data@"+v+"/data.json"];
      return urls.reduce(function(p,u){return p.catch(function(){return fetch(u).then(function(r){if(!r.ok)throw 0;return r.json()})})}, Promise.reject());
    }).then(function(d){
      if(!d||!d.listings||!d.listings.length) return;
      renderSec(d,"casa",document.querySelector("#sec-case .grid"));
      renderSec(d,"apt",document.querySelector("#sec-apt .grid"));
      if(d.updated_it){var s=document.querySelector(".sub"); if(s) s.textContent="Aggiornato al "+d.updated_it+" · immobiliare.it, idealista, casa.it, subito.it, Gruppo Monviso + agenzie locali";}
      update();
    }).catch(function(){/* fallback statico */});
  })();
})();
</script>
</body>
</html>
`;

fs.writeFileSync(__dirname + '/index.html', html);
console.log('OK, bytes:', html.length);
