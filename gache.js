// gache.js
// 사용: index 페이지에서 script로 로드
// 저장: localStorage key 'gache_store_v2'

const SCHEDULE = {
  mock: [
    { id: 'mock_0625', name: '6월 모의평가', date: '2025-06-04' },
    { id: 'mock_0905', name: '9월 모의평가', date: '2025-09-04' },
    { id: 'mock_1031', name: '10월 모의평가', date: '2025-10-31' }
  ],
  regular: [
    { id: 'reg_1mid', name: '1학기 중간고사', date: '2025-04-15' },
    { id: 'reg_1final', name: '1학기 기말고사', date: '2025-07-01' },
    { id: 'reg_2mid', name: '2학기 중간고사', date: '2025-10-15' },
    { id: 'reg_2final', name: '2학기 기말고사', date: '2025-12-05' }
  ]
};

const SUBJECTS = ['국어', '수학', '영어', '탐구'];
const STORAGE_KEY = 'gache_store_v2';

// helpers
const $ = id => document.getElementById(id);
const todayISO = () => new Date().toISOString().slice(0,10);

// view switching
function showView(id){
  document.querySelectorAll('.view').forEach(v=>v.style.display='none');
  $(id).style.display = 'block';
}
document.querySelectorAll('.back').forEach(btn=>{
  btn.addEventListener('click', ()=> showView(btn.dataset.target) );
});

// init
window.addEventListener('load', ()=>{
  renderCalendar();
  renderUpcoming();
  attachMainButtons();
  showView('view-main');
  renderSummaryIfNeeded();
  // 사용자 이름(임시)
  $('userName').textContent = sessionStorage.getItem('gache_user') || '학생';
});

// calendar render (current month)
function renderCalendar(){
  const cal = $('calendar');
  cal.innerHTML = '';
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-index
  // get first day and total days
  const first = new Date(year, month, 1);
  const last = new Date(year, month+1, 0);
  const startWeekday = first.getDay(); // 0 Sun - 6 Sat
  const totalDays = last.getDate();

  const grid = document.createElement('div');
  grid.className = 'cal-grid';
  // weekday headers
  ['일','월','화','수','목','금','토'].forEach(d=>{
    const h = document.createElement('div');
    h.className = 'cal-day';
    h.innerHTML = `<div class="date">${d}</div>`;
    grid.appendChild(h);
  });

  // empty slots
  for(let i=0;i<startWeekday;i++){
    const empty = document.createElement('div');
    empty.className = 'cal-day';
    grid.appendChild(empty);
  }

  // mark exam dates
  const allExams = [...SCHEDULE.mock, ...SCHEDULE.regular].reduce((m,e)=>{
    m[e.date] = m[e.date] || [];
    m[e.date].push(e);
    return m;
  }, {});

  for(let d=1; d<=totalDays; d++){
    const dateStr = new Date(year, month, d).toISOString().slice(0,10);
    const cell = document.createElement('div');
    cell.className = 'cal-day' + (allExams[dateStr] ? ' exam':'');
    cell.innerHTML = `<div class="date">${d}</div>`;
    if(allExams[dateStr]){
      const badge = document.createElement('div');
      badge.style.fontSize='12px';
      badge.style.marginTop='6px';
      badge.textContent = allExams[dateStr].map(x=>x.name).join(', ');
      cell.appendChild(badge);
    }
    grid.appendChild(cell);
  }
  cal.appendChild(grid);
}

// upcoming list
function renderUpcoming(){
  const wrap = $('upcomingList');
  wrap.innerHTML = '';
  const all = [...SCHEDULE.mock, ...SCHEDULE.regular].sort((a,b)=> new Date(a.date)-new Date(b.date));
  all.slice(0,6).forEach(ex=>{
    const b = document.createElement('button');
    b.className = 'small';
    b.textContent = `${ex.name} — ${ex.date}`;
    b.addEventListener('click', ()=> {
      // choose type based on id prefix
      const type = ex.id.startsWith('mock') ? 'mock' : 'regular';
      openExamList(type, ex.id);
    });
    wrap.appendChild(b);
  });
}

// attach main buttons
function attachMainButtons(){
  document.querySelectorAll('.big-btn').forEach(btn=>{
    btn.addEventListener('click', ()=> openExamList(btn.dataset.type) );
  });
}

