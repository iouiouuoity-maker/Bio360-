// Bio360 Student App (index + learn)
const LS_KEY = "bio360_submissions_v1";
const STATE_KEY = "bio360_state_v1";

async function loadJSON(path){
  const res = await fetch(path);
  return await res.json();
}

function saveState(state){ localStorage.setItem(STATE_KEY, JSON.stringify(state)); }
function getState(){ return JSON.parse(localStorage.getItem(STATE_KEY) || "null"); }

function readSubs(){ return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); }
function writeSubs(arr){ localStorage.setItem(LS_KEY, JSON.stringify(arr)); }

function uid(){
  return Math.random().toString(16).slice(2) + "-" + Date.now().toString(16);
}

function levelFromScore(score){
  // 0-3 => L1, 4-6 => L2, 7-8 => L3
  if(score <= 3) return "L1";
  if(score <= 6) return "L2";
  return "L3";
}

function levelName(lvl){
  if(lvl==="L1") return "L1 (Негіз)";
  if(lvl==="L2") return "L2 (Орта)";
  return "L3 (Терең)";
}

function scenarioFor(topicId, level){
  if(topicId === "cell"){
    if(level==="L1"){
      return {
        title:"Сценарий: «Жасуша қабықшасы зақымданды»",
        text:"Оқушыға қысқа жағдай: жасуша мембранасы зақымданса, жасушаға су мен тұз қалай өтеді? Қандай белгі байқалады?",
        hint:"Жауапта: 1) не болады? 2) неге болады? 3) бір дәлел келтір."
      }
    }
    if(level==="L2"){
      return {
        title:"Сценарий: «Осмос дағдарысы»",
        text:"Зертханада өсімдік жасушасын әртүрлі ерітіндіге салды. Гипертониялық ортада жасуша қалай өзгереді? Кері процессті қалай дәлелдеуге болады?",
        hint:"Жауапта: плазмолиз/деплазмолиз ұғымын қолданып, 1 тәжірибе ұсынысын жаз."
      }
    }
    return {
      title:"Сценарий: «Антибиотик әсері және жасуша»",
      text:"Антибиотик кей бактерияларда қабырға синтезін тежейді. Неге бұл адам жасушасына бірдей әсер етпейді? Қандай қорытынды шығады?",
      hint:"Жауапта: прокариот/эукариот айырмашылығын және «нысана» түсінігін пайдалан."
    }
  }

  // ecosystem
  if(level==="L1"){
    return {
      title:"Сценарий: «Тепе-теңдік бұзылды»",
      text:"Экожүйеде қоян азайып кетті. Қасқыр, шөп және басқа жануарлар саны қалай өзгеруі мүмкін?",
      hint:"Жауапта 2 байланыс көрсет: азық → әсер → нәтиже."
    }
  }
  if(level==="L2"){
    return {
      title:"Сценарий: «Құрғақшылық келді»",
      text:"Бір аймақта жауын азайды. Өсімдік жамылғысы мен топырақ ылғалы өзгерсе, қандай тізбекті әсер болады?",
      hint:"Жауапта: абиотикалық фактор → биоалуантүрлілік → қоректік тізбек."
    }
  }
  return {
    title:"Сценарий: «Жайылым қысымы және шөлейттену»",
    text:"Жайылымдағы мал саны артты. Қай механизм арқылы жер тозады? 2 шешім ұсын: біреуі экологиялық, біреуі басқарушылық.",
    hint:"Жауапта: антропогендік фактор, индикатор, ұзақ мерзімді әсер."
  }
}

