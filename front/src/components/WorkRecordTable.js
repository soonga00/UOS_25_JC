import React from 'react';

const WorkRecordTable = ({ records }) => {
  return (
    <div className="overflow-x-auto max-h-[80vh]">
      <table className="min-w-full bg-white border border-gray-200 text-center h-100">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-4 px-6 border-b font-medium text-gray-800">직원명</th>
            <th className="py-4 px-6 border-b font-medium text-gray-800">근무 시작</th>
            <th className="py-4 px-6 border-b font-medium text-gray-800">근무 종료</th>
            <th className="py-4 px-6 border-b font-medium text-gray-800">시급</th>
          </tr>
        </thead>
        <tbody className="block overflow-y-auto max-h-[60vh]">
          {records.map((record, index) => (
            <tr key={index} className="hover:bg-gray-50 flex w-full">
              <td className="py-4 px-6 border-b text-gray-700 w-1/4">{record.name}</td>
              <td className="py-4 px-6 border-b text-gray-700 w-1/4">{record.work_start_date}</td>
              <td className="py-4 px-6 border-b text-gray-700 w-1/4">{record.work_end_date || '근무 중'}</td>
              <td className="py-4 px-6 border-b text-gray-700 w-1/4">{record.wage}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <style jsx>{`
        thead, tbody tr {
          display: table;
          width: 100%;
          table-layout: fixed;
        }
        tbody {
          display: block;
          overflow-y: auto;
        }
      `}</style>
    </div>
  );
};

export default WorkRecordTable;
