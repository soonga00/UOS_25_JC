import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OrderDetails from '../components/OrderDetails';
import OrderTable from '../components/OrderTable';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const exampleOrders = [
      {
        orderId: 1,
        orderDate: '2024-06-01',
        status: '진행 중',
        products: [
          { id: 1, name: '상품명1', quantity: 2, price: 1000 },
          { id: 2, name: '상품명2', quantity: 1, price: 2000 },
        ],
        totalPrice: 4000,
      },
      {
        orderId: 2,
        orderDate: '2024-06-03',
        status: '완료',
        products: [
          { id: 3, name: '상품명3', quantity: 1, price: 3000 },
        ],
        totalPrice: 3000,
      },
      {
        orderId: 3,
        orderDate: '2024-06-01',
        status: '진행 중',
        products: [
          { id: 1, name: '상품명1', quantity: 2, price: 1000 },
          { id: 2, name: '상품명2', quantity: 1, price: 2000 },
        ],
        totalPrice: 4000,
      },
    ];

    setOrders(exampleOrders);
  }, []);

  const handleNewOrderClick = () => {
    navigate('/order');
  };

  const handleOrderClick = (order) => {
    if (selectedOrder && selectedOrder.orderId === order.orderId) {
      setSelectedOrder(null);
    } else {
      setSelectedOrder(order);
    }
  };

  const handleRegisterProducts = (orderId, selectedProducts) => {
    console.log('입고 상품이 등록되었습니다.');
    console.log('발주 번호:', orderId);
    console.log('선택된 상품들:', selectedProducts);

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
  };

  return (
    <div className="p-6 bg-gray-100 w-screen h-screen flex">
      <OrderTable orders={orders} handleNewOrderClick={handleNewOrderClick} handleOrderClick={handleOrderClick} />
      <div className="w-1/2 pl-4">
        <OrderDetails selectedOrder={selectedOrder} handleRegisterProducts={handleRegisterProducts} />
      </div>
    </div>
  );
};

export default OrderList;