function drawLineChart(canvas, labels, values, title){
  const ctx = canvas.getContext("2d");
  const w = canvas.width, h = canvas.height;

  // clear
  ctx.clearRect(0,0,w,h);

  // paddings
  const padL=50, padR=18, padT=28, padB=40;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;

  const minV = Math.min(...values);
  const maxV = Math.max(...values);
  const range = (maxV - minV) || 1;

  // axes
  ctx.globalAlpha = 0.9;
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(255,255,255,.25)";
  ctx.beginPath();
  ctx.moveTo(padL, padT);
  ctx.lineTo(padL, padT+plotH);
  ctx.lineTo(padL+plotW, padT+plotH);
  ctx.stroke();

  // title
  ctx.fillStyle = "rgba(234,241,255,.95)";
  ctx.font = "bold 14px system-ui";
  ctx.fillText(title, padL, 18);

  // points
  const stepX = labels.length>1 ? plotW/(labels.length-1) : plotW;
  const pts = values.map((v,i)=>{
    const x = padL + stepX*i;
    const y = padT + plotH - ((v - minV)/range)*plotH;
    return {x,y,v,i};
  });

  // line
  ctx.strokeStyle = "rgba(124,247,194,.85)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  pts.forEach((p,idx)=>{ if(idx===0) ctx.moveTo(p.x,p.y); else ctx.lineTo(p.x,p.y); });
  ctx.stroke();

  // dots + labels
  ctx.fillStyle = "rgba(122,168,255,.95)";
  ctx.font = "12px system-ui";

  pts.forEach(p=>{
    ctx.beginPath();
    ctx.arc(p.x,p.y,3.5,0,Math.PI*2);
    ctx.fill();

    // x labels (every)
    const lab = labels[p.i];
    ctx.fillStyle = "rgba(168,182,214,.95)";
    ctx.fillText(lab, p.x-18, padT+plotH+22);

    // y value
    ctx.fillStyle = "rgba(234,241,255,.9)";
    ctx.fillText(String(p.v), p.x-10, p.y-10);
  });
}

// ------------------ INDEX PAGE ------------------
async function initIndex(){
  const topicSelect = document.getElementById("topicSelect");
  const startBtn = document.getElementById("startBtn");
  if(!topicSelect || !startBtn) return;

  const topicsData = await loadJSON("assets/data/topics.json");
  topicSelect.innerHTML = topicsData.topics.map(t=>`<option value="${t.id}">${t.title}</option>`).join("");

  startBtn.addEventListener("click", ()=>{
    const name = document.getElementById("studentName").value.trim();
    const cls = document.getElementById("studentClass").value;
    const topicId = topicSelect.value;

    if(!name){
      alert("Оқушы аты-жөнін жазыңыз.");
      return;
    }

    // state for learn page
    saveState({
      studentName: name,
      studentClass: cls,
      topicId,
      startedAt: new Date().toISOString()
    });

    window.location.href = "learn.html";
  });
}

