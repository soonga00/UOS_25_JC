import React from 'react';

const EmployeeFilter = ({ records, selectedEmployee, setSelectedEmployee }) => {
  const uniqueEmployees = Array.from(new Set(records.map(record => record.name)));

  return (
    <div className="flex flex-col items-center mb-4">
      <label htmlFor="employee-select" className="block text-gray-700 mb-2">직원 선택</label>
      <select
        id="employee-select"
        value={selectedEmployee}
        onChange={(e) => setSelectedEmployee(e.target.value)}
        className="w-full max-w-xs p-2 border border-gray-300 rounded"
      >
        <option value="">모든 직원</option>
        {uniqueEmployees.map((employee, index) => (
          <option key={index} value={employee}>
            {employee}
          </option>
        ))}
      </select>
    </div>
  );
};

export default EmployeeFilter;
