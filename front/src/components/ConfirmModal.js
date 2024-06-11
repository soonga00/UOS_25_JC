import React from 'react';

const ConfirmModal = ({ closeConfirmModal, confirmAction }) => {
  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded shadow-lg w-1/3 text-center">
        <h2 className="text-xl font-bold mb-6">정말 삭제하시겠습니까?</h2>
        <div className="flex justify-center">
          <button
            className="bg-red-500 text-white py-2 px-4 rounded mr-2 hover:bg-red-600"
            onClick={confirmAction}
          >
            삭제
          </button>
          <button className="bg-gray-300 text-black py-2 px-4 rounded hover:bg-gray-400" onClick={closeConfirmModal}>
            취소
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
