import React, { useEffect, useState } from 'react';
import axios from 'axios'; // axios를 임포트 해야합니다.
import EmployeeList from '../components/EmployeeList';
import EmployeeModal from '../components/EmployeeModal';
import ConfirmModal from '../components/ConfirmModal';
import { useNavigate } from 'react-router-dom';

const EmployeeManagementPage = () => {
  const [employees, setEmployees] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [modalType, setModalType] = useState(''); // 'add' or 'edit' or 'delete'
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const navigate = useNavigate();

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://127.0.0.1:5000/emp/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setEmployees(response.data);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []); // 빈 배열을 두 번째 인자로 넣어 컴포넌트가 마운트될 때 한 번만 실행되도록 합니다.

  const openModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const openConfirmModal = () => {
    setIsConfirmModalOpen(true);
  };

  const closeConfirmModal = () => {
    setIsConfirmModalOpen(false);
  };

  const addEmployee = async (employee) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://127.0.0.1:5000/emp/add', employee, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchEmployees(); // 새 직원 추가 후 직원 목록 갱신
      closeModal();
    } catch (error) {
      console.error('Failed to add employee:', error);
    }
  };

  const editEmployee = async (employee) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://127.0.0.1:5000/emp/${employee.emp_no}`, employee, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchEmployees(); // 직원 수정 후 직원 목록 갱신
      closeModal();
    } catch (error) {
      console.error('Failed to edit employee:', error);
    }
  };

  const deleteEmployee = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://127.0.0.1:5000/emp/${selectedEmployee.emp_no}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchEmployees(); // 직원 삭제 후 직원 목록 갱신
      setSelectedEmployee(null); // 직원 정보 초기화
      closeConfirmModal();
    } catch (error) {
      console.error('Failed to delete employee:', error);
    }
  };

  const handleWorkRecordsClick = () => {
    navigate(`/work-records`);
  };

  return (
    <div className="flex h-screen w-full">
      <div className="w-2/3 p-6 bg-white shadow-lg rounded-lg m-4">
        <EmployeeList
          employees={employees}
          selectedEmployee={selectedEmployee}
          setSelectedEmployee={setSelectedEmployee}
        />
      </div>
      <div className="w-1/3 p-6 bg-white shadow-lg rounded-lg m-4 flex flex-col justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-4">직원 정보</h2>
          {selectedEmployee ? (
            <div className="mb-6 space-y-2">
              <div className="flex">
                <p className="font-semibold w-24">이름:</p>
                <p>{selectedEmployee.nm}</p>
              </div>
              <div className="flex">
                <p className="font-semibold w-24">직위:</p>
                <p>{selectedEmployee.rank}</p>
              </div>
              <div className="flex">
                <p className="font-semibold w-24">입사일:</p>
                <p>{new Date(selectedEmployee.join_date).toLocaleDateString()}</p>
              </div>
              <div className="flex">
                <p className="font-semibold w-24">전화번호:</p>
                <p>{selectedEmployee.tel_no}</p>
              </div>
              <div className="flex">
                <p className="font-semibold w-24">주소:</p>
                <p>{selectedEmployee.addr}</p>
              </div>
              <div className="flex">
                <p className="font-semibold w-24">은행명:</p>
                <p>{selectedEmployee.bank_nm}</p>
              </div>
              <div className="flex">
                <p className="font-semibold w-24">계좌번호:</p>
                <p>{selectedEmployee.acct_no}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-600 mb-6">직원을 선택해주세요.</p>
          )}
        </div>
        <div className="space-y-4 mb-16">
          <button
            className="bg-blue-500 text-white py-4 px-4 rounded w-full hover:bg-blue-600"
            onClick={() => openModal('add')}
          >
            직원 등록
          </button>
          <button
            className="bg-green-500 text-white py-4 px-4 rounded w-full hover:bg-green-600"
            disabled={!selectedEmployee}
            onClick={() => openModal('edit')}
          >
            직원 수정
          </button>
          <button
            className="bg-red-500 text-white py-4 px-4 rounded w-full hover:bg-red-600"
            disabled={!selectedEmployee}
            onClick={openConfirmModal}
          >
            직원 삭제
          </button>
          <button
            className="bg-yellow-500 text-white py-4 px-4 rounded w-full hover:bg-yellow-600"
            onClick={handleWorkRecordsClick}
          >
            근무기록
          </button>
        </div>
      </div>
      {isModalOpen && (
        <EmployeeModal
          type={modalType}
          closeModal={closeModal}
          addEmployee={addEmployee}
          editEmployee={editEmployee}
          selectedEmployee={selectedEmployee}
        />
      )}
      {isConfirmModalOpen && (
        <ConfirmModal
          closeConfirmModal={closeConfirmModal}
          confirmAction={deleteEmployee}
        />
      )}
    </div>
  );
};

export default EmployeeManagementPage;
