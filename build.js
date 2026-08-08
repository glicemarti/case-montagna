// Genera index.html dal file data.json — usato anche dagli aggiornamenti automatici
const fs = require('fs');
const DATA = JSON.parse(fs.readFileSync(__dirname + '/data.json', 'utf8'));
const L = DATA.listings;

const SL={rist:["s-rist","Ristrutturato"],buono:["s-buono","Buono stato"],abit:["s-abit","Abitabile"]};
const fmt=n=>n.toLocaleString("it-IT");
const esc=s=>s.replace(/&/g,"&amp;").replace(/</g,"&lt;");

function card(x){
  return `<div class="card${x.top?" top":""}${x.riserva?" riserva":""}" data-valle="${x.valle}" data-price="${x.price}" data-alt="${x.alt}" data-sqm="${x.sqm}" data-riserva="${x.riserva?1:0}">
  <div class="valle">${x.valle} · ~${fmt(x.alt)} m slm</div>
  <div class="loc">${esc(x.loc)}</div>
  <div class="price">${fmt(x.price)} €</div>
  <div class="meta"><span><b>${x.sqm} mq</b></span><span>${esc(x.tip)}</span><span><b>${Math.round(x.price/x.sqm)}</b> €/mq</span></div>
  <div class="badges"><span class="stato ${SL[x.stato][0]}">${SL[x.stato][1]}</span>${x.lim?'<span class="stato s-lim">quota limite</span>':''}</div>
  ${x.note?`<div class="note">${esc(x.note)}</div>`:""}
  <div class="links">${x.links.map(l=>`<a href="${l[1]}" target="_blank" rel="noopener">${esc(l[0])} →</a>`).join("")}</div>
</div>`;
}

function section(sec){
  let d=L.filter(x=>x.sec===sec);
  d.sort((a,b)=>a.price-b.price);
  d.sort((a,b)=>(a.riserva?1:0)-(b.riserva?1:0));
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
  .card.top::before{content:"★ consigliata";position:absolute;top:-9px;right:14px;background:var(--gold);color:#fff;font-size:11px;font-weight:700;border-radius:999px;padding:2px 10px}
  .card.riserva{border-style:dashed}
  .card.riserva::before{content:"con riserva";position:absolute;top:-9px;right:14px;background:var(--warn);color:#fff;font-size:11px;font-weight:700;border-radius:999px;padding:2px 10px}
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
    <span class="chip">max 100.000 €</span>
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
    <button class="fbtn" data-v="Valli di Lanzo">Lanzo</button>
    <button class="fbtn" data-v="Valle Orco">Orco</button>
    <button class="fbtn" data-v="Monregalese">Monregalese</button>
  </div>

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
    Quote verificate su fonti pubbliche a livello di comune/frazione; per le borgate resta una stima da confermare prima del sopralluogo. Stato come dichiarato dall'inserzionista. Prezzi e disponibilità possono cambiare: verificare sempre sul portale.
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

  var f=document.getElementById("filters");
  f.classList.add("on");
  f.addEventListener("click",function(e){
    var b=e.target.closest(".fbtn"); if(!b)return;
    var v=b.dataset.v;
    f.querySelectorAll(".fbtn").forEach(function(x){x.classList.toggle("active",x===b)});
    document.querySelectorAll(".card").forEach(function(c){
      c.classList.toggle("hide", v!=="all" && c.dataset.valle!==v);
    });
  });
})();
</script>
</body>
</html>
`;

fs.writeFileSync(__dirname + '/index.html', html);
console.log('OK, bytes:', html.length);
