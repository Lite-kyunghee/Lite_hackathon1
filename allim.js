function openSection(id) {
  document.querySelectorAll(".card").forEach((el) => el.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function openForm(title) {
  document.querySelectorAll(".card").forEach((el) => el.classList.add("hidden"));
  const section = document.getElementById("formSection");
  document.getElementById("formTitle").textContent = title + " 신청서";
  section.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function toggleDinnerFields() {
  const select = document.getElementById("studyCheck");
  const details = document.getElementById("dinnerDetails");
  if (select.value === "yes") {
    details.classList.remove("hidden");
  } else if (select.value === "no") {
    alert("야자를 신청하지 않으면 석식 신청이 불가합니다.");
    location.reload();
  } else {
    details.classList.add("hidden");
  }
}

/* ------------------------------
   ✅ localStorage 기반 저장 로직
   (학번 입력칸 ID 자동 인식 기능 포함)
--------------------------------*/

function getStudentIdValue() {
  return (
    document.getElementById("studentId")?.value ||
    document.getElementById("id")?.value ||
    document.getElementById("학번")?.value ||
    ""
  );
}

function saveApplication(data) {
  const list = JSON.parse(localStorage.getItem("applications")) || [];
  data.timestamp = new Date().toISOString();
  list.push(data);
  localStorage.setItem("applications", JSON.stringify(list));
  console.log("✅ 저장 완료:", data);
}

/* 공통 신청서 */
document.getElementById("commonForm")?.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("name")?.value || "";
  const studentId = getStudentIdValue();
  const category =
    document.getElementById("formTitle")?.textContent.replace(" 신청서", "") ||
    "기타 신청";

  saveApplication({ category, name, studentId });
  alert("신청이 완료되었습니다!");
  location.reload();
});

/* 석식 신청 */
document.getElementById("dinnerForm")?.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("name")?.value || "";
  const studentId = getStudentIdValue();
  const days = Array.from(
    document.querySelectorAll('input[name="dinnerDays"]:checked')
  ).map((c) => c.value);

  saveApplication({ category: "석식 신청", name, studentId, days });
  alert("석식 신청이 완료되었습니다.");
  location.reload();
});
