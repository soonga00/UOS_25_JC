import React, { useState } from 'react';
import { useNavigate } from 'react-router';

const Attendance = () => {
    const [employeeId, setEmployeeId] = useState('');
    const navigate = useNavigate();

    const handleAttendance = () => {
        alert(`출퇴근 등록: ${employeeId}`);
        setEmployeeId('');
        navigate('/main');
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-5 rounded-lg shadow-lg max-w-sm w-full">
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
                <button onClick={handleAttendance} className="w-full bg-teal-500 text-white py-2 rounded hover:bg-teal-600">OK</button>
            </div>
        </div>
    );
};

export default Attendance;
