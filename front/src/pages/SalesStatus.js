import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import NotificationModal from '../components/NotificationModal'; 
import CashRegisterModal from '../components/CashRegisterModal';

const SalesStatus = () => {
  const [salesData, setSalesData] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [cashRegisterModalIsOpen, setCashRegisterModalIsOpen] = useState(false);

  const fetchSalesData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://127.0.0.1:5000/sales/status', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSalesData(response.data);
    } catch (error) {
      console.error('Failed to fetch sales data:', error);
    }
  };

  useEffect(() => {
    fetchSalesData();
  }, []);

  const handleDailySettlement = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://127.0.0.1:5000/sales/daily-settlement', {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 200 || response.status === 201) {
        setModalMessage(response.data.msg);
        setModalIsOpen(true);
        fetchSalesData();
      } else if (response.status === 400) {
        setModalMessage(response.data.msg);
        setModalIsOpen(true);
      }
    } catch (error) {
      console.error('Failed to perform daily settlement:', error);
      if (error.response && error.response.data && error.response.data.msg) {
        setModalMessage(error.response.data.msg);
      } else {
        setModalMessage('일일 정산에 실패했습니다.');
      }
      setModalIsOpen(true);
    }
  };

  const handleCashRegisterOpen = () => {
    setCashRegisterModalIsOpen(true);
  };

  const filterSalesByMonth = (sales, month) => {
    const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
    const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    return sales.filter(
      (sale) => new Date(sale.sales_date) >= monthStart && new Date(sale.sales_date) <= monthEnd
    );
  };

  const filteredSales = salesData ? filterSalesByMonth(salesData.sales, selectedMonth) : [];

  if (!salesData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex justify-center w-screen h-screen bg-gray-100 p-4">
      <div className="flex w-full">
        <div className="bg-white rounded-lg shadow-md p-6 w-4/5 mr-4 flex flex-col">
          <div className="mb-2">
            <h2 className="text-2xl font-semibold mb-4">지점 정보</h2>
            <table className="min-w-full bg-white mb-4">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">지점명</th>
                  <th className="py-2 px-4 border-b">지점 코드</th>
                  <th className="py-2 px-4 border-b">지점장 이름</th>
                  <th className="py-2 px-4 border-b">지불 비율</th>
                </tr>
              </thead>
              <tbody className="text-center">
                <tr>
                  <td className="py-2 px-4 border-b">{salesData.branch_nm}</td>
                  <td className="py-2 px-4 border-b">{salesData.branch_code}</td>
                  <td className="py-2 px-4 border-b">{salesData.manager_nm}</td>
                  <td className="py-2 px-4 border-b">{salesData.payment_ratio}%</td>
                </tr>
              </tbody>
            </table>
          </div>
          <h2 className="text-2xl font-semibold mb-4 text-right">매출 목록</h2>
          <div className="flex justify-end items-center mb-4">
            <DatePicker
              selected={selectedMonth}
              onChange={(date) => setSelectedMonth(date)}
              dateFormat="yyyy-MM"
              showMonthYearPicker
              className="border p-2 rounded"
            />
          </div>
          <div className="mb-6 flex-1 overflow-y-auto">
            <table className="min-w-full bg-white text-center">
              <thead>
                <tr>
                  <th className="py-2 px-4 w-1/8 border-b">매출 번호</th>
                  <th className="py-2 px-4 w-3/8 border-b">매출 날짜</th>
                  <th className="py-2 px-4 w-2/8 border-b">매출 금액</th>
                  <th className="py-2 px-4 w-2/8 border-b">판매 마진</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.length > 0 ? (
                  filteredSales.map((sale) => (
                    <tr key={sale.sales_no}>
                      <td className="py-2 px-4 border-b">{sale.sales_no}</td>
                      <td className="py-2 px-4 border-b">{new Date(sale.sales_date).toLocaleDateString()}</td>
                      <td className="py-2 px-4 border-b">{sale.sales_amt.toLocaleString()} 원</td>
                      <td className="py-2 px-4 border-b">{sale.sell_margin.toLocaleString()} 원</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-4 text-center text-gray-500">
                      매출 기록이 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="h-24"></div> {/* 여백 추가 */}
          </div>
        </div>
        <div className="flex flex-col w-1/4">
          <button
            className="py-16 px-4 mb-4 bg-blue-500 text-white text-xl rounded-lg hover:bg-blue-600 w-full"
            onClick={handleDailySettlement}
          >
            일일 정산
          </button>
          <button
            className="py-16 px-4 bg-green-500 text-white text-xl rounded-lg hover:bg-green-600 w-full"
            onClick={handleCashRegisterOpen}
          >
            현금 시제 등록
          </button>
        </div>
      </div>

      <NotificationModal
        isVisible={modalIsOpen}
        onClose={() => setModalIsOpen(false)}
        message={modalMessage}
      />
      <CashRegisterModal
        isVisible={cashRegisterModalIsOpen}
        onClose={() => setCashRegisterModalIsOpen(false)}
      />
    </div>
  );
};

export default SalesStatus;
