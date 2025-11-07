const calendarGrid = document.getElementById("calendarGrid");
const monthTitle = document.getElementById("monthTitle");
const prevBtn = document.getElementById("prevMonth");
const nextBtn = document.getElementById("nextMonth");

let currentDate = new Date();

/* 🌗 테마 불러오기 */
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "light") {
  document.body.classList.add("light-mode");
}

/* 🗓️ 학사일정 데이터 */
const scheduleData = {
  "2025-02": [
    { date: "2025-02-03", event: "개학식" },
    { date: "2025-02-05", event: "졸업식(3)" },
    { date: "2025-02-06", event: "종업식(1,2)" }
  ],
  "2025-03": [
    { date: "2025-03-03", event: "대체공휴일" },
    { date: "2025-03-04", event: "입학식(1)" },
    { date: "2025-03-04", event: "개학식(2,3)" },
    { date: "2025-03-07", event: "신입생·재학생 상견례" },
    { date: "2025-03-17", event: "학부모 상담주간(1,2,3)" },
    { date: "2025-03-18", event: "학부모 방문의 날(2)" },
    { date: "2025-03-20", event: "체력평가" },
    { date: "2025-03-25", event: "학력평가(1,2,3)" }
  ],
  "2025-04": [
    { date: "2025-04-21", event: "중간고사" },
    { date: "2025-04-22", event: "중간고사" },
    { date: "2025-04-23", event: "중간고사" },
    { date: "2025-04-24", event: "중간고사" },
    { date: "2025-04-25", event: "중간고사" }
  ],
  "2025-05": [
    { date: "2025-05-01", event: "소풍(1,2) / 체육행사(3) / 교생실습 시작" },
    { date: "2025-05-05", event: "어린이날 / 부처님오신날" },
    { date: "2025-05-06", event: "대체공휴일" },
    { date: "2025-05-07", event: "진학설명회(1)" },
    { date: "2025-05-08", event: "진학설명회(2) / 학력평가(3)" },
    { date: "2025-05-15", event: "스승의 날" },
    { date: "2025-05-27", event: "진학·과목선택 설명회(1)" },
    { date: "2025-05-29", event: "진학·과목선택 설명회(2)" },
    { date: "2025-05-30", event: "교생실습 종료" }
  ],
  "2025-06": [
    { date: "2025-06-03", event: "제21대 대통령 선거" },
    { date: "2025-06-04", event: "학력평가(1,2) / 수능모의평가(3)" },
    { date: "2025-06-23", event: "기말고사" },
    { date: "2025-06-24", event: "기말고사" },
    { date: "2025-06-25", event: "기말고사" },
    { date: "2025-06-26", event: "기말고사" },
    { date: "2025-06-30", event: "수업량 유연화 주간" }
  ],
  "2025-07": [
    { date: "2025-07-01", event: "수업량 유연화 주간" },
    { date: "2025-07-02", event: "진학설명회(3) 1차" },
    { date: "2025-07-03", event: "진학설명회(3) 2차" },
    { date: "2025-07-10", event: "학력평가(3)" },
    { date: "2025-07-14", event: "임원 수련회 / 여름방학식" },
    { date: "2025-07-15", event: "임원 수련회" }
  ],
  "2025-08": [
    { date: "2025-08-11", event: "개학식" },
    { date: "2025-08-15", event: "광복절" },
    { date: "2025-08-21", event: "진학설명회(1,2)" },
    { date: "2025-08-25", event: "학부모 상담주간(1,2,3)" }
  ],
  "2025-09": [
    { date: "2025-09-03", event: "모의평가(3) / 학력평가(1,2)" },
    { date: "2025-09-05", event: "학부모 상담주간(1,2,3)" },
    { date: "2025-09-26", event: "중간고사" },
    { date: "2025-09-29", event: "중간고사" },
    { date: "2025-09-30", event: "중간고사" }
  ],
  "2025-10": [
    { date: "2025-10-01", event: "중간고사" },
    { date: "2025-10-02", event: "중간고사" },
    { date: "2025-10-03", event: "개천절" },
    { date: "2025-10-06", event: "추석" },
    { date: "2025-10-07", event: "추석 연휴" },
    { date: "2025-10-09", event: "한글날" },
    { date: "2025-10-14", event: "학력평가(1,2,3)" },
    { date: "2025-10-17", event: "체육행사(1,2)" },
    { date: "2025-10-20", event: "수련활동(1) / 수학여행(2)" },
    { date: "2025-10-23", event: "재량휴업일" }
  ],
  "2025-11": [
    { date: "2025-11-12", event: "수능예비소집일" },
    { date: "2025-11-13", event: "수능시험일(3)" },
    { date: "2025-11-14", event: "진로의 날(1,2)" },
    { date: "2025-11-24", event: "기말고사(3)" },
    { date: "2025-11-25", event: "기말고사(3)" },
    { date: "2025-11-26", event: "기말고사(3)" },
    { date: "2025-11-27", event: "기말고사(3)" },
    { date: "2025-11-28", event: "기말고사(3)" }
  ]
};

/* 캘린더 렌더링 */
function renderCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  monthTitle.textContent = `${year}년 ${month + 1}월`;

  const key = `${year}-${String(month + 1).padStart(2, "0")}`;
  const monthEvents = scheduleData[key] || [];

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDay = firstDay.getDay();
  const totalDays = lastDay.getDate();

  calendarGrid.innerHTML = "";

  for (let i = 0; i < startDay; i++) {
    calendarGrid.appendChild(document.createElement("div"));
  }

  for (let day = 1; day <= totalDays; day++) {
    const cell = document.createElement("div");
    cell.className = "day";
    const dateDiv = document.createElement("div");
    dateDiv.className = "date";
    dateDiv.textContent = day;
    cell.appendChild(dateDiv);

    const event = monthEvents.find(e => parseInt(e.date.split("-")[2]) === day);
    if (event) {
      cell.classList.add("has-event");
      const eventDiv = document.createElement("div");
      eventDiv.className = "event";
      eventDiv.textContent = event.event;
      cell.appendChild(eventDiv);
    }

    calendarGrid.appendChild(cell);
  }

  renderSchedule(year, month + 1);
}

/* 월간 일정 목록 렌더링 */
function renderSchedule(year, month) {
  const key = `${year}-${String(month).padStart(2, "0")}`;
  const schedule = scheduleData[key] || [];
  const container = document.querySelector(".schedule-list");
  container.innerHTML = "";

  if (schedule.length === 0) {
    container.innerHTML = "<p>해당 월의 일정이 없습니다.</p>";
    return;
  }

  schedule.forEach(item => {
    const div = document.createElement("div");
    div.className = "schedule-item";
    div.innerHTML = `<span class="date">${item.date}</span><span class="event">${item.event}</span>`;
    container.appendChild(div);
  });
}

/* 뒤로가기 */
function goBack() {
  window.location.href = "Lite_hackathon.html";
}

/* 월 이동 */
prevBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
});

nextBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
});

/* 초기 실행 */
renderCalendar();
