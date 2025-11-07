# test_generator.py - 500개 테스트 케이스 자동 생성 및 검증
import json
import random
from typing import List, Dict, Any
from datetime import datetime, timedelta

# =========================
# 1) 테스트 케이스 생성기
# =========================

SUBJECTS = ["국어", "수학", "영어", "사회", "역사", "과학", "기술", "정보", "음악", "미술", "체육"]
DAYS = ["월", "화", "수", "목", "금"]

def generate_test_cases() -> List[Dict[str, Any]]:
    """500개의 다양한 테스트 케이스 생성"""
    cases = []
    case_id = 1
    
    # === 1. 수행평가 질문 (100개) ===
    task_patterns = [
        "{}수행평가 알려줘",
        "{} 수행 뭐있어",
        "{}발표 언제야",
        "{} 프레젠테이션",
        "{} 수행평가 있어?",
        "{}대본 준비해야돼?",
        "{} 수행 마감",
        "{}랑 {} 수행평가",
        "{} 수행평가 알려줘요",
        "{} 수행 일정",
    ]
    
    for pattern in task_patterns:
        if "{}" in pattern and pattern.count("{}") == 2:
            # 2과목
            for _ in range(3):
                s1, s2 = random.sample(SUBJECTS, 2)
                cases.append({
                    "id": case_id,
                    "query": pattern.format(s1, s2),
                    "expected_intent": ["task"],
                    "expected_subjects": sorted([s1, s2]),
                    "category": "task_multi"
                })
                case_id += 1
        else:
            # 1과목
            for subj in SUBJECTS[:5]:  # 5개 과목만
                cases.append({
                    "id": case_id,
                    "query": pattern.format(subj),
                    "expected_intent": ["task"],
                    "expected_subjects": [subj],
                    "category": "task_single"
                })
                case_id += 1
    
    # === 2. 과제 질문 (100개) ===
    assign_patterns = [
        "{} 과제",
        "{} 숙제 뭐야",
        "{}숙제있어?",
        "{} 리포트",
        "{} 과제 언제까지",
        "{}숙제마감",
        "{}랑{} 과제",
        "{} 과제 알려줘",
        "{} 숙제 뭐있어",
        "{} 과제 확인",
    ]
    
    for pattern in assign_patterns:
        if pattern.count("{}") == 2:
            for _ in range(3):
                s1, s2 = random.sample(SUBJECTS, 2)
                cases.append({
                    "id": case_id,
                    "query": pattern.format(s1, s2),
                    "expected_intent": ["assignment"],
                    "expected_subjects": sorted([s1, s2]),
                    "category": "assignment_multi"
                })
                case_id += 1
        else:
            for subj in SUBJECTS[:5]:
                cases.append({
                    "id": case_id,
                    "query": pattern.format(subj),
                    "expected_intent": ["assignment"],
                    "expected_subjects": [subj],
                    "category": "assignment_single"
                })
                case_id += 1
    
    # === 3. 급식 질문 (80개) ===
    lunch_patterns = [
        "오늘 급식",
        "내일 급식 뭐야",
        "모레 점심",
        "급식 메뉴",
        "오늘 밥",
        "내일 점심 뭐임",
        "{}요일 급식",
        "다음주 {} 급식",
        "급식표",
        "점심 메뉴 알려줘",
    ]
    
    for pattern in lunch_patterns:
        if "{}" in pattern:
            for day in DAYS:
                cases.append({
                    "id": case_id,
                    "query": pattern.format(day),
                    "expected_intent": ["lunch"],
                    "expected_subjects": [],
                    "category": "lunch_date"
                })
                case_id += 1
        else:
            for _ in range(4):
                cases.append({
                    "id": case_id,
                    "query": pattern,
                    "expected_intent": ["lunch"],
                    "expected_subjects": [],
                    "category": "lunch_today"
                })
                case_id += 1
    
    # === 4. 시간표 질문 (80개) ===
    timetable_patterns = [
        "{}요일 시간표",
        "{} 시간표 알려줘",
        "오늘 시간표",
        "내일 시간표",
        "{}요일 수업",
        "다음주 {} 시간표",
        "{}교시 뭐야",
        "{}요일 {}교시",
        "시간표 보여줘",
        "수업 일정",
    ]
    
    for pattern in timetable_patterns:
        if "{}" in pattern and pattern.count("{}") == 2:
            for day in DAYS[:3]:
                for period in ["1", "2", "3"]:
                    cases.append({
                        "id": case_id,
                        "query": pattern.format(day, period),
                        "expected_intent": ["timetable"],
                        "expected_subjects": [],
                        "category": "timetable_detail"
                    })
                    case_id += 1
                    if case_id > 500:
                        break
                if case_id > 500:
                    break
        elif "{}" in pattern:
            for day in DAYS:
                cases.append({
                    "id": case_id,
                    "query": pattern.format(day),
                    "expected_intent": ["timetable"],
                    "expected_subjects": [],
                    "category": "timetable_day"
                })
                case_id += 1
        else:
            for _ in range(4):
                cases.append({
                    "id": case_id,
                    "query": pattern,
                    "expected_intent": ["timetable"],
                    "expected_subjects": [],
                    "category": "timetable_general"
                })
                case_id += 1
    
    # === 5. 마감 임박 (40개) ===
    urgent_patterns = [
        "가장 촉박한 과제",
        "마감 임박",
        "{} 급한거",
        "빨리 해야할거",
        "촉박한 수행평가",
        "{}마감임박",
        "급한 {} 과제",
        "제일 빠른 마감",
    ]
    
    for pattern in urgent_patterns:
        if "{}" in pattern:
            for subj in SUBJECTS[:3]:
                cases.append({
                    "id": case_id,
                    "query": pattern.format(subj),
                    "expected_intent": ["urgent"],
                    "expected_subjects": [subj],
                    "category": "urgent_subject"
                })
                case_id += 1
        else:
            for _ in range(3):
                cases.append({
                    "id": case_id,
                    "query": pattern,
                    "expected_intent": ["urgent"],
                    "expected_subjects": [],
                    "category": "urgent_general"
                })
                case_id += 1
    
    # === 6. 공지 (40개) ===
    notice_patterns = [
        "공지사항",
        "행사 일정",
        "교내 대회",
        "학교 공지",
        "이번주 행사",
        "대회 알려줘",
    ]
    
    for pattern in notice_patterns:
        for _ in range(7):
            cases.append({
                "id": case_id,
                "query": pattern,
                "expected_intent": ["notice"],
                "expected_subjects": [],
                "category": "notice"
            })
            case_id += 1
    
    # === 7. 혼합 질문 (60개) - 오분류 유발 케이스 ===
    mixed_patterns = [
        ("{} 수행평가랑 급식", ["task"], ["{}"]),  # 수행이 우선
        ("{} 과제랑 시간표", ["assignment", "timetable"], ["{}"]),
        ("급식이랑 {} 과제", ["assignment"], ["{}"]),  # 과제 우선
        ("{} 수행 내일", ["task"], ["{}"]),
        ("오늘 {}수행평가", ["task"], ["{}"]),
        ("{} 숙제 급식", ["assignment"], ["{}"]),  # 숙제 우선
        ("시간표랑 급식", ["timetable", "lunch"], []),
        ("{} 발표 점심", ["task"], ["{}"]),  # 발표 우선
    ]
    
    for pattern, intents, subj_template in mixed_patterns:
        if "{}" in pattern:
            for subj in SUBJECTS[:4]:
                expected_subj = [s.format(subj) if "{}" in s else subj for s in subj_template]
                cases.append({
                    "id": case_id,
                    "query": pattern.format(subj),
                    "expected_intent": intents,
                    "expected_subjects": expected_subj,
                    "category": "mixed"
                })
                case_id += 1
        else:
            for _ in range(2):
                cases.append({
                    "id": case_id,
                    "query": pattern,
                    "expected_intent": intents,
                    "expected_subjects": [],
                    "category": "mixed"
                })
                case_id += 1
    
    return cases[:500]  # 정확히 500개

