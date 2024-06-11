import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductInfo from '../components/ProductInfo';
import SelectedProducts from '../components/SelectedProducts';
import Tabs from '../components/Tabs';

const Order = () => {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [selectedSubSubCategory, setSelectedSubSubCategory] = useState('');
  const [categories, setCategories] = useState({});
  const [subCategories, setSubCategories] = useState({});
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://127.0.0.1:5000/item/code')
      .then(response => response.json())
      .then(data => {
        setCategories(data.categories);
        setSubCategories(data.sub_categories);
      })
      .catch(error => console.error('Error fetching code data:', error));
  }, []);

  const addProduct = (product) => {
    const existingProduct = selectedProducts.find((p) => p.item_no === product.item_no);
    if (existingProduct) {
      setSelectedProducts(
        selectedProducts.map((p) =>
          p.item_no === product.item_no ? { ...p, quantity: p.quantity + product.quantity } : p
        )
      );
    } else {
      setSelectedProducts([...selectedProducts, product]);
    }
  };

  const updateProductQuantity = (item_no, delta) => {
    setSelectedProducts((prevProducts) => {
      const updatedProducts = prevProducts.map((p) =>
        p.item_no === item_no ? { ...p, quantity: Math.max(0, p.quantity + delta) } : p
      );
      return updatedProducts.filter((p) => p.quantity > 0);
    });
  };

  const removeProduct = (item_no) => {
    setSelectedProducts((prevProducts) =>
      prevProducts.filter((product) => product.item_no !== item_no)
    );
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setSelectedSubCategory('');
    setSelectedSubSubCategory('');
  };

  const handleSubCategoryChange = (subCategory) => {
    setSelectedSubCategory(subCategory);
    setSelectedSubSubCategory('');
  };

  const handleSubSubCategoryChange = (subSubCategory) => {
    setSelectedSubSubCategory(subSubCategory);
    fetchItems(subSubCategory);
  };

  const fetchItems = (subSubCategory) => {
    const selectedSubCategoryObj = subCategories[selectedSubCategory].find(
      sub => sub.code_nm === subSubCategory
    );

    if (!selectedSubCategoryObj) {
      console.error('Invalid subSubCategory selected');
      return;
    }

    const requestData = {
      code_type: selectedSubCategoryObj.code_type,
      code: selectedSubCategoryObj.code
    };

    fetch('http://127.0.0.1:5000/item/detail', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    })
      .then(response => response.json())
      .then(data => {
        console.log('Fetched products:', data.item_list);
        setProducts(data.item_list);
      })
      .catch(error => console.error('Error fetching item details:', error));
  };

  const getSubCategories = (category) => {
    return subCategories[category] ? subCategories[category].map(sub => sub.code_nm) : [];
  };

  const handleOrderSubmit = () => {
    const orderData = {
      order_list: selectedProducts.map(product => ({
        item_no: product.item_no,
        order_qty: product.quantity
      }))
    };

    fetch('http://127.0.0.1:5000/order/req', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(orderData),
    })
      .then(response => response.json())
      .then(data => {
        if (data.msg) {
          alert(data.msg);
          setSelectedProducts([]); // 발주 신청이 성공하면 선택된 상품 초기화
        } else {
          alert('Failed to submit order.');
        }
      })
      .catch(error => console.error('Error submitting order:', error));
  };

  const filteredProducts = products;

  return (
    <div className="flex h-screen w-screen">
      <div className="w-2/3 h-full p-6 bg-gray-100">
        <button onClick={() => navigate('/order-list')} className="mb-4 p-2 bg-blue-500 text-white rounded w-1/6">
          발주목록
        </button>
        <div className="flex flex-col h-full overflow-hidden bg-gray-100 rounded-lg">
          <Tabs selectedCategory={selectedCategory} onCategoryChange={handleCategoryChange} categories={Object.keys(categories)} />
          {selectedCategory && (
            <Tabs selectedCategory={selectedSubCategory} onCategoryChange={handleSubCategoryChange} categories={categories[selectedCategory]} />
          )}
          {selectedSubCategory && (
            <Tabs selectedCategory={selectedSubSubCategory} onCategoryChange={handleSubSubCategoryChange} categories={getSubCategories(selectedSubCategory)} />
          )}
          <div className="flex-1 overflow-y-auto w-full bg-white rounded-tr-lg">
            <div className="grid grid-cols-3 gap-4 w-full p-4">
              {filteredProducts.map((product) => (
                <ProductInfo key={product.item_no} product={product} addProduct={addProduct} />
              ))}
            </div>
            <div className="h-32"></div>
          </div>
        </div>
      </div>
      <div className="w-1/3 h-full p-6 bg-gray-100 flex flex-col">
        <SelectedProducts
          products={selectedProducts}
          updateProductQuantity={updateProductQuantity}
          removeProduct={removeProduct}
          handleOrderSubmit={handleOrderSubmit} // handleOrderSubmit 추가
        />
      </div>
    </div>
  );
};

export default Order;
