import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import Modal from '../components/Modal';

const Main = () => {
    const [isModalVisible, setModalVisible] = useState(false);
    const navigate = useNavigate();
    const [employeeId, setEmployeeId] = useState('');

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
      const handleAttendance = (type) => {
        alert(`${type} 등록: ${employeeId}`);
        setEmployeeId('');
        setModalVisible(false);
      };


    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100 pb-14">
            <div className="grid grid-cols-2 gap-30 md:grid-cols-4 md:gap-10 mb-220">
                <button onClick={() => handleNavigation('/order-list')} className="flex items-center justify-center h-40 w-60 bg-uosBlue text-white rounded-lg text-xl cursor-pointer transition-colors hover:bg-uosBlueSoft">발주신청</button>
                <button onClick={() => handleNavigation('/return')} className="flex items-center justify-center h-40 w-60 bg-uosBlue text-white rounded-lg text-xl cursor-pointer transition-colors hover:bg-uosBlueSoft">반품등록</button>
                <button onClick={() => handleNavigation('/sell')} className="flex items-center justify-center h-40 w-60 bg-uosBlue text-white rounded-lg text-xl cursor-pointer transition-colors hover:bg-uosBlueSoft">판매</button>
                <button onClick={() => handleNavigation('/sales-status')} className="flex items-center justify-center h-40 w-60 bg-uosBlue text-white rounded-lg text-xl cursor-pointer transition-colors hover:bg-uosBlueSoft">매출 현황</button>
                <button onClick={() => handleNavigation('/employee-management')} className="flex items-center justify-center h-40 w-60 bg-uosBlue text-white rounded-lg text-xl cursor-pointer transition-colors hover:bg-uosBlueSoft">직원 관리</button>
                <button onClick={() => handleNavigation('/expenses')} className="flex items-center justify-center h-40 w-60 bg-uosBlue text-white rounded-lg text-xl cursor-pointer transition-colors hover:bg-uosBlueSoft">지출</button>
                <button onClick={() => handleNavigation('/attendance')} className="flex items-center justify-center h-40 w-60 bg-uosBlue text-white rounded-lg text-xl cursor-pointer transition-colors hover:bg-uosBlueSoft">출퇴근 등록</button>
                <button onClick={() => handleNavigation('/work-records')} className="flex items-center justify-center h-40 w-60 bg-uosBlue text-white rounded-lg text-xl cursor-pointer transition-colors hover:bg-uosBlueSoft">근무 기록</button>
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
                <div className="flex justify-between">
                <button onClick={() => handleAttendance('출근')} className="w-1/2 mr-2 bg-teal-500 text-white py-2 rounded hover:bg-teal-600">출근</button>
                <button onClick={() => handleAttendance('퇴근')} className="w-1/2 ml-2 bg-teal-500 text-white py-2 rounded hover:bg-teal-600">퇴근</button>
                </div>
            </Modal>
        </div>
    );
};

export default Main;