// open exam list
function openExamList(type, preselectId = null){
  const title = $('examTitle');
  title.textContent = type==='mock' ? '모의고사 선택':'정기고사 선택';
  const list = $('examList');
  list.innerHTML = '';
  SCHEDULE[type].forEach(ex=>{
    const b = document.createElement('button');
    b.textContent = `${ex.name} · (${ex.date})`;
    b.dataset.examId = ex.id;
    b.dataset.examName = ex.name;
    b.dataset.examDate = ex.date;
    b.addEventListener('click', ()=> {
      // 날짜 체크
      if(todayISO() !== ex.date){
        alert(`${ex.name} 가채점 시간이 아닙니다.\n(시험일: ${ex.date})`);
        return;
      }
      sessionStorage.setItem('gache_exam', JSON.stringify({ id: ex.id, name: ex.name, date: ex.date, type }));
      openSubjectSelection();
    });
    list.appendChild(b);
  });
  // if preselectId provided and matches today's date then open subject selection
  if(preselectId){
    const ex = (SCHEDULE[type]||[]).find(x=>x.id===preselectId);
    if(ex){
      if(todayISO() !== ex.date){
        alert(`${ex.name} 가채점 시간이 아닙니다.\n(시험일: ${ex.date})`);
        return;
      }
      sessionStorage.setItem('gache_exam', JSON.stringify({ id: ex.id, name: ex.name, date: ex.date, type }));
      openSubjectSelection();
      return;
    }
  }
  showView('view-examlist');
}

// subject selection
function openSubjectSelection(){
  const sess = JSON.parse(sessionStorage.getItem('gache_exam')||'{}');
  if(!sess.name) return alert('시험 정보가 없습니다.');
  $('examNameDisplay').textContent = `${sess.name} (${sess.date}) — 과목 선택`;
  const list = $('subjectList'); list.innerHTML = '';
  SUBJECTS.forEach(s=>{
    const btn = document.createElement('button');
    btn.textContent = s;
    btn.addEventListener('click', ()=> {
      sessionStorage.setItem('gache_subject', s);
      openMarkView();
    });
    list.appendChild(btn);
  });
  showView('view-subject');
}

// open mark view
function openMarkView(){
  const exam = JSON.parse(sessionStorage.getItem('gache_exam')||'{}');
  const subject = sessionStorage.getItem('gache_subject') || '';
  $('markHeader').textContent = `${exam.name} — ${subject} 가채점`;
  // default 20문제
  $('qCount').value = 20;
  generateMarkGrid(20);
  $('markResult').style.display = 'none';
  showView('view-mark');
}

// generate mae3-like mark grid
function generateMarkGrid(n){
  const container = $('markContainer');
  container.innerHTML = '';
  const mode = $('inputMode').value;
  for(let i=1;i<=n;i++){
    const item = document.createElement('div');
    item.className = 'mark-item';
    item.innerHTML = `
      <label>문항 ${i}</label>
      <input data-q="${i}" class="answer-key" placeholder="정답 (예: A)"/>
      <input data-q="${i}" class="answer-user" placeholder="내답"/>
    `;
    container.appendChild(item);
  }
}

// auto-fill hook
$('autoFill').addEventListener('click', ()=>{
  const n = parseInt($('qCount').value,10) || 10;
  generateMarkGrid(n);
});

// regenerate on qCount change
$('qCount').addEventListener('change', ()=>{
  const n = parseInt($('qCount').value,10) || 10;
  generateMarkGrid(n);
});

// mode change does not change input types but kept for future
$('inputMode').addEventListener('change', ()=>{ /* placeholder for mode behavior */ });

// doMark: grading
$('doMark').addEventListener('click', ()=>{
  const keys = Array.from(document.querySelectorAll('.answer-key')).map(i=>i.value.trim().toUpperCase());
  const users = Array.from(document.querySelectorAll('.answer-user')).map(i=>i.value.trim().toUpperCase());

  if(keys.length ===0 || users.length ===0){
    alert('정답과 내 답안을 모두 입력하세요.');
    return;
  }
  if(keys.length !== users.length){
    alert('문항 수가 일치하지 않습니다.');
    return;
  }

  let correct=0;
  keys.forEach((k, idx)=>{
    if(k && k === users[idx]) correct++;
  });
  const total = keys.length;
  const percent = Math.round((correct/total)*100);
  const grade = scoreToGrade(percent);

  const resultBox = $('markResult');
  resultBox.style.display = 'block';
  resultBox.innerHTML = `
    ✅ ${correct}/${total} 문항 정답<br>
    📊 점수: <strong>${percent}점</strong><br>
    🎯 예상 등급: <strong>${grade}등급</strong>
    <div style="margin-top:8px;color:var(--muted);font-size:13px">저장 버튼으로 로컬에 결과를 저장하세요.</div>
  `;
});

// saveLocal: store to localStorage
$('saveLocal').addEventListener('click', ()=>{
  const exam = JSON.parse(sessionStorage.getItem('gache_exam')||'{}');
  const subject = sessionStorage.getItem('gache_subject') || '미지정';
  const keys = Array.from(document.querySelectorAll('.answer-key')).map(i=>i.value.trim().toUpperCase());
  const users = Array.from(document.querySelectorAll('.answer-user')).map(i=>i.value.trim().toUpperCase());
  if(keys.length !== users.length) return alert('문항 수가 일치하지 않습니다.');

  let correct=0;
  keys.forEach((k, idx)=>{ if(k && k === users[idx]) correct++;});
  const percent = Math.round((correct/keys.length)*100);
  const grade = scoreToGrade(percent);

  const store = loadStore();
  if(!store[exam.id]) store[exam.id] = { meta: exam, records: [] };
  store[exam.id].records.push({
    id: 'r_'+Date.now(),
    subject,
    score: percent,
    grade,
    timestamp: new Date().toISOString()
  });
  saveStore(store);

  alert('저장되었습니다.');
  renderSummary();
  showView('view-summary');
});

