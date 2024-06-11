import React, { useState, useEffect } from 'react';


const OrderDetails = ({ selectedOrder, handleRegisterProducts, handleMisdelivery }) => {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [expDates, setExpDates] = useState({});

  useEffect(() => {
    if (selectedOrder) {
      const initialExpDates = {};
      selectedOrder.products.forEach(product => {
        initialExpDates[product.id] = '';
      });
      setExpDates(initialExpDates);
    }
  }, [selectedOrder]);

  const handleProductSelection = (productId) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter((id) => id !== productId));
    } else {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };

  const handleExpDateChange = (productId, value) => {
    setExpDates(prevExpDates => ({
      ...prevExpDates,
      [productId]: value,
    }));
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ko-KR', {
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleRegisterProductsClick = async () => {
    for (const productId of selectedProducts) {
      if (!expDates[productId]) {
        alert('모든 선택된 상품의 유통기한을 설정해 주세요.');
        return;
      }
    }
    handleRegisterProducts(selectedOrder.orderId, selectedProducts, expDates);
  };

  const handleMisdeliveryClick = async () => {
    handleMisdelivery(selectedOrder.orderId, selectedProducts);
  };

  if (!selectedOrder || !selectedOrder.products) {
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
        <h2 className="text-xl font-bold mb-4">발주 번호 : {selectedOrder.orderId}</h2>
        <div className="max-h-80 overflow-y-scroll">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-200 sticky top-0">
              <tr>
                <th className="py-2 px-4 border-b w-1/12 text-center text-sm">선택</th>
                <th className="py-2 px-4 border-b w-4/12 text-center text-sm">상품명</th>
                <th className="py-2 px-4 border-b w-2/12 text-center text-sm">수량</th>
                <th className="py-2 px-4 border-b w-2/12 text-center text-sm">가격</th>
                <th className="py-2 px-4 border-b w-3/12 text-center text-sm">유통기한</th>
              </tr>
            </thead>
            <tbody>
              {selectedOrder.products.map((product) => (
                <tr key={product.id} className={product.received ? "bg-gray-100" : ""}>
                  <td className="py-2 px-4 border-b text-center">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => handleProductSelection(product.id)}
                      disabled={product.received}
                    />
                  </td>
                  <td className="py-2 px-4 border-b text-center text-sm">{product.name}</td>
                  <td className="py-2 px-4 border-b text-center text-sm">{product.quantity} 개</td>
                  <td className="py-2 px-4 border-b text-center text-sm">{formatPrice(product.price)} 원</td>
                  <td className="py-2 px-4 border-b text-center text-sm">
                    <input
                      type="datetime-local"
                      value={expDates[product.id] || ''}
                      onChange={(e) => handleExpDateChange(product.id, e.target.value)}
                      className="w-full p-1 border border-gray-300 rounded"
                      disabled={product.received}
                    />
                  </td>
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
          <span>{formatPrice(selectedOrder.totalPrice)} 원</span>
        </div>
        <div className="flex space-x-4 mb-16">
          <button
            onClick={handleRegisterProductsClick}
            className="w-1/2 py-2 bg-blue-500 text-white rounded-lg"
          >
            입고 상품 등록
          </button>
          <button
            onClick={handleMisdeliveryClick}
            className="w-1/2 py-2 bg-red-500 text-white rounded-lg"
          >
            오배송 신청
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