// ------------------ LEARN PAGE ------------------
async function initLearn(){
  const hdrInfo = document.getElementById("hdrInfo");
  if(!hdrInfo) return;

  const state = getState();
  if(!state){
    alert("Алдымен басты беттен бастаңыз.");
    window.location.href = "index.html";
    return;
  }

  const topicsData = await loadJSON("assets/data/topics.json");
  const dataset = await loadJSON("assets/data/dataset.json");
  const topic = topicsData.topics.find(t=>t.id===state.topicId);

  document.getElementById("topicTitle").textContent = topic?.title || "Тақырып";
  document.getElementById("topicDesc").textContent = topic?.desc || "";
  hdrInfo.textContent = `${state.studentName} • ${state.studentClass}-сынып • ${topic?.title || ""}`;
  document.getElementById("footInfo").textContent = `${state.studentName} • ${state.studentClass}-сынып`;

  // Summary placeholders
  document.getElementById("sumName").textContent = state.studentName;
  document.getElementById("sumClass").textContent = state.studentClass;
  document.getElementById("sumTopic").textContent = topic?.title || state.topicId;

  // Tabs
  const tabs = document.querySelectorAll(".tab");
  const pages = {
    diag: document.getElementById("tab-diag"),
    scenario: document.getElementById("tab-scenario"),
    data: document.getElementById("tab-data"),
    submit: document.getElementById("tab-submit")
  };

  tabs.forEach(btn=>{
    btn.addEventListener("click", ()=>{
      tabs.forEach(b=>b.classList.remove("active"));
      btn.classList.add("active");
      const t = btn.dataset.tab;
      Object.values(pages).forEach(p=>p.classList.remove("show"));
      pages[t].classList.add("show");
    });
  });

  // Build quiz
  const quiz = buildQuiz(state.topicId);
  renderQuiz(quiz);

  let score = null;
  let level = null;

  function setLevelBadge(lvl){
    const badge = document.getElementById("levelBadge");
    badge.textContent = lvl || "L?";
  }

  // grade
  document.getElementById("gradeBtn").addEventListener("click", ()=>{
    const picked = getQuizAnswers(quiz);
    const g = gradeQuiz(quiz, picked);
    score = g.score;
    level = levelFromScore(score);

    setLevelBadge(level);
    document.getElementById("quizResult").textContent = `Балл: ${score}/${quiz.length} • Деңгей: ${levelName(level)}`;

    document.getElementById("sumLevel").textContent = levelName(level);
    document.getElementById("sumScore").textContent = `${score}/${quiz.length}`;

    // scenario by level
    const sc = scenarioFor(state.topicId, level);
    document.getElementById("scenarioBox").innerHTML = `
      <h4>${sc.title}</h4>
      <p class="muted">${sc.text}</p>
    `;
    document.getElementById("scenarioHint").textContent = sc.hint;

    // data
    const ds = dataset[state.topicId];
    renderTable(ds.table.columns, ds.table.rows);
    drawLineChart(document.getElementById("chart"), ds.chart.x, ds.chart.y, ds.chart.label);
  });

  // preload data table
  const ds0 = dataset[state.topicId];
  renderTable(ds0.table.columns, ds0.table.rows);
  drawLineChart(document.getElementById("chart"), ds0.chart.x, ds0.chart.y, ds0.chart.label);

  // initial scenario placeholder
  document.getElementById("scenarioBox").innerHTML = `
    <p class="muted">Алдымен диагностикадан өтіп, деңгейді анықта.</p>
  `;
  document.getElementById("scenarioHint").textContent = "Деңгей шыққан соң, дәл саған арналған сценарий беріледі.";

  // Save
  document.getElementById("saveBtn").addEventListener("click", ()=>{
    if(score === null || !level){
      alert("Алдымен диагностика нәтижесін шығарыңыз (Бағалау).");
      return;
    }

    const scenarioAnswer = document.getElementById("scenarioAnswer").value.trim();
    const dataQ1 = document.getElementById("dataQ1").value.trim();
    const dataQ2 = document.getElementById("dataQ2").value.trim();

    if(!scenarioAnswer || !dataQ1 || !dataQ2){
      alert("Scenario және Data бөлімдерін толтырыңыз.");
      return;
    }

    const record = {
      id: uid(),
      createdAt: new Date().toISOString(),
      studentName: state.studentName,
      studentClass: state.studentClass,
      topicId: state.topicId,
      topicTitle: topic?.title || state.topicId,
      score,
      maxScore: quiz.length,
      level,
      scenarioAnswer,
      dataQ1,
      dataQ2
    };

    const subs = readSubs();
    subs.unshift(record);
    writeSubs(subs);

    document.getElementById("saveResult").textContent = "✅ Сақталды! Мұғалім бетінде көрінеді (teacher.html).";
  });

  function renderTable(columns, rows){
    const el = document.getElementById("dataTable");
    const thead = `<tr>${columns.map(c=>`<th>${c}</th>`).join("")}</tr>`;
    const tbody = rows.map(r=>`<tr>${r.map(x=>`<td>${x}</td>`).join("")}</tr>`).join("");
    el.innerHTML = `<table>${thead}${tbody}</table>`;
  }
}

