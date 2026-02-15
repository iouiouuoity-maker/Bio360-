const LS_KEY = "bio360_submissions_v1";

async function loadJSON(path){
  const res = await fetch(path);
  return await res.json();
}

function readSubs(){ return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); }
function writeSubs(arr){ localStorage.setItem(LS_KEY, JSON.stringify(arr)); }

function fmtDate(iso){
  try{
    const d = new Date(iso);
    return d.toLocaleString();
  }catch{ return iso; }
}

function toCsv(rows){
  const esc = (v)=> `"${String(v ?? "").replaceAll('"','""')}"`;
  return rows.map(r=>r.map(esc).join(",")).join("\n");
}

function download(filename, text){
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], {type:"text/csv;charset=utf-8;"}));
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

document.addEventListener("DOMContentLoaded", async ()=>{
  const fClass = document.getElementById("fClass");
  const fTopic = document.getElementById("fTopic");
  const fLevel = document.getElementById("fLevel");
  const apply = document.getElementById("applyFilter");
  const list = document.getElementById("list");
  const stats = document.getElementById("stats");

  const topicsData = await loadJSON("assets/data/topics.json");
  const topics = topicsData.topics;

  // fill topics
  topics.forEach(t=>{
    const opt = document.createElement("option");
    opt.value = t.id;
    opt.textContent = t.title;
    fTopic.appendChild(opt);
  });

  function filterSubs(){
    const subs = readSubs();
    const cls = fClass.value;
    const tp = fTopic.value;
    const lv = fLevel.value;

    return subs.filter(s=>{
      if(cls && String(s.studentClass)!==String(cls)) return false;
      if(tp && s.topicId!==tp) return false;
      if(lv && s.level!==lv) return false;
      return true;
    });
  }

  function render(){
    const all = readSubs();
    const filtered = filterSubs();

    // stats
    const l1 = all.filter(s=>s.level==="L1").length;
    const l2 = all.filter(s=>s.level==="L2").length;
    const l3 = all.filter(s=>s.level==="L3").length;

    stats.innerHTML = `
      <div>Жазба саны: <b>${all.length}</b></div>
      <div>L1: <b>${l1}</b> • L2: <b>${l2}</b> • L3: <b>${l3}</b></div>
      <div>Фильтрден өткен: <b>${filtered.length}</b></div>
    `;

    if(filtered.length===0){
      list.innerHTML = `<div class="item"><div class="meta">Нәтиже табылмады.</div></div>`;
      return;
    }

    list.innerHTML = filtered.map(s=>`
      <div class="item">
        <h4>${s.studentName} • ${s.studentClass}-сынып • ${s.level}</h4>
        <div class="meta">${s.topicTitle} • Балл: ${s.score}/${s.maxScore} • ${fmtDate(s.createdAt)}</div>
        <div class="card" style="margin-top:10px">
          <h4>Scenario жауабы</h4>
          <p class="muted">${escapeHtml(s.scenarioAnswer)}</p>
          <hr class="hr"/>
          <h4>Data жауаптары</h4>
          <p class="muted"><b>1)</b> ${escapeHtml(s.dataQ1)}</p>
          <p class="muted"><b>2)</b> ${escapeHtml(s.dataQ2)}</p>
        </div>
      </div>
    `).join("");
  }

  function escapeHtml(str){
    return String(str||"")
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;");
  }

  apply.addEventListener("click", render);

  document.getElementById("exportCsv").addEventListener("click", ()=>{
    const filtered = filterSubs();
    const rows = [
      ["createdAt","studentName","studentClass","topicTitle","topicId","score","maxScore","level","scenarioAnswer","dataQ1","dataQ2"]
    ];
    filtered.forEach(s=>{
      rows.push([s.createdAt,s.studentName,s.studentClass,s.topicTitle,s.topicId,s.score,s.maxScore,s.level,s.scenarioAnswer,s.dataQ1,s.dataQ2]);
    });
    download("bio360_results.csv", toCsv(rows));
  });

  document.getElementById("clearAll").addEventListener("click", ()=>{
    if(confirm("Барлық нәтижені өшіреміз бе?")){
      writeSubs([]);
      render();
    }
  });

  render();
});
