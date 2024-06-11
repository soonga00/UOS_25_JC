import React, { useState } from 'react';

const ReturnModal = ({ rule, onClose, onConfirm }) => {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    onConfirm(reason);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-center">반품 규정</h2>
        <p className="mb-4">{rule}</p>
        <textarea 
          className="w-full mb-4 p-2 border rounded"
          placeholder="반품 사유를 입력하세요"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <p className="mb-4 text-center text-pretty font-bold">반품하시겠습니까?</p>
        <div className="flex justify-center">
          <button onClick={handleConfirm} className="bg-red-500 text-white py-2 px-4 rounded mr-1">확인</button>
          <button onClick={onClose} className="bg-gray-500 text-white py-2 px-4 rounded ml-1">취소</button>
        </div>
      </div>
    </div>
  );
};

export default ReturnModal;