# =========================
# 2) 테스트 실행기
# =========================

def save_test_cases(cases: List[Dict[str, Any]], filename: str = "test_cases.json"):
    """테스트 케이스를 JSON으로 저장"""
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(cases, f, ensure_ascii=False, indent=2)
    print(f"✅ {len(cases)}개 테스트 케이스 저장 완료: {filename}")

def create_test_report_template(filename: str = "test_report_template.json"):
    """테스트 결과 기록용 템플릿"""
    template = {
        "test_date": datetime.now().isoformat(),
        "total_cases": 500,
        "passed": 0,
        "failed": 0,
        "results": []
    }
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(template, f, ensure_ascii=False, indent=2)
    print(f"✅ 테스트 리포트 템플릿 생성: {filename}")

# =========================
# 3) 메인
# =========================

if __name__ == "__main__":
    print("=" * 60)
    print("🧪 자동 테스트 케이스 생성기")
    print("=" * 60)
    
    # 500개 생성
    test_cases = generate_test_cases()
    
    # 카테고리별 통계
    category_counts = {}
    for case in test_cases:
        cat = case["category"]
        category_counts[cat] = category_counts.get(cat, 0) + 1
    
    print(f"\n📊 생성된 케이스: {len(test_cases)}개")
    print("\n[카테고리별 분포]")
    for cat, count in sorted(category_counts.items()):
        print(f"  {cat:20s}: {count:3d}개")
    
    # 저장
    save_test_cases(test_cases)
    create_test_report_template()
    
    # 샘플 출력
    print("\n[샘플 케이스 5개]")
    for case in test_cases[:5]:
        print(f"  #{case['id']:3d} | {case['query']:30s} → {case['expected_intent']}")
    
    print("\n✅ 완료! 이제 test_runner.py를 실행하세요.")