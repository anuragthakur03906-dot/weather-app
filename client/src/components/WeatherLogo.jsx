import React from 'react';
import logo from '/logo.png';

const WeatherLogo = ({ 
  size = 'large', 
  animation = 'pulse', 
  clickable = true,
  onClick 
}) => {
  // Size classes
  const sizeClasses = {
    small: 'w-12 h-12',
    medium: 'w-16 h-16',
    large: 'w-20 h-20',
    xlarge: 'w-28 h-28'
  };
  
  // Animation classes
  const animationClasses = {
    pulse: 'logo-pulse',
    float: 'logo-float',
    bounce: 'logo-bounce',
    spin: 'logo-spin-hover',
    glow: 'logo-glow',
    rotating: 'logo-rotating-border',
    none: ''
  };
  
  return (
    <div className={`logo-container ${clickable ? 'cursor-pointer' : ''}`}>
      <img 
        src={logo} 
        alt="Weather App Logo" 
        className={`
          ${sizeClasses[size]} 
          mx-auto mb-3 
          rounded-full 
          shadow-lg 
          transition-all 
          duration-300
          ${animationClasses[animation]}
          ${clickable ? 'logo-hover' : ''}
        `}
        onClick={clickable ? onClick : undefined}
      />
    </div>
  );
};

export default WeatherLogo;