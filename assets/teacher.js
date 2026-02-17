function getResults(){
  return JSON.parse(localStorage.getItem("bio360_results_v1") || "[]");
}

function esc(s){
  return String(s||"")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;");
}

function fillTopics(){
  const sel = document.getElementById("fTopic");
  const results = getResults();
  const topics = [...new Set(results.map(r=>r.topicTitle || r.topic).filter(Boolean))];

  sel.innerHTML = `<option value="">Барлығы</option>` +
    topics.map(t=>`<option value="${esc(t)}">${esc(t)}</option>`).join("");
}

function apply(){
  const fClass = document.getElementById("fClass").value;
  const fTopic = document.getElementById("fTopic").value;
  const fLevel = document.getElementById("fLevel").value;

  let arr = getResults();

  if(fClass) arr = arr.filter(r=>String(r.cls)===String(fClass));
  if(fTopic) arr = arr.filter(r=>(r.topicTitle||r.topic)===fTopic);
  if(fLevel) arr = arr.filter(r=>r.level===fLevel);

  renderStats(arr);
  renderList(arr);
}

function renderStats(arr){
  const box = document.getElementById("stats");
  if(!arr.length){
    box.innerHTML = `<div class="muted">Дерек жоқ</div>`;
    return;
  }
  const total = arr.length;
  const avg = (arr.reduce((s,r)=>s+Number(r.score||0),0)/total).toFixed(1);
  const L1 = arr.filter(r=>r.level==="L1").length;
  const L2 = arr.filter(r=>r.level==="L2").length;
  const L3 = arr.filter(r=>r.level==="L3").length;

  box.innerHTML = `
    <div class="stat"><b>${total}</b><span>Жауап саны</span></div>
    <div class="stat"><b>${avg}</b><span>Орташа балл</span></div>
    <div class="stat"><b>${L1}/${L2}/${L3}</b><span>L1/L2/L3</span></div>
    <div class="stat"><b>${Math.round((L3/total)*100)}%</b><span>L3 үлесі</span></div>
  `;
}

function renderList(arr){
  const list = document.getElementById("list");
  if(!arr.length){
    list.innerHTML = `<div class="muted">Нәтиже жоқ</div>`;
    return;
  }

  list.innerHTML = arr.map(r=>`
    <div class="card">
      <b>${esc(r.name)}</b>
      <div class="muted small">${esc(r.cls)}-сынып • ${esc(r.topicTitle||r.topic)} • ${esc(r.level)} • ${r.score}/${r.max}</div>
      <div class="muted small">${new Date(r.at).toLocaleString()}</div>
      <hr style="border:0;border-top:1px solid rgba(255,255,255,.08);margin:10px 0">
      <div class="muted"><b>1)</b> ${esc(r.a1)}</div>
      <div class="muted" style="margin-top:8px"><b>2)</b> ${esc(r.a2)}</div>
    </div>
  `).join("");
}

function exportCSV(){
  const arr = getResults();
  if(!arr.length){ alert("Экспортқа дерек жоқ."); return; }

  const header = ["timestamp","name","class","topic","level","score","max","a1","a2"];
  const rows = arr.map(r=>[
    r.at, r.name, r.cls, (r.topicTitle||r.topic), r.level, r.score, r.max, r.a1, r.a2
  ]);

  const escCSV = (v)=> `"${String(v??"").replaceAll('"','""')}"`;
  const csv = [header, ...rows].map(line=>line.map(escCSV).join(",")).join("\n");

  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], {type:"text/csv;charset=utf-8"}));
  a.download = "bio360_results.csv";
  a.click();
  URL.revokeObjectURL(a.href);
}

function clearAll(){
  if(confirm("Барлығын тазартамыз ба?")){
    localStorage.removeItem("bio360_results_v1");
    fillTopics();
    apply();
  }
}

document.getElementById("applyFilter").addEventListener("click", apply);
document.getElementById("exportCsv").addEventListener("click", exportCSV);
document.getElementById("clearAll").addEventListener("click", clearAll);

// init
fillTopics();
apply();
