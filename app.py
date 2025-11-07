from flask import Flask, send_from_directory, render_template_string, request, jsonify
from flask_socketio import SocketIO, emit
import smtplib
from email.mime.text import MIMEText

app = Flask(__name__)
socketio = SocketIO(app)

# =============================
# 📧 Gmail 전송 함수
# =============================
def send_email(to_address, content):
    sender_email = "your_email@gmail.com"         # ⚠️ 네 Gmail 주소
    sender_password = "your_app_password"         # ⚠️ 앱 비밀번호 (16자리)

    msg = MIMEText(content, _charset="utf-8")
    msg["Subject"] = "L.I.T.E 대화 내용 전송"
    msg["From"] = sender_email
    msg["To"] = to_address

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
            smtp.login(sender_email, sender_password)
            smtp.send_message(msg)
        print(f"📤 {to_address} 로 이메일 전송 완료")
        return True
    except Exception as e:
        print("⚠️ 이메일 전송 실패:", e)
        return False

# =============================
# 📄 HTML 렌더링
# =============================
@app.route("/")
def home():
    with open("lite_hackathon.html", encoding="utf-8") as f:
        html = f.read()
    return render_template_string(html)

# =============================
# 📁 정적 파일 서빙
# =============================
@app.route("/<path:filename>")
def serve_static(filename):
    return send_from_directory(".", filename)

# =============================
# 📩 Gmail 전송 API (JS fetch용)
# =============================
@app.route("/send_gmail", methods=["POST"])
def send_gmail():
    try:
        data = request.get_json(force=True)
        email = data.get("email")
        content = data.get("content")

        if not email or not content:
            return jsonify({"status": "error", "message": "이메일 주소 또는 내용이 없습니다."})

        ok = send_email(email, content)
        if ok:
            return jsonify({"status": "ok"})
        else:
            return jsonify({"status": "error", "message": "메일 전송 실패"})

    except Exception as e:
        print("❌ /send_gmail 처리 중 오류:", e)
        return jsonify({"status": "error", "message": str(e)})

# =============================
# 💬 실시간 채팅 (Socket.IO)
# =============================
chat_log = []

@socketio.on("message")
def handle_message(msg):
    print("Message:", msg)
    chat_log.append(msg)
    emit("message", msg, broadcast=True)

if __name__ == "__main__":
    socketio.run(app, debug=True)
