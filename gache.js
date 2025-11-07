<<<<<<< HEAD
const schedule = [
  { date: "2025-03-26", name: "3월 학력평가" },
  { date: "2025-04-21", name: "1학기 중간고사 시작" },
  { date: "2025-06-04", name: "6월 학평 및 수능 모의평가" },
  { date: "2025-09-03", name: "9월 학력평가" },
  { date: "2025-09-26", name: "2학기 중간고사 시작" },
  { date: "2025-10-14", name: "10월 학력평가" },
  { date: "2025-12-08", name: "2학기 기말고사(1,2학년)" }
];

renderCalendar(2025, 11);
renderUpcoming();

document.getElementById("startBtn").addEventListener("click", () => {
  alert("학년 선택 페이지로 이동합니다 (다음 단계 구현 예정)");
});

function renderCalendar(year, month) {
  const calendarDiv = document.getElementById("calendar");
  calendarDiv.innerHTML = "";

  const table = document.createElement("table");
  table.classList.add("calendar");

  const headerRow = document.createElement("tr");
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  days.forEach(day => {
    const th = document.createElement("th");
    th.textContent = day;
=======
// =======================
// 2025 학사 일정 데이터
// =======================
const schedule = [
  { date: "2025-03-26", name: "3월 학력평가" },
  { date: "2025-04-21", name: "1학기 중간고사" },
  { date: "2025-04-22", name: "1학기 중간고사" },
  { date: "2025-04-23", name: "1학기 중간고사" },
  { date: "2025-04-24", name: "1학기 중간고사" },
  { date: "2025-04-25", name: "1학기 중간고사" },
  { date: "2025-06-04", name: "6월 학력평가 / 수능 모의평가" },
  { date: "2025-06-23", name: "1학기 기말고사" },
  { date: "2025-06-24", name: "1학기 기말고사" },
  { date: "2025-06-25", name: "1학기 기말고사" },
  { date: "2025-06-26", name: "1학기 기말고사" },
  { date: "2025-06-27", name: "1학기 기말고사" },
  { date: "2025-09-03", name: "9월 학력평가 / 모의평가" },
  { date: "2025-09-26", name: "2학기 중간고사" },
  { date: "2025-09-29", name: "2학기 중간고사" },
  { date: "2025-09-30", name: "2학기 중간고사" },
  { date: "2025-10-01", name: "2학기 중간고사" },
  { date: "2025-10-02", name: "2학기 중간고사" },
  { date: "2025-10-14", name: "10월 학력평가" },
  { date: "2025-11-24", name: "2학기 기말고사(고3)" },
  { date: "2025-11-25", name: "2학기 기말고사(고3)" },
  { date: "2025-11-26", name: "2학기 기말고사(고3)" },
  { date: "2025-11-27", name: "2학기 기말고사(고3)" },
  { date: "2025-11-28", name: "2학기 기말고사(고3)" },
  { date: "2025-12-08", name: "2학기 기말고사(1,2학년)" },
  { date: "2025-12-09", name: "2학기 기말고사(1,2학년)" },
  { date: "2025-12-10", name: "2학기 기말고사(1,2학년)" },
  { date: "2025-12-11", name: "2학기 기말고사(1,2학년)" },
  { date: "2025-12-12", name: "2학기 기말고사(1,2학년)" }
];

// =======================
// 국어 정답 데이터 (예시용 랜덤 고정)
// 모의고사: 45문항, 2학기 중간: 30문항
// =======================
const answerKeys = {
  mock_oct: {
    korean: [
      2,4,1,3,5,2,4,3,1,5,
      2,3,4,1,5,2,3,4,1,2,
      5,3,1,4,2,5,1,3,4,2,
      1,2,3,4,5,2,3,1,4,5,
      3,2,4
    ] // 43? let's ensure length 45
  },
  mid_2: {
    korean: [
      3,1,4,2,5,2,4,1,3,5,
      2,3,1,4,5,3,2,4,1,5,
      2,4,3,1,5,3,2,4,1,5
    ]
  }
};

// Ensure correct length for mock_oct korean: fill to 45
while (answerKeys.mock_oct.korean.length < 45) {
  answerKeys.mock_oct.korean.push(Math.floor(Math.random() * 5) + 1);
}

// =======================
// 상태 변수
// =======================
let selectedGrade = null;
let selectedExamType = null; // 'mock_oct' or 'mid_2'
let selectedSubject = null;  // 'korean'
let currentQuestionCount = 0;

// =======================
// 초기화
// =======================
document.addEventListener("DOMContentLoaded", () => {
  renderCalendar(2025, 10);     // 10월 달력 (디자인용)
  renderUpcoming();
  attachEvents();
  showGradeStep();              // 첫 화면에 바로 1단계 표시
});

function attachEvents() {
  const startBtn = document.getElementById("startBtn");
  const backHomeBtn = document.getElementById("backHomeBtn");
  startBtn.addEventListener("click", () => {
    showGradeStep();
    document.getElementById("flowSection")
      .scrollIntoView({ behavior: "smooth" });
  });
  backHomeBtn.addEventListener("click", () => {
    resetFlow();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// =======================
// 달력 & 다가오는 일정
// =======================
function renderCalendar(year, month) {
  const calEl = document.getElementById("calendar");
  calEl.innerHTML = "";

  const title = document.createElement("div");
  title.className = "cal-title";
  title.textContent = `${year}년 ${month}월`;
  calEl.appendChild(title);

  const table = document.createElement("table");
  table.className = "cal-table";

  const headerRow = document.createElement("tr");
  ["일","월","화","수","목","금","토"].forEach(d => {
    const th = document.createElement("th");
    th.textContent = d;
>>>>>>> origin/final2
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  const firstDay = new Date(year, month - 1, 1).getDay();
<<<<<<< HEAD
  const daysInMonth = new Date(year, month, 0).getDate();
  let row = document.createElement("tr");

  for (let i = 0; i < firstDay; i++) row.appendChild(document.createElement("td"));

  for (let date = 1; date <= daysInMonth; date++) {
    const td = document.createElement("td");
    td.textContent = date;

    const fullDate = `${year}-${String(month).padStart(2, "0")}-${String(date).padStart(2, "0")}`;
    const isEvent = schedule.some(e => e.date === fullDate);
    if (isEvent) td.classList.add("event-day");

    row.appendChild(td);
    if ((firstDay + date) % 7 === 0) {
=======
  const lastDate = new Date(year, month, 0).getDate();
  let row = document.createElement("tr");

  for (let i = 0; i < firstDay; i++) {
    row.appendChild(document.createElement("td"));
  }

  const todayStr = todayYYYYMMDD();

  for (let d = 1; d <= lastDate; d++) {
    const td = document.createElement("td");
    const dateStr = `${year}-${String(month).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    td.textContent = d;

    if (schedule.some(ev => ev.date === dateStr)) {
      td.classList.add("event");
    }
    if (dateStr === todayStr) {
      td.classList.add("today");
    }

    row.appendChild(td);
    if ((firstDay + d) % 7 === 0) {
>>>>>>> origin/final2
      table.appendChild(row);
      row = document.createElement("tr");
    }
  }

  table.appendChild(row);
<<<<<<< HEAD
  calendarDiv.appendChild(table);
=======
  calEl.appendChild(table);
}

function todayYYYYMMDD() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
>>>>>>> origin/final2
}

function renderUpcoming() {
  const now = new Date();
<<<<<<< HEAD
  const nextEvent = schedule.find(e => new Date(e.date) > now);
  document.getElementById("upcomingEvent").textContent =
    nextEvent ? `${nextEvent.date} / ${nextEvent.name}` : "다가오는 일정 없음";
=======
  let next = null;

  schedule.forEach(ev => {
    const evDate = new Date(ev.date + "T00:00:00");
    if (evDate >= now && (!next || evDate < new Date(next.date + "T00:00:00"))) {
      next = ev;
    }
  });

  const el = document.getElementById("upcomingEvent");
  if (next) {
    el.textContent = `${next.date} - ${next.name}`;
  } else {
    el.textContent = "남은 일정이 없습니다.";
  }
}

// =======================
// 1단계: 학년 선택
// =======================
function showGradeStep() {
  selectedGrade = null;
  selectedExamType = null;
  selectedSubject = null;
  currentQuestionCount = 0;
  document.getElementById("resultSection").style.display = "none";

  document.getElementById("stepContainer").innerHTML = `
    <h3>1단계: 학년 선택</h3>
    <button class="btn-step active" onclick="selectGrade(1)">1학년</button>
    <button class="btn-step disabled">2학년 (준비 중)</button>
    <button class="btn-step disabled">3학년 (준비 중)</button>
  `;
}

function selectGrade(grade) {
  selectedGrade = grade;
  document.getElementById("stepContainer").innerHTML = `
    <h3>2단계: 시험 선택 (1학년)</h3>
    <button class="btn-step" onclick="selectExam('mock_oct')">10월 모의고사</button>
    <button class="btn-step" onclick="selectExam('mid_2')">2학기 중간고사</button>
  `;
}

// =======================
// 2단계: 시험 선택
// =======================
function selectExam(examType) {
  selectedExamType = examType;
  document.getElementById("stepContainer").innerHTML = `
    <h3>3단계: 과목 선택</h3>
    <button class="btn-subject" onclick="selectSubject('korean')">국어</button>
    <button class="btn-subject disabled">수학 (준비 중)</button>
    <button class="btn-subject disabled">영어 (준비 중)</button>
    <button class="btn-subject disabled">사회 (준비 중)</button>
    <button class="btn-subject disabled">과학 (준비 중)</button>
    <button class="btn-subject disabled">역사 (준비 중)</button>
  `;
}

// =======================
// 3단계: 과목 선택 (현재 국어만)
// =======================
function selectSubject(subj) {
  if (subj !== "korean") {
    alert("현재는 국어만 지원됩니다.");
    return;
  }
  selectedSubject = "korean";
  showKoreanExam();
}

// =======================
// 4단계: 국어 문항 표시
// =======================
function showKoreanExam() {
  let count = selectedExamType === "mock_oct" ? 45 : 30;
  currentQuestionCount = count;

  const title =
    selectedExamType === "mock_oct"
      ? "4단계: 국어 - 10월 모의고사 (45문항)"
      : "4단계: 국어 - 2학기 중간고사 (30문항)";

  let html = `<h3>${title}</h3><div class="question-grid">`;

  for (let i = 1; i <= count; i++) {
    html += `
      <div class="q-box">
        <div class="q-label">${i}번</div>
        <div class="q-options">
          ${[1,2,3,4,5].map(n => `
            <label class="opt-label" data-q="${i}" data-val="${n}">
              <input type="radio" name="q${i}" value="${n}">
              <span class="opt-text">${n}</span>
            </label>
          `).join("")}
        </div>
      </div>
    `;
  }

  html += `</div>
    <button class="btn-primary" onclick="gradeExam()">채점하기</button>
  `;

  document.getElementById("stepContainer").innerHTML = html;
}

// =======================
// 5단계: 채점 (프론트에서만 처리)
// =======================
function gradeExam() {
  if (!selectedExamType || !selectedSubject || !currentQuestionCount) {
    alert("설정이 올바르지 않습니다. 처음부터 다시 진행해주세요.");
    return;
  }

  const key =
    answerKeys[selectedExamType] &&
    answerKeys[selectedExamType][selectedSubject];

  if (!key || key.length < currentQuestionCount) {
    alert("정답 데이터가 설정되지 않았습니다. (개발 필요)");
    return;
  }

  // 이전 표시 초기화
  document.querySelectorAll(".opt-label").forEach(label => {
    label.classList.remove(
      "opt-correct",
      "opt-correct-selected",
      "opt-wrong-selected"
    );
  });

  const details = [];
  let correctCount = 0;

  for (let i = 1; i <= currentQuestionCount; i++) {
    const correct = key[i - 1];
    const checked = document.querySelector(`input[name="q${i}"]:checked`);
    const chosen = checked ? Number(checked.value) : 0;

    const labels = document.querySelectorAll(`.opt-label[data-q="${i}"]`);

    labels.forEach(label => {
      const val = Number(label.dataset.val);

      if (val === correct) {
        // 정답 옵션 표시
        if (chosen === correct) {
          label.classList.add("opt-correct-selected");
        } else {
          label.classList.add("opt-correct");
        }
      }

      if (chosen !== 0 && val === chosen && chosen !== correct) {
        // 오답으로 선택한 보기
        label.classList.add("opt-wrong-selected");
      }
    });

    const is_correct = chosen === correct;
    if (is_correct) correctCount++;

    details.push({
      number: i,
      correct,
      student: chosen || null,
      is_correct
    });
  }

  const percent = Math.round((correctCount / currentQuestionCount) * 100);

  // 결과 표시
  const summary = document.getElementById("resultSummary");
  summary.innerHTML = `
    <p>학년: ${selectedGrade || 1}학년</p>
    <p>시험: ${selectedExamType === "mock_oct" ? "10월 모의고사" : "2학기 중간고사"}</p>
    <p>과목: 국어</p>
    <p>점수: <strong>${correctCount} / ${currentQuestionCount}</strong> (정답률 ${percent}%)</p>
  `;

  const detailEl = document.getElementById("resultDetail");
  detailEl.innerHTML = "";
  details.forEach(d => {
    const div = document.createElement("div");
    div.className =
      "result-line " + (d.is_correct ? "correct" : "wrong");
    div.textContent =
      `${d.number}번) 내 답: ${d.student ?? "-"} / 정답: ${d.correct} ` +
      (d.is_correct ? "✅" : "❌");
    detailEl.appendChild(div);
  });

  document.getElementById("resultSection").style.display = "block";
  document
    .getElementById("resultSection")
    .scrollIntoView({ behavior: "smooth" });
}

// =======================
// 초기화
// =======================
function resetFlow() {
  showGradeStep();
  document.getElementById("resultSection").style.display = "none";
>>>>>>> origin/final2
}
