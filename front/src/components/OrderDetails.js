import React, { useState } from 'react';

const OrderDetails = ({ selectedOrder, handleRegisterProducts }) => {
  const [selectedProducts, setSelectedProducts] = useState([]);

  const handleProductSelection = (productId) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter((id) => id !== productId));
    } else {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };
  const formatPrice = (price) => {
    return new Intl.NumberFormat('ko-KR', {
      minimumFractionDigits: 0
    }).format(price);
  };

  if (!selectedOrder) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 h-full">
        <h2 className="text-xl font-bold mb-4">발주 세부 정보</h2>
        <div className="overflow-y-scroll max-h-80">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-200">
              <tr>
                <th className="py-2 px-4 border-b w-1/3 text-center text-sm">상품명</th>
                <th className="py-2 px-4 border-b w-1/3 text-center text-sm">수량</th>
                <th className="py-2 px-4 border-b w-1/3 text-center text-sm">가격</th>
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
        <h2 className="text-xl font-bold mb-4">발주 번호: {selectedOrder.orderId}</h2>
        <div className="max-h-80 overflow-y-scroll">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-200 sticky top-0">
              <tr>
                <th className="py-2 px-4 border-b w-1/4 text-center text-sm">선택</th>
                <th className="py-2 px-4 border-b w-1/4 text-center text-sm">상품명</th>
                <th className="py-2 px-4 border-b w-1/4 text-center text-sm">수량</th>
                <th className="py-2 px-4 border-b w-1/4 text-center text-sm">가격</th>
              </tr>
            </thead>
            <tbody>
              {selectedOrder.products.map((product) => (
                <tr key={product.id}>
                  <td className="py-2 px-4 border-b text-center">
                    {!product.received && (
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => handleProductSelection(product.id)}
                      />
                    )}
                  </td>
                  <td className="py-2 px-4 border-b text-center text-sm">{product.name}</td>
                  <td className="py-2 px-4 border-b text-center text-sm">{product.quantity}</td>
                  <td className="py-2 px-4 border-b text-center text-sm">{formatPrice(product.price)}원</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <hr className="border-gray-300 my-4" />
      <div>
        <div className="flex justify-between font-semibold mb-4">
          <span>총액:</span>
          <span>{formatPrice(selectedOrder.totalPrice)}원</span>
        </div>
        <button
          onClick={() => handleRegisterProducts(selectedOrder.orderId, selectedProducts)}
          className="w-full py-2 bg-blue-500 text-white rounded-lg mb-16"
        >
          입고 상품 등록
        </button>
      </div>
    </div>
  );
};

export default OrderDetails;
