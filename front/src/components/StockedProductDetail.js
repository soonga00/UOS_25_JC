import React, { useState } from 'react';
import Modal from './Modal';
import NotificationModal from './NotificationModal';
import LossModal from './LossModal';

const StockedProductDetail = ({ product, handleDisplaySubmit, handleDeleteSubmit, handleLossSubmit, refreshStockList }) => {
  const [isNotificationVisible, setIsNotificationVisible] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [isDisplayModalVisible, setIsDisplayModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isLossModalVisible, setIsLossModalVisible] = useState(false);

  const [arrangementQty, setArrangementQty] = useState(0);

  const handleShowNotification = (message) => {
    setNotificationMessage(message);
    setIsNotificationVisible(true);
  };

  const handleDisplay = () => {
    if (!product) {
      handleShowNotification('상품을 선택해 주세요.');
      return;
    }
    setIsDisplayModalVisible(true);
  };

  const handleConfirmDisplay = async () => {
    await handleDisplaySubmit(arrangementQty);
    setIsDisplayModalVisible(false);
    refreshStockList();
  };

  const handleDelete = () => {
    if (!product) {
      handleShowNotification('상품을 선택해 주세요.');
      return;
    }
    setIsDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    await handleDeleteSubmit();
    setIsDeleteModalVisible(false);
    refreshStockList();
  };

  const handleLoss = () => {
    if (!product) {
      handleShowNotification('상품을 선택해 주세요.');
      return;
    }
    setIsLossModalVisible(true);
  };

  const handleConfirmLoss = async (lossData) => {
    await handleLossSubmit(lossData);
    setIsLossModalVisible(false);
    refreshStockList();
  };

  const handleModalClose = () => {
    setIsDisplayModalVisible(false);
    setIsDeleteModalVisible(false);
    setIsLossModalVisible(false);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="p-4 bg-white shadow-md rounded-lg flex flex-col items-center justify-between h-full min-h-[400px]">
      {product ? (
        <div className="flex-1 flex flex-col items-center h-70">
          {product.is_img ? (
            <img
              src={`data:image/jpeg;base64,${product.img}`}
              alt={product.item_nm}
              className="w-48 h-60 object-cover mb-4"
            />
          ) : (
            <div className="w-48 h-60 bg-gray-300 flex items-center justify-center mb-4">
              <span className="text-gray-500">이미지 없음</span>
            </div>
          )}
          <h2 className="text-2xl font-bold mb-2">{product.item_nm}</h2>
          <p className="mb-2 text-lg">상품 번호: {product.item_no}</p>
          <p className="mb-2 text-lg">총 수량: {product.total_qty}</p>
          <p className="mb-2 text-lg">진열 수량: {product.arrangement_qty}</p>
          <p className="mb-2 text-lg">유통기한: {formatDate(product.exp_date)}</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center">
          <p className="text-gray-500">선택된 상품이 없습니다.</p>
        </div>
      )}
      <div className="w-full flex flex-col justify-end mb-16">
        <button onClick={handleDisplay} className={`w-full py-2 bg-blue-500 text-white rounded-lg mt-4`} disabled={!product}>
          상품 진열
        </button>
        <button onClick={handleDelete} className={`w-full py-2 bg-yellow-500 text-white rounded-lg mt-2`} disabled={!product}>
          상품 폐기
        </button>
        <button onClick={handleLoss} className={`w-full py-2 bg-red-500 text-white rounded-lg mt-2`} disabled={!product}>
          손실 등록
        </button>
      </div>
      <NotificationModal
        isVisible={isNotificationVisible}
        onClose={() => setIsNotificationVisible(false)}
        message={notificationMessage}
      />
      <Modal isVisible={isDisplayModalVisible} onClose={handleModalClose}>
        <div className="p-4">
          <h2 className="text-center text-xl font-bold text-uosBlue mb-4">진열 수량 입력</h2>
          <input
            type="number"
            value={arrangementQty}
            onChange={(e) => setArrangementQty(e.target.value)}
            className="w-full border border-gray-300 rounded p-2 mb-4"
          />
          <div className="flex justify-center">
            <button onClick={handleConfirmDisplay} className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
              확인
            </button>
          </div>
        </div>
      </Modal>
      <Modal isVisible={isDeleteModalVisible} onClose={handleModalClose}>
        <div className="p-4">
          <h2 className="text-center text-xl font-bold text-uosBlue mb-4">삭제 확인</h2>
          <p className="text-center mb-6">정말로 이 상품을 제거하시겠습니까?</p>
          <div className="flex justify-center">
            <button onClick={handleConfirmDelete} className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 mr-2">
              확인
            </button>
            <button onClick={handleModalClose} className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600">
              취소
            </button>
          </div>
        </div>
      </Modal>
      <LossModal
        isVisible={isLossModalVisible}
        onClose={handleModalClose}
        onSubmit={handleConfirmLoss}
        product={product}
      />
    </div>
  );
};

export default StockedProductDetail;
