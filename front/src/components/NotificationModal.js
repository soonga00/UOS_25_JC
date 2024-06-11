import React from 'react';
import Modal from './Modal';

const NotificationModal = ({ isVisible, onClose, message }) => {
  return (
    <Modal isVisible={isVisible} onClose={onClose}>
      <div className="p-4">
        <h2 className="text-center text-xl font-bold text-uosBlue mb-4">알림</h2>
        <p className="text-center mb-6">{message}</p>
        <div className="flex justify-center">
          <button onClick={onClose} className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">확인</button>
        </div>
      </div>
    </Modal>
  );
};

export default NotificationModal;
