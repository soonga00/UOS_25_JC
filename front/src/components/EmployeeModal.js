import React, { useState, useEffect } from 'react';

const EmployeeModal = ({ type, closeModal, addEmployee, editEmployee, selectedEmployee }) => {
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [joinDate, setJoinDate] = useState('');
  const [telNo, setTelNo] = useState('');
  const [addr, setAddr] = useState('');
  const [sid, setSid] = useState('');
  const [bankNm, setBankNm] = useState('');
  const [acctNo, setAcctNo] = useState('');

  useEffect(() => {
    if (type === 'edit' && selectedEmployee) {
      setName(selectedEmployee.nm);
      setPosition(selectedEmployee.rank);
      setJoinDate(new Date(selectedEmployee.join_date).toISOString().split('T')[0]);
      setTelNo(selectedEmployee.tel_no);
      setAddr(selectedEmployee.addr);
      setBankNm(selectedEmployee.bank_nm);
      setAcctNo(selectedEmployee.acct_no);
    }
  }, [type, selectedEmployee]);

  const handleAdd = () => {
    const newEmployee = {
      nm: name,
      rank: position,
      join_date: joinDate,
      tel_no: telNo,
      sid: sid,
      addr: addr,
      bank_nm: bankNm,
      acct_no: acctNo,
    };
    addEmployee(newEmployee);
  };

  const handleEdit = () => {
    const updatedEmployee = {
      emp_no: selectedEmployee.emp_no,
      nm: name,
      rank: position,
      join_date: joinDate,
      tel_no: telNo,
      addr: addr,
      bank_nm: bankNm,
      acct_no: acctNo,
    };
    editEmployee(updatedEmployee);
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded shadow-lg w-1/3">
        <h2 className="text-xl font-bold mb-2">{type === 'add' ? '직원 등록' : '직원 수정'}</h2>
        <div className="mb-2">
          <label className="block text-gray-700 mb-2" htmlFor="name">이름</label>
          <input
            id="name"
            type="text"
            placeholder="이름"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-2">
          <label className="block text-gray-700 mb-2" htmlFor="position">직위</label>
          <input
            id="position"
            type="text"
            placeholder="직위"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-2">
          <label className="block text-gray-700 mb-2" htmlFor="joinDate">입사일</label>
          <input
            id="joinDate"
            type="date"
            placeholder="입사일"
            value={joinDate}
            onChange={(e) => setJoinDate(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-2">
          <label className="block text-gray-700 mb-2" htmlFor="telNo">전화번호</label>
          <input
            id="telNo"
            type="text"
            placeholder="전화번호"
            value={telNo}
            onChange={(e) => setTelNo(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-2">
          <label className="block text-gray-700 mb-2" htmlFor="addr">주소</label>
          <input
            id="addr"
            type="text"
            placeholder="주소"
            value={addr}
            onChange={(e) => setAddr(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        {type === 'add' && (
          <div className="mb-2">
            <label className="block text-gray-700 mb-2" htmlFor="sid">주민등록번호</label>
            <input
              id="sid"
              type="text"
              placeholder="주민등록번호"
              value={sid}
              onChange={(e) => setSid(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
        )}
        <div className="mb-2">
          <label className="block text-gray-700 mb-2" htmlFor="bankNm">은행명</label>
          <input
            id="bankNm"
            type="text"
            placeholder="은행명"
            value={bankNm}
            onChange={(e) => setBankNm(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-2">
          <label className="block text-gray-700 mb-2" htmlFor="acctNo">계좌번호</label>
          <input
            id="acctNo"
            type="text"
            placeholder="계좌번호"
            value={acctNo}
            onChange={(e) => setAcctNo(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <button
          className="bg-blue-500 text-white py-2 px-4 rounded mr-2 hover:bg-blue-600"
          onClick={type === 'add' ? handleAdd : handleEdit}
        >
          {type === 'add' ? '등록' : '수정'}
        </button>
        <button className="bg-gray-300 text-black py-2 px-4 rounded hover:bg-gray-400" onClick={closeModal}>
          취소
        </button>
      </div>
    </div>
  );
};

export default EmployeeModal;
