import React from 'react';

const Modal = ({ isVisible, onClose, children }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-50 grayscale"></div>
      <div className="relative bg-white p-6 rounded shadow-lg z-10">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">
          &#x2715;
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
