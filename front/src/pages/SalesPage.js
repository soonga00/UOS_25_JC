import React, { useState } from 'react';
import ProductList from '../components/ProductList';
import ProductForm from '../components/ProductForm';

const SalesPage = () => {
  const [products, setProducts] = useState([]);

  const addProduct = (product) => {
    setProducts([...products, product]);
  };

  return (
    <div className="p-6 bg-gray-100 w-screen h-screen flex">
      <div className="w-3/4 pr-4">
        <ProductList products={products} />
      </div>
      <div className="w-1/4 pl-4">
        <ProductForm addProduct={addProduct} />
      </div>
    </div>
  );
};

export default SalesPage;
