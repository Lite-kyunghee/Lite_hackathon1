# ai_engine.py — FINAL (Groq + 액션/하이라이트 신호)
# - 자연어 정규화/분류는 기존 하드닝 로직 유지
# - "이동/열어/들어가" 등 내비게이션 요청 → action 반환
# - "그 수행으로 이동" 등 요청 → 하이라이트 대상 추출해 action.highlight 에 포함
# - 답변 텍스트 + action JSON 함께 반환(프론트에서 처리)

import os, re, json, datetime, requests
from typing import List, Dict, Any, Optional, Tuple
from functools import lru_cache

# ────────────────────────────────────────────────────────────
# 0) Groq API
# ────────────────────────────────────────────────────────────
GROQ_API_KEY = "gsk_여기에_네_실제키"  # ← 실제 키로 교체
if not GROQ_API_KEY.startswith("gsk_"):
    raise RuntimeError("❌ GROQ_API_KEY가 올바르지 않습니다.")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
HEADERS  = {"Authorization": f"Bearer {GROQ_API_KEY}"}
MODEL_FAST   = "llama-3.1-8b-instant"
MODEL_STRONG = "llama-3.3-70b-versatile"

# ────────────────────────────────────────────────────────────
# 1) 데이터 로딩 (같은 폴더의 data*.json 들을 바로 둬도 OK)
# ────────────────────────────────────────────────────────────
def _load(name: str):
    try:
        with open(name, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return [] if name.endswith(".json") else {}

tasks       = _load("tasks.json")        # [ {subject,title,deadline} ... ]
assignments = _load("assignments.json")  # [ {subject,task,deadline} ... ]
timetable   = _load("timetable.json")    # { mon:[...], tue:[...], ... }
lunch       = _load("lunch.json")        # { "YYYY-MM-DD":[...] }
notices     = _load("notices.json")      # [ {title,date} ... ]

WEEK_KEYS = ["mon","tue","wed","thu","fri"]
SUBJECTS  = ["국어","수학","영어","사회","역사","과학","기술","정보","음악","미술","체육"]
INTENT_WHITELIST = {"task","assignment","urgent","timetable","lunch","notice","none"}

# 탭 매핑 (파일명은 네가 가진 페이지 이름 기준)
TAB_MAP = {
    "수행": "suhang.html",
    "수행평가": "suhang.html",
    "모범답": "mobum.html",
    "정기고사": "mobum.html",
    "가채점": "gache.html",
    "모의고사": "mogo.html",
    "모고": "mogo.html",
    "알림": "allim.html",
    "진로": "sangdam.html",
    "상담": "sangdam.html",
    "학사": "haksa.html",
    "my": "my.html",
    "마이": "my.html",
    "게시판": "#",
    "학습자료": "#",
}

# ────────────────────────────────────────────────────────────
# 2) 유틸
# ────────────────────────────────────────────────────────────
def today() -> datetime.date:
    return datetime.date.today()

def parse_iso_date(s: Optional[str]) -> Optional[datetime.date]:
    if not s: return None
    try: return datetime.date.fromisoformat(s)
    except: return None

def normalize_text(s: Optional[str]) -> str:
    return s.replace("\u200b","").strip() if s else ""

def korean_relative_to_date(text: str) -> Optional[str]:
    base = today()
    t = normalize_text(text).lower()
    if ("내일모레" in t) or ("내일 모레" in t) or ("내일 모래" in t): return (base + datetime.timedelta(days=2)).isoformat()
    if "모레" in t:  return (base + datetime.timedelta(days=2)).isoformat()
    if "내일" in t:  return (base + datetime.timedelta(days=1)).isoformat()
    if "어제" in t:  return (base - datetime.timedelta(days=1)).isoformat()
    if "오늘" in t:  return base.isoformat()
    days_ko = ["월","화","수","목","금","토","일"]
    for i, ko in enumerate(days_ko):
        if f"{ko}요일" in t:
            delta = (i - base.weekday()) % 7
            return (base + datetime.timedelta(days=delta)).isoformat()
        if f"다음주 {ko}" in t or f"다음 주 {ko}" in t:
            delta = ((7 - base.weekday()) % 7) + i
            return (base + datetime.timedelta(days=delta)).isoformat()
    return None

# ────────────────────────────────────────────────────────────
# 3) Groq
# ────────────────────────────────────────────────────────────
def _groq_chat(model: str, messages: list, max_tokens: int = 300) -> str:
    r = requests.post(
        GROQ_URL, headers=HEADERS,
        json={"model": model, "messages": messages, "max_tokens": max_tokens},
        timeout=20
    )
    r.raise_for_status()
    return r.json()["choices"][0]["message"]["content"]

# ────────────────────────────────────────────────────────────
# 4) normalize
# ────────────────────────────────────────────────────────────
SYS_NORMALIZE = """너는 학생 입력을 표준 한국어로 보정한다.
- 오타/띄어쓰기/초성만 수정, 의미 변경 금지
- 날짜 표현(내일/모레/내일모레/어제/요일)은 원형 유지
- 키워드(수행/과제/공지/가채점/모범답/이동/열어/들어가)는 원형 유지
JSON만 출력:
{"normalized":"..."}"""

@lru_cache(maxsize=256)
def llm_normalize(query: str) -> str:
    q = normalize_text(query)
    for model in [MODEL_FAST, MODEL_STRONG]:
        try:
            out = _groq_chat(model, [{"role":"system","content":SYS_NORMALIZE},
                                     {"role":"user","content":q}], max_tokens=120)
            m = re.search(r"\{.*?\}", out, re.S)
            if not m: continue
            obj = json.loads(m.group(0))
            norm = normalize_text(obj.get("normalized",""))
            if norm: return norm
        except: pass
    return q

# ────────────────────────────────────────────────────────────
# 5) extract (LLM 분류 + 강제보정)
# ────────────────────────────────────────────────────────────
def _build_extract_prompt(today_str: str) -> str:
    return f"""너는 질문을 엄격히 분류한다. 날짜 계산은 절대 하지 마라.

카테고리:
- task / assignment / urgent / timetable / lunch / notice / none
규칙:
- 숙제/과제/리포트/보고서 → assignment
- 수행/발표/대본/프레젠 → task
- 가장 근접/임박/급한 → urgent
- 시간표/교시/요일 → timetable
- 급식/점심/메뉴/밥 만 단독 → lunch
- 행사/공지/안내/이벤트 → notice
과목 후보:
{json.dumps(SUBJECTS, ensure_ascii=False)}

JSON만:
{{"intents":[...],"subjects":[...],"date":null,"reasoning":"..."}}"""

def _force_fix_intents(q: str, intents, subs):
    ql = normalize_text(q).lower()
    out = set(intents or []); sset = set(subs or [])
    if any(k in ql for k in ["숙제","과제","리포트","보고서"]): out.add("assignment"); out.discard("lunch")
    if any(k in ql for k in ["수행","발표","대본","프레젠"]):   out.add("task"); out.discard("lunch")
    if any(k in ql for k in ["가장 근접","가장 촉박","임박","급한","근접","촉박"]): out.add("urgent")
    if any(k in ql for k in ["시간표","교시","요일"]): out.add("timetable")
    if any(k in ql for k in ["행사","공지","안내","이벤트"]): out.add("notice")
    if (any(k in ql for k in ["급식","점심","메뉴","밥"]) and not any(k in ql for k in ["수행","과제","숙제","발표","프레젠","대본","리포트","보고서"])):
        out.add("lunch")
    else:
        out.discard("lunch")
    for s in SUBJECTS:
        if s in ql: sset.add(s)
    if "none" in out and len(out) > 1: out.discard("none")
    return sorted(out), sorted(sset)

def llm_extract(norm_q: str, original_q: str) -> Dict[str,Any]:
    prompt = _build_extract_prompt(today().isoformat())
    for _ in range(4):
        try:
            out = _groq_chat(MODEL_STRONG, [
                {"role":"system","content":prompt},
                {"role":"user","content":norm_q}
            ], max_tokens=250)
            m = re.search(r"\{.*?\}", out, re.S)
            if not m: raise ValueError("no json")
            obj = json.loads(m.group(0))
            fi, fs = _force_fix_intents(original_q, obj.get("intents",[]), obj.get("subjects",[]))
            obj["intents"], obj["subjects"] = fi, fs
            return obj
        except: pass
    fi, fs = _force_fix_intents(original_q, [], [])
    return {"intents": fi or ["none"], "subjects": fs, "date": None}

# ────────────────────────────────────────────────────────────
# 6) 도메인 로직 (포맷 + 일정)
# ────────────────────────────────────────────────────────────
def timetable_by_date(d: datetime.date) -> list:
    wd = d.weekday()
    if 0 <= wd <= 4 and isinstance(timetable, dict):
        return timetable.get(WEEK_KEYS[wd], [])
    return []

def lunch_by_date(d: datetime.date) -> list:
    return lunch.get(d.isoformat(), []) if isinstance(lunch, dict) else []

def sort_by_date(items: list) -> list:
    def k(x):
        d = parse_iso_date(x.get("deadline") or x.get("due") or x.get("date"))
        return d if d else datetime.date.max
    return sorted(items, key=k)

def filter_subject(items: list, subjects: list) -> list:
    if not isinstance(items, list) or not subjects: return []
    want = set(subjects)
    return [it for it in items if it.get("subject") in want]

def format_schedule(items: list, title: str) -> str:
    if not items: return f"{title} 없음"
    items = sort_by_date(items)
    lines = []
    for i in items:
        dd = i.get("deadline") or i.get("due") or "-"
        subj = i.get("subject","-")
        name = i.get("title") or i.get("task") or "(제목없음)"
        lines.append(f"- [{subj}] {name} (마감: {dd})")
    return f"{title} {len(items)}건\n" + "\n".join(lines)

# ────────────────────────────────────────────────────────────
# 7) 내비게이션/하이라이트 규칙
# ────────────────────────────────────────────────────────────
NAV_TRIGGERS = ("이동", "들어가", "열어", "가줘", "열어줘", "들어가줘", "열어라", "띄워")
HILITE_TRIGGERS = ("하이라이트", "강조", "색", "표시", "찾아", "바로가", "이걸로")

def detect_navigation_target(text: str) -> Optional[str]:
    t = text.lower()
    if not any(k in t for k in NAV_TRIGGERS): return None
    for k, page in TAB_MAP.items():
        if k in text:
            return page
    # 과목 키워드만 있을 때 수행 페이지로 기본 이동
    if any(s in text for s in SUBJECTS):
        return "suhang.html"
    return None

def extract_quoted(text: str) -> Optional[str]:
    m = re.search(r"[\"'“”‘’](.+?)[\"'“”‘’]", text)
    return m.group(1).strip() if m else None

def pick_first_task_by_subject(subs: list) -> Optional[str]:
    if not subs: return None
    cand = filter_subject(tasks, subs)
    if not cand: return None
    cand = sort_by_date(cand)
    return (cand[0].get("title") or "").strip() or None

# ────────────────────────────────────────────────────────────
# 8) 메인
# ────────────────────────────────────────────────────────────
def process_query(user_query: str) -> Dict[str,Any]:
    """
    반환 형식:
    {
      "answer": "텍스트",
      "action": { "type":"NAVIGATE", "target":"suhang.html", "highlight": {"title":"...", "subject":"수학"} }  # 선택
    }
    """
    norm = llm_normalize(user_query)
    ext  = llm_extract(norm, user_query)
    intents, subjects = ext.get("intents", []), ext.get("subjects", [])

    # 0) 내비게이션 의도 우선 캐치
    nav_target = detect_navigation_target(user_query)

    # 1) 일정(수행/과제/공지) 질의 처리
    parts = []
    if "task" in intents:
        ft = filter_subject(tasks, subjects) if subjects else sort_by_date(tasks)
        parts.append(format_schedule(ft, "📋 수행평가"))

    if "assignment" in intents:
        fa = filter_subject(assignments, subjects) if subjects else sort_by_date(assignments)
        # 이미 지난 과제 제거
        base = today()
        fa = [a for a in fa if (parse_iso_date(a.get('deadline') or a.get('due')) or base) >= base]
        parts.append(format_schedule(fa, "📝 과제"))

    if "notice" in intents:
        parts.append(format_schedule(notices, "📢 공지/행사"))

    # 2) 급식/시간표
    date_iso = korean_relative_to_date(user_query)
    d = parse_iso_date(date_iso) if date_iso else None
    if (("timetable" in intents) or ("lunch" in intents)) and not d:
        d = today()

    if "lunch" in intents and d:
        menu = lunch_by_date(d)
        parts.append("🍽️ " + (d.isoformat()) + "\n" + ("\n".join(f" · {m}" for m in menu) if menu else "급식 정보 없음"))
    if "timetable" in intents and d:
        arr = timetable_by_date(d)
        wd = "월화수목금토일"[d.weekday()]
        parts.append(f"📅 {d.isoformat()}({wd})\n" + (" → ".join(arr) if arr else "수업 없음"))

    # 3) 답변 조립 (없으면 안내)
    answer = "\n\n".join([p for p in parts if p]) if parts else "요청하신 내용을 찾지 못했어요. 예) '수학 수행', '정기고사 모범답 이동', '내일 급식'"

    # 4) 하이라이트 요청 파악
    want_highlight = any(k in user_query for k in HILITE_TRIGGERS) or ("이동" in user_query and ("수행" in user_query or subjects))
    highlight_title = extract_quoted(user_query) or pick_first_task_by_subject(subjects)

    # 5) 액션 생성
    action: Optional[Dict[str,Any]] = None
    if nav_target:
        action = {"type": "NAVIGATE", "target": nav_target}
        if nav_target == "suhang.html" and highlight_title:
            # 수행 목록에서 하이라이트 요청
            action["highlight"] = {"title": highlight_title}
            # subject 힌트가 있으면 같이 전달
            if subjects: action["highlight"]["subject"] = subjects[0]

    return {"answer": answer, "action": action}
