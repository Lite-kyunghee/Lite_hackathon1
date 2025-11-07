const calendarGrid = document.getElementById("calendarGrid");
const monthTitle = document.getElementById("monthTitle");
const prevBtn = document.getElementById("prevMonth");
const nextBtn = document.getElementById("nextMonth");

let currentDate = new Date();
let schoolEvents = [];

// 공식 사이트에서 학사일정 HTML 가져오기
async function fetchSchedule() {
  const response = await fetch("https://www.kyungheeboy.hs.kr/?c=D1000/D1100");
  const html = await response.text();
  const dom = new DOMParser().parseFromString(html, "text/html");

  const items = dom.querySelectorAll(".schList ul li, .list li, .schedule-list li");
  schoolEvents = [];

  items.forEach(li => {
    const text = li.textContent.trim();
    const dateMatch = text.match(/\d{1,2}월\s*\d{1,2}일/);
    if (dateMatch) {
      const [month, day] = dateMatch[0].replace("일", "").split("월").map(v => v.trim());
      const title = text.replace(dateMatch[0], "").trim();
      schoolEvents.push({ month: parseInt(month), day: parseInt(day), title });
    }
  });
  renderCalendar();
}

function renderCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  monthTitle.textContent = `${year}년 ${month + 1}월`;

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDay = firstDay.getDay();
  const totalDays = lastDay.getDate();

  calendarGrid.innerHTML = "";

  for (let i = 0; i < startDay; i++) {
    const emptyCell = document.createElement("div");
    calendarGrid.appendChild(emptyCell);
  }

  for (let day = 1; day <= totalDays; day++) {
    const cell = document.createElement("div");
    cell.className = "day";

    const dateDiv = document.createElement("div");
    dateDiv.className = "date";
    dateDiv.textContent = day;
    cell.appendChild(dateDiv);

    const event = schoolEvents.find(
      e => e.month === month + 1 && e.day === day
    );
    if (event) {
      const eventDiv = document.createElement("div");
      eventDiv.className = "event";
      eventDiv.textContent = event.title;
      cell.appendChild(eventDiv);
    }

    calendarGrid.appendChild(cell);
  }
}

// 뒤로가기 기능
function goBack() {
  window.location.href = "Lite_hackathon.html";
}

prevBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
});

nextBtn.addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
});

fetchSchedule();
