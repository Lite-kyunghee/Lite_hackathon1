/* gache.js
 - 한 파일에서 "시험 선택 → 날짜 체크 → 과목 → 가채점 → 저장/집계" 동작
 - 실제 날짜(예시) 기준으로 접근 허용
 - 결과는 localStorage에 examData 키로 누적 저장
*/

// ----------------- 설정: 시험 일정 (실제 날짜 사용 - YYYY-MM-DD) -----------------
const SCHEDULE = {
  mock: [
    { id:'mock_0625', name:'6월 모의평가', date:'2025-06-04' },
    { id:'mock_0905', name:'9월 모의평가', date:'2025-09-04' },
    { id:'mock_1031', name:'10월 모의평가', date:'2025-10-31' }
  ],
  regular: [
    { id:'reg_1mid', name:'1학기 중간고사', date:'2025-04-15' },
    { id:'reg_1final', name:'1학기 기말고사', date:'2025-07-01' },
    { id:'reg_2mid', name:'2학기 중간고사', date:'2025-10-15' },
    { id:'reg_2final', name:'2학기 기말고사', date:'2025-12-05' }
  ]
};

// subjects (필요시 확장)
const SUBJECTS = ['국어','수학','영어','탐구'];

// storage key
const STORAGE_KEY = 'gache_store_v1';

