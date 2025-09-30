'use client';

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div>
      {/* Modern Navigation */}
      <nav className="navbar navbar-expand-lg shadow-sm mb-4" 
           style={{ 
             background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
             borderRadius: '15px'
           }}>
        <div className="container-fluid px-4">
          <Link href="/" className="navbar-brand text-white d-flex align-items-center">
            <div className="rounded p-2 me-3 shadow-sm">
              <Image
                src="/PioneDream.png"
                alt="VPioneDream Logo"
                width={150}
                height={70}
                className="d-block"
              />
            </div>
          </Link>
          
          <div className="navbar-nav ms-auto">
            <div className="nav-item dropdown position-relative">
              <button 
                className="btn btn-outline-light border-2 dropdown-toggle fw-semibold"
                type="button" 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                style={{
                  borderRadius: '25px',
                  padding: '8px 20px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <i className="bi bi-person-circle me-2"></i>
                {user?.userName}
              </button>
              
              {isDropdownOpen && (
                <div 
                  className="position-absolute bg-white rounded-3 shadow-lg border-0"
                  style={{ 
                    top: '110%', 
                    right: 0, 
                    minWidth: '200px',
                    zIndex: 1000,
                    animation: 'slideDown 0.3s ease'
                  }}
                >
                  <div className="p-3 border-bottom bg-light rounded-top-3">
                    <small className="text-muted d-block">Đăng nhập với tư cách</small>
                    <strong className="text-dark">{user?.userName}</strong>
                  </div>
                  <button 
                    className="w-100 btn btn-link text-danger text-start px-3 py-3 border-0 rounded-bottom-3"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      logout();
                    }}
                    style={{ 
                      textDecoration: 'none',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <i className="bi bi-box-arrow-right me-2"></i>
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Modern Welcome Section */}
      <div className="position-relative mb-5 overflow-hidden"
           style={{
             background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
             borderRadius: '20px',
             padding: '3rem 2rem'
           }}>
        {/* Background Pattern */}
        <div className="position-absolute top-0 start-0 w-100 h-100"
             style={{
               background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
               opacity: 0.3
             }}>
        </div>
        
        <div className="position-relative text-white text-center">
          <div className="mb-3">
            <span className="badge bg-light text-primary px-3 py-2 rounded-pill fs-6 fw-normal">
              <i className="bi bi-wave me-2"></i>
              Xin chào, <strong>{user?.userName}</strong>!
            </span>
          </div>
          
          <h1 className="display-4 fw-bold mb-3"
              style={{
                background: 'linear-gradient(45deg, #ffffff, #f8f9ff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}>
            Chào mừng đến với Track5 eKyc
          </h1>
          
          <p className="lead mb-4 opacity-90" style={{ fontSize: '1.2rem' }}>
            <i className="bi bi-shield-check me-2"></i>
            Hệ thống quản lý xác thực danh tính KYC hiện đại và bảo mật
          </p>
          
          <div className="d-flex justify-content-center gap-3 flex-wrap ">
            <div className="badge bg-white bg-opacity-20 px-3 py-2 rounded-pill text-black">
              <i className="bi bi-check-circle me-1"></i>
              Bảo mật cao
            </div>
            <div className="badge bg-white bg-opacity-20 px-3 py-2 rounded-pill text-black">
              <i className="bi bi-lightning me-1"></i>
              Xử lý nhanh
            </div>
            <div className="badge bg-white bg-opacity-20 px-3 py-2 rounded-pill text-black">
              <i className="bi bi-people me-1"></i>
              Dễ sử dụng
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .dropdown-toggle::after {
          display: none !important;
        }
      `}</style>
    </div>
  );
}