// components/Layout/AuthLayout.tsx
import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
  backgroundImage?: string;
  backgroundColor?: string;
}

export default function AuthLayout({ 
  children, 
  backgroundImage,
  backgroundColor = 'bg-light'
}: AuthLayoutProps) {
  const backgroundStyle = backgroundImage 
    ? {
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }
    : {};

  return (
    <div 
      className={`min-vh-100 d-flex align-items-center justify-content-center ${!backgroundImage ? backgroundColor : ''}`}
      style={backgroundStyle}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-8 col-md-6 col-lg-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}