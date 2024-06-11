import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Modal from '../components/Modal';
import NotificationModal from '../components/NotificationModal';
import InputModal from '../components/InputModal';

const ChargeStatus = () => {
  const [chargeData, setChargeData] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInputModalOpen, setIsInputModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const fetchChargeData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://127.0.0.1:5000/charge/status', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setChargeData(response.data);
    } catch (error) {
      console.error('Failed to fetch charge data:', error);
    }
  };

  useEffect(() => {
    fetchChargeData();
  }, []);

  const filterChargesByMonth = (charges, month) => {
    const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
    const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    return charges.filter(
      (charge) => new Date(charge.charge_date) >= monthStart && new Date(charge.charge_date) <= monthEnd
    );
  };

  const getChargeTypeName = (type) => {
    switch (type) {
      case '0': return '인건비';
      case '1': return '유지비';
      case '2': return '로열티';
      case '3': return '판매대금';
      default: return '기타';
    }
  };

  const filteredCharges = chargeData ? filterChargesByMonth(chargeData.charges, selectedMonth) : [];

  const handleLaborCost = useCallback(async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get('http://127.0.0.1:5000/charge/labor_cost', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
      setNotificationMessage(response.data.msg);
      setIsNotificationOpen(true);
      fetchChargeData();
      }
    } catch (error) {
      console.error('Failed to charge labor cost:', error);
      if (error.response && error.response.data && error.response.data.msg) {
        setNotificationMessage(error.response.data.msg);
      } else {
        setNotificationMessage("인건비 지출 실패했습니다.");
      }
      setIsNotificationOpen(true);
    }
  }, []);

  const handleMaintenanceCost = useCallback(async (cost) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post('http://127.0.0.1:5000/charge/maintenance', {
        cost: parseInt(cost),
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.status === 200 || response.status === 400) {
        setNotificationMessage(response.data.msg);
        setIsNotificationOpen(true);
      }
    } catch (error) {
      console.error('Failed to charge maintenance cost:', error);
      if (error.response && error.response.data && error.response.data.msg) {
        setNotificationMessage(error.response.data.msg);
      } else {
        setNotificationMessage("유지비 지출 실패했습니다.");
      }
      setIsNotificationOpen(true);
    }
  }, []);

  const handleRoyalty = useCallback(async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get('http://127.0.0.1:5000/charge/royalty', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        setNotificationMessage(response.data.msg);
        setIsNotificationOpen(true);
        fetchChargeData();
        }
    } catch (error) {
      console.error('Failed to charge royalty:', error);
      if (error.response && error.response.data && error.response.data.msg) {
        setNotificationMessage(error.response.data.msg);
      } else {
        setNotificationMessage("로열티 지출 실패했습니다.");
      }
      setIsNotificationOpen(true);
    }
  }, []);

  const handleSale = useCallback(async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get('http://127.0.0.1:5000/charge/order', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        setNotificationMessage(response.data.msg);
        setIsNotificationOpen(true);
        fetchChargeData();
        }
    } catch (error) {
      console.error('Failed to charge sale:', error);
      if (error.response && error.response.data && error.response.data.msg) {
        setNotificationMessage(error.response.data.msg);
      } else {
        setNotificationMessage("판매대금 지출 실패했습니다.");
      }
      setIsNotificationOpen(true);
    }
  }, []);

  const handleButtonClick = (type) => {
    if (type === '유지비') {
      setIsInputModalOpen(true);
    } else {
      setModalContent(type);
      setIsModalOpen(true);
    }
  };

  const handleModalConfirm = () => {
    setIsModalOpen(false);
    if (modalContent === '인건비') {
      handleLaborCost();
    } else if (modalContent === '로열티') {
      handleRoyalty();
    } else if (modalContent === '판매대금') {
      handleSale();
    }
  };

  const handleInputModalConfirm = (value) => {
    setIsInputModalOpen(false);
    handleMaintenanceCost(value);
  };

  if (!chargeData) {
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
              <tbody className='text-center'>
                <tr>
                  <td className="py-2 px-4 border-b">{chargeData.branch_nm}</td>
                  <td className="py-2 px-4 border-b">{chargeData.branch_code}</td>
                  <td className="py-2 px-4 border-b">{chargeData.manager_nm}</td>
                  <td className="py-2 px-4 border-b">{chargeData.payment_ratio}%</td>
                </tr>
              </tbody>
            </table>
          </div>
          <h2 className="text-2xl font-semibold mb-4 text-right">지출 목록</h2>
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
                  <th className="py-2 px-4 w-1/8 border-b">지출 번호</th>
                  <th className="py-2 px-4 w-3/8 border-b">지출 날짜</th>
                  <th className="py-2 px-4 w-2/8 border-b">지출 금액</th>
                  <th className="py-2 px-4 w-2/8 border-b">지출 항목</th>
                </tr>
              </thead>
              <tbody>
                {filteredCharges.length > 0 ? (
                  filteredCharges.map((charge) => (
                    <tr key={charge.charge_no}>
                      <td className="py-2 px-4 border-b">{charge.charge_no}</td>
                      <td className="py-2 px-4 border-b">{new Date(charge.charge_date).toLocaleDateString()}</td>
                      <td className="py-2 px-4 border-b">{charge.charge_amt.toLocaleString()} 원</td>
                      <td className="py-2 px-4 border-b">{getChargeTypeName(charge.charge_type)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-4 text-center text-gray-500">
                      지출 기록이 없습니다.
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
            onClick={() => handleButtonClick('인건비')}
            className="mt-4 py-14 px-4 mb-4 bg-yellow-500 text-white text-xl rounded-lg hover:bg-yellow-600 w-full"
          >
            인건비
          </button>
          <button
            onClick={() => handleButtonClick('유지비')}
            className="py-14 px-4 mb-4 bg-blue-500 text-white text-xl rounded-lg hover:bg-blue-600 w-full"
          >
            유지비
          </button>
          <button
            onClick={() => handleButtonClick('판매대금')}
            className="py-14 px-4 mb-4 bg-green-500 text-white text-xl rounded-lg hover:bg-green-600 w-full"
          >
            판매대금
          </button>
          <button
            onClick={() => handleButtonClick('로열티')}
            className="py-14 px-4 bg-red-500 text-white text-xl rounded-lg hover:bg-red-600 w-full"
          >
            로열티
          </button>
        </div>
      </div>
      <Modal isVisible={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div>
          <h2 className="text-xl font-bold mb-4">{modalContent+'지출'}</h2>
          <p>{modalContent+' 지출하시겠습니까?'}</p>
        </div>
        <div className="flex justify-center mt-4">
          <button
            onClick={handleModalConfirm}
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 mr-2"
          >
            확인
          </button>
          <button
            onClick={() => setIsModalOpen(false)}
            className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
          >
            취소
          </button>
        </div>
      </Modal>
      <InputModal
        isVisible={isInputModalOpen}
        onClose={() => setIsInputModalOpen(false)}
        onConfirm={handleInputModalConfirm}
      />
      <NotificationModal
        isVisible={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        message={notificationMessage}
      />
    </div>
  );
};

export default ChargeStatus;
