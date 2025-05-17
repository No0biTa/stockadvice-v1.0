import React from 'react';
import '../App.css';

const StockPage = ({ children }) => {
  return (
    <div className="stock-page">
      {children}
    </div>
  );
};

export default StockPage;