// ------------------ QUIZ CONTENT ------------------
function buildQuiz(topicId){
  if(topicId==="cell"){
    return [
      {q:"Жасуша деген не?", a:["Тірі ағзаның ең кіші құрылымдық бірлігі","Тек сүйек тіні","Жай сұйықтық","Тек бактерия"], correct:0},
      {q:"Жасуша мембранасының негізгі қызметі?", a:["Затты реттеп өткізу","Тек энергия өндіру","Тек ақпарат сақтау","Тек қаңқа құру"], correct:0},
      {q:"Ядро көбіне не үшін қажет?", a:["Генетикалық ақпаратты сақтау","Ас қорыту","Қозғалу","Тыныс алу"], correct:0},
      {q:"Митохондрияның қызметі?", a:["Энергия (АТФ) түзу","Фотосинтез","Қорғаныс","Қан түзу"], correct:0},
      {q:"Прокариот пен эукариот айырмашылығының бірі?", a:["Прокариотта ядро жоқ","Эукариотта мембрана жоқ","Прокариотта ДНҚ жоқ","Эукариотта цитоплазма жоқ"], correct:0},
      {q:"Осмос деген не?", a:["Судың жарғақша арқылы өтуі","Оттегінің бөлінуі","Қан айналым","Қорек түзу"], correct:0},
      {q:"Өсімдік жасушасында ерекше құрылым:", a:["Хлоропласт","Жалған аяқ","Жүйке түйіні","Қан тамыры"], correct:0},
      {q:"Ферменттердің рөлі:", a:["Реакцияны жылдамдатады","Жасушаны бояйды","Жарық шығарады","Қатты қабық жасайды"], correct:0}
    ];
  }

  // ecosystem
  return [
    {q:"Экожүйе деген не?", a:["Тірі ағзалар мен ортаның бірлігі","Тек өсімдіктер жиыны","Тек жануарлар тобы","Тек ауа райы"], correct:0},
    {q:"Өндірушілерге не жатады?", a:["Өсімдіктер","Жыртқыштар","Бактериялар ғана","Саңырауқұлақтар ғана"], correct:0},
    {q:"Тұтынушыларға мысал:", a:["Қоян","Шөп","Күн сәулесі","Топырақ"], correct:0},
    {q:"Ыдыратушылардың рөлі:", a:["Органиканы ыдыратады","Фотосинтез жасайды","Көбейуді тоқтатады","Бұлт жасайды"], correct:0},
    {q:"Абиотикалық фактор:", a:["Температура","Қоян саны","Жыртқыш","Өсімдік"], correct:0},
    {q:"Қоректік тізбектегі энергия:", a:["Жоғарыдан төменге азаяды","Өзгермейді","Керісінше көбейеді","Тек суда болады"], correct:0},
    {q:"Биоалуантүрлілік неге керек?", a:["Тұрақтылықты арттырады","Тек сән үшін","Тек егінге зиян","Еш әсері жоқ"], correct:0},
    {q:"Антропогендік әсерге мысал:", a:["Артық жайылым","Күн сәулесі","Жаңбыр","Жел"], correct:0}
  ];
}

function renderQuiz(quiz){
  const box = document.getElementById("quizBox");
  if(!box) return;

  box.innerHTML = quiz.map((item, idx)=>{
    const name = `q${idx}`;
    const opts = item.a.map((opt, oi)=>`
      <label class="opt">
        <input type="radio" name="${name}" value="${oi}">
        <span>${opt}</span>
      </label>
    `).join("");
    return `<div class="q">
      <h4>${idx+1}. ${item.q}</h4>
      ${opts}
    </div>`;
  }).join("");
}

function getQuizAnswers(quiz){
  const picked = [];
  for(let i=0;i<quiz.length;i++){
    const el = document.querySelector(`input[name="q${i}"]:checked`);
    picked.push(el ? parseInt(el.value,10) : null);
  }
  return picked;
}

