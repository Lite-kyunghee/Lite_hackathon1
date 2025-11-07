const main = document.getElementById("mainContent");

// ==============================
// 1️⃣ 초기: 학년 선택
// ==============================
document.addEventListener("DOMContentLoaded", showGradeSelect);

function showGradeSelect() {
  main.innerHTML = `
    <h2 class="section-title">학년을 선택하세요</h2>
    <div class="btn-grid">
      <div class="btn" onclick="selectGrade(1)">1학년</div>
      <div class="btn" onclick="selectGrade(2)">2학년</div>
      <div class="btn" onclick="selectGrade(3)">3학년</div>
    </div>
  `;
}

// ==============================
// 2️⃣ 학년별 과목 목록
// ==============================
const subjects = {
  1: ["국어","영어","수학","정보","일본어","역사","사회","과학"],
  2: [
    "국어","영어","수학","세계사","윤리와 사상","한국지리 탐구","법과 사회",
    "사회와 문화","물리학","화학","생명과학","지구과",
    "미적분Ⅱ","기하","경제 수학","동아시아 역사 기행",
    "현대사회와 윤리","세계시민과 지리","경제","정치",
    "역학과 에너지","물질과 에너지","세포와 물질대사",
    "지구시스템과학","융합과학탐구"
  ],
  3: [
    "국어","영어","수학","언어와 매체","화법과 작문","심화 수학Ⅰ","미적분",
    "여행지리","고전과 윤리","현대 세계의 변화","국제관계와 국제기구",
    "물리학Ⅱ","화학Ⅱ","생명과학Ⅱ","지구과학Ⅱ",
    "인공지능 수학","일본어Ⅱ","중국어Ⅱ",
    "사회문제탐구","한국 사회의 이해","세계 문제와 미래 사회",
    "프로그래밍","인공지능 기초",
    "고급 물리학","고급 화학","고급 생명과학","고급 지구과학","생태와 환경"
  ]
};

// ==============================
// 3️⃣ 과목 선택
// ==============================
function selectGrade(grade) {
  main.innerHTML = `
    <h2 class="section-title">${grade}학년 과목 선택</h2>
    <div class="btn-grid">
      ${subjects[grade]
        .map(sub => `<div class="btn" onclick="selectSubject(${grade}, '${sub}')">${sub}</div>`)
        .join("")}
    </div>
    <div class="back-btn" onclick="showGradeSelect()">← 학년 선택으로 돌아가기</div>
  `;
}

// ==============================
// 4️⃣ 연도 선택
// ==============================
function selectSubject(grade, subject) {
  main.innerHTML = `
    <h2 class="section-title">${grade}학년 ${subject}</h2>
    <div class="btn-grid">
      ${[2025, 2024, 2023]
        .map(y => `<div class="btn" onclick="selectYear(${grade}, '${subject}', ${y})">${y}년</div>`)
        .join("")}
    </div>
    <div class="back-btn" onclick="selectGrade(${grade})">← 과목 선택으로 돌아가기</div>
  `;
}

// ==============================
// 5️⃣ 시험 종류 선택
// ==============================
function selectYear(grade, subject, year) {
  main.innerHTML = `
    <h2 class="section-title">${year}년 ${grade}학년 ${subject}</h2>
    <div class="btn-grid">
      ${["1학기 중간고사","1학기 기말고사","2학기 중간고사","2학기 기말고사"]
        .map(t => `<div class="btn" onclick="showAnswers(${grade}, '${subject}', ${year}, '${t}')">${t}</div>`)
        .join("")}
    </div>
    <div class="back-btn" onclick="selectSubject(${grade}, '${subject}')">← 연도 선택으로 돌아가기</div>
  `;
}

// ==============================
// 6️⃣ 답안 표시
// ==============================
function showAnswers(grade, subject, year, examType) {
  main.innerHTML = `
    <h2 class="section-title">${year}년 ${grade}학년 ${subject} - ${examType}</h2>
    <p style="text-align:center; margin-top:40px; color:#9ca3af;">
      📄 ${year}년 ${grade}학년 ${subject} ${examType} 모범답안이 곧 공개됩니다.
    </p>
    <div class="back-btn" onclick="selectYear(${grade}, '${subject}', ${year})">← 시험 선택으로 돌아가기</div>
  `;
}
