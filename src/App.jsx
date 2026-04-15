import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import SmartScan from './components/SmartScan';
import VisitorLogs from './components/VisitorLogs';
import GuardView from './components/GuardView';
import Header from './components/Header';
import SystemConfig from './components/SystemConfig';
import { SecurityProvider } from './context/SecurityContext';

const MainAppLayout = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'scan': return <SmartScan setActiveTab={setActiveTab} />;
      case 'logs': return <VisitorLogs />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-bg-dark text-white overflow-hidden font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto custom-scrollbar p-10">
          <div className="max-w-[1600px] mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <SecurityProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/guard" element={<GuardView />} />
          <Route path="/config" element={<SystemConfig />} />
          <Route path="/*" element={<MainAppLayout />} />
        </Routes>
      </BrowserRouter>
    </SecurityProvider>
  );
};

export default App;
