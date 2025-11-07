const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("q");

searchForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const q = searchInput.value.trim();
    if (!q) return;

    // 챗봇 요청 보내기
    const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q })
    });

    const data = await res.json();
    showChatResult(data.answer);
});

// Helper
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

// Footer year
const year = $('#year');
if (year) year.textContent = new Date().getFullYear();

/* ========== Sidebar ========== */
const openSidebar = () => {
  document.body.classList.add('is-open');
  $('#sidebar').setAttribute('aria-hidden', 'false');
  $('#overlay').setAttribute('aria-hidden', 'false');
};
const closeSidebar = () => {
  document.body.classList.remove('is-open');
  $('#sidebar').setAttribute('aria-hidden', 'true');
  $('#overlay').setAttribute('aria-hidden', 'true');
};

$('#openSidebar').addEventListener('click', openSidebar);
$('#closeSidebar').addEventListener('click', closeSidebar);
$('#overlay').addEventListener('click', closeSidebar);
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeSidebar();
});

/* ========== Login ========== */
$('#loginBtn').addEventListener('click', () => {
  window.location.href = 'login.html';
});



/* ========== Timetable grid ========== */
(function buildTimetable() {
  const area = $('.timetable .cells');
  if (!area) return;
  const rows = 5,
    cols = 6;
  for (let i = 0; i < rows * cols; i++) {
    area.appendChild(document.createElement('div'));
  }
})();

/* ========== Widget modal ========== */
const modal = $('#widgetModal');
const openModal = () => document.body.classList.add('is-modal');
const closeModal = () => document.body.classList.remove('is-modal');

$('#fabAdd').addEventListener('click', openModal);
$('#closeModal').addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});

