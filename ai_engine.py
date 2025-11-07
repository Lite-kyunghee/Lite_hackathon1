# ai_engine.py — FINAL HARDENED (Groq)
# - normalize/extract: JSON 강제 + 다중 재시도 + 검증/강제보정
# - 날짜 계산: 파이썬만 (어제/내일/모레/내일모레/요일/다음주 요일 모두 처리)
# - 급식↔학업 충돌 차단, 과목 필터는 subject 완전일치만
# - urgent: 행사(notice) 포함, "가장 근접한 숙제/행사/리포트" 정확 처리
# - timetable/lunch는 요청된 것만 출력 (끼워넣기 금지)

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
# 1) 데이터
# ────────────────────────────────────────────────────────────
DATA_DIR = "data"
def _load(name: str):
    p = os.path.join(DATA_DIR, name)
    try:
        with open(p, "r", encoding="utf-8") as f:
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

# ────────────────────────────────────────────────────────────
# 2) 유틸
# ────────────────────────────────────────────────────────────
def today() -> datetime.date:
    # 서버 타임존 기준; KST 고정이 필요하면 zoneinfo 사용 권장
    return datetime.date.today()

def parse_iso_date(s: Optional[str]) -> Optional[datetime.date]:
    if not s: return None
    try: return datetime.date.fromisoformat(s)
    except: return None

def normalize_text(s: Optional[str]) -> str:
    return s.replace("\u200b","").strip() if s else ""

def is_valid_iso_date(s: Optional[str]) -> bool:
    return parse_iso_date(s) is not None

def korean_relative_to_date(text: str) -> Optional[str]:
    """
    한국어 상대 날짜/요일 → ISO 날짜.
    우선순위: 내일모레/내일 모레/내일 모래 > 모레 > 내일 > 어제 > 오늘 > 요일 > 다음주 요일
    같은 요일 요청이면 '오늘'로 해석.
    """
    base = today()
    t = normalize_text(text).lower()

    # 내일모레 변형들 최우선
    if ("내일모레" in t) or ("내일 모레" in t) or ("내일 모래" in t):
        return (base + datetime.timedelta(days=2)).isoformat()

    if "모레" in t:
        return (base + datetime.timedelta(days=2)).isoformat()
    if "내일" in t:
        return (base + datetime.timedelta(days=1)).isoformat()
    if "어제" in t:
        return (base - datetime.timedelta(days=1)).isoformat()
    if "오늘" in t:
        return base.isoformat()

    # 요일 (같은 요일이면 오늘)
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
# 3) Groq 호출
# ────────────────────────────────────────────────────────────
def _groq_chat(model: str, messages: List[Dict[str,str]], max_tokens: int = 300) -> str:
    r = requests.post(
        GROQ_URL, headers=HEADERS,
        json={"model": model, "messages": messages, "max_tokens": max_tokens},
        timeout=20
    )
    r.raise_for_status()
    return r.json()["choices"][0]["message"]["content"]

# ────────────────────────────────────────────────────────────
# 4) normalize (JSON 강제)
# ────────────────────────────────────────────────────────────
SYS_NORMALIZE = """너는 학생 입력을 표준 한국어로 보정한다.
- 오타/띄어쓰기/초성만 수정, 의미 변경 절대 금지
- 특히 날짜 표현(“내일모레”/“내일 모레”/“내일 모래”/“모레”/“내일”/“어제”)은 원형 유지. 다른 표현으로 바꾸지 마라.
- '행사/공지/안내/숙제/리포트/보고서' 같은 키워드는 원형 유지.

반드시 JSON만 출력:
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
# 5) extract (JSON 강제 + 검증 + 강제보정)
# ────────────────────────────────────────────────────────────
def _build_extract_prompt(today_str: str) -> str:
    return f"""너는 질문을 엄격히 분류한다. 날짜 계산은 절대 하지 마라(파이썬이 함).

카테고리(이것만):
- task            (수행/발표/대본/프레젠테이션)
- assignment      (과제/숙제/리포트/보고서)
- urgent          (가장 근접/가장 촉박/임박/급한)
- timetable       (시간표/교시/요일)
- lunch           (급식/점심/메뉴/밥) — 학업 키워드와 섞이면 금지
- notice          (행사/공지/안내/이벤트)
- none

