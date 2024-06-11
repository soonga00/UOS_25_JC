import React, { useState } from 'react';
import Modal from './Modal';

const LossModal = ({ isVisible, onClose, onSubmit, product }) => {
  const [actualQty, setActualQty] = useState('');
  const [arrangementQty, setArrangementQty] = useState('');
  const [lossCause, setLossCause] = useState('');

  const handleConfirmLoss = () => {
    onSubmit({
      item_no: product.item_no,
      exp_date: product.exp_date,
      actual_qty: parseInt(actualQty, 10),  // 정수로 변환
      arrangement_qty: parseInt(arrangementQty, 10),  // 정수로 변환
      loss_cause: lossCause
    });
  };

  if (!isVisible) return null;

  return (
    <Modal isVisible={isVisible} onClose={onClose}>
      <div className="p-4">
        <h2 className="text-center text-xl font-bold text-uosBlue mb-4">손실 등록</h2>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">상품 번호</label>
          <input
            type="text"
            value={product.item_no}
            disabled
            className="w-full border border-gray-300 rounded p-2 mb-2"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">상품명</label>
          <input
            type="text"
            value={product.item_nm}
            disabled
            className="w-full border border-gray-300 rounded p-2 mb-2"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">유통기한</label>
          <input
            type="text"
            value={product.exp_date}
            disabled
            className="w-full border border-gray-300 rounded p-2 mb-2"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">실제 수량</label>
          <input
            type="number"
            value={actualQty}
            onChange={(e) => setActualQty(e.target.value)}
            className="w-full border border-gray-300 rounded p-2 mb-2"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">진열 수량</label>
          <input
            type="number"
            value={arrangementQty}
            onChange={(e) => setArrangementQty(e.target.value)}
            className="w-full border border-gray-300 rounded p-2 mb-2"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">손실 원인</label>
          <input
            type="text"
            value={lossCause}
            onChange={(e) => setLossCause(e.target.value)}
            className="w-full border border-gray-300 rounded p-2 mb-2"
          />
        </div>
        <div className="flex justify-center mt-4">
          <button
            onClick={handleConfirmLoss}
            className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 mr-2"
          >
            확인
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

export default LossModal;
