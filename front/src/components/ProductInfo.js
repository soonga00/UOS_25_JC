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

  return (
    <div className="border p-4 rounded shadow-lg bg-white flex flex-col items-center">
      <img src={product.image} alt={product.name} className="w-32 h-32 object-cover mb-4" />
      <h2 className="text-2xl font-bold mb-4">{product.name}</h2>
      <p className="mb-4">{product.description}</p>
      <p className="mb-4">납품가: {formatPrice(product.price)}원</p>
      <div className="flex items-center mb-4">
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
        >
          담기
        </button>
      </div>
    </div>
  );
};

export default ProductInfo;