강제 규칙:
- "숙제","과제","리포트","보고서" → assignment 100%
- "수행","발표","대본","프레젠" → task 100%
- "행사","공지","안내","이벤트" → notice 100%
- "가장 근접","가장 촉박","임박","급한" → urgent 100%
- "시간표","교시","요일" → timetable 100%
- "급식","점심","메뉴","밥"만 '단독'이면 lunch 100% (학업 키워드와 섞이면 lunch 금지)

주의:
- "오늘/내일/모레/내일모레/어제/요일"은 계산하지 말고 date=null로 둔다.
- 과목은 아래 리스트에서만 선택:
{json.dumps(SUBJECTS, ensure_ascii=False)}

출력(JSON만):
{{
  "intents": [...],
  "subjects": [...],
  "date": null,
  "reasoning": "한 줄"
}}"""

def _validate_extract(obj: Dict[str,Any], original_query: str) -> Tuple[bool,str]:
    if not isinstance(obj, dict):
        return False, "JSON 아님"
    ints = obj.get("intents", [])
    subs = obj.get("subjects", [])
    if not isinstance(ints, list) or not ints:
        return False, "intents 비정상"
    if not isinstance(subs, list):
        return False, "subjects 비정상"
    for it in ints:
        if it not in INTENT_WHITELIST:
            return False, f"허용되지 않은 intent: {it}"
    for s in subs:
        if s not in SUBJECTS:
            return False, f"허용되지 않은 과목: {s}"

    # 급식-학업 충돌 차단
    q = original_query.lower()
    academic = ["수행","과제","숙제","발표","프레젠","대본","리포트","보고서"]
    if "lunch" in ints and any(k in q for k in academic):
        return False, "학업 키워드와 lunch 동시 금지"
    if "lunch" in ints and not any(k in q for k in ["급식","점심","메뉴","밥"]):
        return False, "급식 키워드 없음"
    # 행사/공지 키워드가 있는데 notice 빠졌으면 실패 (추가보정 유도)
    if any(k in q for k in ["행사","공지","안내","이벤트"]) and "notice" not in ints:
        return False, "행사/공지인데 notice 누락"
    # 숙제/리포트/보고서 있는데 assignment 빠졌으면 실패
    if any(k in q for k in ["숙제","리포트","보고서"]) and "assignment" not in ints:
        return False, "숙제/리포트인데 assignment 누락"
    return True, "OK"

def _force_fix_intents(q: str, intents: List[str], subs: List[str]) -> Tuple[List[str], List[str]]:
    q = normalize_text(q).lower()
    out = set(intents); sset = set(subs)
    # 강제 매핑
    if any(k in q for k in ["숙제","과제","리포트","보고서"]):
        out.add("assignment"); out.discard("lunch")
    if any(k in q for k in ["수행","발표","대본","프레젠"]):
        out.add("task"); out.discard("lunch")
    if any(k in q for k in ["가장 근접","가장 촉박","임박","급한","근접","촉박"]):
        out.add("urgent")
    if any(k in q for k in ["시간표","교시","요일"]):
        out.add("timetable")
    if any(k in q for k in ["행사","공지","안내","이벤트"]):
        out.add("notice")
    # lunch 단독 조건
    if (any(k in q for k in ["급식","점심","메뉴","밥"]) and
        not any(k in q for k in ["수행","과제","숙제","발표","프레젠","대본","리포트","보고서"])):
        out.add("lunch")
    else:
        out.discard("lunch")
    # 과목
    for s in SUBJECTS:
        if s in q: sset.add(s)
    if "none" in out and len(out) > 1:
        out.discard("none")
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
            ok, _ = _validate_extract(obj, original_q)
            if not ok:
                fi, fs = _force_fix_intents(original_q, obj.get("intents",[]), obj.get("subjects",[]))
                obj["intents"], obj["subjects"] = fi, fs
                ok2, _ = _validate_extract(obj, original_q)
                if ok2: return obj
                else: continue
            # 추가 강제보정 1회
            fi, fs = _force_fix_intents(original_q, obj.get("intents",[]), obj.get("subjects",[]))
            obj["intents"], obj["subjects"] = fi, fs
            ok3, _ = _validate_extract(obj, original_q)
            if ok3: return obj
        except: pass
    # 폴백
    fi, fs = _force_fix_intents(original_q, [], [])
    return {"intents": fi or ["none"], "subjects": fs, "date": korean_relative_to_date(original_q)}

# ────────────────────────────────────────────────────────────
# 6) 도메인 로직
# ────────────────────────────────────────────────────────────
def timetable_by_date(d: datetime.date) -> List[str]:
    wd = d.weekday()
    if 0 <= wd <= 4:
        return timetable.get(WEEK_KEYS[wd], []) if isinstance(timetable, dict) else []
    return []

def lunch_by_date(d: datetime.date) -> List[str]:
    return lunch.get(d.isoformat(), []) if isinstance(lunch, dict) else []

# 과목 필터: subject 완전일치만 허용 (title 등 검색 금지)
def filter_subject(items: List[Dict[str,Any]], subjects: List[str]) -> List[Dict[str,Any]]:
    if not isinstance(items, list) or not subjects: return []
    want = set(subjects)
    return [it for it in items if it.get("subject") in want]

def sort_by_date(items: List[Dict[str,Any]]) -> List[Dict[str,Any]]:
    def k(x):
        d = parse_iso_date(x.get("deadline") or x.get("due") or x.get("date"))
        return d if d else datetime.date.max
    return sorted(items, key=k)

def urgent_pick(intents: List[str], subjects: List[str]) -> Optional[Tuple[str, Dict[str,Any], datetime.date]]:
    """
    intents 힌트에 따라 카테고리 선택:
    - notice만: 공지/행사 중 최근
    - assignment만: 과제 중 최근
    - task만: 수행 중 최근
    - urgent만(단독): 수행/과제/공지 전체에서 최근
    - urgent + notice: notice만
    - urgent + assignment: assignment만
    - urgent + task: task만
    """
    base = today()
    pool: List[Tuple[str, Dict[str,Any], datetime.date]] = []

    want_notice     = "notice" in intents
    want_assignment = "assignment" in intents
    want_task       = "task" in intents

    # 선택 범위 결정
    allow_notice     = want_notice or (("urgent" in intents) and not (want_assignment or want_task))
    allow_assignment = want_assignment or (("urgent" in intents) and not (want_notice or want_task))
    allow_task       = want_task or (("urgent" in intents) and not (want_notice or want_assignment))

    # notice: subject 무시하고 포함
    if allow_notice and isinstance(notices, list):
        for n in notices:
            d = parse_iso_date(n.get("date"))
            if d and d >= base:
                pool.append(("공지", n, d))

    # assignment
    if allow_assignment and isinstance(assignments, list):
        for a in assignments:
            d = parse_iso_date(a.get("deadline") or a.get("due"))
            if d and d >= base and (not subjects or a.get("subject") in subjects):
                pool.append(("과제", a, d))

    # task
    if allow_task and isinstance(tasks, list):
        for t in tasks:
            d = parse_iso_date(t.get("deadline"))
            if d and d >= base and (not subjects or t.get("subject") in subjects):
                pool.append(("수행평가", t, d))

    if not pool: return None
    pool.sort(key=lambda x: x[2])
    return pool[0]

def fmt_tasks(items: List[Dict[str,Any]]) -> str:
    if not items: return ""
    items = sort_by_date(items)
    return "📋 수행평가 {n}건\n".replace("{n}", str(len(items))) + \
           "\n".join(f"- [{i.get('subject','-')}] {i.get('title','(제목없음)')} (마감: {i.get('deadline','-')})" for i in items)

def fmt_assign(items: List[Dict[str,Any]]) -> str:
    if not items: return ""
    items = sort_by_date(items)
    return "📝 과제 {n}건\n".replace("{n}", str(len(items))) + \
           "\n".join(f"- [{i.get('subject','-')}] {i.get('task') or i.get('title','(제목없음)')} (마감: {i.get('deadline') or i.get('due','-')})" for i in items)

def fmt_notice(items: List[Dict[str,Any]]) -> str:
    if not items: return ""
    items = sort_by_date(items)
    return "📢 공지/행사\n" + "\n".join(f"- {i.get('title','(제목없음)')} ({i.get('date','-')})" for i in items)

def fmt_lunch(d: datetime.date, menu: List[str]) -> str:
    if not menu: return f"🍽️ {d.isoformat()} 급식 정보 없음"
    return f"🍽️ {d.isoformat()} 급식\n" + "\n".join(f" · {m}" for m in menu)

def fmt_timetable(d: datetime.date, arr: List[str]) -> str:
    if not arr: return f"📅 {d.isoformat()} 수업 없음"
    wd = "월화수목금토일"[d.weekday()]
    return f"📅 {d.isoformat()}({wd}) 시간표\n" + " → ".join(arr)

# ────────────────────────────────────────────────────────────
# 7) 메인 엔진
# ────────────────────────────────────────────────────────────
def process_query(user_query: str) -> str:
    norm = llm_normalize(user_query)
    ext  = llm_extract(norm, user_query)

    intents  = ext.get("intents", [])
    subjects = ext.get("subjects", [])
    date_iso = ext.get("date")  # 보통 null, 실제 변환은 아래에서

    # 1) urgent 우선 처리 (카테고리별로 최적화)
    if "urgent" in intents:
        picked = urgent_pick(intents, subjects)
        if not picked:
            return "마감 임박 항목이 없습니다."
        kind, item, when = picked
        if kind == "공지":
            return f"⚠️ 가장 임박한 행사\n- {item.get('title','(제목없음)')} ({item.get('date','-')})"
        if kind == "과제":
            return f"⚠️ 마감 임박 숙제(과제)\n- [{item.get('subject','-')}] {item.get('task') or item.get('title','(제목없음)')} (마감: {item.get('deadline') or item.get('due','-')})"
        if kind == "수행평가":
            return f"⚠️ 마감 임박 수행평가\n- [{item.get('subject','-')}] {item.get('title','(제목없음)')} (마감: {item.get('deadline','-')})"

    # 2) 날짜 계산: 모델 금지 → 파이썬만
    d = parse_iso_date(date_iso) if date_iso else None
    if not d:
        d = parse_iso_date(korean_relative_to_date(user_query))
    # timetable/lunch 요청인데 날짜 없으면 오늘
    if (("timetable" in intents) or ("lunch" in intents)) and not d:
        d = today()

    parts: List[str] = []

    # 3) 도메인별 처리 (요청된 것만 출력)
    if "lunch" in intents and d:
        parts.append(fmt_lunch(d, lunch_by_date(d)))

    if "timetable" in intents and d:
        parts.append(fmt_timetable(d, timetable_by_date(d)))

    if "task" in intents:
        ft = filter_subject(tasks if isinstance(tasks, list) else [], subjects)
        if ft: parts.append(fmt_tasks(ft))
        elif subjects: parts.append(f"❌ {', '.join(subjects)} 수행평가 없음")

    if "assignment" in intents:
        fa = filter_subject(assignments if isinstance(assignments, list) else [], subjects)
        # 과거 과제 제거
        base = today()
        fa = [a for a in fa if (parse_iso_date(a.get('deadline') or a.get('due')) or base) >= base]
        if fa: parts.append(fmt_assign(fa))
        elif subjects: parts.append(f"❌ {', '.join(subjects)} 과제 없음")

    if "notice" in intents:
        parts.append(fmt_notice(notices if isinstance(notices, list) else []))

    if not parts:
        if subjects:
            return f"'{', '.join(subjects)}' 관련 정보가 없습니다.\n예: '영어 수행평가', '내일 급식', '수요일 시간표'"
        return "질문을 이해하지 못했습니다.\n예: '영어 수행평가', '내일 급식', '수요일 시간표'"

    return "\n\n".join(parts)
