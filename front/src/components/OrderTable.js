import React from 'react';

const formatPrice = (price) => {
    return new Intl.NumberFormat('ko-KR', {
      minimumFractionDigits: 0
    }).format(price);
  };

const OrderTable = ({ orders, handleNewOrderClick, handleOrderClick }) => {
  return (
    <div className="w-3/4 pr-4">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">발주 신청 목록</h1>
        <button
          onClick={handleNewOrderClick}
          className="py-2 px-4 bg-blue-500 text-white rounded-lg"
        >
          새로운 발주 신청
        </button>
      </div>
      <div className="bg-white rounded-lg shadow-md overflow-hidden h-full">
        <div className="overflow-y-scroll h-full">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-200 sticky top-0">
              <tr>
                <th className="py-2 px-4 border-b w-1/12 text-center">발주 번호</th>
                <th className="py-2 px-4 border-b w-2/12 text-center">발주 날짜</th>
                <th className="py-2 px-4 border-b w-2/12 text-center">진행 상태</th>
                <th className="py-2 px-4 border-b w-2/12 text-center">총액</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td className="py-2 px-4 border-b text-center" colSpan="4">현재 발주 신청 목록이 없습니다.</td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order.orderId}
                    onClick={() => handleOrderClick(order)}
                    className="cursor-pointer hover:bg-gray-100"
                  >
                    <td className="py-2 px-4 border-b text-center">{order.orderId}</td>
                    <td className="py-2 px-4 border-b text-center">{order.orderDate}</td>
                    <td className="py-2 px-4 border-b text-center">{order.status}</td>
                    <td className="py-2 px-4 border-b text-center">{formatPrice(order.totalPrice)}원</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrderTable;
