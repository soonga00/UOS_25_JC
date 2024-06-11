import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OrderDetails from '../components/OrderDetails';
import OrderTable from '../components/OrderTable';
import axios from 'axios';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token'); // 로컬 스토리지에서 토큰 가져오기
        const response = await axios.get('http://127.0.0.1:5000/order/list', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log(response)
        const mappedOrders = response.data.map(order => ({
          orderId: order.order_no,
          status: order.state,
          products: order.items.map(item => ({
            id: item.item_no,
            order_list_no: item.order_list_no,
            name: item.item_nm,
            quantity: item.order_qty,
            price: item.deliv_price,
            received: item.received || false // 서버로부터 received 값을 받아오도록 설정
          })),
          totalPrice: order.items.reduce((total, item) => total + item.deliv_price * item.order_qty, 0)
        }));
        setOrders(mappedOrders);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      }
    };

    fetchOrders();
  }, []);

  const handleNewOrderClick = () => {
    navigate('/order');
  };

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
  };

  const handleRegisterProducts = async (orderId, selectedProducts, expDates) => {
    const receiveList = selectedProducts.map(productId => {
      const product = selectedOrder.products.find(p => p.id === productId);
      const expDate = new Date(expDates[product.id]).toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, '');
      return { order_list_no: product.order_list_no, actual_qty: product.quantity, exp_date: expDate };
    });

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://127.0.0.1:5000/stock/receive', 
        { receive_list: receiveList }, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        alert(response.data.msg);
      } else if (response.status === 400) {
        alert(response.data.msg);
      } else {
        alert('입고 상품 등록에 실패했습니다.');
      }

      const updatedOrders = orders.map((order) => {
        if (order.orderId === orderId) {
          return {
            ...order,
            products: order.products.map((product) =>
              selectedProducts.includes(product.id) ? { ...product, received: true } : product
            ),
            status: order.products.every((product) =>
              selectedProducts.includes(product.id) || product.received
            )
              ? '입고 완료'
              : order.status,
          };
        }
        return order;
      });

      setOrders(updatedOrders);
      setSelectedOrder(updatedOrders.find((order) => order.orderId === orderId));
    } catch (error) {
      console.error('Failed to register products:', error);
      if (error.response && error.response.status === 400) {
        alert(error.response.data.msg);
      } else {
        alert('입고 상품 등록에 실패했습니다.');
      }
    }
  };

  const handleMisdelivery = async (orderId, selectedProducts) => {
    const misdeliveryList = selectedProducts.map(productId => {
      const product = selectedOrder.products.find(p => p.id === productId);
      return { order_list_no: product.order_list_no, actual_qty: product.quantity };
    });

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://127.0.0.1:5000/stock/error', 
        { receive_list: misdeliveryList }, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        alert(response.data.msg);
      } else if (response.status === 400) {
        alert(response.data.msg);
      } else {
        alert('오배송 신청에 실패했습니다.');
      }
    } catch (error) {
      console.error('Failed to register misdelivery:', error);
      if (error.response && error.response.status === 400) {
        alert(error.response.data.msg);
      } else {
        alert('오배송 신청에 실패했습니다.');
      }
    }
  };

  return (
    <div className="p-6 bg-gray-100 w-screen h-screen flex">
      <OrderTable 
        orders={orders} 
        handleNewOrderClick={handleNewOrderClick} 
        handleOrderClick={handleOrderClick} 
        selectedOrder={selectedOrder}
      />
      <div className="w-2/3 pl-4">
        <OrderDetails 
          selectedOrder={selectedOrder} 
          handleRegisterProducts={handleRegisterProducts} 
          handleMisdelivery={handleMisdelivery} 
        />
      </div>
    </div>
  );
};

export default OrderList;
