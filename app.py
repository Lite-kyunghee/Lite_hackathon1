from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app)

# ------------------------------
# 예시 데이터 (모의고사 / 정기고사 날짜)
# ------------------------------
mock_tests = {
    "9월": "2025-09-04",
    "10월": "2025-10-31"
}

regular_tests = {
    "1학기 중간": "2025-05-01",
    "1학기 기말": "2025-07-01",
    "2학기 중간": "2025-09-25",
    "2학기 기말": "2025-11-30"
}

student_scores = {}  # {username: {test_type: {subject: score}}}

# ------------------------------
# 날짜 검증 API
# ------------------------------
@app.route('/api/check-date', methods=['POST'])
def check_date():
    data = request.json
    test_type = data.get('type')  # mock / regular
    test_name = data.get('name')
    
    today = datetime.today().strftime("%Y-%m-%d")
    test_day = mock_tests.get(test_name) if test_type == 'mock' else regular_tests.get(test_name)
    
    if not test_day:
        return jsonify({"ok": False, "msg": "시험 정보를 찾을 수 없습니다."})
    
    if today < test_day:
        return jsonify({"ok": False, "msg": f"{test_name} 가채점 시간 전입니다."})
    elif today > test_day:
        return jsonify({"ok": True, "msg": f"{test_name} 가채점이 가능합니다."})
    else:
        return jsonify({"ok": True, "msg": f"{test_name} 당일입니다. 가채점 가능합니다."})

# ------------------------------
# 점수 제출 및 저장
# ------------------------------
@app.route('/api/submit-score', methods=['POST'])
def submit_score():
    data = request.json
    username = data['username']
    test_type = data['type']
    test_name = data['name']
    subject = data['subject']
    score = int(data['score'])
    
    student_scores.setdefault(username, {}).setdefault(test_name, {})[subject] = score
    return jsonify({"msg": "점수 저장 완료", "data": student_scores[username]})

# ------------------------------
# 예상 등급 계산 (단순 평균 기반 예시)
# ------------------------------
@app.route('/api/predict-grade', methods=['POST'])
def predict_grade():
    data = request.json
    scores = data['scores']
    avg = sum(scores) / len(scores)
    
    if avg >= 90: grade = 1
    elif avg >= 80: grade = 2
    elif avg >= 70: grade = 3
    elif avg >= 60: grade = 4
    elif avg >= 50: grade = 5
    else: grade = 6
    
    return jsonify({"average": avg, "predicted_grade": grade})

if __name__ == '__main__':
    app.run(debug=True)