/* ========== Widget factory ========== */
function createWidget(type) {
  const card = document.createElement('article');
  card.className = 'widget';
  card.dataset.widget = type;

  const header = document.createElement('header');
  header.className = 'widget-header';

  const h3 = document.createElement('h3');
  const closeBtn = document.createElement('button');
  closeBtn.className = 'icon-btn sm remove-widget';
  closeBtn.title = '위젯 삭제';
  closeBtn.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    </svg>`;

  // ✅ 마지막 위젯도 제대로 삭제되도록 setTimeout 적용
  closeBtn.addEventListener('click', () => {
    setTimeout(() => {
      card.remove();
      updateWidgetHint(); // 삭제 후 문구 갱신
    }, 0);
  });

  header.append(h3, closeBtn);

  const body = document.createElement('div');
  body.className = 'widget-body';

  switch (type) {
    case 'timetable': {
      h3.textContent = '시간표';
      const wrap = document.createElement('div');
      wrap.className = 'timetable';
      const cells = document.createElement('div');
      cells.className = 'cells';
      for (let i = 0; i < 30; i++)
        cells.appendChild(document.createElement('div'));
      wrap.appendChild(cells);
      body.appendChild(wrap);
      break;
    }
    case 'lunch': {
      h3.textContent = '오늘의 급식';
      const ul = document.createElement('ul');
      ul.className = 'lunch-list';
      [
        '밥 · 국 · 메인 반찬',
        '부반찬 A',
        '부반찬 B',
        '디저트(과일/요거트)',
      ].forEach((t) => {
        const li = document.createElement('li');
        li.textContent = t;
        ul.appendChild(li);
      });
      body.appendChild(ul);
      break;
    }
    case 'exam-schedule': {
      h3.textContent = '수행평가 일정';
      body.innerHTML =
        '<p>다가오는 수행평가 일정이 표시됩니다. (연동 예정)</p>';
      break;
    }
    case 'calendar': {
      h3.textContent = '캘린더';
      body.innerHTML = '<p>월간 학사일정 위젯입니다. (연동 예정)</p>';
      break;
    }
    case 'notice': {
      h3.textContent = '알림';
      body.innerHTML = '<p>공지/알림 모아보기. (연동 예정)</p>';
      break;
    }
    default: {
      h3.textContent = '커스텀 위젯';
      body.textContent = '내용을 구성하세요.';
    }
  }

  card.append(header, body);
  return card;
}

/* ========== 위젯 안내 문구 (NEW) ========== */
function updateWidgetHint() {
  const widgetCount = document.querySelectorAll('.widget-grid .widget').length;
  const hint = document.getElementById('widgetHint');
  if (!hint) return;
  hint.style.display = widgetCount === 0 ? 'inline-block' : 'none';
}

/* ========== 모달에서 위젯 추가 ========== */
$$('.picker-item', modal).forEach((btn) => {
  btn.addEventListener('click', () => {
    const w = createWidget(btn.dataset.widget);
    $('#widgetGrid').appendChild(w);
    updateWidgetHint(); // 추가 후 문구 갱신
    closeModal();
  });
});

/* ========== 초기 위젯 삭제 버튼 ========== */
$$('.remove-widget').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    const card = e.currentTarget.closest('.widget');
    setTimeout(() => {
      card.remove();
      updateWidgetHint(); // 삭제 후 문구 갱신
    }, 0);
  });
});

/* ✅ 페이지 로드 시 초기 상태 확인 */
updateWidgetHint();

// === 다크모드 / 라이트모드 토글 ===
// === 다크모드 / 라이트모드 토글 ===
document.addEventListener('DOMContentLoaded', () => {
  const themeBtn = document.getElementById('themeToggle');
  const body = document.body;

  // 페이지 로드 시 저장된 테마 불러오기
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    body.classList.add('light-mode');
    themeBtn.textContent = '☀️';
  } else {
    themeBtn.textContent = '🌙';
  }

  // 버튼 클릭 시 테마 변경
  themeBtn.addEventListener('click', () => {
    body.classList.add('theme-transition'); // 페이드 효과
    setTimeout(() => body.classList.remove('theme-transition'), 500);

    body.classList.toggle('light-mode');
    const isLight = body.classList.contains('light-mode');
    themeBtn.textContent = isLight ? '☀️' : '🌙';

    localStorage.setItem('theme', isLight ? 'light' : 'dark');
  });
});

document.body.classList.add('theme-transition');
setTimeout(() => {
  document.body.classList.remove('theme-transition');
}, 600);

// 📅 오늘의 급식 위젯 업데이트
async function updateLunchMenu() {
  const widget = document.querySelector(".widget[data-type='lunch']");
  const content = widget.querySelector('.widget-content');

  try {
    const response = await fetch('11월_급식표.xlsx');
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

    // 첫 번째 시트 읽기
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    // 오늘 날짜 구하기 (예: 11/08)
    const today = new Date();
    const month = today.getMonth() + 1; // 0부터 시작
    const day = today.getDate();
    const todayStr = `${month}/${day}`; // 예: "11/8"

    // 급식 데이터에서 오늘 날짜 찾기
    const todayMenu = data.find((row) => {
      const dateStr = String(row['날짜']).replace(/\s/g, '');
      return dateStr.includes(`${month}월`) && dateStr.includes(`${day}일`);
    });

    // 결과 표시
    if (todayMenu && todayMenu['급식']) {
      const items = todayMenu['급식']
        .split('\n')
        .map((i) => `<li>${i.trim()}</li>`)
        .join('');
      content.innerHTML = `<ul>${items}</ul>`;
    } else {
      content.textContent = '오늘의 급식은 없습니다';
    }
  } catch (error) {
    console.error('급식 데이터를 불러오는 중 오류 발생:', error);
    content.textContent = '오늘의 급식은 없습니다';
  }
}

// 페이지 로드 시 실행
window.addEventListener('DOMContentLoaded', () => {
  updateLunchMenu();
});

/* ============================= */
/* 🍱 오늘의 급식 자동 표시 기능 (날짜 표시 추가) */
/* ============================= */

async function loadTodayLunch() {
  const listElement = document.getElementById('todayLunch');
  if (!listElement) return;

  try {
    // 급식 데이터 불러오기
    const response = await fetch('data/meals.json');
    const meals = await response.json();

    // 오늘 날짜 구하기
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    const todayStr = `${month}월 ${day}일`;

    // 주말(토,일)에는 급식 없음
    const dayOfWeek = today.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      listElement.innerHTML = `<li>${todayStr} 🍽️ 오늘의 급식은 없습니다</li>`;
      return;
    }

    // 날짜 비교 (공백/‘2024년’ 제거)
    const meal = meals.find((item) => {
      const cleanDate = item.날짜.replace(/\s/g, '').replace('2024년', '');
      const target = todayStr.replace(/\s/g, '');
      return cleanDate === target;
    });

    // 결과 표시
    if (밥) {
      const menuItems = meal.메뉴
        .split(',')
        .map((m) => `<li>${m.trim()}</li>`)
        .join('');
      listElement.innerHTML =
        `<li><strong>${todayStr} 급식 🍱</strong></li>` + menuItems;
    } else {
      listElement.innerHTML = `<li>${todayStr} 🍽️ 오늘의 급식은 없습니다</li>`;
    }
  } catch (err) {
    console.error('급식 데이터를 불러오는 중 오류:', err);
    listElement.innerHTML = `<li>${todayStr} ❌ 급식 정보를 불러오지 못했습니다</li>`;
  }
}

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', loadTodayLunch);

function showChatResult(text) {
    const box = document.getElementById("chatResult");
    box.classList.remove("hidden");
    box.textContent = text;
    
    // 검색창 커지면서 아래로 밀리는 효과
    box.scrollIntoView({ behavior: "smooth", block: "start" });
}

