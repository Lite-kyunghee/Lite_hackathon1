const MY_DATA = JSON.parse(localStorage.getItem("applications")) || [];

// 석식 여부 확인
function checkDinnerStatus() {
  const dinnerApp = MY_DATA.find(app => app.category === "석식 신청");
  return dinnerApp ? "✅ 신청 완료" : "❌ 미신청";
}

const $content = document.getElementById("content");
const $tabSuhang = document.getElementById("tab-suhang");
const $tabForms = document.getElementById("tab-forms");

function calcDDay(due) {
  if (!due) return { label: '-', cls: 'none' };
  const today = new Date(); today.setHours(0,0,0,0);
  const d = new Date(due); d.setHours(0,0,0,0);
  const diff = Math.floor((d - today) / (1000*60*60*24));
  if (diff < 0) return { label: '마감', cls: 'expired' };
  if (diff === 0) return { label: 'D-Day', cls: 'today' };
  return { label: `D-${diff}`, cls: 'dday' };
}

// 수행평가 예시 (고정)
const SUHANG_SAMPLE = [
  { title: '2학년 수학 - 확률과 통계 심화탐구', teacher: '강수미', due: '2025-10-25' },
  { title: '2학년 과학 - 지구과학Ⅰ 과학탐구보고서', teacher: '김기권', due: '2025-10-20' },
  { title: '2학년 영어 - Speaking 수행평가', teacher: '오가영', due: '2025-10-22' }
];

function renderSuhang() {
  const rows = SUHANG_SAMPLE.map(x => {
    const d = calcDDay(x.due);
    return `<tr>
      <td>${x.title}</td>
      <td>${x.teacher}</td>
      <td>${x.due}</td>
      <td class="${d.cls}">${d.label}</td>
    </tr>`;
  }).join('');
  $content.innerHTML = `
    <h2>📘 내가 제출한 수행평가</h2>
    <table>
      <thead><tr><th>제목</th><th>담당 교사</th><th>마감일</th><th>D-Day</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function renderForms() {
  if (MY_DATA.length === 0) {
    $content.innerHTML = `
      <h2>📝 내가 작성한 신청서</h2>
      <p style="opacity:0.7; text-align:center;">아직 작성한 신청서가 없습니다.</p>`;
    return;
  }

  const rows = MY_DATA.map(x => {
    if (x.category === "석식 신청") {
      return `
        <tr>
          <td>🍱 ${x.category}</td>
          <td>${checkDinnerStatus()}</td>
          <td>${new Date(x.timestamp).toLocaleDateString('ko-KR')}</td>
        </tr>`;
    } else {
      return `
        <tr>
          <td>${x.category}</td>
          <td>${x.name || "-"}</td>
          <td>${new Date(x.timestamp).toLocaleDateString('ko-KR')}</td>
        </tr>`;
    }
  }).join('');

  $content.innerHTML = `
    <h2>📝 내가 작성한 신청서</h2>
    <table>
      <thead><tr><th>신청 종류</th><th>신청자 / 상태</th><th>신청일</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

$tabSuhang.onclick = () => {
  $tabSuhang.classList.add('active');
  $tabForms.classList.remove('active');
  renderSuhang();
};

$tabForms.onclick = () => {
  $tabForms.classList.add('active');
  $tabSuhang.classList.remove('active');
  renderForms();
};

renderSuhang();
