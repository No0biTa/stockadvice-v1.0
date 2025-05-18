import React from 'react';
import '../styles/Loader.css';

const Loader = () => {
  return (
    <div className="loader-container">
      <div className="modern-loader">
        <svg className="chart-loader" viewBox="0 0 100 25" preserveAspectRatio="none">
          <polyline className="chart-line" points="0,15 10,10 20,20 30,5 40,15 50,10 60,20 70,8 80,15 90,5 100,15" />
        </svg>
        <div className="pulse-dot"></div>
        <p className="loading-text">Loading data</p>
      </div>
    </div>
  );
};

export default Loader;