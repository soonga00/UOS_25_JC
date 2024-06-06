import React from 'react';

const ProductList = ({ products }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden h-full">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-200 sticky top-0">
          <tr>
            <th className="py-2 px-4 border-b w-1/12 text-center text-sm">상품 번호</th>
            <th className="py-2 px-4 border-b w-3/12 text-center text-sm">상품명</th>
            <th className="py-2 px-4 border-b w-1/12 text-center text-sm">수량</th>
            <th className="py-2 px-4 border-b w-1/12 text-center text-sm">할인</th>
            <th className="py-2 px-4 border-b w-2/12 text-center text-sm">가격</th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr>
              <td className="py-2 px-4 border-b text-center" colSpan="5">현재 추가된 상품이 없습니다.</td>
            </tr>
          ) : (
            products.map((product) => (
              <tr key={product.code}>
                <td className="py-2 px-4 border-b text-center text-sm">{product.code}</td>
                <td className="py-2 px-4 border-b text-center text-sm">{product.name}</td>
                <td className="py-2 px-4 border-b text-center text-sm">{product.quantity}</td>
                <td className="py-2 px-4 border-b text-center text-sm">{product.discount}%</td>
                <td className="py-2 px-4 border-b text-center text-sm">{product.price}원</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProductList;
