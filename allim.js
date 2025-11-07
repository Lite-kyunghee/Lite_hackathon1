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

document.getElementById("commonForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  alert("신청이 완료되었습니다.");
  location.reload();
});

document.getElementById("dinnerForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  alert("석식 신청이 완료되었습니다.");
  location.reload();
});