function gradeQuiz(quiz, picked){
  let score = 0;
  for(let i=0;i<quiz.length;i++){
    if(picked[i] === quiz[i].correct) score++;
  }
  return {score};
}
// --------- Decision Story + BioPassport (ADD-ON) ----------
const PASS_KEY = "bio360_passport_v1";

function readPass(){ return JSON.parse(localStorage.getItem(PASS_KEY) || "{}"); }
function writePass(obj){ localStorage.setItem(PASS_KEY, JSON.stringify(obj)); }

function evidenceScore(text){
  const t = (text||"").toLowerCase();
  const hits = ["себебі","өйткені","дәлел","сондықтан","қорытынды","нәтиже","мысалы"];
  let c = 0;
  hits.forEach(w=>{ if(t.includes(w)) c++; });
  // 0..100
  return Math.min(100, c * 15);
}

function dataScore(q1,q2){
  const a = (q1||"").trim().length;
  const b = (q2||"").trim().length;
  let s = 0;
  if(a >= 20) s += 50; else if(a >= 10) s += 30; else if(a >= 5) s += 15;
  if(b >= 25) s += 50; else if(b >= 12) s += 30; else if(b >= 6) s += 15;
  return Math.min(100, s);
}

function lScore(level){
  // understanding/apply/analyze split
  if(level==="L1") return {u:85,a:35,an:10};
  if(level==="L2") return {u:70,a:75,an:35};
  return {u:60,a:70,an:85}; // L3
}

function mergePassport(name, cls, topicId, topicTitle, level, score, maxScore, decision, scenarioAnswer, dataQ1, dataQ2){
  const pass = readPass();
  const key = `${name}__${cls}`;
  const prev = pass[key] || {
    studentName: name,
    studentClass: cls,
    badges: [],
    skills: {understand:0, apply:0, analyze:0, data:0, evidence:0},
    last: null
  };

  const L = lScore(level);
  const ev = evidenceScore(scenarioAnswer);
  const ds = dataScore(dataQ1, dataQ2);

  // update skills (take max, so growth is visible)
  prev.skills.understand = Math.max(prev.skills.understand, L.u);
  prev.skills.apply      = Math.max(prev.skills.apply, L.a);
  prev.skills.analyze    = Math.max(prev.skills.analyze, L.an);
  prev.skills.data       = Math.max(prev.skills.data, ds);
  prev.skills.evidence   = Math.max(prev.skills.evidence, ev);

  // badges
  const addBadge = (txt)=>{
    if(!prev.badges.includes(txt)) prev.badges.push(txt);
  };
  if(level==="L1") addBadge("🌱 Негізді бекітті");
  if(level==="L2") addBadge("🧪 Қолдана алады");
  if(level==="L3") addBadge("🧠 Терең талдаушы");

  if(ev >= 45) addBadge("🗣 Evidence Master");
  if(ds >= 60) addBadge("📊 Data Analyst");
  if(decision && decision.path==="hyper" && decision.sign==="plasmolysis") addBadge("🧩 Дұрыс сценарий жолы");

  prev.last = {
    when: new Date().toISOString(),
    topicId, topicTitle, level, score, maxScore,
    decision,
    scenarioAnswer,
    dataQ1, dataQ2
  };

  pass[key] = prev;
  writePass(pass);
}

function bestNextStep(sk){
  // return weakest area
  const entries = [
    ["Дәлел", sk.evidence],
    ["Data", sk.data],
    ["Талдау", sk.analyze],
    ["Қолдану", sk.apply],
    ["Түсіну", sk.understand]
  ];
  entries.sort((a,b)=>a[1]-b[1]);
  const [name,val] = entries[0];
  if(val >= 60) return "Келесі қадам: күрделі мәселе бойынша 1 жаңа сценарий шешіп көр (L3).";
  if(name==="Дәлел") return "Келесі қадам: жауапты «себебі → дәлел → қорытынды» құрылымымен жаз.";
  if(name==="Data") return "Келесі қадам: кестеден 2 нақты заңдылық тауып, бір шешімді дәлелмен ұсын.";
  if(name==="Талдау") return "Келесі қадам: «неге?» деген сұраққа кемі 2 себеп келтіріп үйрен.";
  if(name==="Қолдану") return "Келесі қадам: ұғымды тәжірибемен/жағдаймен байланыстырып жаз.";
  return "Келесі қадам: негізгі ұғымдарды қысқа анықтамамен қайталау.";
}

