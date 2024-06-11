import React from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Main from './pages/Main';
import Attendance from './pages/Attendance';
import Order from './pages/Order';
import Header from './components/Header';
import './App.css';
import OrderList from './pages/OrderList';
import SalesPage from './pages/SalesPage';
import WorkRecords from './pages/WorkReocrds';
import EmployeeManagementPage from './pages/EmployeeManagementPage';
import SalesStatus from './pages/SalesStatus';
import ChargeStatus from './pages/ChargeStatus';
import SalesList from './pages/SalesList';
import Stock from './pages/Stock';


const App = () => {
  return (
    <div className="app-container">
      <ConditionalHeader />
      <div className="content bg-gray-100 min-h-screen flex items-start justify-center">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/main" element={<Main />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path='/order' element={<Order />} />
          <Route path='/order-list' element={<OrderList />} />
          <Route path='/sell' element={<SalesPage />} />
          <Route path='/work-records' element={<WorkRecords />} />
          <Route path='/employee-management' element={<EmployeeManagementPage />}/>
          <Route path='/sale' element={<SalesStatus />} />
          <Route path='/charge' element={<ChargeStatus />} />
          <Route path='/sell-list' element={<SalesList />} />
          <Route path='/stock' element={<Stock />} />
          {/* 다른 Route 설정 필요 */}
        </Routes>
      </div>
    </div>
  );
}

const ConditionalHeader = () => {
  const location = useLocation();
  const hideHeaderPaths = ["/"];

  return !hideHeaderPaths.includes(location.pathname) ? <Header /> : null;
}

export default App;
