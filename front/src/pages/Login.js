import React, { useState } from 'react';
import logo from '../assets/UOS25_logo.png';
import { useNavigate } from 'react-router';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    console.log(username, password);
    navigate('/main');
  };

  return (
    <div className="bg-white p-10 rounded-lg shadow-lg w-full max-w-md">
      <img src={logo} alt="UOS25 Logo" className="w-40 mx-auto mb-6" />
      <form onSubmit={handleLogin}>
        <div className="mb-4">
          <label htmlFor="username" className="block text-blue-500 mb-2">아이디</label>
          <input
            type="text"
            id="username"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block text-blue-500 mb-2">비밀번호</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <button type="submit" className="w-full bg-teal-500 text-white py-2 rounded hover:bg-teal-600">로그인</button>
      </form>
    </div>
  );
};

export default Login;
