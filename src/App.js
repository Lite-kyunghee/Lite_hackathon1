import React, { useState } from "react";
import axios from "axios";

function App() {
  const [type, setType] = useState(""); // mock / regular
  const [testName, setTestName] = useState("");
  const [subject, setSubject] = useState("");
  const [score, setScore] = useState("");
  const [message, setMessage] = useState("");
  const [predicted, setPredicted] = useState(null);

  const api = "http://localhost:5000/api";

  const testOptions = {
    mock: ["9월", "10월"],
    regular: ["1학기 중간", "1학기 기말", "2학기 중간", "2학기 기말"],
  };

  const subjects = ["국어", "수학", "영어", "탐구"];

  // 날짜 체크
  const handleCheckDate = async () => {
    const res = await axios.post(`${api}/check-date`, { type, name: testName });
    setMessage(res.data.msg);
  };

  // 점수 제출
  const handleSubmit = async () => {
    await axios.post(`${api}/submit-score`, {
      username: "student1",
      type,
      name: testName,
      subject,
      score,
    });
    setMessage(`${subject} 점수 ${score}점 저장 완료`);
  };

  // 예상 등급 계산
  const handlePredict = async () => {
    const scores = [92, 85, 78, 83]; // 실제로는 사용자 입력 데이터 기반
    const res = await axios.post(`${api}/predict-grade`, { scores });
    setPredicted(res.data);
  };

  return (
    <div style={{ padding: "30px" }}>
      <h1>가채점 프로그램</h1>

      <div>
        <button onClick={() => setType("mock")}>모의고사</button>
        <button onClick={() => setType("regular")}>정기고사</button>
      </div>

      {type && (
        <div style={{ marginTop: "20px" }}>
          <h2>{type === "mock" ? "모의고사 선택" : "정기고사 선택"}</h2>
          <select onChange={(e) => setTestName(e.target.value)}>
            <option value="">선택</option>
            {testOptions[type].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <button onClick={handleCheckDate}>입장</button>
        </div>
      )}

      {message && <p>{message}</p>}

      {testName && (
        <div>
          <h3>과목별 가채점</h3>
          <select onChange={(e) => setSubject(e.target.value)}>
            <option value="">과목 선택</option>
            {subjects.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <input
            type="number"
            placeholder="점수 입력"
            value={score}
            onChange={(e) => setScore(e.target.value)}
          />
          <button onClick={handleSubmit}>제출</button>
          <button onClick={handlePredict}>예상 등급 보기</button>
        </div>
      )}

      {predicted && (
        <div style={{ marginTop: "20px" }}>
          <h3>📊 결과</h3>
          <p>평균 점수: {predicted.average.toFixed(2)}점</p>
          <p>예상 등급: {predicted.predicted_grade}등급</p>
        </div>
      )}
    </div>
  );
}

export default App;
