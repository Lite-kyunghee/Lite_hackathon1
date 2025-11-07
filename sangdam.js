const inputEl = document.getElementById("userInput");
const analyzeBtn = document.getElementById("analyzeBtn");
const resultSection = document.getElementById("resultSection");
const summaryTextEl = document.getElementById("summaryText");
const profilesContainer = document.getElementById("profilesContainer");

// 프리셋 태그 클릭 시 자동 입력
document.querySelectorAll(".tag").forEach(tag => {
  tag.addEventListener("click", () => {
    inputEl.value = tag.dataset.text;
  });
});

// ------------------------------
// 진로 프로필 데이터
// ------------------------------
const CAREER_PROFILES = [
  {
    id: "math",
    name: "수학 · 데이터 · 분석형",
    keywords: ["수학", "수리", "문제 푸는", "공식", "통계", "확률"],
    majors: ["수학과", "통계학과", "데이터사이언스학과", "금융공학과"],
    jobs: ["데이터분석가", "AI 연구원", "수리통계전문가", "퀀트", "금융리스크관리사"],
    advice:
      "논리적 사고와 수량 분석 능력이 강합니다. 데이터, 인공지능, 금융, 연구직 등에서 강점을 살릴 수 있어요."
  },
  {
    id: "cs",
    name: "컴퓨터 · 코딩 · AI형",
    keywords: ["코딩", "프로그래밍", "컴퓨터", "소프트웨어", "ai", "인공지능", "개발"],
    majors: ["컴퓨터공학과", "소프트웨어학과", "인공지능학과", "정보보호학과"],
    jobs: ["소프트웨어 개발자", "AI 엔지니어", "웹/앱 개발자", "게임 개발자"],
    advice:
      "문제 해결력과 논리력이 뛰어나며, 새로운 기술을 탐색하는 데 흥미가 있습니다. 개발, AI, 보안 등 다양한 진로가 열려 있어요."
  },
  {
    id: "business",
    name: "경영 · 마케팅 · 비즈니스형",
    keywords: ["경영", "사업", "창업", "비즈니스", "마케팅", "브랜드", "회사"],
    majors: ["경영학과", "국제경영학과", "마케팅학과", "무역학과"],
    jobs: ["경영컨설턴트", "마케팅 매니저", "브랜드 매니저", "스타트업 창업자"],
    advice:
      "숫자와 전략, 사람과 시장을 보는 눈이 중요합니다. 조직 운영, 브랜드 전략, 창업 등에서 역량을 발휘할 수 있어요."
  },
  {
    id: "law",
    name: "법 · 정치 · 공공정책형",
    keywords: ["법", "변호사", "정치", "헌법", "인권", "사법", "행정", "공무원"],
    majors: ["법학과", "행정학과", "정치외교학과"],
    jobs: ["변호사", "판검사", "로스쿨 진학", "공무원", "정책분석가"],
    advice:
      "사회 구조와 규범에 관심이 많고, 논리적 주장과 토론을 좋아한다면 법·정책 분야 진로가 잘 맞습니다."
  },
  {
    id: "nursing",
    name: "간호 · 보건 · 의료실무형",
    keywords: ["간호", "간호사", "환자", "병원", "건강", "보건"],
    majors: ["간호학과", "보건행정학과"],
    jobs: ["간호사", "보건교사", "의료코디네이터"],
    advice:
      "책임감과 공감 능력이 뛰어나고 사람을 돕는 일에서 보람을 느낀다면 간호·보건 분야가 적합합니다."
  },
  {
    id: "psychology",
    name: "심리 · 상담 · 인간이해형",
    keywords: ["심리", "상담", "마음", "우울", "불안", "정신", "사람 이야기"],
    majors: ["심리학과", "상담심리학과"],
    jobs: ["심리상담사", "임상심리사", "HR 전문가"],
    advice:
      "타인의 감정과 상황을 세심하게 바라본다면 심리·상담 분야에서 전문성을 키울 수 있어요."
  },
  {
    id: "social_help",
    name: "사회 · 교육 · 사람돕기형",
    keywords: ["사람 돕", "봉사", "교육", "선생님", "아이들", "가르치"],
    majors: ["교육학과", "초등교육과", "사회복지학과"],
    jobs: ["교사", "사회복지사", "청소년지도사"],
    advice:
      "타인을 성장시키고 돕는 것에 보람을 느끼는 유형입니다. 교육, 복지, 공공서비스 분야가 어울립니다."
  },
  {
    id: "design",
    name: "디자인 · 예술 · 크리에이티브형",
    keywords: ["디자인", "그림", "예술", "영상", "사진", "ui", "ux", "그래픽"],
    majors: ["시각디자인학과", "산업디자인학과", "영상디자인학과", "UX/UI디자인"],
    jobs: ["그래픽디자이너", "제품디자이너", "영상디자이너", "UX/UI 디자이너"],
    advice:
      "시각적 감각과 창의력을 기반으로 브랜드, 제품, 서비스 경험을 만들어가는 역할에 적합합니다."
  },
  {
    id: "aero",
    name: "항공우주 · 기계 · 공학형",
    keywords: ["우주", "로켓", "항공", "비행기", "인공위성", "엔진"],
    majors: ["항공우주공학과", "기계공학과"],
    jobs: ["항공우주 엔지니어", "비행체 설계 연구원", "드론 시스템 개발자"],
    advice:
      "미래 기술과 거대 시스템에 매력을 느끼는 타입입니다. 공학적 기초와 수학, 물리 역량이 중요합니다."
  },
  {
    id: "science",
    name: "과학 · 연구 · 탐구형",
    keywords: ["실험", "과학", "물리", "화학", "생명", "지구과학", "연구"],
    majors: ["물리학과", "화학과", "생명과학과", "지구과학과", "환경공학과"],
    jobs: ["연구원", "분석연구원", "환경컨설턴트"],
    advice:
      "세상이 어떻게 작동하는지 깊이 파고드는 성향으로, 기초과학과 응용과학 분야 진로가 잘 맞습니다."
  },
  {
    id: "write_human",
    name: "국어 · 글쓰기 · 인문사회형",
    keywords: ["글", "쓰기", "읽기", "국어", "철학", "역사", "사회문제"],
    majors: ["국어국문학과", "사학과", "철학과", "사회학과"],
    jobs: ["작가", "기자", "에디터", "기획자"],
    advice:
      "언어 감각과 사고력이 뛰어나며, 콘텐츠 제작·기획 및 인문사회 분야에서 강점을 가질 수 있습니다."
  }
];

