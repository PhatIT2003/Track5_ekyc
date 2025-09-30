// app/page.tsx
'use client';

import React from 'react';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import Link from 'next/link';
import Header from './components/header';

export default function Home() {
  return (
    <ProtectedRoute>
      <div className="container mt-4">
        <div className="row">
          <div className="col-12">
            {/* Header */}
            <Header/>
            
            {/* Features Grid */}
            <div className="row mb-5">
              <div className="col-12 mb-4 text-center">
                <h2 className="fw-bold mb-3" style={{ color: '#2d3748' }}>
                  <i className="bi bi-stars me-3 text-primary "></i>
                  Tính năng chính
                </h2>
                <p className="text-muted fs-5">Khám phá những gì bạn có thể làm với hệ thống KYC của chúng tôi</p>
              </div>

              <div className="col-md-6 mb-5">
                <div className="card h-100 border-0 shadow-lg position-relative overflow-hidden"
                     style={{
                       borderRadius: '20px',
                       transition: 'all 0.3s ease',
                       background: 'linear-gradient(135deg,rgb(234, 102, 179) 0%,rgb(134, 75, 162) 100%)'
                     }}
                     onMouseEnter={(e) => {
                       e.currentTarget.style.transform = 'translateY(-8px)';
                       e.currentTarget.style.boxShadow = '0 20px 40px rgba(102, 126, 234, 0.3)';
                     }}
                     onMouseLeave={(e) => {
                       e.currentTarget.style.transform = 'translateY(0)';
                       e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
                     }}>
                  
                  {/* Background Pattern */}
                  <div className="position-absolute top-0 start-0 w-100 h-100"
                       style={{
                         background: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E")`,
                         opacity: 0.3
                       }}>
                  </div>
                  
                  <div className="card-body text-center p-4 position-relative">
                    <div className="bg-white rounded-circle d-inline-flex align-items-center justify-content-center mb-4 shadow-sm"
                         style={{ width: '80px', height: '80px' }}>
                      <i className="bi bi-building text-primary" style={{ fontSize: '2.5rem' }}></i>
                    </div>
                    <h5 className="card-title text-white fw-bold mb-3">Hồ Sơ Doanh Nghiệp</h5>
                    <p className="card-text text-white opacity-90 mb-4">
                      Quản lý và theo dõi các hoạt động KYC của doanh nghiệp một cách hiệu quả và chuyên nghiệp.
                    </p>
                    <Link href="/Business" 
                          className="btn btn-light btn-lg px-4 fw-semibold"
                          style={{ 
                            borderRadius: '25px',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.05)';
                            e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}>
                      <i className="bi bi-arrow-right-circle me-2"></i>
                      Xem danh sách KYC
                    </Link>
                  </div>
                </div>
              </div>

              <div className="col-md-6 mb-5">
                <div className="card h-100 border-0 shadow-lg position-relative overflow-hidden"
                     style={{
                       borderRadius: '20px',
                       transition: 'all 0.3s ease',
                       background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
                     }}
                     onMouseEnter={(e) => {
                       e.currentTarget.style.transform = 'translateY(-8px)';
                       e.currentTarget.style.boxShadow = '0 20px 40px rgba(17, 153, 142, 0.3)';
                     }}
                     onMouseLeave={(e) => {
                       e.currentTarget.style.transform = 'translateY(0)';
                       e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
                     }}>
                  
                  {/* Background Pattern */}
                  <div className="position-absolute top-0 start-0 w-100 h-100"
                       style={{
                         background: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E")`,
                         opacity: 0.3
                       }}>
                  </div>
                  
                  <div className="card-body text-center p-4 position-relative">
                    <div className="bg-white rounded-circle d-inline-flex align-items-center justify-content-center mb-4 shadow-sm"
                         style={{ width: '80px', height: '80px' }}>
                      <i className="bi bi-person-heart text-success" style={{ fontSize: '2.5rem' }}></i>
                    </div>
                    <h5 className="card-title text-white fw-bold mb-3">Hồ Sơ Cá Nhân</h5>
                    <p className="card-text text-white opacity-90 mb-4">
                      Quản lý và theo dõi các hoạt động KYC của cá nhân một cách hiệu quả và an toàn.
                    </p>
                    <Link href="/Individual" 
                          className="btn btn-light btn-lg px-4 fw-semibold"
                          style={{ 
                            borderRadius: '25px',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.05)';
                            e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}>
                      <i className="bi bi-arrow-right-circle me-2"></i>
                      Xem danh sách KYC
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Quick Stats */}
         
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}