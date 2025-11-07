import React, { useState } from "react";
import axios from "axios";

function App() {
  const [step, setStep] = useState("exam"); 
  const [exam, setExam] = useState("");
  const [subject, setSubject] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);

  const apiBase = "http://localhost:5000/api";

  const loadSubjects = async (examName) => {
    const res = await axios.get(`${apiBase}/subjects/${examName}`);
    setSubjects(res.data);
    setStep("subject");
  };

  const startExam = (subj) => {
    setSubject(subj);
    const num = subj === "수학" ? 50 : subj === "국어" ? 45 : 25;
    setAnswers(new Array(num).fill(""));
    setStep("answer");
  };

  const submitAnswers = async () => {
    const res = await axios.post(`${apiBase}/grade`, {
      exam,
      subject,
      answers: answers.map(a => parseInt(a))
    });
    setResult(res.data);
    setStep("result");
  };

  if (step === "exam") {
    return (
      <div className="p-4">
        <h1>가채점 시스템</h1>
        <button onClick={() => { setExam("10월 모의고사"); loadSubjects("10월 모의고사"); }}>
          10월 모의고사
        </button>
        <button onClick={() => { setExam("2학기 중간고사"); loadSubjects("2학기 중간고사"); }}>
          2학기 중간고사
        </button>
      </div>
    );
  }

  if (step === "subject") {
    return (
      <div className="p-4">
        <h2>{exam} - 과목 선택</h2>
        {subjects.map(s => (
          <button key={s} onClick={() => startExam(s)}>{s}</button>
        ))}
      </div>
    );
  }

  if (step === "answer") {
    return (
      <div className="p-4">
        <h2>{subject} 답안 입력</h2>
        {answers.map((a, i) => (
          <select key={i} value={a} onChange={e => {
            const copy = [...answers];
            copy[i] = e.target.value;
            setAnswers(copy);
          }}>
            <option value="">-</option>
            {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        ))}
        <button onClick={submitAnswers}>가채점하기</button>
      </div>
    );
  }

  if (step === "result") {
    return (
      <div className="p-4">
        <h2>{subject} 결과</h2>
        <p>점수: {result.score} / {result.total}</p>
        <p>백분율: {result.percent}%</p>
        <p>예상 등급: {result.grade}등급</p>
        <button onClick={() => setStep("exam")}>처음으로</button>
      </div>
    );
  }

  return null;
}

export default App;
