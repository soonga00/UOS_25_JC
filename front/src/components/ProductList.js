import React from 'react';

const ProductList = ({ products }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('ko-KR', {
      minimumFractionDigits: 0
    }).format(price);
  };

  const totalAmount = products.reduce((acc, product) => {
    return acc + (product.price - product.discount) * product.quantity;
  }, 0);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 h-full flex flex-col justify-between">
      <div className="overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">상품 목록</h2>
        <table className="min-w-full bg-white">
          <thead className="bg-gray-200">
            <tr>
              <th className="py-2 px-4 border-b text-center text-sm">상품 번호</th>
              <th className="py-2 px-4 border-b text-center text-sm">상품명</th>
              <th className="py-2 px-4 border-b text-center text-sm">수량</th>
              <th className="py-2 px-4 border-b text-center text-sm">가격</th>
              <th className="py-2 px-4 border-b text-center text-sm">할인</th>
              <th className="py-2 px-4 border-b text-center text-sm">총 가격</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr key={index} className={product.isGiveaway ? 'bg-yellow-100' : ''}>
                <td className="py-2 px-4 border-b text-center text-sm">{product.item_no}</td>
                <td className="py-2 px-4 border-b text-center text-sm">{product.name}</td>
                <td className="py-2 px-4 border-b text-center text-sm">{product.quantity}</td>
                <td className="py-2 px-4 border-b text-center text-sm">{formatPrice(product.price)} 원</td>
                <td className="py-2 px-4 border-b text-center text-sm">{product.isGiveaway ? '증정품' : `${formatPrice(product.discount)} 원`}</td>
                <td className="py-2 px-4 border-b text-center text-sm">{formatPrice((product.price - product.discount) * product.quantity)} 원</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-2 mb-16">
        <hr className='mb-4'></hr>
        <p className="text-left text-xl font-bold">결제 금액 : {formatPrice(totalAmount)} 원</p>
      </div>
    </div>
  );
};

export default ProductList;