// store helpers
function loadStore(){ return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
function saveStore(s){ localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); }

// score -> grade simple mapping
function scoreToGrade(score){
  if(score >= 95) return 1;
  if(score >= 85) return 2;
  if(score >= 75) return 3;
  if(score >= 65) return 4;
  return 5;
}

// summary render (exam-wise & aggregated)
function renderSummary(){
  const store = loadStore();
  const summaryArea = $('summaryArea');
  summaryArea.innerHTML = '';
  if(Object.keys(store).length === 0){
    summaryArea.innerHTML = '<div style="color:var(--muted)">저장된 가채점 데이터가 없습니다.</div>';
    return;
  }

  for(const [examId, examObj] of Object.entries(store)){
    const examTitle = examObj.meta.name + ' (' + examObj.meta.date + ')';
    const container = document.createElement('div');
    container.style.padding='10px 0';

    let html = `<h3 style="margin-bottom:6px">${examTitle}</h3>`;
    const bySub = {};
    examObj.records.forEach(r=>{
      if(!bySub[r.subject]) bySub[r.subject] = { sum:0, n:0, grades:[] };
      bySub[r.subject].sum += r.score;
      bySub[r.subject].n += 1;
      bySub[r.subject].grades.push(r.grade);
    });

    html += '<div style="display:flex;gap:12px;flex-wrap:wrap">';
    for(const [sub, stat] of Object.entries(bySub)){
      const avg = (stat.sum / stat.n).toFixed(1);
      const predGrade = scoreToGrade(Number(avg));
      html += `<div style="min-width:200px;padding:10px;border-radius:10px;background:#fff;border:1px solid #eef6ff;">
                 <div style="font-weight:800">${sub}</div>
                 <div style="color:var(--muted);font-size:13px">샘플 수: ${stat.n}</div>
                 <div style="margin-top:6px">평균: <strong>${avg}점</strong></div>
                 <div style="margin-top:4px">예상 등급: <strong>${predGrade}등급</strong></div>
               </div>`;
    }
    html += '</div>';

    // overall
    let totalSum=0, totalN=0;
    for(const stat of Object.values(bySub)){ totalSum += stat.sum; totalN += stat.n; }
    const overallAvg = totalN ? (totalSum/totalN).toFixed(1) : '-';
    const overallGrade = totalN ? scoreToGrade(Number(overallAvg)) : '-';
    html += `<div style="margin-top:10px;font-weight:700">시험 전체 평균: ${overallAvg}점 · 예상 등급: ${overallGrade}등급</div>`;

    container.innerHTML = html;
    summaryArea.appendChild(container);
    summaryArea.appendChild(document.createElement('hr'));
  }

  // recent
  const flat = Object.values(store).flatMap(e=> e.records.map(r=> ({exam:e.meta.name, date:e.meta.date, ...r})));
  flat.sort((a,b)=> new Date(b.timestamp) - new Date(a.timestamp));
  const recent = flat.slice(0,6);
  const recentDiv = document.createElement('div');
  recentDiv.style.marginTop='12px';
  recentDiv.innerHTML = '<h4>최근 가채점 기록</h4>';
  if(recent.length===0) recentDiv.innerHTML += '<div style="color:var(--muted)">기록이 없습니다.</div>';
  else {
    recent.forEach(r=>{
      recentDiv.innerHTML += `<div style="padding:8px;border-radius:8px;background:#fbfdff;margin-top:6px;">
        <div style="font-weight:800">${r.exam} · ${r.subject} — ${r.score}점 (${r.grade}등급)</div>
        <div style="color:var(--muted);font-size:13px">${new Date(r.timestamp).toLocaleString()}</div>
      </div>`;
    });
  }
  summaryArea.appendChild(recentDiv);
}

function renderSummaryIfNeeded(){
  const store = loadStore();
  if(Object.keys(store).length>0){
    // show small badge or let user click summary
  }
}

// export & clear
$('exportData').addEventListener('click', ()=>{
  const blob = new Blob([JSON.stringify(loadStore(),null,2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'gache_data.json'; a.click();
  URL.revokeObjectURL(url);
});
$('clearData').addEventListener('click', ()=>{
  if(confirm('로컬에 저장된 모든 가채점 데이터를 삭제하시겠습니까?')){
    localStorage.removeItem(STORAGE_KEY);
    renderSummary();
    alert('초기화 완료');
  }
});
