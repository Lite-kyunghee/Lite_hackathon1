from flask import Flask, request, jsonify
from flask_cors import CORS
import random, json, os

app = Flask(__name__)
CORS(app)

ANSWER_FILE = "answers.json"

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

@app.route("/grade", methods=["POST"])
def grade():
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

if __name__ == "__main__":
    app.run(debug=True)
