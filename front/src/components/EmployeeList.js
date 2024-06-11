import React from 'react';

const EmployeeList = ({ employees, selectedEmployee, setSelectedEmployee }) => {
  const selectEmployee = (employee) => {
    if (selectedEmployee === employee) {
      setSelectedEmployee(null);
    } else {
      setSelectedEmployee(employee);
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">직원 목록</h2>
      <ul className="space-y-4">
        {employees.map(employee => (
          <li
            key={employee.emp_no}
            className={`p-4 bg-gray-50 shadow rounded-lg flex justify-between items-center cursor-pointer hover:bg-gray-100 ${
              selectedEmployee && selectedEmployee.emp_no === employee.emp_no ? 'bg-gray-300 border-l-8 border-blue-500' : ''
            }`}
            onClick={() => selectEmployee(employee)}
          >
            <span className="font-medium text-gray-800">{employee.nm} ({employee.rank})</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EmployeeList;
