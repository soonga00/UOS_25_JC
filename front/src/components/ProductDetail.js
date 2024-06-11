import React from 'react';

const ProductDetail = ({ product, addProduct, removeProduct, isSelected }) => {
  const handleAddOrRemoveProduct = () => {
    if (isSelected) {
      removeProduct(product.item_no, product.exp_date);
    } else {
      addProduct(product);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const productStyle = isSelected ? "border-4 border-blue-500" : "border";

  return (
    <div className={`${productStyle} p-4 rounded shadow-lg bg-white flex flex-col items-center relative`}>
      {product.is_img ? (
        <img
          src={`data:image/jpeg;base64,${product.img}`}
          alt={product.item_nm}
          className="w-32 h-32 object-cover mb-4"
        />
      ) : (
        <div className="w-32 h-32 bg-gray-300 flex items-center justify-center mb-4">
          <span className="text-gray-500">이미지 없음</span>
        </div>
      )}
      <h2 className="text-xl font-bold mb-2">{product.item_nm}</h2>
      <p className="mb-2">상품 번호: {product.item_no}</p>
      <p className="mb-2">총 수량: {product.total_qty}</p>
      <p className="mb-2">진열 수량: {product.arrangement_qty}</p>
      <p className="mb-2">유통기한: {formatDate(product.exp_date)}</p>
      <button
        onClick={handleAddOrRemoveProduct}
        className={`px-4 py-2 rounded mt-4 ${isSelected ? 'bg-red-500' : 'bg-blue-500'} text-white`}
      >
        {isSelected ? '선택 해제' : '선택'}
      </button>
    </div>
  );
};

export default ProductDetail;
