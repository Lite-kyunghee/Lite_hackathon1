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
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  const firstDay = new Date(year, month - 1, 1).getDay();
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
      table.appendChild(row);
      row = document.createElement("tr");
    }
  }

  table.appendChild(row);
  calendarDiv.appendChild(table);
}

function renderUpcoming() {
  const now = new Date();
  const nextEvent = schedule.find(e => new Date(e.date) > now);
  document.getElementById("upcomingEvent").textContent =
    nextEvent ? `${nextEvent.date} / ${nextEvent.name}` : "다가오는 일정 없음";
}
