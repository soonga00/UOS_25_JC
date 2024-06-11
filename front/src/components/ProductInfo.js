import React, { useState } from 'react';

const ProductInfo = ({ product, addProduct }) => {
  const [quantity, setQuantity] = useState(1);

  const handleAddProduct = () => {
    addProduct({ ...product, quantity });
    setQuantity(1);  // 수량 초기화
  };

  const handleIncrease = () => {
    setQuantity(quantity + 1);
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ko-KR', {
      minimumFractionDigits: 0
    }).format(price);
  };

  const isAvailable = product.order_available_flag === 'O';

  return (
    <div className="border p-4 rounded shadow-lg bg-white flex flex-col items-center relative">
      {product.img && (
        <div className={`relative ${!isAvailable ? 'opacity-50' : ''}`}>
          <img
            src={`data:image/jpeg;base64,${product.img}`}
            alt={product.item_nm}
            className="w-32 h-32 object-cover mb-4"
          />
          {!isAvailable && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <span className="text-red-500 text-6xl font-bold">X</span>
            </div>
          )}
        </div>
      )}
      <h2 className="text-xl font-bold mb-2">{product.item_nm}</h2>
      <p className="mb-2">납품가 : {formatPrice(product.delv_price)} 원</p>
      <p className="mb-2">소비자가 : {formatPrice(product.consumer_price)} 원</p>
      <p className="mb-2">배송 가능 여부 : {isAvailable ? '가능' : '불가능'}</p>
      <p className="mb-2">배송 회사 : {product.deliv_comp_nm}</p>
      <p className="mb-4">상품 번호 : {product.item_no}</p>
      <div className="flex items-center mb-2">
        <button
          onClick={handleDecrease}
          className="bg-gray-300 text-gray-700 rounded-l px-2 h-6"
        >
          -
        </button>
        <input
          type="text"
          value={quantity}
          readOnly
          className="w-12 text-center border-t border-b border-gray-300 h-6"
        />
        <button
          onClick={handleIncrease}
          className="bg-gray-300 text-gray-700 rounded-r px-2 h-6"
        >
          +
        </button>
        <button
          onClick={handleAddProduct}
          className="bg-blue-500 text-white px-2 rounded ml-4 h-6"
          disabled={!isAvailable}
        >
          담기
        </button>
      </div>
    </div>
  );
};

export default ProductInfo;
