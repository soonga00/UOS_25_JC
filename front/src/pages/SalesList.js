import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SalesDetails from '../components/SalesDetails';
import SalesTable from '../components/SalesTable';
import ReturnModal from '../components/ReturnModal';
import NotificationModal from '../components/NotificationModal';

const SalesList = () => {
  const [sales, setSales] = useState([]);
  const [selectedSale, setSelectedSale] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isReturnModalVisible, setIsReturnModalVisible] = useState(false);
  const [isNotificationModalVisible, setIsNotificationModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [returnRule, setReturnRule] = useState('');

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://127.0.0.1:5000/sell/list', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setSales(response.data.sell_list);
      } catch (error) {
        console.error('Failed to fetch sales:', error);
      }
    };

    fetchSales();
  }, []);

  const handleSaleClick = (sale) => {
    if (selectedSale && selectedSale.sell_no === sale.sell_no) {
      setSelectedSale(null);
      setSelectedProduct(null);
    } else {
      setSelectedSale(sale);
      setSelectedProduct(null);  // 판매를 선택할 때 선택된 상품을 초기화
    }
  };

  const handleProductClick = (product) => {
    if (selectedProduct && selectedProduct.sell_list_no === product.sell_list_no) {
      setSelectedProduct(null);
    } else {
      setSelectedProduct(product);
    }
  };

  const handleReturnRequest = async () => {
    if (!selectedProduct) {
      alert('반품할 상품을 선택해주세요.');
      return;
    }

    try {
      const response = await axios.get(`http://127.0.0.1:5000/return/rule/${selectedProduct.sell_list_no}`);
      setReturnRule(response.data.rule);
      setIsReturnModalVisible(true);
    } catch (error) {
      console.error('Failed to fetch return rule:', error);
    }
  };

  const handleReturnModalClose = () => {
    setIsReturnModalVisible(false);
  };

  const handleConfirmReturn = async (reason) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://127.0.0.1:5000/return', {
        return_reason: reason,
        sell_list_no: selectedProduct.sell_list_no,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setModalMessage(response.data.msg);
    } catch (error) {
      console.error('Failed to request return:', error);
      if (error.response && error.response.data && error.response.data.msg) {
        setModalMessage(error.response.data.msg);
      } else {
        setModalMessage('반품 실패.');
      }
    } finally {
      setIsReturnModalVisible(false);
      setIsNotificationModalVisible(true);
    }
  };

  return (
    <div className="p-6 bg-gray-100 w-screen h-screen flex">
      <SalesTable 
        sales={sales} 
        handleSaleClick={handleSaleClick} 
        selectedSale={selectedSale}
      />
      <div className="w-2/3 pl-4">
        <SalesDetails 
          selectedSale={selectedSale}
          handleProductClick={handleProductClick}
          selectedProduct={selectedProduct}
          handleReturnRequest={handleReturnRequest}
        />
      </div>
      {isReturnModalVisible && (
        <ReturnModal
          rule={returnRule}
          onClose={handleReturnModalClose}
          onConfirm={handleConfirmReturn}
        />
      )}
      <NotificationModal
        isVisible={isNotificationModalVisible}
        onClose={() => setIsNotificationModalVisible(false)}
        message={modalMessage}
      />
    </div>
  );
};

export default SalesList;