// ----------------- 유틸 -----------------
const $ = id => document.getElementById(id);
function todayISO(){ return new Date().toISOString().slice(0,10); }
function loadStore(){ return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
function saveStore(obj){ localStorage.setItem(STORAGE_KEY, JSON.stringify(obj)); }

// grade mapping (간단한 절대등급)
function scoreToGrade(score){
  if(score >= 90) return 1;
  if(score >= 80) return 2;
  if(score >= 70) return 3;
  if(score >= 60) return 4;
  return 5;
}

// ----------------- 화면 전환 -----------------
function showView(id){
  document.querySelectorAll('.view').forEach(v=>v.style.display='none');
  $(id).style.display = 'block';
}
document.querySelectorAll('.back').forEach(btn=>{
  btn.addEventListener('click', ()=> {
    const target = btn.getAttribute('data-target');
    showView(target);
  });
});

// ----------------- STEP1: 시험 유형 선택 -----------------
document.querySelectorAll('.big-btn').forEach(btn=>{
  btn.addEventListener('click', (e)=>{
    const type = btn.getAttribute('data-type');
    openExamList(type);
  });
});

// STEP2: 시험 목록 생성 및 날짜검사
function openExamList(type){
  const list = $('examList');
  $('examTitle').textContent = (type==='mock' ? '모의고사 선택' : '정기고사 선택');
  list.innerHTML = '';
  SCHEDULE[type].forEach(ex=>{
    const b = document.createElement('button');
    b.textContent = `${ex.name} · (${ex.date})`;
    b.dataset.examId = ex.id;
    b.dataset.examName = ex.name;
    b.dataset.examDate = ex.date;
    b.addEventListener('click', ()=> {
      // 날짜 체크: 오늘과 정확히 일치해야만 진입 허용
      const today = todayISO();
      if(today !== ex.date){
        alert(`${ex.name} 가채점 시간이 아닙니다.\n(시험일: ${ex.date})`);
        return;
      }
      // 허용: 과목 선택으로 이동
      sessionStorage.setItem('gache_exam', JSON.stringify({ id:ex.id, name:ex.name, date:ex.date, type}));
      openSubjectSelection();
    });
    list.appendChild(b);
  });
  showView('view-examlist');
}

// STEP3: 과목 선택
function openSubjectSelection(){
  const sess = JSON.parse(sessionStorage.getItem('gache_exam') || '{}');
  if(!sess.name) return alert('시험 정보가 없습니다.');
  $('examNameDisplay').textContent = `${sess.name} (${sess.date}) — 과목 선택`;
  const list = $('subjectList'); list.innerHTML = '';
  SUBJECTS.forEach(s=>{
    const b = document.createElement('button');
    b.textContent = s;
    b.addEventListener('click', ()=> {
      sessionStorage.setItem('gache_subject', s);
      openMarkView();
    });
    list.appendChild(b);
  });
  showView('view-subject');
}

// STEP4: 가채점 화면
function openMarkView(){
  const exam = JSON.parse(sessionStorage.getItem('gache_exam')||'{}');
  const subject = sessionStorage.getItem('gache_subject') || '';
  $('markHeader').textContent = `${exam.name} — ${subject} 가채점`;
  $('answerKey').value = '';
  $('userAnswers').value = '';
  $('qCount').textContent = '—';
  $('markResult').style.display = 'none';
  showView('view-mark');
}

// 실시간 문항수 체크 (콤마 기반)
$('answerKey').addEventListener('input', ()=> {
  const a = $('answerKey').value.trim();
  $('qCount').textContent = a ? a.split(',').length+'문항' : '—';
});
$('userAnswers').addEventListener('input', ()=> {
  const a = $('userAnswers').value.trim();
  $('qCount').textContent = a ? a.split(',').length+'문항' : $('qCount').textContent;
});

// 채점 로직
$('doMark').addEventListener('click', ()=>{
  const keyRaw = $('answerKey').value.trim();
  const userRaw = $('userAnswers').value.trim();
  const resultBox = $('markResult');

  if(!keyRaw || !userRaw){ alert('정답키와 내 답안을 모두 입력하세요.'); return; }

  const key = keyRaw.split(',').map(x=>x.trim().toUpperCase());
  const user = userRaw.split(',').map(x=>x.trim().toUpperCase());

  if(key.length !== user.length){ alert('정답키와 답안의 문항 수가 다릅니다.'); return; }

  let correct = 0;
  key.forEach((k,i)=>{ if(k === user[i]) correct++; });

  const percent = Math.round((correct / key.length) * 100);
  const grade = scoreToGrade(percent);

  // 표시
  resultBox.style.display = 'block';
  resultBox.innerHTML = `
    ✅ 정답 ${correct}/${key.length} 문항<br>
    📊 점수: <strong>${percent}점</strong><br>
    🎯 예측 등급: <strong>${grade}등급</strong>
    <div style="margin-top:8px;color:var(--muted);font-size:13px">저장 버튼으로 로컬에 결과를 저장하면 종합 결과에서 확인 가능합니다.</div>
  `;
});

// 저장 및 요약
$('saveLocal').addEventListener('click', ()=>{
  const keyRaw = $('answerKey').value.trim();
  const userRaw = $('userAnswers').value.trim();
  if(!keyRaw || !userRaw){ alert('정답키와 내 답안을 모두 입력하세요.'); return; }

  const key = keyRaw.split(',').map(x=>x.trim().toUpperCase());
  const user = userRaw.split(',').map(x=>x.trim().toUpperCase());
  if(key.length !== user.length){ alert('문항 수가 일치하지 않습니다.'); return; }

  let correct = 0;
  key.forEach((k,i)=>{ if(k === user[i]) correct++; });
  const percent = Math.round((correct / key.length) * 100);
  const grade = scoreToGrade(percent);

  const exam = JSON.parse(sessionStorage.getItem('gache_exam')||'{}');
  const subject = sessionStorage.getItem('gache_subject') || '미지정';

  // 구조: store[examId].students[] → 각 항목 {subject, score, grade, timestamp}
  const store = loadStore();
  if(!store[exam.id]) store[exam.id] = { meta: exam, records: [] };
  // 한 학생이 동일 시험-과목을 여러번 저장할 수 있으므로 timestamp id 사용
  store[exam.id].records.push({
    id: 'r_'+Date.now(),
    subject,
    score: percent,
    grade,
    timestamp: new Date().toISOString()
  });
  saveStore(store);

  // 자동으로 summary로 이동해 요약 표시
  renderSummary();
  showView('view-summary');
});

// ----------------- SUMMARY: 저장된 데이터 집계 및 예상등급 계산 -----------------
function renderSummary(){
  const store = loadStore();
  const summaryArea = $('summaryArea');
  summaryArea.innerHTML = '';

  if(Object.keys(store).length === 0){
    summaryArea.innerHTML = '<div style="color:var(--muted)">저장된 가채점 데이터가 없습니다.</div>';
    return;
  }

  // 각 시험별로 표기
  for(const [examId, examObj] of Object.entries(store)){
    const examTitle = examObj.meta.name + ' (' + examObj.meta.date + ')';
    const container = document.createElement('div');
    container.style.padding = '10px 0';

    let html = `<h3 style="margin-bottom:6px">${examTitle}</h3>`;
    // subject별 집계 (평균)
    const bySub = {};
    examObj.records.forEach(r=>{
      if(!bySub[r.subject]) bySub[r.subject] = { sum:0, n:0, grades:[] };
      bySub[r.subject].sum += r.score;
      bySub[r.subject].n += 1;
      bySub[r.subject].grades.push(r.grade);
    });

    html += '<div style="display:flex;gap:12px;flex-wrap:wrap;">';
    for(const [sub, stat] of Object.entries(bySub)){
      const avg = (stat.sum / stat.n).toFixed(1);
      // 간단한 예측: 평균 기준 등급
      const predGrade = scoreToGrade(Number(avg));
      html += `<div style="min-width:180px;padding:10px;border-radius:10px;background:#fff;border:1px solid #eef6ff;">
                <div style="font-weight:800">${sub}</div>
                <div style="color:var(--muted);font-size:13px">샘플 수: ${stat.n}</div>
                <div style="margin-top:6px">평균: <strong>${avg}점</strong></div>
                <div style="margin-top:4px">예상 등급: <strong>${predGrade}등급</strong></div>
               </div>`;
    }
    html += '</div>';

    // 전체 평균(시험 종합)
    let totalSum=0, totalN=0;
    for(const stat of Object.values(bySub)){ totalSum += stat.sum; totalN += stat.n; }
    const overallAvg = totalN ? (totalSum/totalN).toFixed(1) : '-';
    const overallGrade = totalN ? scoreToGrade(Number(overallAvg)) : '-';
    html += `<div style="margin-top:10px;font-weight:700">시험 전체 평균: ${overallAvg}점 · 예상 등급: ${overallGrade}등급</div>`;

    container.innerHTML = html;
    summaryArea.appendChild(container);
    summaryArea.appendChild(document.createElement('hr'));
  }

  // 하단: 내 최신 기록(가장 최근 저장 5개)
  const storeArr = Object.values(store).flatMap(e=> e.records.map(r=> ({exam:e.meta.name, date: e.meta.date, ...r})));
  storeArr.sort((a,b)=> new Date(b.timestamp) - new Date(a.timestamp));
  const recent = storeArr.slice(0,6);
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

// export / clear data
$('exportData').addEventListener('click', ()=>{
  const store = loadStore();
  const blob = new Blob([JSON.stringify(store,null,2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'gache_data.json'; a.click();
  URL.revokeObjectURL(url);
});

$('clearData').addEventListener('click', ()=>{
  if(confirm('로컬에 저장된 모든 가채점 데이터를 삭제하시겠습니까?')) {
    localStorage.removeItem(STORAGE_KEY);
    renderSummary();
    alert('데이터가 초기화되었습니다.');
  }
});

// page init: user name 기본 설정
window.addEventListener('load', ()=>{
  const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  // set default user name if present in session or leave '학생'
  const user = sessionStorage.getItem('gache_user') || '학생';
  $('userName').textContent = user;

  // show main select view
  showView('view-select');

  // summary render if any
  renderSummary();
});