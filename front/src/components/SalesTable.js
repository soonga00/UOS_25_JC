import React from 'react';

const SalesTable = ({ sales, handleSaleClick, selectedSale }) => {
  return (
    <div className="w-1/3 pr-4">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">판매 목록</h1>
      </div>
      <div className="bg-white rounded-lg shadow-md overflow-hidden h-full">
        <div className="overflow-y-scroll h-full">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-200 sticky top-0">
              <tr>
                <th className="py-2 px-4 border-b w-1/12 text-center">판매 번호</th>
                <th className="py-2 px-4 border-b w-2/12 text-center">판매 금액</th>
                <th className="py-2 px-4 border-b w-2/12 text-center">판매 날짜</th>
                <th className="py-2 px-4 border-b w-2/12 text-center">결제 수단</th>
              </tr>
            </thead>
            <tbody>
              {sales.length === 0 ? (
                <tr>
                  <td className="py-2 px-4 border-b text-center" colSpan="4">현재 판매 목록이 없습니다.</td>
                </tr>
              ) : (
                sales.map((sale) => (
                  <tr
                    key={sale.sell_no}
                    onClick={() => handleSaleClick(sale)}
                    className={`cursor-pointer hover:bg-gray-100 ${selectedSale && selectedSale.sell_no === sale.sell_no ? 'bg-blue-100' : ''}`}
                  >
                    <td className="py-2 px-4 border-b text-center">{sale.sell_no}</td>
                    <td className="py-2 px-4 border-b text-center">{sale.pay_amt ? sale.pay_amt.toLocaleString() : 'N/A'} 원</td>
                    <td className="py-2 px-4 border-b text-center">{sale.sell_date ? new Date(sale.sell_date).toLocaleDateString() : 'N/A'}</td>
                    <td className="py-2 px-4 border-b text-center">{sale.pay_method === '0' ? '현금' : '카드'}</td>
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

export default SalesTable;
