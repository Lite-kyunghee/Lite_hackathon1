# app.py — Flask 서버 통합 버전
from flask import Flask, jsonify, send_from_directory, request
from flask_cors import CORS
import random, json, os

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)

ANSWER_FILE = "answers.json"

# ======================
# 모범답 관리
# ======================
def generate_answers():
    """국어 정기고사용 랜덤 모범답 생성"""
    data = {
        "korean_regular": {
            "multiple_choice": [random.randint(1, 5) for _ in range(30)],
            "essay": {1: "주제", 2: "인물", 3: "배경", 4: "표현"}
        }
    }
    with open(ANSWER_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    return data

def load_answers():
    """모범답 불러오기 (없으면 생성)"""
    if not os.path.exists(ANSWER_FILE):
        return generate_answers()
    with open(ANSWER_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

# ======================
# 메인 페이지 라우팅
# ======================
@app.route('/')
def index():
    """메인 HTML 페이지 반환"""
    return send_from_directory('.', 'gache.html')

@app.route('/<path:path>')
def serve_static(path):
    """CSS, JS 등 정적 파일 제공"""
    return send_from_directory('.', path)

# ======================
# 국어 정기고사 채점 API
# ======================
@app.route("/grade", methods=["POST"])
def grade():
    """모범답 파일 기반 국어 정기고사 채점"""
    data = load_answers()
    correct = data["korean_regular"]["multiple_choice"]
    user_answers = request.json.get("answers", [])
    essay_answers = request.json.get("essay_answers", {})

    score = 0
    detail = []

    for i in range(30):
        user = user_answers[i]
        correct_ans = correct[i]
        is_correct = (user == correct_ans)
        if is_correct:
            score += 2
        detail.append({
            "no": i + 1,
            "correct": correct_ans,
            "user": user,
            "result": "✅" if is_correct else "❌"
        })

    essay_detail = []
    for i in range(1, 5):
        essay_detail.append({
            "no": i,
            "expected": data["korean_regular"]["essay"][i],
            "user": essay_answers.get(str(i), ""),
            "result": "미채점"
        })

    return jsonify({
        "total_score": score,
        "multiple_choice": detail,
        "essay": essay_detail
    })

# ======================
# 일반 랜덤 채점 API (학년/과목별)
# ======================
@app.route('/api/grade', methods=['POST'])
def grade_exam():
    """일반 시험용 랜덤 채점 API"""
    try:
        data = request.get_json()
        grade = data.get('grade')
        exam_type = data.get('exam_type')
        subject = data.get('subject')
        answers = data.get('answers', [])

        # 랜덤 모범답 생성
        correct = [random.randint(1, 5) for _ in range(len(answers))]

        # 채점
        details = []
        correct_count = 0
        for i, (stu_ans, cor_ans) in enumerate(zip(answers, correct), start=1):
            is_correct = stu_ans == cor_ans
            if is_correct:
                correct_count += 1
            details.append({
                "number": i,
                "student": stu_ans,
                "correct": cor_ans,
                "is_correct": is_correct
            })

        percent = round(correct_count / len(answers) * 100, 1)
        result = {
            "ok": True,
            "grade": grade,
            "exam_type": exam_type,
            "subject": subject,
            "score": correct_count,
            "total": len(answers),
            "percent": percent,
            "details": details
        }
        return jsonify(result)
    except Exception as e:
        print("❌ 오류 발생:", e)
        return jsonify({"ok": False, "msg": "서버 처리 중 오류 발생"}), 500


# ======================
# 실행
# ======================
if __name__ == '__main__':
    print("[DEBUG] Flask 서버 시작")
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
