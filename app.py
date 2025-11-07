# app.py
from flask import Flask, jsonify, render_template
from crawler.suhang_crawler import get_suhang_data

app = Flask(__name__)

@app.route("/")
def home():
    """기본 페이지"""
    return render_template("suhang.html")

@app.route("/api/suhang")
def suhang_api():
    """리로스쿨에서 수행평가 데이터를 불러와 JSON으로 반환"""
    data = get_suhang_data()
    return jsonify(data)

if __name__ == "__main__":
    app.run(debug=True)
