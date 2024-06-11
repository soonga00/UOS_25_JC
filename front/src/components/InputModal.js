import React, { useState } from 'react';
import Modal from './Modal';

const InputModal = ({ isVisible, onClose, onConfirm }) => {
  const [inputValue, setInputValue] = useState('');

  const handleConfirm = () => {
    onConfirm(inputValue);
    setInputValue('');
  };

  return (
    <Modal isVisible={isVisible} onClose={onClose}>
      <div className="p-4">
        <h2 className="text-center text-xl font-bold text-uosBlue mb-4">유지비 입력</h2>
        <input
          type="number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="유지비 금액을 입력하세요"
          className="border p-2 rounded w-full mb-4"
        />
        <div className="flex justify-center">
          <button onClick={handleConfirm} className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 mr-2">확인</button>
          <button onClick={onClose} className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600">취소</button>
        </div>
      </div>
    </Modal>
  );
};

export default InputModal;
