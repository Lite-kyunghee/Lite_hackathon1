// App.js
import React, { useState } from 'react';
import axios from 'axios';

function App() {
  // 로그인 관련 상태
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  // 과제 생성 관련 상태
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);

  const apiBase = 'http://localhost:5000/api';

  // --------------------------
  // 로그인 요청
  // --------------------------
  const handleLogin = async () => {
    try {
      const res = await axios.post(`${apiBase}/login`, { username: email });
      const newToken = res.data.access_token;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      alert('로그인 성공!');
    } catch (err) {
      console.error(err);
      alert('로그인 실패');
    }
  };

  // --------------------------
  // 과제 생성 요청 (파일 포함)
  // --------------------------
  const handleCreateAssignment = async () => {
    if (!token) {
      alert('로그인 후 이용하세요.');
      return;
    }
    if (!title) {
      alert('제목을 입력하세요.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', title);
      if (file) formData.append('file', file);

      const res = await axios.post(`${apiBase}/assignments`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('과제 생성 성공! ID: ' + res.data.id);
    } catch (err) {
      console.error(err);
      alert('과제 생성 실패: ' + (err.response?.data?.msg || err.message));
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
      <h2>Flask 연동 테스트</h2>

      {!token ? (
        <div>
          <input
            type="text"
            placeholder="아이디 (username)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <br />
          <button onClick={handleLogin}>로그인</button>
        </div>
      ) : (
        <div>
          <h3>과제 생성</h3>
          <input
            type="text"
            placeholder="과제 제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <br />
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <br />
          <button onClick={handleCreateAssignment}>과제 생성</button>
        </div>
      )}
    </div>
  );
}

export default App;
