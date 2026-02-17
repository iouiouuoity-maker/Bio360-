function getAllResults() {
  const main = JSON.parse(localStorage.getItem("bio360_results_v1") || "[]");
  const brain = JSON.parse(localStorage.getItem("brainResults") || "[]");

  const brainFormatted = brain.map(r => ({
    name: r.name || "Аноним",
    cls: r.cls || "",
    topic: "Ми бөлімдері",
    level: r.level || "—",
    score: Number(r.score || 0),
    max: 8,
    date: r.date || ""
  }));

  // main форматы: {name, cls, topic/topicTitle, score, max, level, at ...}
  const mainFormatted = main.map(r => ({
    name: r.name || "Аноним",
    cls: r.cls || "",
    topic: r.topicTitle || r.topic || "—",
    level: r.level || "—",
    score: Number(r.score || 0),
    max: Number(r.max || 0),
    date: r.date || (r.at ? new Date(r.at).toLocaleString() : "")
  }));

  return [...mainFormatted, ...brainFormatted];
}

function renderTopics(results) {
  const select = document.getElementById("fTopic");
  const topics = [...new Set(results.map(r => r.topic).filter(Boolean))];

  select.innerHTML =
    `<option value="">Барлығы</option>` +
    topics.map(t => `<option value="${t}">${t}</option>`).join("");
}

function applyFilter() {
  const fClass = document.getElementById("fClass").value;
  const fTopic = document.getElementById("fTopic").value;
  const fLevel = document.getElementById("fLevel").value;

  let results = getAllResults();

  if (fClass) results = results.filter(r => String(r.cls) === String(fClass));
  if (fTopic) results = results.filter(r => r.topic === fTopic);
  if (fLevel) results = results.filter(r => r.level === fLevel);

  renderList(results);
  renderStats(results);
}

function renderList(results) {
  const list = document.getElementById("list");

  if (!results.length) {
    list.innerHTML = `<p class="muted">Нәтиже жоқ</p>`;
    return;
  }

  list.innerHTML = results.map(r => `
    <div class="card">
      <b>${r.name}</b>
      <p>Тақырып: ${r.topic}</p>
      ${r.cls ? `<p>Сынып: ${r.cls}</p>` : ""}
      <p>Балл: ${r.score}${r.max ? "/" + r.max : ""}</p>
      <p>Деңгей: ${r.level}</p>
      ${r.date ? `<p class="muted small">${r.date}</p>` : ""}
    </div>
  `).join("");
}

function renderStats(results) {
  const stats = document.getElementById("stats");

  if (!results.length) {
    stats.innerHTML = `<p class="muted">Дерек жоқ</p>`;
    return;
  }

  const total = results.length;
  const avg = (results.reduce((s, r) => s + Number(r.score || 0), 0) / total).toFixed(1);
  const L1 = results.filter(r => r.level === "L1").length;
  const L2 = results.filter(r => r.level === "L2").length;
  const L3 = results.filter(r => r.level === "L3").length;

  stats.innerHTML = `
    <p><b>Барлығы:</b> ${total}</p>
    <p><b>Орташа балл:</b> ${avg}</p>
    <p><b>L1:</b> ${L1} &nbsp; <b>L2:</b> ${L2} &nbsp; <b>L3:</b> ${L3}</p>
  `;
}

function exportCSV() {
  const results = getAllResults();
  if (!results.length) {
    alert("Экспорт жасайтын дерек жоқ.");
    return;
  }

  const header = ["Аты", "Сынып", "Тақырып", "Балл", "Макс", "Деңгей", "Күні"];
  const rows = results.map(r => [
    r.name,
    r.cls || "",
    r.topic,
    r.score,
    r.max || "",
    r.level,
    r.date || ""
  ]);

  const csv = [header, ...rows]
    .map(row => row.map(v => `"${String(v).replaceAll('"','""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "bio360_results.csv";
  link.click();
  URL.revokeObjectURL(link.href);
}

function clearAll() {
  if (confirm("Барлық нәтижені өшіреміз бе?")) {
    localStorage.removeItem("bio360_results_v1");
    localStorage.removeItem("brainResults");
    const all = getAllResults();
    renderTopics(all);
    applyFilter();
  }
}

// INIT
document.getElementById("applyFilter").addEventListener("click", applyFilter);
document.getElementById("exportCsv").addEventListener("click", exportCSV);
document.getElementById("clearAll").addEventListener("click", clearAll);

const allResults = getAllResults();
renderTopics(allResults);
applyFilter();
