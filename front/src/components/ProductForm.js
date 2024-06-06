import React, { useState } from 'react';

const ProductForm = ({ addProduct }) => {
  const [product, setProduct] = useState({
    code: '',
    category: '',
    name: '',
    quantity: 1,
    discount: 0,
    price: 0,

  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addProduct(product);
    setProduct({
      code: '',
      category: '',
      name: '',
      quantity: 1,
      discount: 0,
      price: 0,
      age: 10,
      sex: 'M',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 h-full flex flex-col justify-between">
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">상품 번호</label>
          <input
            type="text"
            name="code"
            value={product.code}
            onChange={handleChange}
            className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">상품명</label>
          <input
            type="text"
            name="name"
            value={product.name}
            onChange={handleChange}
            className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">수량</label>
          <input
            type="number"
            name="quantity"
            value={product.quantity}
            onChange={handleChange}
            className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">할인 (%)</label>
          <input
            type="number"
            name="discount"
            value={product.discount}
            onChange={handleChange}
            className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">가격</label>
          <input
            type="number"
            name="price"
            value={product.price}
            onChange={handleChange}
            className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">연령층</label>
          <input
            type="text"
            name="category"
            value={product.age}
            onChange={handleChange}
            className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">성별</label>
          <input
            type="text"
            name="category"
            value={product.sex}
            onChange={handleChange}
            className="mt-1 p-2 block w-full border border-gray-300 rounded-md"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 bg-blue-500 text-white rounded-lg"
        >
          추가
        </button>
      </form>
      <div className="mt-4 flex space-x-2 mb-16">
        <button className="flex-1 py-2 bg-green-500 text-white rounded-lg">현금</button>
        <button className="flex-1 py-2 bg-red-500 text-white rounded-lg">카드</button>
        <button className="flex-1 py-2 bg-yellow-500 text-white rounded-lg">마일리지 적립</button>
      </div>
    </div>
  );
};

export default ProductForm;
