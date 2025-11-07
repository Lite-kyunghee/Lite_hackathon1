const gradeSelect = document.getElementById("grade");
const subjectSelect = document.getElementById("subject");
const form = document.getElementById("mogoForm");
const resultSection = document.getElementById("resultSection");
const resultSummary = document.getElementById("resultSummary");
const resultList = document.getElementById("resultList");

// 학년별 과목 데이터
const subjectsByGrade = {
  "1": ["국어", "영어", "수학", "정보", "일본어", "역사", "사회", "과학"],
  "2": [
    "국어", "영어", "수학", "세계사", "윤리와 사상", "한국지리 탐구", "법과 사회",
    "사회와 문화", "물리학", "화학", "생명과학", "지구과", "미적분Ⅱ", "기하", "경제 수학",
    "동아시아 역사 기행", "현대사회와 윤리", "세계시민과 지리", "경제", "정치",
    "역학과 에너지", "물질과 에너지", "세포와 물질대사", "지구시스템과학", "융합과학탐구"
  ],
  "3": [
    "국어", "영어", "수학", "언어와 매체", "화법과 작문", "심화 수학Ⅰ", "미적분", "여행지리",
    "고전과 윤리", "현대 세계의 변화", "국제관계와 국제기구", "물리학Ⅱ", "화학Ⅱ", "생명과학Ⅱ",
    "지구과학Ⅱ", "인공지능 수학", "일본어Ⅱ", "중국어Ⅱ", "사회문제탐구", "한국 사회의 이해",
    "세계 문제와 미래 사회", "프로그래밍", "인공지능 기초", "고급 물리학", "고급 화학",
    "고급 생명과학", "고급 지구과학", "생태와 환경"
  ]
};

// 학년 선택 시 과목 목록 업데이트
gradeSelect.addEventListener("change", () => {
  const grade = gradeSelect.value;
  subjectSelect.innerHTML = '<option value="">-- 과목 선택 --</option>';
  if (subjectsByGrade[grade]) {
    subjectsByGrade[grade].forEach((subject) => {
      const option = document.createElement("option");
      option.value = subject;
      option.textContent = subject;
      subjectSelect.appendChild(option);
    });
  }
});

// 제출 처리
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const grade = gradeSelect.value;
  const subject = subjectSelect.value;
  const score = parseInt(document.getElementById("score").value);
  const prefs = Array.from(
    document.querySelectorAll('input[type="checkbox"]:checked')
  ).map(el => el.value);

  if (!name || !grade || !subject || isNaN(score)) {
    alert("모든 항목을 입력하세요!");
    return;
  }

  // 점수에 따라 난이도 분류
  let level = "";
  if (score >= 90) level = "상";
  else if (score >= 75) level = "중상";
  else if (score >= 60) level = "중";
  else level = "하";

  const problems = generateProblems(subject, prefs, level);

  resultSummary.innerHTML = `
    <p><strong>${name}</strong> 학생 (${grade}학년)</p>
    <p>과목: <strong>${subject}</strong> / 수준: <strong>${level}</strong></p>
    <p>선호 유형: ${prefs.length ? prefs.join(", ") : "없음"}</p>
  `;

  resultList.innerHTML = problems
    .map(
      (p) => `
      <div class="result-card">
        <h3>${p.title}</h3>
        <p>${p.desc}</p>
        <p><strong>난이도:</strong> ${p.level}</p>
      </div>`
    )
    .join("");

  resultSection.style.display = "block";
  resultSection.scrollIntoView({ behavior: "smooth" });
});

// 문제 생성 로직
function generateProblems(subject, prefs, level) {
  const baseTypes = prefs.length ? prefs : ["개념", "응용", "객관식"];
  const count = 5;
  const problems = [];

  for (let i = 1; i <= count; i++) {
    const type = baseTypes[i % baseTypes.length];
    problems.push({
      title: `[${subject}] ${type} 문제 ${i}`,
      desc: `AI가 ${level} 수준에 맞게 구성한 ${type} 중심 문제입니다.`,
      level
    });
  }
  return problems;
}