// Decision story UI for CELL
function renderDecisionStory(){
  const box = document.getElementById("scenarioBox");
  if(!box) return null;

  // only for cell topic in this version
  const state = getState();
  if(!state || state.topicId !== "cell") return null;

  // Build interactive story (3 choices)
  box.innerHTML = `
    <h4>Decision Story: «Осмос дағдарысы»</h4>
    <p class="muted">Сен 3 қадамда шешім қабылдайсың. Соңында жүйе салдарын көрсетеді.</p>

    <div class="q">
      <h4>1) Орта қандай?</h4>
      <label class="opt"><input type="radio" name="d1" value="hyper"> Гипертониялық (тұз көп)</label>
      <label class="opt"><input type="radio" name="d1" value="hypo"> Гипотониялық (су көп)</label>
      <label class="opt"><input type="radio" name="d1" value="iso"> Изотониялық (тең)</label>
    </div>

    <div class="q">
      <h4>2) Жасушада қандай белгі байқалады?</h4>
      <label class="opt"><input type="radio" name="d2" value="plasmolysis"> Плазмолиз (су шығып, цитоплазма жиырылады)</label>
      <label class="opt"><input type="radio" name="d2" value="turgor"> Тургор артады (су кіріп, керіледі)</label>
      <label class="opt"><input type="radio" name="d2" value="nochange"> Айқын өзгеріс жоқ</label>
    </div>

    <div class="q">
      <h4>3) Дұрыс әрекет қандай?</h4>
      <label class="opt"><input type="radio" name="d3" value="fix_hyper"> Суды азайтып, тұзды ерітіндіні әлсірету</label>
      <label class="opt"><input type="radio" name="d3" value="fix_hypo"> Тұз қосып, ортаны теңестіру</label>
      <label class="opt"><input type="radio" name="d3" value="wait"> Ештеңе істемей күту</label>
    </div>

    <div class="row">
      <button id="decideBtn" class="btn">Салдарын көру</button>
      <div class="result" id="decideRes"></div>
    </div>
  `;

  const btn = document.getElementById("decideBtn");
  btn.addEventListener("click", ()=>{
    const path = document.querySelector('input[name="d1"]:checked')?.value;
    const sign = document.querySelector('input[name="d2"]:checked')?.value;
    const act  = document.querySelector('input[name="d3"]:checked')?.value;

    if(!path || !sign || !act){
      alert("Үш қадамның бәрін таңда.");
      return;
    }

    const res = document.getElementById("decideRes");
    let msg = "";

    // Simple logic
    if(path==="hyper" && sign==="plasmolysis" && act==="fix_hyper"){
      msg = "✅ Дәл! Гипер ортада су жасушадан шығады → плазмолиз. Ерітіндіні әлсіретсең, процесс кері жүреді.";
    } else if(path==="hypo" && sign==="turgor" && act==="fix_hypo"){
      msg = "✅ Дұрыс! Су көп ортада жасуша ісінеді, тургор артады. Теңестіру үшін тұз қосып изотонияға жақындатасың.";
    } else if(path==="iso" && sign==="nochange"){
      msg = "✅ Дұрыс логика: изотонияда айқын өзгеріс болмайды. Бірақ әрекет те қажет емес.";
    } else {
      msg = "⚠️ Сәйкессіздік бар. Орта–белгі–әрекет байланысын қайта тексер: осмос бағыты ортаға тәуелді.";
    }

    // store decision in state so we can save it
    const st = getState() || {};
    st.decision = {path, sign, act};
    saveState(st);

    res.textContent = msg;
  });

  return true;
}

