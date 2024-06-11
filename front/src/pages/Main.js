import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import Modal from '../components/Modal';
import NotificationModal from '../components/NotificationModal';
import axios from 'axios';

const Main = () => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [employeeId, setEmployeeId] = useState('');
  const [lifeService, setLifeService] = useState({
    package: false,
    lottery_ticket: false,
    atm: false,
    pubprice: false,
  });
  const [notification, setNotification] = useState({ isVisible: false, message: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLifeService = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://127.0.0.1:5000/life', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log(response.data)
        setLifeService(response.data);
      } catch (error) {
        console.error('Failed to fetch life services:', error);
      }
    };

    fetchLifeService();
  }, []);

  const handleNavigation = (path) => {
    if (path === '/attendance') {
      setModalVisible(true);
    } else {
      navigate(path);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const closeNotification = () => {
    setNotification({ isVisible: false, message: '' });
  };

  const handleAttendance = async () => {
    try {
      const token = localStorage.getItem('token'); // Assuming token is stored in localStorage
      const response = await axios.post(
        'http://127.0.0.1:5000/work/',
        { emp_no: employeeId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setNotification({ isVisible: true, message: response.data.msg });
      setEmployeeId('');
      setModalVisible(false);
    } catch (error) {
      console.error('Failed to register attendance:', error);
      setNotification({ isVisible: true, message: '출퇴근 등록에 실패했습니다.' });
    }
  };

  const handleLifeService = (serviceName) => {
    const serviceMap = {
      '택배': 'package',
      '복권': 'lottery_ticket',
      'ATM': 'atm',
      '공공 요금 수납': 'pubprice'
    };

    const serviceFlag = lifeService[serviceMap[serviceName]];
    const message = serviceFlag
      ? `해당 지점은 ${serviceName} 서비스 이용 가능 지점입니다.`
      : `해당 지점은 ${serviceName} 서비스 이용 불가능 지점입니다.`;

    setNotification({ isVisible: true, message });
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 pb-14">
      <div className="grid grid-cols-2 gap-30 md:grid-cols-4 md:gap-10 mb-10">
        <button
          onClick={() => handleNavigation('/order-list')}
          className="flex items-center justify-center h-40 w-60 bg-blue-500 text-white rounded-lg text-xl cursor-pointer transition-colors hover:bg-blue-600"
        >
          발주신청
        </button>
        <button
          onClick={() => handleNavigation('/sell')}
          className="flex items-center justify-center h-40 w-60 bg-blue-500 text-white rounded-lg text-xl cursor-pointer transition-colors hover:bg-blue-600"
        >
          판매
        </button>
        <button
          onClick={() => handleNavigation('/sell-list')}
          className="flex items-center justify-center h-40 w-60 bg-blue-500 text-white rounded-lg text-xl cursor-pointer transition-colors hover:bg-blue-600"
        >
          판매 목록
        </button>
        <button
          onClick={() => handleNavigation('/stock')}
          className="flex items-center justify-center h-40 w-60 bg-blue-500 text-white rounded-lg text-xl cursor-pointer transition-colors hover:bg-blue-600"
        >
          재고
        </button>
        <button
          onClick={() => handleNavigation('/attendance')}
          className="flex items-center justify-center h-40 w-60 bg-blue-500 text-white rounded-lg text-xl cursor-pointer transition-colors hover:bg-blue-600"
        >
          출퇴근 등록
        </button>
        <button
          onClick={() => handleNavigation('/employee-management')}
          className="flex items-center justify-center h-40 w-60 bg-blue-500 text-white rounded-lg text-xl cursor-pointer transition-colors hover:bg-blue-600"
        >
          직원 관리
        </button>
        <button
          onClick={() => handleNavigation('/sale')}
          className="flex items-center justify-center h-40 w-60 bg-blue-500 text-white rounded-lg text-xl cursor-pointer transition-colors hover:bg-blue-600"
        >
          매출 현황
        </button>
        <button
          onClick={() => handleNavigation('/charge')}
          className="flex items-center justify-center h-40 w-60 bg-blue-500 text-white rounded-lg text-xl cursor-pointer transition-colors hover:bg-blue-600"
        >
          지출 현황
        </button>
        <button
          onClick={() => handleLifeService('택배')}
          className="flex items-center justify-center h-40 w-60 bg-blue-500 text-white rounded-lg text-xl cursor-pointer transition-colors hover:bg-blue-600"
        >
          택배
        </button>
        <button
          onClick={() => handleLifeService('복권')}
          className="flex items-center justify-center h-40 w-60 bg-blue-500 text-white rounded-lg text-xl cursor-pointer transition-colors hover:bg-blue-600"
        >
          복권
        </button>
        <button
          onClick={() => handleLifeService('ATM')}
          className="flex items-center justify-center h-40 w-60 bg-blue-500 text-white rounded-lg text-xl cursor-pointer transition-colors hover:bg-blue-600"
        >
          ATM
        </button>
        <button
          onClick={() => handleLifeService('공공 요금 수납')}
          className="flex items-center justify-center h-40 w-60 bg-blue-500 text-white rounded-lg text-xl cursor-pointer transition-colors hover:bg-blue-600"
        >
          공공 요금 수납
        </button>
      </div>
      <Modal isVisible={isModalVisible} onClose={closeModal}>
        <h2 className="text-center text-2xl font-bold text-uosBlue mb-6">출퇴근 등록</h2>
        <div className="mb-4">
          <label htmlFor="employeeId" className="block text-uosBlueLight mb-2">직원 아이디</label>
          <input
            type="text"
            id="employeeId"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="flex justify-center">
          <button onClick={handleAttendance} className="w-1/2 bg-teal-500 text-white py-2 rounded hover:bg-teal-600">출/퇴근</button>
        </div>
      </Modal>
      <NotificationModal
        isVisible={notification.isVisible}
        onClose={closeNotification}
        message={notification.message}
      />
    </div>
  );
};

export default Main;
