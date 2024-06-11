import React, { useState } from 'react';
import ReturnModal from './ReturnModal';

const SalesDetails = ({ selectedSale, handleProductClick, selectedProduct, handleReturnRequest }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [returnRule, setReturnRule] = useState('');

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ko-KR', {
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleModalOpen = async () => {
    if (!selectedProduct) {
      alert('반품할 상품을 선택해주세요.');
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:5000/return/rule/${selectedProduct.sell_list_no}`);
      const data = await response.json();
      setReturnRule(data.rule);
      setIsModalVisible(true);
    } catch (error) {
      console.error('Failed to fetch return rule:', error);
    }
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  const handleConfirmReturn = async (reason) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:5000/return', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          return_reason: reason,
          sell_list_no: selectedProduct.sell_list_no,
        }),
      });

      const result = await response.json();
      alert(result.msg);
      setIsModalVisible(false);
    } catch (error) {
      console.error('Failed to request return:', error);
    }
  };

  if (!selectedSale) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 h-full">
        <h2 className="text-xl font-bold mb-4">판매 세부 정보</h2>
        <div className="overflow-y-scroll max-h-80">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-200">
              <tr>
                <th className="py-4 px-4 border-b w-1/3 text-center text-sm">상품번호</th>
                <th className="py-4 px-4 border-b w-1/3 text-center text-sm">상품명</th>
                <th className="py-4 px-4 border-b w-1/3 text-center text-sm">수량</th>
                <th className="py-4 px-4 border-b w-1/3 text-center text-sm">가격</th>
              </tr>
            </thead>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 h-full flex flex-col justify-between">
      <div className="flex-1">
        <h2 className="text-xl font-bold mb-4">판매 번호 : {selectedSale.sell_no}</h2>
        <div className="h-90 overflow-y-scroll">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-200 sticky top-0">
              <tr>
                <th className="py-2 px-4 border-b w-1/12 text-center text-sm">상품번호</th>
                <th className="py-2 px-4 border-b w-4/12 text-center text-sm">상품명</th>
                <th className="py-2 px-4 border-b w-2/12 text-center text-sm">수량</th>
                <th className="py-2 px-4 border-b w-2/12 text-center text-sm">가격</th>
              </tr>
            </thead>
            <tbody>
              {selectedSale.sell_list.map((product) => (
                <tr 
                  key={product.sell_list_no} 
                  className={`cursor-pointer ${selectedProduct && selectedProduct.sell_list_no === product.sell_list_no ? 'bg-blue-100' : 'bg-gray-100'}`}
                  onClick={() => handleProductClick(product)}
                >
                  <td className="py-2 px-4 border-b text-center">{product.item_no}</td>
                  <td className="py-2 px-4 border-b text-center">{product.item_nm}</td>
                  <td className="py-2 px-4 border-b text-center">{product.sell_qty} 개</td>
                  <td className="py-2 px-4 border-b text-center">{formatPrice(product.item_price)} 원</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <hr className="border-gray-300 my-4" />
      <div className='mb-16'>
        <div className="flex justify-between font-semibold mb-4">
          <span>총액:</span>
          <span>{formatPrice(selectedSale.pay_amt)} 원</span>
        </div>
        <button onClick={handleModalOpen} className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 ">
          반품 신청
        </button>
      </div>
      {isModalVisible && (
        <ReturnModal
          rule={returnRule}
          onClose={handleModalClose}
          onConfirm={handleConfirmReturn}
        />
      )}
    </div>
  );
};

export default SalesDetails;
