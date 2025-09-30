// components/ImageWithAuth.tsx
'use client';

import React, { useState, useEffect } from 'react';

interface ImageWithAuthProps {
  src?: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  fallbackIcon?: string;
}

const ImageWithAuth: React.FC<ImageWithAuthProps> = ({ 
  src, 
  alt, 
  className, 
  style, 
  onClick,
  fallbackIcon = 'bi-image'
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [finalSrc, setFinalSrc] = useState<string | undefined>(src);

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    
    if (src) {
      // Nếu src cần authentication, thêm token
      const token = sessionStorage.getItem('accessToken');
      if (token && src.includes('/api/upload/') && !src.includes('token=')) {
        const separator = src.includes('?') ? '&' : '?';
        setFinalSrc(`${src}${separator}token=${encodeURIComponent(token)}`);
      } else {
        setFinalSrc(src);
      }
    } else {
      setFinalSrc(undefined);
    }
  }, [src]);

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleImageError = (error: any) => {
    setIsLoading(false);
    setHasError(true);
    
    // Thử fallback: fetch với authorization header
    if (finalSrc && finalSrc.includes('/api/upload/')) {
      tryFetchWithAuth(finalSrc);
    }
  };

  const tryFetchWithAuth = async (url: string) => {
    try {
      const token = sessionStorage.getItem('accessToken');
      if (!token) return;

      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        setFinalSrc(objectUrl);
        setHasError(false);
      } else {
      }
    } catch (error) {
    }
  };

  if (!finalSrc || hasError) {
    return (
      <div 
        className={`${className} d-flex align-items-center justify-content-center bg-light border`} 
        style={{...style, cursor: onClick ? 'pointer' : 'default'}}
        onClick={onClick}
      >
        <div className="text-center">
          <i className={`bi ${fallbackIcon} text-muted d-block mb-1`} style={{fontSize: '1.5rem'}}></i>
          <small className="text-muted">Không có ảnh</small>
        </div>
      </div>
    );
  }

  return (
    <div className="position-relative">
      {isLoading && (
        <div 
          className={`${className} d-flex align-items-center justify-content-center bg-light border position-absolute top-0 start-0`} 
          style={style}
        >
          <div className="spinner-border spinner-border-sm text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
        </div>
      )}
      <img
        src={finalSrc}
        alt={alt}
        className={className}
        style={{...style, cursor: onClick ? 'pointer' : 'default'}}
        onLoad={handleImageLoad}
        onError={handleImageError}
        onClick={onClick}
        loading="lazy"
      />
    </div>
  );
};

export default ImageWithAuth;