// 유틸
const $ = (sel, ctx=document) => ctx.querySelector(sel);
const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));

// 연도 표시
$('#year').textContent = new Date().getFullYear();

// 사이드바 열기/닫기
const openSidebar = () => {
  document.body.classList.add('is-open');
};
const closeSidebar = () => {
  document.body.classList.remove('is-open');
};

$('#openSidebar').addEventListener('click', openSidebar);
$('#closeSidebar').addEventListener('click', closeSidebar);
$('#overlay').addEventListener('click', closeSidebar);
window.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') closeSidebar(); });

// 로그인 버튼(임시)
$('#loginBtn').addEventListener('click', () => {
  alert('로그인 기능은 곧 추가될 예정입니다.');
});

// 검색(임시)
$('#searchForm').addEventListener('submit', (e)=>{
  e.preventDefault();
  const q = ($('#q').value || '').trim();
  if(!q) return alert('검색어를 입력하세요.');
  alert(`검색 기능 준비 중입니다.\n입력한 검색어: ${q}`);
});

// 시간표 5x6 그리드 채우기
(function buildTimetable(){
  const cells = $('.timetable .cells');
  if(!cells) return;
  const rows = 5, cols = 6;
  for(let i=0;i<rows*cols;i++){
    const c = document.createElement('div');
    cells.appendChild(c);
  }
})();

// ===== 위젯 추가 모달 =====
const modal = $('#widgetModal');
const openModal = () => document.body.classList.add('is-modal');
const closeModal = () => document.body.classList.remove('is-modal');

$('#fabAdd').addEventLi
