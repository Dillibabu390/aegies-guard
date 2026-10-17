import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import MobileAppSimulator from './components/MobileAppSimulator';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/consumer" element={<MobileAppSimulator isOpen={true} onClose={() => window.location.href = '/'} onTransactionSubmit={() => {}} />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
