import React from "react";
import "../index.css"; 

const LoadingPage: React.FC = () => {
  return (
    <div className="loading-overlay">
      <img src="/assets/aze.png" alt="Loading..." className="robot-spin" />
    </div>
  );
};

export default LoadingPage;
