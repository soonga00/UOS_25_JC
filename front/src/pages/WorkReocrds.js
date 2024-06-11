import React, { useState, useEffect } from 'react';
import axios from 'axios';
import WorkRecordTable from '../components/WorkRecordTable';
import EmployeeFilter from '../components/EmployeeFilter';

const WorkRecords = () => {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://127.0.0.1:5000/work/records', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setRecords(response.data);
        setFilteredRecords(response.data);
      } catch (error) {
        console.error('Failed to fetch work records:', error);
      }
    };

    fetchRecords();
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      setFilteredRecords(records.filter(record => record.name === selectedEmployee));
    } else {
      setFilteredRecords(records);
    }
  }, [selectedEmployee, records]);

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
      <h1 className="text-3xl font-bold text-center text-uosBlue">근무 기록</h1>

        <EmployeeFilter records={records} selectedEmployee={selectedEmployee} setSelectedEmployee={setSelectedEmployee} />
      </div>
      <div className="bg-white shadow-md rounded-lg p-4 h-full">
        <WorkRecordTable records={filteredRecords} />
      </div>
    </div>
  );
};

export default WorkRecords;
