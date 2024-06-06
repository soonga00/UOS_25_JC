import React, { useState } from 'react';
import ProductInfo from '../components/ProductInfo';
import SelectedProducts from '../components/SelectedProducts';
import Tabs from '../components/Tabs';

const Order = () => {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('과자');
  
  const products = [
    { id: 1, name: '상품명1', description: '상품 설명1', price: 1000, image: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMjA0MDdfMjA3%2FMDAxNjQ5MzA2MDc3MjY4.RtQA0FPvbrzHnifCe9pNbBYGmOKTdJTDT0WOwbkTF4wg.WLQheE5GvREum0MPOGvH2RwngB_k-dkmAb5rBPJ8PsUg.JPEG.th2dud%2FFPkYSoZakAIBvX-.jpg&type=sc960_832', category: '과자' },
    { id: 2, name: '상품명2', description: '상품 설명2', price: 2000, image: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMjA0MDdfMjA3%2FMDAxNjQ5MzA2MDc3MjY4.RtQA0FPvbrzHnifCe9pNbBYGmOKTdJTDT0WOwbkTF4wg.WLQheE5GvREum0MPOGvH2RwngB_k-dkmAb5rBPJ8PsUg.JPEG.th2dud%2FFPkYSoZakAIBvX-.jpg&type=sc960_832', category: '과자' },
    { id: 3, name: '상품명3', description: '상품 설명3', price: 3000, image: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMjA0MDdfMjA3%2FMDAxNjQ5MzA2MDc3MjY4.RtQA0FPvbrzHnifCe9pNbBYGmOKTdJTDT0WOwbkTF4wg.WLQheE5GvREum0MPOGvH2RwngB_k-dkmAb5rBPJ8PsUg.JPEG.th2dud%2FFPkYSoZakAIBvX-.jpg&type=sc960_832', category: '과자' },
    { id: 4, name: '상품명4', description: '상품 설명4', price: 4000, image: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fblogfiles.naver.net%2FMjAyMjA0MDdfMjA3%2FMDAxNjQ5MzA2MDc3MjY4.RtQA0FPvbrzHnifCe9pNbBYGmOKTdJTDT0WOwbkTF4wg.WLQheE5GvREum0MPOGvH2RwngB_k-dkmAb5rBPJ8PsUg.JPEG.th2dud%2FFPkYSoZakAIBvX-.jpg&type=sc960_832', category: '과자' },
    { id: 5, name: '상품명5', description: '상품 설명5', price: 5000, image: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fshop1.phinf.naver.net%2F20240430_108%2F1714445271288GavtY_JPEG%2F115581114001663137_1506371242.jpg&type=sc960_832', category: '음료' },
    { id: 6, name: '상품명6', description: '상품 설명6', price: 6000, image: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fshop1.phinf.naver.net%2F20240430_108%2F1714445271288GavtY_JPEG%2F115581114001663137_1506371242.jpg&type=sc960_832', category: '음료' },
    { id: 7, name: '상품명7', description: '상품 설명7', price: 7000, image: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fshop1.phinf.naver.net%2F20240430_108%2F1714445271288GavtY_JPEG%2F115581114001663137_1506371242.jpg&type=sc960_832', category: '음료' },
    { id: 8, name: '상품명8', description: '상품 설명8', price: 8000, image: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fshop1.phinf.naver.net%2F20240430_108%2F1714445271288GavtY_JPEG%2F115581114001663137_1506371242.jpg&type=sc960_832', category: '음료' },
    { id: 9, name: '상품명9', description: '상품 설명9', price: 9000, image: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fshop1.phinf.naver.net%2F20240430_108%2F1714445271288GavtY_JPEG%2F115581114001663137_1506371242.jpg&type=sc960_832', category: '음료' },
    { id: 10, name: '상품명10', description: '상품 설명10', price: 10000, image: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fshop1.phinf.naver.net%2F20230510_160%2F16836959889327EIm6_JPEG%2F8903267089640538_313367042.jpeg&type=sc960_832', category: '빙과류' },
    { id: 11, name: '상품명11', description: '상품 설명11', price: 11000, image: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fshop1.phinf.naver.net%2F20230510_160%2F16836959889327EIm6_JPEG%2F8903267089640538_313367042.jpeg&type=sc960_832', category: '빙과류' },
    { id: 12, name: '상품명12', description: '상품 설명12', price: 12000, image: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fshop1.phinf.naver.net%2F20230510_160%2F16836959889327EIm6_JPEG%2F8903267089640538_313367042.jpeg&type=sc960_832', category: '빙과류' },
    { id: 13, name: '상품명13', description: '상품 설명13', price: 13000, image: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fshop1.phinf.naver.net%2F20230510_160%2F16836959889327EIm6_JPEG%2F8903267089640538_313367042.jpeg&type=sc960_832', category: '빙과류' },
    { id: 14, name: '상품명14', description: '상품 설명14', price: 14000, image: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fshop1.phinf.naver.net%2F20230510_160%2F16836959889327EIm6_JPEG%2F8903267089640538_313367042.jpeg&type=sc960_832', category: '빙과류' },
    { id: 15, name: '상품명15', description: '상품 설명15', price: 15000, image: 'https://search.pstatic.net/common/?src=http%3A%2F%2Fshop1.phinf.naver.net%2F20230510_160%2F16836959889327EIm6_JPEG%2F8903267089640538_313367042.jpeg&type=sc960_832', category: '빙과류' },
  ];
  
  const addProduct = (product) => {
    const existingProduct = selectedProducts.find((p) => p.id === product.id);
    if (existingProduct) {
      setSelectedProducts(
        selectedProducts.map((p) =>
          p.id === product.id ? { ...p, quantity: p.quantity + product.quantity } : p
        )
      );
    } else {
      setSelectedProducts([...selectedProducts, product]);
    }
  };

  const updateProductQuantity = (id, delta) => {
    setSelectedProducts((prevProducts) => {
      const updatedProducts = prevProducts.map((p) =>
        p.id === id ? { ...p, quantity: Math.max(0, p.quantity + delta) } : p
      );
      return updatedProducts.filter((p) => p.quantity > 0); // 수량이 0이면 목록에서 제거
    });
  };

  const removeProduct = (id) => {
    setSelectedProducts((prevProducts) =>
      prevProducts.filter((product) => product.id !== id)
    );
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const filteredProducts = products.filter(
    (product) => product.category === selectedCategory
  );

  return (
    <div className="flex h-screen w-screen">
      <div className="w-2/3 h-full p-6 bg-gray-100">
        <div className="flex flex-col h-full overflow-hidden bg-gray-100 rounded-lg">
          <Tabs selectedCategory={selectedCategory} onCategoryChange={handleCategoryChange} />
          <div className="flex-1 overflow-y-auto w-full bg-white rounded-tr-lg">
            <div className="grid grid-cols-3 gap-4 w-full p-4">
              {filteredProducts.map((product) => (
                <ProductInfo key={product.id} product={product} addProduct={addProduct} />
              ))}
            </div>
            {/* 여백을 추가하기 위해 아래 div를 추가합니다. */}
            <div className="h-32"></div>
          </div>
        </div>
      </div>
      <div className="w-1/3 h-full p-6 bg-gray-100 flex flex-col">
        <SelectedProducts
          products={selectedProducts}
          updateProductQuantity={updateProductQuantity}
          removeProduct={removeProduct}
        />
      </div>
    </div>
  );
  
   
};

export default Order;
