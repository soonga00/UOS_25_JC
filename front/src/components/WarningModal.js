// components/WarningModal.js
import React from 'react';

const WarningModal = ({ isVisible, onClose, onConfirm }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-center">경고</h2>
        <p className="mb-4 text-center">구매를 포기하시겠습니까?</p>
        <div className="flex justify-center">
          <button onClick={onConfirm} className="bg-red-500 text-white py-2 px-4 rounded mr-2">확인</button>
          <button onClick={onClose} className="bg-gray-500 text-white py-2 px-4 rounded ml-2">취소</button>
        </div>
      </div>
    </div>
  );
};

export default WarningModal;
