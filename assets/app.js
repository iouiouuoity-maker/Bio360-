// ===== Bio360 core =====
const Bio360 = (() => {
  const SESSION_KEY = "bio360_session_v1";
  const ACTIVE_TOPIC_KEY = "bio360_active_topic_v1";
  const RESULTS_KEY = "bio360_results_v1";

  // ✅ Бірнеше тақырып (ми міндетті)
  const TOPICS = [
    {
      id: "brain",
      title: "Ми бөлімдері",
      theory: [
        "Ми бассүйектің ми сауытының ішінде жатады. Орташа салмағы 1300–1400 г.",
        "Мидың ақ заты ішкі, сұр заты сыртқы қабатта орналасады. Сұр заттың шоғырланған аймақтары — ядролар.",
        "Ми қарыншалары мөлдір сұйықтыққа толы: қорғаныштық, ыдырау өнімдерін шығару және қысымды реттеу қызметін атқарады.",
        "Ми бөлімдері: үлкен ми сыңарлары, аралық ми, ортаңғы ми, көпір, сопақша ми, мишық."
      ],
      quiz: [
        {q:"Орталық жүйке жүйесіне не жатады?", a:["Жүйкелер мен рецепторлар","Ми мен жұлын","Қан тамырлары","Бұлшықеттер"], c:1},
        {q:"Сопақша ми қандай қызмет атқарады?", a:["Ойлау және есте сақтау","Тыныс алу мен жүрек соғуын реттеу","Қимыл үйлестіру","Көру"], c:1},
        {q:"Қимыл-қозғалысты үйлестіретін ми бөлімі:", a:["Аралық ми","Мишық","Сопақша ми","Жұлын"], c:1},
        {q:"Үлкен ми сыңарларының негізгі қызметі:", a:["Тыныс алу","Қан айналымын реттеу","Ойлау, сөйлеу, есте сақтау","Тепе-теңдікті сақтау"], c:2},
        {q:"Адамның тепе-теңдігін сақтайтын ми бөлімі:", a:["Мишық","Үлкен ми сыңарлары","Аралық ми","Сопақша ми"], c:0},
        {q:"Сопақша ми зақымдалса не бұзылады?", a:["Ойлау қабілеті","Есте сақтау","Тыныс алу","Сөйлеу"], c:2},
        {q:"Үлкен ми сыңарлары неше бөліктен тұрады?", a:["1","2","3","4"], c:1},
        {q:"Барлық омыртқалылардың миы қанша бөлімнен тұрады?", a:["3","8","5","2"], c:2},
      ]
    },
    {
      id: "cell",
      title: "Жасуша (негізгі ұғымдар)",
      theory: [
        "Жасуша — тірі ағзалардың құрылымдық және қызметтік бірлігі.",
        "Мембрана зат алмасуды реттейді, ядро ақпаратты сақтайды.",
        "Органоидтар: митохондрия — энергия, рибосома — нәруыз синтезі."
      ],
      quiz: [
        {q:"Жасуша деген не?", a:["Негізгі құрылымдық бірлік","Тек сұйық","Тек сүйек","Тек жүйке"], c:0},
        {q:"Митохондрия қызметі:", a:["Энергия (АТФ) түзу","ДНҚ жоқ қылу","Тек қорғану","Тек түс беру"], c:0},
        {q:"Мембрана қызметі:", a:["Зат алмасуды реттеу","Қан айдау","Сөйлеу","Жүру"], c:0},
        {q:"Рибосома:", a:["Нәруыз синтезі","Қан қысымы","Тепе-теңдік","Көру"], c:0},
      ]
    },
    {
      id: "eco",
      title: "Экожүйе (қоректік тізбек)",
      theory: [
        "Экожүйе — тірі ағзалар мен ортаның өзара байланысқан жүйесі.",
        "Өндіруші → тұтынушы → ыдыратушы арқылы зат айналымы жүреді.",
        "Биоалуантүрлілік экожүйе тұрақтылығын арттырады."
      ],
      quiz: [
        {q:"Өндіруші:", a:["Өсімдік","Қасқыр","Бактерия","Тас"], c:0},
        {q:"Ыдыратушы:", a:["Саңырауқұлақ/бактерия","Қоян","Күн","Су"], c:0},
        {q:"Энергия қоректік тізбекте:", a:["Азаяды","Көбейеді","Өзгермейді","Жойылады"], c:0},
        {q:"Абиотикалық фактор:", a:["Температура","Қоян саны","Жыртқыш","Өсімдік"], c:0},
      ]
    }
  ];

  function setSession(obj){ localStorage.setItem(SESSION_KEY, JSON.stringify(obj)); }
  function getSession(){ return JSON.parse(localStorage.getItem(SESSION_KEY) || "null"); }

  function setActiveTopic(topicId){ localStorage.setItem(ACTIVE_TOPIC_KEY, topicId); }
  function getActiveTopic(){ return localStorage.getItem(ACTIVE_TOPIC_KEY) || ""; }

  function getTopic(id){ return TOPICS.find(t=>t.id===id); }
  function listTopics(){ return TOPICS.slice(); }

  function esc(s){
    return String(s||"")
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;");
  }

  function formatTheory(lines){
    return lines.map(p=>`<p>${esc(p)}</p>`).join("");
  }

  function getResults(){ return JSON.parse(localStorage.getItem(RESULTS_KEY) || "[]"); }
  function setResults(arr){ localStorage.setItem(RESULTS_KEY, JSON.stringify(arr)); }

  function topicStats(topicId){
    const arr = getResults().filter(r=>r.topic===topicId);
    const n = arr.length;
    if(!n) return {n:0, avg:0, L1:0, L2:0, L3:0};
    const avg = Math.round((arr.reduce((s,r)=>s + Number(r.score||0),0)/n)*10)/10;
    const L1 = arr.filter(r=>r.level==="L1").length;
    const L2 = arr.filter(r=>r.level==="L2").length;
    const L3 = arr.filter(r=>r.level==="L3").length;
    return {n, avg, L1, L2, L3};
  }

  function renderTopicGallery(containerId){
    const box = document.getElementById(containerId);
    const sess = getSession();
    const topics = listTopics();

    box.innerHTML = topics.map(t=>{
      const s = topicStats(t.id);
      return `
        <div class="topicCard">
          <h3>${esc(t.title)}</h3>
          <div class="muted small">${t.id}</div>

          <div class="topicStats">
            <div class="stat"><b>${s.n}</b><span>Жауап саны</span></div>
            <div class="stat"><b>${s.avg}</b><span>Орташа балл</span></div>
            <div class="stat"><b>${s.L1}/${s.L2}/${s.L3}</b><span>L1/L2/L3</span></div>
            <div class="stat"><b>${s.n?Math.round(s.L3/s.n*100):0}%</b><span>L3 үлесі</span></div>
          </div>

          <div class="row" style="margin-top:10px">
            <button class="btn" onclick="Bio360.openTopic('${t.id}')">Ашу</button>
          </div>
        </div>
      `;
    }).join("");
  }

  function openTopic(topicId){
    if(!getSession()){ alert("Алдымен басты беттен баста."); location.href="index.html"; return; }
    setActiveTopic(topicId);
    location.href = "learn.html";
  }

  function renderQuiz(containerId, topicId){
    const box = document.getElementById(containerId);
    const t = getTopic(topicId);
    const quiz = t?.quiz || [];
    box.innerHTML = quiz.map((it,i)=>{
      const opts = it.a.map((txt,j)=>`
        <label class="opt"><input type="radio" name="q${i}" value="${j}"><span>${esc(txt)}</span></label>
      `).join("");
      return `<div class="q"><h3>${i+1}. ${esc(it.q)}</h3>${opts}</div>`;
    }).join("");
  }

  function gradeQuiz(topicId){
    const t = getTopic(topicId);
    const quiz = t?.quiz || [];
    let score = 0;
    quiz.forEach((it,i)=>{
      const picked = document.querySelector(`input[name="q${i}"]:checked`);
      if(picked && Number(picked.value) === it.c) score++;
    });
    const max = quiz.length || 1;
    const ratio = score/max;
    const level = ratio < 0.5 ? "L1" : (ratio < 0.85 ? "L2" : "L3");
    return {score, max, level};
  }

  function saveResult(r){
    const arr = getResults();
    arr.unshift({ ...r, at: new Date().toISOString() });
    setResults(arr);
  }

  return {
    setSession, getSession,
    setActiveTopic, getActiveTopic,
    getTopic, listTopics,
    renderTopicGallery, openTopic,
    formatTheory,
    renderQuiz, gradeQuiz,
    saveResult,
    getResults,
    esc
  };
})();
window.Bio360 = Bio360;
