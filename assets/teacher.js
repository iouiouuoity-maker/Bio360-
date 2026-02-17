function getAllResults(){
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
  const results = getAllResults();
  const topics = [...new Set(results.map(r => r.topicTitle).filter(Boolean))];
  sel.innerHTML = `<option value="">Барлығы</option>` + topics.map(t=>`<option value="${esc(t)}">${esc(t)}</option>`).join("");
}

function apply(){
  const fClass = document.getElementById("fClass").value;
  const fTopic = document.getElementById("fTopic").value;
  const fLevel = document.getElementById("fLevel").value;

  let arr = getAllResults();

  if(fClass) arr = arr.filter(r => String(r.cls) === String(fClass));
  if(fTopic) arr = arr.filter(r => r.topicTitle === fTopic);
  if(fLevel) arr = arr.filter(r => r.level === fLevel);

  renderStats(arr);
  renderList(arr);
}

function renderStats(arr){
  const box = document.getElementById("stats");
  if(!arr.length){
    box.innerHTML = `<p class="muted">Дерек жоқ</p>`;
    return;
  }
  const total = arr.length;
  const avg = (arr.reduce((s,r)=>s+Number(r.score||0),0)/total).toFixed(1);
  const L1 = arr.filter(r=>r.level==="L1").length;
  const L2 = arr.filter(r=>r.level==="L2").length;
  const L3 = arr.filter(r=>r.level==="L3").length;

  box.innerHTML = `
    <p><b>Барлығы:</b> ${total}</p>
    <p><b>Орташа балл:</b> ${avg}</p>
    <p><b>L1:</b> ${L1} &nbsp; <b>L2:</b> ${L2} &nbsp; <b>L3:</b> ${L3}</p>
  `;
}

function renderList(arr){
  const list = document.getElementById("list");
  if(!arr.length){
    list.innerHTML = `<p class="muted">Нәтиже жоқ</p>`;
    return;
  }

  list.innerHTML = arr.map(r => `
    <div class="card">
      <b>${esc(r.name)}</b>
      <p class="muted small">${esc(r.cls)}-сынып • ${esc(r.topicTitle)} • ${esc(r.level)} • ${r.score}/${r.max}</p>
      <p class="muted small">${r.at ? new Date(r.at).toLocaleString() : ""}</p>
      <hr style="border:0;border-top:1px solid rgba(255,255,255,.08);margin:10px 0">
      <p><b>1)</b> ${esc(r.a1)}</p>
      <p><b>2)</b> ${esc(r.a2)}</p>
    </div>
  `).join("");
}

function exportCSV(){
  const arr = getAllResults();
  if(!arr.length){ alert("Экспортқа дерек жоқ."); return; }

  const header = ["timestamp","name","class","topic","level","score","max","a1","a2"];
  const rows = arr.map(r => [r.at, r.name, r.cls, r.topicTitle, r.level, r.score, r.max, r.a1, r.a2]);

  const q = v => `"${String(v??"").replaceAll('"','""')}"`;
  const csv = [header, ...rows].map(line => line.map(q).join(",")).join("\n");

  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], {type:"text/csv;charset=utf-8"}));
  a.download = "bio360_results.csv";
  a.click();
  URL.revokeObjectURL(a.href);
}

function clearAll(){
  if(confirm("Барлық нәтижені өшіреміз бе?")){
    localStorage.removeItem("bio360_results_v1");
    fillTopics();
    apply();
  }
}

document.getElementById("applyFilter").addEventListener("click", apply);
document.getElementById("exportCsv").addEventListener("click", exportCSV);
document.getElementById("clearAll").addEventListener("click", clearAll);

fillTopics();
apply();
