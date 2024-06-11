import React from 'react';

const SelectedProducts = ({ products, updateProductQuantity, removeProduct, handleOrderSubmit }) => { // handleOrderSubmit prop 추가
  const totalPrice = products.reduce((acc, product) => acc + (product.delv_price * product.quantity), 0);

  const handleIncrease = (item_no) => {
    updateProductQuantity(item_no, 1);
  };

  const handleDecrease = (item_no) => {
    updateProductQuantity(item_no, -1);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ko-KR', {
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="w-full h-full p-4 bg-white shadow-md rounded-lg flex flex-col justify-between">
      <h2 className="text-lg font-semibold mb-4">선택한 상품들</h2>
      <hr className="border-gray-300 mb-4" />
      <div className="overflow-y-auto flex-1">
        {products.length === 0 ? (
          <p className="text-gray-500">선택된 상품이 없습니다.</p>
        ) : (
          <ul>
            {products.map((product) => (
              <li key={product.item_no} className="mb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="block">{product.item_nm}</span>
                    <span className="text-gray-500 text-sm">상품 번호: {product.item_no}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-4">{formatPrice(product.delv_price * product.quantity)} 원</span>
                    <button
                      onClick={() => handleDecrease(product.item_no)}
                      className="bg-gray-300 text-gray-700 rounded-l px-2 h-6"
                    >
                      -
                    </button>
                    <input
                      type="text"
                      value={product.quantity}
                      readOnly
                      className="w-12 text-center border-t border-b border-gray-300 h-6"
                    />
                    <button
                      onClick={() => handleIncrease(product.item_no)}
                      className="bg-gray-300 text-gray-700 rounded-r px-2 h-6"
                    >
                      +
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <hr className="border-gray-300 mt-4 mb-2" />
      <div>
        <div className="flex justify-between font-semibold mb-2">
          <span>총 액 :</span>
          <span>{formatPrice(totalPrice)} 원</span>
        </div>
        <button onClick={handleOrderSubmit} className="w-full py-2 bg-blue-500 text-white rounded-lg mt-4 mb-16">
          발주 신청
        </button>
      </div>
    </div>
  );
};

export default SelectedProducts;
