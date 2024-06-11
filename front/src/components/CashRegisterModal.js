// components/CashRegisterModal.js
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import axios from 'axios';

const CashRegisterModal = ({ isVisible, onClose }) => {
  const [currentCashRegister, setCurrentCashRegister] = useState(0);
  const [newCashRegister, setNewCashRegister] = useState('');

  useEffect(() => {
    const fetchCurrentCashRegister = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://127.0.0.1:5000/sales/current-cash', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCurrentCashRegister(response.data.current_cash_register);
      } catch (error) {
        console.error('Failed to fetch current cash register:', error);
      }
    };

    if (isVisible) {
      fetchCurrentCashRegister();
    }
  }, [isVisible]);

  const handleUpdateCashRegister = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://127.0.0.1:5000/sales/update', 
        { now_cash_amt: newCashRegister },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 200) {
        alert(response.data.msg);
        onClose();
      }
    } catch (error) {
      console.error('Failed to update cash register:', error);
      alert('현금 시제를 업데이트하는 데 실패했습니다.');
    }
  };

  return (
    <Modal isVisible={isVisible} onClose={onClose}>
      <div className="p-4">
        <h2 className="text-center text-xl font-bold mb-4">현금 시제</h2>
        <div className="mb-4">
          <p className="text-center">현재 현금 시제: {currentCashRegister} 원</p>
        </div>
        <div className="mb-4">
          <input
            type="number"
            value={newCashRegister}
            onChange={(e) => setNewCashRegister(e.target.value)}
            className="border p-2 w-full"
            placeholder="새로운 현금 시제 입력"
          />
        </div>
        <div className="flex justify-center">
          <button
            onClick={handleUpdateCashRegister}
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 mr-2"
          >
            업데이트
          </button>
          <button
            onClick={onClose}
            className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
          >
            취소
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default CashRegisterModal;
