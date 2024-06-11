import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/UOS25_logo.png';

const Login = () => {
  const [branch_id, setBranchId] = useState('');
  const [branch_pw, setBranchPw] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://127.0.0.1:5000/login', {
        branch_id,
        branch_pw
      });
      const token = response.data.access_token;
      if (token) {
        console.log(token)
        localStorage.setItem('token', token); // 토큰을 로컬 스토리지에 저장
        navigate('/main');
      } else {
        console.error('No token received');
        alert('로그인에 실패했습니다.');
      }
      navigate('/main');
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen w-96">
      <div className="bg-white p-10 rounded-lg shadow-lg w-full">
        <img src={logo} alt="UOS25 Logo" className="w-40 mx-auto mb-6" />
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label htmlFor="branch_id" className="block text-blue-500 mb-2">아이디</label>
            <input
              type="text"
              id="branch_id"
              name="branch_id"
              value={branch_id}
              onChange={(e) => setBranchId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="branch_pw" className="block text-blue-500 mb-2">비밀번호</label>
            <input
              type="password"
              id="branch_pw"
              name="branch_pw"
              value={branch_pw}
              onChange={(e) => setBranchPw(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <button type="submit" className="w-full bg-teal-500 text-white py-2 rounded hover:bg-teal-600">로그인</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
