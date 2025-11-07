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
