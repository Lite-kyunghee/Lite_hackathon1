document.querySelector('.login-form').addEventListener('submit', (e) => {
  e.preventDefault();
  alert('로그인 기능은 추후 추가될 예정입니다.');
});

// 🌗 저장된 모드 불러오기
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "light") {
  document.body.classList.add("light-mode");
}