// ------------------------------
// 버튼 클릭 시 분석 실행
// ------------------------------
analyzeBtn.addEventListener("click", () => {
  const text = (inputEl.value || "").trim();
  if (!text) {
    alert("관심사나 좋아하는 것에 대해 한 줄이라도 적어주세요!");
    return;
  }
  const result = analyzeText(text);
  renderResult(text, result);
});

// ------------------------------
// 분석 로직
// ------------------------------
function analyzeText(text) {
  const lower = text.toLowerCase();
  const matched = [];

  CAREER_PROFILES.forEach(profile => {
    let score = 0;
    profile.keywords.forEach(k => {
      if (lower.includes(k.toLowerCase())) score++;
    });
    if (score > 0) {
      matched.push({ ...profile, score });
    }
  });

  if (matched.length === 0) {
    return {
      matchedProfiles: [],
      message:
        "아직 뚜렷한 키워드를 찾기 어렵네요. 좋아하는 과목, 활동, 관심 분야를 조금 더 구체적으로 적어주면 더 정확히 추천할 수 있어요."
    };
  }

  matched.sort((a, b) => b.score - a.score);
  return {
    matchedProfiles: matched.slice(0, 3),
    message: "작성해 준 내용을 기준으로, 특히 아래 방향들이 잘 어울려 보여요."
  };
}

// ------------------------------
// 결과 렌더링
// ------------------------------
function renderResult(originalText, result) {
  resultSection.style.display = "block";

  summaryTextEl.innerHTML = `
    <div><strong>입력한 내용:</strong> ${escapeHtml(originalText)}</div>
    <div style="margin-top:6px;">${result.message}</div>
  `;

  profilesContainer.innerHTML = "";

  if (result.matchedProfiles.length === 0) {
    const div = document.createElement("div");
    div.className = "profile-card";
    div.innerHTML = `
      <div class="profile-title">조금만 더 구체적으로!</div>
      <div class="profile-advice">
        예: "수학이랑 코딩 좋아해요", "사람들 앞에서 말하는 게 즐겁고 토론 좋아해요",
        "그림 그리기랑 디자인에 관심 있어요", "우주, 로켓 영상 찾아보는 게 재밌어요"
      </div>
    `;
    profilesContainer.appendChild(div);
    return;
  }

  result.matchedProfiles.forEach(p => {
    const el = document.createElement("div");
    el.className = "profile-card";
    el.innerHTML = `
      <div class="profile-title">✅ ${p.name}</div>
      <div class="profile-majors">
        <span>추천 학과:</span> ${p.majors.join(", ")}
      </div>
      <div class="profile-jobs">
        <span>관련 직업:</span> ${p.jobs.join(", ")}
      </div>
      <div class="profile-advice">${p.advice}</div>
    `;
    profilesContainer.appendChild(el);
  });

  resultSection.scrollIntoView({ behavior: "smooth" });
}

// ------------------------------
// HTML 이스케이프
// ------------------------------
function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
