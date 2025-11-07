# app.py — Flask 라우팅 + 액션 패스스루
from flask import Flask, request, jsonify, render_template
from ai_engine import process_query

app = Flask(__name__, template_folder="templates", static_folder="static")

@app.route("/")
def home():
    return render_template("lite_hackathon.html")

@app.route("/ask", methods=["POST"])
def ask():
    try:
        q = (request.json or {}).get("query","").strip()
        if not q:
            return jsonify({"answer": "질문을 입력해 주세요."})
        out = process_query(q)  # {"answer": ..., "action": {...}?}
        # 항상 JSON object 반환
        if isinstance(out, dict):
            return jsonify(out)
        return jsonify({"answer": str(out)})
    except Exception as e:
        return jsonify({"answer": f"오류가 발생했습니다: {e}"}), 500
    

@app.post("/api/chat")
def chat():
    data = request.get_json()
    user_q = data.get("query", "")
    print("응답값",user_q)
    answer = process_query(user_q)
    print("응답값",answer)
    return jsonify({"answer": answer})


if __name__ == "__main__":
    app.run(debug=True)
