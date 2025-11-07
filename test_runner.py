# test_runner.py — LLM 분석 + 엔진 출력만 기록하는 버전
import json
import random
from ai_engine import process_query, debug_analyze_query

# 테스트 케이스 로드
TEST_FILE = "test_cases.json"

with open(TEST_FILE, "r", encoding="utf-8") as f:
    cases = json.load(f)

# 30개 랜덤 선택
sample_cases = random.sample(cases, 30)

result = {
    "test_time": str(__import__("datetime").datetime.now()),
    "total": len(sample_cases),
    "results": []
}

# 각 질문 처리
for case in sample_cases:
    q = case["query"]

    # 분석 결과 (LLM normalize + extract)
    analysis = debug_analyze_query(q)

    # 실제 엔진 출력
    out = process_query(q)

    result["results"].append({
        "id": case["id"],
        "query": q,
        "analysis": analysis,
        "engine_output": out
    })

# JSON 기록
with open("test_result.json", "w", encoding="utf-8") as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

print("✅ 테스트 완료 → test_result.json 생성됨")
print("✅ 샘플 두 개 출력:")

for r in result["results"][:2]:
    print("\n──────────────")
    print(f"Query: {r['query']}")
    print(f"Output: {r['engine_output'][:150]}...")