// Passport page renderer
function initPassport(){
  const pName = document.getElementById("pName");
  if(!pName) return;

  const state = getState();
  if(!state){
    pName.textContent = "BioPassport";
    document.getElementById("pMeta").textContent = "Алдымен оқушыны бастаңыз (index.html).";
    return;
  }

  const pass = readPass();
  const key = `${state.studentName}__${state.studentClass}`;
  const obj = pass[key];

  if(!obj){
    pName.textContent = state.studentName;
    document.getElementById("pMeta").textContent = `${state.studentClass}-сынып • Әзірге нәтиже жоқ (алдымен сақта).`;
    document.getElementById("pLevel").textContent = "—";
    return;
  }

  pName.textContent = obj.studentName;
  document.getElementById("pMeta").textContent = `${obj.studentClass}-сынып • Соңғы жаңарту: ${new Date(obj.last?.when || Date.now()).toLocaleString()}`;
  document.getElementById("pLevel").textContent = obj.last?.level || "—";

  const sk = obj.skills;

  const setBar = (idFill, idTxt, v)=>{
    document.getElementById(idFill).style.width = `${v}%`;
    document.getElementById(idTxt).textContent = v;
  };
  setBar("mUnderstand","tUnderstand", sk.understand);
  setBar("mApply","tApply", sk.apply);
  setBar("mAnalyze","tAnalyze", sk.analyze);
  setBar("mData","tData", sk.data);
  setBar("mEvidence","tEvidence", sk.evidence);

  document.getElementById("nextStep").textContent = "📌 " + bestNextStep(sk);

  const badges = document.getElementById("badges");
  badges.innerHTML = (obj.badges?.length ? obj.badges : ["Әзірге бейдж жоқ"]).map(b=>{
    if(b==="Әзірге бейдж жоқ") return `<span class="muted">${b}</span>`;
    return `<span class="bdg"><strong>✓</strong>${b}</span>`;
  }).join("");

  const last = obj.last;
  const sum = document.getElementById("lastSummary");
  sum.innerHTML = `
    <div><b>Тақырып:</b> ${last.topicTitle}</div>
    <div><b>Диагностика:</b> ${last.score}/${last.maxScore} • <b>${last.level}</b></div>
    <div><b>Decision:</b> ${last.decision ? `${last.decision.path} / ${last.decision.sign} / ${last.decision.act}` : "—"}</div>
  `;
}

// Hook into existing initLearn save handler: extend it safely
(function patchSave(){
  const oldInitLearn = initLearn;
  initLearn = async function(){
    await oldInitLearn();

    // after learn loaded, replace scenario box with decision story for CELL
    renderDecisionStory();

    // patch save button to also update passport
    const saveBtn = document.getElementById("saveBtn");
    if(!saveBtn) return;

    // prevent double patch
    if(saveBtn.dataset.patched==="1") return;
    saveBtn.dataset.patched = "1";

    saveBtn.addEventListener("click", ()=>{
      try{
        const st = getState();
        const subs = JSON.parse(localStorage.getItem("bio360_submissions_v1") || "[]");
        const last = subs[0]; // latest saved
        if(!last) return;

        mergePassport(
          last.studentName,
          last.studentClass,
          last.topicId,
          last.topicTitle,
          last.level,
          last.score,
          last.maxScore,
          st?.decision || null,
          last.scenarioAnswer,
          last.dataQ1,
          last.dataQ2
        );
      }catch(e){
        // ignore
      }
    });
  };
})();

// boot passport too
document.addEventListener("DOMContentLoaded", ()=>{
  initPassport();
});
// boot
document.addEventListener("DOMContentLoaded", ()=>{
  initIndex();
  initLearn();
});
