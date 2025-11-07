<<<<<<< HEAD
# app.py — Flask 라우팅 + 디버그 로그
from flask import Flask, request, jsonify, render_template
from ai_engine import process_query

app = Flask(__name__, template_folder="templates", static_folder="static")

@app.route("/")
def home():
    print("[DEBUG] / 호출됨")
    return render_template("index.html")

@app.route("/ask", methods=["POST"])
def ask():
    print("[DEBUG] /ask 호출됨")
    print("[DEBUG] request.json =", request.json)
    q = (request.json.get("query") or "").strip()
    if not q:
        return jsonify({"answer": "질문을 입력해 주세요."})
    try:
        print("[DEBUG] process_query 시작")
        out = process_query(q)
        return jsonify({"answer": out})
    except Exception as e:
        return jsonify({"answer": f"오류가 발생했습니다: {e}"}), 500

if __name__ == "__main__":
    print("[DEBUG] Flask 서버 시작")
    app.run(debug=True)
=======
from flask import Flask, jsonify, send_from_directory, request
import random, os

app = Flask(__name__, static_folder='.', static_url_path='')

# ======================
# 메인 페이지 라우팅
# ======================
@app.route('/')
def index():
    return send_from_directory('.', 'gache.html')

@app.route('/<path:path>')
def serve_static(path):
    """CSS, JS 등 정적 파일 제공"""
    return send_from_directory('.', path)

# ======================
# 채점 API
# ======================
@app.route('/api/grade', methods=['POST'])
def grade_exam():
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


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
>>>>>>> origin/final2
