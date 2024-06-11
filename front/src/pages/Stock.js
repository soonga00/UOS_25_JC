import React, { useState, useEffect } from 'react';
import ProductDetail from '../components/ProductDetail';
import StockedProductDetail from '../components/StockedProductDetail';
import Tabs from '../components/Tabs';
import axios from 'axios';
import NotificationModal from '../components/NotificationModal';

const Stock = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [selectedSubSubCategory, setSelectedSubSubCategory] = useState('');
  const [categories, setCategories] = useState({});
  const [subCategories, setSubCategories] = useState({});
  const [products, setProducts] = useState([]);
  const [isNotificationVisible, setIsNotificationVisible] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  useEffect(() => {
    fetchStockData();
  }, []);

  const fetchStockData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://127.0.0.1:5000/stock/get', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = response.data;
      setCategories(data.categories || {});
      setSubCategories(data.sub_categories || {});
    } catch (error) {
      console.error('Error fetching stock data:', error);
    }
  };

  const resetSelections = () => {
    setSelectedCategory('');
    setSelectedSubCategory('');
    setSelectedSubSubCategory('');
    setProducts([]);
  };

  const addProduct = (product) => {
    setSelectedProduct(product);
  };

  const removeProduct = (itemNo, expDate) => {
    if (selectedProduct && selectedProduct.item_no === itemNo && selectedProduct.exp_date === expDate) {
      setSelectedProduct(null);
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setSelectedSubCategory('');
    setSelectedSubSubCategory('');
    setProducts([]);
  };

  const handleSubCategoryChange = (subCategory) => {
    setSelectedSubCategory(subCategory);
    setSelectedSubSubCategory('');
    setProducts([]);
  };

  const handleSubSubCategoryChange = (subSubCategory) => {
    setSelectedSubSubCategory(subSubCategory);
    filterProducts(subSubCategory);
  };

  const filterProducts = (subSubCategory) => {
    let subCategoryList = subCategories[selectedSubCategory];
    if (subCategoryList) {
      const subCategory = subCategoryList.find(
        sub => sub.code_nm.trim() === subSubCategory.trim()
      );
      if (subCategory) {
        const items = subCategory.item_list;
        setProducts(items);
      } else {
        setProducts([]);
      }
    }
  };

  const getSubCategories = (category) => {
    return subCategories[category] ? subCategories[category].map(sub => sub.code_nm) : [];
  };

  const handleShowNotification = (message) => {
    setNotificationMessage(message);
    setIsNotificationVisible(true);
  };

  const handleDisplaySubmit = async (arrangement_qty) => {
    if (!selectedProduct) {
      handleShowNotification('상품을 선택해 주세요.');
      return;
    }

    const displayData = {
      item_no: selectedProduct.item_no,
      exp_date: selectedProduct.exp_date,
      arrangement_qty: arrangement_qty
    };

    try {
      const response = await fetch('http://127.0.0.1:5000/stock/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(displayData),
      });
      const data = await response.json();
      if (data.msg) {
        handleShowNotification(data.msg);
        setSelectedProduct(null); // 진열 신청이 성공하면 선택된 상품 초기화
        fetchStockData(); // 재고 목록 재 로딩
        resetSelections(); // 카테고리 선택 초기화
      } else {
        handleShowNotification('Failed to display products.');
      }
    } catch (error) {
      console.error('Error displaying products:', error);
      handleShowNotification('Error displaying products.');
    }
  };

  const handleDeleteSubmit = async () => {
    if (!selectedProduct) {
      handleShowNotification('상품을 선택해 주세요.');
      return;
    }

    const deleteData = {
      item_no: selectedProduct.item_no,
      exp_date: selectedProduct.exp_date
    };

    try {
      const response = await fetch('http://127.0.0.1:5000/stock/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(deleteData),
      });
      const data = await response.json();
      if (data.msg) {
        handleShowNotification(data.msg);
        setSelectedProduct(null); // 제거가 성공하면 선택된 상품 초기화
        fetchStockData(); // 재고 목록 재 로딩
        resetSelections(); // 카테고리 선택 초기화
      } else {
        handleShowNotification('Failed to delete products.');
      }
    } catch (error) {
      console.error('Error deleting products:', error);
      handleShowNotification('Error deleting products.');
    }
  };

  const handleLossSubmit = async (lossData) => {
    if (!selectedProduct) {
      handleShowNotification('상품을 선택해 주세요.');
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:5000/stock/loss', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(lossData),
      });
      const data = await response.json();
      if (data.msg) {
        handleShowNotification(data.msg);
        setSelectedProduct(null); // 손실 등록이 성공하면 선택된 상품 초기화
        fetchStockData(); // 재고 목록 재 로딩
        resetSelections(); // 카테고리 선택 초기화
      } else {
        handleShowNotification('Failed to register loss.');
      }
    } catch (error) {
      console.error('Error registering loss:', error);
      handleShowNotification('Error registering loss.');
    }
  };

  return (
    <div className="flex h-screen w-screen">
      <div className="w-2/3 h-full p-6 bg-gray-100">
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
              {products.map((product) => (
                <ProductDetail
                  key={`${product.item_no}-${product.exp_date}`}
                  product={product}
                  addProduct={addProduct}
                  removeProduct={removeProduct}
                  isSelected={selectedProduct && selectedProduct.item_no === product.item_no && selectedProduct.exp_date === product.exp_date}
                />
              ))}
            </div>
            <div className="h-32"></div>
          </div>
        </div>
      </div>
      <div className="w-1/3 h-full p-6 bg-gray-100 flex flex-col">
        <StockedProductDetail
          product={selectedProduct}
          handleDisplaySubmit={handleDisplaySubmit}
          handleDeleteSubmit={handleDeleteSubmit}
          handleLossSubmit={handleLossSubmit}
          refreshStockList={fetchStockData}
        />
      </div>
      <NotificationModal
        isVisible={isNotificationVisible}
        onClose={() => setIsNotificationVisible(false)}
        message={notificationMessage}
      />
    </div>
  );
};

export default Stock;
